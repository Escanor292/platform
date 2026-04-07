"use client";

import Link from "next/link";
import { Compass, Heart, Search, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Footer() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    { label: "Home", href: "/", icon: Compass },
    { label: "Explore", href: "/campaigns", icon: Search },
    { label: "Pledges", href: "/dashboard/backer", icon: Heart },
    { label: "Profile", href: session ? "/dashboard/backer" : "/auth/login", icon: User },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-gray-100 md:hidden pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-all ${isActive ? "text-green-600 scale-110" : "text-gray-400"}`}
            >
              <item.icon size={20} strokeWidth={isActive ? 3 : 2} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </footer>
  );
}
