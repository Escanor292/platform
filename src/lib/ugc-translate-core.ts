export const UGC_TRANSLATE_MAX_ITEMS = 24;
export const UGC_TRANSLATE_MAX_CHARS = 1_200;

const VN_RE = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

export function hashUgcText(text: string): string {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

export function needsTranslation(text: string | null | undefined): boolean {
  if (!text) return false;
  const trimmed = text.trim();
  if (trimmed.length < 2) return false;
  return VN_RE.test(trimmed);
}

export function cacheKey(text: string, target: string = "en"): string {
  return `ugc-tr:${target}:${hashUgcText(text)}`;
}
