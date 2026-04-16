# 🚀 Campaign Taxonomy - Quick Reference

## 📋 10 Main Categories

| # | Category | Tags | Example |
|---|----------|------|---------|
| 1 | Giáo dục | ~40 | App học tiếng Anh |
| 2 | Y tế | ~35 | Thiết bị y tế thông minh |
| 3 | Cộng đồng | ~30 | Workshop kỹ năng |
| 4 | Công nghệ | ~50 | IoT smart home |
| 5 | Nghệ thuật | ~40 | Webtoon series |
| 6 | Môi trường | ~35 | Sản phẩm tái chế |
| 7 | Nông nghiệp | ~35 | Agritech IoT |
| 8 | Giải trí | ~40 | Indie game |
| 9 | Kinh doanh | ~45 | Local brand |
| 10 | Khẩn cấp & Từ thiện | ~25 | Cứu trợ thiên tai |

---

## 🏷️ 10 Tag Groups

1. **Loại nội dung** - Sản phẩm/dịch vụ cụ thể
2. **Định dạng phát hành** - Mobile app, Web app, Physical...
3. **Mục đích / Phong cách** - Indie, Commercial, Social impact...
4. **Loại sản phẩm** - Hardware, Software, B2B, B2C...
5. **Công nghệ / Kỹ thuật** - AI, IoT, Blockchain, AR/VR...
6. **Giai đoạn phát triển** - Idea, Prototype, MVP, Beta...
7. **Mô hình / Vận hành** - Startup, NGO, Pre-sale...
8. **Đối tượng hưởng lợi** - Trẻ em, Nông dân, Bệnh nhân...
9. **Phạm vi** - Local, Regional, National, Global
10. **Thời gian** - Urgent, Short-term, Long-term, Ongoing

---

## 💻 Code Snippets

### Import Components

```typescript
import { CategorySelector } from "@/components/create-campaign/category-selector";
import { StarterTagsSelector } from "@/components/create-campaign/starter-tags-selector";
import type { MainCategory } from "@/types/taxonomy";
```

### Use in Form

```tsx
<CategorySelector
  selectedCategory={mainCategory}
  onCategoryChange={setMainCategory}
/>

<StarterTagsSelector
  mainCategory={mainCategory}
  selectedTags={starterTags}
  onTagsChange={setStarterTags}
/>
```

### Validation

```typescript
import { validateTaxonomySelection } from "@/lib/taxonomy-helpers";

const result = validateTaxonomySelection({
  mainCategory: "Công nghệ",
  starterTags: ["mobile-app", "ai", "prototype"]
});

if (!result.isValid) {
  console.error(result.errors);
}
```

### Get Tags for Category

```typescript
import { getStarterTagsForCategory } from "@/lib/taxonomy-helpers";

const tags = getStarterTagsForCategory("Nghệ thuật");
// Returns: [{ id: "truyen-tranh", label: "Truyện tranh", ... }, ...]
```

### Check if Tag Allowed

```typescript
import { isTagAllowedForCategory } from "@/lib/taxonomy-helpers";

const allowed = isTagAllowedForCategory("manga", "Nghệ thuật"); // true
const notAllowed = isTagAllowedForCategory("manga", "Y tế"); // false
```

### Sanitize Tags

```typescript
import { sanitizeSelectedTags } from "@/lib/taxonomy-helpers";

const clean = sanitizeSelectedTags(
  ["manga", "mobile-app", "benh-nhan"],
  "Công nghệ"
);
// Returns: ["mobile-app"]
```

---

## 🗄️ Database Queries

### Find by Category

```typescript
const campaigns = await prisma.campaign.findMany({
  where: { category: "Công nghệ" }
});
```

### Find by Tag

```typescript
const campaigns = await prisma.campaign.findMany({
  where: { tags: { has: "mobile-app" } }
});
```

### Find by Multiple Tags (AND)

```typescript
const campaigns = await prisma.campaign.findMany({
  where: { tags: { hasEvery: ["mobile-app", "ai"] } }
});
```

### Find by Multiple Tags (OR)

```typescript
const campaigns = await prisma.campaign.findMany({
  where: { tags: { hasSome: ["mobile-app", "web-app"] } }
});
```

---

## 🎯 Example Campaigns

