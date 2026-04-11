# HƯỚNG DẪN CẤU HÌNH WEBHOOK CHI TIẾT

## 📋 Chuẩn bị trước khi cấu hình

### 1. Đảm bảo website đã deploy
```
❌ KHÔNG thể dùng localhost
✅ Phải có domain công khai: https://your-domain.com
✅ Hoặc dùng ngrok cho development
```

### 2. Lấy Webhook URLs
```
VNPay:  https://your-domain.com/api/payment/vnpay/webhook
MoMo:   https://your-domain.com/api/payment/momo/webhook
PayOS:  https://your-domain.com/api/payment/payos/webhook
SePay:  https://your-domain.com/api/payment/sepay/webhook
```

### 3. Đảm bảo có tài khoản merchant
- VNPay: Đăng ký tại https://sandbox.vnpayment.vn (sandbox) hoặc https://vnpay.vn (production)
- MoMo: Đăng ký tại https://business.momo.vn
- PayOS: Đăng ký tại https://payos.vn
- SePay: Đăng ký tại https://sepay.vn

---

## 1️⃣ CẤU HÌNH VNPAY WEBHOOK

### Bước 1: Đăng nhập VNPay Merchant Portal
1. Truy cập: https://sandbox.vnpayment.vn/merchantv2 (sandbox)
2. Hoặc: https://merchant.vnpay.vn (production)
3. Đăng nhập bằng tài khoản merchant

### Bước 2: Vào phần cấu hình IPN
```
Dashboard → Cấu hình → IPN URL
```

**Giao diện sẽ có:**
```
┌─────────────────────────────────────────┐
│  Cấu hình IPN (Instant Payment Notify) │
├─────────────────────────────────────────┤
│                                         │
│  IPN URL: [____________________________]│
│           https://your-domain.com/api/  │
│           payment/vnpay/webhook         │
│                                         │
│  Method:  ○ GET  ● POST                │
│           (Chọn GET)                    │
│                                         │
│  [Kiểm tra kết nối]  [Lưu cấu hình]   │
└─────────────────────────────────────────┘
```

### Bước 3: Nhập thông tin
- **IPN URL**: `https://your-domain.com/api/payment/vnpay/webhook`
- **Method**: Chọn `GET`
- Click "Kiểm tra kết nối" để test
- Click "Lưu cấu hình"

### Bước 4: Test webhook
VNPay sẽ gửi request test:
```
GET https://your-domain.com/api/payment/vnpay/webhook?vnp_TxnRef=TEST&vnp_ResponseCode=00&...
```

Nếu response OK → Cấu hình thành công ✅

### Lưu ý VNPay:
- ⚠️ VNPay dùng GET method (khác các gateway khác)
- ⚠️ Signature dùng HMAC SHA512
- ⚠️ Response phải có format: `{"RspCode":"00","Message":"Success"}`

---

## 2️⃣ CẤU HÌNH MOMO WEBHOOK

### Bước 1: Đăng nhập MoMo Business Portal
1. Truy cập: https://business.momo.vn
2. Đăng nhập bằng tài khoản doanh nghiệp

### Bước 2: Vào phần cấu hình IPN
```
Trang chủ → Cài đặt → Cấu hình kỹ thuật → IPN URL
```

**Giao diện:**
```
┌─────────────────────────────────────────┐
│  Cấu hình IPN URL                       │
├─────────────────────────────────────────┤
│                                         │
│  IPN URL: [____________________________]│
│           https://your-domain.com/api/  │
│           payment/momo/webhook          │
│                                         │
│  ☑ Nhận thông báo khi thanh toán       │
│     thành công                          │
│  ☑ Nhận thông báo khi thanh toán       │
│     thất bại                            │
│                                         │
│  [Test IPN]  [Lưu cấu hình]            │
└─────────────────────────────────────────┘
```

### Bước 3: Nhập thông tin
- **IPN URL**: `https://your-domain.com/api/payment/momo/webhook`
- Tick cả 2 checkbox (success & failed)
- Click "Test IPN" để test
- Click "Lưu cấu hình"

