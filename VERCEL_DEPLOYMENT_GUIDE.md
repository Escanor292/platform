# 🚀 HƯỚNG DẪN DEPLOY LÊN VERCEL

## 📋 CHUẨN BỊ TRƯỚC KHI DEPLOY

### 1. Kiểm tra dự án local
```bash
# Build thử để đảm bảo không có lỗi
npm run build

# Chạy production mode local
npm run start
```

### 2. Đảm bảo code đã push lên GitHub
```bash
git status
git add .
git commit -m "chore: prepare for Vercel deployment"
git push origin main
```

---

## 🌐 BƯỚC 1: TẠO TÀI KHOẢN VERCEL

1. Truy cập: https://vercel.com
2. Click **"Sign Up"**
3. Chọn **"Continue with GitHub"**
4. Authorize Vercel truy cập GitHub của bạn

---

## 📦 BƯỚC 2: IMPORT DỰ ÁN

### Cách 1: Qua Vercel Dashboard (Khuyến nghị)

1. Đăng nhập Vercel: https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Tìm repository: `Escanor292/Du-An`
4. Click **"Import"**

### Cách 2: Qua Vercel CLI

```bash
# Cài đặt Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

---

## ⚙️ BƯỚC 3: CẤU HÌNH DỰ ÁN

### Framework Preset
- **Framework:** Next.js
- **Root Directory:** `./` (để mặc định)
- **Build Command:** `npm run build` (tự động)
- **Output Directory:** `.next` (tự động)
- **Install Command:** `npm install` (tự động)

### Build & Development Settings
```
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Development Command: npm run dev
```

---

## 🔐 BƯỚC 4: CẤU HÌNH ENVIRONMENT VARIABLES

**QUAN TRỌNG:** Phải thêm tất cả biến môi trường từ file `.env`

### Trên Vercel Dashboard:

1. Vào **Settings** → **Environment Variables**
2. Thêm từng biến sau:

#### Database
```
DATABASE_URL = postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```
**⚠️ LƯU Ý:** 
- Không dùng `localhost` - phải dùng database cloud
- Khuyến nghị: Neon, Supabase, Railway, hoặc Vercel Postgres

#### NextAuth
```
NEXTAUTH_URL = https://your-domain.vercel.app
NEXTAUTH_SECRET = your-secret-here
```
**Tạo secret mới:**
```bash
openssl rand -base64 32
```

#### Cloudinary
```
CLOUDINARY_CLOUD_NAME = your-cloud-name
CLOUDINARY_API_KEY = your-api-key
CLOUDINARY_API_SECRET = your-api-secret
```

#### Payment Gateways
```
# PayOS
PAYOS_CLIENT_ID = your-client-id
PAYOS_API_KEY = your-api-key
PAYOS_CHECKSUM_KEY = your-checksum-key

# VNPay (nếu có)
VNP_TMN_CODE = your-tmn-code
VNP_HASH_SECRET = your-hash-secret

# MoMo (nếu có)
MOMO_PARTNER_CODE = your-partner-code
MOMO_ACCESS_KEY = your-access-key
MOMO_SECRET_KEY = your-secret-key
MOMO_ENDPOINT = https://test-payment.momo.vn/v2/gateway/api/create

