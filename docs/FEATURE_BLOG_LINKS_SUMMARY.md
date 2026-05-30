# ✅ Tính năng: Gắn Blog vào Campaign

## 📋 Tổng quan
Tính năng cho phép creator gắn các bài blog của họ vào dự án để người ủng hộ có thể tìm hiểu thêm về câu chuyện, tiến độ và thông tin chi tiết của dự án.

## 🎯 Các tính năng chính

### 1. Trong Form Tạo/Chỉnh sửa Campaign
- ✅ Component chọn blog posts với giao diện thân thiện
- ✅ Tìm kiếm blog posts theo tiêu đề
- ✅ Hiển thị preview blog (ảnh bìa, tiêu đề, excerpt, ngày xuất bản)
- ✅ Sắp xếp thứ tự hiển thị bằng drag & drop
- ✅ Chỉ hiển thị blog posts đã PUBLISHED
- ✅ Link đến trang tạo blog nếu chưa có bài viết nào

### 2. Trong Trang Chi tiết Campaign
- ✅ Tab "Blog" mới kế bên "Thảo luận cộng đồng"
- ✅ Badge hiển thị số lượng blog posts
- ✅ Danh sách blog posts với layout đẹp mắt
- ✅ Hiển thị thông tin: ảnh bìa, tiêu đề, excerpt, ngày xuất bản
- ✅ Hiển thị số lượt xem, like, comment
- ✅ Link đến trang chi tiết blog post
- ✅ Tab chỉ hiển thị khi có blog posts được gắn

## 📁 Files đã tạo/cập nhật

### Database Schema
- ✅ `prisma/schema.prisma`
  - Thêm model `CampaignBlogLink`
  - Thêm relation `linkedBlogs` vào Campaign
  - Thêm relation `linkedCampaigns` vào BlogPost

### Components
- ✅ `src/components/create-campaign/blog-selector.tsx` (MỚI)
  - Component chọn blog posts
  - Tìm kiếm và filter
  - Drag & drop để sắp xếp
  
- ✅ `src/components/campaign/LinkedBlogsSection.tsx` (MỚI)
  - Hiển thị danh sách blog posts
  - Card layout với ảnh và thông tin
  
- ✅ `src/components/campaign/CampaignTabsWrapper.tsx` (CẬP NHẬT)
  - Thêm tab Blog
  - Hiển thị badge số lượng

### API Routes
- ✅ `src/app/api/blog/my-posts/route.ts` (MỚI)
  - GET: Lấy blog posts của user hiện tại
  - Filter theo status
  
- ✅ `src/app/api/campaigns/route.ts` (CẬP NHẬT)
  - POST: Thêm hỗ trợ `linkedBlogIds`
  - Tạo CampaignBlogLink khi tạo campaign
  
- ✅ `src/app/api/campaigns/[slug]/route.ts` (CẬP NHẬT)
  - GET: Include linkedBlogs trong response
  - PUT: Cập nhật linkedBlogIds

### Pages
- ✅ `src/app/campaigns/create/page.tsx` (CẬP NHẬT)
  - Import BlogSelector
  - Thêm linkedBlogIds vào formData
  - Render BlogSelector trong form
  
- ✅ `src/components/campaign/CampaignEditForm.tsx` (CẬP NHẬT)
  - Import BlogSelector
  - Thêm linkedBlogIds vào formData
  - Load linkedBlogIds từ campaign
  - Render BlogSelector trong form

## 🚀 Cách sử dụng

### Cho Creator:

#### 1. Tạo Campaign mới
1. Vào trang "Tạo dự án"
2. Điền thông tin dự án
3. Trong phần "Phân loại dự án", kéo xuống phần "Bài viết blog liên quan"
4. Click "Thêm bài viết blog"
5. Chọn các blog posts muốn gắn
6. Sắp xếp thứ tự nếu cần
7. Submit form

#### 2. Chỉnh sửa Campaign
1. Vào trang chỉnh sửa campaign
2. Kéo xuống phần "Bài viết blog liên quan"
3. Thêm/xóa/sắp xếp blog posts
4. Lưu thay đổi

### Cho Người ủng hộ:
1. Vào trang chi tiết campaign
2. Click tab "Blog" (nếu có)
3. Xem danh sách blog posts
4. Click vào blog post để đọc chi tiết

## 🔧 Migration

### Chạy migration:
```bash
npx prisma migrate dev --name add_campaign_blog_links
npx prisma generate
```

### Kiểm tra:
```bash
npx prisma studio
```

## 📊 Database Structure

### Bảng: campaign_blog_links
```
- id: String (PK)
- campaignId: String (FK -> campaigns.id)
- blogPostId: String (FK -> blog_posts.id)
- order: Int (thứ tự hiển thị)
- createdAt: DateTime
```

### Indexes:
- `campaignId` - Tìm blogs của campaign
- `blogPostId` - Tìm campaigns của blog
- `[campaignId, blogPostId]` - Unique constraint

## 🎨 UI/UX Features

### BlogSelector Component:
- ✅ Search box để tìm kiếm
- ✅ Preview card với ảnh, tiêu đề, excerpt
- ✅ Drag handle để sắp xếp
- ✅ Remove button khi hover
- ✅ Empty state với link tạo blog
- ✅ Loading state

### LinkedBlogsSection Component:
- ✅ Grid layout responsive
- ✅ Card với ảnh bìa
- ✅ Hover effects
- ✅ Meta info (views, likes, comments)
- ✅ Empty state
- ✅ Badge số lượng trong tab

## 🔒 Security & Validation

- ✅ Chỉ creator mới có thể gắn blog vào campaign của họ
- ✅ Chỉ blog posts đã PUBLISHED mới được hiển thị
- ✅ Validate blog ownership khi gắn
- ✅ Cascade delete khi xóa campaign hoặc blog

## 📝 Notes

- Tab Blog chỉ hiển thị khi campaign có ít nhất 1 blog được gắn
- Blog posts được sắp xếp theo trường `order`
- Có thể gắn nhiều blog posts vào 1 campaign
- 1 blog post có thể được gắn vào nhiều campaigns
- Khi update campaign, các blog links cũ sẽ bị xóa và tạo mới

## 🐛 Known Issues
Không có

## 🔮 Future Enhancements
- [ ] Thêm tính năng auto-suggest blog posts liên quan
- [ ] Thêm analytics cho blog posts từ campaign
- [ ] Cho phép gắn blog posts của người khác (với permission)
- [ ] Thêm preview blog trong modal thay vì mở tab mới