### Bước 4: Lấy thông tin xác thực
Trong cùng trang, copy:
- **Partner Code**: `MOMO...`
- **Access Key**: `F8BBA842ECF8...`
- **Secret Key**: `K951B6PE1waDMi64...`

Paste vào file `.env`:
```env
MOMO_PARTNER_CODE="MOMO..."
MOMO_ACCESS_KEY="F8BBA842ECF8..."
MOMO_SECRET_KEY="K951B6PE1waDMi64..."
```

### Lưu ý MoMo:
- ⚠️ MoMo dùng POST method
- ⚠️ Signature dùng HMAC SHA256
- ⚠️ Response phải có format: `{"resultCode":0,"message":"Success"}`
- ⚠️ orderId phải format: `MOMO-{pledgeId}`

---

## 3️⃣ CẤU HÌNH PAYOS WEBHOOK

### Bước 1: Đăng nhập PayOS Dashboard
1. Truy cập: https://my.payos.vn
2. Đăng nhập bằng tài khoản merchant

### Bước 2: Vào phần Webhook Settings
```
Dashboard → Cài đặt → Webhook
```

**Giao diện:**
```
┌─────────────────────────────────────────┐
│  Cấu hình Webhook                       │
├─────────────────────────────────────────┤
│                                         │
│  Webhook URL:                           │
│  [____________________________________] │
│  https://your-domain.com/api/payment/   │
│  payos/webhook                          │
│                                         │
│  Events:                                │
│  ☑ payment.success                      │
│  ☑ payment.failed                       │
│  ☐ payment.pending                      │
│  ☐ payment.cancelled                    │
│                                         │
│  Webhook Secret (tự động tạo):          │
│  [wh_secret_abc123xyz...]               │
│                                         │
│  [Test Webhook]  [Lưu]                  │
└─────────────────────────────────────────┘
```

### Bước 3: Nhập thông tin
- **Webhook URL**: `https://your-domain.com/api/payment/payos/webhook`
- Tick: `payment.success` và `payment.failed`
- Copy **Webhook Secret** (nếu có)
- Click "Test Webhook"
- Click "Lưu"

### Bước 4: Lấy API credentials
Vào phần "API Keys":
- **Client ID**: `abc123...`
- **API Key**: `xyz789...`
- **Checksum Key**: `check123...`

Paste vào `.env`:
```env
PAYOS_CLIENT_ID="abc123..."
PAYOS_API_KEY="xyz789..."
PAYOS_CHECKSUM_KEY="check123..."
```

### Lưu ý PayOS:
- ⚠️ PayOS dùng POST method
- ⚠️ Signature header: `x-payos-signature` (optional)
- ⚠️ Response format: `{"success":true,"message":"..."}`
- ⚠️ orderCode là số, cần map với pledgeId

---

## 4️⃣ CẤU HÌNH SEPAY WEBHOOK

### Bước 1: Đăng nhập SePay Dashboard
1. Truy cập: https://my.sepay.vn
2. Đăng nhập bằng tài khoản

### Bước 2: Vào phần Webhook Configuration
```
Dashboard → Cài đặt → Webhook
```

**Giao diện:**
```
┌─────────────────────────────────────────┐
│  Cấu hình Webhook                       │
├─────────────────────────────────────────┤
│                                         │
│  Webhook URL:                           │
│  [____________________________________] │
│  https://your-domain.com/api/payment/   │
│  sepay/webhook                          │
│                                         │
│  Thông tin tài khoản nhận:              │
│  Số TK:  [0123456789]                   │
│  Ngân hàng: [MB Bank ▼]                │
│  Chủ TK: [NGUYEN VAN A]                │
│                                         │
│  API Key (tự động tạo):                 │
│  [sepay_key_abc123...]                  │
│                                         │
│  [Test Webhook]  [Lưu]                  │
└─────────────────────────────────────────┘
```

### Bước 3: Nhập thông tin
- **Webhook URL**: `https://your-domain.com/api/payment/sepay/webhook`
- **Số tài khoản**: Nhập số TK nhận tiền
- **Ngân hàng**: Chọn ngân hàng
- **Chủ tài khoản**: Nhập tên chủ TK
- Copy **API Key**
- Click "Test Webhook"
- Click "Lưu"

