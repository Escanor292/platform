/** Alias id cũ → id canonical. Picker không hiện alias. */
export const TAG_ALIASES: Record<string, string> = {
  "thanh-thi": "urban",
  "nong-thon": "rural",
  "ngan-han": "short-term",
  "dai-han": "long-term",
  "tac-dong-xa-hoi": "social-impact",
  "doanh-nghiep-xa-hoi": "social-enterprise",
};

export const HIDDEN_ALIAS_TAG_IDS = new Set(Object.keys(TAG_ALIASES));

export function canonicalizeTagId(tagId: string): string {
  return TAG_ALIASES[tagId] || tagId;
}

export function canonicalizeTagIds(tagIds: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of tagIds) {
    if (typeof raw !== "string" || !raw.trim()) continue;
    const id = canonicalizeTagId(raw.trim());
    if (seen.has(id)) continue;
    seen.add(id);
    result.push(id);
  }
  return result;
}
