# HƯỚNG DẪN CẤU HÌNH WEBHOOK CHO PAYMENT GATEWAYS

## 📋 Tổng quan

Tất cả payment gateways đã có webhook riêng để xử lý thanh toán tự động:

| Gateway | Webhook URL | Method | Status |
|---------|-------------|--------|--------|
| VNPay | `/api/payment/vnpay/webhook` | GET | ✅ Hoàn chỉnh |
| MoMo | `/api/payment/momo/webhook` | POST | ✅ Hoàn chỉnh |
| PayOS | `/api/payment/payos/webhook` | POST | ✅ Hoàn chỉnh |
| SePay | `/api/payment/sepay/webhook` | POST | ✅ Hoàn chỉnh |

---

## 🔧 CẤU HÌNH WEBHOOK

### 1. VNPay IPN (Instant Payment Notification)

**Đăng nhập VNPay Merchant Portal:**
1. Vào phần "Cấu hình IPN"
2. Nhập URL: `https://your-domain.com/api/payment/vnpay/webhook`
3. Method: `GET`
4. Lưu cấu hình

**Cách hoạt động:**
- VNPay gọi webhook sau khi user thanh toán
- Gửi kèm signature để verify
- Response code `00` = thành công

**Test webhook:**
```bash
curl "https://your-domain.com/api/payment/vnpay/webhook?vnp_TxnRef=pledge_id&vnp_ResponseCode=00&vnp_Amount=10000000&vnp_TransactionNo=123456&vnp_SecureHash=..."
```

---

### 2. MoMo IPN

**Đăng nhập MoMo Business Portal:**
1. Vào phần "Cấu hình IPN URL"
2. Nhập URL: `https://your-domain.com/api/payment/momo/webhook`
3. Method: `POST`
4. Lưu cấu hình

**Cách hoạt động:**
- MoMo gọi webhook sau khi user thanh toán
- Gửi JSON body với signature
- resultCode `0` = thành công

**Test webhook:**
```bash
curl -X POST https://your-domain.com/api/payment/momo/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "partnerCode": "MOMO",
    "orderId": "MOMO-pledge_id",
    "requestId": "req123",
    "amount": 100000,
    "orderInfo": "Ung ho du an",
    "orderType": "momo_wallet",
    "transId": "123456789",
    "resultCode": 0,
    "message": "Success",
    "payType": "qr",
    "responseTime": "2026-04-11 10:00:00",
    "extraData": "",
    "signature": "..."
  }'
```

---

### 3. PayOS Webhook

**Đăng nhập PayOS Dashboard:**
1. Vào phần "Webhook Settings"
2. Nhập URL: `https://your-domain.com/api/payment/payos/webhook`
3. Method: `POST`
4. Chọn events: `payment.success`, `payment.failed`
5. Lưu cấu hình

**Cách hoạt động:**
- PayOS gọi webhook sau khi thanh toán
- Gửi JSON body với signature (optional)
- code `00` hoặc `000` = thành công

**Test webhook:**
```bash
curl -X POST https://your-domain.com/api/payment/payos/webhook \
  -H "Content-Type: application/json" \
  -H "x-payos-signature: signature_here" \
  -d '{
    "orderCode": 123456,
    "amount": 100000,
    "description": "Ung ho du an",
    "accountNumber": "0123456789",
    "reference": "REF123",
    "transactionDateTime": "2026-04-11T10:00:00Z",
    "code": "00",
    "desc": "Success"
  }'
```

---

### 4. SePay Webhook

**Đăng nhập SePay Dashboard:**
1. Vào phần "Webhook Configuration"
2. Nhập URL: `https://your-domain.com/api/payment/sepay/webhook`
3. Method: `POST`
4. Lưu cấu hình

**Cách hoạt động:**
- SePay tự động phát hiện chuyển khoản
- Gọi webhook với thông tin giao dịch
- Verify bằng signature

**Test webhook:**
```bash
curl -X POST https://your-domain.com/api/payment/sepay/webhook \
  -H "Content-Type: application/json" \
  -H "x-sepay-signature: signature_here" \
  -d '{
    "transaction_id": "TXN123",
    "amount": 100000,
    "content": "CFVN pledge_id Ung ho du an",
    "bank_code": "MB",
    "account_number": "0123456789",
    "transaction_date": "2026-04-11T10:00:00Z",
    "status": "SUCCESS"
  }'
```

---

## 🔐 BẢO MẬT WEBHOOK

### 1. Signature Verification

Tất cả webhooks đều verify signature:

**VNPay:**
```typescript
const hmac = crypto.createHmac("sha512", VNP_HASH_SECRET);
const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
if (vnpSecureHash !== signed) {
  return error;
}
```

**MoMo:**
```typescript
const hmac = crypto.createHmac("sha256", MOMO_SECRET_KEY);
const expectedSignature = hmac.update(rawSignature).digest("hex");
if (signature !== expectedSignature) {
  return error;
}
```

**PayOS:**
```typescript
const hmac = crypto.createHmac("sha256", PAYOS_CHECKSUM_KEY);
const expectedSignature = hmac.update(dataString).digest("hex");
if (signature !== expectedSignature) {
  return error;
}
```

