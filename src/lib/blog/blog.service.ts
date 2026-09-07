// ============================================================
// BLOG SERVICE - Business Logic Layer
// ============================================================

import { prisma } from '@/lib/prisma';
import {
  createBlogContent,
  getBlogContent,
  updateBlogContent,
  createVersion,
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
import { persistRichText } from '@/lib/editor/persist';
import { isKYCVerified } from '@/lib/kyc';
import { clearBlogRejection, isEditorialBlogType } from '@/lib/blog/blog-review';

export async function createBlogPost(currentUserId: string, data: CreateBlogPostRequest): Promise<BlogPostResponse> {
  const user = await prisma.users.findUnique({ where: { id: currentUserId }, select: { isAdmin: true } });
  if (!user?.isAdmin) {
    if (data.type === 'PLATFORM' || data.type === 'ANNOUNCEMENT') {
      throw new Error('Only administrators can create platform announcements');
    }
  }
  if (data.type === 'CAMPAIGN_UPDATE') {
    if (!data.campaignId) throw new Error('Campaign ID is required for campaign updates');
    const campaign = await prisma.campaigns.findUnique({ where: { id: data.campaignId }, select: { creatorId: true } });
    if (!campaign) throw new Error('Campaign not found');
    if (campaign.creatorId !== currentUserId && !user?.isAdmin) {
      throw new Error('You can only create updates for your own campaigns');
    }
  }
  const slug = await generateUniqueSlug(data.title);
  const safeContent = typeof data.content === 'string' ? persistRichText(data.content) : data.content;
  const wordCount = calculateWordCount(safeContent, data.richContent);
  const readingTimeMinutes = calculateReadingTime(wordCount);
  let status = data.status || 'DRAFT';
  if (status === 'PUBLISHED' && !user?.isAdmin) {
    if (data.type === 'CAMPAIGN_UPDATE' && (await isKYCVerified(currentUserId))) {
      status = 'PUBLISHED';
    } else {
      status = 'PENDING_REVIEW';
    }
  }
  const post = await prisma.blog_posts.create({
    data: {
      id: crypto.randomUUID(),
      authorId: currentUserId,
      campaignId: data.campaignId,
      projectId: data.projectId || undefined,
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
      content: safeContent || undefined,
      blog_post_categories: data.categoryIds ? { create: data.categoryIds.map((categoryId) => ({ categoryId })) } : undefined,
      blog_post_tags: data.tags ? { create: await Promise.all(data.tags.map(async (tagName) => { const tag = await getOrCreateTag(tagName); return { tagId: tag.id }; })) } : undefined,
      updatedAt: new Date(),
    },
    include: {
      users: { select: { id: true, name: true, avatar: true } },
      campaigns: { select: { id: true, title: true, slug: true, projects: { select: { id: true, title: true, slug: true } } } },
      projects: { select: { id: true, title: true, slug: true } },
      blog_post_categories: { include: { blog_categories: true } },
      blog_post_tags: { include: { blog_tags: true } },
    },
  });
  try {
    const mongoContentId = await createBlogContent({ postId: post.id, format: data.richContent ? 'rich_json' : 'markdown', content: safeContent, richContent: data.richContent, wordCount, readingTimeMinutes });
    await prisma.blog_posts.update({ where: { id: post.id }, data: { mongoContentId } });
  } catch (error) {
    console.error('[BLOG] Failed to create content in MongoDB, keeping content in PostgreSQL:', error);
  }
  return formatBlogPostResponse(post);
}

export async function getBlogPostList(query: BlogPostListQuery, currentUserId?: string): Promise<{ posts: BlogPostResponse[]; total: number; page: number; limit: number }> {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;
  const where: any = { deletedAt: null, status: 'PUBLISHED' };
  if (query.type) where.type = query.type;
  if (query.campaignId) where.campaignId = query.campaignId;
  if (query.projectId !== undefined) {
    where.projectId = (query.projectId === 'null' || query.projectId === 'standalone') ? null : query.projectId;
  }
  if (query.authorId) where.authorId = query.authorId;
  if (query.featured) where.isFeatured = true;
  if (query.category) where.categories = { some: { category: { slug: query.category } } };
  if (query.tag) where.tags = { some: { tag: { slug: query.tag } } };
  if (query.search) where.OR = [{ title: { contains: query.search, mode: 'insensitive' } }, { excerpt: { contains: query.search, mode: 'insensitive' } }];
  if (!currentUserId) where.visibility = 'PUBLIC';
  let orderBy: any = { publishedAt: 'desc' };
  if (query.sort === 'popular') orderBy = { likeCount: 'desc' };
  else if (query.sort === 'most_viewed') orderBy = { viewCount: 'desc' };
  const [posts, total] = await Promise.all([
    prisma.blog_posts.findMany({
      where, skip, take: limit, orderBy,
      include: {
        users: { select: { id: true, name: true, avatar: true } },
        campaigns: { select: { id: true, title: true, slug: true, projects: { select: { id: true, title: true, slug: true } } } },
        projects: { select: { id: true, title: true, slug: true } },
        blog_post_categories: { include: { blog_categories: true } },
        blog_post_tags: { include: { blog_tags: true } },
      },
    }),
    prisma.blog_posts.count({ where }),
  ]);
  return { posts: posts.map(formatBlogPostResponse), total, page, limit };
}

export async function getBlogPostBySlug(slug: string, currentUserId?: string): Promise<BlogPostResponse | null> {
  const post = await prisma.blog_posts.findUnique({
    where: { slug, deletedAt: null },
    include: {
      users: { select: { id: true, name: true, avatar: true } },
      campaigns: { select: { id: true, title: true, slug: true, projects: { select: { id: true, title: true, slug: true } } } },
      projects: { select: { id: true, title: true, slug: true } },
      blog_post_categories: { include: { blog_categories: true } },
      blog_post_tags: { include: { blog_tags: true } },
    },
  });
  if (!post) return null;
  const canRead = await canReadPost(post, currentUserId);
  if (!canRead) throw new Error('You do not have permission to read this post');
  let content = null;
  try { content = await getBlogContent(post.id); } catch (error) {
    console.error('[BLOG] Failed to fetch content from MongoDB for post:', post.id, error);
  }
  if (!content?.content && !content?.richContent && post.content) {
    content = { content: post.content, richContent: null, tableOfContents: null } as any;
  }
  await prisma.blog_posts.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } });
  let isLiked = false;
  let isBookmarked = false;
  if (currentUserId) {
    const [like, bookmark] = await Promise.all([
      prisma.blog_likes.findUnique({ where: { postId_userId: { postId: post.id, userId: currentUserId } } }),
      prisma.blog_bookmarks.findUnique({ where: { postId_userId: { postId: post.id, userId: currentUserId } } }),
    ]);
    isLiked = !!like;
    isBookmarked = !!bookmark;
  }
  return { ...formatBlogPostResponse(post), content: content?.content, richContent: content?.richContent, tableOfContents: content?.tableOfContents, isLiked, isBookmarked };
}

