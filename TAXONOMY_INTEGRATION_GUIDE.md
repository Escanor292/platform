# 🔧 Hướng dẫn tích hợp Campaign Taxonomy

## ✅ Đã hoàn thành

Hệ thống taxonomy đã được tích hợp hoàn chỉnh vào form tạo campaign của bạn!

### Files đã cập nhật:

1. ✅ **src/app/campaigns/create/page.tsx** - Form tạo campaign với taxonomy
2. ✅ **src/app/api/campaigns/route.ts** - API xử lý taxonomy data
3. ✅ **prisma/schema.prisma** - Thêm field `tags` vào Campaign model
4. ✅ **prisma/migrations/20260415_add_taxonomy_tags/migration.sql** - Migration file

### Files mới đã tạo:

1. ✅ **src/types/taxonomy.ts** - TypeScript types
2. ✅ **src/data/taxonomy.ts** - 200+ tags data
3. ✅ **src/lib/taxonomy-helpers.ts** - Helper functions
4. ✅ **src/components/create-campaign/category-selector.tsx**
5. ✅ **src/components/create-campaign/tag-group-section.tsx**
6. ✅ **src/components/create-campaign/starter-tags-selector.tsx**
7. ✅ **src/app/api/taxonomy/route.ts** - API endpoints
8. ✅ **src/app/api/taxonomy/[category]/route.ts**
9. ✅ **src/app/api/taxonomy/search/route.ts**

---

## 🚀 Các bước để chạy

### 1. Chạy migration database

```bash
npx prisma migrate dev --name add_taxonomy_tags
```

Hoặc nếu đã có migration:

```bash
npx prisma db push
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Khởi động dev server

```bash
npm run dev
```

### 4. Test form tạo campaign

Truy cập: `http://localhost:3000/campaigns/create`

---

## 📊 Thay đổi trong Database

### Campaign Model - Trước:

```prisma
model Campaign {
  // ...
  category        String
  // ...
}
```

### Campaign Model - Sau:

```prisma
model Campaign {
  // ...
  category        String            // Main category (one of 10)
  tags            String[]          @default([]) // Starter tags (max 5)
  // ...
  
  @@index([category])
  @@index([tags])
}
```

---

## 🎯 Cách sử dụng trong Form

### Form Data Structure:

```typescript
{
  title: "App học tiếng Anh",
  tagline: "Học tiếng Anh qua AI",
  description: "...",
  goalAmount: 10000000,
  mainCategory: "Giáo dục",           // ← Main category
  starterTags: [                       // ← Starter tags (max 5)
    "mobile-app",
    "khoa-hoc",
    "edtech",
    "tre-em",
    "online"
  ],
  imageUrl: "...",
  endDate: "2026-05-15"
}
```

### API Request:

```typescript
POST /api/campaigns
{
  "title": "App học tiếng Anh",
  "tagline": "Học tiếng Anh qua AI",
  "description": "...",
  "goalAmount": 10000000,
  "mainCategory": "Giáo dục",
  "starterTags": ["mobile-app", "khoa-hoc", "edtech", "tre-em", "online"],
  "imageUrl": "...",
  "endDate": "2026-05-15"
}
```

### Database Storage:

```sql
INSERT INTO campaigns (
  category,  -- "Giáo dục"
  tags,      -- ["mobile-app", "khoa-hoc", "edtech", "tre-em", "online"]
  ...
)
```

---

## 🔍 Query Examples

### 1. Tìm campaigns theo category:

```typescript
const campaigns = await prisma.campaign.findMany({
  where: {
    category: "Công nghệ"
  }
});
```

### 2. Tìm campaigns theo tag:

```typescript
const campaigns = await prisma.campaign.findMany({
  where: {
    tags: {
      has: "mobile-app"
    }
  }
});
```

### 3. Tìm campaigns có nhiều tags:

```typescript
const campaigns = await prisma.campaign.findMany({
  where: {
    tags: {
      hasEvery: ["mobile-app", "ai"]
    }
  }
});
```

### 4. Tìm campaigns có bất kỳ tag nào:

```typescript
const campaigns = await prisma.campaign.findMany({
  where: {
    tags: {
      hasSome: ["mobile-app", "web-app", "platform"]
    }
  }
});
```

---

## 🎨 UI Components

### 1. Category Selector

Hiển thị 10 main categories dạng grid buttons:

```tsx
<CategorySelector
  selectedCategory={mainCategory}
  onCategoryChange={(cat) => setMainCategory(cat)}
/>
```

### 2. Starter Tags Selector

Hiển thị tags theo nhóm semantic với:
- Recommended tags
- Search functionality
- Tag groups với "Xem thêm"
- Visual feedback

