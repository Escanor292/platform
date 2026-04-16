# Campaign Taxonomy System - Complete Documentation

## 📋 Table of Contents

1. [Product Summary](#product-summary)
2. [Taxonomy Design Principles](#taxonomy-design-principles)
3. [Main Categories](#main-categories)
4. [Taxonomy Matrix by Category](#taxonomy-matrix-by-category)
5. [Implementation Guide](#implementation-guide)
6. [API Reference](#api-reference)
7. [Example Campaign Mappings](#example-campaign-mappings)
8. [Database Schema](#database-schema)
9. [Future Improvements](#future-improvements)

---

## 🎯 Product Summary

Đây là hệ thống phân loại chiến dịch (Campaign Taxonomy) cho nền tảng crowdfunding tổng quát, hỗ trợ đa dạng loại chiến dịch từ giáo dục, y tế, công nghệ, nghệ thuật đến từ thiện.

### Key Features

- **10 Main Categories**: Phân loại rõ ràng, không chồng chéo
- **200+ Starter Tags**: Được tổ chức theo 10 nhóm semantic
- **Smart Filtering**: Tự động lọc tags phù hợp với category
- **UX Optimized**: Progressive disclosure, search, recommendations
- **Validation**: Built-in validation rules
- **Scalable**: Dễ mở rộng và maintain

---

## 🎨 Taxonomy Design Principles

### 1. Single Main Category Rule
- Mỗi campaign chỉ thuộc 1 main category
- Category phải được chọn trước khi chọn tags
- Đảm bảo focus và clarity

### 2. Contextual Starter Tags
- Tags chỉ hiện khi phù hợp với category đã chọn
- Mỗi category có `allowedTagGroups` và `disallowedStarterTags`
- Giảm cognitive load cho user

### 3. Semantic Grouping
Tags được nhóm theo ý nghĩa:
- **Loại nội dung**: Sản phẩm/dịch vụ cụ thể
- **Định dạng phát hành**: Cách thức delivery
- **Mục đích / Phong cách**: Tính chất và mục tiêu
- **Loại sản phẩm**: Phân loại sản phẩm
- **Công nghệ / Kỹ thuật**: Tech stack và approach
- **Giai đoạn phát triển**: Maturity level
- **Mô hình / Vận hành**: Business model
- **Đối tượng hưởng lợi**: Target beneficiaries
- **Phạm vi**: Geographic scope
- **Thời gian**: Timeline characteristics

### 4. Explicit Disallow List
- Mỗi category có danh sách tags bị cấm rõ ràng
- Tránh confusion và improve relevance
- Ví dụ: "Y tế" không hiện "manga", "video game"

### 5. Progressive Disclosure
- Hiện recommended tags trước (8-10 tags)
- Mỗi tag group hiện 6 tags đầu, còn lại trong "Xem thêm"
- Search để tìm nhanh

### 6. Cross-category Tags
Một số tags có thể dùng cho nhiều category:
- AI, IoT, Cloud
- Mobile app, Web app, Platform
- Prototype, MVP, Beta
- Workshop, Community-driven

---

## 📂 Main Categories

```typescript
const MAIN_CATEGORIES = [
  "Giáo dục",           // Education
  "Y tế",               // Healthcare
  "Cộng đồng",          // Community
  "Công nghệ",          // Technology
  "Nghệ thuật",         // Arts
  "Môi trường",         // Environment
  "Nông nghiệp",        // Agriculture
  "Giải trí",           // Entertainment
  "Kinh doanh",         // Business
  "Khẩn cấp & Từ thiện" // Emergency & Charity
];
```

---

## 🗂️ Taxonomy Matrix by Category

### 1. Giáo dục (Education)

**Allowed Tag Groups:**
- Loại nội dung
- Định dạng phát hành
- Mục đích / Phong cách
- Công nghệ / Kỹ thuật
- Giai đoạn phát triển
- Đối tượng hưởng lợi
- Phạm vi

**Recommended Tags:**
- khoa-hoc, hoc-lieu, mobile-app, web-app, edtech, online, tre-em, hoc-sinh

**Disallowed Tags:**
- manga, webtoon, artbook, album, video-game, board-game, fandom, merchandise, game-engine, unity, unreal, benh-nhan, nong-dan, nan-nhan-thien-tai, donation, urgent, agritech, healthtech, nong-san, thuc-pham

**Example Campaigns:**
- App học tiếng Anh cho trẻ em
- Khóa học lập trình online
- Platform giáo dục STEM
- Học liệu tương tác AR/VR

---

### 2. Y tế (Healthcare)

**Allowed Tag Groups:**
- Loại nội dung
- Định dạng phát hành
- Mục đích / Phong cách
- Loại sản phẩm
- Công nghệ / Kỹ thuật
- Giai đoạn phát triển
- Đối tượng hưởng lợi
- Phạm vi

**Recommended Tags:**
- thiet-bi, ung-dung, healthtech, mobile-app, ai, benh-nhan, prototype, mvp

**Disallowed Tags:**
- manga, webtoon, artbook, album, am-nhac, video-game, board-game, fandom, merchandise, game-engine, unity, unreal, nong-san, thuc-pham, agritech, nong-dan, gamers, storytelling

**Example Campaigns:**
- Thiết bị y tế thông minh
- App theo dõi sức khỏe
- Telemedicine platform
- Wearable health monitor

---

### 3. Cộng đồng (Community)

**Allowed Tag Groups:**
- Loại nội dung
- Định dạng phát hành
- Mục đích / Phong cách
- Giai đoạn phát triển
- Mô hình / Vận hành
- Đối tượng hưởng lợi
- Phạm vi
- Thời gian

**Recommended Tags:**
- su-kien, chuong-trinh, workshop, community-driven, social-impact, cong-dong-dia-phuong, local, non-profit

**Disallowed Tags:**
- manga, webtoon, artbook, album, video-game, board-game, fandom, merchandise, game-engine, unity, unreal, pre-order, retail-launch, mass-production, gamers

**Example Campaigns:**
- Chương trình hỗ trợ cộng đồng địa phương
- Workshop kỹ năng cho thanh niên
- Sự kiện văn hóa truyền thống
- Platform kết nối cộng đồng

---

### 4. Công nghệ (Technology)

**Allowed Tag Groups:**
- Loại nội dung
- Định dạng phát hành
- Mục đích / Phong cách
- Loại sản phẩm
- Công nghệ / Kỹ thuật
- Giai đoạn phát triển
- Mô hình / Vận hành
- Đối tượng hưởng lợi

**Recommended Tags:**
- mobile-app, web-app, platform, ai, iot, prototype, mvp, startup

**Disallowed Tags:**
- manga, webtoon, artbook, album, am-nhac, fandom, storytelling, nong-san, thuc-pham, benh-nhan, nan-nhan-thien-tai, donation, urgent

**Example Campaigns:**
- IoT smart home device
- AI-powered productivity app
- SaaS platform for businesses
- Blockchain solution
- Robotics project

---

### 5. Nghệ thuật (Arts)

**Allowed Tag Groups:**
- Loại nội dung
- Định dạng phát hành
- Mục đích / Phong cách
- Công nghệ / Kỹ thuật
- Giai đoạn phát triển
- Loại sản phẩm

**Recommended Tags:**
- truyen-tranh, webtoon, artbook, album, phim-ngan, digital, sach-in, indie

**Disallowed Tags:**
- thiet-bi, iot, sensor, drone, robot, agritech, healthtech, nong-san, thuc-pham, benh-nhan, nong-dan, nan-nhan-thien-tai, donation, urgent, b2b-solution

**Example Campaigns:**
- Truyện tranh indie
- Album nhạc độc lập
- Artbook minh họa
- Phim ngắn animation
- Webtoon series
- Triển lãm nghệ thuật

---

### 6. Môi trường (Environment)

**Allowed Tag Groups:**
- Loại nội dung
- Định dạng phát hành
- Mục đích / Phong cách
- Loại sản phẩm
- Công nghệ / Kỹ thuật
- Giai đoạn phát triển
- Mô hình / Vận hành
- Đối tượng hưởng lợi
- Phạm vi

**Recommended Tags:**
- san-pham-vat-ly, cleantech, renewable-energy, social-impact, bao-ton, prototype, cong-dong-dia-phuong, local

**Disallowed Tags:**
- manga, webtoon, artbook, album, am-nhac, video-game, board-game, fandom, merchandise, game-engine, unity, unreal, gamers, storytelling

**Example Campaigns:**
- Sản phẩm tái chế
- Năng lượng tái tạo
- Giải pháp giảm rác thải
- Dự án bảo tồn thiên nhiên

---

### 7. Nông nghiệp (Agriculture)

**Allowed Tag Groups:**
- Loại nội dung
- Định dạng phát hành
- Mục đích / Phong cách
- Loại sản phẩm
- Công nghệ / Kỹ thuật
- Giai đoạn phát triển
- Mô hình / Vận hành
- Đối tượng hưởng lợi
- Phạm vi

**Recommended Tags:**
- nong-san, thuc-pham, agritech, iot, marketplace, nong-dan, pilot, rural

**Disallowed Tags:**
- manga, webtoon, artbook, album, am-nhac, video-game, board-game, fandom, merchandise, game-engine, unity, unreal, benh-nhan, gamers, storytelling, healthtech

**Example Campaigns:**
- Nông sản sạch
- Hệ thống tưới thông minh
- Marketplace nông sản
- Drone giám sát nông nghiệp
- Sensor IoT cho nông trại

---

### 8. Giải trí (Entertainment)

**Allowed Tag Groups:**
- Loại nội dung
- Định dạng phát hành
- Mục đích / Phong cách
- Loại sản phẩm
- Công nghệ / Kỹ thuật
- Giai đoạn phát triển
- Đối tượng hưởng lợi

**Recommended Tags:**
- video-game, board-game, animation, indie, prototype, alpha, gamers, fandom

**Disallowed Tags:**
- benh-nhan, nong-dan, nan-nhan-thien-tai, donation, urgent, ngo, nong-san, thuc-pham, agritech, healthtech, hoc-lieu, giao-trinh

**Example Campaigns:**
- Indie video game
- Board game mới
- Animation series
- VR game experience
- Mobile game

---

### 9. Kinh doanh (Business)

**Allowed Tag Groups:**
- Loại nội dung
- Định dạng phát hành
- Mục đích / Phong cách
- Loại sản phẩm
- Công nghệ / Kỹ thuật
- Giai đoạn phát triển
- Mô hình / Vận hành
- Đối tượng hưởng lợi
- Phạm vi

**Recommended Tags:**
- startup, san-pham-vat-ly, dich-vu, mvp, pre-sale, commercial, doanh-nghiep, local

**Disallowed Tags:**
- manga, webtoon, artbook, album, am-nhac, video-game, board-game, fandom, game-engine, unity, unreal, benh-nhan, nan-nhan-thien-tai, donation, urgent, ngo

**Example Campaigns:**
- Local brand handmade
- Startup product launch
- B2B SaaS solution
- Franchise expansion
- Physical product pre-order

---

### 10. Khẩn cấp & Từ thiện (Emergency & Charity)

**Allowed Tag Groups:**
- Loại nội dung
- Mục đích / Phong cách
- Mô hình / Vận hành
- Đối tượng hưởng lợi
- Phạm vi
- Thời gian

**Recommended Tags:**
- donation, urgent, non-profit, social-impact, nan-nhan-thien-tai, benh-nhan, nguoi-ngheo, ongoing

**Disallowed Tags:**
- manga, webtoon, artbook, album, am-nhac, video-game, board-game, fandom, merchandise, game-engine, unity, unreal, pre-order, retail-launch, pre-sale, commercial, startup, equity, franchise, licensing, gamers, storytelling, mass-production

**Example Campaigns:**
- Cứu trợ thiên tai
- Hỗ trợ viện phí
- Quỹ từ thiện cho trẻ em
- Chương trình nhân đạo khẩn cấp

---

## 💻 Implementation Guide

### File Structure

```
src/
├── types/
│   └── taxonomy.ts              # TypeScript types
├── data/
│   └── taxonomy.ts              # Taxonomy data
├── lib/
│   └── taxonomy-helpers.ts      # Helper functions
├── components/
│   └── create-campaign/
│       ├── category-selector.tsx
│       ├── tag-group-section.tsx
│       ├── starter-tags-selector.tsx
│       └── create-campaign-form.tsx
└── app/
    └── demo/
        └── taxonomy/
            └── page.tsx         # Demo page
```

### Usage Example

```typescript
import { CreateCampaignForm } from "@/components/create-campaign/create-campaign-form";

export default function CreateCampaignPage() {
  return (
    <div className="container mx-auto py-8">
      <h1>Tạo chiến dịch mới</h1>
      <CreateCampaignForm />
    </div>
  );
}
```

### Validation

```typescript
import { validateTaxonomySelection } from "@/lib/taxonomy-helpers";

const selection = {
  mainCategory: "Công nghệ",
  starterTags: ["mobile-app", "ai", "prototype", "startup"],
};

const result = validateTaxonomySelection(selection);

if (!result.isValid) {
  console.error(result.errors);
}
```

---

## 📚 API Reference

### Helper Functions

#### `getAllowedTagGroups(mainCategory)`
Returns allowed tag groups for a category.

```typescript
const groups = getAllowedTagGroups("Công nghệ");
// ["Loại nội dung", "Định dạng phát hành", ...]
```

#### `getStarterTagsForCategory(mainCategory)`
Returns all starter tags for a category.

```typescript
const tags = getStarterTagsForCategory("Nghệ thuật");
// [{ id: "truyen-tranh", label: "Truyện tranh", ... }, ...]
```

#### `isTagAllowedForCategory(tagId, mainCategory)`
Checks if a tag is allowed for a category.

```typescript
const allowed = isTagAllowedForCategory("manga", "Nghệ thuật");
// true

const notAllowed = isTagAllowedForCategory("manga", "Y tế");
// false
```

#### `sanitizeSelectedTags(selectedTags, mainCategory)`
Filters tags to only include allowed ones.

```typescript
const sanitized = sanitizeSelectedTags(
  ["manga", "mobile-app", "benh-nhan"],
  "Công nghệ"
);
// ["mobile-app"]
```

#### `validateTaxonomySelection(selection)`
Validates the complete selection.

```typescript
const result = validateTaxonomySelection({
  mainCategory: "Giáo dục",
  starterTags: ["khoa-hoc", "mobile-app", "edtech"],
});
// { isValid: true, errors: [] }
```

---

## 🎯 Example Campaign Mappings

### Example 1: App học tiếng Anh

```json
{
  "mainCategory": "Giáo dục",
  "starterTags": ["mobile-app", "khoa-hoc", "edtech", "tre-em", "online"]
}
```

### Example 2: Indie game

```json
{
  "mainCategory": "Giải trí",
  "starterTags": ["video-game", "indie", "prototype", "unity", "gamers"]
}
```

### Example 3: Truyện tranh webtoon

```json
{
  "mainCategory": "Nghệ thuật",
  "starterTags": ["webtoon", "digital", "storytelling", "indie", "series"]
}
```

### Example 4: IoT nông nghiệp

```json
{
  "mainCategory": "Nông nghiệp",
  "starterTags": ["agritech", "iot", "sensor", "pilot", "nong-dan"]
}
```

### Example 5: Cứu trợ thiên tai

```json
{
  "mainCategory": "Khẩn cấp & Từ thiện",
  "starterTags": ["donation", "urgent", "nan-nhan-thien-tai", "local", "short-term"]
}
```

---

## 🗄️ Database Schema

### Prisma Schema

```prisma
model Campaign {
  id              String   @id @default(cuid())
  title           String
  slug            String   @unique
  description     String
  
  // Taxonomy fields
  mainCategory    String   // One of the 10 main categories
  starterTags     String[] // Array of tag IDs (max 5)
  
  // Other fields...
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([mainCategory])
  @@index([starterTags])
}

// Optional: Separate Tag model for flexibility
model Tag {
  id          String   @id // Same as tag ID in taxonomy
  label       String
  group       String   // Tag group name
  description String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([group])
}
```

### Migration

```sql
-- Add taxonomy columns to campaigns table
ALTER TABLE "Campaign" ADD COLUMN "mainCategory" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "starterTags" TEXT[];

-- Create indexes
CREATE INDEX "Campaign_mainCategory_idx" ON "Campaign"("mainCategory");
CREATE INDEX "Campaign_starterTags_idx" ON "Campaign" USING GIN ("starterTags");

-- Optional: Create tags table
CREATE TABLE "Tag" (
  "id" TEXT PRIMARY KEY,
  "label" TEXT NOT NULL,
  "group" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "Tag_group_idx" ON "Tag"("group");
```

---

## 🚀 Future Improvements

### Phase 2: Advanced Features

1. **Custom Tags**
   - Allow users to suggest new tags
   - Admin approval workflow
   - Tag popularity tracking

2. **Tag Analytics**
   - Most used tags per category
   - Tag combination patterns
   - Success rate by tag combination

3. **Smart Recommendations**
   - ML-based tag suggestions
   - Similar campaign analysis
   - Auto-categorization

4. **Multi-language Support**
   - English, Vietnamese translations
   - Localized tag labels
   - Search in multiple languages

5. **Tag Relationships**
   - Parent-child relationships
   - Synonyms and aliases
   - Related tags suggestions

6. **Advanced Filtering**
   - Filter campaigns by multiple tags
   - Boolean operators (AND, OR, NOT)
   - Saved filter presets

### Phase 3: Enterprise Features

1. **Custom Taxonomies**
   - Organization-specific categories
   - Private tag libraries
   - White-label taxonomy

2. **API Endpoints**
   - RESTful API for taxonomy
   - GraphQL support
   - Webhook notifications

3. **Admin Dashboard**
   - Taxonomy management UI
   - Usage statistics
   - A/B testing for tag sets

---

## 📊 Validation Rules Summary

| Rule | Description | Error Message |
|------|-------------|---------------|
| Main Category Required | Must select 1 main category | "Vui lòng chọn danh mục chính cho chiến dịch" |
| Max Tags | Maximum 5 starter tags | "Chỉ được chọn tối đa 5 thẻ phụ" |
| Allowed Tags Only | Tags must be allowed for category | "Các thẻ sau không phù hợp với danh mục..." |
| Category Change | Warn when changing category with selected tags | Shows modal with affected tags |

---

## 🎨 UX Rules

1. **Category First**: Must select main category before seeing tags
2. **Progressive Disclosure**: Show recommended tags first, then groups
3. **Visual Feedback**: Selected tags highlighted, disabled state clear
4. **Search**: Real-time search within allowed tags
5. **Validation**: Inline validation with clear error messages
6. **Confirmation**: Warn before removing tags on category change
7. **Mobile Friendly**: Responsive design, touch-friendly buttons

---

## 📝 Notes

- All tag IDs use kebab-case (e.g., "mobile-app", "tre-em")
- Tag labels can be in Vietnamese or English
- Disallowed tags are explicitly listed to prevent errors
- System is designed for easy expansion
- All code is production-ready, no pseudo-code

---

**Version**: 1.0.0  
**Last Updated**: 2026-04-15  
**Author**: Kiro AI Assistant
