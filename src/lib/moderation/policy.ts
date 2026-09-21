import { hoursWaiting, isSlaOverdue, MAX_BULK_REVIEW, normalizeRejectReason, SLA_HOURS } from '@/lib/blog/blog-policy';

export { hoursWaiting, isSlaOverdue, MAX_BULK_REVIEW, normalizeRejectReason, SLA_HOURS };

export const PUBLIC_CAMPAIGN_STATUSES = ['ACTIVE', 'SUCCESS', 'FAILED'] as const;

/** Seed/test campaigns must never count as public community stats or catalog. */
export const TEST_FIXTURE_TITLE_PREFIX = '[FIXTURE';
export const TEST_FIXTURE_TAG = 'fixture';

export const NOT_TEST_FIXTURE = {
  NOT: {
    OR: [
      { title: { startsWith: TEST_FIXTURE_TITLE_PREFIX } },
      { tags: { has: TEST_FIXTURE_TAG } },
    ],
  },
};

export function isTestFixtureCampaign(campaign: { title?: string | null; tags?: string[] | null }): boolean {
  if (campaign.title?.startsWith(TEST_FIXTURE_TITLE_PREFIX)) return true;
  return Boolean(campaign.tags?.includes(TEST_FIXTURE_TAG));
}

export function isPublicCampaignStatus(status: string | null | undefined): boolean {
  return !!status && (PUBLIC_CAMPAIGN_STATUSES as readonly string[]).includes(status);
}

export function canSubmitCampaign(status: string | null | undefined, successPledgeCount = 0): boolean {
  if (status === 'DRAFT') return true;
  if (status === 'CANCELED' && successPledgeCount === 0) return true;
  return false;
}

export function canWithdrawCampaign(status: string | null | undefined): boolean {
  return status === 'PENDING_REVIEW';
}

export function canTakedownCampaign(status: string | null | undefined): boolean {
  return status === 'ACTIVE' || status === 'SUCCESS' || status === 'FAILED';
}

export function canRestoreCanceledCampaign(params: {
  status: string | null | undefined;
  moderationAction?: string | null;
  successPledgeCount?: number;
}): boolean {
  if (params.status !== 'CANCELED') return false;
  if (params.moderationAction === 'REJECT') return false;
  return (params.successPledgeCount || 0) > 0 || params.moderationAction === 'TAKEDOWN';
}

export function campaignModerationLabel(status: string, moderationAction?: string | null): string {
  if (status === 'CANCELED' && moderationAction === 'REJECT') return 'Từ chối';
  if (status === 'CANCELED' && moderationAction === 'TAKEDOWN') return 'Đã gỡ';
  switch (status) {
    case 'DRAFT':
      return 'Nháp';
    case 'PENDING_REVIEW':
      return 'Chờ duyệt';
    case 'ACTIVE':
      return 'Đang hoạt động';
    case 'SUCCESS':
      return 'Thành công';
    case 'FAILED':
      return 'Không đạt';
    case 'CANCELED':
      return 'Đã hủy';
    default:
      return status;
  }
}

export function lockLabel(type: 'user' | 'campaign' | 'project' | 'product', locked: boolean): string {
  if (type === 'product') return locked ? 'Hiện lại sản phẩm' : 'Ẩn sản phẩm';
  if (type === 'project') return locked ? 'Mở khóa dự án' : 'Khóa dự án';
  if (type === 'campaign') return locked ? 'Mở lại chiến dịch' : 'Gỡ chiến dịch';
  return locked ? 'Mở khóa tài khoản' : 'Khóa tài khoản';
}
