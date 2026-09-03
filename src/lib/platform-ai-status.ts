const AI_BS_STATUS_URL =
  process.env.AI_BS_PUBLIC_URL?.replace(/\/$/, "") || "https://ai-bs.vercel.app";

export async function arePlatformAssistantWidgetsEnabled() {
  try {
    const response = await fetch(`${AI_BS_STATUS_URL}/api/public/platform-widgets`, {
      cache: "no-store",
      headers: { accept: "application/json" },
    });
    const payload = await response.json().catch(() => ({ enabled: true }));
    return payload?.enabled !== false;
  } catch {
    return true;
  }
}
