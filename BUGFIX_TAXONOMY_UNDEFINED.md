# Fix: Cannot read properties of undefined (reading 'allowedTagGroups')

## Vấn đề
Khi vào trang chỉnh sửa dự án, gặp lỗi:
```
Cannot read properties of undefined (reading 'allowedTagGroups')
at getTagGroupsWithTags (src\lib\taxonomy-helpers.ts:186:20)
```

## Nguyên nhân

### 1. Category không hợp lệ
- Campaign trong database có `category` không khớp với `MainCategory` type
- Ví dụ: database có "Technology" nhưng type chỉ chấp nhận "Công nghệ"
- Khi pass vào taxonomy helpers, `TAXONOMY_DATA.starterTagsByCategory[mainCategory]` trả về `undefined`

### 2. Thiếu null checks
Các function trong `taxonomy-helpers.ts` không kiểm tra xem `categoryTaxonomy` có tồn tại không trước khi access properties:
```typescript
// Trước (lỗi):
const categoryTaxonomy = TAXONOMY_DATA.starterTagsByCategory[mainCategory];
categoryTaxonomy.allowedTagGroups.forEach(...) // Crash nếu undefined

// Sau (đã fix):
const categoryTaxonomy = TAXONOMY_DATA.starterTagsByCategory[mainCategory];
if (!categoryTaxonomy) return [];
categoryTaxonomy.allowedTagGroups.forEach(...)
```

## Giải pháp đã áp dụng

### 1. Thêm null checks trong taxonomy-helpers.ts

Đã fix 6 functions:

#### getAllowedTagGroups
```typescript
export function getAllowedTagGroups(mainCategory: MainCategory | null): TagGroup[] {
  if (!mainCategory) return [];
  const categoryTaxonomy = TAXONOMY_DATA.starterTagsByCategory[mainCategory];
  if (!categoryTaxonomy) return []; // ✅ Added
  return categoryTaxonomy.allowedTagGroups;
}
```

#### getStarterTagsForCategory
```typescript
export function getStarterTagsForCategory(mainCategory: MainCategory | null): StarterTag[] {
  if (!mainCategory) return [];
  const categoryTaxonomy = TAXONOMY_DATA.starterTagsByCategory[mainCategory];
  if (!categoryTaxonomy) return []; // ✅ Added
  // ...
}
```

#### getStarterTagsByGroup
```typescript
export function getStarterTagsByGroup(
  mainCategory: MainCategory | null,
  tagGroup: TagGroup
): StarterTag[] {
  if (!mainCategory) return [];
  const categoryTaxonomy = TAXONOMY_DATA.starterTagsByCategory[mainCategory];
  if (!categoryTaxonomy) return []; // ✅ Added
  // ...
}
```

#### getRecommendedStarterTags
```typescript
export function getRecommendedStarterTags(mainCategory: MainCategory | null): StarterTag[] {
  if (!mainCategory) return [];
  const categoryTaxonomy = TAXONOMY_DATA.starterTagsByCategory[mainCategory];
  if (!categoryTaxonomy) return []; // ✅ Added
  // ...
}
```

#### isTagAllowedForCategory
```typescript
export function isTagAllowedForCategory(
  tagId: string,
  mainCategory: MainCategory | null
): boolean {
  if (!mainCategory) return false;
  const categoryTaxonomy = TAXONOMY_DATA.starterTagsByCategory[mainCategory];
  if (!categoryTaxonomy) return false; // ✅ Added
  // ...
}
```

#### getTagGroupsWithTags
```typescript
export function getTagGroupsWithTags(
  mainCategory: MainCategory | null
): Record<TagGroup, StarterTag[]> {
  if (!mainCategory) return {} as Record<TagGroup, StarterTag[]>;
  const categoryTaxonomy = TAXONOMY_DATA.starterTagsByCategory[mainCategory];
  if (!categoryTaxonomy) {
    console.warn(`[taxonomy-helpers] No taxonomy data found for category: ${mainCategory}`);
    return {} as Record<TagGroup, StarterTag[]>;
  }
  // ...
}
```

### 2. Validate category trong CampaignEditForm

```typescript
import { MAIN_CATEGORIES } from "@/types/taxonomy";

const [formData, setFormData] = useState({
  // ...
  mainCategory: (campaign.category && MAIN_CATEGORIES.includes(campaign.category as any)) 
    ? (campaign.category as MainCategory) 
    : null, // ✅ Fallback to null if invalid
  // ...
});

console.log("[CampaignEditForm] Initial data:", {
  campaignCategory: campaign.category,
  isValidCategory: campaign.category && MAIN_CATEGORIES.includes(campaign.category as any),
  mainCategory: formData.mainCategory,
  // ...
});
```

## Cách test

### 1. Test với category hợp lệ
```typescript
// Campaign có category = "Công nghệ"
// ✅ Nên load đúng tags và không có lỗi
```

### 2. Test với category không hợp lệ
```typescript
// Campaign có category = "Technology" (tiếng Anh)
// ✅ mainCategory = null
// ✅ Không crash
// ✅ Hiển thị form để chọn category mới
```

### 3. Test với category null
```typescript
// Campaign có category = null
// ✅ mainCategory = null
// ✅ Không crash
// ✅ Hiển thị form để chọn category
```

### 4. Kiểm tra console logs
```
[CampaignEditForm] Initial data: {
  campaignCategory: "Công nghệ",
  isValidCategory: true,
  mainCategory: "Công nghệ",
  ...
}
```

## Các category hợp lệ

Theo `src/types/taxonomy.ts`:
```typescript
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
```

## Migration script (nếu cần)

Nếu database có nhiều campaigns với category không hợp lệ:

```sql
-- Kiểm tra các category không hợp lệ
SELECT DISTINCT category 
FROM campaigns 
WHERE category NOT IN (
  'Giáo dục',
  'Y tế',
  'Cộng đồng',
  'Công nghệ',
  'Nghệ thuật',
  'Môi trường',
  'Nông nghiệp',
  'Giải trí',
  'Kinh doanh',
  'Khẩn cấp & Từ thiện'
);

-- Update nếu cần (ví dụ)
UPDATE campaigns 
SET category = 'Công nghệ' 
WHERE category = 'Technology';
```

## Kết luận

Sau khi fix:
- ✅ Không còn crash khi category không hợp lệ
- ✅ Graceful fallback về null
- ✅ Có logging để debug
- ✅ Tất cả taxonomy helpers đều safe
- ✅ User có thể chọn lại category đúng
