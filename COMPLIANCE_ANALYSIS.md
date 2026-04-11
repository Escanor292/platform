# PHÂN TÍCH TUÂN THỦ & CHỐNG GIAN LẬN - CROWDFUNDING VN

## 📊 TỔNG QUAN HIỆN TRẠNG

### ✅ ĐÃ CÓ (Tốt)
1. Lưu trữ giao dịch đầy đủ trong model `Pledge`
2. Hiển thị danh sách người ủng hộ trên trang campaign
3. Dashboard cho Backer, Creator, Admin
4. Hệ thống hóa đơn nền tảng (`PlatformInvoice`)
5. Hóa đơn tip hàng ngày (`DailyTipInvoice`)

### ⚠️ CHƯA ĐẦY ĐỦ (Cần cải thiện)
1. ❌ Thiếu thông tin KYC đầy đủ (số CMND/CCCD, địa chỉ)
2. ❌ Không lưu thông tin thiết bị chi tiết (chỉ có userAgent)
3. ❌ Chưa có trang hiển thị đầy đủ danh sách người ủng hộ
4. ❌ Chưa có API xuất hóa đơn cho khách hàng
5. ❌ Chưa có báo cáo giao dịch theo ngày/tháng/năm
6. ❌ Chưa có audit log (lịch sử thay đổi)

---

## 1. PHÂN TÍCH DỮ LIỆU GIAO DỊCH (Model Pledge)

### ✅ Dữ liệu ĐÃ CÓ:

```prisma
model Pledge {
  id               String       @id @default(cuid())
  campaignId       String       ✅ Liên kết chiến dịch
  userId           String?      ✅ Liên kết user (nếu đăng nhập)
  displayName      String       ✅ Tên hiển thị
  isAnonymous      Boolean      ✅ Ẩn danh hay không
  email            String?      ✅ Email (cho guest)
  phoneNumber      String?      ⚠️ Có field nhưng CHƯA thu thập
  amount           Decimal      ✅ Số tiền ủng hộ
  tipAmount        Decimal      ✅ Tiền tip nền tảng
  platformFee      Decimal      ✅ Phí nền tảng (8%)
  vatAmount        Decimal      ✅ VAT (10% của tip)
  totalAmount      Decimal      ✅ Tổng tiền
  paymentProvider  String       ✅ Cổng thanh toán (VNPAY/MOMO/PAYOS/SEPAY)
  transactionId    String       ✅ Mã giao dịch duy nhất
  ipAddress        String?      ✅ IP address
  deviceInfo       Json?        ⚠️ Có nhưng chỉ lưu userAgent
  status           PledgeStatus ✅ Trạng thái (PENDING/SUCCESS/FAILED/REFUNDED)
  refundStatus     RefundStatus ✅ Trạng thái hoàn tiền
  refundedAt       DateTime?    ✅ Thời gian hoàn tiền
  invoiceGroupDate DateTime?    ⚠️ Có nhưng CHƯA sử dụng
  createdAt        DateTime     ✅ Thời gian tạo
  updatedAt        DateTime     ✅ Thời gian cập nhật
}
```

### ❌ Dữ liệu THIẾU để chống gian lận:

1. **Thông tin định danh:**
   - ❌ Số CMND/CCCD/Passport
   - ❌ Địa chỉ thường trú
   - ❌ Ngày sinh
   - ❌ Quốc tịch

2. **Thông tin thiết bị chi tiết:**
   - ❌ Device fingerprint (unique ID)
   - ❌ Browser fingerprint
   - ❌ Screen resolution
   - ❌ Timezone
   - ❌ Language
   - ❌ Operating System version

3. **Thông tin giao dịch ngân hàng:**
   - ❌ Số tài khoản người chuyển
   - ❌ Tên ngân hàng người chuyển
   - ❌ Mã giao dịch ngân hàng (bank transaction ID)
   - ❌ Thời gian thực tế tiền về

