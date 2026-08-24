"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Rocket, User, LogOut, UserCircle, PlusCircle, Menu, X, ChevronDown, Settings, ShieldCheck, FolderKanban, HeartHandshake, MessageCircle, PackageOpen
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import LeafIcon from "../shared/LeafIcon";
import { ChatNotificationBadge } from "@/components/chat/ChatNotificationBadge";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { CartDropdown } from "@/components/products/CartProvider";

export default function NavbarNew() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const user = session?.user as any;
  const isAdmin = user?.role === "ADMIN" || user?.isAdmin === true;

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        triggerRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  const clearCloseTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const setCloseTimeout = () => {
    clearCloseTimeout();
    timeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 100);
  };

  const handleTriggerMouseEnter = () => {
    clearCloseTimeout();
    setIsDropdownOpen(true);
  };

  const handleTriggerMouseLeave = () => {
    setCloseTimeout();
  };

  const handleDropdownMouseEnter = () => {
    clearCloseTimeout();
  };

  const handleDropdownMouseLeave = () => {
    setCloseTimeout();
  };

  const handleTriggerClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = async () => {
    setIsDropdownOpen(false);
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
    <nav className="sticky top-0 z-50 glass border-b border-white/30 transition-colors duration-300" style={{ backgroundColor: "color-mix(in srgb, var(--profile-shell-primary, #2E8B57) 7%, var(--profile-shell-surface, #ffffff) 93%)", borderColor: "color-mix(in srgb, var(--profile-shell-primary, #2E8B57) 18%, transparent)", boxShadow: "0 6px 24px color-mix(in srgb, var(--profile-shell-primary, #2E8B57) 9%, transparent)" }}>
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
            href="/gioi-thieu"
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
            href="/blog"
            className="text-sm font-medium text-gray-600 hover:text-pgreen transition relative group"
          >
            Blog
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-pgreen group-hover:w-full transition-all duration-300" />
          </Link>
          <Link
            href="/users/search"
            className="text-sm font-medium text-gray-600 hover:text-pgreen transition relative group"
          >
            Người dùng
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-pgreen group-hover:w-full transition-all duration-300" />
          </Link>
        </div>

        {/* Auth Actions */}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <>
              {/* Giỏ hàng */}
              <CartDropdown />

              {/* Personal notifications */}
              <NotificationBell />

              {/* Chat Link */}
              <Link
                href="/chat"
                className="relative p-2 text-gray-600 hover:text-pgreen hover:bg-gray-50 rounded-xl transition"
                title="Tin nhắn"
              >
                <MessageCircle size={20} />
                <ChatNotificationBadge />
              </Link>

              {/* Chỉ hiển thị nút "Gây quỹ ngay" cho CREATOR và ADMIN */}
              {(user?.role === "CREATOR" || user?.role === "ADMIN" || isAdmin) && (
                <Link
                  href="/campaigns/create"
                  className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-green-200" style={{ background: "var(--profile-gradient, linear-gradient(135deg, #2E8B57, #6BCB77))" }}
                >
                  Gây quỹ ngay
                </Link>
              )}

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  ref={triggerRef}
                  onClick={handleTriggerClick}
                  aria-label="Mở menu tài khoản"
                  className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded-xl transition focus-ring"
                >
                  <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border font-bold" style={{ backgroundColor: "color-mix(in srgb, var(--profile-shell-primary, #2E8B57) 10%, transparent)", borderColor: "color-mix(in srgb, var(--profile-shell-primary, #2E8B57) 22%, transparent)", color: "var(--profile-shell-primary, #2E8B57)" }}>
                    {session.user?.image ? (
                      <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      session.user?.name?.charAt(0) || "U"
                    )}
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div
                    ref={dropdownRef}
                    className="absolute right-0 top-full mt-1 w-56 bg-white rounded-2xl shadow-premium border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-200"
                  >
                    {/* User Info */}
                    <div className="px-3 py-2 border-b border-gray-50 mb-2">
                      <p className="text-sm font-bold text-gray-900 truncate">{session.user?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
                    </div>

                    {/* Menu Items */}
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-slate-50 hover:text-pgreen transition cursor-pointer outline-none focus:bg-slate-50"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <UserCircle size={16} />
                      Trang cá nhân
                    </Link>

                    {/* Hiển thị nút "Nâng cấp" cho BACKER */}
                    {user?.role === "BACKER" && (
                      <Link
                        href={user?.isOrganization ? "/upgrade/organization" : "/upgrade/individual"}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-pgreen to-fgreen rounded-xl hover:shadow-lg transition cursor-pointer outline-none"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Rocket size={16} />
                        Nâng cấp Creator
                      </Link>
                    )}

                    {/* Chỉ hiển thị "Quản lý chiến dịch" cho CREATOR và ADMIN */}
                    {(user?.role === "CREATOR" || user?.role === "ADMIN" || isAdmin) && (
                      <Link
                        href="/dashboard/creator"
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-slate-50 hover:text-pgreen transition cursor-pointer outline-none focus:bg-slate-50"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FolderKanban size={16} />
                        Quản lý chiến dịch
                      </Link>
                    )}

                    <Link
                      href="/dashboard/favorites"
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-slate-50 hover:text-pgreen transition cursor-pointer outline-none focus:bg-slate-50"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <HeartHandshake size={16} />
                      Chiến dịch quan tâm
                    </Link>

                    <Link
                      href="/purchases"
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-slate-50 hover:text-pgreen transition cursor-pointer outline-none focus:bg-slate-50"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <PackageOpen size={16} />
                      Kho đã mua
                    </Link>

                    <Link
                      href="/chat"
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-slate-50 hover:text-pgreen transition cursor-pointer outline-none focus:bg-slate-50 relative"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <MessageCircle size={16} />
                      Tin nhắn
                      <ChatNotificationBadge />
                    </Link>

                    <Link
                      href="/profile/edit"
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-slate-50 hover:text-pgreen transition cursor-pointer outline-none focus:bg-slate-50"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings size={16} />
                      Cài đặt
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/dashboard/admin"
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition cursor-pointer outline-none focus:bg-red-50"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <ShieldCheck size={16} />
                        Quản trị
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition outline-none focus:bg-red-50 mt-1 cursor-pointer"
                    >
                      <LogOut size={16} />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
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
                className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-green-200" style={{ background: "var(--profile-gradient, linear-gradient(135deg, #2E8B57, #6BCB77))" }}
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
          <Link href="/gioi-thieu" className="py-2 text-sm font-medium text-gray-600" onClick={() => setIsMenuOpen(false)}>
            Giới thiệu
          </Link>
          <Link href="/blog" className="py-2 text-sm font-medium text-gray-600" onClick={() => setIsMenuOpen(false)}>
            Blog
          </Link>
          <Link href="/users/search" className="py-2 text-sm font-medium text-gray-600" onClick={() => setIsMenuOpen(false)}>
            Người dùng
          </Link>

          {session ? (
            <>

              {/* Chỉ hiển thị nút "Gây quỹ ngay" cho CREATOR và ADMIN */}
              {(user?.role === "CREATOR" || user?.role === "ADMIN" || isAdmin) && (
                <Link
                  href="/campaigns/create"
                  className="mt-2 py-3 text-center rounded-xl gradient-green text-white font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Gây quỹ ngay
                </Link>
              )}
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