# SePay (nếu có)
SEPAY_API_KEY = your-api-key
SEPAY_ACCOUNT_NUMBER = your-account
SEPAY_ACCOUNT_NAME = your-name
SEPAY_BANK_CODE = your-bank-code
SEPAY_TEMPLATE = compact2
```

#### App URL
```
NEXT_PUBLIC_APP_URL = https://your-domain.vercel.app
```

### Chọn Environment cho mỗi biến:
- ✅ **Production** (bắt buộc)
- ✅ **Preview** (khuyến nghị)
- ✅ **Development** (tùy chọn)

---

## 🗄️ BƯỚC 5: SETUP DATABASE CLOUD

### Option 1: Neon (Khuyến nghị - Free tier tốt)

1. Truy cập: https://neon.tech
2. Sign up với GitHub
3. Create new project: `crowdfund-vn`
4. Copy connection string
5. Paste vào `DATABASE_URL` trên Vercel

### Option 2: Supabase

1. Truy cập: https://supabase.com
2. Create new project
3. Vào **Settings** → **Database**
4. Copy **Connection string** (Transaction mode)
5. Paste vào `DATABASE_URL` trên Vercel

### Option 3: Railway

1. Truy cập: https://railway.app
2. New Project → Provision PostgreSQL
3. Copy connection string
4. Paste vào `DATABASE_URL` trên Vercel

### Option 4: Vercel Postgres (Tích hợp sẵn)

1. Trong Vercel project → **Storage** tab
2. Create **Postgres Database**
3. Vercel tự động thêm `DATABASE_URL`

---

## 🔄 BƯỚC 6: CHẠY DATABASE MIGRATIONS

### Sau khi setup database cloud:

```bash
# Set DATABASE_URL local tạm thời
export DATABASE_URL="postgresql://..."

# Chạy migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# (Optional) Seed data
npx prisma db seed
```

**Hoặc** thêm vào Vercel Build Command:
```
npm run build && npx prisma migrate deploy
```

---

## 🚀 BƯỚC 7: DEPLOY

1. Click **"Deploy"** trên Vercel
2. Đợi build (2-5 phút)
3. Xem logs nếu có lỗi

### Nếu build thành công:
✅ Vercel sẽ tạo URL: `https://your-project.vercel.app`

---

## 🔧 BƯỚC 8: CẤU HÌNH SAU DEPLOY

### 1. Cập nhật Webhook URLs

#### PayOS Dashboard:
- Webhook URL: `https://your-domain.vercel.app/api/payment/payos/webhook`

#### VNPay Dashboard:
- IPN URL: `https://your-domain.vercel.app/api/payment/vnpay/webhook`

#### MoMo Dashboard:
- Webhook URL: `https://your-domain.vercel.app/api/payment/momo/webhook`

### 2. Cập nhật OAuth Callbacks

#### Google OAuth Console:
- Authorized redirect URIs:
  ```
  https://your-domain.vercel.app/api/auth/callback/google
  ```

### 3. Cập nhật CORS (nếu cần)

Trong `next.config.ts`:
```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://your-domain.vercel.app' },
        ],
      },
    ];
  },
};
```

---

## 🌐 BƯỚC 9: CUSTOM DOMAIN (TÙY CHỌN)

### Nếu bạn có domain riêng:

1. Vào **Settings** → **Domains**
2. Add domain: `crowdfundvn.com`
3. Cấu hình DNS:
   - Type: `A`
   - Name: `@`
   - Value: `76.76.21.21`
   
   - Type: `CNAME`
   - Name: `www`
   - Value: `cname.vercel-dns.com`

4. Đợi DNS propagate (5-30 phút)

---

## 🐛 XỬ LÝ LỖI THƯỜNG GẶP

### Lỗi 1: Build Failed - Prisma Error
```
Error: @prisma/client did not initialize yet
```
**Giải pháp:**
```bash
# Thêm vào package.json
"scripts": {
  "postinstall": "prisma generate",
  "vercel-build": "prisma generate && prisma migrate deploy && next build"
}
```

### Lỗi 2: Database Connection Failed
```
Error: Can't reach database server
```
**Giải pháp:**
- Kiểm tra `DATABASE_URL` đúng format
- Đảm bảo database cho phép external connections
- Thử connection pooling:
  ```
  DATABASE_URL="postgresql://...?pgbouncer=true&connection_limit=1"
  ```

### Lỗi 3: Environment Variables Not Found
```
Error: process.env.NEXTAUTH_SECRET is undefined
```
**Giải pháp:**
- Kiểm tra đã thêm biến vào Vercel
- Redeploy sau khi thêm biến
- Đảm bảo chọn đúng environment (Production)

