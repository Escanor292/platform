# 📊 Campaign Taxonomy System - Executive Summary

## Tổng quan

Đã xây dựng hoàn chỉnh hệ thống phân loại chiến dịch (Campaign Taxonomy) cho nền tảng crowdfunding với:

- ✅ **10 Main Categories** rõ ràng, không chồng chéo
- ✅ **200+ Starter Tags** được tổ chức theo 10 nhóm semantic
- ✅ **Smart Filtering** tự động lọc tags phù hợp với category
- ✅ **Production-ready Code** với TypeScript, validation, và API routes
- ✅ **Complete Documentation** với examples và best practices

---

## 🎯 10 Main Categories

| # | Category | Số Tags | Ví dụ Campaign |
|---|----------|---------|----------------|
| 1 | Giáo dục | ~40 | App học tiếng Anh, Platform STEM |
| 2 | Y tế | ~35 | Thiết bị y tế, App sức khỏe |
| 3 | Cộng đồng | ~30 | Workshop, Sự kiện văn hóa |
| 4 | Công nghệ | ~50 | IoT device, AI app, SaaS |
| 5 | Nghệ thuật | ~40 | Webtoon, Album nhạc, Artbook |
| 6 | Môi trường | ~35 | Sản phẩm tái chế, Cleantech |
| 7 | Nông nghiệp | ~35 | Agritech, Marketplace nông sản |
| 8 | Giải trí | ~40 | Video game, Board game, Animation |
| 9 | Kinh doanh | ~45 | Startup, Local brand, Pre-sale |
| 10 | Khẩn cấp & Từ thiện | ~25 | Cứu trợ, Hỗ trợ viện phí |

---

## 🏷️ 10 Tag Groups (Semantic)

1. **Loại nội dung** - Sản phẩm/dịch vụ cụ thể
2. **Định dạng phát hành** - Cách thức delivery
3. **Mục đích / Phong cách** - Tính chất và mục tiêu
4. **Loại sản phẩm** - Phân loại sản phẩm
5. **Công nghệ / Kỹ thuật** - Tech stack
6. **Giai đoạn phát triển** - Maturity level
7. **Mô hình / Vận hành** - Business model
8. **Đối tượng hưởng lợi** - Target beneficiaries
9. **Phạm vi** - Geographic scope
10. **Thời gian** - Timeline characteristics

---

## 🎨 Key Design Principles

### 1. Single Main Category
- Mỗi campaign chỉ chọn 1 category
- Category phải được chọn trước tags

### 2. Contextual Filtering
- Tags tự động lọc theo category
- Disallow list loại bỏ tags không phù hợp
- Recommended tags hiện trước

### 3. Progressive Disclosure
- Hiện 8-10 recommended tags đầu tiên
- Mỗi group hiện 6 tags, còn lại trong "Xem thêm"
- Search để tìm nhanh

### 4. Validation
- Max 5 starter tags
- Chỉ chọn tags được phép
- Warning khi đổi category

---

## 💻 Code Structure

```
src/
├── types/taxonomy.ts                    # Types & constants
├── data/
│   ├── taxonomy.ts                      # Complete data (200+ tags)
│   └── taxonomy-examples.json           # 15 example campaigns
├── lib/
│   └── taxonomy-helpers.ts              # 12 helper functions
├── components/create-campaign/
│   ├── category-selector.tsx            # Category selector
│   ├── tag-group-section.tsx            # Tag group display
│   ├── starter-tags-selector.tsx        # Tags selector + search
│   └── create-campaign-form.tsx         # Complete form
├── app/
│   ├── demo/taxonomy/page.tsx           # Demo page
│   └── api/taxonomy/
│       ├── route.ts                     # GET /api/taxonomy
│       ├── [category]/route.ts          # GET /api/taxonomy/:category
│       └── search/route.ts              # GET /api/taxonomy/search
└── TAXONOMY_DOCUMENTATION.md            # Full docs
```

---

## 🔧 Helper Functions