```tsx
<StarterTagsSelector
  mainCategory={mainCategory}
  selectedTags={starterTags}
  onTagsChange={(tags) => setStarterTags(tags)}
/>
```

---

## ✅ Validation Rules

### Client-side (Form):

```typescript
import { validateTaxonomySelection } from "@/lib/taxonomy-helpers";

const result = validateTaxonomySelection({
  mainCategory: formData.mainCategory,
  starterTags: formData.starterTags,
});

if (!result.isValid) {
  toast.error(result.errors[0]);
  return;
}
```

### Server-side (API):

```typescript
// Check main category
if (!mainCategory) {
  return NextResponse.json(
    { error: "Vui lòng chọn danh mục chính" },
    { status: 400 }
  );
}

// Check starter tags
if (starterTags.length > 5) {
  return NextResponse.json(
    { error: "Chỉ được chọn tối đa 5 thẻ phụ" },
    { status: 400 }
  );
}
```

---

## 🔄 Category Change Warning

Khi user đổi category và có tags không phù hợp:

1. Hiện modal cảnh báo
2. Liệt kê các tags sẽ bị xóa
3. Yêu cầu xác nhận
4. Tự động sanitize tags

```typescript
const handleCategoryChange = (newCategory: MainCategory) => {
  const invalidTags = getInvalidTagsForNewCategory(
    formData.starterTags,
    newCategory
  );
  
  if (invalidTags.length > 0) {
    // Show warning modal
    setPendingCategory(newCategory);
    setShowCategoryChangeWarning(true);
    return;
  }
  
  // No conflicts, change directly
  setFormData({ ...formData, mainCategory: newCategory });
};
```

---

## 📱 Responsive Design

Form đã được tối ưu cho:
- ✅ Desktop (grid 5 columns cho categories)
- ✅ Tablet (grid 3 columns)
- ✅ Mobile (grid 2 columns)

---

## 🎯 Testing Checklist

### Form Testing:

- [ ] Chọn main category
- [ ] Hiển thị đúng tags cho category
- [ ] Search tags hoạt động
- [ ] Chọn tối đa 5 tags
- [ ] Không chọn được tag thứ 6
- [ ] Đổi category hiện warning nếu có tags conflict
- [ ] Submit form thành công
- [ ] Data lưu đúng vào database

### API Testing:

- [ ] GET /api/taxonomy - Trả về overview
- [ ] GET /api/taxonomy/Công%20nghệ - Trả về tags cho category
- [ ] GET /api/taxonomy/search?q=app&category=Công%20nghệ - Search hoạt động
- [ ] POST /api/campaigns - Tạo campaign với taxonomy

---

## 🐛 Troubleshooting

### Lỗi: "tags field not found"

**Giải pháp:**
```bash
npx prisma migrate dev
npx prisma generate
```

### Lỗi: "Cannot find module '@/types/taxonomy'"

**Giải pháp:**
Đảm bảo file `src/types/taxonomy.ts` đã được tạo.

### Lỗi: "validateTaxonomySelection is not a function"

**Giải pháp:**
Đảm bảo file `src/lib/taxonomy-helpers.ts` đã được tạo và import đúng.

### Tags không hiển thị sau khi chọn category

**Giải pháp:**
Kiểm tra console log, có thể do:
- Category name không khớp (có dấu, viết hoa/thường)
- Data taxonomy chưa load đúng

---

## 📚 Documentation

Xem thêm:
- **TAXONOMY_SUMMARY.md** - Tổng quan hệ thống
- **TAXONOMY_README.md** - Quick start guide
- **TAXONOMY_DOCUMENTATION.md** - Complete documentation

---

## 🎉 Next Steps

### Hiện tại:
✅ Form tạo campaign có taxonomy  
✅ Validation hoàn chỉnh  
✅ Database schema updated  
✅ API endpoints ready  

### Tiếp theo (Optional):

1. **Hiển thị tags trên campaign page**
   - Thêm tags vào campaign detail page
   - Style tags với màu sắc theo category

2. **Filter campaigns theo tags**
   - Thêm filter sidebar
   - Multi-select tags
   - Combine với category filter

3. **Search campaigns theo tags**
   - Full-text search
   - Tag-based search
   - Autocomplete

4. **Analytics**
   - Most popular tags
   - Tag combinations
   - Success rate by tags

---

## 💡 Tips

1. **Performance**: Sử dụng GIN index cho tags field để query nhanh hơn
2. **UX**: Hiện recommended tags trước để user dễ chọn
3. **Validation**: Validate cả client và server side
4. **Flexibility**: Dễ dàng thêm tags mới vào `src/data/taxonomy.ts`

---

**Version**: 1.0.0  
**Last Updated**: 2026-04-15  
**Status**: ✅ Ready to use
