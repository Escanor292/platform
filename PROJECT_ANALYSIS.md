# PHÂN TÍCH LOGIC DỰ ÁN CROWDFUNDING-VN

## 1. TỔNG QUAN DỰ ÁN

**Crowdfunding VN** là nền tảng gọi vốn cộng đồng (crowdfunding) được xây dựng bằng Next.js 15, cho phép người dùng tạo và hỗ trợ các chiến dịch gọi vốn tại Việt Nam.

### Công nghệ sử dụng:
- **Frontend**: Next.js 15, React 19, TailwindCSS, Radix UI
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js v5 (Google OAuth)
- **Payment**: VNPay, MoMo, PayOS
- **Rich Text Editor**: TipTap
- **Upload**: Cloudinary
- **UI Components**: Lucide Icons, Sonner (Toast)

---

## 2. CẤU TRÚC DATABASE (Prisma Schema)

### 2.1. Model User (Người dùng)
```
- id, email, password, name, displayName, avatar, phone
- role: BACKER | CREATOR_PENDING | CREATOR | CREATOR_PRO
- isPro, isOrganization, isAdmin
- bio, idCard, businessLicense
- bankAccount, bankName
- approvedAt, createdAt, updatedAt
```

**Logic**: 
- Người dùng có thể là BACKER (người ủng hộ) hoặc CREATOR (người tạo chiến dịch)
- Hệ thống phân quyền: Admin, Creator Pro, Creator thường
- Lưu thông tin ngân hàng để giải ngân

### 2.2. Model Campaign (Chiến dịch)
```
- id, campaignCode, slug, title, description, longDescription
- videoUrl, imageUrl
- type: REWARD | DONATION
- category, goalAmount, currentAmount
- status: DRAFT | PENDING_REVIEW | ACTIVE | SUCCESS | FAILED | CANCELED
- startDate, endDate
- creatorId, feeRate (8%)
```

**Logic**:
- Chiến dịch có 2 loại: REWARD (có phần thưởng) và DONATION (quyên góp)
- Trạng thái từ DRAFT → PENDING_REVIEW → ACTIVE → SUCCESS/FAILED
- Phí nền tảng mặc định 8%

### 2.3. Model Pledge (Cam kết đóng góp)
```
- id, campaignId, userId, displayName, isAnonymous
- amount, tipAmount, platformFee, vatAmount, totalAmount
- paymentProvider, transactionId
- status: PENDING | SUCCESS | FAILED | REFUNDED
- refundStatus: NO_REFUND | REQUESTED | PROCESSING | COMPLETED | FAILED
```

**Logic**:
- Lưu thông tin đóng góp từ người dùng
- Tính toán: totalAmount = amount + tipAmount + platformFee + vatAmount
- Hỗ trợ hoàn tiền (refund) nếu chiến dịch thất bại

### 2.4. Model Reward (Phần thưởng)
```
- id, campaignId, title, description, amount
- quantity, remaining
```

**Logic**: Các mức phần thưởng cho người ủng hộ (giống Kickstarter)

### 2.5. Model PlatformInvoice (Hóa đơn nền tảng)
```
- invoiceNumber, campaignId, creatorId
- amount, vatAmount, totalAmount
- status: PENDING | PAID | OVERDUE | CANCELLED
- dueDate, paidAt, paymentMethod
```

**Logic**: Hóa đơn thu phí từ creator sau khi chiến dịch thành công

---

## 3. LUỒNG NGHIỆP VỤ CHÍNH

### 3.1. Luồng Đăng ký & Xác thực
```
1. User đăng ký/đăng nhập qua Google OAuth (NextAuth)
2. Mặc định role = BACKER
3. Nếu muốn tạo chiến dịch → nâng cấp lên CREATOR_PENDING
4. Admin duyệt → CREATOR hoặc CREATOR_PRO
```

**File liên quan**:
- `src/auth.config.ts`: Cấu hình NextAuth
- `src/app/api/auth/[...nextauth]/route.ts`: API xác thực
- `src/app/auth/login/page.tsx`: Trang đăng nhập
- `src/app/auth/register/page.tsx`: Trang đăng ký

### 3.2. Luồng Tạo chiến dịch
```
1. Creator truy cập /campaigns/create
2. Điền thông tin: title, description, goalAmount, category, rewards
3. Upload ảnh/video qua Cloudinary
4. Submit → status = DRAFT
5. Gửi duyệt → status = PENDING_REVIEW
6. Admin duyệt → status = ACTIVE
7. Chiến dịch hiển thị công khai
```

**File liên quan**:
- `src/app/campaigns/create/page.tsx`: Form tạo chiến dịch
- `src/components/campaign/CampaignForm.tsx`: Component form
- `src/app/api/campaigns/route.ts`: API POST tạo chiến dịch
- `src/app/api/upload/route.ts`: API upload file

