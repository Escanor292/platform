# ✅ DEPLOYMENT CHECKLIST

## 📋 TRƯỚC KHI DEPLOY

### 1. Code Quality
- [ ] `npm run build` chạy thành công
- [ ] Không có TypeScript errors
- [ ] Không có ESLint errors
- [ ] Code đã được commit và push lên GitHub

### 2. Environment Variables
- [ ] Đã chuẩn bị tất cả env vars từ `.env`
- [ ] Đã tạo `NEXTAUTH_SECRET` mới cho production
- [ ] Đã có database cloud URL (Neon/Supabase/Railway)

### 3. Database
- [ ] Database cloud đã được tạo
- [ ] Connection string đã test thành công
- [ ] Migrations đã chạy: `npx prisma migrate deploy`
- [ ] (Optional) Seed data: `npx prisma db seed`

---

## 🚀 TRONG QUÁ TRÌNH DEPLOY

### 1. Vercel Setup
- [ ] Đã tạo tài khoản Vercel
- [ ] Đã connect với GitHub
- [ ] Đã import project từ GitHub

### 2. Build Configuration
- [ ] Framework: Next.js
- [ ] Build Command: `npm run vercel-build`
- [ ] Output Directory: `.next`
- [ ] Install Command: `npm install`

### 3. Environment Variables (Vercel Dashboard)
- [ ] `DATABASE_URL`
- [ ] `NEXTAUTH_URL` (https://your-domain.vercel.app)
- [ ] `NEXTAUTH_SECRET`
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`
- [ ] `PAYOS_CLIENT_ID`
- [ ] `PAYOS_API_KEY`
- [ ] `PAYOS_CHECKSUM_KEY`
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] (Optional) VNPay, MoMo, SePay credentials

### 4. Deploy
- [ ] Click "Deploy" button
- [ ] Đợi build hoàn thành (2-5 phút)
- [ ] Check build logs nếu có lỗi

---

## ✅ SAU KHI DEPLOY

### 1. Verification
- [ ] Website accessible tại Vercel URL
- [ ] Homepage load thành công
- [ ] Images hiển thị đúng
- [ ] Navigation hoạt động
- [ ] Authentication flow hoạt động
- [ ] Database queries hoạt động

### 2. Payment Gateway Configuration
- [ ] Cập nhật PayOS webhook URL
- [ ] Cập nhật VNPay IPN URL (nếu có)
- [ ] Cập nhật MoMo webhook URL (nếu có)
- [ ] Test payment flow với sandbox

### 3. OAuth Configuration
- [ ] Cập nhật Google OAuth redirect URIs
- [ ] Test Google login

### 4. Testing
- [ ] Test đăng ký tài khoản mới
- [ ] Test đăng nhập
- [ ] Test tạo campaign
- [ ] Test pledge/payment
- [ ] Test upload ảnh
- [ ] Test responsive trên mobile
- [ ] Test trên các browsers (Chrome, Firefox, Safari)

### 5. Performance
- [ ] Run Lighthouse audit
- [ ] Check Core Web Vitals
- [ ] Verify images are optimized
- [ ] Check page load times

### 6. Monitoring
- [ ] Enable Vercel Analytics
- [ ] Setup error tracking (Sentry - optional)
- [ ] Monitor function logs
- [ ] Check for any errors in logs

### 7. Custom Domain (Optional)
- [ ] Add custom domain in Vercel
- [ ] Configure DNS records
- [ ] Wait for DNS propagation
- [ ] Verify SSL certificate

---

## 🐛 TROUBLESHOOTING

### Build Fails
- [ ] Check build logs in Vercel
- [ ] Verify all dependencies in package.json
- [ ] Check TypeScript errors
- [ ] Verify Prisma schema

### Database Connection Fails
- [ ] Verify DATABASE_URL format
- [ ] Check database allows external connections
- [ ] Try connection pooling parameter
- [ ] Check database is running

### Environment Variables Not Working
- [ ] Verify all vars are added in Vercel
- [ ] Check spelling and case sensitivity
- [ ] Redeploy after adding new vars
- [ ] Verify environment selection (Production)

### Payment Webhooks Not Working
- [ ] Verify webhook URLs are updated
- [ ] Check webhook signature verification
- [ ] Test with webhook testing tools
- [ ] Check function logs for errors

---

## 📊 POST-LAUNCH MONITORING

### First 24 Hours
- [ ] Monitor error logs every 2 hours
- [ ] Check user registrations
- [ ] Monitor payment transactions
- [ ] Check database performance
- [ ] Monitor bandwidth usage

### First Week
- [ ] Daily log review
- [ ] User feedback collection
- [ ] Performance monitoring
- [ ] Bug tracking
- [ ] Feature usage analytics

### Ongoing
- [ ] Weekly performance review
- [ ] Monthly cost review
- [ ] Security updates
- [ ] Dependency updates
- [ ] Backup verification

---

## 🎯 SUCCESS CRITERIA

- ✅ Website loads in < 3 seconds
- ✅ No critical errors in logs
- ✅ Payment flow works end-to-end
- ✅ Authentication works correctly
- ✅ Database queries are fast (< 500ms)
- ✅ Images load properly
- ✅ Mobile experience is smooth
- ✅ Lighthouse score > 90

---

## 📞 SUPPORT CONTACTS

- **Vercel Support:** https://vercel.com/support
- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **PayOS Support:** https://payos.vn/docs

---

**Last Updated:** 17/04/2026  
**Version:** 1.0
