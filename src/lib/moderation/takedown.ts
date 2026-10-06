import { prisma } from '@/lib/prisma';
import { executeRaw, queryRaw } from "@/lib/sql/raw";
import { createAuditLog } from '@/lib/audit';
import { cacheInvalidatePrefix, CAMPAIGNS_CACHE_PREFIX } from '@/lib/redis-cache';
import { ensureTableColumns } from './review-columns';
import { canRestoreCanceledCampaign, canTakedownCampaign, normalizeRejectReason } from './policy';
import { notifyOwner } from './notify-admins';
import { ensureCampaignReviewColumns } from './campaign-review';

const PROJECT_COLUMNS = [
  { name: 'lockReason', sqlType: 'TEXT' },
  { name: 'lockedAt', sqlType: 'TIMESTAMP(3)' },
  { name: 'lockedBy', sqlType: 'TEXT' },
];

const REWARD_COLUMNS = [
  { name: 'hideReason', sqlType: 'TEXT' },
  { name: 'hiddenAt', sqlType: 'TIMESTAMP(3)' },
  { name: 'hiddenBy', sqlType: 'TEXT' },
];

export async function ensureProjectLockColumns(): Promise<void> {
  await ensureTableColumns('projects', PROJECT_COLUMNS);
}

export async function ensureRewardHideColumns(): Promise<void> {
  await ensureTableColumns('rewards', REWARD_COLUMNS);
}

export async function takedownProject(params: {
  id: string;
  locked: boolean;
  reason?: string;
  adminId: string;
}) {
  const project = await prisma.projects.findUnique({
    where: { id: params.id },
    select: { id: true, title: true, slug: true, isLocked: true, creatorId: true },
  });
  if (!project) throw new Error('Không tìm thấy dự án');

  const reason = params.locked ? normalizeRejectReason(params.reason) : null;
  if (params.locked && !reason) throw new Error('Cần nhập lý do khi khóa dự án');

  const updated = await prisma.projects.update({
    where: { id: params.id },
    data: { isLocked: params.locked },
    select: { id: true, isLocked: true },
  });

  await ensureProjectLockColumns();
  try {
    await executeRaw(
      `UPDATE projects
       SET "lockReason" = $1, "lockedAt" = $2, "lockedBy" = $3, "updatedAt" = NOW()
       WHERE id = $4`,
      reason,
      params.locked ? new Date() : null,
      params.locked ? params.adminId : null,
      params.id
    );
  } catch (error) {
    console.error('[MODERATION] project lock extra columns failed:', error);
  }

  await createAuditLog({
    userId: params.adminId,
    action: params.locked ? 'REJECT' : 'APPROVE',
    entityType: 'projects',
    entityId: params.id,
    oldValue: { isLocked: project.isLocked },
    newValue: { isLocked: updated.isLocked },
    reason,
  });

  await notifyOwner({
    userId: project.creatorId,
    type: 'CONTENT_HIDDEN',
    title: params.locked ? 'Dự án đã bị khóa' : 'Dự án đã được mở lại',
    message: params.locked
      ? `Dự án “${project.title}” đã bị khóa. Lý do: ${reason}`
      : `Dự án “${project.title}” đã được mở lại và hiện trên trang công khai.`,
    href: `/projects/${project.slug || project.id}`,
  });

  return updated;
}

export async function takedownProduct(params: {
  id: string;
  locked: boolean;
  reason?: string;
  adminId: string;
}) {
  const product = await prisma.rewards.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      isActive: true,
      campaigns: { select: { slug: true, creatorId: true, title: true } },
      projects: { select: { slug: true, creatorId: true, title: true } },
    },
  });
  if (!product) throw new Error('Không tìm thấy sản phẩm');

  const ownerId = product.campaigns?.creatorId || product.projects?.creatorId;
  const reason = params.locked ? normalizeRejectReason(params.reason) : null;
  if (params.locked && !reason) throw new Error('Cần nhập lý do khi ẩn sản phẩm');

  const updated = await prisma.rewards.update({
    where: { id: params.id },
    data: { isActive: !params.locked },
    select: { id: true, isActive: true },
  });

  await ensureRewardHideColumns();
  try {
    await executeRaw(
      `UPDATE rewards
       SET "hideReason" = $1, "hiddenAt" = $2, "hiddenBy" = $3, "updatedAt" = NOW()
       WHERE id = $4`,
      reason,
      params.locked ? new Date() : null,
      params.locked ? params.adminId : null,
      params.id
    );
  } catch (error) {
    console.error('[MODERATION] product hide extra columns failed:', error);
  }

  await createAuditLog({
    userId: params.adminId,
    action: params.locked ? 'REJECT' : 'APPROVE',
    entityType: 'rewards',
    entityId: params.id,
    oldValue: { isActive: product.isActive },
    newValue: { isActive: updated.isActive },
    reason,
  });

  if (ownerId) {
    await notifyOwner({
      userId: ownerId,
      type: 'CONTENT_HIDDEN',
      title: params.locked ? 'Sản phẩm đã bị ẩn' : 'Sản phẩm đã được hiện lại',
      message: params.locked
        ? `Sản phẩm “${product.title}” đã bị ẩn. Lý do: ${reason}`
        : `Sản phẩm “${product.title}” đã được hiện lại.`,
      href: `/products/${product.id}`,
    });
  }

  return updated;
}

