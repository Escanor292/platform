"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import NavbarNew from "@/components/layout/NavbarNew";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import FooterNew from "@/components/shared/FooterNew";
import QuickPageAssistant from "@/components/public/QuickPageAssistant";
import PlatformHelpAssistant from "@/components/public/PlatformHelpAssistant";
import PlatformAssistantGate from "@/components/public/PlatformAssistantGate";
import BehaviorTracker from "@/components/analytics/BehaviorTracker";

export function SiteFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const bare = pathname === "/so" || pathname.startsWith("/so/");
  if (bare) {
    return <div className="min-h-screen bg-cream text-ink">{children}</div>;
  }
  return (
    <div className="flex min-h-screen flex-col bg-background pb-20 text-foreground md:pb-0">
      <NavbarNew />
      <main className="flex-grow">{children}</main>
      <FooterNew />
      <MobileBottomNav />
      <PlatformAssistantGate>
        <QuickPageAssistant />
        <PlatformHelpAssistant />
      </PlatformAssistantGate>
      <BehaviorTracker />
    </div>
  );
}
