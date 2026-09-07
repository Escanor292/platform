import { prisma } from '@/lib/prisma';

const EDITORIAL_TYPES = new Set(['PLATFORM', 'ANNOUNCEMENT', 'STORY', 'IMPACT_REPORT']);

export function isEditorialBlogType(type: string | null | undefined): boolean {
  return !!type && EDITORIAL_TYPES.has(type);
}

export async function ensureBlogReviewColumns(): Promise<void> {
  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT'
    );
    await prisma.$executeRawUnsafe(
      'ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3)'
    );
    await prisma.$executeRawUnsafe(
      'ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "reviewedBy" TEXT'
    );
  } catch (error) {
    console.error('[BLOG] ensureBlogReviewColumns failed:', error);
  }
}

export async function applyBlogReview(params: {
  postId: string;
  status: 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';
  reason?: string | null;
  reviewerId: string;
}): Promise<void> {
  await ensureBlogReviewColumns();

  const reason =
    params.status === 'REJECTED' ? (params.reason || '').trim() || null : null;

  await prisma.blog_posts.update({
    where: { id: params.postId },
    data: {
      status: params.status,
      publishedAt: params.status === 'PUBLISHED' ? new Date() : undefined,
    },
  });

  try {
    await prisma.$executeRawUnsafe(
      `UPDATE blog_posts
       SET "rejectionReason" = $1,
           "reviewedAt" = NOW(),
           "reviewedBy" = $2,
           "publishedAt" = CASE WHEN $3 = 'PUBLISHED' THEN NOW() ELSE "publishedAt" END,
           "updatedAt" = NOW()
       WHERE id = $4`,
      reason,
      params.reviewerId,
      params.status,
      params.postId
    );
  } catch (error) {
    console.error('[BLOG] applyBlogReview extra columns failed:', error);
  }
}

export async function clearBlogRejection(postId: string): Promise<void> {
  await ensureBlogReviewColumns();
  try {
    await prisma.$executeRawUnsafe(
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
): Promise<Record<string, { rejectionReason: string | null; reviewedAt: Date | null; reviewedBy: string | null }>> {
  if (postIds.length === 0) return {};
  await ensureBlogReviewColumns();
  try {
    const placeholders = postIds.map((_, index) => `$${index + 1}`).join(', ');
    const rows = await prisma.$queryRawUnsafe<
      Array<{
        id: string;
        rejectionReason: string | null;
        reviewedAt: Date | null;
        reviewedBy: string | null;
      }>
    >(
      `SELECT id, "rejectionReason", "reviewedAt", "reviewedBy"
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
        },
      ])
    );
  } catch (error) {
    console.error('[BLOG] getBlogReviewFields failed:', error);
    return {};
  }
}
