import { NextResponse } from "next/server";
import { arePlatformAssistantWidgetsEnabled } from "@/lib/platform-ai-status";

export async function GET() {
  const enabled = await arePlatformAssistantWidgetsEnabled();
  return NextResponse.json({ enabled }, { headers: { "Cache-Control": "no-store" } });
}
