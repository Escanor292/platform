'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AdminBlogReviewPanel({
  postId,
  slug,
  status,
  featured,
  rejectionReason,
  reviewerNote,
  scheduledAt,
}: {
  postId: string;
  slug: string;
  status: string;
  featured: boolean;
  rejectionReason: string;
  reviewerNote: string;
  scheduledAt: string;
}) {
  const router = useRouter();
  const [reason, setReason] = useState('');
  const [note, setNote] = useState(reviewerNote);
  const [schedule, setSchedule] = useState(scheduledAt ? scheduledAt.slice(0, 16) : '');
  const [loading, setLoading] = useState(false);

  const toIso = () => (schedule ? new Date(schedule).toISOString() : null);

  const patch = async (body: Record<string, unknown>, success: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/blog/posts/${postId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Không thể cập nhật');
      toast.success(success);
      router.refresh();
      router.push('/dashboard/admin/blog');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật');
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="h-fit space-y-4 rounded-2xl bg-white p-5 shadow-sm">
      <div>
        <div className="text-xs font-bold uppercase text-gray-400">Trạng thái</div>
        <div className="mt-1 text-lg font-black text-gray-900">{status}</div>
      </div>
      {rejectionReason && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">Lý do từ chối: {rejectionReason}</div>
      )}
      <label className="block text-sm font-medium text-gray-700">
        Ghi chú nội bộ
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
          placeholder="Không hiện cho tác giả"
        />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Lịch xuất bản
        <input
          type="datetime-local"
          value={schedule}
          onChange={(event) => setSchedule(event.target.value)}
          className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
        />
      </label>
      {status === 'PENDING_REVIEW' && (
        <>
          <button
            disabled={loading}
            onClick={() => patch({ status: 'PUBLISHED', reviewerNote: note, scheduledAt: toIso() }, 'Đã duyệt bài viết')}
            className="w-full rounded-full bg-emerald-600 py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            Duyệt và xuất bản
          </button>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
            className="w-full rounded-xl border px-3 py-2 text-sm"
            placeholder="Lý do từ chối (bắt buộc nếu từ chối)"
          />
          <button
            disabled={loading || !reason.trim()}
            onClick={() => patch({ status: 'REJECTED', reason, reviewerNote: note }, 'Đã từ chối bài viết')}
            className="w-full rounded-full bg-red-600 py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            Từ chối
          </button>
        </>
      )}
      <button
        disabled={loading}
        onClick={() => patch({ isFeatured: !featured, reviewerNote: note }, featured ? 'Đã bỏ ghim' : 'Đã ghim nổi bật')}
        className="w-full rounded-full border py-2 text-sm font-semibold"
      >
        {featured ? 'Bỏ ghim nổi bật' : 'Ghim nổi bật'}
      </button>
      {status === 'PUBLISHED' && (
        <button
          disabled={loading}
          onClick={() => patch({ status: 'ARCHIVED', reason: 'Gỡ bài khỏi trang công khai', reviewerNote: note }, 'Đã gỡ bài')}
          className="w-full rounded-full bg-gray-800 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          Gỡ khỏi trang công khai
        </button>
      )}
      <button
        disabled={loading}
        onClick={() => patch({ reviewerNote: note }, 'Đã lưu ghi chú')}
        className="w-full rounded-full border py-2 text-sm"
      >
        Lưu ghi chú
      </button>
      <Link href={`/blog/${slug}`} className="block text-center text-sm font-semibold text-pgreen">
        Xem bản xem trước
      </Link>
    </aside>
  );
}
