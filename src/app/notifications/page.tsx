"use client";

import Link from 'next/link';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NOTIFICATION_CATALOG } from '@/lib/notifications/catalog';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  payload?: { href?: string };
}

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const load = async () => {
    const response = await fetch('/api/notifications?limit=50', { cache: 'no-store' });
    if (response.ok) setItems((await response.json()).notifications || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const markAll = async () => {
    setMarking(true);
    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ all: true }) });
    setItems((current) => current.map((item) => ({ ...item, isRead: true })));
    setMarking(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-24">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
            <div className="flex items-center gap-3"><Bell className="text-pgreen" /><div><h1 className="text-2xl font-black text-gray-900">Thông báo của tôi</h1><p className="text-sm text-gray-500">Các cập nhật dành riêng cho tài khoản của bạn.</p></div></div>
            <button type="button" onClick={markAll} disabled={marking} className="inline-flex items-center gap-1 text-sm font-semibold text-pgreen disabled:opacity-50">{marking ? <Loader2 size={15} className="animate-spin" /> : <CheckCheck size={15} />} Đọc tất cả</button>
          </div>
          {loading ? <div className="px-6 py-12 text-center text-sm text-gray-500">Đang tải thông báo...</div> : items.length === 0 ? <div className="px-6 py-12 text-center text-sm text-gray-500">Bạn chưa có thông báo.</div> : <div>{items.map((item) => <Link key={item.id} href={item.payload?.href || '#'} className={`block border-b border-gray-50 px-6 py-4 transition hover:bg-emerald-50/50 ${item.isRead ? 'bg-white' : 'bg-emerald-50/60'}`}><div className="flex gap-3"><span className={`mt-2 h-2 w-2 rounded-full ${item.isRead ? 'bg-gray-200' : 'bg-emerald-500'}`} /><span><h2 className="font-semibold text-gray-900">{item.title}</h2><p className="mt-1 text-sm text-gray-600">{item.message}</p><time className="mt-1 block text-xs text-gray-400">{new Date(item.createdAt).toLocaleString('vi-VN')}</time></span></div></Link>)}</div>}
        </section>

        <aside className="h-fit rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Các loại thông báo</h2>
          <p className="mt-1 text-sm text-gray-500">Nền tảng sẽ thông báo khi các sự kiện sau xảy ra.</p>
          <div className="mt-4 space-y-3">{NOTIFICATION_CATALOG.map((item) => <div key={item.type} className="rounded-2xl bg-slate-50 p-3"><div className="text-sm font-semibold text-gray-900">{item.label}</div><div className="mt-1 text-xs leading-5 text-gray-500">{item.description}</div></div>)}</div>
        </aside>
      </div>
    </main>
  );
}
