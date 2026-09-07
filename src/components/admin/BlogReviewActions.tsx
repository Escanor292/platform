'use client';

import { useState } from 'react';
import { Check, Loader2, Star, X } from 'lucide-react';
import { toast } from 'sonner';

interface BlogReviewActionsProps {
  postId: string;
  featured?: boolean;
  onDone?: () => void;
  onReject?: () => void;
}

export default function BlogReviewActions({ postId, featured, onDone, onReject }: BlogReviewActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const patch = async (body: Record<string, unknown>, success: string) => {
    setLoading(String(body.status || body.isFeatured));
    try {
      const response = await fetch(`/api/admin/blog/posts/${postId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Không thể cập nhật');
      toast.success(success);
      onDone?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => patch({ status: 'PUBLISHED' }, 'Đã duyệt bài viết')}
        disabled={loading !== null}
        className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading === 'PUBLISHED' ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
        Duyệt
      </button>
      <button
        type="button"
        onClick={() => onReject?.()}
        disabled={loading !== null}
        className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <X size={12} />
        Từ chối
      </button>
      <button
        type="button"
        onClick={() => patch({ isFeatured: !featured }, featured ? 'Đã bỏ ghim' : 'Đã ghim bài nổi bật')}
        disabled={loading !== null}
        className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition disabled:opacity-50 ${
          featured ? 'bg-amber-100 text-amber-800' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
        }`}
        title="Ghim nổi bật"
      >
        <Star size={12} className={featured ? 'fill-current' : ''} />
      </button>
    </div>
  );
}
