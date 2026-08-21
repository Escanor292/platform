const VIETNAMESE_STOP_WORDS = new Set(
  [
    "và", "là", "của", "cho", "một", "những", "các", "trong", "với", "được", "đã", "đang",
    "từ", "này", "đó", "khi", "theo", "trên", "về", "sẽ", "có", "không", "như", "để", "tại",
    "nhà", "người", "sản", "phẩm", "dự", "án", "chiến", "dịch", "bài", "viết", "thông", "tin",
    "mục", "tiêu", "giúp", "cùng", "thêm", "hơn", "rất", "đang", "đây", "bạn", "chúng", "tôi",
  ].map(word => word.toLowerCase()),
);

export function cleanText(input: unknown): string {
  if (input === null || input === undefined) return "";
  if (typeof input === "string") {
    return input
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/\s+/g, " ")
      .trim();
  }
  if (Array.isArray(input)) return input.map(cleanText).filter(Boolean).join(" ");
  if (typeof input === "object") return flattenRichContent(input);
  return String(input);
}

export function flattenRichContent(input: unknown): string {
  if (input === null || input === undefined) return "";
  if (typeof input === "string" || typeof input === "number" || typeof input === "boolean") {
    return String(input);
  }
  if (Array.isArray(input)) return input.map(flattenRichContent).filter(Boolean).join(" ");
  if (typeof input === "object") {
    const record = input as Record<string, unknown>;
    return Object.entries(record)
      .filter(([key]) => !["id", "type", "attrs", "marks"].includes(key))
      .map(([, value]) => flattenRichContent(value))
      .filter(Boolean)
      .join(" ");
  }
  return "";
}

export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?。！？])\s+/)
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length >= 28);
}

export function extractKeywords(text: string, limit = 8): string[] {
  const counts = new Map<string, number>();
  const tokens = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .match(/[a-z0-9à-ỹ]{4,}/gi) ?? [];

  for (const token of tokens) {
    if (VIETNAMESE_STOP_WORDS.has(token)) continue;
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .slice(0, limit)
    .map(([word]) => word);
}

export function truncateText(text: string, maxLength = 12000): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}\n[Đã rút gọn để bảo vệ hiệu năng]`;
}

export function safeString(value: unknown, fallback = "Chưa cập nhật"): string {
  const cleaned = cleanText(value);
  return cleaned || fallback;
}
