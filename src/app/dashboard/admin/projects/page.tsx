'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import AdminLockButton from '@/components/admin/AdminLockButton';

type Project = {
  id: string;
  title: string;
  slug: string | null;
  isLocked: boolean;
  lockReason: string | null;
  updatedAt: string;
  creator: { id: string; name: string | null; email: string | null };
  _count: { campaigns: number; rewards: number };
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [lockedCount, setLockedCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [locked, setLocked] = useState('');

  const load = async (filter = locked, query = q) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter) params.set('locked', filter);
      if (query.trim()) params.set('q', query.trim());
      const res = await fetch(`/api/admin/projects?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Không tải được dự án');
      setProjects(data.projects || []);
      setLockedCount(data.lockedCount || 0);
      setTotal(data.total || 0);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get('locked') === 'true' ? 'true' : '';
    setLocked(initial);
    void load(initial, '');
  }, []);

  const search = (event: FormEvent) => {
    event.preventDefault();
    void load(locked, q);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 px-6 py-12">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin" className="flex h-11 w-11 items-center justify-center rounded-2xl border bg-white">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-gray-900">Khóa dự án</h1>
            <p className="text-sm text-gray-500">Dự án không qua hàng đợi duyệt. Khóa khi vi phạm, có lý do bắt buộc.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => { setLocked(''); void load('', q); }} className={`rounded-2xl border p-4 text-left ${locked === '' ? 'border-gray-900 bg-gray-900 text-white' : 'bg-white'}`}>
            <div className="text-xs uppercase">Tổng số</div>
            <div className="text-2xl font-black">{total}</div>
          </button>
          <button onClick={() => { setLocked('true'); void load('true', q); }} className={`rounded-2xl border p-4 text-left ${locked === 'true' ? 'border-red-700 bg-red-50' : 'bg-white'}`}>
            <div className="text-xs uppercase text-red-600">Đang khóa</div>
            <div className="text-2xl font-black text-red-700">{lockedCount}</div>
          </button>
        </div>
        <form onSubmit={search} className="flex gap-3">
          <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Tìm tên hoặc slug" className="w-full rounded-2xl border px-4 py-3 text-sm" />
          <button className="rounded-2xl bg-gray-900 px-5 py-3 text-sm font-bold text-white">Tìm</button>
        </form>
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-emerald-700" /></div>
        ) : (
          <div className="space-y-3">
            {projects.length === 0 && <div className="rounded-3xl bg-white p-8 text-gray-400">Không có dự án.</div>}
            {projects.map((project) => (
              <div key={project.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-gray-100 bg-white p-5">
                <div>
                  <Link href={`/projects/${project.slug || project.id}`} className="font-black text-gray-900 hover:text-blue-700">{project.title}</Link>
                  <div className="text-xs text-gray-400">
                    {project.creator?.name || 'Ẩn danh'} · {project.creator?.email} · {project._count.campaigns} chiến dịch · {project._count.rewards} sản phẩm
                  </div>
                  {project.lockReason && <div className="mt-1 text-xs text-red-600">Lý do: {project.lockReason}</div>}
                </div>
                <AdminLockButton type="project" id={project.id} locked={project.isLocked} onSuccess={() => load(locked, q)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
