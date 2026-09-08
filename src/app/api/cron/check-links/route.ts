import { NextResponse } from "next/server";
import { scanCreatorLinks } from "@/lib/link-checks";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const header = request.headers.get("authorization");
    const query = new URL(request.url).searchParams.get("secret");
    if (header !== `Bearer ${secret}` && query !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  try {
    const result = await scanCreatorLinks({ limit: 20 });
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("[CRON check-links]", error);
    return NextResponse.json({ error: error.message || "Scan failed" }, { status: 500 });
  }
}