4. **Audit trail:**
   - ❌ Lịch sử thay đổi trạng thái
   - ❌ Người thực hiện thay đổi
   - ❌ Lý do thay đổi

---

## 2. HIỂN THỊ NGƯỜI ỦNG HỘ

### ✅ ĐÃ CÓ:

#### Trang Campaign Detail (`/campaigns/[slug]`)
```typescript
pledges: {
  where: { status: "SUCCESS" },
  orderBy: { createdAt: "desc" },
  take: 5,  // ⚠️ CHỈ HIỂN THỊ 5 NGƯỜI
  include: { user: { select: { name: true, avatar: true } } }
}
```

**Vấn đề:**
- ❌ Chỉ hiển thị 5 người ủng hộ gần nhất
- ❌ KHÔNG có trang xem đầy đủ danh sách
- ❌ KHÔNG có pagination
- ❌ KHÔNG có filter/search

#### Dashboard Backer (`/dashboard/backer`)
- ✅ Hiển thị danh sách dự án đã ủng hộ
- ✅ Tổng số tiền đã ủng hộ
- ⚠️ Chưa có lịch sử giao dịch chi tiết

#### Dashboard Creator (`/dashboard/creator`)
- ✅ Hiển thị tổng số backers
- ❌ KHÔNG hiển thị danh sách chi tiết từng người

#### Dashboard Admin (`/dashboard/admin/revenue`)
- ✅ Hiển thị tất cả pledges
- ✅ Có thông tin đầy đủ: user, campaign, amount, status
- ⚠️ Chưa có export Excel/CSV

### ❌ THIẾU:

1. **Trang danh sách người ủng hộ đầy đủ:**
   - `/campaigns/[slug]/backers` - Xem tất cả người ủng hộ
   - Pagination
   - Filter theo: amount, date, anonymous
   - Search theo tên

2. **Thống kê người ủng hộ:**
   - Top backers (người ủng hộ nhiều nhất)
   - Recent backers (người ủng hộ gần đây)
   - Biểu đồ theo thời gian

---

## 3. HÓA ĐƠN & BÁO CÁO

### ✅ ĐÃ CÓ:

#### Model PlatformInvoice (Hóa đơn cho Creator)
```prisma
model PlatformInvoice {
  id            String        @id
  invoiceNumber String        @unique  ✅ Số hóa đơn
  campaignId    String        ✅ Chiến dịch
  creatorId     String        ✅ Creator
  amount        Decimal       ✅ Số tiền
  vatAmount     Decimal       ✅ VAT
  totalAmount   Decimal       ✅ Tổng
  status        InvoiceStatus ✅ Trạng thái
  dueDate       DateTime      ✅ Hạn thanh toán
  paidAt        DateTime?     ✅ Thời gian thanh toán
  paymentMethod String?       ✅ Phương thức
  createdAt     DateTime
  updatedAt     DateTime
}
```

#### Model DailyTipInvoice (Hóa đơn tip hàng ngày)
```prisma
model DailyTipInvoice {
  id          String   @id
  invoiceDate DateTime @unique  ✅ Ngày
  totalTip    Decimal  ✅ Tổng tip
  totalVat    Decimal  ✅ Tổng VAT
  status      String   ✅ Trạng thái
  createdAt   DateTime
}
```

### ❌ THIẾU:

#### 1. Hóa đơn cho Backer (Người ủng hộ)
```
❌ KHÔNG CÓ model BackerInvoice
❌ KHÔNG CÓ API xuất hóa đơn cho backer
❌ KHÔNG CÓ template hóa đơn PDF
```

**Cần có:**
- Model `BackerInvoice` liên kết với `Pledge`
- API `/api/invoices/backer/[pledgeId]` - Xuất hóa đơn
- Template PDF theo chuẩn Việt Nam
- Thông tin:
  - Tên người ủng hộ
  - Số tiền
  - Phí + VAT
  - Mã giao dịch
  - Thời gian
  - Thông tin công ty (nếu yêu cầu)

