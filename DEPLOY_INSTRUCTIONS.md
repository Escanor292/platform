# 🚀 Hướng dẫn Deploy lên Vercel

## ✅ Đã hoàn thành:
- [x] Push code lên GitHub
- [x] Commit: `feat: Add blog post about tax, update schema with content field, fix image config`

## 📋 Các bước tiếp theo:

### 1. Chờ Vercel Auto-Deploy
Vercel sẽ tự động phát hiện commit mới và bắt đầu build. Kiểm tra tại:
- Dashboard: https://vercel.com/dashboard
- Project: https://platform-seven-navy-44.vercel.app

### 2. Chạy Database Migration trên Production

**Quan trọng**: Migration mới đã thêm trường `content` vào bảng `blog_posts`.

#### Cách 1: Sử dụng Vercel CLI (Khuyến nghị)
```bash
# Cài đặt Vercel CLI (nếu chưa có)
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Chạy migration
vercel env pull .env.production
npx prisma migrate deploy
```

#### Cách 2: Chạy trực tiếp với Production DATABASE_URL
```bash
# Set DATABASE_URL từ Vercel Environment Variables
$env:DATABASE_URL="postgresql://neondb_owner:npg_v9Q4oKsHObqT@ep-weathered-sky-ao6ep9en.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# Chạy migration
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### 3. Seed dữ liệu blog (Nếu cần)

Sau khi migration thành công, chạy script để thêm bài blog:

```bash
# Với production DATABASE_URL
node create-blog-thue-tncn.js
node update-blog-content.js
```

### 4. Kiểm tra Vercel Environment Variables

Đảm bảo các biến môi trường sau đã được set:

#### ✅ Database
- `DATABASE_URL` - Neon PostgreSQL connection string

#### ✅ NextAuth
- `NEXTAUTH_URL` = `https://platform-seven-navy-44.vercel.app`
- `NEXTAUTH_SECRET` - Secret key cho NextAuth

#### ✅ Cloudinary
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

#### ✅ PayOS
- `PAYOS_CLIENT_ID`
- `PAYOS_API_KEY`
- `PAYOS_CHECKSUM_KEY`

#### ✅ MongoDB (Optional)
- `MONGODB_URI`
- `MONGODB_DB_NAME`
- Feature flags: `ENABLE_MONGO_*`

### 5. Kiểm tra Build Log

Truy cập Vercel Dashboard để xem build log:
1. Vào project: https://vercel.com/dashboard
2. Click vào deployment mới nhất
3. Xem tab "Building" và "Logs"

### 6. Test Production

Sau khi deploy thành công, test các tính năng:

#### ✅ Blog Post
- URL: https://platform-seven-navy-44.vercel.app/blog/thue-thu-nhap-ca-nhan-tncn-ke-khai-thue-va-quyet-toan-thue
- Kiểm tra:
  - [ ] Ảnh cover hiển thị (Unsplash)
  - [ ] Nội dung HTML render đúng
  - [ ] Tags và category hiển thị
  - [ ] Responsive trên mobile

#### ✅ Images
- [ ] Ảnh từ Cloudinary load được
- [ ] Ảnh từ Unsplash load được
- [ ] Next/Image optimization hoạt động

#### ✅ Database
- [ ] Kết nối Neon PostgreSQL thành công
- [ ] Migration đã chạy
- [ ] Dữ liệu blog hiển thị

### 7. Rollback (Nếu có lỗi)

Nếu deployment gặp lỗi:

```bash
# Rollback về commit trước
git revert HEAD
git push origin main

# Hoặc rollback trên Vercel Dashboard
# Deployments > Previous Deployment > Promote to Production
```

## 📊 Monitoring

### Kiểm tra logs:
```bash
vercel logs https://platform-seven-navy-44.vercel.app
```

### Kiểm tra database:
```bash
npx prisma studio
```

## 🐛 Troubleshooting

### Lỗi: Migration failed
**Nguyên nhân**: DATABASE_URL không đúng hoặc không có quyền
**Giải pháp**: 
1. Kiểm tra DATABASE_URL trong Vercel Environment Variables
2. Test connection: `npx prisma db pull`

### Lỗi: Image optimization failed
**Nguyên nhân**: Hostname chưa được config
**Giải pháp**: Đã fix trong `next.config.ts`, rebuild là xong

### Lỗi: Blog post không hiển thị
**Nguyên nhân**: Migration chưa chạy hoặc seed chưa chạy
**Giải pháp**: 
1. Chạy migration: `npx prisma migrate deploy`
2. Chạy seed: `node create-blog-thue-tncn.js`

## 📝 Notes

- **Auto-deployment**: Vercel tự động deploy khi có push lên `main`
- **Preview deployments**: Mỗi PR sẽ có preview URL riêng
- **Environment**: Production sử dụng biến môi trường từ Vercel Dashboard
- **Database**: Neon PostgreSQL serverless, auto-scale

## 🔗 Links

- **Production**: https://platform-seven-navy-44.vercel.app
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repo**: https://github.com/Escanor292/platform.git
- **Neon Dashboard**: https://console.neon.tech

---

**Last Updated**: 2026-05-23
**Deployment Status**: ✅ Code pushed, waiting for Vercel build
