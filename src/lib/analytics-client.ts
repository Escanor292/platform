"use client";

import type { ProductAnalyticsPayload } from "@/lib/analytics-contract";
import { isSensitiveAnalyticsPath, normalizeAnalyticsPath } from "@/lib/analytics-contract";

const CONSENT_KEY = "tutefund-product-analytics-consent-v1";
const SESSION_KEY = "tutefund-product-analytics-session-v1";

function storageAvailable(kind: "localStorage" | "sessionStorage" = "localStorage") {
  return typeof window !== "undefined" && typeof window[kind] !== "undefined";
}

export function getProductAnalyticsConsent() {
  if (!storageAvailable()) return false;
  return localStorage.getItem(CONSENT_KEY) !== "denied";
}

export function setProductAnalyticsConsent(enabled: boolean) {
  if (storageAvailable()) localStorage.setItem(CONSENT_KEY, enabled ? "granted" : "denied");
}

export function getAnalyticsSessionId() {
  if (!storageAvailable("sessionStorage")) return undefined;
  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing && existing.length >= 8) return existing;
  const created = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  sessionStorage.setItem(SESSION_KEY, created);
  return created;
}

export function recordProductAnalytics(payload: ProductAnalyticsPayload) {
  if (!getProductAnalyticsConsent() || typeof fetch !== "function") return;
  const path = normalizeAnalyticsPath(payload.path);
  if (!path || isSensitiveAnalyticsPath(path)) return;

  void fetch("/api/public/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      path,
      sessionId: payload.sessionId || getAnalyticsSessionId(),
    }),
    keepalive: true,
  }).catch(() => undefined);
}

export function trackPageView(path: string, campaignId?: string) {
  recordProductAnalytics({
    eventName: "PAGE_VIEW",
    path,
    ...(campaignId ? { campaignId } : {}),
  });
}

export function trackPageLeave(path: string, durationMs: number) {
  recordProductAnalytics({
    eventName: "PAGE_LEAVE",
    path,
    payload: { durationMs },
  });
}

export function trackCtaClick(ctaId: string, label?: string, path?: string) {
  const resolvedPath = path || (typeof window !== "undefined" ? window.location.pathname : "/");
  recordProductAnalytics({
    eventName: "CTA_CLICK",
    path: resolvedPath,
    payload: { ctaId, ...(label ? { label } : {}) },
  });
}
