import { redisGet, redisSet } from "@/lib/redis";
import {
  cacheKey,
  needsTranslation,
  UGC_TRANSLATE_MAX_CHARS,
  UGC_TRANSLATE_MAX_ITEMS,
} from "@/lib/ugc-translate-core";

export {
  cacheKey,
  hashUgcText,
  needsTranslation,
  UGC_TRANSLATE_MAX_CHARS,
  UGC_TRANSLATE_MAX_ITEMS,
} from "@/lib/ugc-translate-core";

export const UGC_CACHE_TTL_SECONDS = 60 * 60 * 24 * 30;

const memoryCache = new Map<string, string>();

export async function readCachedTranslation(text: string, target: string = "en"): Promise<string | null> {
  const key = cacheKey(text, target);
  const mem = memoryCache.get(key);
  if (mem) return mem;
  const stored = await redisGet(key);
  if (stored) {
    memoryCache.set(key, stored);
    return stored;
  }
  return null;
}

export async function writeCachedTranslation(text: string, translated: string, target: string = "en"): Promise<void> {
  const key = cacheKey(text, target);
  memoryCache.set(key, translated);
  await redisSet(key, translated, UGC_CACHE_TTL_SECONDS);
}

function responseText(payload: any): string {
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    return parts.map((part: { text?: string }) => part?.text || "").join("\n").trim();
  }
  return typeof payload?.output_text === "string" ? payload.output_text.trim() : "";
}

function parseTranslatedList(raw: string, count: number): string[] | null {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length === count && parsed.every((item) => typeof item === "string")) {
      return parsed;
    }
  } catch {
    // fall through
  }
  return null;
}

async function callGemini(items: string[], signal: AbortSignal): Promise<string[]> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("missing-gemini");
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const prompt = `Translate each Vietnamese crowdfunding string to natural English.\nKeep proper names, brand names, campaign codes (CF-...), numbers and currency as-is.\nIf a string is already English, copy it unchanged.\nReturn ONLY a JSON array of ${items.length} strings, same order.\n\nINPUT:\n${JSON.stringify(items)}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.15, maxOutputTokens: 2_048 },
    }),
    signal,
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`gemini-${response.status}`);
  const parsed = parseTranslatedList(responseText(await response.json()), items.length);
  if (!parsed) throw new Error("bad-gemini-shape");
  return parsed;
}

export async function translateUgcBatch(texts: string[], target: string = "en"): Promise<string[]> {
  const clipped = texts.slice(0, UGC_TRANSLATE_MAX_ITEMS).map((text) =>
    (text || "").trim().slice(0, UGC_TRANSLATE_MAX_CHARS),
  );

  const result = new Array<string>(clipped.length);
  const pendingIdx: number[] = [];
  const pendingTexts: string[] = [];

  await Promise.all(
    clipped.map(async (text, index) => {
      if (!needsTranslation(text) || target !== "en") {
        result[index] = text;
        return;
      }
      const cached = await readCachedTranslation(text, target);
      if (cached) {
        result[index] = cached;
        return;
      }
      pendingIdx.push(index);
      pendingTexts.push(text);
    }),
  );

  if (pendingTexts.length === 0) return result;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    const translated = await callGemini(pendingTexts, controller.signal);
    await Promise.all(
      translated.map(async (value, i) => {
        const original = pendingTexts[i];
        const next = value.trim() || original;
        result[pendingIdx[i]] = next;
        await writeCachedTranslation(original, next, target);
      }),
    );
  } catch {
    pendingIdx.forEach((index) => {
      if (!result[index]) result[index] = clipped[index];
    });
  } finally {
    clearTimeout(timer);
  }

  return result;
}
