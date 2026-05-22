# SePay - Hướng dẫn nhanh

## Bước 1: Lấy thông tin tích hợp

### Sandbox (Test)

1. Truy cập: https://my.sepay.vn/register
2. Đăng ký tài khoản mới
3. Vào **Cổng thanh toán** → **Đăng ký**
4. Chọn **Quét mã QR chuyển khoản ngân hàng** → **Bắt đầu ngay**
5. Chọn **Sandbox** và làm theo hướng dẫn
6. Sao chép thông tin:
   - `MERCHANT ID`: SP-TEST-XXXXXXXX
   - `SECRET KEY`: spsk_test_xxxxxxxxxxxx

## Bước 2: Cấu hình môi trường

Thêm vào file `.env`:

```env
# SePay Payment Gateway
SEPAY_MERCHANT_ID="SP-TEST-NQ27239A"
SEPAY_SECRET_KEY="spsk_test_w25k96kmb1ZgHQGVBfYDqoWk4giLHaMB"
SEPAY_ENV="sandbox"
```

## Bước 3: Cấu hình IPN (Webhook)

### Development (Local)

1. Cài đặt ngrok:
```bash
npm install -g ngrok
# hoặc
npx ngrok http 3000
```

2. Chạy ngrok:
```bash
ngrok http 3000
```

3. Copy URL từ ngrok (VD: `https://abc123.ngrok.io`)

4. Vào SePay dashboard → Cấu hình IPN:
```
https://abc123.ngrok.io/api/payment/sepay/webhook
```

### Production

Cấu hình IPN URL:
```
https://yourdomain.com/api/payment/sepay/webhook
```

## Bước 4: Test tích hợp

### Test 1: Chạy script test

```bash
npx tsx scripts/test-sepay.ts
```

Kết quả mong đợi:
```
✅ SePay client initialized successfully
✅ Checkout fields generated successfully
✅ Checkout URL: https://pay-sandbox.sepay.vn/v1/checkout/init
✅ All tests passed!
```

### Test 2: Test qua UI

1. Start dev server:
```bash
npm run dev
```

2. Truy cập một campaign: `http://localhost:3000/campaigns/[slug]`

3. Click **Ủng hộ dự án ngay**

4. Chọn số tiền và điền thông tin

5. Chọn **SePay (QR Banking)**

6. Bạn sẽ được chuyển đến trang thanh toán SePay

7. Quét QR code để thanh toán (sandbox)

### Test 3: Kiểm tra webhook

1. Mở terminal mới và theo dõi logs:
```bash
npm run dev
```

2. Sau khi thanh toán, kiểm tra logs:
```
[SEPAY WEBHOOK] Received: {...}
[SEPAY WEBHOOK] Payment successful: pledge-id
```

3. Kiểm tra database:
```bash
npx prisma studio
```

Tìm pledge vừa tạo và kiểm tra:
- `status`: SUCCESS
- `paymentProvider`: SEPAY
- `transactionId`: có giá trị

## Bước 5: Go Live (Production)

### 5.1. Hoàn thành test ở Sandbox

Đảm bảo:
- ✅ Tạo payment thành công
- ✅ Webhook nhận được và xử lý đúng
- ✅ Pledge status cập nhật thành SUCCESS
- ✅ Campaign amount tăng đúng

### 5.2. Chuyển sang Production

1. Vào SePay dashboard → Chọn **Chuyển sang Production**

2. Liên kết tài khoản ngân hàng thật

3. Nhận `MERCHANT ID` và `SECRET KEY` mới

4. Cập nhật `.env`:
```env
SEPAY_MERCHANT_ID="SP-PROD-XXXXXXXX"
SEPAY_SECRET_KEY="spsk_live_xxxxxxxxxxxx"
SEPAY_ENV="production"
```

5. Cập nhật IPN URL thành production:
```
https://yourdomain.com/api/payment/sepay/webhook
```

6. Deploy lên production

7. Test lại với số tiền nhỏ (VD: 10,000 VNĐ)

## Troubleshooting

### Lỗi: "SePay credentials not configured"

**Nguyên nhân:** Thiếu biến môi trường

**Giải pháp:**
```bash
# Kiểm tra file .env
cat .env | grep SEPAY

# Đảm bảo có đủ 3 biến:
SEPAY_MERCHANT_ID="..."
SEPAY_SECRET_KEY="..."
SEPAY_ENV="sandbox"
```

### Lỗi: "Invalid signature"

**Nguyên nhân:** Secret key không đúng hoặc format signature sai

**Giải pháp:**
1. Kiểm tra `SEPAY_SECRET_KEY` trong `.env`
2. Đảm bảo copy đúng từ dashboard (không có khoảng trắng)
3. Restart dev server sau khi thay đổi `.env`

### Webhook không được gọi

**Nguyên nhân:** IPN URL không accessible từ internet

**Giải pháp:**
1. Dùng ngrok cho local development
2. Kiểm tra firewall/security group cho production
3. Đảm bảo endpoint trả về status 200

### Pledge vẫn PENDING sau khi thanh toán

**Nguyên nhân:** Webhook không xử lý được hoặc có lỗi

**Giải pháp:**
1. Kiểm tra logs: `[SEPAY WEBHOOK]`
2. Kiểm tra signature verification
3. Kiểm tra format của `order_invoice_number`
4. Test webhook manually:
```bash
curl -X POST http://localhost:3000/api/payment/sepay/webhook \
  -H "Content-Type: application/json" \
  -d @test-webhook-payload.json
```

## Checklist hoàn chỉnh

### Development
- [ ] Đăng ký tài khoản SePay
- [ ] Lấy Sandbox credentials
- [ ] Cấu hình `.env`
- [ ] Setup ngrok
- [ ] Cấu hình IPN URL
- [ ] Chạy test script thành công
- [ ] Test thanh toán qua UI
- [ ] Webhook nhận được và xử lý đúng
- [ ] Pledge status cập nhật SUCCESS

### Production
- [ ] Liên kết tài khoản ngân hàng
- [ ] Lấy Production credentials
- [ ] Cập nhật `.env` production
- [ ] Cập nhật IPN URL production
- [ ] Deploy code
- [ ] Test với số tiền nhỏ
- [ ] Monitor logs 24h đầu
- [ ] Backup database trước khi go live

## Liên hệ hỗ trợ

- **Documentation:** https://docs.sepay.vn
- **Dashboard:** https://my.sepay.vn
- **Support:** https://sepay.vn/support
- **Email:** support@sepay.vn

## Tài liệu liên quan

- [Chi tiết tích hợp](./SEPAY_INTEGRATION.md)
- [API Reference](https://docs.sepay.vn/api-reference)
- [Webhook Guide](https://docs.sepay.vn/webhooks)
