# Migration: Thêm tính năng gắn Blog vào Campaign

## Mô tả
Tính năng này cho phép creator gắn các bài blog của họ vào dự án để người ủng hộ có thể tìm hiểu thêm về câu chuyện, tiến độ và thông tin chi tiết.

## Các thay đổi

### 1. Database Schema
- Thêm model `CampaignBlogLink` để tạo many-to-many relationship giữa Campaign và BlogPost
- Thêm relation `linkedBlogs` vào Campaign model
- Thêm relation `linkedCampaigns` vào BlogPost model

### 2. Components mới
- `src/components/create-campaign/blog-selector.tsx` - Component chọn blog posts
- `src/components/campaign/LinkedBlogsSection.tsx` - Component hiển thị linked blogs

### 3. API Endpoints mới
- `GET /api/blog/my-posts` - Lấy danh sách blog posts của user hiện tại

### 4. API Endpoints đã cập nhật
- `POST /api/campaigns` - Thêm hỗ trợ `linkedBlogIds`
- `PUT /api/campaigns/[slug]` - Thêm hỗ trợ cập nhật `linkedBlogIds`
- `GET /api/campaigns/[slug]` - Include `linkedBlogs` trong response

### 5. Forms đã cập nhật
- `src/app/campaigns/create/page.tsx` - Thêm BlogSelector
- `src/components/campaign/CampaignEditForm.tsx` - Thêm BlogSelector
- `src/components/campaign/CampaignTabsWrapper.tsx` - Thêm tab Blog

## Hướng dẫn Migration

### Bước 1: Chạy Prisma Migration
```bash
npx prisma migrate dev --name add_campaign_blog_links
```

### Bước 2: Generate Prisma Client
```bash
npx prisma generate
```

### Bước 3: Kiểm tra Migration
```bash
npx prisma studio
```

Kiểm tra xem bảng `campaign_blog_links` đã được tạo chưa.

### Bước 4: Test tính năng
1. Đăng nhập với tài khoản Creator
2. Tạo một số blog posts (nếu chưa có)
3. Tạo hoặc chỉnh sửa campaign
4. Thêm blog posts vào campaign
5. Xem trang chi tiết campaign và kiểm tra tab Blog

## Rollback (nếu cần)
Nếu cần rollback migration:
```bash
npx prisma migrate resolve --rolled-back add_campaign_blog_links
```

Sau đó xóa các thay đổi trong schema.prisma và chạy lại:
```bash
npx prisma migrate dev
```

## Notes
- Tính năng này chỉ hiển thị blog posts đã được PUBLISHED
- Creator chỉ có thể gắn blog posts của chính họ
- Thứ tự hiển thị blog posts được lưu trong trường `order`
- Tab Blog chỉ hiển thị khi campaign có ít nhất 1 blog post được gắn
