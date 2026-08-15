# Phân Tích Cấu Trúc Database - Crowdfunding Platform

**Ngày phân tích:** 30/06/2026  
**Phiên bản schema:** Prisma PostgreSQL

---

## 📋 TÓM TẮT NHANH

### Câu Trả Lời Cho Các Câu Hỏi

| Câu hỏi | Trả lời |
|---------|---------|
| **1. Có entity Project thật không?** | ❌ **KHÔNG** - Không có entity `Project` trong schema |
| **2. Có bảng Project trong Prisma không?** | ❌ **KHÔNG** - Không có model `Project` |
| **3. Blog hiện tại có projectId?** | ❌ **KHÔNG** - Chỉ có `campaignId` |
| **4. Blog hiện tại có campaignId?** | ✅ **CÓ** - `campaignId String?` (optional) |
| **5. Campaign hiện tại có projectId?** | ❌ **KHÔNG** - Campaign không có `projectId` |
| **6. Reward/Product hiện tại có projectId?** | ❌ **KHÔNG** - Chỉ có `campaignId` |
| **7. Reward/Product hiện tại có campaignId?** | ✅ **CÓ** - `campaignId String` (required) |
| **8. Đang dùng bảng liên kết nào?** | ✅ `campaign_blog_links` - Bảng many-to-many |
| **9. Có campaign_blog_links hay không?** | ✅ **CÓ** - Đầy đủ với các field order, timestamps |

---

## 🗂️ CHI TIẾT CẤU TRÚC

### 1. Model `blog_posts`

```prisma
model blog_posts {
  id                   String                 @id
  authorId             String                 // Link đến users
  campaignId           String?                // ✅ CÓ - Optional link đến campaigns
  mongoContentId       String?
  title                String                 @db.VarChar(255)
  slug                 String                 @unique @db.VarChar(255)
  excerpt              String?
  coverImage           String?
  status               BlogPostStatus         @default(DRAFT)
  type                 BlogPostType           @default(PLATFORM)
  visibility           BlogVisibility         @default(PUBLIC)
  publishedAt          DateTime?
  createdAt            DateTime               @default(now())
  updatedAt            DateTime
  deletedAt            DateTime?
  viewCount            Int                    @default(0)
  likeCount            Int                    @default(0)
  commentCount         Int                    @default(0)
  bookmarkCount        Int                    @default(0)
  isFeatured           Boolean                @default(false)
  wordCount            Int                    @default(0)
  readingTimeMinutes   Int                    @default(0)
  content              String?
  
  // Relations
  users                users                  @relation(fields: [authorId], references: [id], onDelete: Cascade)
  campaigns            campaigns?             @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  campaign_blog_links  campaign_blog_links[]  // ✅ Many-to-many relation
  
  @@index([campaignId])
}
```

**Phân tích:**
- ❌ **KHÔNG có** `projectId`
- ✅ **CÓ** `campaignId` (optional)
- ✅ **CÓ** relation với `campaign_blog_links`
- 📝 Blog có thể tồn tại độc lập (platform blog) hoặc gắn với campaign

---

### 2. Model `campaigns`

```prisma
model campaigns {
  id                  String                @id
  campaignCode        String                @unique
  slug                String                @unique
  title               String
  description         String
  longDescription     String?
  videoUrl            String?
  imageUrl            String?
  type                CampaignType          @default(REWARD)
  category            String
  tags                String[]              @default([])
  goalAmount          Decimal
  currentAmount       Decimal               @default(0)
  status              CampaignStatus        @default(DRAFT)
  startDate           DateTime?
  endDate             DateTime?
  creatorId           String                // ✅ Link đến users, KHÔNG phải projectId
  feeRate             Float                 @default(0.08)
  createdAt           DateTime              @default(now())
  updatedAt           DateTime
  images              String[]              @default([])
  
  // Relations
  users               users                 @relation(fields: [creatorId], references: [id])
  blog_posts          blog_posts[]          // Direct relation
  campaign_blog_links campaign_blog_links[] // ✅ Many-to-many relation
  
  @@index([category])
}
```

**Phân tích:**
- ❌ **KHÔNG có** `projectId`
- ✅ **CÓ** `creatorId` (link trực tiếp đến `users`)
- ✅ **CÓ** 2 loại quan hệ với blog:
  - `blog_posts[]` - Direct relation (legacy)
  - `campaign_blog_links[]` - Many-to-many relation (recommended)

---

### 3. Model `rewards`

```prisma
model rewards {
  id           String    @id
  campaignId   String    // ✅ Required, link đến campaigns
  title        String
  description  String?
  createdAt    DateTime  @default(now())
  deliveryDate DateTime?
  isActive     Boolean   @default(true)
  maxQuantity  Int?
  minAmount    Decimal
  updatedAt    DateTime
  
  // Relations
  pledges      pledges[]
  campaigns    campaigns @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  
  @@index([campaignId])
}
```

**Phân tích:**
- ❌ **KHÔNG có** `projectId`
- ✅ **CÓ** `campaignId` (required)
- 📝 Reward thuộc về Campaign, không có concept Project

