// ============================================================
// BLOG SERVICE - Business Logic Layer
// ============================================================

import { prisma } from '@/lib/prisma';
import {
  createBlogContent,
  getBlogContent,
  updateBlogContent,
  deleteBlogContent,
  saveDraft,
  getDraft,
  createVersion,
  getVersions,
  calculateWordCount,
  calculateReadingTime,
} from '@/services/mongodb/blog.service';
import {
  CreateBlogPostRequest,
  UpdateBlogPostRequest,
  BlogPostListQuery,
  BlogPostResponse,
} from '@/types/blog.types';
import { generateUniqueSlug } from './blog.utils';

// ============================================================
// Create Blog Post
// ============================================================

export async function createBlogPost(
  currentUserId: string,
  data: CreateBlogPostRequest
): Promise<BlogPostResponse> {
  // Determine if user is admin
  const user = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { isAdmin: true },
  });

  // Role-based type validation
  if (!user?.isAdmin) {
    if (data.type === 'PLATFORM' || data.type === 'ANNOUNCEMENT') {
      throw new Error('Only administrators can create platform announcements');
    }
  }

  // Validate campaign ownership if campaign_update
  if (data.type === 'CAMPAIGN_UPDATE') {
    if (!data.campaignId) {
      throw new Error('Campaign ID is required for campaign updates');
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: data.campaignId },
      select: { creatorId: true },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.creatorId !== currentUserId && !user?.isAdmin) {
      throw new Error('You can only create updates for your own campaigns');
    }
  }

  // Generate unique slug
  const slug = await generateUniqueSlug(data.title);

  // Calculate word count and reading time
  const wordCount = calculateWordCount(data.content, data.richContent);
  const readingTimeMinutes = calculateReadingTime(wordCount);

  let status = data.status || 'DRAFT';
  if (status === 'PUBLISHED' && !user?.isAdmin) {
    status = 'PENDING_REVIEW'; // Non-admin needs review
  }

  // Create metadata in PostgreSQL
  const post = await prisma.blogPost.create({
    data: {
      authorId: currentUserId,
      campaignId: data.campaignId,
      title: data.title,
      slug,
      excerpt: data.excerpt,
      coverImage: data.coverImage,
      status: status as any,
      type: data.type as any,
      visibility: data.visibility as any,
      publishedAt: status === 'PUBLISHED' ? new Date() : null,
      wordCount,
      readingTimeMinutes,
      categories: data.categoryIds
        ? {
          create: data.categoryIds.map((categoryId) => ({
            categoryId,
          })),
        }
        : undefined,
      tags: data.tags
        ? {
          create: await Promise.all(
            data.tags.map(async (tagName) => {
              const tag = await getOrCreateTag(tagName);
              return { tagId: tag.id };
            })
          ),
        }
        : undefined,
    },
    include: {
      author: {
        select: { id: true, name: true, avatar: true },
      },
      campaign: {
        select: { id: true, title: true, slug: true },
      },
      categories: {
        include: { category: true },
      },
      tags: {
        include: { tag: true },
      },
    },
  });

  // Create content in MongoDB
  try {
    const mongoContentId = await createBlogContent({
      postId: post.id,
      format: data.richContent ? 'rich_json' : 'markdown',
      content: data.content,
      richContent: data.richContent,
      wordCount,
      readingTimeMinutes,
    });

    // Update PostgreSQL with MongoDB reference
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { mongoContentId },
    });
  } catch (error) {
    // Rollback: delete PostgreSQL record if MongoDB fails
    await prisma.blogPost.delete({ where: { id: post.id } });
    throw new Error('Failed to create blog content in MongoDB');
  }

  return formatBlogPostResponse(post);
}

// ============================================================
// Get Blog Post List
// ============================================================

