'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Ban, Unlock } from 'lucide-react';

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
  const nextLocked = !locked;
  const label = locked ? 'Mở khóa' : 'Khóa';

  const run = async () => {
    const confirmText = nextLocked
      ? 'Khóa mục này? Người dùng thường sẽ không còn truy cập hoặc giao dịch được.'
      : 'Mở khóa mục này?';
    if (!confirm(confirmText)) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, locked: nextLocked }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Không thể cập nhật');
      toast.success(nextLocked ? 'Đã khóa' : 'Đã mở khóa');
      onSuccess?.();
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Không thể cập nhật');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={run}
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
  );
}
