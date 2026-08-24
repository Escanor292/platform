"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, Compass, MessageCircle, User, Bell } from "lucide-react";
import { ChatNotificationBadge } from "@/components/chat/ChatNotificationBadge";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    {
      label: "Trang chủ",
      href: "/",
      icon: Home,
    },
    {
      label: "Khám phá",
      href: "/projects",
      icon: Compass,
    },
    {
      label: "Tin nhắn",
      href: session ? "/chat" : "/auth/login",
      icon: MessageCircle,
      hasBadge: true,
    },
    {
      label: "Thông báo",
      href: session ? "/notifications" : "/auth/login",
      icon: Bell,
    },
    {
      label: "Cá nhân",
      href: session ? "/dashboard" : "/auth/login",
      icon: User,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/80 pb-safe backdrop-blur-md transition-colors duration-300 md:hidden" style={{ backgroundColor: "color-mix(in srgb, var(--profile-shell-surface, #ffffff) 92%, transparent)", borderColor: "color-mix(in srgb, var(--profile-shell-primary, #2E8B57) 14%, transparent)" }}>
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative transition-colors ${
                isActive ? "text-pgreen" : "text-gray-500"
              }`}
            >
              <div className="relative flex items-center justify-center">
                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-pgreen" : "text-gray-500"} />
                {item.hasBadge && session && (
                  <div className="absolute -top-1 -right-2">
                    <ChatNotificationBadge />
                  </div>
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? "text-pgreen" : "text-gray-500"}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
