# SePay Integration - Update Notes

## Tổng quan

Đã tích hợp thành công SePay Payment Gateway vào dự án CrowdFund VN. SePay là cổng thanh toán hỗ trợ chuyển khoản ngân hàng qua QR code, NAPAS QR và thẻ quốc tế.

## Files đã tạo mới

### 1. Core Library
- **`src/lib/payment/sepay.ts`**
  - Helper class `SePayClient` để xử lý tích hợp SePay
  - Tạo chữ ký HMAC SHA256
  - Verify signature từ IPN
  - Generate checkout form fields
  - Singleton pattern với `getSePay()`

### 2. API Routes
- **`src/app/api/payment/sepay/create/route.ts`**
  - Endpoint tạo giao dịch thanh toán mới
  - Tạo Pledge với status PENDING
  - Generate checkout fields với signature
  - Trả về checkoutUrl và checkoutFields

- **`src/app/api/payment/sepay/webhook/route.ts`**
  - IPN handler nhận thông báo từ SePay
  - Verify signature
  - Cập nhật Pledge status (SUCCESS/FAILED)
  - Cập nhật Campaign amount
  - Tạo audit logs
  - GET endpoint để test

### 3. Documentation
- **`docs/SEPAY_INTEGRATION.md`**
  - Hướng dẫn chi tiết tích hợp
  - Cấu trúc code
  - Luồng thanh toán (sequence diagram)
  - Testing guide
  - Troubleshooting
  - Go live checklist

- **`docs/SEPAY_QUICKSTART.md`**
  - Hướng dẫn nhanh 5 bước
  - Setup sandbox
  - Cấu hình IPN
  - Test integration
  - Go live production

### 4. Testing
- **`scripts/test-sepay.ts`**
  - Script test tích hợp SePay
  - Test client initialization
  - Test checkout fields generation
  - Test signature verification
  - Test HTML form generation

## Files đã cập nhật

### 1. Environment Variables
- **`.env.example`**
  - Thêm `SEPAY_MERCHANT_ID`
  - Thêm `SEPAY_SECRET_KEY`
  - Thêm `SEPAY_ENV` (sandbox/production)

### 2. Frontend Components
- **`src/app/campaigns/[slug]/CheckoutButton.tsx`**
  - Thêm button SePay vào payment methods
  - Cập nhật `handleCreatePayment()` để xử lý form submission cho SePay
  - UI: emerald color scheme cho SePay

- **`src/components/campaign/RefundPolicyModal.tsx`**
  - Thêm SePay vào danh sách thời gian hoàn tiền

- **`src/app/policy/refund/page.tsx`**
  - Thêm SePay vào danh sách cổng thanh toán

### 3. Type Definitions
- **`src/components/campaign/PledgeForm.tsx`**
  - Đã có sẵn SEPAY trong payment method types

## Tính năng

### ✅ Đã hoàn thành

1. **Payment Creation**
   - Tạo giao dịch với đầy đủ metadata
   - Generate signature bảo mật
   - Hỗ trợ tip và VAT
   - Hỗ trợ guest checkout và anonymous

2. **Webhook/IPN Handler**
   - Verify signature từ SePay
   - Xử lý ORDER_PAID notification
   - Cập nhật pledge status
   - Cập nhật campaign amount
   - Kiểm tra campaign đạt mục tiêu
   - Tạo audit logs

3. **Frontend Integration**
   - UI button trong checkout modal
   - Form submission với hidden fields
   - Redirect đến SePay gateway
   - Callback URLs (success/error/cancel)

4. **Security**
   - HMAC SHA256 signature
   - Signature verification
   - Amount validation
   - Idempotency check (prevent double processing)

5. **Documentation**
   - Chi tiết tích hợp
   - Quick start guide
   - Testing guide
   - Troubleshooting

## Cấu trúc nhất quán với các gateway khác

SePay được tích hợp theo cùng pattern với MoMo, PayOS, VNPay:

### API Structure
```
/api/payment/
  ├── momo/
  │   ├── create/route.ts
  │   └── webhook/route.ts
  ├── payos/
  │   ├── create/route.ts
  │   └── webhook/route.ts
  ├── vnpay/
  │   ├── create/route.ts
  │   └── webhook/route.ts
  └── sepay/          ← NEW
      ├── create/route.ts
      └── webhook/route.ts
```

