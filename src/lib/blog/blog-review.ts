import { prisma } from '@/lib/prisma';
import { executeRaw, queryRaw } from "@/lib/sql/raw";
import { normalizeRejectReason, resolvePublishAt } from './blog-policy';

export {
  EDITORIAL_BLOG_TYPES,
  MAX_BULK_REVIEW,
  SLA_HOURS,
  hoursWaiting,
  isEditorialBlogType,
  isPubliclyVisibleBlog,
  isScheduledInFuture,
  isSlaOverdue,
  normalizeRejectReason,
  resolvePublishAt,
} from './blog-policy';

export type BlogReviewStatus = 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';

export type BlogReviewFields = {
  rejectionReason: string | null;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  reviewerNote: string | null;
  scheduledAt: Date | null;
};

export async function ensureBlogReviewColumns(): Promise<void> {
  try {
    await executeRaw(
      'ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT'
    );
    await executeRaw(
      'ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3)'
    );
    await executeRaw(
      'ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "reviewedBy" TEXT'
    );
    await executeRaw(
      'ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "reviewerNote" TEXT'
    );
    await executeRaw(
      'ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "scheduledAt" TIMESTAMP(3)'
    );
  } catch (error) {
    console.error('[BLOG] ensureBlogReviewColumns failed:', error);
  }
}

export async function applyBlogReview(params: {
  postId: string;
  status: BlogReviewStatus;
  reason?: string | null;
  reviewerId: string;
  reviewerNote?: string | null;
  scheduledAt?: Date | string | null;
}): Promise<void> {
  await ensureBlogReviewColumns();

  const reason =
    params.status === 'REJECTED' ? normalizeRejectReason(params.reason) || null : null;
  const note = params.reviewerNote ? String(params.reviewerNote).trim() || null : null;
  const publishAt =
    params.status === 'PUBLISHED' ? resolvePublishAt(params.scheduledAt) : null;

  await prisma.blog_posts.update({
    where: { id: params.postId },
    data: {
      status: params.status,
      publishedAt: publishAt ?? undefined,
    },
  });

  try {
    await executeRaw(
      `UPDATE blog_posts
       SET "rejectionReason" = $1,
           "reviewedAt" = NOW(),
           "reviewedBy" = $2,
           "reviewerNote" = COALESCE($3, "reviewerNote"),
           "scheduledAt" = $4,
           "publishedAt" = CASE
             WHEN $5 = 'PUBLISHED' THEN COALESCE($4, NOW())
             ELSE "publishedAt"
           END,
           "updatedAt" = NOW()
       WHERE id = $6`,
      reason,
      params.reviewerId,
      note,
      publishAt,
      params.status,
      params.postId
    );
  } catch (error) {
    console.error('[BLOG] applyBlogReview extra columns failed:', error);
  }
}

export async function saveBlogSchedule(postId: string, scheduledAt: Date | string | null): Promise<void> {
  await ensureBlogReviewColumns();
  const date =
    scheduledAt == null
      ? null
      : scheduledAt instanceof Date
        ? scheduledAt
        : new Date(scheduledAt);
  if (date && Number.isNaN(date.getTime())) return;
  try {
    await executeRaw(
      `UPDATE blog_posts SET "scheduledAt" = $1, "updatedAt" = NOW() WHERE id = $2`,
      date,
      postId
    );
  } catch (error) {
    console.error('[BLOG] saveBlogSchedule failed:', error);
  }
}

export async function saveReviewerNote(postId: string, note: string | null, reviewerId: string): Promise<void> {
  await ensureBlogReviewColumns();
  try {
    await executeRaw(
      `UPDATE blog_posts
       SET "reviewerNote" = $1,
           "reviewedBy" = $2,
           "updatedAt" = NOW()
       WHERE id = $3`,
      note ? note.trim() || null : null,
      reviewerId,
      postId
    );
  } catch (error) {
    console.error('[BLOG] saveReviewerNote failed:', error);
  }
}

export async function clearBlogRejection(postId: string): Promise<void> {
  await ensureBlogReviewColumns();
  try {
    await executeRaw(
      `UPDATE blog_posts
       SET "rejectionReason" = NULL,
           "reviewedAt" = NULL,
           "reviewedBy" = NULL,
           "updatedAt" = NOW()
       WHERE id = $1`,
      postId
    );
  } catch (error) {
    console.error('[BLOG] clearBlogRejection failed:', error);
  }
}

export async function getBlogReviewFields(
  postIds: string[]
): Promise<Record<string, BlogReviewFields>> {
  if (postIds.length === 0) return {};
  await ensureBlogReviewColumns();
  try {
    const placeholders = postIds.map((_, index) => `$${index + 1}`).join(', ');
    const rows = await queryRaw<
      Array<{
        id: string;
        rejectionReason: string | null;
        reviewedAt: Date | null;
        reviewedBy: string | null;
        reviewerNote: string | null;
        scheduledAt: Date | null;
      }>
    >(
      `SELECT id, "rejectionReason", "reviewedAt", "reviewedBy", "reviewerNote", "scheduledAt"
       FROM blog_posts
       WHERE id IN (${placeholders})`,
      ...postIds
    );
    return Object.fromEntries(
      rows.map((row) => [
        row.id,
        {
          rejectionReason: row.rejectionReason,
          reviewedAt: row.reviewedAt,
          reviewedBy: row.reviewedBy,
          reviewerNote: row.reviewerNote,
          scheduledAt: row.scheduledAt,
        },
      ])
    );
  } catch (error) {
    console.error('[BLOG] getBlogReviewFields failed:', error);
    return {};
  }
}
