// Taxonomy Helper Functions
import type {
  MainCategory,
  StarterTag,
  TagGroup,
  CampaignTaxonomySelection,
  ValidationResult,
} from "@/types/taxonomy";
import { TAXONOMY_DATA } from "@/data/taxonomy";
import { MAX_STARTER_TAGS } from "@/types/taxonomy";

/**
 * Get all allowed tag groups for a specific main category
 */
export function getAllowedTagGroups(mainCategory: MainCategory | null): TagGroup[] {
  if (!mainCategory) return [];
  const categoryTaxonomy = TAXONOMY_DATA.starterTagsByCategory[mainCategory];
  if (!categoryTaxonomy) return [];
  return categoryTaxonomy.allowedTagGroups;
}

/**
 * Get all starter tags for a specific main category
 */
export function getStarterTagsForCategory(mainCategory: MainCategory | null): StarterTag[] {
  if (!mainCategory) return [];

  const categoryTaxonomy = TAXONOMY_DATA.starterTagsByCategory[mainCategory];
  if (!categoryTaxonomy) return [];

  const allowedGroups = categoryTaxonomy.allowedTagGroups;

  // Collect all tags from allowed groups
  const allTags: StarterTag[] = [];
  allowedGroups.forEach((group) => {
    const groupTags = categoryTaxonomy.tagGroups[group] || [];
    allTags.push(...groupTags);
  });

  return allTags;
}

/**
 * Get starter tags for a specific tag group within a main category
 */
export function getStarterTagsByGroup(
  mainCategory: MainCategory | null,
  tagGroup: TagGroup
): StarterTag[] {
  if (!mainCategory) return [];

  const categoryTaxonomy = TAXONOMY_DATA.starterTagsByCategory[mainCategory];
  if (!categoryTaxonomy) return [];

  // Check if this tag group is allowed for this category
  if (!categoryTaxonomy.allowedTagGroups.includes(tagGroup)) {
    return [];
  }

  return categoryTaxonomy.tagGroups[tagGroup] || [];
}

/**
 * Get recommended starter tags for a main category (top tags to show first)
 */
export function getRecommendedStarterTags(mainCategory: MainCategory | null): StarterTag[] {
  if (!mainCategory) return [];

  const categoryTaxonomy = TAXONOMY_DATA.starterTagsByCategory[mainCategory];
  if (!categoryTaxonomy) return [];

  const recommendedIds = categoryTaxonomy.recommendedStarterTags;

  return TAXONOMY_DATA.allStarterTags.filter((tag) => recommendedIds.includes(tag.id));
}

/**
 * Check if a starter tag is allowed for a specific main category
 */
export function isTagAllowedForCategory(
  tagId: string,
  mainCategory: MainCategory | null
): boolean {
  if (!mainCategory) return false;

  const categoryTaxonomy = TAXONOMY_DATA.starterTagsByCategory[mainCategory];
  if (!categoryTaxonomy) return false;

  // Check if tag is in disallowed list
  if (categoryTaxonomy.disallowedStarterTags.includes(tagId)) {
    return false;
  }

  // Check if tag exists in any allowed tag group
  const allowedTags = getStarterTagsForCategory(mainCategory);
  return allowedTags.some((tag) => tag.id === tagId);
}

/**
 * Filter selected tags to only include those allowed for the current main category
 */
export function sanitizeSelectedTags(
  selectedTags: string[],
  mainCategory: MainCategory | null
): string[] {
  if (!mainCategory) return [];

  return selectedTags.filter((tagId) => isTagAllowedForCategory(tagId, mainCategory));
}

/**
 * Validate campaign taxonomy selection
 */
export function validateTaxonomySelection(
  selection: CampaignTaxonomySelection
): ValidationResult {
  const errors: string[] = [];

  // Main category is required
  if (!selection.mainCategory) {
    errors.push("Vui lòng chọn danh mục chính cho chiến dịch");
  }

  // Không giới hạn số lượng tags nữa
  // if (selection.starterTags.length > MAX_STARTER_TAGS) {
  //   errors.push(`Chỉ được chọn tối đa ${MAX_STARTER_TAGS} thẻ phụ`);
  // }

  // Check if all selected tags are allowed for the main category
  if (selection.mainCategory) {
    const invalidTags = selection.starterTags.filter(
      (tagId) => !isTagAllowedForCategory(tagId, selection.mainCategory)
    );

    if (invalidTags.length > 0) {
      errors.push(
        `Các thẻ sau không phù hợp với danh mục "${selection.mainCategory}": ${invalidTags.join(", ")}`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get tag object by ID
 */
export function getTagById(tagId: string): StarterTag | undefined {
  return TAXONOMY_DATA.allStarterTags.find((tag) => tag.id === tagId);
}

/**
 * Get multiple tag objects by IDs
 */
export function getTagsByIds(tagIds: string[]): StarterTag[] {
  return tagIds
    .map((id) => getTagById(id))
    .filter((tag): tag is StarterTag => tag !== undefined);
}

/**
 * Search tags within a main category
 */
export function searchTagsInCategory(
  query: string,
  mainCategory: MainCategory | null
): StarterTag[] {
  if (!mainCategory || !query.trim()) return [];

  const allowedTags = getStarterTagsForCategory(mainCategory);
  const lowerQuery = query.toLowerCase().trim();

  return allowedTags.filter(
    (tag) =>
      tag.label.toLowerCase().includes(lowerQuery) ||
      tag.id.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get tag groups with their tags for a main category
 */
export function getTagGroupsWithTags(
  mainCategory: MainCategory | null
): Record<TagGroup, StarterTag[]> {
  if (!mainCategory) return {} as Record<TagGroup, StarterTag[]>;

  const categoryTaxonomy = TAXONOMY_DATA.starterTagsByCategory[mainCategory];

  // Check if categoryTaxonomy exists
  if (!categoryTaxonomy) {
    console.warn(`[taxonomy-helpers] No taxonomy data found for category: ${mainCategory}`);
    return {} as Record<TagGroup, StarterTag[]>;
  }

  const result: Partial<Record<TagGroup, StarterTag[]>> = {};

  categoryTaxonomy.allowedTagGroups.forEach((group) => {
    result[group] = categoryTaxonomy.tagGroups[group] || [];
  });

  return result as Record<TagGroup, StarterTag[]>;
}

/**
 * Check if changing main category would invalidate any selected tags
 */
export function getInvalidTagsForNewCategory(
  currentTags: string[],
  newCategory: MainCategory
): string[] {
  return currentTags.filter((tagId) => !isTagAllowedForCategory(tagId, newCategory));
}

/**
 * Get statistics about taxonomy
 */
export function getTaxonomyStats() {
  const stats = {
    totalCategories: TAXONOMY_DATA.mainCategories.length,
    totalTags: TAXONOMY_DATA.allStarterTags.length,
    tagsByCategory: {} as Record<MainCategory, number>,
    tagsByGroup: {} as Record<TagGroup, number>,
  };

  // Count tags by category
  TAXONOMY_DATA.mainCategories.forEach((category) => {
    const tags = getStarterTagsForCategory(category);
    stats.tagsByCategory[category] = tags.length;
  });

  // Count tags by group
  TAXONOMY_DATA.allStarterTags.forEach((tag) => {
    if (!stats.tagsByGroup[tag.group]) {
      stats.tagsByGroup[tag.group] = 0;
    }
    stats.tagsByGroup[tag.group]++;
  });

  return stats;
}
