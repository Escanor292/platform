# 🚀 Hướng dẫn Deploy lên Vercel

## ✅ Đã hoàn thành:
- [x] Tạo Neon PostgreSQL database (Singapore region)
- [x] Deploy database schema (15 migrations)
- [x] Kiểm tra kết nối thành công

## 📋 Các bước tiếp theo:

### 1. Import Project vào Vercel

1. Truy cập: https://vercel.com/new
2. Import repository từ GitHub
3. Chọn framework: **Next.js** (tự động detect)

### 2. Cấu hình Environment Variables

Trong Vercel Dashboard → Settings → Environment Variables, thêm:

#### 🗄️ Database
```bash
DATABASE_URL=postgresql://neondb_owner:npg_v9Q4oKsHObqT@ep-weathered-sky-ao6ep9en.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

MONGODB_URI=mongodb://nguyenquachphutai_db_user:0909115079%40Tai@ac-qlbdgty-shard-00-00.b4wcshp.mongodb.net:27017,ac-qlbdgty-shard-00-01.b4wcshp.mongodb.net:27017,ac-qlbdgty-shard-00-02.b4wcshp.mongodb.net:27017/?ssl=true&replicaSet=atlas-x14m5t-shard-0&authSource=admin&retryWrites=true&w=majority&appName=DuAn

MONGODB_DB_NAME=DuAn
```

#### 🔐 Authentication
```bash
NEXTAUTH_URL=https://your-domain.vercel.app
NEXT_PUBLIC_NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=7e476405-95cf-4a3f-a901-3f6f6700db49-reconstructed
```

#### 📸 Cloudinary
```bash
CLOUDINARY_CLOUD_NAME=ds6p3pr28
CLOUDINARY_API_KEY=132652741861658
CLOUDINARY_API_SECRET=AWu9EmCLekXixoNxOMUD76qUinI
```

#### 💳 Payment Gateways
```bash
# PayOS
PAYOS_CLIENT_ID=5a84749a-c2df-4aac-9b5a-b59a9ac4ba2f
PAYOS_API_KEY=c77fbbb6-eea9-4843-83ea-4bc068cbb346
PAYOS_CHECKSUM_KEY=440fbf790495caf84b1e2383677edbd1bf3e46d2cd42e307e356579e5bc6e0e7

# VNPay (nếu có)
VNP_TMN_CODE=
VNP_HASH_SECRET=

# SePay (nếu có)
SEPAY_MERCHANT_ID=
SEPAY_SECRET_KEY=
SEPAY_ENV=production
```

#### 🎛️ Feature Flags
```bash
ENABLE_MONGO_LOGS=true
ENABLE_MONGO_NOTIFICATIONS=true
ENABLE_MONGO_COMMENTS=true
ENABLE_MONGO_ANALYTICS=true
ENABLE_MONGO_CAMPAIGN_CONTENT=true
ENABLE_MONGO_CAMPAIGN_UPDATES=true
ENABLE_MONGO_USER_METADATA=true
ENABLE_MONGO_CHAT=true
```

#### 🌐 App URL
```bash
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 3. Build Settings (Đã tự động cấu hình)

File `vercel.json` đã được cấu hình:
- ✅ Build Command: `prisma generate && prisma migrate deploy && next build`
- ✅ Framework: Next.js
- ✅ Region: Singapore (sin1)
- ✅ API timeout: 30s
- ✅ CORS headers

### 4. Deploy

1. Click **Deploy** trong Vercel Dashboard
2. Đợi build hoàn thành (~3-5 phút)
3. Kiểm tra logs nếu có lỗi

### 5. Sau khi Deploy

#### Kiểm tra các endpoint:
- [ ] Homepage: `https://your-domain.vercel.app`
- [ ] API Health: `https://your-domain.vercel.app/api/health`
- [ ] Auth: `https://your-domain.vercel.app/api/auth/signin`

#### Cập nhật Webhook URLs:
Nếu dùng payment webhooks, cập nhật URLs trong:
- PayOS Dashboard: `https://your-domain.vercel.app/api/webhooks/payos`
- VNPay Dashboard: `https://your-domain.vercel.app/api/webhooks/vnpay`
- SePay Dashboard: `https://your-domain.vercel.app/api/webhooks/sepay`

#### Test Payment Flow:
1. Tạo campaign mới
2. Thử donate/pledge
3. Kiểm tra webhook logs trong Vercel

### 6. Custom Domain (Tùy chọn)

1. Vercel Dashboard → Settings → Domains
2. Thêm domain của bạn (VD: `crowdfund.vn`)
3. Cấu hình DNS records theo hướng dẫn
4. Cập nhật `NEXTAUTH_URL` và `NEXT_PUBLIC_APP_URL`

## 🔧 Troubleshooting

### Lỗi Database Connection
```bash
# Kiểm tra connection string có đúng format:
postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
```

### Lỗi Build
```bash
# Xem logs trong Vercel Dashboard → Deployments → [Your Deploy] → Build Logs
```

### Lỗi API Timeout
```bash
# Tăng timeout trong vercel.json (đã set 30s)
# Hoặc optimize API queries
```

### Lỗi Prisma Client
```bash
# Đảm bảo postinstall script chạy:
"postinstall": "prisma generate"
```

## 📊 Monitoring

- **Vercel Analytics**: Tự động enable
- **Vercel Logs**: Real-time logs trong Dashboard
- **Neon Metrics**: Database performance trong Neon Console

## 🔒 Security Checklist

- [ ] Tất cả secrets đã thêm vào Environment Variables
- [ ] File `.env` KHÔNG commit vào Git
- [ ] CORS headers đã cấu hình đúng
- [ ] SSL/TLS enabled (mặc định trên Vercel)
- [ ] Rate limiting cho API (nên thêm)

## 📈 Performance Tips

1. **Enable Vercel Edge Functions** cho static pages
2. **Optimize Images** với next/image
3. **Enable ISR** (Incremental Static Regeneration) cho campaigns
4. **Add Redis** cho caching (Upstash Redis)
5. **Monitor Neon** connection pooling

## 🎯 Next Steps

1. Setup monitoring (Sentry, LogRocket)
2. Configure CDN cho static assets
3. Add rate limiting middleware
4. Setup automated backups (Neon có sẵn)
5. Configure CI/CD với GitHub Actions

---

**Lưu ý quan trọng:**
- Neon Free Tier: 512 MB storage, 3 GB data transfer/month
- Vercel Hobby: 100 GB bandwidth/month
- MongoDB Atlas M0: 512 MB storage

Nếu vượt quá, cần upgrade plan!
