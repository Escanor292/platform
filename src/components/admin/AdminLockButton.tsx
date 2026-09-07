'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Ban, Unlock } from 'lucide-react';
import { lockLabel } from '@/lib/moderation/policy';

type LockType = 'user' | 'campaign' | 'project' | 'product';

export default function AdminLockButton({
  type,
  id,
  locked,
  onSuccess,
}: {
  type: LockType;
  id: string;
  locked: boolean;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const nextLocked = !locked;
  const label = lockLabel(type, locked);

  const run = async (lockReason?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, locked: nextLocked, reason: lockReason || '' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Không thể cập nhật');
      toast.success(nextLocked ? 'Đã khóa / ẩn nội dung' : 'Đã mở lại');
      setOpen(false);
      setReason('');
      onSuccess?.();
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Không thể cập nhật');
    } finally {
      setLoading(false);
    }
  };

  const onClick = () => {
    if (nextLocked) {
      setOpen(true);
      return;
    }
    if (!confirm(`${label}?`)) return;
    void run();
  };

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold disabled:opacity-50 ${
          locked
            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            : 'bg-red-50 text-red-700 hover:bg-red-100'
        }`}
      >
        {locked ? <Unlock size={12} /> : <Ban size={12} />}
        {loading ? '...' : label}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">{label}</h2>
            <p className="mt-1 text-sm text-gray-500">Chủ nội dung sẽ nhận thông báo kèm lý do này.</p>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={4}
              className="mt-4 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
              placeholder="Nhập lý do (bắt buộc)"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="rounded-full border px-4 py-2 text-sm" onClick={() => setOpen(false)} disabled={loading}>
                Hủy
              </button>
              <button
                type="button"
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                disabled={loading || !reason.trim()}
                onClick={() => run(reason.trim())}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
