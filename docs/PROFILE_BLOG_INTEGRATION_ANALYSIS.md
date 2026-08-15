# BÁO CÁO PHÂN TÍCH: TÍCH HỢP BLOG VÀO PROFILE

**Ngày phân tích:** June 30, 2026  
**Scope:** Thêm section Blog vào Profile (Owner View & Public View)  
**Mục tiêu:** Hiển thị bài viết của user trên trang cá nhân

---

## 1. KIỂM TRA HỆ THỐNG HIỆN TẠI

### 1.1. ✅ Những Gì ĐÃ CÓ

| Thành phần | Đã có | File/Path | Ghi chú |
|------------|-------|-----------|---------|
| **Table blog_posts** | ✅ CÓ | `prisma/schema.prisma` | Line 172-217 |
| **Relation User -> Blog** | ✅ CÓ | `blog_posts.authorId -> users.id` | Cascade delete |
| **Relation Blog -> Campaign** | ✅ CÓ | `blog_posts.campaignId -> campaigns.id` | Optional |
| **API GET /api/blog/posts** | ✅ CÓ | `src/app/api/blog/posts/route.ts` | List all posts |
| **API GET /api/blog/posts/[slug]** | ✅ CÓ | `src/app/api/blog/posts/[slug]/route.ts` | Get post detail |
| **API GET /api/blog/my-posts** | ✅ CÓ | `src/app/api/blog/my-posts/route.ts` | Get user's own posts |
| **Blog Service** | ✅ CÓ | `src/lib/blog/blog.service.ts` | Business logic |
| **Blog Detail Page** | ✅ CÓ | `src/app/blog/[slug]/page.tsx` | Public post view |
| **Profile Page** | ✅ CÓ | `src/app/profile/[userId]/page.tsx` | Owner & Public view |

### 1.2. 🔍 Cấu Trúc Dữ Liệu Blog

```typescript
// From prisma/schema.prisma
model blog_posts {
  id                   String           @id
  authorId             String           // ✅ Foreign key to users
  campaignId           String?          // ✅ Optional link to campaign
  title                String
  slug                 String           @unique
  excerpt              String?
  coverImage           String?
  status               BlogPostStatus   // DRAFT, PENDING_REVIEW, PUBLISHED, ARCHIVED
  type                 BlogPostType     // PLATFORM, CAMPAIGN_UPDATE, GENERAL, ANNOUNCEMENT
  visibility           BlogVisibility   // PUBLIC, PRIVATE, UNLISTED
  publishedAt          DateTime?
  createdAt            DateTime
  updatedAt            DateTime
  deletedAt            DateTime?
  viewCount            Int              @default(0)
  likeCount            Int              @default(0)
  commentCount         Int              @default(0)
  bookmarkCount        Int              @default(0)
  isFeatured           Boolean          @default(false)
  wordCount            Int              @default(0)
  readingTimeMinutes   Int              @default(0)
  
  // Relations
  users                users            @relation(...)
  campaigns            campaigns?       @relation(...)
  blog_comments        blog_comments[]
  blog_likes           blog_likes[]
  blog_post_categories blog_post_categories[]
  blog_post_tags       blog_post_tags[]
}
```

### 1.3. 📊 API Có Sẵn

**GET /api/blog/posts**
- Query params: page, limit, search, category, tag, type, campaignId, featured, sort
- Trả về: `{ posts: BlogPost[], total: number, page: number, limit: number }`
- Public endpoint (có filter visibility)

**GET /api/blog/my-posts**
- Auth required
- Lấy posts của chính user đang login
- Trả về tất cả status (DRAFT, PUBLISHED, etc.)

**GET /api/blog/posts/[slug]**
- Lấy chi tiết 1 post theo slug
- Check visibility và permissions

---

## 2. PROFILE PAGE HIỆN TẠI

### 2.1. File Profile Page

**Path:** `src/app/profile/[userId]/page.tsx`

**Sections hiện có:**
1. ✅ Profile Header (Cover + Avatar + Info)
2. ✅ Stats (Campaigns, Total Raised, Backers, etc.)
3. ✅ Badges Section
4. ✅ Created Campaigns Section (Owner: có Edit, Public: chỉ View)
5. ✅ Supported Campaigns Section (Pledges)
6. ✅ Achievements Sidebar

**Chế độ hiển thị:**
- ✅ Owner View: `isOwnProfile && !showAsPublic`
- ✅ Public View: `!isOwnProfile || showAsPublic`
- ✅ Preview Toggle: Query param `?preview=public`

### 2.2. Cấu Trúc Layout

