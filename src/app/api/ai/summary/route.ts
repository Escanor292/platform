import { NextResponse } from "next/server";
import { z } from "zod";
import { loadSummaryDocument, buildFallbackSummary } from "@/lib/ai-summary/source";
import { tryLlmSummary } from "@/lib/ai-summary/llm";
import { SUMMARY_SOURCE_TYPES } from "@/lib/ai-summary/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  sourceType: z.enum(SUMMARY_SOURCE_TYPES),
  sourceId: z.string().trim().min(1).max(160),
});

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;

function getClientKey(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
}

function canRequest(key: string): boolean {
  const now = Date.now();
  const previous = rateLimit.get(key);
  if (!previous || previous.resetAt <= now) {
    rateLimit.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (previous.count >= MAX_REQUESTS_PER_WINDOW) return false;
  previous.count += 1;
  return true;
}

export async function POST(request: Request) {
  const key = getClientKey(request);
  if (!canRequest(key)) {
    return NextResponse.json(
      { error: "Bạn đã dùng hết lượt tóm tắt trong một giờ. Vui lòng thử lại sau." },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Loại nguồn hoặc mã nội dung không hợp lệ." }, { status: 400 });
    }

    const document = await loadSummaryDocument(parsed.data.sourceType, parsed.data.sourceId);
    const result = (await tryLlmSummary(document)) ?? buildFallbackSummary(document);
    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể tạo bản tóm tắt.";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
