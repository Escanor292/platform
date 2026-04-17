"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { 
  Rocket, User, LogOut, UserCircle, PlusCircle, Menu, X, ChevronDown, Settings, ShieldCheck, FolderKanban 
} from "lucide-react";
import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import LeafIcon from "../shared/LeafIcon";

export default function NavbarNew() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const user = session?.user as any;
  const isAdmin = user?.role === "ADMIN" || user?.isAdmin === true;

  const handleLogout = async () => {
    toast.promise(signOut({ redirect: false }), {
      loading: 'Đang xử lý...',
      success: () => {
        router.push('/');
        router.refresh();
        return 'Đăng xuất thành công!';
      },
      error: 'Lỗi đăng xuất',
    });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/30">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer group">
          <div className="w-10 h-10 rounded-xl gradient-green flex items-center justify-center">
            <LeafIcon className="w-6 h-6" />
          </div>
          <span className="font-display font-bold text-xl text-dblue group-hover:text-pgreen transition">
            TửTế Fund
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link 
            href="/" 
            className="text-sm font-medium text-gray-600 hover:text-pgreen transition relative group"
          >
            Trang chủ
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-pgreen group-hover:w-full transition-all duration-300" />
          </Link>
          <Link 
            href="/about" 
            className="text-sm font-medium text-gray-600 hover:text-pgreen transition relative group"
          >
            Giới thiệu
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-pgreen group-hover:w-full transition-all duration-300" />
          </Link>
          <Link 
            href="/projects" 
            className="text-sm font-medium text-gray-600 hover:text-pgreen transition relative group"
          >
            Khám phá
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-pgreen group-hover:w-full transition-all duration-300" />
          </Link>
          <Link 
            href="/users/search" 
            className="text-sm font-medium text-gray-600 hover:text-pgreen transition relative group"
          >
            Cộng đồng
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-pgreen group-hover:w-full transition-all duration-300" />
          </Link>
        </div>

        {/* Auth Actions */}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <>
              <Link 
                href="/campaigns/create"
                className="text-sm font-semibold px-5 py-2.5 rounded-full gradient-green text-white hover:shadow-lg hover:shadow-green-200 transition-all"
              >
                Gây quỹ ngay
              </Link>
              
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded-xl transition focus-ring">
                    <div className="w-9 h-9 rounded-full bg-pgreen/10 border border-pgreen/20 flex items-center justify-center text-pgreen font-bold overflow-hidden">
                      {session.user?.image ? (
                        <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        session.user?.name?.charAt(0) || "U"
                      )}
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
                      <p className="text-sm font-bold text-gray-900 truncate">{session.user?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
                    </div>

                    <DropdownMenu.Item asChild>
                      <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-slate-50 hover:text-pgreen transition cursor-pointer outline-none focus:bg-slate-50">
                        <UserCircle size={16} />
                        Trang cá nhân
                      </Link>
                    </DropdownMenu.Item>

                    <DropdownMenu.Item asChild>
                      <Link href="/dashboard/creator" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-slate-50 hover:text-pgreen transition cursor-pointer outline-none focus:bg-slate-50">
                        <FolderKanban size={16} />
                        Quản lý dự án
                      </Link>
                    </DropdownMenu.Item>

                    <DropdownMenu.Item asChild>
                      <Link href="/profile/edit" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-slate-50 hover:text-pgreen transition cursor-pointer outline-none focus:bg-slate-50">
                        <Settings size={16} />
                        Cài đặt
                      </Link>
                    </DropdownMenu.Item>

                    {isAdmin && (
                      <DropdownMenu.Item asChild>
                        <Link href="/dashboard/admin" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition cursor-pointer outline-none focus:bg-red-50">
                          <ShieldCheck size={16} />
                          Quản trị
                        </Link>
                      </DropdownMenu.Item>
                    )}
                    
                    <DropdownMenu.Item asChild>
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition outline-none focus:bg-red-50 mt-1 cursor-pointer">
                        <LogOut size={16} />
                        Đăng xuất
                      </button>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </>
          ) : (
            <>
              <Link 
                href="/auth/login"
                className="text-sm font-semibold text-pgreen hover:text-dblue transition"
              >
                Đăng nhập
              </Link>
              <Link 
                href="/campaigns/create"
                className="text-sm font-semibold px-5 py-2.5 rounded-full gradient-green text-white hover:shadow-lg hover:shadow-green-200 transition-all"
              >
                Gây quỹ ngay
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 text-gray-900 focus-ring rounded-lg" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden px-6 pb-4 flex flex-col gap-2 bg-white border-t border-gray-100">
          <Link href="/" className="py-2 text-sm font-medium text-gray-600" onClick={() => setIsMenuOpen(false)}>
            Trang chủ
          </Link>
          <Link href="/about" className="py-2 text-sm font-medium text-gray-600" onClick={() => setIsMenuOpen(false)}>
            Giới thiệu
          </Link>
          <Link href="/projects" className="py-2 text-sm font-medium text-gray-600" onClick={() => setIsMenuOpen(false)}>
            Khám phá
          </Link>
          <Link href="/users/search" className="py-2 text-sm font-medium text-gray-600" onClick={() => setIsMenuOpen(false)}>
            Cộng đồng
          </Link>
          
          {session ? (
            <>
              <Link 
                href="/campaigns/create"
                className="mt-2 py-3 text-center rounded-xl gradient-green text-white font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                Gây quỹ ngay
              </Link>
              <button 
                onClick={handleLogout}
                className="py-2 text-sm font-medium text-red-600 text-left"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/auth/login"
                className="py-2 text-sm font-medium text-pgreen"
                onClick={() => setIsMenuOpen(false)}
              >
                Đăng nhập
              </Link>
              <Link 
                href="/campaigns/create"
                className="mt-2 py-3 text-center rounded-xl gradient-green text-white font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                Gây quỹ ngay
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