export async function getBlogPostList(
  query: BlogPostListQuery,
  currentUserId?: string
): Promise<{ posts: BlogPostResponse[]; total: number; page: number; limit: number }> {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {
    deletedAt: null,
    status: 'PUBLISHED',
  };

  // Filter by type
  if (query.type) {
    where.type = query.type;
  }

  // Filter by campaign
  if (query.campaignId) {
    where.campaignId = query.campaignId;
  }

  // Filter by author
  if (query.authorId) {
    where.authorId = query.authorId;
  }

  // Filter by featured
  if (query.featured) {
    where.isFeatured = true;
  }

  // Filter by category
  if (query.category) {
    where.categories = {
      some: {
        category: {
          slug: query.category,
        },
      },
    };
  }

  // Filter by tag
  if (query.tag) {
    where.tags = {
      some: {
        tag: {
          slug: query.tag,
        },
      },
    };
  }

  // Search
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { excerpt: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  // Visibility filter
  if (!currentUserId) {
    where.visibility = 'PUBLIC';
  }

  // Sort
  let orderBy: any = { publishedAt: 'desc' };
  if (query.sort === 'popular') {
    orderBy = { likeCount: 'desc' };
  } else if (query.sort === 'most_viewed') {
    orderBy = { viewCount: 'desc' };
  }

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
        campaign: {
          select: { id: true, title: true, slug: true },
        },
        categories: {
          include: { category: true },
        },
        tags: {
          include: { tag: true },
        },
      },
    }),
    prisma.blogPost.count({ where }),
  ]);

  return {
    posts: posts.map(formatBlogPostResponse),
    total,
    page,
    limit,
  };
}

// ============================================================
// Get Blog Post by Slug
// ============================================================

export async function getBlogPostBySlug(
  slug: string,
  currentUserId?: string
): Promise<BlogPostResponse | null> {
  const post = await prisma.blogPost.findUnique({
    where: { slug, deletedAt: null },
    include: {
      author: {
        select: { id: true, name: true, avatar: true },
      },
      campaign: {
        select: { id: true, title: true, slug: true },
      },
      categories: {
        include: { category: true },
      },
      tags: {
        include: { tag: true },
      },
    },
  });

  if (!post) return null;

  // Check visibility
  const canRead = await canReadPost(post, currentUserId);
  if (!canRead) {
    throw new Error('You do not have permission to read this post');
  }

  // Get content from MongoDB
  const content = await getBlogContent(post.id);

  // Increment view count
  await prisma.blogPost.update({
    where: { id: post.id },
    data: { viewCount: { increment: 1 } },
  });

  // Check if liked/bookmarked
  let isLiked = false;
  let isBookmarked = false;

  if (currentUserId) {
    const [like, bookmark] = await Promise.all([
      prisma.blogLike.findUnique({
        where: {
          postId_userId: {
            postId: post.id,
            userId: currentUserId,
          },
        },
      }),
      prisma.blogBookmark.findUnique({
        where: {
          postId_userId: {
            postId: post.id,
            userId: currentUserId,
          },
        },
      }),
    ]);

    isLiked = !!like;
    isBookmarked = !!bookmark;
  }

  return {
    ...formatBlogPostResponse(post),
    content: content?.content,
    richContent: content?.richContent,
    tableOfContents: content?.tableOfContents,
    isLiked,
    isBookmarked,
  };
}

// ============================================================
// Update Blog Post
// ============================================================

