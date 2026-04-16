# 🚀 Campaign Taxonomy System - START HERE

## 👋 Chào mừng!

Hệ thống phân loại chiến dịch (Campaign Taxonomy) đã được tích hợp hoàn chỉnh vào form tạo campaign của bạn!

---

## ⚡ Quick Start (3 bước)

### 1️⃣ Chạy Migration

```bash
npx prisma migrate dev --name add_taxonomy_tags
npx prisma generate
```

### 2️⃣ Khởi động Server

```bash
npm run dev
```

### 3️⃣ Test Ngay

- **Form tạo campaign**: http://localhost:3000/campaigns/create
- **Demo page**: http://localhost:3000/demo/taxonomy

---

## 📚 Documentation

Chọn doc phù hợp với nhu cầu của bạn:

### 🎯 Tôi muốn...

#### "Hiểu tổng quan hệ thống"
→ Đọc: **[TAXONOMY_SUMMARY.md](./TAXONOMY_SUMMARY.md)**
- 10 categories overview
- 200+ tags organized
- Design principles
- Example campaigns

#### "Bắt đầu sử dụng ngay"
→ Đọc: **[TAXONOMY_README.md](./TAXONOMY_README.md)**
- Quick start guide
- Component usage
- Code examples
- API endpoints

#### "Tìm hiểu chi tiết"
→ Đọc: **[TAXONOMY_DOCUMENTATION.md](./TAXONOMY_DOCUMENTATION.md)**
- Complete documentation
- Taxonomy matrix by category
- Implementation guide
- Database schema
- Future improvements

#### "Tích hợp vào project"
→ Đọc: **[TAXONOMY_INTEGRATION_GUIDE.md](./TAXONOMY_INTEGRATION_GUIDE.md)**
- Files updated
- Migration steps
- Testing checklist
- Troubleshooting

#### "Tra cứu nhanh"
→ Đọc: **[TAXONOMY_QUICK_REFERENCE.md](./TAXONOMY_QUICK_REFERENCE.md)**
- Categories table
- Code snippets
- Database queries
- Common issues

#### "Kiểm tra hoàn thành"
→ Đọc: **[TAXONOMY_FINAL_CHECKLIST.md](./TAXONOMY_FINAL_CHECKLIST.md)**
- Deliverables checklist
- Testing checklist
- Next steps

---

## 🎯 Hệ thống gồm gì?

### 10 Main Categories
```
Giáo dục | Y tế | Cộng đồng | Công nghệ | Nghệ thuật
Môi trường | Nông nghiệp | Giải trí | Kinh doanh | Khẩn cấp & Từ thiện
```

### 200+ Starter Tags
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

### Smart Features
- ✅ Auto-filter tags by category
- ✅ Recommended tags
- ✅ Real-time search
- ✅ Max 5 tags validation
- ✅ Category change warning
- ✅ Responsive design

---

## 💻 Code Example

### Sử dụng trong Form

```tsx
import { CategorySelector } from "@/components/create-campaign/category-selector";
import { StarterTagsSelector } from "@/components/create-campaign/starter-tags-selector";

export default function CreateCampaignPage() {
  const [mainCategory, setMainCategory] = useState<MainCategory | null>(null);
  const [starterTags, setStarterTags] = useState<string[]>([]);
  
  return (
    <form>
      <CategorySelector
        selectedCategory={mainCategory}
        onCategoryChange={setMainCategory}
      />
      
      <StarterTagsSelector
        mainCategory={mainCategory}
        selectedTags={starterTags}
        onTagsChange={setStarterTags}
      />
    </form>
  );
}
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

---

## 🗄️ Database

### Schema

```prisma
model Campaign {
  // ...
  category  String      // Main category (one of 10)
  tags      String[]    @default([]) // Starter tags (max 5)
  
  @@index([category])
  @@index([tags])
}
```

### Query Examples

```typescript
// Find by category
const campaigns = await prisma.campaign.findMany({
  where: { category: "Công nghệ" }
});

// Find by tag
const campaigns = await prisma.campaign.findMany({
  where: { tags: { has: "mobile-app" } }
});