#### 2. Báo cáo giao dịch
```
❌ KHÔNG CÓ báo cáo theo ngày/tháng/năm
❌ KHÔNG CÓ export Excel/CSV
❌ KHÔNG CÓ báo cáo thuế
```

**Cần có:**
- `/api/reports/transactions` - Báo cáo giao dịch
  - Filter: date range, payment method, status
  - Export: Excel, CSV, PDF
- `/api/reports/revenue` - Báo cáo doanh thu
  - Theo ngày/tháng/quý/năm
  - Biểu đồ
- `/api/reports/tax` - Báo cáo thuế
  - Tổng VAT thu được
  - Tổng phí nền tảng
  - Theo tháng/quý

#### 3. Hóa đơn VAT đầu ra
```
❌ KHÔNG CÓ hóa đơn VAT cho cơ quan thuế
❌ KHÔNG CÓ tích hợp hóa đơn điện tử
```

---

## 4. CHỐNG RỬA TIỀN & GIAN LẬN

### ✅ ĐÃ CÓ (Cơ bản):

1. **Lưu IP Address** ✅
2. **Lưu Device Info** ⚠️ (chỉ userAgent)
3. **Transaction ID duy nhất** ✅
4. **Trạng thái giao dịch** ✅
5. **Refund tracking** ✅

### ❌ THIẾU (Quan trọng):

#### 1. KYC (Know Your Customer)
```
❌ Không yêu cầu CMND/CCCD
❌ Không xác minh danh tính
❌ Không giới hạn số tiền cho tài khoản chưa KYC
```

**Theo quy định pháp luật VN:**
- Giao dịch > 20 triệu VNĐ: BẮT BUỘC xác minh danh tính
- Giao dịch > 100 triệu VNĐ: BẮT BUỘC CMND/CCCD + địa chỉ

#### 2. AML (Anti-Money Laundering)
```
❌ Không có hệ thống phát hiện giao dịch bất thường
❌ Không có giới hạn số tiền/ngày
❌ Không có cảnh báo giao dịch đáng ngờ
```

**Cần có:**
- Giới hạn giao dịch:
  - Tài khoản chưa KYC: Max 20 triệu/giao dịch
  - Tài khoản đã KYC: Max 500 triệu/giao dịch
  - Max 5 giao dịch/ngày
- Phát hiện pattern đáng ngờ:
  - Nhiều giao dịch nhỏ liên tiếp (structuring)
  - Giao dịch từ cùng IP/device
  - Giao dịch round-trip (ủng hộ rồi rút lại)

#### 3. Fraud Detection
```
❌ Không có device fingerprinting
❌ Không có velocity check (số lần giao dịch/thời gian)
❌ Không có blacklist IP/email/phone
```

**Cần có:**
- Device fingerprinting (FingerprintJS)
- Velocity rules:
  - Max 3 giao dịch/giờ từ cùng IP
  - Max 5 giao dịch/ngày từ cùng device
- Blacklist:
  - IP đáng ngờ
  - Email/phone đã gian lận
  - Số tài khoản ngân hàng đen

#### 4. Audit Log
```
❌ Không có lịch sử thay đổi
❌ Không biết ai đã sửa gì, khi nào
```

**Cần có:**
```prisma
model AuditLog {
  id          String   @id
  userId      String?  // Người thực hiện
  action      String   // CREATE, UPDATE, DELETE, REFUND
  entityType  String   // PLEDGE, CAMPAIGN, USER
  entityId    String   // ID của entity
  oldValue    Json?    // Giá trị cũ
  newValue    Json?    // Giá trị mới
  ipAddress   String
  userAgent   String
  createdAt   DateTime
}
```

---

## 5. ĐÁNH GIÁ TUÂN THỦ PHÁP LUẬT VIỆT NAM

### Luật Phòng chống rửa tiền (Nghị định 116/2013/NĐ-CP)

