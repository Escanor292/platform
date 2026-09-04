import { prisma } from '@/lib/prisma';

export const REPORT_TARGET_TYPES = ['CAMPAIGN', 'PROJECT', 'PRODUCT', 'BLOG', 'PROFILE'] as const;
export type ReportTargetType = (typeof REPORT_TARGET_TYPES)[number];

export const REPORT_TARGET_LABELS: Record<ReportTargetType, string> = {
  CAMPAIGN: 'chiến dịch',
  PROJECT: 'dự án',
  PRODUCT: 'sản phẩm',
  BLOG: 'bài viết',
  PROFILE: 'trang cá nhân',
};

export async function resolveReportTarget(targetType: ReportTargetType, targetId: string) {
  if (targetType === 'CAMPAIGN') {
    const campaign = await prisma.campaigns.findFirst({
      where: { OR: [{ id: targetId }, { slug: targetId }] },
      select: { id: true, title: true, slug: true },
    });
    if (!campaign) return null;
    return {
      campaignId: campaign.id,
      targetId: campaign.id,
      targetTitle: campaign.title,
      targetHref: `/campaigns/${campaign.slug}`,
    };
  }

  if (targetType === 'PROJECT') {
    const project = await prisma.projects.findFirst({
      where: { OR: [{ id: targetId }, { slug: targetId }] },
      select: { id: true, title: true, slug: true },
    });
    if (!project) return null;
    return {
      campaignId: null,
      targetId: project.id,
      targetTitle: project.title,
      targetHref: `/projects/${project.slug || project.id}`,
    };
  }

  if (targetType === 'PRODUCT') {
    const product = await prisma.rewards.findUnique({
      where: { id: targetId },
      select: { id: true, title: true },
    });
    if (!product) return null;
    return {
      campaignId: null,
      targetId: product.id,
      targetTitle: product.title,
      targetHref: `/products/${product.id}`,
    };
  }

  if (targetType === 'BLOG') {
    const post = await prisma.blog_posts.findFirst({
      where: { deletedAt: null, OR: [{ id: targetId }, { slug: targetId }] },
      select: { id: true, title: true, slug: true },
    });
    if (!post) return null;
    return {
      campaignId: null,
      targetId: post.id,
      targetTitle: post.title,
      targetHref: `/blog/${post.slug}`,
    };
  }

  const user = await prisma.users.findUnique({
    where: { id: targetId },
    select: { id: true, name: true },
  });
  if (!user) return null;
  return {
    campaignId: null,
    targetId: user.id,
    targetTitle: user.name || 'Trang cá nhân',
    targetHref: `/profile/${user.id}`,
  };
}

export function parseReportImages(imageUrls: unknown) {
  return Array.isArray(imageUrls)
    ? imageUrls.filter((url) => typeof url === 'string' && /^https?:\/\//.test(url)).slice(0, 5)
    : [];
}

export function parseOccurredAt(occurredAt: unknown) {
  if (typeof occurredAt !== 'string' || !occurredAt.trim()) return { ok: true as const, value: null };
  const parsed = new Date(occurredAt);
  if (Number.isNaN(parsed.getTime())) return { ok: false as const };
  return { ok: true as const, value: parsed };
}