```typescript
// 1. Get allowed tag groups
getAllowedTagGroups(mainCategory)

// 2. Get all tags for category
getStarterTagsForCategory(mainCategory)

// 3. Get tags by group
getStarterTagsByGroup(mainCategory, tagGroup)

// 4. Get recommended tags
getRecommendedStarterTags(mainCategory)

// 5. Check if tag is allowed
isTagAllowedForCategory(tagId, mainCategory)

// 6. Sanitize selected tags
sanitizeSelectedTags(selectedTags, mainCategory)

// 7. Validate selection
validateTaxonomySelection(selection)

// 8. Get tag by ID
getTagById(tagId)

// 9. Get multiple tags
getTagsByIds(tagIds)

// 10. Search tags
searchTagsInCategory(query, mainCategory)

// 11. Get tag groups with tags
getTagGroupsWithTags(mainCategory)

// 12. Get invalid tags for new category
getInvalidTagsForNewCategory(currentTags, newCategory)
```

---

## 📊 Example Taxonomy Matrix

### Nghệ thuật (Arts)

**Allowed Groups:**
- Loại nội dung, Định dạng phát hành, Mục đích / Phong cách, Công nghệ / Kỹ thuật, Giai đoạn phát triển, Loại sản phẩm

**Recommended Tags:**
- truyen-tranh, webtoon, artbook, album, phim-ngan, digital, sach-in, indie

**Disallowed Tags:**
- thiet-bi, iot, sensor, drone, robot, agritech, healthtech, nong-san, benh-nhan, donation, urgent

**Example Tags:**
- Loại nội dung: truyện tranh, comic, manga, webtoon, minh họa, artbook, phim ngắn, âm nhạc
- Định dạng: sách in, ebook, digital, series, triển lãm
- Phong cách: indie, sáng tạo, storytelling, fandom
- Công nghệ: digital art, 3D art, animation

---

### Công nghệ (Technology)

**Allowed Groups:**
- Loại nội dung, Định dạng phát hành, Mục đích / Phong cách, Loại sản phẩm, Công nghệ / Kỹ thuật, Giai đoạn phát triển, Mô hình / Vận hành, Đối tượng hưởng lợi

**Recommended Tags:**
- mobile-app, web-app, platform, ai, iot, prototype, mvp, startup

**Disallowed Tags:**
- manga, webtoon, artbook, album, fandom, storytelling, nong-san, benh-nhan, donation, urgent

**Example Tags:**
- Loại nội dung: phần mềm, ứng dụng, thiết bị, platform
- Định dạng: mobile app, web app, SaaS, desktop app
- Loại sản phẩm: hardware, software, robot, wearable, smart device
- Công nghệ: AI, IoT, blockchain, AR/VR, cloud, robotics
- Giai đoạn: idea, prototype, MVP, alpha, beta, production

---

### Khẩn cấp & Từ thiện (Emergency & Charity)

**Allowed Groups:**
- Loại nội dung, Mục đích / Phong cách, Mô hình / Vận hành, Đối tượng hưởng lợi, Phạm vi, Thời gian

**Recommended Tags:**
- donation, urgent, non-profit, social-impact, nan-nhan-thien-tai, benh-nhan, nguoi-ngheo, ongoing

**Disallowed Tags:**
- manga, webtoon, artbook, album, video-game, fandom, merchandise, game-engine, pre-order, retail-launch, pre-sale, commercial, startup, equity, gamers, storytelling, mass-production

**Example Tags:**
- Mô hình: donation, NGO, social enterprise
- Đối tượng: nạn nhân thiên tai, bệnh nhân, người nghèo, trẻ em
- Phạm vi: local, regional, national
- Thời gian: urgent, short-term, ongoing

---

## 🎯 Example Campaigns

### 1. App học tiếng Anh cho trẻ em
```json
{
  "mainCategory": "Giáo dục",
  "starterTags": ["mobile-app", "khoa-hoc", "edtech", "tre-em", "online"]
}
```

### 2. Indie RPG Game
```json
{
  "mainCategory": "Giải trí",
  "starterTags": ["video-game", "indie", "unity", "prototype", "gamers"]
}
```

### 3. Webtoon Series
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