| Yêu cầu | Hiện trạng | Đánh giá |
|---------|-----------|----------|
| Xác minh danh tính khách hàng | ❌ Không có | KHÔNG ĐẠT |
| Lưu trữ hồ sơ giao dịch tối thiểu 5 năm | ✅ Có (PostgreSQL) | ĐẠT |
| Báo cáo giao dịch đáng ngờ | ❌ Không có | KHÔNG ĐẠT |
| Giới hạn giao dịch tiền mặt | ⚠️ Không áp dụng (online) | N/A |

### Luật Thuế GTGT (Luật số 71/2014/QH13)

| Yêu cầu | Hiện trạng | Đánh giá |
|---------|-----------|----------|
| Xuất hóa đơn VAT | ⚠️ Có model nhưng chưa implement | CHƯA ĐẠT |
| Kê khai thuế hàng tháng | ❌ Không có báo cáo | KHÔNG ĐẠT |
| Lưu trữ hóa đơn 10 năm | ✅ Có database | ĐẠT |

### Luật Bảo vệ người tiêu dùng (Luật số 59/2010/QH12)

| Yêu cầu | Hiện trạng | Đánh giá |
|---------|-----------|----------|
| Cung cấp hóa đơn cho khách hàng | ❌ Không có | KHÔNG ĐẠT |
| Minh bạch thông tin giao dịch | ✅ Có | ĐẠT |
| Bảo vệ thông tin cá nhân | ⚠️ Cơ bản | CHƯA ĐẠT |

---

## 6. KHUYẾN NGHỊ HÀNH ĐỘNG

### 🔴 KHẨN CẤP (Phải làm ngay)

1. **Thêm KYC cho giao dịch lớn**
   - Yêu cầu CMND/CCCD cho giao dịch > 20 triệu
   - Xác minh số điện thoại (OTP)
   - Lưu ảnh CMND/CCCD

2. **Tạo API xuất hóa đơn cho Backer**
   - Template PDF chuẩn
   - Gửi email tự động
   - Lưu trữ trong database

3. **Thêm Audit Log**
   - Log mọi thay đổi quan trọng
   - Lưu IP, user, timestamp

### 🟡 QUAN TRỌNG (Làm trong 1-2 tháng)

4. **Trang danh sách người ủng hộ đầy đủ**
   - `/campaigns/[slug]/backers`
   - Pagination, filter, search

5. **Báo cáo giao dịch**
   - Theo ngày/tháng/năm
   - Export Excel/CSV

6. **Fraud Detection cơ bản**
   - Giới hạn số lần giao dịch
   - Blacklist IP/email

### 🟢 NÊN CÓ (Làm khi có thời gian)

7. **Device Fingerprinting**
   - Tích hợp FingerprintJS
   - Phát hiện multi-accounting

8. **Hóa đơn điện tử**
   - Tích hợp với nhà cung cấp (VNPT, Viettel, FPT)
   - Tuân thủ Nghị định 123/2020/NĐ-CP

9. **Dashboard Analytics nâng cao**
   - Biểu đồ giao dịch
   - Phát hiện anomaly
   - Machine learning fraud detection

---

## 7. TỔNG KẾT

### Điểm mạnh ✅
- Có cấu trúc database tốt
- Lưu trữ giao dịch đầy đủ
- Có hệ thống hóa đơn nền tảng
- Có refund tracking

### Điểm yếu ❌
- Thiếu KYC/AML
- Không có hóa đơn cho backer
- Không có audit log
- Không có fraud detection
- Chưa tuân thủ đầy đủ pháp luật VN

### Mức độ rủi ro: 🔴 CAO

**Lý do:**
- Có thể bị lợi dụng để rửa tiền
- Không tuân thủ luật thuế
- Không bảo vệ người tiêu dùng đầy đủ
- Có thể bị phạt nếu thanh tra

### Khuyến nghị: 
**CẦN BỔ SUNG NGAY** các tính năng KYC, hóa đơn, và audit log trước khi vận hành chính thức.
