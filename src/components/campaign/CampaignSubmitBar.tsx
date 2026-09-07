'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { canSubmitCampaign, canWithdrawCampaign } from '@/lib/moderation/policy';

export default function CampaignSubmitBar({
  slug,
  status,
  rejectionReason,
  successPledgeCount = 0,
}: {
  slug: string;
  status: string;
  rejectionReason?: string | null;
  successPledgeCount?: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const canSubmit = canSubmitCampaign(status, successPledgeCount);
  const canWithdraw = canWithdrawCampaign(status);

  const run = async (path: 'submit' | 'withdraw', success: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${slug}/${path}`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Không thực hiện được');
      toast.success(success);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  if (!canSubmit && !canWithdraw && !rejectionReason) return null;

  return (
    <div className="space-y-2">
      {status === 'PENDING_REVIEW' && (
        <p className="text-xs font-medium text-amber-700">Đang chờ Admin duyệt (SLA 24 giờ).</p>
      )}
      {rejectionReason && status === 'CANCELED' && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          Lý do từ chối: {rejectionReason}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {canSubmit && (
          <button
            type="button"
            disabled={loading}
            onClick={() => run('submit', status === 'CANCELED' ? 'Đã gửi duyệt lại' : 'Đã gửi duyệt')}
            className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
          >
            {status === 'CANCELED' ? 'Gửi duyệt lại' : 'Gửi duyệt'}
          </button>
        )}
        {canWithdraw && (
          <button
            type="button"
            disabled={loading}
            onClick={() => run('withdraw', 'Đã rút về bản nháp')}
            className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 disabled:opacity-50"
          >
            Rút về nháp
          </button>
        )}
      </div>
    </div>
  );
}
