import { prisma } from "@/lib/prisma";

export const EKYC_ENABLED_KEY = "ekyc_enabled";

async function ensureSettingsTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS platform_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export async function isEkycEnabled(): Promise<boolean> {
  try {
    await ensureSettingsTable();
    const rows = await prisma.$queryRawUnsafe<Array<{ value: string }>>(
      `SELECT value FROM platform_settings WHERE key = $1`,
      EKYC_ENABLED_KEY,
    );
    if (!rows[0]) return true;
    return rows[0].value === "true";
  } catch (error) {
    console.warn("[PLATFORM SETTINGS READ]", error);
    return true;
  }
}

export async function setEkycEnabled(enabled: boolean) {
  await ensureSettingsTable();
  await prisma.$executeRawUnsafe(
    `INSERT INTO platform_settings (key, value, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    EKYC_ENABLED_KEY,
    enabled ? "true" : "false",
  );
  return enabled;
}

export function ekycDisabledResponse() {
  return {
    error: "Hệ thống đang dùng KYC thủ công. eKYC tạm tắt.",
    fallback: "manual" as const,
    ekycEnabled: false,
  };
}