export async function updateBlogPost(postId: string, currentUserId: string, data: UpdateBlogPostRequest): Promise<BlogPostResponse> {
  const post = await prisma.blog_posts.findUnique({ where: { id: postId }, select: { authorId: true, title: true, excerpt: true } });
  if (!post) throw new Error('Post not found');
  const user = await prisma.users.findUnique({ where: { id: currentUserId }, select: { isAdmin: true } });
  if (post.authorId !== currentUserId && !user?.isAdmin) throw new Error('You can only edit your own posts');
  try {
    const oldContent = await getBlogContent(postId);
    if (oldContent) {
      await createVersion({ postId, authorId: currentUserId, titleSnapshot: post.title, excerptSnapshot: post.excerpt || undefined, contentSnapshot: oldContent.content, richContentSnapshot: oldContent.richContent, changeNote: 'Update' });
    }
  } catch (error) {
    console.error('[BLOG] Failed to create version (MongoDB unavailable), continuing update:', error);
  }
  let wordCount: number | undefined;
  let readingTimeMinutes: number | undefined;
  if (data.content !== undefined || data.richContent !== undefined) {
    const safeContent = data.content !== undefined ? persistRichText(data.content || '') : data.content;
    wordCount = calculateWordCount(safeContent, data.richContent);
    readingTimeMinutes = calculateReadingTime(wordCount);
    try {
      await updateBlogContent(postId, { content: safeContent, richContent: data.richContent, wordCount, readingTimeMinutes });
    } catch (error) {
      console.error('[BLOG] Failed to update MongoDB content, keeping in PostgreSQL:', error);
      try { await prisma.blog_posts.update({ where: { id: postId }, data: { content: safeContent || null } }); } catch (pgError) {
        console.error('[BLOG] Failed to persist content to PostgreSQL:', pgError);
      }
    }
  }
  let slug: string | undefined;
  if (data.title && data.title !== post.title) slug = await generateUniqueSlug(data.title);
  const updatedPost = await prisma.blog_posts.update({
    where: { id: postId },
    data: {
      title: data.title, slug, projectId: data.projectId, excerpt: data.excerpt, coverImage: data.coverImage,
      type: data.type as any, visibility: data.visibility as any, wordCount, readingTimeMinutes,
      blog_post_categories: data.categoryIds ? { deleteMany: {}, create: data.categoryIds.map((categoryId) => ({ categoryId })) } : undefined,
      blog_post_tags: data.tags ? { deleteMany: {}, create: await Promise.all(data.tags.map(async (tagName) => { const tag = await getOrCreateTag(tagName); return { tagId: tag.id }; })) } : undefined,
    },
    include: {
      users: { select: { id: true, name: true, avatar: true } },
      campaigns: { select: { id: true, title: true, slug: true, projects: { select: { id: true, title: true, slug: true } } } },
      projects: { select: { id: true, title: true, slug: true } },
      blog_post_categories: { include: { blog_categories: true } },
      blog_post_tags: { include: { blog_tags: true } },
    },
  });
  return formatBlogPostResponse(updatedPost);
}

