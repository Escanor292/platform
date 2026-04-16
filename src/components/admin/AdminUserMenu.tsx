"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, UserCircle, Settings, LogOut, Home } from "lucide-react";
import { toast } from "sonner";

interface AdminUserMenuProps {
  user: any;
}

export default function AdminUserMenu({ user }: AdminUserMenuProps) {
  const router = useRouter();

  const handleLogout = async () => {
    toast.promise(signOut({ redirect: false }), {
      loading: 'Đang đăng xuất...',
      success: () => {
        router.push('/');
        router.refresh();
        return 'Đăng xuất thành công!';
      },
      error: 'Lỗi đăng xuất',
    });
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-xl transition focus-ring">
          <div className="text-right">
            <div className="text-sm font-bold text-gray-900">{user.name}</div>
            <div className="text-xs text-red-600 font-bold">Administrator</div>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
            {user.name?.[0]?.toUpperCase() || "A"}
          </div>
          <ChevronDown size={16} className="text-gray-400" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="w-56 bg-white rounded-2xl shadow-premium border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="px-3 py-2 border-b border-gray-50 mb-2">
            <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>

          <DropdownMenu.Item asChild>
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition cursor-pointer outline-none focus:bg-slate-50"
            >
              <Home size={16} />
              Về trang chủ
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition cursor-pointer outline-none focus:bg-slate-50"
            >
              <UserCircle size={16} />
              Trang cá nhân
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild>
            <Link
              href="/profile/edit"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition cursor-pointer outline-none focus:bg-slate-50"
            >
              <Settings size={16} />
              Cài đặt
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition outline-none focus:bg-red-50 mt-1 cursor-pointer"
            >
              <LogOut size={16} />
              Đăng xuất
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
