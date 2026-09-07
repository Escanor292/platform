'use client';

import { useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface CampaignReviewActionsProps {
  campaignId: string;
  title?: string;
  onDone?: () => void;
}

export default function CampaignReviewActions({ campaignId, title, onDone }: CampaignReviewActionsProps) {
  const router = useRouter();
  const [loadingStatus, setLoadingStatus] = useState<'ACTIVE' | 'CANCELED' | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');

  const review = async (status: 'ACTIVE' | 'CANCELED', extra?: { reason?: string; reviewerNote?: string }) => {
    setLoadingStatus(status);
    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...extra }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Không thể cập nhật trạng thái');
      toast.success(status === 'ACTIVE' ? 'Đã duyệt chiến dịch' : 'Đã từ chối chiến dịch');
      setRejecting(false);
      setReason('');
      onDone?.();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật trạng thái');
    } finally {
      setLoadingStatus(null);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => review('ACTIVE', note ? { reviewerNote: note } : undefined)}
          disabled={loadingStatus !== null}
          className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loadingStatus === 'ACTIVE' ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
          Duyệt
        </button>
        <button
          type="button"
          onClick={() => setRejecting(true)}
          disabled={loadingStatus !== null}
          className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X size={12} />
          Từ chối
        </button>
      </div>
      {rejecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">Từ chối chiến dịch</h2>
            <p className="mt-1 text-sm text-gray-500">{title || 'Creator sẽ thấy lý do này để sửa và gửi lại.'}</p>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={4}
              className="mt-4 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
              placeholder="Nhập lý do từ chối (bắt buộc)"
            />
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={2}
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
              placeholder="Ghi chú nội bộ (không hiện cho creator)"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="rounded-full border px-4 py-2 text-sm" onClick={() => setRejecting(false)} disabled={loadingStatus !== null}>
                Hủy
              </button>
              <button
                type="button"
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                disabled={loadingStatus !== null || !reason.trim()}
                onClick={() => review('CANCELED', { reason: reason.trim(), reviewerNote: note.trim() || undefined })}
              >
                {loadingStatus === 'CANCELED' ? 'Đang gửi...' : 'Từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