### 3.3. Luồng Đóng góp (Pledge)
```
1. User xem chiến dịch tại /campaigns/[slug]
2. Chọn mức đóng góp hoặc nhập số tiền tùy chỉnh
3. Chọn phương thức thanh toán: VNPay, MoMo, PayOS
4. Hệ thống tạo Pledge với status = PENDING
5. Redirect đến cổng thanh toán
6. Sau khi thanh toán thành công:
   - Webhook cập nhật Pledge status = SUCCESS
   - Cộng amount vào Campaign.currentAmount
7. Nếu currentAmount >= goalAmount → Campaign status = SUCCESS
```

**File liên quan**:
- `src/app/campaigns/[slug]/page.tsx`: Trang chi tiết chiến dịch
- `src/app/campaigns/[slug]/pledge/page.tsx`: Trang pledge
- `src/components/campaign/PledgeForm.tsx`: Form đóng góp
- `src/app/api/payment/vnpay/create/route.ts`: Tạo thanh toán VNPay
- `src/app/api/payment/momo/create/route.ts`: Tạo thanh toán MoMo
- `src/app/api/payment/payos/create/route.ts`: Tạo thanh toán PayOS
- `src/app/api/payments/webhook.ts`: Xử lý webhook từ payment gateway

### 3.4. Luồng Hoàn tiền (Refund)
```
1. Nếu Campaign status = FAILED hoặc CANCELED
2. Tất cả Pledge với status = SUCCESS được đánh dấu refundStatus = REQUESTED
3. Cron job xử lý hoàn tiền tự động
4. Gọi API payment gateway để refund
5. Cập nhật refundStatus = COMPLETED
```

**File liên quan**:
- `src/app/api/payments/refund.ts`: Logic hoàn tiền
- `src/app/api/cron/cleanup-payments/route.ts`: Cron job dọn dẹp

### 3.5. Luồng Cập nhật trạng thái chiến dịch
```
1. Cron job chạy định kỳ (mỗi giờ/ngày)
2. Kiểm tra các Campaign có endDate < now()
3. Nếu currentAmount >= goalAmount → SUCCESS
4. Nếu currentAmount < goalAmount → FAILED
5. Trigger refund nếu FAILED
```

**File liên quan**:
- `src/app/api/cron/update-campaign-status/route.ts`: Cron job cập nhật

---

## 4. CẤU TRÚC API ROUTES

### 4.1. Authentication API
```
POST /api/auth/[...nextauth] - NextAuth callback
```

### 4.2. Campaign API
```
GET    /api/campaigns              - Lấy danh sách chiến dịch
POST   /api/campaigns              - Tạo chiến dịch mới
GET    /api/campaigns/[slug]       - Chi tiết chiến dịch
PUT    /api/campaigns/[slug]       - Cập nhật chiến dịch
DELETE /api/campaigns/[slug]       - Xóa chiến dịch
POST   /api/campaigns/[slug]/cancel - Hủy chiến dịch
GET    /api/campaigns/slug/updates - Lấy updates
POST   /api/campaigns/slug/updates - Tạo update mới
GET    /api/campaigns/[slug]/reviews - Lấy đánh giá
POST   /api/campaigns/[slug]/reviews - Tạo đánh giá
```

### 4.3. Payment API
```
POST /api/payment/vnpay/create  - Tạo thanh toán VNPay
POST /api/payment/momo/create   - Tạo thanh toán MoMo
POST /api/payment/payos/create  - Tạo thanh toán PayOS
POST /api/payments/webhook      - Webhook từ payment gateway
POST /api/payments/refund       - Hoàn tiền
```

### 4.4. Transaction API
```
GET /api/transactions/[txId] - Tra cứu giao dịch
```

### 4.5. User API
```
GET  /api/users - Lấy danh sách users (Admin)
POST /api/users - Tạo user mới
```

### 4.6. Upload API
```
POST /api/upload - Upload file lên Cloudinary
```

### 4.7. Lookup API
```
GET /api/lookup - Tra cứu thông tin (campaign, transaction)
```

### 4.8. Cron Jobs
```
GET /api/cron/cleanup-payments       - Dọn dẹp payments cũ
GET /api/cron/update-campaign-status - Cập nhật trạng thái chiến dịch
```

---

## 5. CẤU TRÚC PAGES & ROUTING

### 5.1. Public Pages
```
/                          - Trang chủ (hiển thị featured campaigns)
/campaigns                 - Danh sách tất cả chiến dịch
/campaigns/[slug]          - Chi tiết chiến dịch
/campaigns/[slug]/pledge   - Trang đóng góp
/lookup                    - Tra cứu giao dịch
/policy/refund             - Chính sách hoàn tiền
/about                     - Giới thiệu
```

### 5.2. Auth Pages
```
/auth/login    - Đăng nhập
/auth/register - Đăng ký
```

### 5.3. Protected Pages (Cần đăng nhập)
```
/dashboard              - Dashboard chung (redirect theo role)
/dashboard/backer       - Dashboard người ủng hộ
/dashboard/creator      - Dashboard người tạo chiến dịch
/dashboard/admin        - Dashboard admin
/dashboard/admin/revenue - Báo cáo doanh thu
/campaigns/create       - Tạo chiến dịch mới
/payment-success        - Trang thành công sau thanh toán
```