export async function updateBlogPost(
  postId: string,
  currentUserId: string,
  data: UpdateBlogPostRequest
): Promise<BlogPostResponse> {
  const post = await prisma.blogPost.findUnique({
    where: { id: postId },
    select: { authorId: true, title: true, excerpt: true },
  });

  if (!post) {
    throw new Error('Post not found');
  }

  const user = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { isAdmin: true },
  });

  if (post.authorId !== currentUserId && !user?.isAdmin) {
    throw new Error('You can only edit your own posts');
  }

  // Create version before update
  const oldContent = await getBlogContent(postId);
  if (oldContent) {
    await createVersion({
      postId,
      authorId: currentUserId,
      titleSnapshot: post.title,
      excerptSnapshot: post.excerpt || undefined,
      contentSnapshot: oldContent.content,
      richContentSnapshot: oldContent.richContent,
      changeNote: 'Update',
    });
  }

  // Calculate new word count if content changed
  let wordCount: number | undefined;
  let readingTimeMinutes: number | undefined;

  if (data.content !== undefined || data.richContent !== undefined) {
    wordCount = calculateWordCount(data.content, data.richContent);
    readingTimeMinutes = calculateReadingTime(wordCount);

    // Update MongoDB content
    await updateBlogContent(postId, {
      content: data.content,
      richContent: data.richContent,
      wordCount,
      readingTimeMinutes,
    });
  }

  // Generate new slug if title changed
  let slug: string | undefined;
  if (data.title && data.title !== post.title) {
    slug = await generateUniqueSlug(data.title);
  }

  // Update PostgreSQL metadata
  const updatedPost = await prisma.blogPost.update({
    where: { id: postId },
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt,
      coverImage: data.coverImage,
      type: data.type as any,
      visibility: data.visibility as any,
      wordCount,
      readingTimeMinutes,
      categories: data.categoryIds
        ? {
          deleteMany: {},
          create: data.categoryIds.map((categoryId) => ({
            categoryId,
          })),
        }
        : undefined,
      tags: data.tags
        ? {
          deleteMany: {},
          create: await Promise.all(
            data.tags.map(async (tagName) => {
              const tag = await getOrCreateTag(tagName);
              return { tagId: tag.id };
            })
          ),
        }
        : undefined,
    },
    include: {
      author: {
        select: { id: true, name: true, avatar: true },
      },
      campaign: {
        select: { id: true, title: true, slug: true },
      },
      categories: {
        include: { category: true },
      },
      tags: {
        include: { tag: true },
      },
    },
  });

  return formatBlogPostResponse(updatedPost);
}

// ============================================================
// Delete Blog Post
// ============================================================

export async function deleteBlogPost(postId: string, currentUserId: string): Promise<void> {
  const post = await prisma.blogPost.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });

  if (!post) {
    throw new Error('Post not found');
  }

  const user = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { isAdmin: true },
  });

  if (post.authorId !== currentUserId && !user?.isAdmin) {
    throw new Error('You can only delete your own posts');
  }

  // Soft delete in PostgreSQL
  await prisma.blogPost.update({
    where: { id: postId },
    data: { deletedAt: new Date() },
  });

  // Optionally delete from MongoDB
  // await deleteBlogContent(postId);
}

// ============================================================
// Publish Blog Post
// ============================================================

export async function publishBlogPost(postId: string, currentUserId: string): Promise<void> {
  const post = await prisma.blogPost.findUnique({
    where: { id: postId },
    select: { authorId: true, status: true },
  });

  if (!post) {
    throw new Error('Post not found');
  }

  const user = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { isAdmin: true },
  });

  // Only admin can publish, or author can publish if already approved
  if (!user?.isAdmin && post.authorId !== currentUserId) {
    throw new Error('You do not have permission to publish this post');
  }

  await prisma.blogPost.update({
    where: { id: postId },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });
}

// ============================================================
// Archive Blog Post
// ============================================================

export async function archiveBlogPost(postId: string, currentUserId: string): Promise<void> {
  const post = await prisma.blogPost.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });

  if (!post) {
    throw new Error('Post not found');
  }

  const user = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { isAdmin: true },
  });

  if (post.authorId !== currentUserId && !user?.isAdmin) {
    throw new Error('You can only archive your own posts');
  }

  await prisma.blogPost.update({
    where: { id: postId },
    data: { status: 'ARCHIVED' },
  });
}

// ============================================================
// Toggle Like
// ============================================================

