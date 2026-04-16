# 🏷️ Campaign Taxonomy System

Hệ thống phân loại chiến dịch hoàn chỉnh cho nền tảng crowdfunding với 10 danh mục chính và 200+ thẻ phụ được tổ chức thông minh.

## 🚀 Quick Start

### 1. Xem Demo

```bash
npm run dev
```

Truy cập: `http://localhost:3000/demo/taxonomy`

### 2. Sử dụng trong Form

```tsx
import { CreateCampaignForm } from "@/components/create-campaign/create-campaign-form";

export default function Page() {
  return <CreateCampaignForm />;
}
```

### 3. Sử dụng Helper Functions

```typescript
import {
  getStarterTagsForCategory,
  validateTaxonomySelection,
  sanitizeSelectedTags,
} from "@/lib/taxonomy-helpers";

// Lấy tags cho category
const tags = getStarterTagsForCategory("Công nghệ");

// Validate selection
const result = validateTaxonomySelection({
  mainCategory: "Công nghệ",
  starterTags: ["mobile-app", "ai", "prototype"],
});

// Sanitize tags khi đổi category
const cleanTags = sanitizeSelectedTags(selectedTags, newCategory);
```

## 📁 File Structure

```
src/
├── types/taxonomy.ts                    # TypeScript types & constants
├── data/
│   ├── taxonomy.ts                      # Complete taxonomy data
│   └── taxonomy-examples.json           # Example campaigns & API shapes
├── lib/
│   └── taxonomy-helpers.ts              # Helper functions
├── components/create-campaign/
│   ├── category-selector.tsx            # Main category selector
│   ├── tag-group-section.tsx            # Tag group display
│   ├── starter-tags-selector.tsx        # Tags selector with search
│   └── create-campaign-form.tsx         # Complete form with validation
├── app/
│   ├── demo/taxonomy/page.tsx           # Demo page
│   └── api/taxonomy/
│       ├── route.ts                     # GET /api/taxonomy
│       ├── [category]/route.ts          # GET /api/taxonomy/:category
│       └── search/route.ts              # GET /api/taxonomy/search
└── TAXONOMY_DOCUMENTATION.md            # Complete documentation
```

## 🎯 Main Features

### ✅ 10 Main Categories
- Giáo dục
- Y tế
- Cộng đồng
- Công nghệ
- Nghệ thuật
- Môi trường
- Nông nghiệp
- Giải trí
- Kinh doanh
- Khẩn cấp & Từ thiện

### ✅ 200+ Starter Tags
Organized into 10 semantic groups:
- Loại nội dung
- Định dạng phát hành
- Mục đích / Phong cách
- Loại sản phẩm
- Công nghệ / Kỹ thuật
- Giai đoạn phát triển
- Mô hình / Vận hành
- Đối tượng hưởng lợi
- Phạm vi
- Thời gian

### ✅ Smart Filtering
- Tự động lọc tags theo category
- Disallow list để loại bỏ tags không phù hợp
- Recommended tags cho mỗi category

### ✅ UX Optimized
- Progressive disclosure
- Real-time search
- Visual feedback
- Validation with clear errors
- Category change warning

### ✅ Production Ready
- TypeScript types
- Validation rules
- Helper functions
- API routes
- Complete documentation

## 📊 Data Structure

### Main Category

```typescript
type MainCategory = 
  | "Giáo dục"
  | "Y tế"
  | "Cộng đồng"
  | "Công nghệ"
  | "Nghệ thuật"
  | "Môi trường"
  | "Nông nghiệp"
  | "Giải trí"
  | "Kinh doanh"
  | "Khẩn cấp & Từ thiện";
```

### Starter Tag

```typescript
interface StarterTag {
  id: string;              // "mobile-app"
  label: string;           // "Mobile app"
  group: TagGroup;         // "Định dạng phát hành"
  description?: string;    // Optional description
}
```

### Category Taxonomy

```typescript
interface CategoryTaxonomy {
  allowedTagGroups: TagGroup[];           // Groups allowed for this category
  recommendedStarterTags: string[];       // Top 8-10 tags to show first
  disallowedStarterTags: string[];        // Tags that should never appear
  tagGroups: Record<TagGroup, StarterTag[]>;
}
```

### Campaign Selection

```typescript
interface CampaignTaxonomySelection {
  mainCategory: MainCategory | null;
  starterTags: string[];  // Max 5 tag IDs
}
```

## 🔧 API Endpoints

### GET /api/taxonomy
Returns taxonomy overview

```json
{
  "success": true,
  "data": {
    "mainCategories": ["Giáo dục", "Y tế", ...],
    "tagGroups": ["Loại nội dung", ...],
    "stats": {
      "totalCategories": 10,
      "totalTags": 200,
      "tagsByCategory": { ... }
    }
  }
}
```

### GET /api/taxonomy/:category
Returns taxonomy for specific category

```json
{
  "success": true,
  "data": {
    "category": "Công nghệ",
    "allowedTagGroups": [...],
    "recommendedStarterTags": [...],
    "tagGroups": { ... },
    "stats": { ... }
  }
}
```

