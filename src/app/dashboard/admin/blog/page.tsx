'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, Check, X, Archive } from 'lucide-react';

type Counts = { PENDING_REVIEW: number; PUBLISHED: number; REJECTED: number; DRAFT: number };

export default function AdminBlogPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [counts, setCounts] = useState<Counts>({ PENDING_REVIEW: 0, PUBLISHED: 0, REJECTED: 0, DRAFT: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING_REVIEW');
  const [rejecting, setRejecting] = useState<{ id: string; title: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login');
    else if (status === 'authenticated') {
      if ((session?.user as any)?.role !== 'ADMIN' && !(session?.user as any)?.isAdmin) {
        router.push('/');
        return;
      }
      fetchPosts();
    }
  }, [status, filter, session]);

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams({ ...(filter !== 'all' && { status: filter }) });
      const res = await fetch(`/api/admin/blog/posts?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
        if (data.counts) setCounts(data.counts);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id: string, nextStatus: string, reason?: string) => {
    try {
      setSubmitting(true);
      const res = await fetch(`/api/admin/blog/posts/${id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, reason }),
      });
      if (res.ok) {
        setRejecting(null);
        setRejectReason('');
        fetchPosts();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Khong the cap nhat trang thai');
      }
    } catch (error) {
      alert('Co loi xay ra');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pgreen mx-auto mb-4" />
          <p className="text-gray-600">Dang tai...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-2 text-4xl font-black text-gray-900">Quan ly Blog</h1>
        <p className="mb-8 font-medium text-gray-400">DRAFT to PENDING_REVIEW to PUBLISHED / REJECTED</p>
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-2xl bg-amber-50 px-4 py-3 text-amber-800"><div className="text-xs font-medium uppercase">Cho duyet</div><div className="text-2xl font-black">{counts.PENDING_REVIEW}</div></div>
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-800"><div className="text-xs font-medium uppercase">Xuat ban</div><div className="text-2xl font-black">{counts.PUBLISHED}</div></div>
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-red-800"><div className="text-xs font-medium uppercase">Tu choi</div><div className="text-2xl font-black">{counts.REJECTED}</div></div>
          <div className="rounded-2xl bg-slate-100 px-4 py-3 text-slate-700"><div className="text-xs font-medium uppercase">Nhap</div><div className="text-2xl font-black">{counts.DRAFT}</div></div>
        </div>
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            ['PENDING_REVIEW', `Cho duyet (${counts.PENDING_REVIEW})`],
            ['PUBLISHED', 'Da xuat ban'],
            ['REJECTED', 'Bi tu choi'],
            ['DRAFT', 'Nhap'],
            ['all', 'Tat ca'],
          ].map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)} className={`rounded-full px-4 py-2 text-sm font-medium ${filter === key ? 'bg-pgreen text-white' : 'bg-white text-gray-700 border border-gray-300'}`}>{label}</button>
          ))}
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bai viet</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tac gia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loai</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trang thai</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hanh dong</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{post.title}</div>
                    <div className="text-sm text-gray-500">{post.slug}</div>
                    {post.rejectionReason && <div className="mt-1 text-xs text-red-600">Ly do: {post.rejectionReason}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{post.author?.name || 'An danh'}</div>
                    <div className="text-sm text-gray-500">{post.author?.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{post.type}</td>
                  <td className="px-6 py-4"><span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold">{post.status}</span></td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Link href={`/blog/${post.slug}`} className="text-emerald-600" title="Xem"><Eye className="w-5 h-5" /></Link>
                      {post.status === 'PENDING_REVIEW' && (
                        <>
                          <button onClick={() => handleReview(post.id, 'PUBLISHED')} className="text-green-600" title="Duyet" disabled={submitting}><Check className="w-5 h-5" /></button>
                          <button onClick={() => { setRejecting({ id: post.id, title: post.title }); setRejectReason(''); }} className="text-red-600" title="Tu choi" disabled={submitting}><X className="w-5 h-5" /></button>
                        </>
                      )}
                      <button onClick={() => handleReview(post.id, 'ARCHIVED')} className="text-gray-600" title="Luu tru" disabled={submitting}><Archive className="w-5 h-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {posts.length === 0 && <div className="text-center py-12 text-gray-500">Khong co bai viet nao</div>}
        </div>
      </div>
      {rejecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">Tu choi bai viet</h2>
            <p className="mt-1 text-sm text-gray-500">{rejecting.title}</p>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={4} className="mt-4 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" placeholder="Nhap ly do de tac gia sua va gui duyet lai" />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="rounded-full border px-4 py-2 text-sm" onClick={() => setRejecting(null)} disabled={submitting}>Huy</button>
              <button type="button" className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={submitting || !rejectReason.trim()} onClick={() => handleReview(rejecting.id, 'REJECTED', rejectReason.trim())}>Tu choi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
