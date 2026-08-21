export type ZeroMemRole = "user" | "assistant";

export type ZeroMemTrace = {
  id: string;
  sessionId: string;
  role: ZeroMemRole;
  text: string;
  entities: string[];
  keywords: string[];
  createdAt: number;
  expiresAt: number;
  source: "platform-help";
};

export type ZeroMemEvidence = ZeroMemTrace & {
  score: number;
  graphScore: number;
  temporalScore: number;
};

export const ZERO_MEM_TTL_MS = 30 * 60 * 1000;
const ZERO_MEM_MAX_TRACES = 24;
const ZERO_MEM_MAX_TEXT_LENGTH = 320;
const STORE_KEY = "tutefund-zero-mem-v1";
const STOP_WORDS = new Set(["bạn", "tôi", "mình", "của", "và", "với", "cho", "trên", "trong", "như", "nào", "là", "có", "được", "không", "thế", "này", "kia", "về", "một", "các", "theo", "để", "khi", "đến", "làm", "gì", "hỏi"]);
const SENSITIVE_PATTERN = /(mật khẩu|password|passcode|otp|mã xác thực|cvv|số thẻ|credit.?card|api.?key|access.?token|refresh.?token|session.?token|cookie|bearer\s+[a-z0-9._-]{8,}|\b\d{13,19}\b)/i;

function storageAvailable() {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

function tokenize(text: string) {
  return Array.from(new Set((text.toLocaleLowerCase("vi-VN").match(/[\p{L}\p{N}][\p{L}\p{N}_-]{1,}/gu) ?? []).filter(token => token.length > 2 && !STOP_WORDS.has(token)))).slice(0, 18);
}

function extractEntities(text: string) {
  const normalized = text.toLocaleLowerCase("vi-VN");
  const known = ["chiến dịch", "dự án", "sản phẩm", "blog", "tra cứu", "đăng nhập", "bảo mật", "chính sách", "tài khoản", "gây quỹ"];
  return known.filter(entity => normalized.includes(entity));
}

function validTrace(value: unknown, now: number): value is ZeroMemTrace {
  if (!value || typeof value !== "object") return false;
  const trace = value as Partial<ZeroMemTrace>;
  return trace.source === "platform-help" && typeof trace.id === "string" && typeof trace.sessionId === "string" && (trace.role === "user" || trace.role === "assistant") && typeof trace.text === "string" && Array.isArray(trace.entities) && Array.isArray(trace.keywords) && typeof trace.createdAt === "number" && typeof trace.expiresAt === "number" && trace.expiresAt > now && !SENSITIVE_PATTERN.test(trace.text);
}

function readAll(now = Date.now()) {
  if (!storageAvailable()) return [] as ZeroMemTrace[];
  try {
    const parsed = JSON.parse(sessionStorage.getItem(STORE_KEY) ?? "[]");
    const traces = Array.isArray(parsed) ? parsed.filter(item => validTrace(item, now)) : [];
    sessionStorage.setItem(STORE_KEY, JSON.stringify(traces));
    return traces;
  } catch {
    return [] as ZeroMemTrace[];
  }
}

function writeAll(traces: ZeroMemTrace[]) {
  if (storageAvailable()) sessionStorage.setItem(STORE_KEY, JSON.stringify(traces.slice(-ZERO_MEM_MAX_TRACES)));
}

function overlap(left: string[], right: string[]) {
  if (!left.length || !right.length) return 0;
  const rightSet = new Set(right);
  return left.filter(token => rightSet.has(token)).length / Math.max(left.length, right.length);
}

function normalizeScores(items: Array<{ id: string; score: number }>) {
  const values = items.map(item => item.score);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 0);
  return new Map(items.map(item => [item.id, max === min ? (item.score > 0 ? 1 : 0) : (item.score - min) / (max - min)]));
}

export function isZeroMemSensitive(text: string) {
  return SENSITIVE_PATTERN.test(text);
}

export function loadZeroMemTraces(sessionId: string, now = Date.now()) {
  return readAll(now).filter(trace => trace.sessionId === sessionId).sort((left, right) => left.createdAt - right.createdAt);
}

