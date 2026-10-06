import { NextResponse } from "next/server";
import { unauthorizedCron } from "@/lib/cron-auth";
import { scanCreatorLinks } from "@/lib/link-checks";

export async function GET(request: Request) {
  const denied = unauthorizedCron(request);
  if (denied) return denied;
  try {
    const result = await scanCreatorLinks({ limit: 20 });
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("[CRON check-links]", error);
    return NextResponse.json({ error: error.message || "Scan failed" }, { status: 500 });
  }
}