**SePay:**
```typescript
const hmac = crypto.createHmac("sha256", SEPAY_API_KEY);
const expectedSignature = hmac.update(dataString).digest("hex");
if (signature !== expectedSignature) {
  return error;
}
```

### 2. Idempotency (Tránh xử lý trùng)

Tất cả webhooks đều kiểm tra:
```typescript
if (pledge.status === "SUCCESS") {
  return { message: "Already processed" };
}
```

### 3. Amount Validation

Kiểm tra số tiền khớp:
```typescript
if (Math.abs(expectedAmount - receivedAmount) > 1) {
  return { error: "Amount mismatch" };
}
```

---

## 📊 LUỒNG XỬ LÝ WEBHOOK

```
1. Payment Gateway gọi webhook
   ↓
2. Verify signature
   ↓
3. Parse data (pledgeId, amount, status)
   ↓
4. Tìm Pledge trong database
   ↓
5. Kiểm tra đã xử lý chưa (idempotency)
   ↓
6. Validate amount
   ↓
7. Cập nhật Pledge status
   ↓
8. Cộng tiền vào Campaign
   ↓
9. Kiểm tra Campaign đạt mục tiêu
   ↓
10. Tạo Audit Log
   ↓
11. Return success response
```

---

## 🧪 TEST WEBHOOKS

### Test VNPay Webhook
```bash
# Success
curl "http://localhost:3000/api/payment/vnpay/webhook?vnp_TxnRef=pledge_id&vnp_ResponseCode=00&vnp_Amount=10000000&vnp_TransactionNo=123456&vnp_SecureHash=test"

# Failed
curl "http://localhost:3000/api/payment/vnpay/webhook?vnp_TxnRef=pledge_id&vnp_ResponseCode=24&vnp_Amount=10000000&vnp_TransactionNo=123456&vnp_SecureHash=test"
```

### Test MoMo Webhook
```bash
# Success
curl -X POST http://localhost:3000/api/payment/momo/webhook \
  -H "Content-Type: application/json" \
  -d '{"orderId":"MOMO-pledge_id","resultCode":0,"amount":100000,"transId":"123","message":"Success","signature":"test"}'

# Failed
curl -X POST http://localhost:3000/api/payment/momo/webhook \
  -H "Content-Type: application/json" \
  -d '{"orderId":"MOMO-pledge_id","resultCode":1,"amount":100000,"transId":"123","message":"Failed","signature":"test"}'
```

### Test PayOS Webhook
```bash
# Success
curl -X POST http://localhost:3000/api/payment/payos/webhook \
  -H "Content-Type: application/json" \
  -d '{"orderCode":"pledge_id","amount":100000,"code":"00","desc":"Success","reference":"REF123"}'

# Failed
curl -X POST http://localhost:3000/api/payment/payos/webhook \
  -H "Content-Type: application/json" \
  -d '{"orderCode":"pledge_id","amount":100000,"code":"01","desc":"Failed","reference":"REF123"}'
```

### Test SePay Webhook
```bash
# Success
curl -X POST http://localhost:3000/api/payment/sepay/webhook \
  -H "Content-Type: application/json" \
  -d '{"transaction_id":"TXN123","amount":100000,"content":"CFVN pledge_id Test","status":"SUCCESS"}'
```

---

## 📝 LOGS & MONITORING

Tất cả webhooks đều log:
- ✅ Webhook received
- ✅ Signature verification
- ✅ Pledge found/not found
- ✅ Amount validation
- ✅ Payment success/failed
- ✅ Campaign goal reached

Xem logs:
```bash
# Development
npm run dev

# Production
pm2 logs
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

### 1. Môi trường Development
- Webhook URL phải public (dùng ngrok hoặc deploy)
- Không test được trên localhost

### 2. Môi trường Production
- Bắt buộc HTTPS
- Cấu hình firewall cho phép IP của payment gateway
- Monitor webhook failures

### 3. Retry Logic
- Payment gateway sẽ retry nếu webhook fail
- Đảm bảo idempotency để tránh xử lý trùng

### 4. Timeout
- Webhook phải response trong 30 giây
- Nếu quá lâu, payment gateway sẽ retry

---

## 🔄 WEBHOOK FLOW DIAGRAM

```
┌─────────────────┐
│  User thanh toán │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Payment Gateway │
│  (VNPay/MoMo)   │
└────────┬────────┘
         │
         │ Gọi Webhook
         ▼
┌─────────────────┐
│  Your Server    │
│  /api/payment/  │
│  {gateway}/     │
│  webhook        │
└────────┬────────┘
         │
         ├─→ Verify Signature
         ├─→ Find Pledge
         ├─→ Update Status
         ├─→ Update Campaign
         └─→ Create Audit Log
         │
         ▼
┌─────────────────┐
│  Response OK    │
└─────────────────┘
```

---

## ✅ CHECKLIST

- [x] VNPay webhook với signature verification
- [x] MoMo webhook với signature verification
- [x] PayOS webhook với signature verification
- [x] SePay webhook với signature verification
- [x] Idempotency check (tránh xử lý trùng)
- [x] Amount validation
- [x] Audit log tự động
- [x] Campaign goal check
- [x] Error handling & logging

Tất cả payment gateways đã có webhook đầy đủ! 🎉