export function appendZeroMemTrace(sessionId: string, role: ZeroMemRole, text: string, now = Date.now()) {
  const current = readAll(now);
  const normalized = text.trim().replace(/\s+/g, " ").slice(0, ZERO_MEM_MAX_TEXT_LENGTH);
  if (!normalized || isZeroMemSensitive(normalized)) return { traces: current.filter(trace => trace.sessionId === sessionId), accepted: false };
  const trace: ZeroMemTrace = {
    id: `${now}-${Math.random().toString(36).slice(2, 9)}`,
    sessionId,
    role,
    text: normalized,
    entities: extractEntities(normalized),
    keywords: tokenize(normalized),
    createdAt: now,
    expiresAt: now + ZERO_MEM_TTL_MS,
    source: "platform-help",
  };
  const next = [...current, trace].slice(-ZERO_MEM_MAX_TRACES);
  writeAll(next);
  return { traces: next.filter(item => item.sessionId === sessionId), accepted: true };
}

export function clearZeroMemTraces(sessionId: string, now = Date.now()) {
  const remaining = readAll(now).filter(trace => trace.sessionId !== sessionId);
  writeAll(remaining);
}

export function retrieveZeroMemEvidence(question: string, traces: ZeroMemTrace[], now = Date.now()): ZeroMemEvidence[] {
  const eligible = traces.filter(trace => trace.expiresAt > now && !isZeroMemSensitive(trace.text));
  if (!eligible.length) return [];
  const queryKeywords = tokenize(question);
  const queryEntities = extractEntities(question);
  const temporalQuestion = /(trước|vừa|mới|nhắc lại|tiếp tục|gần đây|lần trước)/i.test(question);
  const relationalQuestion = /(và|liên quan|khác nhau|so sánh|giữa|cùng)/i.test(question) || queryEntities.length > 1;
  const graphRaw = eligible.map((trace, index) => {
    const lexical = overlap(queryKeywords, trace.keywords);
    const entity = overlap(queryEntities, trace.entities);
    const neighborEntity = eligible.slice(Math.max(0, index - 1), index + 2).reduce((sum, neighbor) => sum + overlap(queryEntities, neighbor.entities), 0) / Math.min(3, eligible.length);
    return { id: trace.id, score: lexical * 0.45 + entity * 0.4 + neighborEntity * 0.15 };
  });
  const temporalRaw = eligible.map((trace, index) => {
    const lexical = overlap(queryKeywords, trace.keywords);
    const recency = Math.max(0, 1 - (now - trace.createdAt) / ZERO_MEM_TTL_MS);
    const local = index === eligible.length - 1 ? 1 : index === eligible.length - 2 ? 0.65 : 0.2;
    return { id: trace.id, score: lexical * 0.45 + recency * 0.25 + local * (temporalQuestion ? 0.3 : 0.15) };
  });
  const graph = normalizeScores(graphRaw);
  const temporal = normalizeScores(temporalRaw);
  const primaryGraph = relationalQuestion;
  const primaryWeight = 0.6;
  const ranked = eligible.map(trace => {
    const graphScore = graph.get(trace.id) ?? 0;
    const temporalScore = temporal.get(trace.id) ?? 0;
    const score = primaryGraph ? primaryWeight * graphScore + (1 - primaryWeight) * temporalScore : primaryWeight * temporalScore + (1 - primaryWeight) * graphScore;
    return { ...trace, graphScore, temporalScore, score };
  }).sort((left, right) => right.score - left.score);
  const mains = ranked.slice(0, 3);
  const closure = new Map(mains.map(trace => [trace.id, trace]));
  for (const main of mains) {
    const index = eligible.findIndex(trace => trace.id === main.id);
    for (const neighbor of [eligible[index - 1], eligible[index + 1]]) if (neighbor && !closure.has(neighbor.id)) closure.set(neighbor.id, { ...neighbor, graphScore: graph.get(neighbor.id) ?? 0, temporalScore: temporal.get(neighbor.id) ?? 0, score: (graph.get(neighbor.id) ?? 0) * 0.4 + (temporal.get(neighbor.id) ?? 0) * 0.6 });
  }
  return Array.from(closure.values()).filter(trace => trace.expiresAt > now && trace.text.length <= ZERO_MEM_MAX_TEXT_LENGTH).sort((left, right) => right.score - left.score).slice(0, 5);
}