export async function toggleLike(postId: string, userId: string): Promise<{ liked: boolean }> {
  const existing = await prisma.blogLike.findUnique({
    where: {
      postId_userId: {
        postId,
        userId,
      },
    },
  });

  if (existing) {
    // Unlike
    await prisma.$transaction([
      prisma.blogLike.delete({
        where: { id: existing.id },
      }),
      prisma.blogPost.update({
        where: { id: postId },
        data: { likeCount: { decrement: 1 } },
      }),
    ]);
    return { liked: false };
  } else {
    // Like
    await prisma.$transaction([
      prisma.blogLike.create({
        data: { postId, userId },
      }),
      prisma.blogPost.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
      }),
    ]);
    return { liked: true };
  }
}

// ============================================================
// Toggle Bookmark
// ============================================================

export async function toggleBookmark(postId: string, userId: string): Promise<{ bookmarked: boolean }> {
  const existing = await prisma.blogBookmark.findUnique({
    where: {
      postId_userId: {
        postId,
        userId,
      },
    },
  });

  if (existing) {
    // Remove bookmark
    await prisma.$transaction([
      prisma.blogBookmark.delete({
        where: { id: existing.id },
      }),
      prisma.blogPost.update({
        where: { id: postId },
        data: { bookmarkCount: { decrement: 1 } },
      }),
    ]);
    return { bookmarked: false };
  } else {
    // Add bookmark
    await prisma.$transaction([
      prisma.blogBookmark.create({
        data: { postId, userId },
      }),
      prisma.blogPost.update({
        where: { id: postId },
        data: { bookmarkCount: { increment: 1 } },
      }),
    ]);
    return { bookmarked: true };
  }
}

// ============================================================
// Helper Functions
// ============================================================

async function canReadPost(post: any, currentUserId?: string): Promise<boolean> {
  if (post.status !== 'PUBLISHED') {
    // Only author and admin can read unpublished posts
    if (!currentUserId) return false;

    const user = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { isAdmin: true },
    });

    if (post.authorId === currentUserId || user?.isAdmin) {
      return true;
    }
    return false;
  }

  // Check visibility
  if (post.visibility === 'PUBLIC') return true;
  if (post.visibility === 'PRIVATE' || post.visibility === 'OWNER_ONLY') {
    if (!currentUserId) return false;

    const user = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { isAdmin: true },
    });

    return post.authorId === currentUserId || (user?.isAdmin ?? false);
  }

  if (post.visibility === 'BACKERS_ONLY') {
    if (!currentUserId) return false;

    const user = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { isAdmin: true },
    });

    if (post.authorId === currentUserId || (user?.isAdmin ?? false)) {
      return true;
    }

    // Check if user is a backer of the campaign
    if (post.campaignId) {
      const pledge = await prisma.pledge.findFirst({
        where: {
          campaignId: post.campaignId,
          userId: currentUserId,
          status: 'SUCCESS',
        },
      });
      return !!pledge;
    }

    return false;
  }

  return true;
}

async function getOrCreateTag(name: string) {
  const slug = name.toLowerCase().replace(/\s+/g, '-');

  let tag = await prisma.blogTag.findUnique({
    where: { slug },
  });

  if (!tag) {
    tag = await prisma.blogTag.create({
      data: { name, slug },
    });
  }

  return tag;
}

function formatBlogPostResponse(post: any): BlogPostResponse {
  return {
    id: post.id,
    authorId: post.authorId,
    campaignId: post.campaignId,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    status: post.status,
    type: post.type,
    visibility: post.visibility,
    publishedAt: post.publishedAt,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    viewCount: post.viewCount,
    likeCount: post.likeCount,
    commentCount: post.commentCount,
    bookmarkCount: post.bookmarkCount,
    isFeatured: post.isFeatured,
    wordCount: post.wordCount,
    readingTimeMinutes: post.readingTimeMinutes,
    author: post.author,
    campaign: post.campaign,
    categories: post.categories?.map((pc: any) => pc.category),
    tags: post.tags?.map((pt: any) => pt.tag),
  };
}
