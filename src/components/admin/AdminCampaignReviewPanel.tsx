'use client';

import Link from 'next/link';
import CampaignReviewActions from '@/components/admin/CampaignReviewActions';
import AdminLockButton from '@/components/admin/AdminLockButton';
import CampaignFeatureToggle from '@/components/admin/CampaignFeatureToggle';
import { campaignModerationLabel, canRestoreCanceledCampaign, canTakedownCampaign } from '@/lib/moderation/policy';
import { getFundingModelLabel } from '@/lib/funding-model';

export default function AdminCampaignReviewPanel({
  campaignId,
  slug,
  title,
  status,
  rejectionReason,
  reviewerNote,
  moderationAction,
  successPledgeCount,
  isFeatured,
  fundingModel,
}: {
  campaignId: string;
  slug: string;
  title: string;
  status: string;
  rejectionReason: string;
  reviewerNote: string;
  moderationAction: string | null;
  successPledgeCount: number;
  isFeatured: boolean;
  fundingModel?: string | null;
}) {
  const showRestore = canRestoreCanceledCampaign({ status, moderationAction, successPledgeCount });

  return (
    <aside className="h-fit space-y-4 rounded-2xl bg-white p-5 shadow-sm">
      <div>
        <div className="text-xs font-bold uppercase text-gray-400">Trạng thái</div>
        <div className="mt-1 text-lg font-black text-gray-900">{campaignModerationLabel(status, moderationAction)}</div>
      </div>
      {fundingModel && (
        <div className="text-sm text-gray-600">
          Mô hình: <span className="font-bold text-gray-900">{getFundingModelLabel(fundingModel)}</span>
        </div>
      )}
      <CampaignFeatureToggle campaignId={campaignId} featured={isFeatured} />
      {rejectionReason && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">Lý do: {rejectionReason}</div>
      )}
      {reviewerNote && (
        <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">Ghi chú nội bộ: {reviewerNote}</div>
      )}
      {status === 'PENDING_REVIEW' && (
        <CampaignReviewActions campaignId={campaignId} title={title} />
      )}
      {(canTakedownCampaign(status) || showRestore) && (
        <AdminLockButton type="campaign" id={campaignId} locked={status === 'CANCELED'} />
      )}
      <Link href={`/campaigns/${slug}`} className="block text-center text-sm font-semibold text-pgreen">
        Xem bản xem trước công khai
      </Link>
    </aside>
  );
}