### Lỗi 4: 404 on API Routes
```
404 - This page could not be found
```
**Giải pháp:**
- Kiểm tra file structure: `src/app/api/...`
- Đảm bảo export đúng: `export async function GET/POST`
- Check `next.config.ts` không có rewrites conflict

### Lỗi 5: Image Optimization Error
```
Error: Invalid src prop
```
**Giải pháp:**
Thêm vào `next.config.ts`:
```typescript
images: {
  domains: ['res.cloudinary.com'],
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**.cloudinary.com',
    },
  ],
}
```

---

## 📊 MONITORING & LOGS

### Xem Logs:
1. Vercel Dashboard → Project → **Deployments**
2. Click vào deployment → **View Function Logs**

### Real-time Logs:
```bash
vercel logs --follow
```

### Analytics:
- Vercel tự động enable **Web Analytics**
- Xem tại: Dashboard → **Analytics** tab

---

## 🔄 CI/CD TỰ ĐỘNG

Vercel tự động deploy khi:
- ✅ Push lên `main` branch → Production
- ✅ Push lên branch khác → Preview deployment
- ✅ Pull Request → Preview deployment

### Tắt auto-deploy cho branch:
1. **Settings** → **Git**
2. Configure **Production Branch**: `main`
3. Configure **Preview Branches**: `All branches` hoặc chọn specific

---

## ✅ CHECKLIST TRƯỚC KHI LAUNCH

- [ ] Build thành công local
- [ ] Database migrations chạy thành công
- [ ] Tất cả environment variables đã thêm
- [ ] Webhook URLs đã cập nhật
- [ ] OAuth callbacks đã cập nhật
- [ ] Test payment flow trên production
- [ ] Test authentication flow
- [ ] Test image upload
- [ ] Check responsive trên mobile
- [ ] Test performance (Lighthouse)
- [ ] Setup custom domain (nếu có)
- [ ] Enable Vercel Analytics
- [ ] Setup error monitoring (Sentry)

---

## 🎯 PERFORMANCE OPTIMIZATION

### 1. Enable Edge Functions (nếu cần)
```typescript
// src/app/api/route.ts
export const runtime = 'edge';
```

### 2. Enable ISR (Incremental Static Regeneration)
```typescript
// src/app/page.tsx
export const revalidate = 3600; // 1 hour
```

### 3. Enable Image Optimization
Vercel tự động optimize images qua `next/image`

### 4. Enable Caching
```typescript
// src/app/api/route.ts
export async function GET() {
  return new Response(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  });
}
```

---

## 💰 PRICING & LIMITS

### Vercel Free Tier:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ 100 hours serverless function execution
- ✅ 1000 Edge Middleware invocations
- ✅ Custom domains
- ✅ SSL certificates

### Nếu vượt giới hạn:
- Upgrade to **Pro Plan**: $20/month
- Hoặc optimize để giảm usage

---

## 📞 HỖ TRỢ

### Vercel Documentation:
- https://vercel.com/docs

### Vercel Community:
- https://github.com/vercel/vercel/discussions

### Next.js Documentation:
- https://nextjs.org/docs

---

## 🎉 HOÀN TẤT!

Sau khi hoàn thành các bước trên, dự án của bạn đã live tại:
```
https://your-project.vercel.app
```

**Lưu ý cuối cùng:**
- 🔒 Đảm bảo repository là **PRIVATE** nếu có sensitive data
- 🔐 Không commit file `.env` vào Git
- 📊 Monitor logs thường xuyên trong tuần đầu
- 🐛 Setup error tracking (Sentry) ngay sau deploy
- 📧 Test email notifications (nếu có)
- 💳 Test payment flow với real transactions

**Chúc mừng bạn đã deploy thành công!** 🚀
