import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseAssistantTelemetryPayload } from "@/lib/assistant-telemetry-contract";

const headers = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
} as const;

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (!Number.isFinite(contentLength) || contentLength > 1024) return NextResponse.json({ error: "Dữ liệu telemetry không hợp lệ." }, { status: 413, headers });
  try {
    const payload = parseAssistantTelemetryPayload(await request.json());
    if (!payload) return NextResponse.json({ error: "Dữ liệu telemetry không hợp lệ." }, { status: 400, headers });
    await prisma.assistant_telemetry_events.create({
      data: {
        assistant: "platform-help",
        eventType: payload.event,
        metadata: {
          ...(payload.contextTraceCount === undefined ? {} : { contextTraceCount: payload.contextTraceCount }),
          ...(payload.hasAction === undefined ? {} : { hasAction: payload.hasAction }),
        },
      },
    });
    return NextResponse.json({ accepted: true }, { status: 202, headers });
  } catch (error) {
    console.error("[POST /api/public/assistant-telemetry]", error);
    return NextResponse.json({ error: "Không thể ghi nhận telemetry." }, { status: 503, headers });
  }
}
