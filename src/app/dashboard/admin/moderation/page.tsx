'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import AdminLockButton from '@/components/admin/AdminLockButton';

type SearchPayload = {
  users: Array<{ id: string; name: string; email: string; role: string; status: string }>;
  campaigns: Array<{ id: string; title: string; slug: string; status: string; campaignCode: string }>;
  projects: Array<{ id: string; title: string; slug: string | null; isLocked: boolean }>;
  products: Array<{ id: string; title: string; isActive: boolean }>;
};

type Word = { id: string; value: string; reason: string; isActive: boolean };

export default function AdminModerationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchPayload | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [wordValue, setWordValue] = useState('');
  const [wordReason, setWordReason] = useState('Từ ngữ không phù hợp');

  const isAdmin = (session?.user as any)?.role === 'ADMIN' || (session?.user as any)?.isAdmin === true;

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login');
    if (status === 'authenticated' && !isAdmin) router.push('/');
  }, [status, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin) return;
    fetch('/api/admin/moderation/words')
      .then((res) => res.json())
      .then((data) => setWords(data.words || []))
      .catch(() => {});
  }, [isAdmin]);

  const search = async (event?: FormEvent) => {
    event?.preventDefault();
    if (q.trim().length < 2) {
      toast.error('Nhập ít nhất 2 ký tự');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Không tìm được');
      setResults(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addWord = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const res = await fetch('/api/admin/moderation/words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: wordValue, reason: wordReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Không thể thêm');
      setWords((current) => [data.word, ...current.filter((item) => item.id !== data.word.id)]);
      setWordValue('');
      toast.success('Đã thêm từ cấm');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const removeWord = async (id: string) => {
    if (!confirm('Xóa từ này khỏi danh sách cấm?')) return;
    const res = await fetch(`/api/admin/moderation/words?id=${id}`, { method: 'DELETE' });
    if (!res.ok) {
      toast.error('Không thể xóa');
      return;
    }
    setWords((current) => current.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50/50 px-6 py-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-600">
            <ShieldAlert size={12} /> Kiểm duyệt
          </div>
          <h1 className="text-4xl font-black text-gray-900">Tìm kiếm và khóa nội dung</h1>
          <p className="mt-2 text-gray-500">Tìm chiến dịch, dự án, sản phẩm, tài khoản rồi khóa khi vi phạm. Quản lý từ bị cấm tại đây.</p>
        </div>

        <form onSubmit={search} className="flex flex-col gap-3 rounded-[2rem] border border-gray-100 bg-white p-5 shadow-sm sm:flex-row">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Tìm theo tên, email, mã chiến dịch, sản phẩm, dự án..."
              className="w-full rounded-2xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-gray-400"
            />
          </div>
          <button type="submit" disabled={loading} className="rounded-2xl bg-gray-900 px-6 py-3 text-sm font-bold text-white disabled:opacity-50">
            {loading ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
        </form>

        {results && (
          <div className="grid gap-6 lg:grid-cols-2">
            <ResultCard title="Tài khoản" empty={results.users.length === 0}>
              {results.users.map((user) => (
                <Row key={user.id} href={`/profile/${user.id}`} title={user.name || 'Chưa đặt tên'} meta={`${user.email} · ${user.role} · ${user.status}`}>
                  <AdminLockButton type="user" id={user.id} locked={user.status === 'BANNED'} onSuccess={() => search()} />
                </Row>
              ))}
            </ResultCard>
            <ResultCard title="Chiến dịch" empty={results.campaigns.length === 0}>
              {results.campaigns.map((item) => (
                <Row key={item.id} href={`/campaigns/${item.slug}`} title={item.title} meta={`${item.campaignCode} · ${item.status}`}>
                  <AdminLockButton type="campaign" id={item.id} locked={item.status === 'CANCELED'} onSuccess={() => search()} />
                </Row>
              ))}
            </ResultCard>
            <ResultCard title="Dự án" empty={results.projects.length === 0}>
              {results.projects.map((item) => (
                <Row key={item.id} href={`/projects/${item.slug || item.id}`} title={item.title} meta={item.isLocked ? 'Đã khóa' : 'Đang mở'}>
                  <AdminLockButton type="project" id={item.id} locked={item.isLocked} onSuccess={() => search()} />
                </Row>
              ))}
            </ResultCard>
            <ResultCard title="Sản phẩm" empty={results.products.length === 0}>
              {results.products.map((item) => (
                <Row key={item.id} href={`/products/${item.id}`} title={item.title} meta={item.isActive ? 'Đang bán' : 'Đã khóa'}>
                  <AdminLockButton type="product" id={item.id} locked={!item.isActive} onSuccess={() => search()} />
                </Row>
              ))}
            </ResultCard>
          </div>
        )}

        <section className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-gray-900">Từ bị cấm</h2>
          <p className="mt-1 text-sm text-gray-500">Áp dụng khi tạo chiến dịch, dự án, bài viết và sản phẩm.</p>
          <form onSubmit={addWord} className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <input value={wordValue} onChange={(event) => setWordValue(event.target.value)} placeholder="Từ hoặc cụm từ cấm" className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none" />
            <input value={wordReason} onChange={(event) => setWordReason(event.target.value)} placeholder="Lý do" className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none" />
            <button type="submit" className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white">Thêm</button>
          </form>
          <div className="mt-5 divide-y divide-gray-100">
            {words.length === 0 ? (
              <p className="py-6 text-sm text-gray-400">Chưa có từ cấm. Thêm từ để hệ thống chặn khi đăng nội dung.</p>
            ) : words.map((word) => (
              <div key={word.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-bold text-gray-900">{word.value}</div>
                  <div className="text-xs text-gray-400">{word.reason}</div>
                </div>
                <button type="button" onClick={() => removeWord(word.id)} className="text-xs font-bold text-red-600 hover:underline">Xóa</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function ResultCard({ title, empty, children }: { title: string; empty: boolean; children: React.ReactNode }) {
  return (
    <div className="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-lg font-black text-gray-900">{title}</h3>
      {empty ? <p className="text-sm text-gray-400">Không có kết quả</p> : <div className="space-y-2">{children}</div>}
    </div>
  );
}

function Row({ href, title, meta, children }: { href: string; title: string; meta: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-gray-50 px-3 py-3">
      <Link href={href} className="min-w-0 flex-1 hover:text-blue-700">
        <div className="truncate font-bold text-gray-900">{title}</div>
        <div className="truncate text-xs text-gray-400">{meta}</div>
      </Link>
      {children}
    </div>
  );
}
