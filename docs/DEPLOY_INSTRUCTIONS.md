# 🚀 Hướng dẫn Deploy lên Vercel

## ⚠️ QUAN TRỌNG: Chạy Migration trên Production

Trước khi deploy, bạn PHẢI chạy migration trên production database để tạo bảng `campaign_blog_links`.

### Cách 1: Sử dụng Vercel CLI (Khuyến nghị)

```bash
# 1. Cài đặt Vercel CLI (nếu chưa có)
npm i -g vercel

# 2. Login vào Vercel
vercel login

# 3. Link project
vercel link

# 4. Pull environment variables
vercel env pull .env.production

# 5. Chạy migration với production database URL
npx prisma migrate deploy
```

### Cách 2: Sử dụng Prisma Data Platform

1. Truy cập: https://cloud.prisma.io/
2. Chọn project của bạn
3. Vào tab "Migrations"
4. Click "Deploy pending migrations"

### Cách 3: Chạy trực tiếp với DATABASE_URL

```bash
# Set DATABASE_URL từ Vercel
$env:DATABASE_URL="postgresql://..."

# Chạy migration
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

## 📋 Checklist Deploy

- [ ] Code đã được push lên GitHub
- [ ] Migration đã chạy trên production database
- [ ] Vercel đã tự động trigger build
- [ ] Kiểm tra build logs trên Vercel dashboard
- [ ] Test tính năng trên production URL

## 🔍 Kiểm tra sau khi Deploy

1. **Vào trang tạo campaign**
   - Kiểm tra phần "Bài viết blog liên quan" có hiển thị không
   - Thử chọn blog posts

2. **Vào trang chỉnh sửa campaign**
   - Kiểm tra blog posts đã gắn có load không
   - Thử thêm/xóa blog posts

3. **Vào trang chi tiết campaign**
   - Kiểm tra tab "Blog" có hiển thị không
   - Click vào tab Blog
   - Kiểm tra blog posts có hiển thị đúng không

## 🐛 Troubleshooting

### Lỗi: "Table campaign_blog_links does not exist"
**Nguyên nhân:** Migration chưa chạy trên production database
**Giải pháp:** Chạy `npx prisma migrate deploy` với production DATABASE_URL

### Lỗi: "Cannot find module"
**Nguyên nhân:** Build cache bị lỗi
**Giải pháp:** 
1. Vào Vercel Dashboard
2. Settings → General → Clear Build Cache
3. Redeploy

### Tab Blog không hiển thị
**Nguyên nhân:** 
- Migration chưa chạy
- linkedBlogs không được load trong query
**Giải pháp:** 
1. Kiểm tra migration đã chạy chưa
2. Kiểm tra console logs
3. Kiểm tra Vercel function logs

## 📊 Database Migration Status

Để kiểm tra migration status:

```bash
npx prisma migrate status
```

## 🔗 Links hữu ích

- Vercel Dashboard: https://vercel.com/dashboard
- Prisma Cloud: https://cloud.prisma.io/
- GitHub Repository: https://github.com/Escanor292/platform.git

## 📝 Notes

- Migration file: `prisma/migrations/20260524015114_add_campaign_blog_links/migration.sql`
- Bảng mới: `campaign_blog_links`
- Relations mới: Campaign ↔ BlogPost (many-to-many)
