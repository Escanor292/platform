'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import AdminLockButton from '@/components/admin/AdminLockButton';

type Product = {
  id: string;
  title: string;
  isActive: boolean;
  hideReason: string | null;
  campaign: { id: string; title: string; slug: string } | null;
  project: { id: string; title: string; slug: string | null } | null;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [hiddenCount, setHiddenCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [hidden, setHidden] = useState('');

  const load = async (filter = hidden, query = q) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter) params.set('hidden', filter);
      if (query.trim()) params.set('q', query.trim());
      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Không tải được sản phẩm');
      setProducts(data.products || []);
      setHiddenCount(data.hiddenCount || 0);
      setTotal(data.total || 0);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get('hidden') === 'true' ? 'true' : '';
    setHidden(initial);
    void load(initial, '');
  }, []);

  const search = (event: FormEvent) => {
    event.preventDefault();
    void load(hidden, q);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 px-6 py-12">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin" className="flex h-11 w-11 items-center justify-center rounded-2xl border bg-white">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-gray-900">Ẩn sản phẩm</h1>
            <p className="text-sm text-gray-500">Sản phẩm không qua hàng đợi duyệt. Ẩn khi vi phạm, có lý do bắt buộc.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => { setHidden(''); void load('', q); }} className={`rounded-2xl border p-4 text-left ${hidden === '' ? 'border-gray-900 bg-gray-900 text-white' : 'bg-white'}`}>
            <div className="text-xs uppercase">Tổng số</div>
            <div className="text-2xl font-black">{total}</div>
          </button>
          <button onClick={() => { setHidden('true'); void load('true', q); }} className={`rounded-2xl border p-4 text-left ${hidden === 'true' ? 'border-red-700 bg-red-50' : 'bg-white'}`}>
            <div className="text-xs uppercase text-red-600">Đang ẩn</div>
            <div className="text-2xl font-black text-red-700">{hiddenCount}</div>
          </button>
        </div>
        <form onSubmit={search} className="flex gap-3">
          <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Tìm tên sản phẩm" className="w-full rounded-2xl border px-4 py-3 text-sm" />
          <button className="rounded-2xl bg-gray-900 px-5 py-3 text-sm font-bold text-white">Tìm</button>
        </form>
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-emerald-700" /></div>
        ) : (
          <div className="space-y-3">
            {products.length === 0 && <div className="rounded-3xl bg-white p-8 text-gray-400">Không có sản phẩm.</div>}
            {products.map((product) => (
              <div key={product.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-gray-100 bg-white p-5">
                <div>
                  <Link href={`/products/${product.id}`} className="font-black text-gray-900 hover:text-blue-700">{product.title}</Link>
                  <div className="text-xs text-gray-400">
                    {product.campaign ? `Chiến dịch: ${product.campaign.title}` : product.project ? `Dự án: ${product.project.title}` : 'Độc lập'}
                  </div>
                  {product.hideReason && <div className="mt-1 text-xs text-red-600">Lý do: {product.hideReason}</div>}
                </div>
                <AdminLockButton type="product" id={product.id} locked={!product.isActive} onSuccess={() => load(hidden, q)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
