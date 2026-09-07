'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Archive, Eye, Search, Star } from 'lucide-react';
import { toast } from 'sonner';
import BlogReviewActions from '@/components/admin/BlogReviewActions';

type Counts = {
  PENDING_REVIEW: number;
  PUBLISHED: number;
  REJECTED: number;
  DRAFT: number;
  SLA_OVERDUE: number;
};

const TYPE_LABELS: Record<string, string> = {
  PLATFORM: 'Nền tảng',
  ANNOUNCEMENT: 'Thông báo',
  STORY: 'Câu chuyện',
  IMPACT_REPORT: 'Tác động',
  CAMPAIGN_UPDATE: 'Cập nhật chiến dịch',
};

export default function AdminBlogPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [counts, setCounts] = useState<Counts>({
    PENDING_REVIEW: 0,
    PUBLISHED: 0,
    REJECTED: 0,
    DRAFT: 0,
    SLA_OVERDUE: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING_REVIEW');
  const [type, setType] = useState('all');
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [rejecting, setRejecting] = useState<{ ids: string[]; title: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const limit = 20;

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login');
    else if (status === 'authenticated') {
      if ((session?.user as any)?.role !== 'ADMIN' && !(session?.user as any)?.isAdmin) {
        router.push('/');
        return;
      }
      fetchPosts();
    }
  }, [status, filter, type, query, page, session]);

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(filter !== 'all' && { status: filter }),
        ...(type !== 'all' && { type }),
        ...(query && { q: query }),
        sort: filter === 'PENDING_REVIEW' ? 'oldest' : 'newest',
      });
      const res = await fetch(`/api/admin/blog/posts?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
        setTotal(data.total || 0);
        if (data.counts) setCounts(data.counts);
        setSelected([]);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulk = async (nextStatus: string, reason?: string, ids = selected) => {
    if (ids.length === 0) return;
    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/blog/posts/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, status: nextStatus, reason }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Không thể cập nhật');
      toast.success(`Đã xử lý ${data.updated || ids.length} bài viết`);
      setRejecting(null);
      setRejectReason('');
      fetchPosts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      setSubmitting(true);
      const res = await fetch(`/api/admin/blog/posts/${id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ARCHIVED', reason: 'Gỡ bài khỏi trang công khai' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Không thể lưu trữ');
      }
      toast.success('Đã gỡ / lưu trữ bài viết');
      fetchPosts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const allSelected = posts.length > 0 && selected.length === posts.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const filters = useMemo(
    () => [
      ['PENDING_REVIEW', `Chờ duyệt (${counts.PENDING_REVIEW})`],
      ['PUBLISHED', 'Đã xuất bản'],
      ['REJECTED', 'Bị từ chối'],
      ['DRAFT', 'Nháp'],
      ['all', 'Tất cả'],
    ],
    [counts]
  );

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-pgreen" />
          <p className="text-gray-600">Đang tải hàng đợi biên tập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-2 text-4xl font-black text-gray-900">Hàng đợi biên tập</h1>
        <p className="mb-8 font-medium text-gray-400">
          Nháp → Chờ duyệt → Xuất bản / Từ chối. Bài quá 24 giờ được đánh dấu SLA.
        </p>
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          <div className="rounded-2xl bg-amber-50 px-4 py-3 text-amber-800">
            <div className="text-xs font-medium uppercase">Chờ duyệt</div>
            <div className="text-2xl font-black">{counts.PENDING_REVIEW}</div>
          </div>
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-red-800">
            <div className="text-xs font-medium uppercase">Quá 24 giờ</div>
            <div className="text-2xl font-black">{counts.SLA_OVERDUE}</div>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-800">
            <div className="text-xs font-medium uppercase">Xuất bản</div>
            <div className="text-2xl font-black">{counts.PUBLISHED}</div>
          </div>
          <div className="rounded-2xl bg-rose-50 px-4 py-3 text-rose-800">
            <div className="text-xs font-medium uppercase">Từ chối</div>
            <div className="text-2xl font-black">{counts.REJECTED}</div>
          </div>
          <div className="rounded-2xl bg-slate-100 px-4 py-3 text-slate-700">
            <div className="text-xs font-medium uppercase">Nháp</div>
            <div className="text-2xl font-black">{counts.DRAFT}</div>
          </div>
        </div>
        <form
          className="mb-4 flex flex-wrap gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setQuery(q.trim());
          }}
        >
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Tìm tiêu đề, slug hoặc tác giả"
              className="w-full rounded-full border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm"
            />
          </div>
          <select
            value={type}
            onChange={(event) => {
              setType(event.target.value);
              setPage(1);
            }}
            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm"
          >
            <option value="all">Mọi loại</option>
            {Object.entries(TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <button type="submit" className="rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white">
            Tìm
          </button>
        </form>
        <div className="mb-4 flex flex-wrap gap-2">
          {filters.map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                setFilter(key);
                setPage(1);
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                filter === key ? 'bg-pgreen text-white' : 'border border-gray-300 bg-white text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {selected.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
            <span className="font-semibold text-amber-900">Đã chọn {selected.length} bài</span>
            <button
              className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white disabled:opacity-50"
              disabled={submitting}
              onClick={() => handleBulk('PUBLISHED')}
            >
              Duyệt hàng loạt
            </button>
            <button
              className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white disabled:opacity-50"
              disabled={submitting}
              onClick={() => setRejecting({ ids: selected, title: `${selected.length} bài đã chọn` })}
            >
              Từ chối hàng loạt
            </button>
            <button className="text-xs text-gray-500" onClick={() => setSelected([])}>Bỏ chọn</button>
          </div>
        )}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(event) => setSelected(event.target.checked ? posts.map((post) => post.id) : [])}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Bài viết</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Tác giả</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Loại</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Trạng thái</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {posts.map((post) => (
                <tr key={post.id} className={post.slaOverdue ? 'bg-red-50/60' : ''}>
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selected.includes(post.id)}
                      onChange={(event) =>
                        setSelected((current) =>
                          event.target.checked ? [...current, post.id] : current.filter((id) => id !== post.id)
                        )
                      }
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                      {post.isFeatured && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
                      {post.title}
                    </div>
                    <div className="text-sm text-gray-500">{post.slug}</div>
                    {post.slaOverdue && (
                      <div className="mt-1 text-xs font-semibold text-red-600">Quá hạn {Math.round(post.slaHours)} giờ</div>
                    )}
                    {post.scheduledAt && new Date(post.scheduledAt).getTime() > Date.now() && (
                      <div className="mt-1 text-xs text-blue-600">
                        Lịch đăng: {new Date(post.scheduledAt).toLocaleString('vi-VN')}
                      </div>
                    )}
                    {post.rejectionReason && <div className="mt-1 text-xs text-red-600">Lý do: {post.rejectionReason}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{post.author?.name || 'Ẩn danh'}</div>
                    <div className="text-sm text-gray-500">{post.author?.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{TYPE_LABELS[post.type] || post.type}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold">{post.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/dashboard/admin/blog/${post.id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600"
                      >
                        <Eye className="h-3.5 w-3.5" /> Xem
                      </Link>
                      {post.status === 'PENDING_REVIEW' && (
                        <BlogReviewActions
                          postId={post.id}
                          featured={post.isFeatured}
                          onDone={fetchPosts}
                          onReject={() => setRejecting({ ids: [post.id], title: post.title })}
                        />
                      )}
                      {post.status === 'PUBLISHED' && (
                        <button
                          onClick={() => handleArchive(post.id)}
                          className="text-gray-500"
                          title="Gỡ bài"
                          disabled={submitting}
                        >
                          <Archive className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {posts.length === 0 && <div className="py-12 text-center text-gray-500">Không có bài viết nào</div>}
        </div>
        {pages > 1 && (
          <div className="mt-4 flex justify-end gap-2 text-sm">
            <button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-full border px-3 py-1 disabled:opacity-40">
              Trước
            </button>
            <span className="px-2 py-1 text-gray-500">Trang {page}/{pages}</span>
            <button disabled={page >= pages} onClick={() => setPage((value) => value + 1)} className="rounded-full border px-3 py-1 disabled:opacity-40">
              Sau
            </button>
          </div>
        )}
      </div>
      {rejecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">Từ chối bài viết</h2>
            <p className="mt-1 text-sm text-gray-500">{rejecting.title}</p>
            <textarea
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              rows={4}
              className="mt-4 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
              placeholder="Nhập lý do để tác giả sửa và gửi duyệt lại"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="rounded-full border px-4 py-2 text-sm" onClick={() => setRejecting(null)} disabled={submitting}>
                Hủy
              </button>
              <button
                type="button"
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                disabled={submitting || !rejectReason.trim()}
                onClick={() => handleBulk('REJECTED', rejectReason.trim(), rejecting.ids)}
              >
                Từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
