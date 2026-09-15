"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, Compass, MessageCircle, User, Bell } from "lucide-react";
import { ChatNotificationBadge } from "@/components/chat/ChatNotificationBadge";
import { useI18n } from "@/i18n";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useI18n();

  const userId = (session?.user as { id?: string } | undefined)?.id;

  const navItems = [
    {
      id: "home",
      label: t("mobile.home"),
      href: "/",
      icon: Home,
    },
    {
      id: "explore",
      label: t("mobile.explore"),
      href: "/projects",
      icon: Compass,
    },
    {
      id: "messages",
      label: t("mobile.messages"),
      href: session ? "/chat" : "/auth/login",
      icon: MessageCircle,
      hasBadge: true,
    },
    {
      id: "notifications",
      label: t("mobile.notifications"),
      href: session ? "/notifications" : "/auth/login",
      icon: Bell,
    },
    {
      id: "profile",
      label: t("mobile.profile"),
      href: userId ? `/profile/${userId}` : session ? "/dashboard" : "/auth/login",
      icon: User,
    },
  ] as const;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/80 pb-safe backdrop-blur-md transition-colors duration-300 md:hidden dark:border-white/10 dark:bg-slate-900/80"
      aria-label="Mobile"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--profile-shell-surface, var(--surface)) 92%, transparent)",
        borderColor:
          "color-mix(in srgb, var(--profile-shell-primary, #2E8B57) 14%, transparent)",
      }}
    >
      <div className="flex h-16 flex-nowrap items-center justify-around overflow-hidden">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex h-full min-w-0 flex-1 flex-col items-center justify-center space-y-1 relative transition-colors ${
                isActive ? "text-pgreen" : "text-gray-500 dark:text-slate-400"
              }`}
            >
              <div className="relative flex items-center justify-center">
                <item.icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={isActive ? "text-pgreen" : "text-gray-500 dark:text-slate-400"}
                />
                {"hasBadge" in item && item.hasBadge && session && (
                  <div className="absolute -top-1 -right-2">
                    <ChatNotificationBadge />
                  </div>
                )}
              </div>
              <span className={`max-w-full truncate px-0.5 text-[10px] font-medium ${isActive ? "text-pgreen" : "text-gray-500 dark:text-slate-400"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
