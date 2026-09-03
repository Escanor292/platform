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
import { persistRichText } from '@/lib/editor/persist';

export async function createBlogPost(
  currentUserId: string,
  data: CreateBlogPostRequest
): Promise<BlogPostResponse> {
  const user = await prisma.users.findUnique({
    where: { id: currentUserId },
    select: { isAdmin: true },
  });

  if (!user?.isAdmin) {
    if (data.type === 'PLATFORM' || data.type === 'ANNOUNCEMENT') {
      throw new Error('Only administrators can create platform announcements');
    }
  }

  if (data.type === 'CAMPAIGN_UPDATE') {
    if (!data.campaignId) {
      throw new Error('Campaign ID is required for campaign updates');
    }

    const campaign = await prisma.campaigns.findUnique({
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

  const slug = await generateUniqueSlug(data.title);
  const safeContent = typeof data.content === 'string' ? persistRichText(data.content) : data.content;
  const wordCount = calculateWordCount(safeContent, data.richContent);
  const readingTimeMinutes = calculateReadingTime(wordCount);

  let status = data.status || 'DRAFT';
  if (status === 'PUBLISHED' && !user?.isAdmin) {
    status = 'PENDING_REVIEW';
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
      blog_post_categories: data.categoryIds
        ? {
          create: data.categoryIds.map((categoryId) => ({
            categoryId,
          })),
        }
        : undefined,
      blog_post_tags: data.tags
        ? {
          create: await Promise.all(
            data.tags.map(async (tagName) => {
              const tag = await getOrCreateTag(tagName);
              return { tagId: tag.id };
            })
          ),
        }
        : undefined,
      updatedAt: new Date(),
    },
    include: {
      users: { select: { id: true, name: true, avatar: true } },
      campaigns: {
        select: {
          id: true,
          title: true,
          slug: true,
          projects: { select: { id: true, title: true, slug: true } },
        },
      },
      projects: { select: { id: true, title: true, slug: true } },
      blog_post_categories: { include: { blog_categories: true } },
      blog_post_tags: { include: { blog_tags: true } },
    },
  });

  try {
    const mongoContentId = await createBlogContent({
      postId: post.id,
      format: data.richContent ? 'rich_json' : 'markdown',
      content: safeContent,
      richContent: data.richContent,
      wordCount,
      readingTimeMinutes,
    });
    await prisma.blog_posts.update({
      where: { id: post.id },
      data: { mongoContentId },
    });
  } catch (error) {
    console.error(
      '[BLOG] Failed to create content in MongoDB, keeping content in PostgreSQL:',
      error
    );
  }

  return formatBlogPostResponse(post);
}