```typescript
<div className="max-w-6xl mx-auto space-y-8">
  {/* Profile Header */}
  <div className="bg-white rounded-[3rem]">...</div>
  
  {/* Tabs Content */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    {/* Main Content (lg:col-span-2) */}
    <div className="lg:col-span-2 space-y-8">
      {/* Created Campaigns */}
      {isCreator && user.campaigns.length > 0 && (...)}
      
      {/* Supported Campaigns */}
      {isBacker && user.pledges.length > 0 && (...)}
      
      {/* Empty State */}
      {!isCreator && !isBacker && (...)}
    </div>
    
    {/* Sidebar (lg:col-span-1) */}
    <div className="space-y-6">
      {/* Achievements */}
    </div>
  </div>
</div>
```

---

## 3. YÊU CẦU TÍCH HỢP BLOG

### 3.1. Owner View

**Hiển thị:**
- Section title: "Bài viết" hoặc "Blog của tôi"
- Tối đa 5 bài mới nhất (tất cả status: DRAFT, PUBLISHED, etc.)
- Sắp xếp: `updatedAt DESC`

**Mỗi Blog Card:**
- ✅ Ảnh bìa (`coverImage`)
- ✅ Tiêu đề (`title`)
- ✅ Ngày đăng (`publishedAt` hoặc `createdAt`)
- ✅ Trạng thái (`status` - PUBLISHED, DRAFT, PENDING_REVIEW, ARCHIVED)
- ✅ Lượt xem (`viewCount`)
- ✅ Lượt thích (`likeCount`)
- ✅ Số bình luận (`commentCount`)

**Actions (Owner only):**
- ✅ Nút [Xem] - Link to `/blog/[slug]`
- ✅ Nút [Sửa] - Link to `/blog/[slug]/edit` (hoặc API route)

### 3.2. Public View

**Hiển thị:**
- Section title: "Bài viết"
- Tối đa 5 bài mới nhất **CHỈ status PUBLISHED & visibility PUBLIC**
- Sắp xếp: `publishedAt DESC`

**Mỗi Blog Card:**
- ✅ Ảnh bìa (`coverImage`)
- ✅ Tiêu đề (`title`)
- ✅ Ngày đăng (`publishedAt`)
- ✅ Lượt xem (`viewCount`)
- ✅ Lượt thích (`likeCount`)
- ✅ Số bình luận (`commentCount`)

**Actions (Public):**
- ✅ Nút [Xem bài viết] - Link to `/blog/[slug]`
- ❌ KHÔNG có nút Sửa

### 3.3. Thiết Kế UI