export async function takedownCampaign(params: {
  id: string;
  locked: boolean;
  reason?: string;
  adminId: string;
}) {
  const campaign = await prisma.campaigns.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      creatorId: true,
      _count: { select: { pledges: { where: { status: 'SUCCESS' } } } },
    },
  });
  if (!campaign) throw new Error('Không tìm thấy chiến dịch');

  await ensureCampaignReviewColumns();

  if (params.locked) {
    if (!canTakedownCampaign(campaign.status)) {
      throw new Error('Chỉ gỡ được chiến dịch đang công khai. Chiến dịch chờ duyệt hãy dùng Duyệt / Từ chối.');
    }
    const reason = normalizeRejectReason(params.reason);
    if (!reason) throw new Error('Cần nhập lý do khi gỡ chiến dịch');

    await prisma.campaigns.update({
      where: { id: params.id },
      data: { status: 'CANCELED' },
    });
    try {
      await executeRaw(
        `UPDATE campaigns
         SET "rejectionReason" = $1,
             "reviewedAt" = NOW(),
             "reviewedBy" = $2,
             "moderationAction" = 'TAKEDOWN',
             "updatedAt" = NOW()
         WHERE id = $3`,
        reason,
        params.adminId,
        params.id
      );
    } catch (error) {
      console.error('[MODERATION] campaign takedown extra columns failed:', error);
    }

    await createAuditLog({
      userId: params.adminId,
      action: 'CANCEL',
      entityType: 'campaigns',
      entityId: params.id,
      oldValue: { status: campaign.status },
      newValue: { status: 'CANCELED', moderationAction: 'TAKEDOWN' },
      reason,
    });
    await notifyOwner({
      userId: campaign.creatorId,
      type: 'CONTENT_HIDDEN',
      title: 'Chiến dịch đã bị gỡ',
      message: `Chiến dịch “${campaign.title}” đã bị gỡ khỏi trang công khai. Lý do: ${reason}`,
      href: `/dashboard/creator/edit/${campaign.slug}`,
    });
    await cacheInvalidatePrefix(CAMPAIGNS_CACHE_PREFIX).catch(() => undefined);
    return { id: campaign.id, status: 'CANCELED' as const };
  }

  const extra = await queryRaw<Array<{ moderationAction: string | null }>>(
    `SELECT "moderationAction" FROM campaigns WHERE id = $1`,
    params.id
  ).catch(() => [] as Array<{ moderationAction: string | null }>);
  const moderationAction = extra[0]?.moderationAction ?? null;

  if (
    !canRestoreCanceledCampaign({
      status: campaign.status,
      moderationAction,
      successPledgeCount: campaign._count.pledges,
    })
  ) {
    throw new Error('Không thể mở lại chiến dịch bị từ chối trong hàng đợi. Creator cần sửa và gửi duyệt lại.');
  }

  await prisma.campaigns.update({
    where: { id: params.id },
    data: { status: 'ACTIVE' },
  });
  try {
    await executeRaw(
      `UPDATE campaigns
       SET "rejectionReason" = NULL,
           "moderationAction" = 'APPROVE',
           "reviewedAt" = NOW(),
           "reviewedBy" = $1,
           "updatedAt" = NOW()
       WHERE id = $2`,
      params.adminId,
      params.id
    );
  } catch (error) {
    console.error('[MODERATION] campaign restore extra columns failed:', error);
  }

  await createAuditLog({
    userId: params.adminId,
    action: 'APPROVE',
    entityType: 'campaigns',
    entityId: params.id,
    oldValue: { status: campaign.status, moderationAction },
    newValue: { status: 'ACTIVE' },
    reason: 'Mở lại chiến dịch sau khi gỡ',
  });
  await notifyOwner({
    userId: campaign.creatorId,
    type: 'CAMPAIGN_APPROVED',
    title: 'Chiến dịch đã được mở lại',
    message: `Chiến dịch “${campaign.title}” đã được Admin mở lại và đang hoạt động.`,
    href: `/campaigns/${campaign.slug}`,
  });
  await cacheInvalidatePrefix(CAMPAIGNS_CACHE_PREFIX).catch(() => undefined);
  return { id: campaign.id, status: 'ACTIVE' as const };
}