### Bước 4: Cập nhật .env
```env
SEPAY_API_KEY="sepay_key_abc123..."
SEPAY_ACCOUNT_NUMBER="0123456789"
SEPAY_ACCOUNT_NAME="NGUYEN VAN A"
SEPAY_BANK_CODE="MB"
SEPAY_TEMPLATE="compact2"
```

### Lưu ý SePay:
- ⚠️ SePay dùng POST method
- ⚠️ Signature header: `x-sepay-signature`
- ⚠️ Tự động phát hiện chuyển khoản theo nội dung
- ⚠️ Nội dung phải có format: `CFVN {pledgeId} ...`

---

## 🧪 TEST WEBHOOK SAU KHI CẤU HÌNH

### 1. Test bằng Dashboard
Mỗi payment gateway đều có nút "Test Webhook" hoặc "Kiểm tra kết nối"

### 2. Test bằng cURL

**VNPay:**
```bash
curl "https://your-domain.com/api/payment/vnpay/webhook?vnp_TxnRef=test_pledge_id&vnp_ResponseCode=00&vnp_Amount=10000000&vnp_TransactionNo=123456&vnp_SecureHash=test"
```

**MoMo:**
```bash
curl -X POST https://your-domain.com/api/payment/momo/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "partnerCode": "MOMO",
    "orderId": "MOMO-test_pledge_id",
    "amount": 100000,
    "resultCode": 0,
    "message": "Success",
    "transId": "123456",
    "signature": "test"
  }'
```

**PayOS:**
```bash
curl -X POST https://your-domain.com/api/payment/payos/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "orderCode": "test_pledge_id",
    "amount": 100000,
    "code": "00",
    "desc": "Success"
  }'
```

**SePay:**
```bash
curl -X POST https://your-domain.com/api/payment/sepay/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "TXN123",
    "amount": 100000,
    "content": "CFVN test_pledge_id Test payment",
    "status": "SUCCESS"
  }'
```

### 3. Kiểm tra logs
```bash
# Development
npm run dev

# Production
pm2 logs

# Hoặc xem database
SELECT * FROM audit_logs WHERE entityType = 'PLEDGE' ORDER BY createdAt DESC LIMIT 10;
```

---

## 🔧 XỬ LÝ LỖI THƯỜNG GẶP

### Lỗi 1: Webhook không được gọi
**Nguyên nhân:**
- URL không public (localhost)
- Firewall chặn
- SSL certificate không hợp lệ

**Giải pháp:**
```bash
# Dùng ngrok cho development
ngrok http 3000

# Lấy URL: https://abc123.ngrok.io
# Cập nhật webhook URL: https://abc123.ngrok.io/api/payment/vnpay/webhook
```

### Lỗi 2: Signature verification failed
**Nguyên nhân:**
- Secret key sai
- Format signature sai

**Giải pháp:**
```bash
# Kiểm tra .env
cat .env | grep SECRET

# Đảm bảo không có khoảng trắng thừa
VNP_HASH_SECRET="abc123"  # ✅ Đúng
VNP_HASH_SECRET=" abc123" # ❌ Sai (có space)
```

### Lỗi 3: Pledge not found
**Nguyên nhân:**
- pledgeId không đúng format
- Database chưa có pledge

**Giải pháp:**
```bash
# Kiểm tra database
SELECT * FROM pledges WHERE id = 'pledge_id_here';

# Kiểm tra format orderId
# VNPay: vnp_TxnRef = pledgeId
# MoMo: orderId = "MOMO-{pledgeId}"
# PayOS: orderCode = pledgeId hoặc số
```

### Lỗi 4: Amount mismatch
**Nguyên nhân:**
- VNPay gửi amount * 100
- Làm tròn số thập phân

**Giải pháp:**
```typescript
// VNPay
const amount = parseInt(params["vnp_Amount"]) / 100;

// Cho phép sai số 1 VNĐ
if (Math.abs(expectedAmount - receivedAmount) > 1) {
  // error
}
```