// Find by multiple tags
const campaigns = await prisma.campaign.findMany({
  where: { tags: { hasEvery: ["mobile-app", "ai"] } }
});
```

---

## 🎨 UI Preview

### Form Flow

1. **Chọn Main Category** (1 trong 10)
   ```
   [Giáo dục] [Y tế] [Cộng đồng] [Công nghệ] [Nghệ thuật]
   [Môi trường] [Nông nghiệp] [Giải trí] [Kinh doanh] [Khẩn cấp & Từ thiện]
   ```

2. **Chọn Starter Tags** (tối đa 5)
   - Recommended tags hiện trước
   - Search để tìm nhanh
   - Tags grouped by semantic
   - "Xem thêm" cho mỗi group

3. **Submit Form**
   - Validation tự động
   - Error messages rõ ràng
   - Success redirect

---

## 📊 Example Campaigns

### App học tiếng Anh
```json
{
  "mainCategory": "Giáo dục",
  "starterTags": ["mobile-app", "khoa-hoc", "edtech", "tre-em", "online"]
}
```

### Indie Game
```json
{
  "mainCategory": "Giải trí",
  "starterTags": ["video-game", "indie", "unity", "prototype", "gamers"]
}
```

### Webtoon Series
```json
{
  "mainCategory": "Nghệ thuật",
  "starterTags": ["webtoon", "digital", "storytelling", "series", "indie"]
}
```

---

## 🔧 API Endpoints

### GET /api/taxonomy
Returns taxonomy overview

### GET /api/taxonomy/:category
Returns tags for specific category

### GET /api/taxonomy/search
Search tags within category

---

## ✅ Testing Checklist

- [ ] Chạy migration: `npx prisma migrate dev`
- [ ] Generate client: `npx prisma generate`
- [ ] Start server: `npm run dev`
- [ ] Test form: http://localhost:3000/campaigns/create
- [ ] Test demo: http://localhost:3000/demo/taxonomy
- [ ] Chọn category → Tags hiển thị
- [ ] Search tags → Kết quả đúng
- [ ] Chọn 5 tags → OK
- [ ] Submit form → Success

---

## 🐛 Troubleshooting

### Migration lỗi?
```bash
npx prisma migrate reset
npx prisma migrate dev
```

### Import error?
Check tsconfig.json có paths:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Tags không hiển thị?
→ Đảm bảo đã chọn main category trước

---

## 📁 File Structure

```
src/
├── types/taxonomy.ts                    # Types
├── data/
│   ├── taxonomy.ts                      # 200+ tags data
│   └── taxonomy-examples.json           # Examples
├── lib/
│   └── taxonomy-helpers.ts              # 12 helpers
├── components/create-campaign/
│   ├── category-selector.tsx
│   ├── tag-group-section.tsx
│   └── starter-tags-selector.tsx
├── app/
│   ├── campaigns/create/page.tsx        # ✅ Updated
│   ├── demo/taxonomy/page.tsx           # Demo
│   └── api/
│       ├── campaigns/route.ts           # ✅ Updated
│       └── taxonomy/
│           ├── route.ts
│           ├── [category]/route.ts
│           └── search/route.ts
└── prisma/
    ├── schema.prisma                    # ✅ Updated
    └── migrations/
        └── 20260415_add_taxonomy_tags/
            └── migration.sql
```

---

## 🎉 What's Included

✅ 10 Main Categories  
✅ 200+ Starter Tags  
✅ Smart Filtering  
✅ Validation (Client + Server)  
✅ React Components  
✅ Helper Functions  
✅ API Endpoints  
✅ Database Schema  
✅ Migration File  
✅ Demo Page  
✅ Complete Documentation  

---

## 🚀 Next Steps

### Hiện tại (✅ Done)
- Form tạo campaign có taxonomy
- Validation hoàn chỉnh
- Database ready
- API endpoints ready

### Tiếp theo (Optional)
1. Hiển thị tags trên campaign page
2. Filter campaigns theo tags
3. Search campaigns by tags
4. Analytics dashboard

---

## 💡 Pro Tips

1. **Chọn category trước** - Tags sẽ tự động lọc
2. **Dùng recommended tags** - Hiển thị đầu tiên
3. **Search nhanh** - Gõ tên tag
4. **Max 5 tags** - Chọn quan trọng nhất
5. **Category change** - Hệ thống cảnh báo conflict

---

## 📞 Need Help?

### Quick Links
- 📖 [Summary](./TAXONOMY_SUMMARY.md) - Tổng quan
- 🚀 [README](./TAXONOMY_README.md) - Quick start
- 📚 [Documentation](./TAXONOMY_DOCUMENTATION.md) - Chi tiết
- 🔧 [Integration](./TAXONOMY_INTEGRATION_GUIDE.md) - Tích hợp
- ⚡ [Quick Ref](./TAXONOMY_QUICK_REFERENCE.md) - Tra cứu
- ✅ [Checklist](./TAXONOMY_FINAL_CHECKLIST.md) - Kiểm tra

### Common Questions

**Q: Làm sao thêm tag mới?**  
A: Edit `src/data/taxonomy.ts`, thêm vào `ALL_STARTER_TAGS` và category tương ứng

**Q: Làm sao thêm category mới?**  
A: Edit `src/types/taxonomy.ts` và `src/data/taxonomy.ts`

**Q: Tags có thể dùng cho nhiều category?**  
A: Có! Ví dụ: "mobile-app", "ai", "prototype" dùng được cho nhiều category

**Q: Có thể custom validation?**  
A: Có! Edit `src/lib/taxonomy-helpers.ts` → `validateTaxonomySelection()`

---

## 🏆 Features Highlights

- **Production Ready** - No pseudo-code, all real
- **Type Safe** - Full TypeScript support
- **Well Documented** - 5 comprehensive docs
- **User Friendly** - Intuitive UX
- **Scalable** - Easy to extend
- **Validated** - Client + server
- **Responsive** - Mobile, tablet, desktop
- **Fast** - Optimized queries with indexes

---

**Status**: ✅ Ready to Use  
**Version**: 1.0.0  
**Date**: 2026-04-15

---

## 🎊 Bắt đầu ngay!

```bash
# 1. Migration
npx prisma migrate dev --name add_taxonomy_tags

# 2. Generate
npx prisma generate

# 3. Start
npm run dev

# 4. Visit
# http://localhost:3000/campaigns/create
```

**Chúc bạn thành công! 🚀**
