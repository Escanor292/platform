// Campaign Taxonomy Types

export const MAIN_CATEGORIES = [
  "Giáo dục",
  "Y tế",
  "Cộng đồng",
  "Công nghệ",
  "Nghệ thuật",
  "Môi trường",
  "Nông nghiệp",
  "Giải trí",
  "Kinh doanh",
  "Khẩn cấp & Từ thiện",
] as const;

export type MainCategory = (typeof MAIN_CATEGORIES)[number];

export const TAG_GROUPS = [
  "Loại nội dung",
  "Định dạng phát hành",
  "Mục đích / Phong cách",
  "Loại sản phẩm",
  "Công nghệ / Kỹ thuật",
  "Giai đoạn phát triển",
  "Mô hình / Vận hành",
  "Đối tượng hưởng lợi",
  "Phạm vi",
  "Thời gian",
] as const;

export type TagGroup = (typeof TAG_GROUPS)[number];

export interface StarterTag {
  id: string;
  label: string;
  group: TagGroup;
  description?: string;
}

export interface CategoryTaxonomy {
  allowedTagGroups: TagGroup[];
  recommendedStarterTags: string[]; // Top 8-10 tags to show first
  disallowedStarterTags: string[]; // Tags that should never appear
  tagGroups: Record<TagGroup, StarterTag[]>;
}

export interface TaxonomyData {
  mainCategories: readonly MainCategory[];
  starterTagsByCategory: Record<MainCategory, CategoryTaxonomy>;
  allStarterTags: StarterTag[];
}

export interface CampaignTaxonomySelection {
  mainCategory: MainCategory | null;
  starterTags: string[]; // Array of tag IDs - không giới hạn
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Không giới hạn số lượng tags
export const MAX_STARTER_TAGS = null; // null = unlimited
export const RECOMMENDED_TAGS_PER_GROUP = 3;