### Pledge Flow
1. Create Pledge (PENDING)
2. Generate payment link/form
3. User completes payment
4. Webhook updates Pledge (SUCCESS/FAILED)
5. Update Campaign amount
6. Check campaign goal reached
7. Create audit log

### Response Format
```typescript
{
  checkoutUrl: string,
  checkoutFields?: object,  // SePay specific
  pledgeId: string,
  transactionId: string
}
```

## Testing

### Local Development

1. **Setup credentials:**
```bash
# .env
SEPAY_MERCHANT_ID="SP-TEST-NQ27239A"
SEPAY_SECRET_KEY="spsk_test_w25k96kmb1ZgHQGVBfYDqoWk4giLHaMB"
SEPAY_ENV="sandbox"
```

2. **Run test script:**
```bash
npx tsx scripts/test-sepay.ts
```

3. **Setup ngrok for webhook:**
```bash
npx ngrok http 3000
# Update IPN URL in SePay dashboard
```

4. **Test payment flow:**
```bash
npm run dev
# Navigate to campaign → Click "Ủng hộ dự án" → Select SePay
```

### Production

1. Get production credentials from SePay
2. Update `.env` with production values
3. Update IPN URL to production domain
4. Deploy and test with small amount

## Migration Notes

### Database
- ✅ Không cần migration mới
- ✅ Sử dụng existing Pledge model
- ✅ `paymentProvider` field hỗ trợ "SEPAY"

### Environment Variables
- ⚠️ Cần thêm 3 biến mới vào production `.env`
- ⚠️ Cần cấu hình IPN URL trong SePay dashboard

### Deployment
- ✅ Không có breaking changes
- ✅ Backward compatible với existing payments
- ✅ Có thể deploy độc lập

## Next Steps

### Immediate (Required)
1. [ ] Thêm credentials vào production `.env`
2. [ ] Cấu hình IPN URL trong SePay dashboard
3. [ ] Test payment flow ở sandbox
4. [ ] Test webhook với ngrok

### Short-term (Recommended)
1. [ ] Thêm SePay logo/icon
2. [ ] Thêm analytics tracking cho SePay payments
3. [ ] Thêm email notification template cho SePay
4. [ ] Monitor error rates và success rates

### Long-term (Optional)
1. [ ] Hỗ trợ NAPAS QR (cần gửi hồ sơ)
2. [ ] Hỗ trợ thanh toán thẻ (cần gửi hồ sơ)
3. [ ] Thêm retry logic cho failed webhooks
4. [ ] Thêm dashboard analytics cho SePay

## Performance Impact

- ✅ Minimal impact - chỉ load khi user chọn SePay
- ✅ Không ảnh hưởng đến existing payment methods
- ✅ Webhook handler tối ưu với early returns
- ✅ Signature verification nhanh (HMAC SHA256)

## Security Considerations

- ✅ Signature verification cho mọi webhook request
- ✅ Amount validation
- ✅ Idempotency check
- ✅ Credentials stored in environment variables
- ✅ No sensitive data in logs
- ✅ HTTPS required for production

## Support & Maintenance

### Monitoring
- Check webhook logs: `[SEPAY WEBHOOK]`
- Monitor pledge status updates
- Track failed payments
- Monitor signature verification failures

### Common Issues
1. **Webhook not received:** Check IPN URL, firewall, ngrok
2. **Invalid signature:** Check SECRET_KEY, restart server
3. **Pledge not found:** Check invoice number format
4. **Amount mismatch:** Check tip/VAT calculation

### Contact
- SePay Support: support@sepay.vn
- SePay Docs: https://docs.sepay.vn
- SePay Dashboard: https://my.sepay.vn

## Conclusion

Tích hợp SePay đã hoàn thành với đầy đủ tính năng:
- ✅ Payment creation
- ✅ Webhook handling
- ✅ Frontend integration
- ✅ Security measures
- ✅ Documentation
- ✅ Testing tools

Dự án giờ hỗ trợ 4 payment gateways:
1. PayOS (VietQR)
2. MoMo (E-wallet)
3. VNPay (ATM/Visa)
4. SePay (QR Banking) ← NEW

Tất cả đều follow cùng pattern và có thể hoạt động song song không conflict.
