# ⚡ QUICK DEPLOY TO VERCEL (5 PHÚT)

## 🎯 CÁC BƯỚC NHANH NHẤT

### 1️⃣ Chuẩn bị Database Cloud (2 phút)

**Chọn 1 trong 4 options:**

#### Option A: Neon (Khuyến nghị)
```
1. Vào: https://neon.tech
2. Sign up → Create project: "crowdfund-vn"
3. Copy connection string
```

#### Option B: Supabase
```
1. Vào: https://supabase.com
2. New project → Settings → Database
3. Copy connection string (Transaction mode)
```

#### Option C: Railway
```
1. Vào: https://railway.app
2. New Project → Provision PostgreSQL
3. Copy connection string
```

#### Option D: Vercel Postgres
```
Sẽ setup sau khi import project vào Vercel
```

---

### 2️⃣ Deploy lên Vercel (3 phút)

1. **Vào Vercel:**
   ```
   https://vercel.com/new
   ```

2. **Import Repository:**
   - Click "Import Git Repository"
   - Chọn: `Escanor292/Du-An`
   - Click "Import"

3. **Configure Project:**
   - Framework: `Next.js` (auto-detect)
   - Root Directory: `./`
   - Build Command: `npm run vercel-build`
   - Click "Deploy" (chưa cần env vars)

4. **Đợi build xong** (sẽ fail - OK!)

5. **Add Environment Variables:**
   
   Vào **Settings** → **Environment Variables**, thêm:

   ```bash
   # Database (REQUIRED)
   DATABASE_URL=postgresql://...
   
   # Auth (REQUIRED)
   NEXTAUTH_URL=https://your-project.vercel.app
   NEXTAUTH_SECRET=<generate-new-secret>
   
   # Cloudinary (REQUIRED)
   CLOUDINARY_CLOUD_NAME=ds6p3pr28
   CLOUDINARY_API_KEY=132652741861658
   CLOUDINARY_API_SECRET=AWu9EmCLekXixoNxOMUD76qUinI
   
   # PayOS (REQUIRED)
   PAYOS_CLIENT_ID=5a84749a-c2df-4aac-9b5a-b59a9ac4ba2f
   PAYOS_API_KEY=c77fbbb6-eea9-4843-83ea-4bc068cbb346
   PAYOS_CHECKSUM_KEY=440fbf790495caf84b1e2383677edbd1bf3e46d2cd42e307e356579e5bc6e0e7
   
   # App URL (REQUIRED)
   NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
   ```

   **Generate NEXTAUTH_SECRET:**
   ```bash
   # Windows PowerShell
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
   
   # Hoặc online
   https://generate-secret.vercel.app/32
   ```

6. **Redeploy:**
   - Vào **Deployments** tab
   - Click "..." → "Redeploy"
   - Đợi 2-3 phút

7. **Done!** 🎉
   ```
   https://your-project.vercel.app
   ```

---

## 🔧 SAU KHI DEPLOY

### Cập nhật Webhook URLs:

1. **PayOS Dashboard:**
   ```
   Webhook URL: https://your-project.vercel.app/api/payment/payos/webhook
   ```

2. **Test Payment:**
   - Vào website → Tạo campaign
   - Test pledge với PayOS

---

## 🐛 NẾU CÓ LỖI

### Build Failed?
```bash
# Check logs trong Vercel
# Thường là thiếu env vars hoặc database connection
```

### Database Connection Failed?
```bash
# Verify DATABASE_URL format:
postgresql://user:password@host:port/database

# Thêm connection pooling:
postgresql://...?pgbouncer=true&connection_limit=1
```

### 404 Errors?
```bash
# Redeploy lại sau khi thêm env vars
```

---

## 📚 CHI TIẾT HƠN

Xem file: `VERCEL_DEPLOYMENT_GUIDE.md`

---

**Thời gian:** ~5 phút  
**Độ khó:** ⭐⭐ (Dễ)
