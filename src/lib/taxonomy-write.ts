import { isMainCategory, sanitizeSelectedTags } from "@/lib/taxonomy-helpers";
import type { MainCategory } from "@/types/taxonomy";

export function resolveCampaignTaxonomyInput(body: {
  mainCategory?: unknown;
  category?: unknown;
  starterTags?: unknown;
  tags?: unknown;
}): { category: MainCategory; tags: string[] } | { error: string } {
  const rawCategory = body.mainCategory || body.category;
  if (!isMainCategory(rawCategory)) {
    return { error: "Danh mục chính không hợp lệ" };
  }

  const rawTags = Array.isArray(body.starterTags)
    ? body.starterTags
    : Array.isArray(body.tags)
      ? body.tags
      : [];
  const tagIds = rawTags.filter((tag): tag is string => typeof tag === "string");

  return {
    category: rawCategory,
    tags: sanitizeSelectedTags(tagIds, rawCategory),
  };
}

export function parseCampaignType(value: unknown): "REWARD" | "DONATION" | null {
  if (value === "REWARD" || value === "DONATION") return value;
  return null;
}
