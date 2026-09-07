import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';
import { cacheInvalidatePrefix, CAMPAIGNS_CACHE_PREFIX } from '@/lib/redis-cache';
import { ensureTableColumns, getExtraFields } from './review-columns';
import { canSubmitCampaign, canWithdrawCampaign, normalizeRejectReason } from './policy';
import { notifyAdmins } from './notify-admins';

export type CampaignReviewFields = {
  rejectionReason: string | null;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  reviewerNote: string | null;
  moderationAction: string | null;
};

const CAMPAIGN_COLUMNS = [
  { name: 'rejectionReason', sqlType: 'TEXT' },
  { name: 'reviewedAt', sqlType: 'TIMESTAMP(3)' },
  { name: 'reviewedBy', sqlType: 'TEXT' },
  { name: 'reviewerNote', sqlType: 'TEXT' },
  { name: 'moderationAction', sqlType: 'TEXT' },
];

export async function ensureCampaignReviewColumns(): Promise<void> {
  await ensureTableColumns('campaigns', CAMPAIGN_COLUMNS);
}

export async function getCampaignReviewFields(ids: string[]): Promise<Record<string, CampaignReviewFields>> {
  await ensureCampaignReviewColumns();
  return getExtraFields<CampaignReviewFields>('campaigns', ids, [
    'rejectionReason',
    'reviewedAt',
    'reviewedBy',
    'reviewerNote',
    'moderationAction',
  ]);
}

export async function applyCampaignReview(params: {
  campaignId: string;
  status: 'ACTIVE' | 'CANCELED';
  reason?: string | null;
  reviewerId: string;
  reviewerNote?: string | null;
  action: 'APPROVE' | 'REJECT';
}): Promise<void> {
  await ensureCampaignReviewColumns();
  const reason = params.action === 'REJECT' ? normalizeRejectReason(params.reason) : null;
  const note = params.reviewerNote ? String(params.reviewerNote).trim() || null : null;

  await prisma.campaigns.update({
    where: { id: params.campaignId },
    data: { status: params.status },
  });

  try {
    await prisma.$executeRawUnsafe(
      `UPDATE campaigns
       SET "rejectionReason" = $1,
           "reviewedAt" = NOW(),
           "reviewedBy" = $2,
           "reviewerNote" = COALESCE($3, "reviewerNote"),
           "moderationAction" = $4,
           "updatedAt" = NOW()
       WHERE id = $5`,
      reason,
      params.reviewerId,
      note,
      params.action,
      params.campaignId
    );
  } catch (error) {
    console.error('[CAMPAIGN] applyCampaignReview extra columns failed:', error);
  }

  await createAuditLog({
    userId: params.reviewerId,
    action: params.action === 'APPROVE' ? 'APPROVE' : 'REJECT',
    entityType: 'campaigns',
    entityId: params.campaignId,
    newValue: { status: params.status },
    reason: reason || note,
  });
}

export async function submitCampaignForReview(params: {
  campaignId: string;
  slug: string;
  title: string;
  creatorId: string;
  status: string;
  successPledgeCount: number;
  isAdmin?: boolean;
}): Promise<{ status: 'PENDING_REVIEW' | 'ACTIVE' }> {
  if (params.isAdmin) {
    await prisma.campaigns.update({
      where: { id: params.campaignId },
      data: { status: 'ACTIVE' },
    });
    await ensureCampaignReviewColumns();
    await prisma.$executeRawUnsafe(
      `UPDATE campaigns SET "rejectionReason" = NULL, "moderationAction" = 'APPROVE', "reviewedAt" = NOW(), "updatedAt" = NOW() WHERE id = $1`,
      params.campaignId
    );
    await cacheInvalidatePrefix(CAMPAIGNS_CACHE_PREFIX).catch(() => undefined);
    return { status: 'ACTIVE' };
  }

  if (!canSubmitCampaign(params.status, params.successPledgeCount)) {
    throw new Error('Chiến dịch này không thể gửi duyệt. Chỉ gửi bản nháp hoặc bài bị từ chối chưa có ủng hộ.');
  }

  await prisma.campaigns.update({
    where: { id: params.campaignId },
    data: { status: 'PENDING_REVIEW' },
  });
  await ensureCampaignReviewColumns();
  try {
    await prisma.$executeRawUnsafe(
      `UPDATE campaigns
       SET "rejectionReason" = NULL,
           "moderationAction" = NULL,
           "updatedAt" = NOW()
       WHERE id = $1`,
      params.campaignId
    );
  } catch (error) {
    console.error('[CAMPAIGN] clear rejection on submit failed:', error);
  }

  await notifyAdmins({
    exceptUserId: params.creatorId,
    type: 'CAMPAIGN_SUBMITTED',
    title: 'Chiến dịch chờ duyệt',
    message: `Chiến dịch “${params.title}” vừa được gửi vào hàng đợi.`,
    href: `/dashboard/admin/campaigns/${params.campaignId}`,
  });
  await createAuditLog({
    userId: params.creatorId,
    action: 'UPDATE',
    entityType: 'campaigns',
    entityId: params.campaignId,
    newValue: { status: 'PENDING_REVIEW', slug: params.slug },
    reason: 'Gửi duyệt chiến dịch',
  });
  await cacheInvalidatePrefix(CAMPAIGNS_CACHE_PREFIX).catch(() => undefined);
  return { status: 'PENDING_REVIEW' };
}

export async function withdrawCampaign(params: { campaignId: string; status: string; creatorId: string }): Promise<void> {
  if (!canWithdrawCampaign(params.status)) {
    throw new Error('Chỉ rút được chiến dịch đang chờ duyệt');
  }
  await prisma.campaigns.update({
    where: { id: params.campaignId },
    data: { status: 'DRAFT' },
  });
  await createAuditLog({
    userId: params.creatorId,
    action: 'UPDATE',
    entityType: 'campaigns',
    entityId: params.campaignId,
    newValue: { status: 'DRAFT' },
    reason: 'Rút khỏi hàng đợi duyệt',
  });
}