### GET /api/taxonomy/search?q=query&category=category
Search tags

```json
{
  "success": true,
  "data": {
    "query": "app",
    "category": "Công nghệ",
    "results": [...],
    "count": 5
  }
}
```

## 🎨 Component Usage

### Category Selector

```tsx
<CategorySelector
  selectedCategory={category}
  onCategoryChange={(cat) => setCategory(cat)}
  disabled={false}
/>
```

### Starter Tags Selector

```tsx
<StarterTagsSelector
  mainCategory={category}
  selectedTags={tags}
  onTagsChange={(tags) => setTags(tags)}
/>
```

### Complete Form

```tsx
<CreateCampaignForm />
```

## ✅ Validation Rules

| Rule | Limit | Error Message |
|------|-------|---------------|
| Main Category | Required | "Vui lòng chọn danh mục chính cho chiến dịch" |
| Starter Tags | Max 5 | "Chỉ được chọn tối đa 5 thẻ phụ" |
| Allowed Tags | Must be in allowedStarterTags | "Các thẻ sau không phù hợp với danh mục..." |

## 🎯 Example Use Cases

### 1. App học tiếng Anh

```typescript
{
  mainCategory: "Giáo dục",
  starterTags: ["mobile-app", "khoa-hoc", "edtech", "tre-em", "online"]
}
```

### 2. Indie Game

```typescript
{
  mainCategory: "Giải trí",
  starterTags: ["video-game", "indie", "unity", "prototype", "gamers"]
}
```

### 3. Webtoon Series

```typescript
{
  mainCategory: "Nghệ thuật",
  starterTags: ["webtoon", "digital", "storytelling", "series", "indie"]
}
```

### 4. IoT Nông nghiệp

```typescript
{
  mainCategory: "Nông nghiệp",
  starterTags: ["agritech", "iot", "sensor", "pilot", "nong-dan"]
}
```

### 5. Cứu trợ thiên tai

```typescript
{
  mainCategory: "Khẩn cấp & Từ thiện",
  starterTags: ["donation", "urgent", "nan-nhan-thien-tai", "local", "short-term"]
}
```

## 🗄️ Database Integration

### Prisma Schema

```prisma
model Campaign {
  id              String   @id @default(cuid())
  title           String
  slug            String   @unique
  mainCategory    String
  starterTags     String[]
  
  @@index([mainCategory])
  @@index([starterTags])
}
```

### Query Examples

```typescript
// Find campaigns by category
const campaigns = await prisma.campaign.findMany({
  where: {
    mainCategory: "Công nghệ"
  }
});

// Find campaigns by tag
const campaigns = await prisma.campaign.findMany({
  where: {
    starterTags: {
      has: "mobile-app"
    }
  }
});

// Find campaigns by multiple tags
const campaigns = await prisma.campaign.findMany({
  where: {
    starterTags: {
      hasEvery: ["mobile-app", "ai"]
    }
  }
});
```

## 🧪 Testing

### Test Helper Functions

```typescript
import { describe, it, expect } from "vitest";
import { isTagAllowedForCategory } from "@/lib/taxonomy-helpers";

describe("Taxonomy Helpers", () => {
  it("should allow valid tags for category", () => {
    expect(isTagAllowedForCategory("mobile-app", "Công nghệ")).toBe(true);
  });
  
  it("should disallow invalid tags for category", () => {
    expect(isTagAllowedForCategory("manga", "Y tế")).toBe(false);
  });
});
```

## 📈 Statistics

- **Total Categories**: 10
- **Total Tags**: 200+
- **Tag Groups**: 10
- **Max Tags per Campaign**: 5
- **Recommended Tags per Category**: 8-10

## 🔮 Future Enhancements

### Phase 2
- [ ] Custom tags with admin approval
- [ ] Tag analytics and popularity tracking
- [ ] ML-based tag recommendations
- [ ] Multi-language support
- [ ] Tag relationships (synonyms, related tags)

### Phase 3
- [ ] Custom taxonomies for organizations
- [ ] GraphQL API
- [ ] Admin dashboard for taxonomy management
- [ ] A/B testing for tag sets

## 📚 Documentation

- **Complete Documentation**: See `TAXONOMY_DOCUMENTATION.md`
- **API Examples**: See `src/data/taxonomy-examples.json`
- **Type Definitions**: See `src/types/taxonomy.ts`

## 🤝 Contributing

When adding new tags or categories:

1. Update `src/data/taxonomy.ts`
2. Update type definitions if needed
3. Update documentation
4. Test with validation functions
5. Update examples

## 📝 Notes

- All tag IDs use kebab-case
- Tag labels can be Vietnamese or English
- Disallowed tags are explicitly listed
- System designed for easy expansion
- All code is production-ready

## 🎉 Credits

Built with:
- Next.js 14
- TypeScript
- Tailwind CSS
- React

---

**Version**: 1.0.0  
**Last Updated**: 2026-04-15
