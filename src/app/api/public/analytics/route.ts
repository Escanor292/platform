import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { analyticsService } from "@/services/mongodb";
import { parseProductAnalyticsPayload } from "@/lib/analytics-contract";

const headers = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
} as const;

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (!Number.isFinite(contentLength) || contentLength > 2048) {
    return NextResponse.json({ error: "Du lieu analytics khong hop le." }, { status: 413, headers });
  }

  try {
    const payload = parseProductAnalyticsPayload(await request.json());
    if (!payload) {
      return NextResponse.json({ error: "Du lieu analytics khong hop le." }, { status: 400, headers });
    }

    const session = await auth().catch(() => null);
    const userId = typeof (session?.user as { id?: string } | undefined)?.id === "string"
      ? (session?.user as { id: string }).id
      : undefined;

    analyticsService.track({
      eventName: payload.eventName,
      path: payload.path,
      ...(userId ? { userId } : {}),
      ...(payload.sessionId ? { sessionId: payload.sessionId } : {}),
      ...(payload.campaignId ? { campaignId: payload.campaignId } : {}),
      ...(payload.payload ? { payload: payload.payload } : {}),
    });

    return NextResponse.json({ accepted: true }, { status: 202, headers });
  } catch (error) {
    console.error("[POST /api/public/analytics]", error);
    return NextResponse.json({ error: "Khong the ghi nhan analytics." }, { status: 503, headers });
  }
}
