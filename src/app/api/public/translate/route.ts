import { NextRequest, NextResponse } from "next/server";
import {
  translateUgcBatch,
  UGC_TRANSLATE_MAX_CHARS,
  UGC_TRANSLATE_MAX_ITEMS,
} from "@/lib/ugc-translate";
import { redisRateLimit } from "@/lib/redis";

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;
const requestLog = new Map<string, number[]>();

function clientKey(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
}

function localAllowed(request: NextRequest) {
  const now = Date.now();
  const key = clientKey(request);
  const recent = (requestLog.get(key) || []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) return false;
  recent.push(now);
  requestLog.set(key, recent);
  return true;
}

async function allowed(request: NextRequest) {
  const remote = await redisRateLimit(`cfvn:rl:translate:${clientKey(request)}`, MAX_REQUESTS_PER_WINDOW, 60);
  if (remote === "limited") return false;
  if (remote === "ok") return true;
  return localAllowed(request);
}

export async function POST(request: NextRequest) {
  if (!(await allowed(request))) {
    return NextResponse.json({ error: "rate-limited" }, { status: 429 });
  }

  let body: { texts?: unknown; target?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const texts = Array.isArray(body.texts)
    ? body.texts
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.slice(0, UGC_TRANSLATE_MAX_CHARS))
        .slice(0, UGC_TRANSLATE_MAX_ITEMS)
    : [];

  if (texts.length === 0) {
    return NextResponse.json({ translations: [] });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ translations: texts });
  }

  const translations = await translateUgcBatch(texts, "en");
  return NextResponse.json({ translations });
}