export async function deleteBlogPost(postId: string, currentUserId: string): Promise<void> {
  const post = await prisma.blog_posts.findUnique({ where: { id: postId }, select: { authorId: true } });
  if (!post) throw new Error('Post not found');
  const user = await prisma.users.findUnique({ where: { id: currentUserId }, select: { isAdmin: true } });
  if (post.authorId !== currentUserId && !user?.isAdmin) throw new Error('You can only delete your own posts');
  await prisma.blog_posts.update({ where: { id: postId }, data: { deletedAt: new Date() } });
}

export async function publishBlogPost(postId: string, currentUserId: string): Promise<void> {
  const post = await prisma.blog_posts.findUnique({
    where: { id: postId },
    select: { authorId: true, status: true, type: true },
  });
  if (!post) throw new Error('Post not found');
  const user = await prisma.users.findUnique({
    where: { id: currentUserId },
    select: { isAdmin: true, role: true },
  });
  const isAdmin = !!user?.isAdmin || user?.role === 'ADMIN';
  if (!isAdmin && post.authorId !== currentUserId) {
    throw new Error('You do not have permission to publish this post');
  }
  if (!isAdmin && isEditorialBlogType(post.type)) {
    await prisma.blog_posts.update({ where: { id: postId }, data: { status: 'PENDING_REVIEW' } });
    await clearBlogRejection(postId);
    return;
  }
  if (!isAdmin && post.type === 'CAMPAIGN_UPDATE') {
    const verified = await isKYCVerified(currentUserId);
    if (!verified) {
      throw new Error('Can hoan tat KYC truoc khi xuat ban cap nhat chien dich');
    }
  }
  await prisma.blog_posts.update({
    where: { id: postId },
    data: { status: 'PUBLISHED', publishedAt: new Date() },
  });
  await clearBlogRejection(postId);
}

export async function archiveBlogPost(postId: string, currentUserId: string): Promise<void> {
  const post = await prisma.blog_posts.findUnique({ where: { id: postId }, select: { authorId: true } });
  if (!post) throw new Error('Post not found');
  const user = await prisma.users.findUnique({ where: { id: currentUserId }, select: { isAdmin: true } });
  if (post.authorId !== currentUserId && !user?.isAdmin) throw new Error('You can only archive your own posts');
  await prisma.blog_posts.update({ where: { id: postId }, data: { status: 'ARCHIVED' } });
}

