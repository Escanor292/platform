"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { isSensitiveAnalyticsPath, normalizeAnalyticsPath } from "@/lib/analytics-contract";
import { trackCtaClick, trackPageLeave, trackPageView } from "@/lib/analytics-client";

function currentPath() {
  if (typeof window === "undefined") return "/";
  return normalizeAnalyticsPath(window.location.pathname) || "/";
}

export default function BehaviorTracker() {
  const pathname = usePathname();
  const startedAtRef = useRef<number>(Date.now());
  const pathRef = useRef<string>(pathname || "/");

  useEffect(() => {
    const nextPath = normalizeAnalyticsPath(pathname || currentPath()) || "/";
    const previousPath = pathRef.current;
    const elapsed = Date.now() - startedAtRef.current;

    if (previousPath && previousPath !== nextPath && !isSensitiveAnalyticsPath(previousPath)) {
      trackPageLeave(previousPath, elapsed);
    }

    pathRef.current = nextPath;
    startedAtRef.current = Date.now();

    if (!isSensitiveAnalyticsPath(nextPath)) {
      trackPageView(nextPath);
    }
  }, [pathname]);

  useEffect(() => {
    const flushLeave = () => {
      const path = pathRef.current;
      if (!path || isSensitiveAnalyticsPath(path)) return;
      trackPageLeave(path, Date.now() - startedAtRef.current);
      startedAtRef.current = Date.now();
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") flushLeave();
      if (document.visibilityState === "visible") startedAtRef.current = Date.now();
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const cta = target.closest<HTMLElement>("[data-analytics-cta]");
      if (!cta) return;
      const ctaId = cta.getAttribute("data-analytics-cta") || "";
      const label = cta.getAttribute("data-analytics-label") || cta.textContent || undefined;
      if (!ctaId) return;
      trackCtaClick(ctaId, label?.trim() || undefined, pathRef.current);
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flushLeave);
    document.addEventListener("click", onClick, true);
    return () => {
      flushLeave();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flushLeave);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return null;
}