### 1. App học tiếng Anh
```json
{
  "mainCategory": "Giáo dục",
  "starterTags": ["mobile-app", "khoa-hoc", "edtech", "tre-em", "online"]
}
```

### 2. Indie Game
```json
{
  "mainCategory": "Giải trí",
  "starterTags": ["video-game", "indie", "unity", "prototype", "gamers"]
}
```

### 3. Webtoon
```json
{
  "mainCategory": "Nghệ thuật",
  "starterTags": ["webtoon", "digital", "storytelling", "series", "indie"]
}
```

### 4. IoT Nông nghiệp
```json
{
  "mainCategory": "Nông nghiệp",
  "starterTags": ["agritech", "iot", "sensor", "pilot", "nong-dan"]
}
```

### 5. Cứu trợ
```json
{
  "mainCategory": "Khẩn cấp & Từ thiện",
  "starterTags": ["donation", "urgent", "nan-nhan-thien-tai", "local", "short-term"]
}
```

---

## ✅ Validation Rules

| Rule | Constraint | Error |
|------|-----------|-------|
| Main Category | Required, 1 only | "Vui lòng chọn danh mục chính" |
| Starter Tags | Max 5 | "Chỉ được chọn tối đa 5 thẻ phụ" |
| Allowed Tags | Must be in allowedStarterTags | "Các thẻ không phù hợp..." |

---

## 🔌 API Endpoints

### GET /api/taxonomy
```bash
curl http://localhost:3000/api/taxonomy
```

### GET /api/taxonomy/:category
```bash
curl http://localhost:3000/api/taxonomy/Công%20nghệ
```

### GET /api/taxonomy/search
```bash
curl "http://localhost:3000/api/taxonomy/search?q=app&category=Công%20nghệ"
```

---

## 🚀 Setup Commands

```bash
# 1. Run migration
npx prisma migrate dev --name add_taxonomy_tags

# 2. Generate client
npx prisma generate

# 3. Start dev server
npm run dev

# 4. Test
# Visit: http://localhost:3000/campaigns/create
# Visit: http://localhost:3000/demo/taxonomy
```

---

## 📁 File Locations

```
src/
├── types/taxonomy.ts
├── data/taxonomy.ts
├── lib/taxonomy-helpers.ts
├── components/create-campaign/
│   ├── category-selector.tsx
│   ├── tag-group-section.tsx
│   └── starter-tags-selector.tsx
└── app/
    ├── campaigns/create/page.tsx
    ├── demo/taxonomy/page.tsx
    └── api/taxonomy/
        ├── route.ts
        ├── [category]/route.ts
        └── search/route.ts
```

---

## 🎨 Popular Tag Combinations

### Công nghệ
- mobile-app + ai + mvp + startup
- iot + sensor + prototype + b2b-solution
- web-app + saas + cloud + subscription

### Nghệ thuật
- webtoon + digital + storytelling + series
- album + am-nhac + indie + streaming
- artbook + sach-in + limited-edition

### Giải trí
- video-game + indie + unity + prototype
- board-game + physical + pre-order
- animation + digital + streaming

### Nông nghiệp
- agritech + iot + sensor + nong-dan
- nong-san + marketplace + local
- drone + automation + pilot

---

## 💡 Pro Tips

1. **Chọn category trước** - Tags sẽ tự động lọc
2. **Dùng recommended tags** - Được hiển thị đầu tiên
3. **Search nhanh** - Gõ tên tag để tìm
4. **Max 5 tags** - Chọn những tag quan trọng nhất
5. **Category change** - Hệ thống sẽ cảnh báo nếu tags conflict

---

## 🐛 Common Issues

### Tags không hiển thị
→ Kiểm tra đã chọn main category chưa

### Không chọn được tag thứ 6
→ Đúng rồi! Max 5 tags

### Migration lỗi
→ Chạy: `npx prisma migrate reset` (⚠️ xóa data)

### Import error
→ Kiểm tra path: `@/types/taxonomy`, `@/lib/taxonomy-helpers`

---

**Quick Links:**
- 📖 [Full Documentation](./TAXONOMY_DOCUMENTATION.md)
- 🚀 [Integration Guide](./TAXONOMY_INTEGRATION_GUIDE.md)
- 📊 [Summary](./TAXONOMY_SUMMARY.md)