export async function toggleLike(postId: string, userId: string): Promise<{ liked: boolean }> {
  const existing = await prisma.blog_likes.findUnique({ where: { postId_userId: { postId, userId } } });
  if (existing) {
    await prisma.$transaction([prisma.blog_likes.delete({ where: { id: existing.id } }), prisma.blog_posts.update({ where: { id: postId }, data: { likeCount: { decrement: 1 } } })]);
    return { liked: false };
  }
  await prisma.$transaction([prisma.blog_likes.create({ data: { id: crypto.randomUUID(), postId, userId } }), prisma.blog_posts.update({ where: { id: postId }, data: { likeCount: { increment: 1 } } })]);
  return { liked: true };
}

export async function toggleBookmark(postId: string, userId: string): Promise<{ bookmarked: boolean }> {
  const existing = await prisma.blog_bookmarks.findUnique({ where: { postId_userId: { postId, userId } } });
  if (existing) {
    await prisma.$transaction([prisma.blog_bookmarks.delete({ where: { id: existing.id } }), prisma.blog_posts.update({ where: { id: postId }, data: { bookmarkCount: { decrement: 1 } } })]);
    return { bookmarked: false };
  }
  await prisma.$transaction([prisma.blog_bookmarks.create({ data: { id: crypto.randomUUID(), postId, userId } }), prisma.blog_posts.update({ where: { id: postId }, data: { bookmarkCount: { increment: 1 } } })]);
  return { bookmarked: true };
}

async function canReadPost(post: any, currentUserId?: string): Promise<boolean> {
  if (post.status !== 'PUBLISHED') {
    if (!currentUserId) return false;
    const user = await prisma.users.findUnique({ where: { id: currentUserId }, select: { isAdmin: true } });
    return post.authorId === currentUserId || !!user?.isAdmin;
  }
  if (post.visibility === 'PUBLIC') return true;
  if (post.visibility === 'PRIVATE' || post.visibility === 'OWNER_ONLY') {
    if (!currentUserId) return false;
    const user = await prisma.users.findUnique({ where: { id: currentUserId }, select: { isAdmin: true } });
    return post.authorId === currentUserId || (user?.isAdmin ?? false);
  }
  if (post.visibility === 'BACKERS_ONLY') {
    if (!currentUserId) return false;
    const user = await prisma.users.findUnique({ where: { id: currentUserId }, select: { isAdmin: true } });
    if (post.authorId === currentUserId || (user?.isAdmin ?? false)) return true;
    if (post.campaignId) {
      const pledge = await prisma.pledges.findFirst({ where: { campaignId: post.campaignId, userId: currentUserId, status: 'SUCCESS' } });
      return !!pledge;
    }
    return false;
  }
  return true;
}

async function getOrCreateTag(name: string) {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  let tag = await prisma.blog_tags.findUnique({ where: { slug } });
  if (!tag) tag = await prisma.blog_tags.create({ data: { id: crypto.randomUUID(), name, slug } });
  return tag;
}

function formatBlogPostResponse(post: any): BlogPostResponse {
  const campaign = post.campaign || post.campaigns;
  const project = post.project || post.projects || campaign?.projects;
  return {
    id: post.id, authorId: post.authorId, campaignId: post.campaignId, projectId: post.projectId || project?.id,
    title: post.title, slug: post.slug, excerpt: post.excerpt, coverImage: post.coverImage,
    status: post.status, type: post.type, visibility: post.visibility, publishedAt: post.publishedAt,
    createdAt: post.createdAt, updatedAt: post.updatedAt, viewCount: post.viewCount, likeCount: post.likeCount,
    commentCount: post.commentCount, bookmarkCount: post.bookmarkCount, isFeatured: post.isFeatured,
    wordCount: post.wordCount, readingTimeMinutes: post.readingTimeMinutes,
    rejectionReason: post.rejectionReason ?? null,
    author: post.author || post.users,
    campaign: campaign ? { id: campaign.id, title: campaign.title, slug: campaign.slug, project: campaign.projects || campaign.project || null } : undefined,
    project: project ? { id: project.id, title: project.title, slug: project.slug } : undefined,
    categories: post.categories?.map((pc: any) => pc.category) || post.blog_post_categories?.map((pc: any) => pc.blog_categories),
    tags: post.tags?.map((pt: any) => pt.tag) || post.blog_post_tags?.map((pt: any) => pt.blog_tags),
  };
}
