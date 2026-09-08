import { prisma } from "@/lib/prisma";
import { normalizeGa4Id } from "@/lib/seo";

export const EKYC_ENABLED_KEY = "ekyc_enabled";
export const GA4_ID_KEY = "ga4_measurement_id";

async function ensureSettingsTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS platform_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export async function getPlatformSetting(key: string): Promise<string | null> {
  try {
    await ensureSettingsTable();
    const rows = await prisma.$queryRawUnsafe<Array<{ value: string }>>(
      `SELECT value FROM platform_settings WHERE key = $1`,
      key,
    );
    return rows[0]?.value ?? null;
  } catch (error) {
    console.warn("[PLATFORM SETTINGS READ]", error);
    return null;
  }
}

export async function setPlatformSetting(key: string, value: string) {
  await ensureSettingsTable();
  await prisma.$executeRawUnsafe(
    `INSERT INTO platform_settings (key, value, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    key,
    value,
  );
  return value;
}

export async function isEkycEnabled(): Promise<boolean> {
  const value = await getPlatformSetting(EKYC_ENABLED_KEY);
  if (value == null) return true;
  return value === "true";
}

export async function setEkycEnabled(enabled: boolean) {
  await setPlatformSetting(EKYC_ENABLED_KEY, enabled ? "true" : "false");
  return enabled;
}

export async function getGa4MeasurementId(): Promise<string | null> {
  return normalizeGa4Id(await getPlatformSetting(GA4_ID_KEY));
}

export async function setGa4MeasurementId(raw?: string | null) {
  const normalized = normalizeGa4Id(raw);
  await setPlatformSetting(GA4_ID_KEY, normalized || "");
  return normalized;
}

export function ekycDisabledResponse() {
  return {
    error: "Hệ thống đang dùng KYC thủ công. eKYC tạm tắt.",
    fallback: "manual" as const,
    ekycEnabled: false,
  };
}
