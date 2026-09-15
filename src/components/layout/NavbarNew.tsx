"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Rocket, LogOut, UserCircle, Menu, X, ChevronDown, Settings, ShieldCheck, FolderKanban, HeartHandshake, MessageCircle, PackageOpen, Bell
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import LeafIcon from "../shared/LeafIcon";
import { ChatNotificationBadge } from "@/components/chat/ChatNotificationBadge";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { CartDropdown } from "@/components/products/CartProvider";
import { useMyPermissions } from "@/hooks/useMyPermissions";
import { useI18n } from "@/i18n";
import ChromeToggles from "@/components/layout/ChromeToggles";

const navLinkClass =
  "text-sm font-medium text-gray-600 transition relative group hover:text-pgreen dark:text-slate-300";
const menuItemClass =
  "flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-slate-50 hover:text-pgreen transition cursor-pointer outline-none focus:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5";

export default function NavbarNew() {
  const { data: session } = useSession();
  const { t } = useI18n();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const user = session?.user as any;
  const isAdmin = user?.role === "ADMIN" || user?.isAdmin === true;
  const { can } = useMyPermissions();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
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
    }, 250);
  };

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    toast.promise(signOut({ redirect: false }), {
      loading: t("toast.logoutLoading"),
      success: () => {
        router.push("/");
        router.refresh();
        return t("toast.logoutSuccess");
      },
      error: t("toast.logoutError"),
    });
  };

  return (
    <nav
      className="sticky top-0 z-50 glass border-b border-white/30 transition-colors duration-300 dark:border-white/10"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--profile-shell-primary, #2E8B57) 7%, var(--profile-shell-surface, var(--surface)) 93%)",
        borderColor:
          "color-mix(in srgb, var(--profile-shell-primary, #2E8B57) 18%, transparent)",
        boxShadow:
          "0 6px 24px color-mix(in srgb, var(--profile-shell-primary, #2E8B57) 9%, transparent)",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2 cursor-pointer group">
          <div className="w-10 h-10 rounded-xl gradient-green flex items-center justify-center">
            <LeafIcon className="w-6 h-6" />
          </div>
          <span className="font-display font-bold text-xl text-dblue group-hover:text-pgreen transition dark:text-slate-100">
            TửTế Fund
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className={navLinkClass}>
            {t("nav.home")}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-pgreen group-hover:w-full transition-all duration-300" />
          </Link>
          <Link href="/gioi-thieu" className={navLinkClass}>
            {t("nav.about")}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-pgreen group-hover:w-full transition-all duration-300" />
          </Link>
          <Link href="/projects" className={navLinkClass}>
            {t("nav.explore")}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-pgreen group-hover:w-full transition-all duration-300" />
          </Link>
          <Link href="/blog" className={navLinkClass}>
            {t("nav.blog")}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-pgreen group-hover:w-full transition-all duration-300" />
          </Link>
          <Link href="/users/search" className={navLinkClass}>
            {t("nav.users")}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-pgreen group-hover:w-full transition-all duration-300" />
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <ChromeToggles />
          {session ? (
            <>
              <CartDropdown />
              <NotificationBell />
              <Link
                href="/chat"
                className="relative p-2 text-gray-600 hover:text-pgreen hover:bg-gray-50 rounded-xl transition dark:text-slate-300 dark:hover:bg-white/10"
                title={t("nav.messages")}
              >
                <MessageCircle size={20} />
                <ChatNotificationBadge />
              </Link>

              {(can("campaign.create") || isAdmin) && (
                <Link
                  href="/campaigns/create"
                  className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-green-200"
                  style={{ background: "var(--profile-gradient, linear-gradient(135deg, #2E8B57, #6BCB77))" }}
                >
                  {t("cta.startCampaign")}
                </Link>
              )}

              <div
                className="relative"
                onMouseEnter={() => {
                  clearCloseTimeout();
                  setIsDropdownOpen(true);
                }}
                onMouseLeave={setCloseTimeout}
              >
                <button
                  ref={triggerRef}
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="menu"
                  aria-label={t("nav.accountMenu")}
                  className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded-xl transition focus-ring dark:hover:bg-white/10"
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border font-bold"
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, var(--profile-shell-primary, #2E8B57) 10%, transparent)",
                      borderColor:
                        "color-mix(in srgb, var(--profile-shell-primary, #2E8B57) 22%, transparent)",
                      color: "var(--profile-shell-primary, #2E8B57)",
                    }}
                  >
                    {session.user?.image ? (
                      <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      session.user?.name?.charAt(0) || "U"
                    )}
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isDropdownOpen && (
                  <div
                    ref={dropdownRef}
                    role="menu"
                    onMouseEnter={clearCloseTimeout}
                    onMouseLeave={setCloseTimeout}
                    className="absolute right-0 top-full z-50 pt-2"
                  >
                    <div className="w-56 bg-white rounded-2xl shadow-premium border border-gray-100 p-2 animate-in fade-in zoom-in-95 duration-200 dark:bg-slate-900 dark:border-white/10">
                      <div className="px-3 py-2 border-b border-gray-50 mb-2 dark:border-white/10">
                        <p className="text-sm font-bold text-gray-900 truncate dark:text-slate-100">{session.user?.name}</p>
                        <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
                      </div>

                      <Link href="/dashboard" className={menuItemClass} onClick={() => setIsDropdownOpen(false)}>
                        <UserCircle size={16} />
                        {t("nav.profile")}
                      </Link>

                      {can("kyc.submit") && user?.role === "BACKER" && (
                        <Link
                          href={user?.isOrganization ? "/upgrade/organization" : "/upgrade/individual"}
                          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-pgreen to-fgreen rounded-xl hover:shadow-lg transition cursor-pointer outline-none"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Rocket size={16} />
                          {t("nav.upgrade")}
                        </Link>
                      )}

                      {(can("campaign.manage") || isAdmin) && (
                        <Link href="/dashboard/creator" className={menuItemClass} onClick={() => setIsDropdownOpen(false)}>
                          <FolderKanban size={16} />
                          {t("nav.manageCampaigns")}
                        </Link>
                      )}

                      <Link href="/dashboard/favorites" className={menuItemClass} onClick={() => setIsDropdownOpen(false)}>
                        <HeartHandshake size={16} />
                        {t("nav.favorites")}
                      </Link>

                      <Link href="/purchases" className={menuItemClass} onClick={() => setIsDropdownOpen(false)}>
                        <PackageOpen size={16} />
                        {t("nav.purchases")}
                      </Link>

                      <Link href="/chat" className={`${menuItemClass} relative`} onClick={() => setIsDropdownOpen(false)}>
                        <MessageCircle size={16} />
                        {t("nav.messages")}
                        <ChatNotificationBadge />
                      </Link>

                      <Link href="/profile/edit" className={menuItemClass} onClick={() => setIsDropdownOpen(false)}>
                        <Settings size={16} />
                        {t("nav.settings")}
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/dashboard/admin"
                          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition cursor-pointer outline-none focus:bg-red-50 dark:hover:bg-red-950/40"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <ShieldCheck size={16} />
                          {t("nav.admin")}
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition outline-none focus:bg-red-50 mt-1 cursor-pointer dark:hover:bg-red-950/40"
                      >
                        <LogOut size={16} />
                        {t("nav.logout")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-semibold text-pgreen hover:text-dblue transition dark:hover:text-fgreen"
              >
                {t("auth.login")}
              </Link>
              <Link
                href="/campaigns/create"
                className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-green-200"
                style={{ background: "var(--profile-gradient, linear-gradient(135deg, #2E8B57, #6BCB77))" }}
              >
                {t("cta.startCampaign")}
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ChromeToggles />
          <button
            className="p-2 text-gray-900 focus-ring rounded-lg dark:text-slate-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden max-h-[70vh] overflow-y-auto px-6 pb-4 flex flex-col gap-1 bg-white border-t border-gray-100 dark:bg-slate-900 dark:border-white/10">
          <div className="flex items-center justify-between py-2">
            <ChromeToggles />
          </div>
          <Link href="/" className="py-2 text-sm font-medium text-gray-600 dark:text-slate-300" onClick={() => setIsMenuOpen(false)}>
            {t("nav.home")}
          </Link>
          <Link href="/gioi-thieu" className="py-2 text-sm font-medium text-gray-600 dark:text-slate-300" onClick={() => setIsMenuOpen(false)}>
            {t("nav.about")}
          </Link>
          <Link href="/projects" className="py-2 text-sm font-medium text-gray-600 dark:text-slate-300" onClick={() => setIsMenuOpen(false)}>
            {t("nav.explore")}
          </Link>
          <Link href="/blog" className="py-2 text-sm font-medium text-gray-600 dark:text-slate-300" onClick={() => setIsMenuOpen(false)}>
            {t("nav.blog")}
          </Link>
          <Link href="/users/search" className="py-2 text-sm font-medium text-gray-600 dark:text-slate-300" onClick={() => setIsMenuOpen(false)}>
            {t("nav.users")}
          </Link>

          {session ? (
            <>
              <Link href="/dashboard" className="flex items-center gap-2 py-2 text-sm font-medium text-gray-700 dark:text-slate-200" onClick={() => setIsMenuOpen(false)}>
                <UserCircle size={16} /> {t("nav.profile")}
              </Link>
              <Link href="/notifications" className="flex items-center gap-2 py-2 text-sm font-medium text-gray-700 dark:text-slate-200" onClick={() => setIsMenuOpen(false)}>
                <Bell size={16} /> {t("nav.notifications")}
              </Link>
              <Link href="/chat" className="relative flex items-center gap-2 py-2 text-sm font-medium text-gray-700 dark:text-slate-200" onClick={() => setIsMenuOpen(false)}>
                <MessageCircle size={16} /> {t("nav.messages")}
                <ChatNotificationBadge />
              </Link>
              <Link href="/cart" className="py-2 text-sm font-medium text-gray-700 dark:text-slate-200" onClick={() => setIsMenuOpen(false)}>
                {t("nav.cart")}
              </Link>
              <Link href="/purchases" className="flex items-center gap-2 py-2 text-sm font-medium text-gray-700 dark:text-slate-200" onClick={() => setIsMenuOpen(false)}>
                <PackageOpen size={16} /> {t("nav.purchases")}
              </Link>
              <Link href="/dashboard/favorites" className="flex items-center gap-2 py-2 text-sm font-medium text-gray-700 dark:text-slate-200" onClick={() => setIsMenuOpen(false)}>
                <HeartHandshake size={16} /> {t("nav.favorites")}
              </Link>
              {(can("campaign.manage") || isAdmin) && (
                <Link href="/dashboard/creator" className="flex items-center gap-2 py-2 text-sm font-medium text-gray-700 dark:text-slate-200" onClick={() => setIsMenuOpen(false)}>
                  <FolderKanban size={16} /> {t("nav.manageCampaigns")}
                </Link>
              )}
              <Link href="/profile/edit" className="flex items-center gap-2 py-2 text-sm font-medium text-gray-700 dark:text-slate-200" onClick={() => setIsMenuOpen(false)}>
                <Settings size={16} /> {t("nav.settings")}
              </Link>
              {isAdmin && (
                <Link href="/dashboard/admin" className="flex items-center gap-2 py-2 text-sm font-medium text-red-600" onClick={() => setIsMenuOpen(false)}>
                  <ShieldCheck size={16} /> {t("nav.admin")}
                </Link>
              )}
              {(can("campaign.create") || isAdmin) && (
                <Link
                  href="/campaigns/create"
                  className="mt-2 py-3 text-center rounded-xl gradient-green text-white font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("cta.startCampaign")}
                </Link>
              )}
              <button onClick={handleLogout} className="py-2 text-sm font-medium text-red-600 text-left">
                {t("nav.logout")}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="py-2 text-sm font-medium text-pgreen"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("auth.login")}
              </Link>
              <Link
                href="/campaigns/create"
                className="mt-2 py-3 text-center rounded-xl gradient-green text-white font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("cta.startCampaign")}
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
