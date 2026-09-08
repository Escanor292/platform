export const PRODUCT_ANALYTICS_EVENTS = ["PAGE_VIEW", "PAGE_LEAVE", "CTA_CLICK"] as const;

export type ProductAnalyticsEventName = (typeof PRODUCT_ANALYTICS_EVENTS)[number];

export const ANALYTICS_SENSITIVE_PATH_PREFIXES = [
  "/dashboard/admin",
  "/kyc",
  "/ekyc",
  "/api/",
] as const;

export type ProductAnalyticsPayload = {
  eventName: ProductAnalyticsEventName;
  path: string;
  sessionId?: string;
  campaignId?: string;
  payload?: {
    ctaId?: string;
    label?: string;
    durationMs?: number;
  };
};

const MAX_PATH_LENGTH = 180;
const MAX_CTA_LENGTH = 80;
const MAX_DURATION_MS = 30 * 60 * 1000;

export function normalizeAnalyticsPath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (!raw.startsWith("/")) return null;
  const withoutQuery = raw.split("?")[0].split("#")[0];
  const collapsed = withoutQuery.replace(/\/{2,}/g, "/");
  if (!collapsed || collapsed.length > MAX_PATH_LENGTH) return null;
  return collapsed;
}

export function isSensitiveAnalyticsPath(path: string): boolean {
  const normalized = path.toLowerCase();
  return ANALYTICS_SENSITIVE_PATH_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

function sanitizeOptionalId(value: unknown, max = 64): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return undefined;
  if (!/^[a-zA-Z0-9:_-]{8,64}$/.test(trimmed)) return undefined;
  return trimmed;
}

function sanitizeLabel(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, MAX_CTA_LENGTH);
}

export function parseProductAnalyticsPayload(value: unknown): ProductAnalyticsPayload | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.eventName !== "string" || !PRODUCT_ANALYTICS_EVENTS.includes(raw.eventName as ProductAnalyticsEventName)) {
    return null;
  }

  const path = normalizeAnalyticsPath(raw.path);
  if (!path || isSensitiveAnalyticsPath(path)) return null;

  const eventName = raw.eventName as ProductAnalyticsEventName;
  const sessionId = sanitizeOptionalId(raw.sessionId);
  const campaignId = sanitizeOptionalId(raw.campaignId);
  const rawPayload = raw.payload && typeof raw.payload === "object" && !Array.isArray(raw.payload)
    ? (raw.payload as Record<string, unknown>)
    : {};

  const payload: ProductAnalyticsPayload["payload"] = {};
  const ctaId = sanitizeLabel(rawPayload.ctaId);
  const label = sanitizeLabel(rawPayload.label);
  const durationMs = typeof rawPayload.durationMs === "number" && Number.isFinite(rawPayload.durationMs)
    ? Math.max(0, Math.min(MAX_DURATION_MS, Math.round(rawPayload.durationMs)))
    : undefined;

  if (eventName === "CTA_CLICK") {
    if (!ctaId) return null;
    payload.ctaId = ctaId;
    if (label) payload.label = label;
  }

  if (eventName === "PAGE_LEAVE" && durationMs !== undefined) {
    payload.durationMs = durationMs;
  }

  return {
    eventName,
    path,
    ...(sessionId ? { sessionId } : {}),
    ...(campaignId ? { campaignId } : {}),
    ...(Object.keys(payload).length > 0 ? { payload } : {}),
  };
}