---

## 6. COMPONENTS CHÍNH

### 6.1. Layout Components
```
- Navbar: Header với menu, auth buttons
- Footer: Footer với links
- Providers: Wrap SessionProvider, QueryClient
```

### 6.2. Campaign Components
```
- CampaignCard: Card hiển thị chiến dịch
- CampaignForm: Form tạo/sửa chiến dịch
- PledgeForm: Form đóng góp
- ProgressBar: Thanh tiến độ
- RewardTier: Hiển thị mức phần thưởng
- UpdateSection: Phần cập nhật chiến dịch
- CommentSection: Phần bình luận
- RefundPolicyModal: Modal chính sách hoàn tiền
```

### 6.3. Shared Components
```
- ImageUpload: Upload ảnh
- Button, Input, Card, Dialog, DropdownMenu (Radix UI)
```

---

## 7. TÍNH NĂNG ĐẶC BIỆT

### 7.1. Rich Text Editor (TipTap)
- Hỗ trợ format text, link, image, video YouTube
- Character count, placeholder
- Highlight, underline, text align

### 7.2. Payment Integration
- Tích hợp 3 cổng thanh toán: VNPay, MoMo, PayOS
- Xử lý webhook để cập nhật trạng thái tự động
- Hỗ trợ hoàn tiền tự động

### 7.3. Image Upload
- Upload lên Cloudinary
- Tự động resize và optimize

### 7.4. Cron Jobs
- Tự động cập nhật trạng thái chiến dịch khi hết hạn
- Dọn dẹp payments cũ

### 7.5. Search & Lookup
- Tra cứu giao dịch bằng transaction ID
- Tìm kiếm chiến dịch

---

## 8. BẢO MẬT & PHÂN QUYỀN

### 8.1. Authentication
- Sử dụng NextAuth.js với Google OAuth
- Session-based authentication
- Middleware kiểm tra auth cho protected routes

### 8.2. Authorization
- Role-based access control (RBAC)
- BACKER: Chỉ xem và đóng góp
- CREATOR: Tạo và quản lý chiến dịch của mình
- ADMIN: Quản lý toàn bộ hệ thống

### 8.3. API Security
- Kiểm tra session trước khi xử lý request
- Validate input với Zod
- CSRF protection với NextAuth

---

## 9. LUỒNG TIỀN & PHÍ

### 9.1. Cấu trúc phí
```
Pledge Amount:        100,000 VND
Tip (optional):        10,000 VND
Platform Fee (8%):      8,000 VND
VAT (10%):                800 VND
-----------------------------------
Total:                118,800 VND
```

### 9.2. Giải ngân
```
1. Campaign SUCCESS → Tạo PlatformInvoice cho Creator
2. Creator thanh toán phí nền tảng
3. Hệ thống giải ngân số tiền còn lại về tài khoản Creator
```

---

## 10. WORKFLOW TỔNG THỂ

```
┌─────────────┐
│   VISITOR   │
└──────┬──────┘
       │
       ├─→ Browse Campaigns (/campaigns)
       ├─→ View Campaign Detail (/campaigns/[slug])
       └─→ Login/Register (/auth/login)
              │
              ▼
       ┌─────────────┐
       │    USER     │
       │  (BACKER)   │
       └──────┬──────┘
              │
              ├─→ Pledge to Campaign
              │   └─→ Choose Payment Method
              │       └─→ Complete Payment
              │           └─→ Receive Confirmation
              │
              └─→ Upgrade to CREATOR
                     │
                     ▼
              ┌─────────────┐
              │   CREATOR   │
              └──────┬──────┘
                     │
                     ├─→ Create Campaign (DRAFT)
                     ├─→ Submit for Review (PENDING_REVIEW)
                     │   └─→ Admin Approve → ACTIVE
                     │
                     ├─→ Manage Campaign
                     │   ├─→ Post Updates
                     │   ├─→ Reply Comments
                     │   └─→ Cancel Campaign
                     │
                     └─→ Campaign Ends
                         ├─→ SUCCESS → Receive Funds
                         └─→ FAILED → Refund Backers
```

---

## 11. KẾT LUẬN

Dự án **Crowdfunding VN** là một nền tảng gọi vốn cộng đồng hoàn chỉnh với:
- ✅ Quản lý user và phân quyền
- ✅ Tạo và quản lý chiến dịch
- ✅ Tích hợp thanh toán đa cổng
- ✅ Hệ thống hoàn tiền tự động
- ✅ Dashboard cho từng role
- ✅ Cron jobs tự động hóa
- ✅ Rich text editor
- ✅ Upload ảnh/video
- ✅ Responsive design với TailwindCSS

Hệ thống được thiết kế theo mô hình "All or Nothing" - chỉ giải ngân khi đạt mục tiêu, đảm bảo công bằng cho cả creator và backer.
