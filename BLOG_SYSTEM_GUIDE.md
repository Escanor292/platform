# 📝 BLOG SYSTEM - Hướng dẫn Tích hợp

## 🎯 Tổng quan

Hệ thống Blog đã được tích hợp vào nền tảng crowdfunding với kiến trúc **Hybrid PostgreSQL + MongoDB**:

- **PostgreSQL**: Lưu metadata, quan hệ, quyền, trạng thái, thống kê
- **MongoDB**: Lưu nội dung bài viết dài, rich content, draft, version history

## 📊 Kiến trúc Database

### PostgreSQL Tables

1. **blog_posts** - Metadata bài viết
   - id, authorId, campaignId, mongoContentId
   - title, slug, excerpt, coverImage
   - status, type, visibility
   - viewCount, likeCount, commentCount, bookmarkCount
   - wordCount, readingTimeMinutes

2. **blog_categories** - Danh mục
3. **blog_tags** - Tags
4. **blog_likes** - Lượt thích
5. **blog_bookmarks** - Đánh dấu
6. **blog_comments** - Bình luận
7. **blog_reports** - Báo cáo vi phạm

### MongoDB Collections

1. **blog_contents** - Nội dung đầy đủ
   - postId, format, content, richContent
   - tableOfContents, media
   - wordCount, readingTimeMinutes

2. **blog_drafts** - Bản nháp autosave
3. **blog_versions** - Lịch sử phiên bản
4. **blog_view_logs** - Log lượt xem chi tiết

## 🚀 Cài đặt

### 1. Chạy Prisma Migration

```bash
npx prisma generate
npx prisma db push
```

### 2. Khởi tạo MongoDB Indexes và Categories

```bash
npm run blog:init
```

## 📡 API Endpoints

### Public Endpoints

- `GET /api/blog/posts` - Danh sách bài viết
- `GET /api/blog/posts/[slug]` - Chi tiết bài viết
- `GET /api/campaigns/[campaignId]/blog-posts` - Bài viết của campaign

### Auth Required Endpoints

- `POST /api/blog/posts` - Tạo bài viết
- `PATCH /api/blog/posts/[slug]` - Cập nhật bài viết
- `DELETE /api/blog/posts/[slug]` - Xóa bài viết
- `PATCH /api/blog/posts/[slug]/publish` - Xuất bản
- `PATCH /api/blog/posts/[slug]/archive` - Lưu trữ
- `POST /api/blog/posts/[slug]/like` - Toggle like
- `POST /api/blog/posts/[slug]/bookmark` - Toggle bookmark

## 🎨 Frontend Pages

### Đã tạo

- `/blog` - Danh sách blog
- `/blog/[slug]` - Chi tiết blog

### Cần tạo thêm

- `/blog/editor` - Tạo/sửa bài viết
- `/blog/my-posts` - Bài viết của tôi
- `/dashboard/blog` - Quản lý blog (admin)

## 🔐 Quyền hạn

### Admin
- Tạo mọi loại bài viết
- Publish trực tiếp
- Edit/delete/archive mọi bài
- Feature bài viết

### Campaign Owner
- Tạo bài `CAMPAIGN_UPDATE` cho campaign của mình
- Publish trực tiếp hoặc pending_review
- Edit/delete bài của mình

### Backer/User
- Đọc bài public
- Đọc bài backers_only nếu đã donate
- Like, bookmark, comment

### Guest
- Chỉ đọc bài public

## 📝 Visibility Levels

1. **PUBLIC** - Ai cũng đọc được
2. **BACKERS_ONLY** - Chỉ admin, owner, hoặc backer của campaign
3. **OWNER_ONLY** - Chỉ author hoặc admin
4. **PRIVATE** - Chỉ author hoặc admin

## 🎯 Blog Types

1. **PLATFORM** - Bài viết chung của nền tảng
2. **CAMPAIGN_UPDATE** - Cập nhật chiến dịch (bắt buộc có campaignId)
3. **ANNOUNCEMENT** - Thông báo
4. **STORY** - Câu chuyện thành công
5. **IMPACT_REPORT** - Báo cáo tác động

## 🔄 Workflow

### Tạo bài viết

