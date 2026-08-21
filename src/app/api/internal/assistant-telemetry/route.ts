import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const responseHeaders = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
  Vary: "Authorization",
} as const;

function hasValidBearerToken(request: Request) {
  const configuredKey = process.env.ASSISTANT_TELEMETRY_READ_KEY?.trim();
  if (!configuredKey) return false;
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return false;
  const candidate = authorization.slice("Bearer ".length).trim();
  const expectedBuffer = Buffer.from(configuredKey);
  const candidateBuffer = Buffer.from(candidate);
  return expectedBuffer.length === candidateBuffer.length && timingSafeEqual(expectedBuffer, candidateBuffer);
}

function parseRangeHours(value: string | null) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 168 ? parsed : 24;
}

export async function GET(request: Request) {
  if (!process.env.ASSISTANT_TELEMETRY_READ_KEY?.trim()) {
    return NextResponse.json({ error: "Telemetry nội bộ chưa được cấu hình." }, { status: 503, headers: responseHeaders });
  }
  if (!hasValidBearerToken(request)) {
    return NextResponse.json({ error: "Không có quyền truy cập telemetry nội bộ." }, { status: 401, headers: responseHeaders });
  }

  const rangeHours = parseRangeHours(new URL(request.url).searchParams.get("rangeHours"));
  const since = new Date(Date.now() - rangeHours * 60 * 60 * 1000);
  try {
    const events = await prisma.assistant_telemetry_events.findMany({
      where: { assistant: "platform-help", eventType: "command_rejected", createdAt: { gte: since } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
      take: 10_000,
    });
    const dailyMap = new Map<string, number>();
    for (const event of events) {
      const date = event.createdAt.toISOString().slice(0, 10);
      dailyMap.set(date, (dailyMap.get(date) ?? 0) + 1);
    }
    const daily = [...dailyMap.entries()].map(([date, count]) => ({ date, count }));
    return NextResponse.json({
      assistant: "platform-help",
      event: "command_rejected",
      rangeHours,
      total: events.length,
      latestAt: events.at(-1)?.createdAt.toISOString() ?? null,
      daily,
    }, { headers: responseHeaders });
  } catch (error) {
    console.error("[GET /api/internal/assistant-telemetry]", error);
    return NextResponse.json({ error: "Không thể đọc telemetry nội bộ." }, { status: 503, headers: responseHeaders });
  }
}