---

### 4. Model `campaign_blog_links` (Bảng Liên Kết)

```prisma
model campaign_blog_links {
  id         String     @id
  campaignId String     // ✅ Link đến campaigns
  blogPostId String     // ✅ Link đến blog_posts
  order      Int        @default(0)  // ✅ Thứ tự hiển thị
  createdAt  DateTime   @default(now())
  
  // Relations
  blog_posts blog_posts @relation(fields: [blogPostId], references: [id], onDelete: Cascade)
  campaigns  campaigns  @relation(fields: [campaignId], references: [id], onDelete: Cascade)

  @@unique([campaignId, blogPostId])  // ✅ Unique constraint
  @@index([blogPostId])
  @@index([campaignId])
}
```

**Phân tích:**
- ✅ Đây là bảng **many-to-many** chuẩn
- ✅ Có field `order` để sắp xếp
- ✅ Có unique constraint để tránh duplicate
- ✅ Có cascade delete
- 📝 Cho phép 1 campaign link nhiều blog posts và ngược lại

---

## 🔍 PHÂN TÍCH SÂU

### Không Có Entity "Project"

**Lý do có thể:**
1. **Kiến trúc đơn giản hóa** - Hệ thống chỉ dùng `Campaign` làm entity chính
2. **Campaign = Project** - Trong context này, Campaign đóng vai trò là Project
3. **Direct ownership** - Campaign được sở hữu trực tiếp bởi User (creatorId)

### Quan Hệ Blog - Campaign

**2 cách liên kết:**

1. **Direct Relation** (Legacy):
   ```prisma
   blog_posts.campaignId -> campaigns.id
   campaigns.blog_posts[] 
   ```
   - Blog thuộc về 1 campaign cụ thể
   - Optional (blog có thể độc lập)

2. **Many-to-Many via campaign_blog_links** (Recommended):
   ```prisma
   campaign_blog_links.campaignId -> campaigns.id
   campaign_blog_links.blogPostId -> blog_posts.id
   ```
   - 1 campaign có nhiều blog posts
   - 1 blog post có thể link đến nhiều campaigns
   - Có thứ tự hiển thị

### Vấn Đề Tiềm Ẩn

⚠️ **Dual Relationship Pattern** - Có 2 cách link blog với campaign:
- `blog_posts.campaignId` (direct, 1-to-many)
- `campaign_blog_links` (many-to-many)

**Khuyến nghị:**
- Nên chọn 1 trong 2 cách và deprecated cách còn lại
- Hoặc define rõ use case cho mỗi cách:
  - `campaignId` cho "primary campaign" của blog
  - `campaign_blog_links` cho "featured in campaigns" list

---

## 📊 RELATIONSHIP DIAGRAM

```
users (creators)
  └─ 1:n ─> campaigns
              ├─ 1:n ─> blog_posts (via campaignId - optional)
              ├─ 1:n ─> rewards
              ├─ 1:n ─> pledges
              └─ m:n ─> blog_posts (via campaign_blog_links)

users (authors)
  └─ 1:n ─> blog_posts
```

**Legend:**
- `1:n` = One-to-Many
- `m:n` = Many-to-Many
- `optional` = Field nullable

---

## 🎯 KẾT LUẬN

### Không Có Project Entity

Hệ thống **KHÔNG** sử dụng concept "Project" riêng biệt. Thay vào đó:

1. **Campaign** là entity chính đại diện cho dự án crowdfunding
2. **Campaign** được sở hữu trực tiếp bởi **User** (creator)
3. Tất cả relations (Blog, Reward, Pledge) đều link về **Campaign**, không phải Project

### Cấu Trúc Blog-Campaign

| Feature | Status | Note |
|---------|--------|------|
| blog_posts.campaignId | ✅ Có | Optional, direct relation |
| campaign_blog_links | ✅ Có | Many-to-many với order |
| blog_posts.projectId | ❌ Không | Không tồn tại |
| Dual relation | ⚠️ Warning | Cần clarify use case |

### Khuyến Nghị

1. **Clarify Blog-Campaign Relationship**
   - Document rõ khi nào dùng `campaignId` vs `campaign_blog_links`
   - Xem xét deprecate 1 trong 2 cách nếu không cần thiết

2. **Nếu Cần Thêm Project Entity**
   - Tạo bảng `projects`
   - Thêm `projectId` vào `campaigns`
   - Migration data từ campaign sang project
   - Update tất cả relations

3. **Current Best Practice**
   - Dùng `campaign_blog_links` cho featured blogs
   - Dùng `blog_posts.campaignId` cho primary campaign owner
   - Validate không conflict giữa 2 relations

---

## 📝 NOTES

- Schema không có concept "Product" riêng biệt - dùng `rewards` thay thế
- Tất cả monetary fields dùng `Decimal` type (safe cho currency)
- Có soft delete pattern với `deletedAt` field
- Rich indexing strategy cho performance
- Cascade delete được config đúng chuẩn

---

**Generated by:** Kiro AI Assistant  
**Date:** 30/06/2026  
**Source:** `prisma/schema.prisma`
