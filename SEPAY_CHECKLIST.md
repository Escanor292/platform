# SePay Integration Checklist

## ✅ Hoàn thành

### Core Implementation
- [x] Tạo SePay helper library (`src/lib/payment/sepay.ts`)
- [x] Tạo API create payment (`src/app/api/payment/sepay/create/route.ts`)
- [x] Tạo API webhook handler (`src/app/api/payment/sepay/webhook/route.ts`)
- [x] Signature generation (HMAC SHA256)
- [x] Signature verification
- [x] Checkout form fields generation
- [x] HTML form generation (optional)

### Frontend Integration
- [x] Thêm SePay button vào CheckoutButton
- [x] Xử lý form submission cho SePay
- [x] UI design (emerald color scheme)
- [x] Cập nhật RefundPolicyModal
- [x] Cập nhật refund policy page

### Security
- [x] HMAC SHA256 signature
- [x] Signature verification trong webhook
- [x] Amount validation
- [x] Idempotency check
- [x] Environment variables cho credentials

### Database
- [x] Sử dụng existing Pledge model
- [x] PaymentProvider: "SEPAY"
- [x] Audit logs integration
- [x] Campaign amount update
- [x] Goal achievement check

### Documentation
- [x] Chi tiết tích hợp (SEPAY_INTEGRATION.md)
- [x] Quick start guide (SEPAY_QUICKSTART.md)
- [x] Update notes (SEPAY_UPDATE_NOTES.md)
- [x] Webhook example payload
- [x] Testing scripts

### Testing
- [x] Test script (scripts/test-sepay.ts)
- [x] Webhook test script (scripts/test-sepay-webhook.sh)
- [x] Example webhook payload
- [x] No TypeScript errors
- [x] No linting errors

## 🔄 Cần làm (Setup)

### Development Environment
- [ ] Copy `.env.example` thành `.env`
- [ ] Đăng ký tài khoản SePay sandbox
- [ ] Lấy `SEPAY_MERCHANT_ID` từ dashboard
- [ ] Lấy `SEPAY_SECRET_KEY` từ dashboard
- [ ] Cập nhật `.env` với credentials
- [ ] Setup ngrok cho webhook testing
- [ ] Cấu hình IPN URL trong SePay dashboard

### Testing
- [ ] Chạy `npx tsx scripts/test-sepay.ts`
- [ ] Start dev server: `npm run dev`
- [ ] Test tạo payment qua UI
- [ ] Test webhook với ngrok
- [ ] Verify pledge status trong database
- [ ] Test với các scenarios khác nhau:
  - [ ] Successful payment
  - [ ] Failed payment
  - [ ] Cancelled payment
  - [ ] Amount mismatch
  - [ ] Invalid signature

### Production Deployment
- [ ] Hoàn thành testing ở sandbox
- [ ] Liên kết tài khoản ngân hàng thật
- [ ] Lấy production credentials
- [ ] Cập nhật production `.env`:
  - [ ] `SEPAY_MERCHANT_ID` (production)
  - [ ] `SEPAY_SECRET_KEY` (production)
  - [ ] `SEPAY_ENV="production"`
- [ ] Cập nhật IPN URL production
- [ ] Deploy code lên production
- [ ] Test với số tiền nhỏ
- [ ] Monitor logs 24h đầu

## 📋 Testing Checklist

### Unit Tests
- [x] SePay client initialization
- [x] Checkout fields generation
- [x] Signature generation
- [x] Signature verification
- [x] HTML form generation

### Integration Tests
- [ ] Create payment API
  - [ ] Valid request
  - [ ] Missing fields
  - [ ] Invalid campaign
  - [ ] Invalid amount
- [ ] Webhook API
  - [ ] Valid notification
  - [ ] Invalid signature
  - [ ] Missing pledge
  - [ ] Amount mismatch
  - [ ] Duplicate notification

### End-to-End Tests
- [ ] Complete payment flow
  - [ ] User selects SePay
  - [ ] Form submits to SePay
  - [ ] User completes payment
  - [ ] Webhook receives notification
  - [ ] Pledge status updates
  - [ ] Campaign amount updates
  - [ ] User redirects to success page

### Edge Cases
- [ ] Concurrent webhook calls
- [ ] Webhook retry from SePay
- [ ] Network timeout
- [ ] Database connection error
- [ ] Invalid pledge ID format
- [ ] Expired payment session

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Documentation complete
- [ ] Environment variables documented
- [ ] Backup database

### Deployment
- [ ] Update `.env` on server
- [ ] Deploy code
- [ ] Run migrations (if any)
- [ ] Restart services
- [ ] Verify deployment

### Post-deployment
- [ ] Test payment flow
- [ ] Monitor error logs
- [ ] Monitor webhook logs
- [ ] Check pledge creation
- [ ] Check campaign updates
- [ ] Verify email notifications (if any)

### Monitoring (First 24h)
- [ ] Track payment success rate
- [ ] Track webhook delivery rate
- [ ] Monitor error rates
- [ ] Check response times
- [ ] Review user feedback

## 📊 Success Metrics

### Technical Metrics
- [ ] Payment creation success rate > 99%
- [ ] Webhook processing success rate > 99%
- [ ] Average response time < 500ms
- [ ] Zero signature verification failures
- [ ] Zero amount mismatch errors

### Business Metrics
- [ ] SePay adoption rate
- [ ] Payment completion rate
- [ ] Average transaction value
- [ ] User satisfaction score
- [ ] Support ticket volume

## 🔧 Maintenance Tasks

### Daily
- [ ] Monitor error logs
- [ ] Check webhook delivery
- [ ] Review failed payments

### Weekly
- [ ] Analyze payment trends
- [ ] Review error patterns
- [ ] Update documentation if needed

### Monthly
- [ ] Review security logs
- [ ] Update credentials if needed
- [ ] Performance optimization
- [ ] User feedback review

## 📞 Support Contacts

### SePay
- Dashboard: https://my.sepay.vn
- Documentation: https://docs.sepay.vn
- Support Email: support@sepay.vn
- Support Phone: (nếu có)

### Internal
- Tech Lead: [Name]
- DevOps: [Name]
- Product Manager: [Name]

## 📚 Resources

### Documentation
- [Integration Guide](./docs/SEPAY_INTEGRATION.md)
- [Quick Start](./docs/SEPAY_QUICKSTART.md)
- [Update Notes](./SEPAY_UPDATE_NOTES.md)
- [SePay Official Docs](https://docs.sepay.vn)

### Code
- Helper Library: `src/lib/payment/sepay.ts`
- Create API: `src/app/api/payment/sepay/create/route.ts`
- Webhook API: `src/app/api/payment/sepay/webhook/route.ts`
- Frontend: `src/app/campaigns/[slug]/CheckoutButton.tsx`

### Testing
- Test Script: `scripts/test-sepay.ts`
- Webhook Test: `scripts/test-sepay-webhook.sh`
- Example Payload: `docs/sepay-webhook-example.json`

## ✨ Next Steps

### Immediate (This Sprint)
1. Setup development environment
2. Run all tests
3. Test payment flow end-to-end
4. Fix any issues found

### Short-term (Next Sprint)
1. Deploy to staging
2. User acceptance testing
3. Deploy to production
4. Monitor and optimize

### Long-term (Future)
1. Add NAPAS QR support
2. Add card payment support
3. Implement retry logic
4. Add analytics dashboard
5. Optimize performance

---

**Last Updated:** $(date)
**Status:** ✅ Ready for Testing
**Next Milestone:** Development Environment Setup
