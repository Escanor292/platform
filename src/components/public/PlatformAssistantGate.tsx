"use client";

import { useEffect, useState } from "react";

export default function PlatformAssistantGate({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/public/assistant-status", { cache: "no-store" });
        const payload = await response.json();
        if (!cancelled && payload?.enabled === false) setEnabled(false);
        else if (!cancelled) setEnabled(true);
      } catch {
        if (!cancelled) setEnabled(true);
      }
    }

    void load();
    const timer = window.setInterval(() => void load(), 20_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  if (!enabled) return null;
  return <>{children}</>;
}