**Tuân thủ:**
- ✅ `DESIGN_SYSTEM.md`
- ✅ Colors: pgreen (#00D084), dblue (#1E3A8A), cream (#FAF8F3)
- ✅ Rounded corners: Theo style hiện tại (`rounded-2xl`, `rounded-[2.5rem]`)
- ✅ Shadows: `shadow-sm`, `hover:shadow-lg`
- ✅ Transitions: smooth hover effects

**Layout:**
- ✅ Dùng cùng phong cách với section "Chiến dịch đã tạo" (Campaigns)
- ✅ Blog card nhỏ gọn hơn Campaign card (tập trung vào title + metadata)
- ✅ Grid layout: 2 columns trên desktop, 1 column trên mobile

---

## 4. KẾ HOẠCH THỰC HIỆN

### 4.1. Option A: Query Trực Tiếp Trong Page (KHUYẾN NGHỊ)

**Ưu điểm:**
- ✅ Không cần API mới
- ✅ Server component - fetch data trực tiếp
- ✅ Tận dụng Prisma query hiện có
- ✅ Không breaking changes

**Implementation:**

```typescript
// Trong src/app/profile/[userId]/page.tsx

// Thêm vào include của prisma.users.findUnique:
include: {
  // ... existing includes ...
  blog_posts: {
    where: isOwnProfile && !showAsPublic
      ? { deletedAt: null } // Owner: all posts
      : { 
          deletedAt: null,
          status: 'PUBLISHED',
          visibility: 'PUBLIC'
        }, // Public: only published
    orderBy: isOwnProfile && !showAsPublic
      ? { updatedAt: 'desc' }
      : { publishedAt: 'desc' },
    take: 5,
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      status: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      viewCount: true,
      likeCount: true,
      commentCount: true,
    }
  }
}
```

### 4.2. Option B: Tạo API Mới (KHÔNG CẦN THIẾT)

**Path:** `/api/users/[userId]/blog-posts`

**Lý do KHÔNG làm:**
- ❌ Redundant với `/api/blog/posts?authorId=xxx`
- ❌ Thêm maintenance overhead
- ❌ Profile page là Server Component - có thể query trực tiếp

---

## 5. COMPONENT MỚI CẦN TẠO

### 5.1. `<ProfileBlogCard />` Component

**Path:** `src/components/profile/ProfileBlogCard.tsx`

**Props:**
```typescript
interface ProfileBlogCardProps {
  post: {
    slug: string;
    title: string;
    excerpt?: string;
    coverImage?: string;
    status: string;
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    viewCount: number;
    likeCount: number;
    commentCount: number;
  };
  isOwner: boolean; // Show edit button
}
```

**UI Structure:**
```
<div className="card">
  {coverImage && <img />}
  <div className="content">
    <h3>{title}</h3>
    <div className="meta">
      <span>{date}</span>
      {isOwner && <span className="status-badge">{status}</span>}
    </div>
    <div className="stats">
      <ViewIcon /> {viewCount}
      <HeartIcon /> {likeCount}
      <CommentIcon /> {commentCount}
    </div>
    <div className="actions">
      <Link href={`/blog/${slug}`}>Xem</Link>
      {isOwner && <Link href={`/blog/${slug}/edit`}>Sửa</Link>}
    </div>
  </div>
</div>
```

### 5.2. `<ProfileBlogSection />` Component (Optional)

**Path:** `src/components/profile/ProfileBlogSection.tsx`

**Hoặc viết inline trong page.tsx** (đơn giản hơn)

---

## 6. FILES CẦN SỬA

### 6.1. File Chính

| File | Action | Lý do |
|------|--------|-------|
| `src/app/profile/[userId]/page.tsx` | ✏️ Sửa | Thêm blog query + section |
| `src/components/profile/ProfileBlogCard.tsx` | ➕ Tạo mới | Blog card component |

### 6.2. Không Đụng Các File Sau

❌ **KHÔNG SỬA:**
- `src/app/api/campaigns/**` - Campaign API
- `src/app/api/pledges/**` - Donation API
- `src/app/api/chat/**` - Chat system
- `src/app/api/auth/**` - Authentication
- `src/app/dashboard/admin/**` - Admin dashboard
- `src/components/badge/**` - Badge system
- `prisma/schema.prisma` - Database schema
- `src/lib/blog/blog.service.ts` - Blog service (đã có, chỉ dùng)

---

## 7. KIỂM TRA XUNG ĐỘT

### 7.1. ✅ Không Có Xung Đột

**Blog system:**
- ✅ Hoàn toàn độc lập
- ✅ Có database table riêng
- ✅ Có API riêng
- ✅ Không ảnh hưởng Campaign, Payment, Chat

**Profile page:**
- ✅ Chỉ thêm section mới
- ✅ Không sửa Campaign section
- ✅ Không sửa Pledge section
- ✅ Không sửa Badge section

### 7.2. 🔍 Điểm Cần Lưu Ý

**Status filter logic:**
```typescript
// Owner View
where: { deletedAt: null }
// Tất cả status: DRAFT, PENDING_REVIEW, PUBLISHED, ARCHIVED

// Public View
where: { 
  deletedAt: null,
  status: 'PUBLISHED',
  visibility: 'PUBLIC'
}
// Chỉ Published + Public
```

**Date display:**
```typescript
// Owner View
{isOwner ? (
  <span>{formatDate(post.updatedAt)}</span> // "Cập nhật: ..."
) : (
  <span>{formatDate(post.publishedAt || post.createdAt)}</span>
)}
```

**Link to edit:**
```typescript
// Cần kiểm tra xem có route /blog/[slug]/edit chưa
// Nếu chưa: Chỉ link to /blog/[slug] cho nút Sửa
// Hoặc: Link to /dashboard/blog/edit/[slug] (nếu có)
```

---

## 8. PSEUDOCODE - IMPLEMENTATION

### 8.1. Update Profile Page Query

```typescript
// src/app/profile/[userId]/page.tsx

const user = await prisma.users.findUnique({
  where: { id: userId },
  include: {
    // ... existing includes (campaigns, pledges, _count) ...
    
    // NEW: Add blog_posts
    blog_posts: {
      where: {
        deletedAt: null,
        ...(isOwnProfile && !showAsPublic
          ? {} // Owner: all statuses
          : {
              status: 'PUBLISHED',
              visibility: 'PUBLIC'
            })
      },
      orderBy: isOwnProfile && !showAsPublic
        ? { updatedAt: 'desc' }
        : { publishedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        viewCount: true,
        likeCount: true,
        commentCount: true,
      }
    }
  }
});
```

### 8.2. Add Blog Section to JSX

```typescript
// Đặt TRƯỚC section "Supported Campaigns" hoặc SAU section "Created Campaigns"

{/* Blog Posts Section */}
{user.blog_posts && user.blog_posts.length > 0 && (
  <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
    <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
      <BookOpen size={24} className="text-pgreen" />
      {isOwnProfile && !showAsPublic ? "Blog của tôi" : "Bài viết"}
      ({user.blog_posts.length})
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {user.blog_posts.map((post) => (
        <ProfileBlogCard
          key={post.id}
          post={post}
          isOwner={isOwnProfile && !showAsPublic}
        />
      ))}
    </div>
  </div>
)}
```

### 8.3. Create ProfileBlogCard Component

```typescript
// src/components/profile/ProfileBlogCard.tsx

import Link from 'next/link';
import { Eye, Heart, MessageCircle, Edit } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ProfileBlogCardProps {
  post: {
    slug: string;
    title: string;
    excerpt?: string;
    coverImage?: string;
    status: string;
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    viewCount: number;
    likeCount: number;
    commentCount: number;
  };
  isOwner: boolean;
}

export function ProfileBlogCard({ post, isOwner }: ProfileBlogCardProps) {
  return (
    <div className="group bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
      {/* Cover Image */}
      {post.coverImage && (
        <div className="relative h-32 overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
          {/* Status Badge - Owner only */}
          {isOwner && (
            <div className="absolute top-2 left-2">
              <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${
                post.status === 'PUBLISHED' 
                  ? 'bg-green-500 text-white'
                  : post.status === 'DRAFT'
                  ? 'bg-gray-500 text-white'
                  : 'bg-yellow-500 text-white'
              }`}>
                {post.status}
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-pgreen transition">
          {post.title}
        </h3>
        
        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-xs text-gray-500 line-clamp-2">{post.excerpt}</p>
        )}
        
        {/* Date */}
        <div className="text-[10px] text-gray-400 font-bold uppercase">
          {isOwner
            ? `Cập nhật: ${formatDate(post.updatedAt)}`
            : formatDate(post.publishedAt || post.createdAt)
          }
        </div>
        
        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Eye size={12} /> {post.viewCount}
          </span>
          <span className="flex items-center gap-1">
            <Heart size={12} /> {post.likeCount}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle size={12} /> {post.commentCount}
          </span>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Link
            href={`/blog/${post.slug}`}
            className="flex-1 px-3 py-2 bg-pgreen text-white rounded-xl text-xs font-bold hover:bg-fgreen transition text-center"
          >
            Xem
          </Link>
          {isOwner && (
            <Link
              href={`/blog/${post.slug}/edit`}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-300 transition flex items-center gap-1"
            >
              <Edit size={12} /> Sửa
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 9. KẾT LUẬN

### 9.1. Tóm Tắt

**Hệ thống hiện tại:**
- ✅ Blog đã có đầy đủ: Database, API, Service, UI
- ✅ Profile page đã có: Owner View, Public View, Preview mode
- ✅ Không xung đột với Campaign, Badge, Donation, Chat

**Tích hợp:**
- ✅ Chỉ cần thêm query `blog_posts` vào Profile page
- ✅ Tạo 1 component mới: `<ProfileBlogCard />`
- ✅ Không cần API mới
- ✅ Không cần migration
- ✅ Không sửa logic Blog hiện có

### 9.2. Files Cần Sửa/Tạo

**Sửa:**
1. `src/app/profile/[userId]/page.tsx` - Thêm blog query + section

**Tạo mới:**
1. `src/components/profile/ProfileBlogCard.tsx` - Blog card component

**Không đụng:**
- ❌ Database schema
- ❌ Blog API
- ❌ Blog service
- ❌ Campaign, Badge, Chat, Auth

### 9.3. Effort Ước Tính

- **Time:** 1-2 giờ
- **Risk:** Rất thấp (chỉ thêm UI, không sửa logic)
- **Testing:** Kiểm tra Owner View vs Public View, Preview mode

### 9.4. Next Steps

1. ✅ **DONE:** Phân tích hệ thống (báo cáo này)
2. ⏭️ **NEXT:** Implement `ProfileBlogCard` component
3. ⏭️ **THEN:** Update Profile page query + JSX
4. ⏭️ **FINALLY:** Test + Build

---

**Người phân tích:** Kiro AI  
**Kết luận:** Sẵn sàng implement - không có xung đột, chỉ cần thêm UI.  
**Risk Level:** 🟢 RẤT THẤP