1. User gọi `POST /api/blog/posts`
2. Backend tạo metadata trong PostgreSQL
3. Backend tạo content trong MongoDB
4. Backend update `mongoContentId` vào PostgreSQL
5. Nếu MongoDB fail → rollback PostgreSQL

### Lấy danh sách

1. Query PostgreSQL metadata
2. Không query MongoDB content
3. Return list với excerpt, stats

### Lấy chi tiết

1. Query PostgreSQL metadata
2. Check visibility permission
3. Query MongoDB content
4. Merge và return
5. Increment viewCount

### Update bài viết

1. Check permission
2. Create version snapshot trong MongoDB
3. Update content trong MongoDB
4. Update metadata trong PostgreSQL

## 🔧 Tích hợp vào Campaign Detail

Thêm vào `CampaignDetailScreen`:

```tsx
import { CampaignUpdatesSection } from '@/components/blog/CampaignUpdatesSection';

// Trong component
<CampaignUpdatesSection campaignId={campaign.id} />
```

## 📦 Components đã tạo

- `BlogCard` - Card hiển thị bài viết
- Cần tạo thêm:
  - `BlogEditorForm` - Form tạo/sửa bài
  - `BlogCommentList` - Danh sách comment
  - `BlogCommentInput` - Input comment
  - `CampaignUpdatesSection` - Section updates trong campaign detail

## 🎨 Rich Text Editor

Project đã có **TipTap** editor. Sử dụng cho blog:

```tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const editor = useEditor({
  extensions: [StarterKit],
  content: initialContent,
});
```

## 🔍 Search & Filter

Query parameters hỗ trợ:

- `page` - Trang
- `limit` - Số bài/trang
- `search` - Tìm kiếm title/excerpt
- `category` - Lọc theo category slug
- `tag` - Lọc theo tag slug
- `type` - Lọc theo type
- `campaignId` - Lọc theo campaign
- `featured` - Chỉ bài featured
- `sort` - latest | popular | most_viewed

## 📊 Performance

### Tối ưu

- ✅ Pagination cho list
- ✅ Index slug/status/type/published_at
- ✅ Không query MongoDB content trong list
- ✅ Cache excerpt, readingTime trong PostgreSQL
- ✅ Soft delete thay vì hard delete

### Cần cải thiện sau

- [ ] Redis cache cho hot posts
- [ ] Elasticsearch cho full-text search
- [ ] CDN cho cover images
- [ ] Rate limiting cho create/comment

## 🐛 Troubleshooting

### MongoDB connection error

```bash
# Check MONGODB_URI in .env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=crowdfunding_vn

# Reinit indexes
npm run blog:init
```

### Prisma schema error

```bash
npx prisma generate
npx prisma db push
```

### Slug conflict

Slug tự động thêm số nếu trùng: `bai-viet`, `bai-viet-2`, `bai-viet-3`

## ✅ Checklist Hoàn thành

- [x] PostgreSQL blog schema
- [x] MongoDB content models
- [x] Blog CRUD API
- [x] Slug unique generation
- [x] Role permission
- [x] Campaign update post
- [x] Blog list screen
- [x] Blog detail screen
- [x] Like/bookmark API
- [x] Visibility public/backers_only/private
- [x] Word count & reading time
- [x] Version history
- [x] Draft autosave
- [ ] Blog editor screen
- [ ] Comment system
- [ ] Admin moderation
- [ ] Campaign detail integration
- [ ] Blog + chat CTA integration

## 🚧 Cần làm tiếp

1. **Blog Editor Screen** - Form tạo/sửa bài với TipTap
2. **Comment System** - API + UI cho comments
3. **Admin Moderation** - Dashboard quản lý blog
4. **Campaign Integration** - Thêm blog section vào campaign detail
5. **My Posts Screen** - Quản lý bài viết của user
6. **Upload Image** - Tích hợp upload ảnh cho cover và content
7. **Report System** - UI báo cáo vi phạm
8. **Notification** - Thông báo khi có update mới

## 📚 Tài liệu tham khảo

- Prisma: https://www.prisma.io/docs
- MongoDB Node Driver: https://www.mongodb.com/docs/drivers/node
- TipTap Editor: https://tiptap.dev
- Next.js App Router: https://nextjs.org/docs/app
