'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle, Clock, Eye, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatVND } from '@/lib/utils';
import CampaignReviewActions from '@/components/admin/CampaignReviewActions';
import AdminLockButton from '@/components/admin/AdminLockButton';
import { campaignModerationLabel, canRestoreCanceledCampaign, canTakedownCampaign } from '@/lib/moderation/policy';

export type QueueCampaign = {
  id: string;
  slug: string;
  title: string;
  campaignCode: string;
  imageUrl: string | null;
  status: string;
  goalAmount: number;
  currentAmount: number;
  createdAt: string;
  slaOverdue: boolean;
  slaHours: number;
  rejectionReason: string | null;
  moderationAction: string | null;
  successPledgeCount: number;
  creator: { id: string; name: string | null; email: string | null };
};

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-600',
  PENDING_REVIEW: 'bg-amber-100 text-amber-600',
  SUCCESS: 'bg-blue-100 text-blue-600',
  FAILED: 'bg-red-100 text-red-600',
  CANCELED: 'bg-gray-100 text-gray-600',
  DRAFT: 'bg-gray-100 text-gray-600',
};

export default function CampaignQueueClient({ campaigns }: { campaigns: QueueCampaign[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const pendingIds = useMemo(
    () => campaigns.filter((item) => item.status === 'PENDING_REVIEW').map((item) => item.id),
    [campaigns]
  );
  const allSelected = pendingIds.length > 0 && pendingIds.every((id) => selected.includes(id));

  const bulk = async (status: 'ACTIVE' | 'CANCELED', rejectReason?: string) => {
    if (selected.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/campaigns/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selected, status, reason: rejectReason }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Không thể duyệt hàng loạt');
      toast.success(`Đã xử lý ${data.updated || selected.length} chiến dịch`);
      setSelected([]);
      setRejecting(false);
      setReason('');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {selected.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
          <span className="font-semibold text-amber-900">Đã chọn {selected.length} chiến dịch</span>
          <button
            className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white disabled:opacity-50"
            disabled={submitting}
            onClick={() => bulk('ACTIVE')}
          >
            Duyệt hàng loạt
          </button>
          <button
            className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white disabled:opacity-50"
            disabled={submitting}
            onClick={() => setRejecting(true)}
          >
            Từ chối hàng loạt
          </button>
          <button className="text-xs text-gray-500" onClick={() => setSelected([])}>
            Bỏ chọn
          </button>
        </div>
      )}
      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(event) => setSelected(event.target.checked ? pendingIds : [])}
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-500">Chiến dịch</th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-500">Creator</th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-500">Trạng thái</th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-500">Mục tiêu</th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-500">Đã huy động</th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-500">Ngày tạo</th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-500">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {campaigns.map((campaign) => {
                const progress = Math.min(100, Math.round((campaign.currentAmount / (campaign.goalAmount || 1)) * 100));
                const StatusIcon = campaign.status === 'PENDING_REVIEW' ? Clock : campaign.status === 'FAILED' || campaign.status === 'CANCELED' ? XCircle : CheckCircle;
                const showRestore = canRestoreCanceledCampaign({
                  status: campaign.status,
                  moderationAction: campaign.moderationAction,
                  successPledgeCount: campaign.successPledgeCount,
                });
                return (
                  <tr key={campaign.id} className={`transition hover:bg-gray-50 ${campaign.slaOverdue ? 'bg-red-50/60' : ''}`}>
                    <td className="px-4 py-4">
                      {campaign.status === 'PENDING_REVIEW' && (
                        <input
                          type="checkbox"
                          checked={selected.includes(campaign.id)}
                          onChange={(event) =>
                            setSelected((current) =>
                              event.target.checked ? [...current, campaign.id] : current.filter((id) => id !== campaign.id)
                            )
                          }
                        />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/admin/campaigns/${campaign.id}`} className="flex items-center gap-3">
                        <img src={campaign.imageUrl || '/placeholder.jpg'} alt={campaign.title} className="h-12 w-12 rounded-xl object-cover" />
                        <div>
                          <div className="max-w-xs truncate font-bold text-gray-900 hover:text-green-700">{campaign.title}</div>
                          <div className="font-mono text-xs text-gray-400">{campaign.campaignCode}</div>
                          {campaign.slaOverdue && (
                            <div className="mt-1 text-xs font-semibold text-red-600">Quá hạn {Math.round(campaign.slaHours)} giờ</div>
                          )}
                          {campaign.rejectionReason && (
                            <div className="mt-1 max-w-xs truncate text-xs text-red-600">Lý do: {campaign.rejectionReason}</div>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <Link href={`/profile/${campaign.creator.id}`} className="hover:text-blue-700">
                        <div className="text-sm font-bold text-gray-900">{campaign.creator.name || 'Chưa đặt tên'}</div>
                        <div className="text-xs text-gray-400">{campaign.creator.email}</div>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black ${STATUS_COLOR[campaign.status] || 'bg-gray-100 text-gray-600'}`}>
                        <StatusIcon size={12} />
                        {campaignModerationLabel(campaign.status, campaign.moderationAction)}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-900">{formatVND(campaign.goalAmount)}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">{formatVND(campaign.currentAmount)}</div>
                      <div className="text-xs text-gray-400">{progress}% đạt được</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{new Date(campaign.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/admin/campaigns/${campaign.id}`} className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 transition hover:bg-blue-100">
                          <Eye size={12} /> Xem
                        </Link>
                        {campaign.status === 'PENDING_REVIEW' && (
                          <CampaignReviewActions campaignId={campaign.id} title={campaign.title} />
                        )}
                        {(canTakedownCampaign(campaign.status) || showRestore) && (
                          <AdminLockButton type="campaign" id={campaign.id} locked={campaign.status === 'CANCELED'} />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {campaigns.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-400">Không có chiến dịch nào trong bộ lọc này.</div>
          )}
        </div>
      </div>
      {rejecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">Từ chối hàng loạt</h2>
            <p className="mt-1 text-sm text-gray-500">{selected.length} chiến dịch đã chọn</p>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={4}
              className="mt-4 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
              placeholder="Nhập lý do từ chối (bắt buộc)"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="rounded-full border px-4 py-2 text-sm" onClick={() => setRejecting(false)} disabled={submitting}>
                Hủy
              </button>
              <button
                type="button"
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                disabled={submitting || !reason.trim()}
                onClick={() => bulk('CANCELED', reason.trim())}
              >
                Từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
