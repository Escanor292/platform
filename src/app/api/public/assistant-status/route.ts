import { NextResponse } from "next/server";

const AI_BS_STATUS_URL =
  process.env.AI_BS_PUBLIC_URL?.replace(/\/$/, "") || "https://ai-bs.vercel.app";

export async function GET() {
  try {
    const response = await fetch(`${AI_BS_STATUS_URL}/api/public/platform-widgets`, {
      cache: "no-store",
      headers: { accept: "application/json" },
    });
    const payload = await response.json().catch(() => ({ enabled: true }));
    return NextResponse.json(
      { enabled: payload?.enabled !== false },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ enabled: true }, { headers: { "Cache-Control": "no-store" } });
  }
}
