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

export default function Navbar() {
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
    <nav className="sticky top-0 md:top-4 z-50 max-w-7xl mx-auto w-full px-0 md:px-6 transition-all duration-300">
      <div className="bg-white/70 backdrop-blur-xl md:rounded-[2rem] border-b md:border border-white/40 shadow-soft md:shadow-premium px-6 h-18 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group focus-ring rounded-xl p-1">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-[10px] flex items-center justify-center text-white shadow-sm group-hover:rotate-6 transition-transform">
             <Rocket size={20} />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-gray-900">crowdfund<span className="text-blue-600">.vn</span></span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/campaigns" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition focus-ring rounded-md px-2 py-1">Khám phá</Link>
          <Link href="/users/search" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition focus-ring rounded-md px-2 py-1">Cộng đồng</Link>
          <Link href="/lookup" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition focus-ring rounded-md px-2 py-1">Tra cứu GD</Link>
        </div>

        {/* Auth Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/campaigns/create" className="px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-blue-600 transition flex items-center gap-2 shadow-sm focus-ring">
            <PlusCircle size={18} />
            Khởi tạo
          </Link>

          {session ? (
            <div className="pl-4 border-l border-gray-200">
               <DropdownMenu.Root>
                 <DropdownMenu.Trigger asChild>
                   <button className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded-xl transition focus-ring">
                      <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
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
                         <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition cursor-pointer outline-none focus:bg-slate-50">
                            <UserCircle size={16} />
                            Trang cá nhân
                         </Link>
                      </DropdownMenu.Item>

                      <DropdownMenu.Item asChild>
                         <Link href="/dashboard/creator" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition cursor-pointer outline-none focus:bg-slate-50">
                            <FolderKanban size={16} />
                            Quản lý dự án
                         </Link>
                      </DropdownMenu.Item>

                      <DropdownMenu.Item asChild>
                         <Link href="/profile/edit" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition cursor-pointer outline-none focus:bg-slate-50">
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
            </div>
          ) : (
            <Link href="/auth/login" className="px-5 py-2.5 bg-gray-100 text-gray-900 text-sm font-bold rounded-xl hover:bg-gray-200 transition focus-ring">
              Đăng nhập
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2 text-gray-900 focus-ring rounded-lg border border-transparent hover:border-gray-200" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-18 left-0 w-full bg-white border-b border-gray-100 px-6 py-8 flex flex-col gap-6 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <Link href="/campaigns" className="text-lg font-bold text-gray-900" onClick={() => setIsMenuOpen(false)}>Khám phá</Link>
          <Link href="/users/search" className="text-lg font-bold text-gray-900" onClick={() => setIsMenuOpen(false)}>Cộng đồng</Link>
          <Link href="/lookup" className="text-lg font-bold text-gray-900" onClick={() => setIsMenuOpen(false)}>Tra cứu GD</Link>
          <Link href="/campaigns/create" className="w-full py-4 bg-gray-900 text-white rounded-xl text-center font-bold" onClick={() => setIsMenuOpen(false)}>Tạo dự án mới</Link>
          <div className="h-px bg-gray-100 my-2" />
          {session ? (
             <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                       {session.user?.image ? (
                          <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                       ) : (
                          session.user?.name?.charAt(0) || "U"
                       )}
                   </div>
                   <div>
                      <p className="font-bold text-gray-900">{session.user?.name}</p>
                      <p className="text-xs text-gray-400">{session.user?.email}</p>
                   </div>
                </div>
                <Link href="/dashboard" className="flex items-center gap-2 text-lg font-bold text-gray-900" onClick={() => setIsMenuOpen(false)}>
                   <UserCircle size={20} /> Trang cá nhân
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2 text-lg font-bold text-red-500 text-left">
                   <LogOut size={20} /> Đăng xuất
                </button>
             </div>
          ) : (
             <Link href="/auth/login" className="w-full py-4 bg-gray-100 text-gray-900 rounded-xl text-center font-bold" onClick={() => setIsMenuOpen(false)}>Đăng nhập</Link>
          )}
        </div>
      )}
    </nav>
  );
}