---

## 📊 MONITORING WEBHOOKS

### 1. Xem webhook logs
```sql
-- Xem tất cả webhook calls
SELECT * FROM audit_logs 
WHERE action = 'UPDATE' 
  AND entityType = 'PLEDGE'
ORDER BY createdAt DESC;

-- Xem webhook failures
SELECT * FROM audit_logs 
WHERE action = 'UPDATE' 
  AND entityType = 'PLEDGE'
  AND newValue->>'status' = 'FAILED'
ORDER BY createdAt DESC;
```

### 2. Dashboard metrics
Tạo dashboard để theo dõi:
- Số webhook calls/ngày
- Success rate
- Average response time
- Failed webhooks

### 3. Alert system
Cảnh báo khi:
- Webhook fail > 5 lần/giờ
- Response time > 5 giây
- Signature verification fail

---

## 🔐 BẢO MẬT WEBHOOK

### 1. Whitelist IP (Nếu có)
```nginx
# Nginx config
location /api/payment/vnpay/webhook {
    allow 123.456.789.0/24;  # VNPay IP range
    deny all;
}
```

### 2. Rate limiting
```typescript
// Giới hạn 100 requests/phút
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100
});
```

### 3. HTTPS bắt buộc
```typescript
// Middleware
if (request.headers['x-forwarded-proto'] !== 'https') {
  return NextResponse.json(
    { error: 'HTTPS required' },
    { status: 403 }
  );
}
```

---

## ✅ CHECKLIST CẤU HÌNH

### VNPay
- [ ] Đăng ký tài khoản merchant
- [ ] Lấy TMN Code và Hash Secret
- [ ] Cấu hình IPN URL (GET method)
- [ ] Test webhook
- [ ] Cập nhật .env
- [ ] Deploy và test thật

### MoMo
- [ ] Đăng ký tài khoản business
- [ ] Lấy Partner Code, Access Key, Secret Key
- [ ] Cấu hình IPN URL (POST method)
- [ ] Test webhook
- [ ] Cập nhật .env
- [ ] Deploy và test thật

### PayOS
- [ ] Đăng ký tài khoản merchant
- [ ] Lấy Client ID, API Key, Checksum Key
- [ ] Cấu hình Webhook URL (POST method)
- [ ] Chọn events (success, failed)
- [ ] Test webhook
- [ ] Cập nhật .env
- [ ] Deploy và test thật

### SePay
- [ ] Đăng ký tài khoản
- [ ] Cấu hình tài khoản ngân hàng nhận
- [ ] Lấy API Key
- [ ] Cấu hình Webhook URL (POST method)
- [ ] Test webhook
- [ ] Cập nhật .env
- [ ] Deploy và test thật

---

## 🎓 VIDEO HƯỚNG DẪN (Nếu có)

### VNPay
- Link: https://sandbox.vnpayment.vn/apis/docs/huong-dan-tich-hop/
- Video: [Hướng dẫn tích hợp VNPay]

### MoMo
- Link: https://developers.momo.vn
- Video: [Hướng dẫn tích hợp MoMo]

### PayOS
- Link: https://payos.vn/docs
- Video: [Hướng dẫn tích hợp PayOS]

### SePay
- Link: https://sepay.vn/docs
- Video: [Hướng dẫn tích hợp SePay]

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề:
1. Kiểm tra logs: `pm2 logs` hoặc `npm run dev`
2. Kiểm tra database: `SELECT * FROM audit_logs`
3. Test webhook bằng cURL
4. Liên hệ support của payment gateway
5. Tạo issue trên GitHub

---

## 🚀 SAU KHI CẤU HÌNH XONG

1. ✅ Test thanh toán thật
2. ✅ Kiểm tra pledge status tự động update
3. ✅ Kiểm tra campaign amount tự động cộng
4. ✅ Kiểm tra audit logs được tạo
5. ✅ Monitor webhook trong 24h đầu
6. ✅ Setup alert cho webhook failures

Chúc bạn cấu hình thành công! 🎉
