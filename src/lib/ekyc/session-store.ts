import { randomUUID } from "crypto";
import { cacheGet, cacheSet } from "@/lib/redis-cache";
import type { EkycAnalyzeResult } from "./types";

export type SessionRecord = {
  sessionId: string;
  userId: string;
  consentAt: string;
  createdAt: number;
  analyze?: EkycAnalyzeResult;
};

const TTL_SECONDS = 30 * 60;
const g = globalThis as unknown as { __ekycSessions?: Map<string, SessionRecord> };
if (!g.__ekycSessions) g.__ekycSessions = new Map();

function keyFor(sessionId: string) {
  return `cfvn:ekyc:session:${sessionId}`;
}

export async function createEkycSession(userId: string) {
  const sessionId = randomUUID();
  const rec: SessionRecord = {
    sessionId,
    userId,
    consentAt: new Date().toISOString(),
    createdAt: Date.now(),
  };
  g.__ekycSessions!.set(sessionId, rec);
  await cacheSet(keyFor(sessionId), rec, TTL_SECONDS);
  return rec;
}

export async function getEkycSession(sessionId: string, userId: string) {
  const cached = await cacheGet<SessionRecord>(keyFor(sessionId));
  const rec = cached || g.__ekycSessions!.get(sessionId) || null;
  if (!rec || rec.userId !== userId) return null;
  return rec;
}

export async function saveAnalyze(sessionId: string, userId: string, analyze: EkycAnalyzeResult) {
  const rec = await getEkycSession(sessionId, userId);
  if (!rec) return null;
  rec.analyze = analyze;
  g.__ekycSessions!.set(sessionId, rec);
  await cacheSet(keyFor(sessionId), rec, TTL_SECONDS);
  return rec;
}
