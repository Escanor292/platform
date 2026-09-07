'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, ShieldCheck, Award, DollarSign, FileText, Flag, ShieldAlert, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard/admin', label: 'Tổng quan', icon: Home, exact: true },
  { href: '/dashboard/admin/users', label: 'Người dùng', icon: Users },
  { href: '/dashboard/admin/campaigns', label: 'Chiến dịch', icon: ShieldCheck },
  { href: '/dashboard/admin/blog', label: 'Blog', icon: FileText },
  { href: '/dashboard/admin/badges', label: 'Huy hiệu', icon: Award },
  { href: '/dashboard/admin/revenue', label: 'Doanh thu', icon: DollarSign },
  { href: '/dashboard/admin/reports', label: 'Báo cáo', icon: Flag },
  { href: '/dashboard/admin/moderation', label: 'Kiểm duyệt', icon: ShieldAlert },
  { href: '/dashboard/admin/system', label: 'Hệ thống', icon: Settings },
] as const;

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="hidden items-center gap-1 overflow-x-auto md:flex">
      {NAV_ITEMS.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-bold transition ${
              active
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <item.icon size={16} />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
