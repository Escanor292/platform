"use client";

import Link from 'next/link';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  payload?: { href?: string };
  isRead: boolean;
  createdAt: string;
}

function relativeTime(value: string) {
  const diff = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
}

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications?limit=30', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // Notification UI should never block the rest of the navbar.
    }
  }, []);

  useEffect(() => {
    load();
    const interval = window.setInterval(load, 30000);
    return () => window.clearInterval(interval);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const markRead = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notification.id }),
      });
      setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, isRead: true } : item));
      setUnreadCount((count) => Math.max(0, count - 1));
    }
    const href = notification.payload?.href;
    if (href) {
      setOpen(false);
      router.push(href);
    }
  };

  const markAllRead = async () => {
    if (unreadCount === 0) return;
    setLoading(true);
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    });
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
    setLoading(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative rounded-xl p-2 text-gray-600 transition hover:bg-gray-50 hover:text-pgreen"
        title="Thông báo"
        aria-label="Mở thông báo"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-red-500 px-1 text-center text-[10px] font-bold leading-4 text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[360px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div>
              <h3 className="font-bold text-gray-900">Thông báo</h3>
              <p className="text-xs text-gray-500">Cập nhật dành riêng cho bạn</p>
            </div>
            <button type="button" onClick={markAllRead} disabled={loading || unreadCount === 0} className="inline-flex items-center gap-1 text-xs font-semibold text-pgreen disabled:opacity-40">
              {loading ? <Loader2 size={13} className="animate-spin" /> : <CheckCheck size={13} />}
              Đọc tất cả
            </button>
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-gray-500">Bạn chưa có thông báo mới.</div>
            ) : notifications.map((notification) => (
              <button key={notification.id} type="button" onClick={() => markRead(notification)} className={`w-full border-b border-gray-50 px-4 py-3 text-left transition hover:bg-emerald-50/50 ${notification.isRead ? 'bg-white' : 'bg-emerald-50/60'}`}>
                <div className="flex gap-3">
                  <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${notification.isRead ? 'bg-gray-200' : 'bg-emerald-500'}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-gray-900">{notification.title}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-gray-600">{notification.message}</span>
                    <span className="mt-1 block text-[11px] text-gray-400">{relativeTime(notification.createdAt)}</span>
                  </span>
                </div>
              </button>
            ))}
          </div>
          <Link href="/notifications" onClick={() => setOpen(false)} className="block border-t border-gray-100 px-4 py-3 text-center text-sm font-semibold text-pgreen hover:bg-gray-50">
            Xem tất cả thông báo
          </Link>
        </div>
      )}
    </div>
  );
}