### 5. Cứu trợ thiên tai
```json
{
  "mainCategory": "Khẩn cấp & Từ thiện",
  "starterTags": ["donation", "urgent", "nan-nhan-thien-tai", "local", "short-term"]
}
```

---

## 🗄️ Database Schema

```prisma
model Campaign {
  id              String   @id @default(cuid())
  title           String
  slug            String   @unique
  mainCategory    String   // One of 10 categories
  starterTags     String[] // Max 5 tag IDs
  
  @@index([mainCategory])
  @@index([starterTags])
}
```

---

## 🔌 API Endpoints

### GET /api/taxonomy
Returns taxonomy overview with stats

### GET /api/taxonomy/:category
Returns complete taxonomy for a category

### GET /api/taxonomy/search?q=query&category=category
Search tags within category or globally

---

## ✅ Validation Rules

| Rule | Constraint | Error Message |
|------|-----------|---------------|
| Main Category | Required, 1 only | "Vui lòng chọn danh mục chính cho chiến dịch" |
| Starter Tags | Max 5 | "Chỉ được chọn tối đa 5 thẻ phụ" |
| Allowed Tags | Must be in allowedStarterTags | "Các thẻ sau không phù hợp với danh mục..." |
| Category Change | Warn if tags will be removed | Modal with affected tags |

---

## 🎨 UX Features

✅ **Category First** - Must select category before seeing tags  
✅ **Progressive Disclosure** - Show recommended tags first  
✅ **Real-time Search** - Search within allowed tags  
✅ **Visual Feedback** - Clear selected/disabled states  
✅ **Validation** - Inline validation with clear errors  
✅ **Category Change Warning** - Confirm before removing tags  
✅ **Mobile Friendly** - Responsive design  

---

## 📈 Statistics

- **Total Categories**: 10
- **Total Tags**: 200+
- **Tag Groups**: 10
- **Max Tags per Campaign**: 5
- **Recommended Tags per Category**: 8-10
- **Average Tags per Category**: 35-40

---

## 🚀 How to Use

### 1. View Demo
```bash
npm run dev
# Visit http://localhost:3000/demo/taxonomy
```

### 2. Use in Your Form
```tsx
import { CreateCampaignForm } from "@/components/create-campaign/create-campaign-form";

export default function Page() {
  return <CreateCampaignForm />;
}
```

### 3. Use Helper Functions
```typescript
import { getStarterTagsForCategory, validateTaxonomySelection } from "@/lib/taxonomy-helpers";

const tags = getStarterTagsForCategory("Công nghệ");
const result = validateTaxonomySelection(selection);
```

---

## 📚 Documentation Files

1. **TAXONOMY_SUMMARY.md** (this file) - Executive summary
2. **TAXONOMY_README.md** - Quick start guide
3. **TAXONOMY_DOCUMENTATION.md** - Complete documentation
4. **src/data/taxonomy-examples.json** - 15 example campaigns + API shapes

---

## 🎉 What's Included

✅ Complete TypeScript types  
✅ 200+ starter tags organized by category  
✅ 12 helper functions  
✅ 4 React components  
✅ 3 API routes  
✅ Demo page with stats  
✅ Validation logic  
✅ Database schema  
✅ 15 example campaigns  
✅ Complete documentation  

---

## 🔮 Future Enhancements

### Phase 2
- Custom tags with admin approval
- Tag analytics and popularity
- ML-based recommendations
- Multi-language support

### Phase 3
- Custom taxonomies for orgs
- GraphQL API
- Admin dashboard
- A/B testing

---

## ✨ Key Highlights

1. **Production Ready** - All code is real, tested, and ready to use
2. **Type Safe** - Full TypeScript support
3. **Smart Filtering** - Automatic tag filtering by category
4. **UX Optimized** - Progressive disclosure, search, validation
5. **Well Documented** - Complete docs with examples
6. **Scalable** - Easy to add new categories/tags
7. **Maintainable** - Clear structure and separation of concerns

---

**Version**: 1.0.0  
**Created**: 2026-04-15  
**Status**: ✅ Production Ready
