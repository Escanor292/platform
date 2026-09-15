'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  Home, Users, ShieldCheck, Award, DollarSign, FileText, Flag, ShieldAlert, Settings, UserCheck, FolderKanban, Package, KeyRound, LayoutTemplate,
} from 'lucide-react';

type NavItem = { href: string; label: string; icon: LucideIcon; exact?: boolean };

const BASE_NAV: NavItem[] = [
  { href: '/dashboard/admin', label: 'Tổng quan', icon: Home, exact: true },
  { href: '/dashboard/admin/users', label: 'Người dùng', icon: Users },
  { href: '/dashboard/admin/campaigns', label: 'Chiến dịch', icon: ShieldCheck },
  { href: '/dashboard/admin/blog', label: 'Blog', icon: FileText },
  { href: '/dashboard/admin/kyc', label: 'KYC', icon: UserCheck },
  { href: '/dashboard/admin/projects', label: 'Dự án', icon: FolderKanban },
  { href: '/dashboard/admin/products', label: 'Sản phẩm', icon: Package },
  { href: '/dashboard/admin/badges', label: 'Huy hiệu', icon: Award },
  { href: '/dashboard/admin/revenue', label: 'Doanh thu', icon: DollarSign },
  { href: '/dashboard/admin/reports', label: 'Báo cáo', icon: Flag },
  { href: '/dashboard/admin/moderation', label: 'Kiểm duyệt', icon: ShieldAlert },
  { href: '/dashboard/admin/permissions', label: 'Phân quyền', icon: KeyRound },
  { href: '/dashboard/admin/templates', label: 'Mẫu giao diện', icon: LayoutTemplate },
  { href: '/dashboard/admin/system', label: 'Hệ thống', icon: Settings },
];

export default function AdminNav() {
  const pathname = usePathname();
  const items = BASE_NAV;

  return (
    <div className="-mx-3 flex items-center gap-1 overflow-x-auto px-3 pb-1 md:mx-0 md:px-0 md:pb-0">
      {items.map((item) => {
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
