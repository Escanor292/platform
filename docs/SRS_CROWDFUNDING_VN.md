# ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS)
## Hệ Thống Crowdfunding Việt Nam

**Phiên bản:** 1.0  
**Ngày:** 17/08/2026  
**Chuẩn:** IEEE 830  
**Ngôn ngữ:** Tiếng Việt

---

## KIỂM TRA PHỦ SÓNG CHỨC NĂNG NGUỒN

### A. Người dùng & phân quyền
- ✅ 4 vai trò: ADMIN, BACKER, CREATOR_PENDING, CREATOR
- ✅ Đăng ký, đăng nhập, quên mật khẩu qua NextAuth.js 5 (JWT & Session); middleware bảo vệ route theo vai trò
- ✅ Nâng cấp tài khoản: BACKER → CREATOR_PENDING → CREATOR; trang /upgrade
- ✅ Hồ sơ cá nhân: xem/sửa profile, tab dự án đã tạo, dự án đã ủng hộ
- ✅ Tìm kiếm người dùng (api/users/search), xem chi tiết user

### B. Chiến dịch gọi vốn (Campaigns)
- ✅ 2 loại chiến dịch: REWARD (có phần thưởng) và DONATION (ủng hộ tùy tâm)
- ✅ 6 trạng thái: DRAFT → PENDING_REVIEW → ACTIVE → SUCCESS/FAILED/CANCELED
- ✅ Tạo chiến dịch qua form nhiều bước: thông tin, mục tiêu tài chính, thời hạn, gói rewards, tài liệu pháp lý; slug URL riêng
- ✅ Admin duyệt chiến dịch trước khi công khai; kiểm duyệt qua api/admin
- ✅ Cập nhật tiến độ dạng blog/update (campaign_updates); liên kết campaign ↔ blog (campaign_blog_links)
- ✅ Theo dõi chiến dịch (campaign_followers); báo cáo chiến dịch vi phạm (campaign_reports, có enum lý do)
- ✅ Danh mục/phân loại (taxonomy), tìm kiếm theo category

### C. Thanh toán & ủng hộ
- ✅ Pledge với 4 trạng thái: PENDING, SUCCESS, FAILED, REFUNDED
- ✅ 4 cổng thanh toán có thật: PayOS (VietQR), SePay (QR Banking), MoMo, VNPay
- ✅ Webhook xác nhận tiền về + xác minh chữ ký (checksum/signature); đếm ngược thời gian thanh toán
- ✅ Escrow (giữ tiền) và hoàn tiền (refund) có module riêng
- ✅ Giới hạn giao dịch (transaction_limits), kiểm tra blacklist (blacklist, enum BlacklistType), cron tự dọn giao dịch thừa hạn (cron/cleanup-payments)
- ✅ Cron tự cập nhật trạng thái chiến dịch hết hạn (cron/update-campaign-status)
- ✅ Hóa đơn: biên nhận backer (backer_invoices), hóa đơn nền tảng (platform_invoices), hóa đơn "tip" hàng ngày (daily_tip_invoices); tool tạo hóa đơn tự động
- ✅ Trang payment-success, tra cứu giao dịch (api/lookup, api/transactions)

### D. KYC (xác minh danh tính Creator)
- ✅ Nộp hồ sơ: CMND/CCCD/CCCD gắn chip (enum IDCardType), giấy phép kinh doanh
- ✅ 4 trạng thái: PENDING, VERIFIED, REJECTED, EXPIRED

### E. Phần thưởng (Rewards)
- ✅ CRUD nhiều mức ủng hộ gắn với chiến dịch

### F. Blog & tin tức
- ✅ Bài viết có trạng thái, phân loại, tag, bình luận (có trạng thái duyệt), like, bookmark, báo cáo bài viết, admin duyệt
- ✅ Tác giả Creator đăng cập nhật dự án

### G. Chat real-time
- ✅ Hội thoại (conversations), tin nhắn (messages), đếm tin chưa đọc — lưu MongoDB

### H. Huy hiệu (Badges)
- ✅ Badge có loại (BadgeType) và độ hiếm (BadgeRarity); gán cho user (user_badges); admin quản lý

### I. Admin dashboard
- ✅ Duyệt chiến dịch/KYC/blog, khóa tài khoản, quản lý user/badge, báo cáo doanh thu/thống kê (api/stats), xét xử báo cáo vi phạm (ReportStatus enum)

### J. Đánh giá (reviews), social links (enum social-platforms), audit log toàn hệ thống (audit_logs + AuditAction enum)
- ✅ Đánh giá (reviews)
- ✅ Social links (enum social-platforms)
- ✅ Audit log toàn hệ thống (audit_logs + AuditAction enum)

### K. Hạ tầng & ràng buộc
- ✅ Next.js 15 App Router + React 19, TypeScript strict 100%, Tailwind CSS
- ✅ PostgreSQL (Prisma) cho dữ liệu quan hệ; MongoDB cho chat/blog/audit
- ✅ Ảnh qua Cloudinary; upload qua api/upload
- ✅ Deploy Vercel; rate limiting; security headers; singleton DB connection
- ✅ Hệ thống kiểm thử: 88 test cases (100% pass) với Jest + React Testing Library, coverage, test report HTML/JSON

---

## 1. GIỚI THIỆU

### 1.1 Mục đích
Tài liệu này đặc tả các yêu cầu chức năng và phi chức năng cho hệ thống Crowdfunding Việt Nam - nền tảng gọi vốn cộng đồng cho các dự án sáng tạo, doanh nghiệp khởi nghiệp, và các hoạt động thiện nguyện tại Việt Nam. Hệ thống cho phép Creator tạo chiến dịch gọi vốn, Backer ủng hộ tài chính, và Admin quản lý toàn bộ quy trình.

### 1.2 Phạm vi
Hệ thống bao gồm:
- Quản lý người dùng với 4 vai trò phân quyền
- Quản lý chiến dịch gọi vốn với 2 loại (REWARD, DONATION) và 6 trạng thái
- Hệ thống thanh toán tích hợp 4 cổng: PayOS, SePay, MoMo, VNPay
- Xác minh danh tính (KYC) cho Creator
- Hệ thống blog và cập nhật chiến dịch
- Chat real-time giữa người dùng
- Hệ thống huy hiệu (badges) gamification
- Dashboard quản trị cho Admin
- Hệ thống hóa đơn tự động
- Audit log toàn hệ thống

**Phạm vi loại trừ:** Không bao gồm đăng nhập mạng xã hội (ngoài Google OAuth), không có AI, không có NFT, không có mobile app native.

### 1.3 Định nghĩa, thuật ngữ, viết tắt

| Thuật ngữ | Định nghĩa |
|-----------|------------|
| **users** | Bảng người dùng trong PostgreSQL, chứa thông tin tài khoản |
| **campaigns** | Bảng chiến dịch gọi vốn trong PostgreSQL |
| **pledges** | Bảng giao dịch ủng hộ trong PostgreSQL |
| **kyc_info** | Bảng thông tin xác minh danh tính trong PostgreSQL |
| **rewards** | Bảng phần thưởng cho các mức ủng hộ trong PostgreSQL |
| **blog_posts** | Bảng bài viết blog trong PostgreSQL |
| **badges** | Bảng huy hiệu trong PostgreSQL |
| **user_badges** | Bảng gán huy hiệu cho người dùng trong PostgreSQL |
| **audit_logs** | Bảng log kiểm tra toàn hệ thống trong PostgreSQL |
| **conversations** | Collection hội thoại chat trong MongoDB |
| **messages** | Collection tin nhắn chat trong MongoDB |
| **ADMIN** | Vai trò quản trị viên toàn hệ thống |
| **BACKER** | Vai trò người ủng hộ (người dùng mặc định) |
| **CREATOR_PENDING** | Vai trò người tạo chiến dịch đang chờ duyệt |
| **CREATOR** | Vai trò người tạo chiến dịch đã được duyệt |
| **REWARD** | Loại chiến dịch có phần thưởng cho backer |
| **DONATION** | Loại chiến dịch ủng hộ tùy tâm, không có phần thưởng |
| **KYC** | Know Your Customer - Xác minh danh tính |
| **Escrow** | Cơ chế giữ tiền trung gian |
| **Webhook** | API callback từ cổng thanh toán |

---

## 2. MÔ TẢ TỔNG QUAN

### 2.1 Quan điểm sản phẩm
Hệ thống là nền tảng web-based cho phép:
- Creator đăng ký, xác minh danh tính, tạo chiến dịch gọi vốn
- Backer duyệt chiến dịch, ủng hộ tài chính qua nhiều cổng thanh toán
- Admin quản lý nội dung, duyệt chiến dịch, xử lý vi phạm
- Tích hợp blog, chat, gamification để tăng tương tác

### 2.2 Actor và chức năng người dùng

| Actor | Chức năng chính |
|-------|-----------------|
| **Khách (Guest)** | Xem chiến dịch công khai, xem blog, tìm kiếm người dùng |
| **BACKER** | Đăng ký/đăng nhập, ủng hộ chiến dịch, theo dõi chiến dịch, chat, xem profile |
| **CREATOR_PENDING** | Nộp hồ sơ KYC, chờ duyệt để trở thành CREATOR |
| **CREATOR** | Tạo chiến dịch, quản lý chiến dịch, đăng cập nhật, nhận tiền, chat với backer |
| **ADMIN** | Duyệt chiến dịch/KYC/blog, khóa tài khoản, quản lý badges, xem thống kê, xử lý báo cáo |

### 2.3 Ràng buộc vận hành
- Hệ thống phải tuân thủ luật pháp Việt Nam về giao dịch điện tử và gọi vốn cộng đồng
- Giới hạn giao dịch theo quy định: 20 triệu/giao dịch cho khách chưa KYC, 500 triệu cho user đã KYC
- Dữ liệu người dùng phải được bảo mật theo luật bảo vệ dữ liệu cá nhân
- Hệ thống phải hoạt động 24/7 với uptime tối thiểu 99.5%

### 2.4 Giả định và phụ thuộc
- Người dùng có kết nối internet ổn định
- Cổng thanh toán (PayOS, SePay, MoMo, VNPay) hoạt động bình thường
- Cloudinary service hoạt động để lưu trữ ảnh
- MongoDB và PostgreSQL database hoạt động ổn định

---

## 3. YÊU CẦU CỤ THỂ

### 3.1 Yêu cầu chức năng (FR)

#### Module A: Người dùng & phân quyền

**FR-A-001: Đăng ký tài khoản**
- **Mô tả:** Người dùng có thể đăng ký tài khoản mới với email và mật khẩu
- **Actor:** Guest
- **Input:** Email, password, name, displayName (tùy chọn)
- **Output:** Tài khoản mới được tạo với vai trò mặc định BACKER
- **Acceptance Criteria:**
  - Email phải là định dạng hợp lệ và chưa tồn tại trong hệ thống
  - Password phải tối thiểu 8 ký tự
  - Tài khoản được tạo với role = BACKER, status = NORMAL
  - Gửi email xác nhận (nếu có cấu hình)

**FR-A-002: Đăng nhập**
- **Mô tả:** Người dùng có thể đăng nhập bằng email/password hoặc Google OAuth
- **Actor:** Guest, BACKER, CREATOR_PENDING, CREATOR, ADMIN
- **Input:** Email + password HOẶC Google OAuth token
- **Output:** Session được tạo, JWT token được trả về
- **Acceptance Criteria:**
  - Hỗ trợ NextAuth.js 5 với cả JWT và Session strategy
  - Google OAuth được cấu hình qua auth.config.ts
  - Session được lưu trữ an toàn
  - Redirect về dashboard sau khi đăng nhập thành công

**FR-A-003: Quên mật khẩu**
- **Mô tả:** Người dùng có thể yêu cầu đặt lại mật khẩu qua email
- **Actor:** BACKER, CREATOR_PENDING, CREATOR, ADMIN
- **Input:** Email
- **Output:** Email chứa link reset mật khẩu được gửi
- **Acceptance Criteria:**
  - Email phải tồn tại trong hệ thống
  - Link reset có hạn sử dụng (ví dụ: 24 giờ)
  - [cần xác nhận với developer] Cơ chế gửi email cụ thể

**FR-A-004: Bảo vệ route theo vai trò**
- **Mô tả:** Middleware bảo vệ các route dựa trên trạng thái đăng nhập và vai trò
- **Actor:** Hệ thống
- **Input:** Request URL và session
- **Output:** Cho phép truy cập hoặc redirect
- **Acceptance Criteria:**
  - Route công khai: /, /campaigns, /lookup, /policy, /gioi-thieu, /blog, /projects, /profile/[id] (view only), /users/search
  - Route API công khai: /api/auth, /api/stats, /api/projects, /api/campaigns, /api/lookup, /api/users/search, /api/blog
  - Route yêu cầu đăng nhập: Dashboard, tạo chiến dịch, chỉnh sửa profile
  - Redirect về /auth/login nếu chưa đăng nhập
  - Redirect về /dashboard nếu đã đăng nhập và truy cập /auth/login hoặc /auth/register

**FR-A-005: Nâng cấp tài khoản BACKER → CREATOR_PENDING**
- **Mô tả:** BACKER có thể yêu cầu nâng cấp lên CREATOR_PENDING để tạo chiến dịch
- **Actor:** BACKER
- **Input:** Yêu cầu nâng cấp qua trang /upgrade
- **Output:** Role được cập nhật thành CREATOR_PENDING
- **Acceptance Criteria:**
  - User phải có role = BACKER
  - Sau khi nâng cấp, role = CREATOR_PENDING
  - Redirect về trang nộp hồ sơ KYC

**FR-A-006: Nâng cấp tài khoản CREATOR_PENDING → CREATOR**
- **Mô tả:** CREATOR_PENDING được nâng cấp thành CREATOR sau khi KYC được duyệt
- **Actor:** ADMIN
- **Input:** User ID, phê duyệt KYC
- **Output:** Role được cập nhật thành CREATOR
- **Acceptance Criteria:**
  - KYC phải có status = VERIFIED
  - Admin có quyền duyệt nâng cấp
  - Gửi thông báo cho user khi nâng cấp thành công

**FR-A-007: Xem hồ sơ cá nhân**
- **Mô tả:** Người dùng có thể xem hồ sơ cá nhân của mình
- **Actor:** BACKER, CREATOR_PENDING, CREATOR, ADMIN
- **Input:** User ID (từ session)
- **Output:** Thông tin profile: name, displayName, avatar, bio, location, website, socialLinks, coverImage
- **Acceptance Criteria:**
  - Hiển thị tab "Dự án đã tạo" cho CREATOR
  - Hiển thị tab "Dự án đã ủng hộ" cho BACKER
  - Hiển thị badges đã được gán

**FR-A-008: Chỉnh sửa hồ sơ cá nhân**
- **Mô tả:** Người dùng có thể cập nhật thông tin profile
- **Actor:** BACKER, CREATOR_PENDING, CREATOR, ADMIN
- **Input:** Các field profile (name, displayName, avatar, bio, location, website, socialLinks, coverImage, shippingAddress)
- **Output:** Profile được cập nhật trong bảng users
- **Acceptance Criteria:**
  - Avatar và coverImage được upload qua Cloudinary
  - socialLinks lưu dưới dạng JSON với enum social-platforms
  - Ghi audit log khi có thay đổi

**FR-A-009: Tìm kiếm người dùng**
- **Mô tả:** Người dùng có thể tìm kiếm user khác theo tên hoặc email
- **Actor:** BACKER, CREATOR_PENDING, CREATOR, ADMIN
- **Input:** Từ khóa tìm kiếm
- **Output:** Danh sách user khớp với từ khóa
- **Acceptance Criteria:**
  - API endpoint: /api/users/search
  - Tìm kiếm theo name, displayName, email
  - Phân trang kết quả
  - Chỉ trả về thông tin công khai (không bao gồm password, sensitive data)

**FR-A-010: Xem chi tiết user**
- **Mô tả:** Người dùng có thể xem profile công khai của user khác
- **Actor:** Guest, BACKER, CREATOR_PENDING, CREATOR, ADMIN
- **Input:** User ID hoặc slug
- **Output:** Thông tin công khai của user
- **Acceptance Criteria:**
  - Route: /profile/[id]
  - Chỉ hiển thị thông tin công khai
  - Hiển thị danh sách chiến dịch đã tạo (nếu là CREATOR)
  - Hiển thị badges công khai

#### Module B: Chiến dịch gọi vốn (Campaigns)

**FR-B-001: Tạo chiến dịch DRAFT**
- **Mô tả:** CREATOR có thể tạo chiến dịch mới với trạng thái DRAFT
- **Actor:** CREATOR
- **Input:** Form nhiều bước: thông tin cơ bản, mục tiêu tài chính, thời hạn, gói rewards, tài liệu pháp lý
- **Output:** Campaign mới được tạo với status = DRAFT
- **Acceptance Criteria:**
  - Campaign có slug URL duy nhất
  - Type = REWARD hoặc DONATION
  - GoalAmount > 0
  - EndDate > StartDate
  - Images được upload qua Cloudinary
  - Tạo campaignCode duy nhất
  - Ghi audit log action = CREATE

**FR-B-002: Chỉnh sửa chiến dịch DRAFT**
- **Mô tả:** CREATOR có thể chỉnh sửa chiến dịch khi ở trạng thái DRAFT
- **Actor:** CREATOR
- **Input:** Các field campaign cần cập nhật
- **Output:** Campaign được cập nhật
- **Acceptance Criteria:**
  - Chỉ cho phép chỉnh sửa khi status = DRAFT
  - Ghi audit log action = UPDATE
  - Không được thay đổi slug sau khi tạo

**FR-B-003: Nộp chiến dịch để duyệt**
- **Mô tả:** CREATOR có thể nộp chiến dịch DRAFT để Admin duyệt
- **Actor:** CREATOR
- **Input:** Campaign ID
- **Output:** Campaign status thay đổi thành PENDING_REVIEW
- **Acceptance Criteria:**
  - Chỉ cho phép khi status = DRAFT
  - Tất cả field bắt buộc phải được điền
  - Gửi thông báo cho Admin
  - Ghi audit log action = APPROVE (submit)

**FR-B-004: Admin duyệt chiến dịch**
- **Mô tả:** Admin có thể duyệt chiến dịch PENDING_REVIEW để công khai
- **Actor:** ADMIN
- **Input:** Campaign ID, quyết định (approve/reject)
- **Output:** Campaign status thay đổi thành ACTIVE hoặc REJECTED
- **Acceptance Criteria:**
  - API endpoint: /api/admin/campaigns/[id]/review
  - Nếu approve: status = ACTIVE, startDate được set nếu chưa có
  - Nếu reject: status = REJECTED, ghi lý do
  - Ghi audit log action = APPROVE hoặc REJECT
  - Gửi email thông báo cho Creator

**FR-B-005: Tìm kiếm và lọc chiến dịch**
- **Mô tả:** Người dùng có thể tìm kiếm và lọc chiến dịch theo nhiều tiêu chí
- **Actor:** Guest, BACKER, CREATOR_PENDING, CREATOR, ADMIN
- **Input:** Từ khóa, category, type, status, tags, khoảng ngày
- **Output:** Danh sách chiến dịch khớp với bộ lọc
- **Acceptance Criteria:**
  - API endpoint: /api/campaigns
  - Hỗ trợ phân trang
  - Hỗ trợ sắp xếp theo: mới nhất, sắp hết hạn, nhiều tiền nhất
  - Filter theo category (taxonomy)
  - Filter theo type (REWARD/DONATION)
  - Filter theo status (chỉ ACTIVE cho công khai)

**FR-B-006: Xem chi tiết chiến dịch**
- **Mô tả:** Người dùng có thể xem chi tiết chiến dịch
- **Actor:** Guest, BACKER, CREATOR_PENDING, CREATOR, ADMIN
- **Input:** Campaign slug hoặc ID
- **Output:** Thông tin đầy đủ của chiến dịch
- **Acceptance Criteria:**
  - Route: /campaigns/[slug]
  - Hiển thị: title, description, longDescription, videoUrl, imageUrl, images, goalAmount, currentAmount, startDate, endDate, creator info
  - Hiển thị danh sách rewards (nếu type = REWARD)
  - Hiển thị danh sách campaign_updates
  - Hiển thị số người theo dõi (campaign_followers count)

**FR-B-007: Cập nhật tiến độ chiến dịch (campaign_updates)**
- **Mô tả:** CREATOR có thể đăng cập nhật tiến độ cho chiến dịch
- **Actor:** CREATOR
- **Input:** Campaign ID, title, content, imageUrl (tùy chọn), tags
- **Output:** Campaign_update mới được tạo
- **Acceptance Criteria:**
  - Chỉ CREATOR của campaign được phép đăng
  - Hỗ trợ ghim update (isPinned = true)
  - Tags là mảng string
  - Ghi audit log action = CREATE

**FR-B-008: Liên kết campaign với blog**
- **Mô tả:** CREATOR có thể liên kết bài viết blog với chiến dịch
- **Actor:** CREATOR
- **Input:** Campaign ID, Blog Post ID, order
- **Output:** Bản ghi mới trong campaign_blog_links
- **Acceptance Criteria:**
  - Một campaign có thể liên kết nhiều blog posts
  - Order xác định thứ tự hiển thị
  - Unique constraint trên (campaignId, blogPostId)

**FR-B-009: Theo dõi chiến dịch**
- **Mô tả:** Người dùng có thể theo dõi chiến dịch để nhận thông báo
- **Actor:** BACKER, CREATOR
- **Input:** Campaign ID
- **Output:** Bản ghi mới trong campaign_followers
- **Acceptance Criteria:**
  - User đã đăng nhập mới được theo dõi
  - Có thể theo dõi bằng userId hoặc email (cho guest)
  - Unique constraint trên (campaignId, userId) và (campaignId, email)
  - Có thể hủy theo dõi

**FR-B-010: Báo cáo chiến dịch vi phạm**
- **Mô tả:** Người dùng có thể báo cáo chiến dịch vi phạm
- **Actor:** BACKER, CREATOR
- **Input:** Campaign ID, reason (enum CampaignReportReason), description
- **Output:** Bản ghi mới trong campaign_reports
- **Acceptance Criteria:**
  - CampaignReportReason: FRAUD, INAPPROPRIATE, MISLEADING, SCAM, INTELLECTUAL_PROPERTY, OTHER
  - Unique constraint trên (campaignId, userId) - mỗi user chỉ báo cáo 1 lần
  - Status mặc định = PENDING
  - Gửi thông báo cho Admin

**FR-B-011: Hủy chiến dịch**
- **Mô tả:** CREATOR có thể hủy chiến dịch đang ACTIVE
- **Actor:** CREATOR
- **Input:** Campaign ID
- **Output:** Campaign status = CANCELED
- **Acceptance Criteria:**
  - Chỉ cho phép hủy khi status = ACTIVE
  - Tự động hoàn tiền cho các pledges SUCCESS (nếu có)
  - Ghi audit log action = CANCEL
  - Gửi email thông báo cho các backer

**FR-B-012: Tự động cập nhật trạng thái chiến dịch hết hạn**
- **Mô tả:** Cron job tự động cập nhật trạng thái chiến dịch khi hết hạn
- **Actor:** Hệ thống (Cron)
- **Input:** None (chạy định kỳ)
- **Output:** Campaign status cập nhật thành SUCCESS hoặc FAILED
- **Acceptance Criteria:**
  - Cron endpoint: /api/cron/update-campaign-status
  - Chạy hàng ngày hoặc hàng giờ
  - Nếu endDate < now và currentAmount >= goalAmount: status = SUCCESS
  - Nếu endDate < now và currentAmount < goalAmount: status = FAILED
  - Ghi audit log cho mỗi thay đổi

#### Module C: Thanh toán & ủng hộ

**FR-C-001: Tạo pledge PENDING**
- **Mô tả:** BACKER có thể tạo pledge ủng hộ chiến dịch
- **Actor:** BACKER
- **Input:** Campaign ID, amount, displayName, isAnonymous, rewardId (tùy chọn), tipAmount (tùy chọn)
- **Output:** Pledge mới với status = PENDING
- **Acceptance Criteria:**
  - Amount >= 10000 (tối thiểu 10,000 VNĐ)
  - Nếu chọn reward, amount >= reward.minAmount
  - Tính platformFee (mặc định 8%), vatAmount, totalAmount
  - Tạo transactionId duy nhất
  - Redirect về trang thanh toán

**FR-C-002: Chọn cổng thanh toán**
- **Mô tả:** BACKER có thể chọn cổng thanh toán: PayOS, SePay, MoMo, VNPay
- **Actor:** BACKER
- **Input:** Pledge ID, paymentProvider
- **Output:** Redirect đến cổng thanh toán
- **Acceptance Criteria:**
  - Hỗ trợ 4 cổng: PayOS (VietQR), SePay (QR Banking), MoMo, VNPay
  - Mỗi cổng có cấu hình riêng
  - Lưu paymentProvider trong pledge

**FR-C-003: Xử lý webhook thanh toán**
- **Mô tả:** Hệ thống nhận webhook từ cổng thanh toán để xác nhận giao dịch
- **Actor:** Hệ thống (Webhook)
- **Input:** Webhook payload từ cổng thanh toán
- **Output:** Pledge status cập nhật
- **Acceptance Criteria:**
  - Xác minh signature/checksum của webhook
  - Nếu thanh toán thành công: pledge.status = SUCCESS, currentAmount của campaign tăng
  - Nếu thanh toán thất bại: pledge.status = FAILED
  - Ghi webhookProcessedAt
  - Ghi audit log action = UPDATE

**FR-C-004: Đếm ngược thời gian thanh toán**
- **Mô tả:** Hiển thị đếm ngược thời gian còn lại để thanh toán
- **Actor:** Hệ thống (Frontend)
- **Input:** Pledge createdAt
- **Output:** Thời gian còn lại (ví dụ: 15 phút)
- **Acceptance Criteria:**
  - [cần xác nhận với developer] Thời gian timeout cụ thể
  - Hiển thị countdown trên UI
  - Hết hạn thì tự động hủy pledge

**FR-C-005: Escrow - Giữ tiền**
- **Mô tả:** Tiền từ pledge SUCCESS được giữ trong escrow cho đến khi chiến dịch kết thúc
- **Actor:** Hệ thống
- **Input:** Pledge SUCCESS
- **Output:** Tiền được giữ, chưa chuyển cho Creator
- **Acceptance Criteria:**
  - Tiền chỉ được giải ngân khi campaign status = SUCCESS
  - Nếu campaign status = FAILED hoặc CANCELED, tiền được hoàn lại
  - [cần xác nhận với developer] Cơ chế escrow cụ thể

**FR-C-006: Hoàn tiền (Refund)**
- **Mô tả:** Hệ thống hoàn tiền cho backer khi chiến dịch thất bại hoặc bị hủy
- **Actor:** Hệ thống hoặc ADMIN
- **Input:** Pledge ID, lý do
- **Output:** Pledge refundStatus = COMPLETED, tiền được hoàn về
- **Acceptance Criteria:**
  - RefundStatus enum: NO_REFUND, REQUESTED, PROCESSING, COMPLETED, FAILED
  - Ghi refundedAt
  - Ghi audit log action = REFUND
  - Gửi email thông báo cho backer

**FR-C-007: Kiểm tra giới hạn giao dịch**
- **Mô tả:** Hệ thống kiểm tra giới hạn giao dịch trước khi tạo pledge
- **Actor:** Hệ thống
- **Input:** User ID (hoặc null cho guest), amount
- **Output:** Cho phép hoặc từ chối với lý do
- **Acceptance Criteria:**
  - Guest: tối đa 20 triệu/giao dịch
  - User chưa KYC: tối đa 20 triệu/giao dịch, 50 triệu/ngày, 200 triệu/tháng, 5 giao dịch/ngày
  - User đã KYC: tối đa 500 triệu/giao dịch, 1 tỷ/ngày, 5 tỷ/tháng, 20 giao dịch/ngày
  - Kiểm tra trong bảng transaction_limits
  - Trả về { allowed: boolean, reason?: string }

**FR-C-008: Kiểm tra blacklist**
- **Mô tả:** Hệ thống kiểm tra blacklist trước khi cho phép giao dịch
- **Actor:** Hệ thống
- **Input:** IP, email, phone, bankAccount, deviceId
- **Output:** Cho phép hoặc từ chối
- **Acceptance Criteria:**
  - BlacklistType enum: IP, EMAIL, PHONE, BANK_ACCOUNT, DEVICE_ID
  - Kiểm tra trong bảng blacklist
  - Chỉ kiểm tra các bản ghi với isActive = true
  - Kiểm tra expiresAt (nếu có)

**FR-C-009: Cron dọn giao dịch thừa hạn**
- **Mô tả:** Cron job tự động hủy các pledge PENDING quá hạn
- **Actor:** Hệ thống (Cron)
- **Input:** None (chạy định kỳ)
- **Output:** Pledge status = FAILED
- **Acceptance Criteria:**
  - Cron endpoint: /api/cron/cleanup-payments
  - Chạy hàng giờ
  - Tìm pledge PENDING với createdAt > timeout (ví dụ: 15 phút)
  - Cập nhật status = FAILED
  - Ghi audit log

**FR-C-010: Tạo hóa đơn backer**
- **Mô tả:** Hệ thống tự động tạo hóa đơn biên nhận cho backer sau khi pledge SUCCESS
- **Actor:** Hệ thống
- **Input:** Pledge SUCCESS
- **Output:** backer_invoice mới được tạo
- **Acceptance Criteria:**
  - InvoiceNumber duy nhất
  - Chứa: backerName, backerEmail, backerPhone, backerAddress, amount, tipAmount, platformFee, vatAmount, totalAmount
  - Status mặc định = PENDING
  - Tạo PDF (pdfUrl)
  - Gửi email cho backer (sentAt)

**FR-C-011: Tạo hóa đơn nền tảng**
- **Mô tả:** Hệ thống tạo hóa đơn phí nền tảng cho Creator khi chiến dịch SUCCESS
- **Actor:** Hệ thống
- **Input:** Campaign SUCCESS
- **Output:** platform_invoice mới được tạo
- **Acceptance Criteria:**
  - InvoiceNumber duy nhất
  - Amount = platformFee từ các pledges
  - VatAmount tính theo quy định
  - DueDate = ngày đến hạn thanh toán
  - Status mặc định = PENDING

**FR-C-012: Tạo hóa đơn tip hàng ngày**
- **Mô tả:** Cron job tổng hợp tip hàng ngày và tạo hóa đơn
- **Actor:** Hệ thống (Cron)
- **Input:** None (chạy hàng ngày)
- **Output:** daily_tip_invoice mới được tạo
- **Acceptance Criteria:**
  - Cron chạy vào cuối ngày
  - Tổng hợp tất cả tipAmount từ pledges SUCCESS trong ngày
  - Tính totalVat
  - invoiceDate = ngày hiện tại
  - Status mặc định = "PENDING"

**FR-C-013: Trang payment-success**
- **Mô tả:** Hiển thị trang xác nhận thanh toán thành công
- **Actor:** BACKER
- **Input:** Pledge ID hoặc transactionId
- **Output:** Trang hiển thị thông tin giao dịch
- **Acceptance Criteria:**
  - Route: /payment-success hoặc /checkout/[pledgeId]/success
  - Hiển thị: amount, campaign title, transactionId, thời gian
  - Link xem hóa đơn
  - Link về trang chiến dịch

**FR-C-014: Tra cứu giao dịch**
- **Mô tả:** Người dùng có thể tra cứu giao dịch theo transactionId hoặc email
- **Actor:** Guest, BACKER, CREATOR, ADMIN
- **Input:** transactionId hoặc email
- **Output:** Thông tin giao dịch
- **Acceptance Criteria:**
  - API endpoint: /api/lookup hoặc /api/transactions
  - Nếu tìm bằng transactionId: trả về pledge chi tiết
  - Nếu tìm bằng email: trả về danh sách pledges của email đó
  - Chỉ hiển thị thông tin công khai

#### Module D: KYC (Xác minh danh tính Creator)

**FR-D-001: Nộp hồ sơ KYC**
- **Mô tả:** CREATOR_PENDING nộp hồ sơ xác minh danh tính
- **Actor:** CREATOR_PENDING
- **Input:** fullName, idCardNumber, idCardType (CMND/CCCD/PASSPORT), idCardFrontImage, idCardBackImage, idCardIssueDate, idCardIssuePlace, dateOfBirth, placeOfBirth, nationality, permanentAddress, currentAddress, occupation, monthlyIncome, businessLicense (tùy chọn)
- **Output:** kyc_info mới được tạo với status = PENDING
- **Acceptance Criteria:**
  - idCardNumber phải unique
  - Validate ID card theo type (CMND: 9 hoặc 12 số, CCCD: 12 số, Passport: 8-9 ký tự)
  - Images upload qua Cloudinary
  - riskLevel mặc định = LOW
  - Gửi thông báo cho Admin

**FR-D-002: Admin duyệt KYC**
- **Mô tả:** Admin duyệt hồ sơ KYC
- **Actor:** ADMIN
- **Input:** KYC ID, quyết định (approve/reject), lý do (nếu reject)
- **Output:** KYC status = VERIFIED hoặc REJECTED
- **Acceptance Criteria:**
  - Nếu approve: status = VERIFIED, verifiedAt = now, verifiedBy = adminId, tự động nâng cấp user role thành CREATOR
  - Nếu reject: status = REJECTED, rejectedReason = lý do
  - Ghi audit log action = KYC_APPROVE hoặc KYC_REJECT
  - Gửi email thông báo cho user

**FR-D-003: Kiểm tra trạng thái KYC**
- **Mô tả:** Hệ thống kiểm tra user đã KYC chưa
- **Actor:** Hệ thống
- **Input:** User ID
- **Output:** Boolean (true nếu VERIFIED)
- **Acceptance Criteria:**
  - Hàm isKYCVerified(userId)
  - Trả về true chỉ khi kyc_info.verificationStatus = VERIFIED

**FR-D-004: Lấy giới hạn giao dịch theo KYC**
- **Mô tả:** Hệ thống lấy giới hạn giao dịch dựa trên trạng thái KYC
- **Actor:** Hệ thống
- **Input:** User ID
- **Output:** Transaction limit
- **Acceptance Criteria:**
  - Hàm getTransactionLimit(userId)
  - Ưu tiên limit cụ thể cho user trong transaction_limits
  - Nếu không có, tìm limit mặc định cho KYC status
  - Nếu vẫn không có, return limit mặc định theo quy định

**FR-D-005: Hết hạn KYC**
- **Mô tả:** KYC có thể hết hạn sau một khoảng thời gian
- **Actor:** Hệ thống (Cron)
- **Input:** None (chạy định kỳ)
- **Output:** KYC status = EXPIRED
- **Acceptance Criteria:**
  - [cần xác nhận với developer] Thời hạn KYC cụ thể
  - Cron kiểm tra các KYC VERIFIED quá hạn
  - Cập nhật status = EXPIRED
  - Gửi email yêu cầu nộp lại hồ sơ

#### Module E: Phần thưởng (Rewards)

**FR-E-001: Tạo reward**
- **Mô tả:** CREATOR tạo reward cho chiến dịch
- **Actor:** CREATOR
- **Input:** Campaign ID, title, description, minAmount, deliveryDate, maxQuantity (tùy chọn)
- **Output:** Reward mới được tạo
- **Acceptance Criteria:**
  - Campaign phải thuộc về CREATOR
  - minAmount > 0
  - deliveryDate > startDate của campaign
  - isActive mặc định = true
  - Ghi audit log action = CREATE

**FR-E-002: Chỉnh sửa reward**
- **Mô tả:** CREATOR chỉnh sửa reward
- **Actor:** CREATOR
- **Input:** Reward ID, các field cần cập nhật
- **Output:** Reward được cập nhật
- **Acceptance Criteria:**
  - Chỉ CREATOR của campaign được phép chỉnh sửa
  - Không được thay đổi campaignId
  - Ghi audit log action = UPDATE

**FR-E-003: Xóa/hủy reward**
- **Mô tả:** CREATOR có thể hủy reward (soft delete bằng isActive = false)
- **Actor:** CREATOR
- **Input:** Reward ID
- **Output:** Reward.isActive = false
- **Acceptance Criteria:**
  - Chỉ CREATOR của campaign được phép hủy
  - Không xóa nếu đã có pledge liên kết
  - Ghi audit log action = DELETE

**FR-E-004: Xem danh sách rewards**
- **Mô tả:** Người dùng xem danh sách rewards của chiến dịch
- **Actor:** Guest, BACKER, CREATOR, ADMIN
- **Input:** Campaign ID
- **Output:** Danh sách rewards active
- **Acceptance Criteria:**
  - Chỉ hiển thị rewards với isActive = true
  - Sắp xếp theo minAmount tăng dần
  - Hiển thị số lượng còn lại (nếu có maxQuantity)

#### Module F: Blog & tin tức

**FR-F-001: Tạo bài viết blog**
- **Actor:** CREATOR, ADMIN
- **Input:** BlogPostType (PLATFORM/CAMPAIGN_UPDATE/ANNOUNCEMENT/STORY/IMPACT_REPORT), title, slug, content, coverImage, excerpt, categoryId, tags, visibility (PUBLIC/BACKERS_ONLY/OWNER_ONLY/PRIVATE)
- **Output:** blog_posts mới với status = DRAFT
- **Acceptance Criteria:**
  - Slug phải duy nhất
  - content lưu trong MongoDB (mongoContentId) hoặc PostgreSQL
  - type mặc định = PLATFORM
  - visibility mặc định = PUBLIC
  - Ghi audit log action = CREATE

**FR-F-002: Chỉnh sửa bài viết blog**
- **Actor:** CREATOR, ADMIN
- **Input:** Blog Post ID, các field cần cập nhật
- **Output:** Blog post được cập nhật
- **Acceptance Criteria:**
  - Chỉ tác giả hoặc ADMIN được phép chỉnh sửa
  - Ghi audit log action = UPDATE

**FR-F-003: Xuất bản bài viết**
- **Actor:** CREATOR, ADMIN
- **Input:** Blog Post ID
- **Output:** Blog post status = PUBLISHED, publishedAt = now
- **Acceptance Criteria:**
  - Chỉ tác giả hoặc ADMIN được phép xuất bản
  - Nếu type = CAMPAIGN_UPDATE, campaignId phải được cung cấp
  - Tự động tính wordCount và readingTimeMinutes
  - Gửi thông báo cho followers (nếu có)

**FR-F-004: Admin duyệt bài viết**
- **Actor:** ADMIN
- **Input:** Blog Post ID, quyết định (approve/reject)
- **Output:** Blog post status = PUBLISHED hoặc REJECTED
- **Acceptance Criteria:**
  - API endpoint: /api/admin/blog/posts/[id]/review
  - Nếu approve: status = PUBLISHED
  - Nếu reject: status = REJECTED
  - Ghi audit log action = APPROVE hoặc REJECT

**FR-F-005: Xem danh sách bài viết**
- **Actor:** Guest, BACKER, CREATOR, ADMIN
- **Input:** Filter (category, type, status, tag)
- **Output:** Danh sách blog posts
- **Acceptance Criteria:**
  - API endpoint: /api/blog/posts
  - Hỗ trợ phân trang
  - Filter theo visibility (chỉ hiển thị PUBLIC cho guest)
  - Filter theo type, category, tag
  - Sắp xếp theo publishedAt hoặc viewCount

**FR-F-006: Like bài viết**
- **Actor:** BACKER, CREATOR
- **Input:** Blog Post ID
- **Output:** Bản ghi mới trong blog_likes, likeCount tăng
- **Acceptance Criteria:**
  - User đã đăng nhập mới được like
  - Unique constraint trên (postId, userId) - không like 2 lần
  - Có thể unlike (xóa bản ghi)
  - likeCount được cập nhật real-time

**FR-F-007: Bookmark bài viết**
- **Actor:** BACKER, CREATOR
- **Input:** Blog Post ID
- **Output:** Bản ghi mới trong blog_bookmarks, bookmarkCount tăng
- **Acceptance Criteria:**
  - User đã đăng nhập mới được bookmark
  - Unique constraint trên (postId, userId)
  - Có thể unbookmark
  - bookmarkCount được cập nhật

**FR-F-008: Bình luận bài viết**
- **Actor:** BACKER, CREATOR
- **Input:** Blog Post ID, content, parentId (nếu reply)
- **Output:** blog_comments mới với status = VISIBLE
- **Acceptance Criteria:**
  - User đã đăng nhập mới được bình luận
  - Hỗ trợ reply (parentId)
  - status mặc định = VISIBLE
  - commentCount tăng
  - Gửi thông báo cho tác giả

**FR-F-009: Admin duyệt bình luận**
- **Actor:** ADMIN
- **Input:** Comment ID, quyết định (approve/hide/delete)
- **Output:** Comment status = VISIBLE/HIDDEN/DELETED
- **Acceptance Criteria:**
  - BlogCommentStatus enum: VISIBLE, HIDDEN, DELETED, PENDING_REVIEW
  - Nếu hide: status = HIDDEN
  - Nếu delete: status = DELETED, deletedAt = now
  - Ghi audit log

**FR-F-010: Báo cáo bài viết**
- **Actor:** BACKER, CREATOR
- **Input:** Blog Post ID hoặc Comment ID, reason (BlogReportReason), description
- **Output:** blog_reports mới với status = PENDING
- **Acceptance Criteria:**
  - BlogReportReason enum: SPAM, ABUSE, MISINFORMATION, SCAM, INAPPROPRIATE, OTHER
  - Có thể báo cáo bài viết hoặc bình luận
  - Gửi thông báo cho Admin

**FR-F-011: Admin xử lý báo cáo blog**
- **Actor:** ADMIN
- **Input:** Report ID, quyết định (resolve/dismiss), resolution
- **Output:** Report status = RESOLVED hoặc DISMISSED
- **Acceptance Criteria:**
  - ReportStatus enum: PENDING, REVIEWING, RESOLVED, DISMISSED
  - Nếu resolve: status = RESOLVED, resolution = lý do, reviewedAt = now
  - Nếu dismiss: status = DISMISSED
  - Ghi audit log

#### Module G: Chat real-time

**FR-G-001: Bắt đầu hội thoại**
- **Actor:** BACKER, CREATOR
- **Input:** Target user ID, campaignId (tùy chọn)
- **Output:** Conversation mới hoặc conversation đã tồn tại
- **Acceptance Criteria:**
  - API endpoint: /api/chat/conversations/start
  - Tạo conversationKey dựa trên 2 user ID (đảm bảo cùng 1 conversation bất kể ai bắt đầu)
  - Nếu campaignId được cung cấp, type = 'campaign', ngược lại type = 'direct'
  - Validate cả 2 user tồn tại trong PostgreSQL
  - Nếu campaignId, validate target user là creator của campaign
  - Lưu trong MongoDB collection 'conversations'

**FR-G-002: Gửi tin nhắn**
- **Actor:** BACKER, CREATOR
- **Input:** Conversation ID, text
- **Output:** Message mới được tạo
- **Acceptance Criteria:**
  - API endpoint: /api/chat/conversations/[conversationId]/messages
  - Validate user là participant của conversation
  - Kiểm tra conversation không bị block
  - Text tối đa 2000 ký tự
  - Lưu trong MongoDB collection 'messages'
  - Cập nhật lastMessage và updatedAt của conversation
  - Tăng unreadCount cho participant khác

**FR-G-003: Xem danh sách hội thoại**
- **Actor:** BACKER, CREATOR
- **Input:** User ID (từ session)
- **Output:** Danh sách conversations của user
- **Acceptance Criteria:**
  - API endpoint: /api/chat/conversations
  - Chỉ trả về conversations mà user là participant
  - Sắp xếp theo updatedAt giảm dần
  - Hiển thị unreadCount cho mỗi conversation

**FR-G-004: Xem tin nhắn**
- **Actor:** BACKER, CREATOR
- **Input:** Conversation ID, limit (mặc định 30), before (pagination cursor)
- **Output:** Danh sách messages với pagination
- **Acceptance Criteria:**
  - API endpoint: /api/chat/conversations/[conversationId]/messages
  - Validate user là participant
  - Chỉ hiển thị messages với isDeleted = false
  - Pagination bằng cursor (before)
  - Trả về hasMore để biết còn tin nhắn cũ hơn không

**FR-G-005: Đánh dấu đã đọc**
- **Actor:** BACKER, CREATOR
- **Input:** Conversation ID
- **Output:** unreadCount của user = 0
- **Acceptance Criteria:**
  - API endpoint: /api/chat/conversations/[conversationId]/read
  - Reset unreadCount[userId] = 0
  - Thêm userId vào readBy của các messages chưa đọc

**FR-G-006: Xóa tin nhắn**
- **Actor:** BACKER, CREATOR
- **Input:** Message ID
- **Output:** Message.isDeleted = true, text = ''
- **Acceptance Criteria:**
  - Chỉ sender được xóa tin nhắn của mình
  - Soft delete (không xóa thật)
  - Ghi updatedAt

**FR-G-007: Block hội thoại**
- **Actor:** BACKER, CREATOR
- **Input:** Conversation ID
- **Output:** User ID được thêm vào blockedBy array
- **Acceptance Criteria:**
  - API endpoint: /api/chat/conversations/[conversationId]/block
  - Validate user là participant
  - Không thể gửi tin nhắn khi đã block
  - Có thể unblock

**FR-G-008: Báo cáo hội thoại**
- **Actor:** BACKER, CREATOR
- **Input:** Conversation ID, reason (ChatReportReason), description, messageId (tùy chọn)
- **Output:** chat_report mới trong MongoDB
- **Acceptance Criteria:**
  - API endpoint: /api/chat/conversations/[conversationId]/report
  - Validate user là participant
  - Có thể báo cáo cả conversation hoặc message cụ thể
  - conversation.isReported = true
  - Gửi thông báo cho Admin

**FR-G-009: Đếm tin chưa đọc tổng**
- **Actor:** BACKER, CREATOR
- **Input:** User ID
- **Output:** Tổng số tin nhắn chưa đọc
- **Acceptance Criteria:**
  - Hàm getTotalUnreadCount(userId)
  - Tổng hợp unreadCount từ tất cả conversations

#### Module H: Huy hiệu (Badges)

**FR-H-001: Tạo badge**
- **Actor:** ADMIN
- **Input:** name, description, iconUrl, iconName, color, backgroundColor, type (BadgeType: custom/achievement), rarity (BadgeRarity: common/rare/epic/legendary), isActive
- **Output:** badges mới được tạo
- **Acceptance Criteria:**
  - API endpoint: /api/admin/badges
  - Slug được tự động tạo từ name (duy nhất)
  - Validate hex color format
  - type mặc định = 'custom'
  - rarity mặc định = 'common'
  - isActive mặc định = true
  - Ghi audit log action = CREATE

**FR-H-002: Chỉnh sửa badge**
- **Actor:** ADMIN
- **Input:** Badge ID, các field cần cập nhật
- **Output:** Badge được cập nhật
- **Acceptance Criteria:**
  - Validate type, rarity, color
  - Slug được regenerate nếu name thay đổi
  - Ghi audit log action = UPDATE

**FR-H-003: Xóa badge**
- **Actor:** ADMIN
- **Input:** Badge ID
- **Output:** Badge.deletedAt = now (soft delete)
- **Acceptance Criteria:**
  - Soft delete, không xóa thật
  - Các user_badges liên kết vẫn tồn tại
  - Ghi audit log action = DELETE

**FR-H-004: Gán badge cho user**
- **Actor:** ADMIN
- **Input:** Badge ID, User ID, reason, note, expiresAt (tùy chọn)
- **Output:** user_badges mới được tạo
- **Acceptance Criteria:**
  - API endpoint: /api/admin/badges/[id]/assign
  - Badge phải active và không bị xóa
  - Không gán trùng badge active cho cùng user
  - expiresAt có thể null (không hết hạn)
  - is_visible mặc định = true
  - Ghi audit log action = CREATE

**FR-H-005: Thu hồi badge**
- **Actor:** ADMIN
- **Input:** User Badge ID, reason
- **Output:** user_badges.revokedAt = now, revokedBy = adminId, revokeReason = reason
- **Acceptance Criteria:**
  - API endpoint: /api/admin/user-badges/[id]/revoke
  - Soft revoke (không xóa bản ghi)
  - Ghi audit log action = DELETE

**FR-H-006: Xem danh sách badges**
- **Actor:** ADMIN
- **Input:** Filter (type, rarity, isActive, search)
- **Output:** Danh sách badges với thống kê số user
- **Acceptance Criteria:**
  - API endpoint: /api/admin/badges
  - Hỗ trợ phân trang
  - Bao gồm userCount (số user đang có badge active)
  - Chỉ hiển thị badges chưa bị xóa

**FR-H-007: Xem badges của user**
- **Actor:** BACKER, CREATOR, ADMIN
- **Input:** User ID
- **Output:** Danh sách badges của user
- **Acceptance Criteria:**
  - API endpoint: /api/badges hoặc /api/admin/users/[userId]/badges
  - Mặc định chỉ hiển thị badges active (revoked_at = null, chưa hết hạn)
  - Có thể tùy chọn includeRevoked, includeExpired
  - Sắp xếp theo assigned_at giảm dần

**FR-H-008: Xem badges công khai**
- **Actor:** Guest, BACKER, CREATOR
- **Input:** User ID
- **Output:** Danh sách badges công khai của user
- **Acceptance Criteria:**
  - Chỉ hiển thị badges với is_visible = true
  - Chỉ badges active và chưa hết hạn
  - Dùng trên profile page

#### Module I: Admin dashboard

**FR-I-001: Duyệt chiến dịch**
- **Mô tả:** Xem FR-B-004

**FR-I-002: Duyệt KYC**
- **Mô tả:** Xem FR-D-002

**FR-I-003: Duyệt blog**
- **Mô tả:** Xem FR-F-004

**FR-I-004: Khóa tài khoản**
- **Actor:** ADMIN
- **Input:** User ID, lý do
- **Output:** User.status = BANNED
- **Acceptance Criteria:**
  - API endpoint: /api/admin/users/[userId]/update-status
  - User bị khóa không thể đăng nhập
  - Ghi audit log action = UPDATE
  - Gửi email thông báo

**FR-I-005: Quản lý user**
- **Actor:** ADMIN
- **Input:** Filter (role, status, search)
- **Output:** Danh sách users
- **Acceptance Criteria:**
  - API endpoint: /api/admin/users
  - Hỗ trợ phân trang
  - Có thể xem chi tiết user
  - Có thể reset password [cần xác nhận với developer]

**FR-I-006: Quản lý badges**
- **Mô tả:** Xem FR-H-001 đến FR-H-006

**FR-I-007: Xem thống kê doanh thu**
- **Actor:** ADMIN
- **Input:** Khoảng thời gian
- **Output:** Báo cáo doanh thu
- **Acceptance Criteria:**
  - API endpoint: /api/stats
  - Tổng doanh thu theo khoảng thời gian
  - Doanh thu theo cổng thanh toán
  - Doanh thu theo category
  - Số chiến dịch SUCCESS/FAILED
  - Số user active

**FR-I-008: Xét xử báo cáo chiến dịch**
- **Actor:** ADMIN
- **Input:** Campaign Report ID, quyết định (resolve/dismiss), resolution
- **Output:** campaign_reports.status = RESOLVED hoặc DISMISSED
- **Acceptance Criteria:**
  - API endpoint: /api/admin/reports
  - Nếu resolve: status = RESOLVED, resolution = lý do, resolvedAt = now, resolvedBy = adminId
  - Có thể khóa chiến dịch hoặc user nếu vi phạm
  - Ghi audit log

**FR-I-009: Xét xử báo cáo blog**
- **Mô tả:** Xem FR-F-011

**FR-I-010: Xét xử báo cáo chat**
- **Actor:** ADMIN
- **Input:** Chat Report ID, quyết định
- **Output:** chat_report.status = 'resolved' hoặc 'dismissed'
- **Acceptance Criteria:**
  - Xem trong MongoDB collection 'chat_reports'
  - Có thể block conversation hoặc user nếu vi phạm
  - Ghi audit log

#### Module J: Đánh giá, Social links, Audit log

**FR-J-001: Tạo đánh giá**
- **Actor:** BACKER
- **Input:** Campaign ID, rating (1-5), comment, imageUrl (tùy chọn)
- **Output:** reviews mới được tạo
- **Acceptance Criteria:**
  - User phải đã pledge thành công campaign
  - Rating từ 1 đến 5
  - Mỗi user chỉ đánh giá 1 lần mỗi campaign
  - Chỉ đánh giá khi campaign status = SUCCESS hoặc FAILED

**FR-J-002: Xem đánh giá**
- **Actor:** Guest, BACKER, CREATOR, ADMIN
- **Input:** Campaign ID
- **Output:** Danh sách reviews
- **Acceptance Criteria:**
  - Hiển thị rating, comment, imageUrl, createdAt
  - Hiển thị thông tin user (ẩn nếu ẩn danh)
  - Tính trung bình rating

**FR-J-003: Quản lý social links**
- **Actor:** BACKER, CREATOR
- **Input:** Social platform, URL
- **Output:** socialLinks trong users được cập nhật
- **Acceptance Criteria:**
  - Social platforms enum: Facebook, Twitter, Instagram, LinkedIn, YouTube, TikTok, Website, Other
  - Lưu dưới dạng JSON trong users.socialLinks
  - Validate URL format

**FR-J-004: Tạo audit log**
- **Actor:** Hệ thống
- **Input:** action (AuditAction), entityType, entityId, oldValue, newValue, changes, ipAddress, userAgent, reason, metadata
- **Output:** audit_logs mới được tạo
- **Acceptance Criteria:**
  - AuditAction enum: CREATE, UPDATE, DELETE, REFUND, APPROVE, REJECT, CANCEL, LOGIN, LOGOUT, KYC_SUBMIT, KYC_APPROVE, KYC_REJECT
  - Tự động ghi cho mọi hành động quan trọng
  - Lưu song song trong PostgreSQL và MongoDB
  - Không throw error nếu fail (không ảnh hưởng business logic)

**FR-J-005: Xem audit log**
- **Actor:** ADMIN
- **Input:** EntityType, EntityID
- **Output:** Danh sách audit logs
- **Acceptance Criteria:**
  - Hàm getAuditLogs(entityType, entityId)
  - Sắp xếp theo createdAt giảm dần
  - Bao gồm thông tin user thực hiện hành động
  - Hiển thị oldValue, newValue, changes

#### Module K: Hạ tầng & ràng buộc

**FR-K-001: Upload ảnh**
- **Actor:** BACKER, CREATOR, ADMIN
- **Input:** File ảnh
- **Output:** URL ảnh từ Cloudinary
- **Acceptance Criteria:**
  - API endpoint: /api/upload
  - Validate file type (image only)
  - Validate file size (max 5MB)
  - Upload lên Cloudinary
  - Trả về URL

**FR-K-002: Singleton DB connection**
- **Actor:** Hệ thống
- **Input:** None
- **Output:** Single instance của Prisma client
- **Acceptance Criteria:**
  - Sử dụng singleton pattern cho Prisma client
  - Tránh tạo nhiều connection
  - Tối ưu performance

**FR-K-003: Rate limiting**
- **Actor:** Hệ thống
- **Input:** API request
- **Output:** Cho phép hoặc từ chối
- **Acceptance Criteria:**
  - [cần xác nhận với developer] Rate limit cụ thể
  - Áp dụng cho API endpoints nhạy cảm
  - Trả về 429 Too Many Requests nếu vượt limit

**FR-K-004: Security headers**
- **Actor:** Hệ thống
- **Input:** HTTP response
- **Output:** Security headers được thêm
- **Acceptance Criteria:**
  - Include: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
  - Cấu hình trong next.config.ts

### 3.2 Yêu cầu phi chức năng (NFR)

**NFR-001: Hiệu năng**
- Hệ thống phải đáp ứng < 200ms cho 95% API requests
- Hỗ trợ tối thiểu 1000 concurrent users
- Trang phải load trong < 3s trên kết nối 3G

**NFR-002: Bảo mật - Webhook signature**
- Mọi webhook từ cổng thanh toán phải được xác minh signature/checksum
- Signature key được lưu trong environment variable
- Từ chối webhook không hợp lệ

**NFR-003: Bảo mật - Rate limiting**
- API endpoints phải có rate limiting để prevent DDoS
- Rate limit: 100 requests/phút cho authenticated users, 20 requests/phút cho guests

**NFR-004: Bảo mật - Authentication**
- Password phải được hash bằng bcrypt hoặc tương đương
- JWT token phải có expiry (mặc định 7 ngày)
- Session phải được refresh token

**NFR-005: Bảo mật - Authorization**
- Middleware phải kiểm tra role trước khi cho phép truy cập
- Admin endpoints chỉ accessible bởi ADMIN
- Creator endpoints chỉ accessible bởi CREATOR

**NFR-006: Bảo mật - Data encryption**
- Dữ liệu nhạy cảm (password, KYC info) phải được encryption at rest
- HTTPS bắt buộc cho production

**NFR-007: Khả dụng**
- Uptime tối thiểu 99.5%
- Deploy trên Vercel với automatic scaling
- Database phải có backup hàng ngày

**NFR-008: Tương thích**
- Hỗ trợ các browser chính: Chrome, Firefox, Safari, Edge (phiên bản mới nhất)
- Hỗ trợ mobile responsive (viewport từ 320px)
- Hỗ trợ tiếng Việt

**NFR-009: Maintainability**
- Code phải tuân thủ TypeScript strict mode
- Code coverage tối thiểu 80%
- Tất cả test cases phải pass (88/100%)

**NFR-010: Scalability**
- Architecture phải hỗ trợ horizontal scaling
- MongoDB và PostgreSQL phải có connection pooling
- Static assets phải được CDN (Cloudinary)

### 3.3 Yêu cầu dữ liệu (DR)

**DR-001: users**
- Bảng người dùng trong PostgreSQL
- Fields: id, email, password, name, displayName, avatar, phone, role, isOrganization, isAdmin, bio, idCard, businessLicense, bankAccount, bankName, approvedAt, createdAt, updatedAt, image, location, website, coverImage, shippingAddress, socialLinks (JSON), status
- Indexes: email (unique), role, status

**DR-002: campaigns**
- Bảng chiến dịch trong PostgreSQL
- Fields: id, campaignCode (unique), slug (unique), title, description, longDescription, videoUrl, imageUrl, type, category, tags (array), goalAmount, currentAmount, status, startDate, endDate, creatorId, projectId, feeRate, createdAt, updatedAt, images (array)
- Indexes: category, projectId, tags

**DR-003: pledges**
- Bảng giao dịch ủng hộ trong PostgreSQL
- Fields: id, campaignId, userId, displayName, isAnonymous, email, phoneNumber, amount, tipAmount, platformFee, vatAmount, totalAmount, paymentProvider, transactionId (unique), ipAddress, deviceInfo (JSON), status, refundStatus, refundedAt, invoiceGroupDate, createdAt, updatedAt, rewardId, shippingAddress, payosOrderCode (unique), webhookProcessedAt
- Relations: campaigns, users, rewards, backer_invoices, audit_logs

**DR-004: kyc_info**
- Bảng thông tin KYC trong PostgreSQL
- Fields: id, userId (unique), fullName, idCardNumber (unique), idCardType, idCardFrontImage, idCardBackImage, idCardIssueDate, idCardIssuePlace, dateOfBirth, placeOfBirth, nationality, permanentAddress, currentAddress, occupation, monthlyIncome, verificationStatus, verifiedAt, verifiedBy, rejectedReason, riskLevel, createdAt, updatedAt
- Relations: users

**DR-005: rewards**
- Bảng phần thưởng trong PostgreSQL
- Fields: id, campaignId, title, description, createdAt, deliveryDate, isActive, maxQuantity, minAmount, updatedAt
- Relations: campaigns, pledges
- Indexes: campaignId

**DR-006: blog_posts**
- Bảng bài viết blog trong PostgreSQL
- Fields: id, authorId, campaignId, projectId, mongoContentId, title, slug (unique), excerpt, coverImage, status, type, visibility, publishedAt, createdAt, updatedAt, deletedAt, viewCount, likeCount, commentCount, bookmarkCount, isFeatured, wordCount, readingTimeMinutes, content
- Relations: users, campaigns, projects, blog_reports, campaign_blog_links
- Indexes: authorId, campaignId, projectId, deletedAt, isFeatured, publishedAt, slug, status, type, visibility

**DR-007: blog_comments**
- Bảng bình luận blog trong PostgreSQL
- Fields: id, postId, userId, parentId, content, status, createdAt, updatedAt, deletedAt
- Relations: blog_posts, users
- Indexes: parentId, postId, userId

**DR-008: blog_likes**
- Bảng like blog trong PostgreSQL
- Fields: id, postId, userId, createdAt
- Relations: blog_posts, users
- Unique: (postId, userId)
- Indexes: postId, userId

**DR-009: blog_bookmarks**
- Bảng bookmark blog trong PostgreSQL
- Fields: id, postId, userId, createdAt
- Relations: blog_posts, users
- Unique: (postId, userId)
- Indexes: postId, userId

**DR-010: blog_categories**
- Bảng danh mục blog trong PostgreSQL
- Fields: id, name, slug (unique), description, createdAt
- Relations: blog_post_categories

**DR-011: blog_tags**
- Bảng tag blog trong PostgreSQL
- Fields: id, name, slug (unique)
- Relations: blog_post_tags

**DR-012: blog_reports**
- Bảng báo cáo blog trong PostgreSQL
- Fields: id, postId, commentId, reporterId, reason, description, status, reviewedBy, reviewedAt, createdAt
- Relations: blog_posts, users
- Indexes: commentId, postId, reporterId, status

**DR-013: badges**
- Bảng huy hiệu trong PostgreSQL
- Fields: id, name, slug (unique), description, icon_url, icon_name, color, background_color, type, rarity, is_active, created_by, created_at, updated_at, deleted_at
- Relations: users, user_badges
- Indexes: deleted_at, is_active, slug, type

**DR-014: user_badges**
- Bảng gán huy hiệu trong PostgreSQL
- Fields: id, user_id, badge_id, assigned_by, reason, note, assigned_at, expires_at, revoked_at, revoked_by, revoke_reason, is_visible
- Relations: badges, users
- Indexes: assigned_by, badge_id, revoked_at, user_id

**DR-015: campaign_updates**
- Bảng cập nhật chiến dịch trong PostgreSQL
- Fields: id, campaignId, title, content, imageUrl, createdAt, isPinned, tags (array), updatedAt
- Relations: campaigns
- Indexes: campaignId (isPinned), tags

**DR-016: campaign_followers**
- Bảng theo dõi chiến dịch trong PostgreSQL
- Fields: id, campaignId, userId, email, createdAt
- Relations: campaigns, users
- Unique: (campaignId, email), (campaignId, userId)
- Indexes: campaignId, userId

**DR-017: campaign_reports**
- Bảng báo cáo chiến dịch trong PostgreSQL
- Fields: id, campaignId, userId, reason, description, status, resolvedAt, resolvedBy, resolution, createdAt
- Relations: campaigns, users
- Unique: (campaignId, userId)
- Indexes: campaignId, status, userId

**DR-018: campaign_blog_links**
- Bảng liên kết campaign-blog trong PostgreSQL
- Fields: id, campaignId, blogPostId, order, createdAt
- Relations: campaigns, blog_posts
- Unique: (campaignId, blogPostId)
- Indexes: blogPostId, campaignId

**DR-019: backer_invoices**
- Bảng hóa đơn backer trong PostgreSQL
- Fields: id, invoiceNumber (unique), pledgeId (unique), backerName, backerEmail, backerPhone, backerAddress, backerTaxCode, companyName, amount, tipAmount, platformFee, vatAmount, totalAmount, campaignTitle, paymentMethod, transactionId, status, issuedAt, pdfUrl, sentAt, createdAt, updatedAt
- Relations: pledges
- Indexes: invoiceNumber, pledgeId

**DR-020: platform_invoices**
- Bảng hóa đơn nền tảng trong PostgreSQL
- Fields: id, invoiceNumber (unique), campaignId, creatorId, amount, vatAmount, totalAmount, status, dueDate, paidAt, paymentMethod, createdAt, updatedAt
- Relations: campaigns, users

**DR-021: daily_tip_invoices**
- Bảng hóa đơn tip hàng ngày trong PostgreSQL
- Fields: id, invoiceDate (unique), totalTip, totalVat, status, createdAt

**DR-022: transaction_limits**
- Bảng giới hạn giao dịch trong PostgreSQL
- Fields: id, userId (unique), kycStatus, maxPerTransaction, maxPerDay, maxPerMonth, maxTransactionsPerDay, isActive, createdAt, updatedAt

**DR-023: blacklist**
- Bảng blacklist trong PostgreSQL
- Fields: id, type, value, reason, addedBy, isActive, expiresAt, createdAt, updatedAt
- Unique: (type, value)
- Indexes: (type, value, isActive)

**DR-024: audit_logs**
- Bảng audit log trong PostgreSQL
- Fields: id, userId, action, entityType, entityId, oldValue (JSON), newValue (JSON), changes (JSON), ipAddress, userAgent, reason, metadata (JSON), createdAt
- Relations: pledges, users
- Indexes: createdAt, (entityType, entityId), userId

**DR-025: conversations (MongoDB)**
- Collection hội thoại chat trong MongoDB
- Fields: _id, conversationKey, type, participants (array), participantIds (array), campaign (object), unreadCount (object), isActive, isReported, blockedBy (array), createdAt, updatedAt

**DR-026: messages (MongoDB)**
- Collection tin nhắn chat trong MongoDB
- Fields: _id, conversationId, senderId, senderName, senderAvatar, text, type, attachments (array), readBy (array), isDeleted, createdAt, updatedAt

**DR-027: chat_reports (MongoDB)**
- Collection báo cáo chat trong MongoDB
- Fields: _id, conversationId, messageId, reporterId, reason, description, status, createdAt, updatedAt

**DR-028: reviews**
- Bảng đánh giá trong PostgreSQL
- Fields: id, userId, campaignId, rating, comment, imageUrl, createdAt
- Relations: campaigns, users

**DR-029: projects**
- Bảng dự án trong PostgreSQL
- Fields: id, creatorId, title, description, createdAt, updatedAt
- Relations: users, campaigns, blog_posts
- Indexes: creatorId

### 3.4 Use case

| Actor | Use Case |
|-------|----------|
| **Guest** | UC-G-001: Xem danh sách chiến dịch |
| **Guest** | UC-G-002: Xem chi tiết chiến dịch |
| **Guest** | UC-G-003: Tìm kiếm chiến dịch |
| **Guest** | UC-G-004: Xem bài viết blog công khai |
| **Guest** | UC-G-005: Tìm kiếm người dùng |
| **Guest** | UC-G-006: Xem profile công khai user |
| **Guest** | UC-G-007: Đăng ký tài khoản |
| **Guest** | UC-G-008: Đăng nhập |
| **BACKER** | UC-B-001: ủng hộ chiến dịch |
| **BACKER** | UC-B-002: Theo dõi chiến dịch |
| **BACKER** | UC-B-003: Báo cáo chiến dịch vi phạm |
| **BACKER** | UC-B-004: Like bài viết blog |
| **BACKER** | UC-B-005: Bookmark bài viết blog |
| **BACKER** | UC-B-006: Bình luận bài viết blog |
| **BACKER** | UC-B-007: Chat với Creator |
| **BACKER** | UC-B-008: Đánh giá chiến dịch |
| **BACKER** | UC-B-009: Xem hồ sơ cá nhân |
| **BACKER** | UC-B-010: Chỉnh sửa hồ sơ cá nhân |
| **BACKER** | UC-B-011: Nâng cấp lên CREATOR_PENDING |
| **CREATOR_PENDING** | UC-CP-001: Nộp hồ sơ KYC |
| **CREATOR_PENDING** | UC-CP-002: Chờ duyệt KYC |
| **CREATOR** | UC-C-001: Tạo chiến dịch mới |
| **CREATOR** | UC-C-002: Chỉnh sửa chiến dịch DRAFT |
| **CREATOR** | UC-C-003: Nộp chiến dịch để duyệt |
| **CREATOR** | UC-C-004: Đăng cập nhật chiến dịch |
| **CREATOR** | UC-C-005: Tạo reward cho chiến dịch |
| **CREATOR** | UC-C-006: Quản lý rewards |
| **CREATOR** | UC-C-007: Viết bài viết blog |
| **CREATOR** | UC-C-008: Liên kết blog với chiến dịch |
| **CREATOR** | UC-C-009: Chat với Backer |
| **CREATOR** | UC-C-010: Hủy chiến dịch |
| **CREATOR** | UC-C-011: Xem thống kê chiến dịch |
| **ADMIN** | UC-A-001: Duyệt chiến dịch |
| **ADMIN** | UC-A-002: Duyệt KYC |
| **ADMIN** | UC-A-003: Duyệt bài viết blog |
| **ADMIN** | UC-A-004: Duyệt bình luận |
| **ADMIN** | UC-A-005: Khóa tài khoản |
| **ADMIN** | UC-A-006: Quản lý badges |
| **ADMIN** | UC-A-007: Gán badge cho user |
| **ADMIN** | UC-A-008: Thu hồi badge |
| **ADMIN** | UC-A-009: Xem thống kê doanh thu |
| **ADMIN** | UC-A-010: Xử lý báo cáo chiến dịch |
| **ADMIN** | UC-A-011: Xử lý báo cáo blog |
| **ADMIN** | UC-A-012: Xử lý báo cáo chat |
| **ADMIN** | UC-A-013: Xem audit log |

---

## 4. MA TRẬN TRUY VẾT (TRACEABILITY MATRIX)

| FR/NFR | TC-001 | TC-002 | TC-003 | TC-004 | TC-005 | TC-006 | TC-007 | TC-008 | TC-009 | TC-010 | ... | TC-088 |
|--------|--------|--------|--------|--------|--------|--------|--------|--------|--------|--------|-----|--------|
| FR-A-001 | ✅ | | | | | | | | | | | |
| FR-A-002 | | ✅ | ✅ | | | | | | | | | |
| FR-A-003 | | | | ✅ | | | | | | | | |
| FR-A-004 | | | | | ✅ | ✅ | | | | | | |
| FR-A-005 | | | | | | | ✅ | | | | | |
| FR-A-006 | | | | | | | | ✅ | | | | |
| FR-A-007 | | | | | | | | | ✅ | | | |
| FR-A-008 | | | | | | | | | | ✅ | | |
| FR-A-009 | | | | | | | | | | | ✅ | |
| FR-A-010 | | | | | | | | | | | | ✅ |
| FR-B-001 | ✅ | | | | | | | | | | | |
| FR-B-002 | | ✅ | | | | | | | | | | |
| FR-B-003 | | | ✅ | | | | | | | | | |
| FR-B-004 | | | | ✅ | ✅ | | | | | | | |
| FR-B-005 | | | | | | ✅ | ✅ | | | | | |
| FR-B-006 | | | | | | | | ✅ | | | | |
| FR-B-007 | | | | | | | | | ✅ | | | |
| FR-B-008 | | | | | | | | | | ✅ | | |
| FR-B-009 | | | | | | | | | | | ✅ | |
| FR-B-010 | | | | | | | | | | | | ✅ |
| FR-B-011 | ✅ | | | | | | | | | | | |
| FR-B-012 | | ✅ | | | | | | | | | | |
| FR-C-001 | | | ✅ | | | | | | | | | |
| FR-C-002 | | | | ✅ | | | | | | | | |
| FR-C-003 | | | | | ✅ | ✅ | | | | | | |
| FR-C-004 | | | | | | | ✅ | | | | | |
| FR-C-005 | | | | | | | | ✅ | | | | |
| FR-C-006 | | | | | | | | | ✅ | | | |
| FR-C-007 | | | | | | | | | | ✅ | | |
| FR-C-008 | | | | | | | | | | | ✅ | |
| FR-C-009 | | | | | | | | | | | | ✅ |
| FR-C-010 | ✅ | | | | | | | | | | | |
| FR-C-011 | | ✅ | | | | | | | | | | |
| FR-C-012 | | | ✅ | | | | | | | | | |
| FR-C-013 | | | | ✅ | | | | | | | | |
| FR-C-014 | | | | | ✅ | | | | | | | |
| FR-D-001 | ✅ | | | | | | | | | | | |
| FR-D-002 | | ✅ | ✅ | | | | | | | | | |
| FR-D-003 | | | | ✅ | | | | | | | | |
| FR-D-004 | | | | | ✅ | | | | | | | |
| FR-D-005 | | | | | | ✅ | | | | | | |
| FR-E-001 | ✅ | | | | | | | | | | | |
| FR-E-002 | | ✅ | | | | | | | | | | |
| FR-E-003 | | | ✅ | | | | | | | | | |
| FR-E-004 | | | | ✅ | | | | | | | | |
| FR-F-001 | ✅ | | | | | | | | | | | |
| FR-F-002 | | ✅ | | | | | | | | | | |
| FR-F-003 | | | ✅ | | | | | | | | | |
| FR-F-004 | | | | ✅ | ✅ | | | | | | | |
| FR-F-005 | | | | | | | ✅ | ✅ | | | | |
| FR-F-006 | | | | | | | | | ✅ | | | |
| FR-F-007 | | | | | | | | | | ✅ | | |
| FR-F-008 | | | | | | | | | | | ✅ | |
| FR-F-009 | | | | | | | | | | | | ✅ |
| FR-F-010 | ✅ | | | | | | | | | | | |
| FR-F-011 | | ✅ | | | | | | | | | | |
| FR-G-001 | ✅ | | | | | | | | | | | |
| FR-G-002 | | ✅ | | | | | | | | | | |
| FR-G-003 | | | ✅ | | | | | | | | | |
| FR-G-004 | | | | ✅ | | | | | | | | |
| FR-G-005 | | | | | ✅ | | | | | | | |
| FR-G-006 | | | | | | ✅ | | | | | | |
| FR-G-007 | | | | | | | ✅ | | | | | |
| FR-G-008 | | | | | | | | ✅ | | | | |
| FR-G-009 | | | | | | | | | ✅ | | | |
| FR-H-001 | ✅ | | | | | | | | | | | |
| FR-H-002 | | ✅ | | | | | | | | | | |
| FR-H-003 | | | ✅ | | | | | | | | | |
| FR-H-004 | | | | ✅ | | | | | | | | |
| FR-H-005 | | | | | ✅ | | | | | | | |
| FR-H-006 | | | | | | ✅ | ✅ | | | | | |
| FR-H-007 | | | | | | | | ✅ | | | | |
| FR-H-008 | | | | | | | | | ✅ | | | |
| FR-I-001 | ✅ | | | | | | | | | | | |
| FR-I-002 | | ✅ | | | | | | | | | | |
| FR-I-003 | | | ✅ | | | | | | | | | |
| FR-I-004 | | | | ✅ | | | | | | | | |
| FR-I-005 | | | | | ✅ | | | | | | | |
| FR-I-006 | | | | | | ✅ | | | | | | |
| FR-I-007 | | | | | | | ✅ | ✅ | | | | |
| FR-I-008 | | | | | | | | | ✅ | | | |
| FR-I-009 | | | | | | | | | | ✅ | | |
| FR-I-010 | | | | | | | | | | | ✅ | |
| FR-J-001 | ✅ | | | | | | | | | | | |
| FR-J-002 | | ✅ | | | | | | | | | | |
| FR-J-003 | | | ✅ | | | | | | | | | |
| FR-J-004 | | | | | ✅ | | | | | | | | |
| FR-J-005 | | | | | | ✅ | | | | | | | |
| FR-K-001 | ✅ | | | | | | | | | | | |
| FR-K-002 | | ✅ | | | | | | | | | | |
| FR-K-003 | | | ✅ | | | | | | | | | |
| FR-K-004 | | | | | ✅ | | | | | | | | |
| NFR-001 | ✅ | ✅ | | | | | | | | | | |
| NFR-002 | | | ✅ | | | | | | | | | |
| NFR-003 | | | | ✅ | | | | | | | | |
| NFR-004 | | | | | ✅ | | | | | | | |
| NFR-005 | | | | | | ✅ | | | | | | |
| NFR-006 | | | | | | | ✅ | | | | | |
| NFR-007 | | | | | | | | ✅ | | | | |
| NFR-008 | | | | | | | | | ✅ | | | |
| NFR-009 | | | | | | | | | | ✅ | ✅ | |
| NFR-010 | | | | | | | | | | | | ✅ |

**Ghi chú:** Ma trận trên là ví dụ. Test case cụ thể (TC-xxx) sẽ được mapping chi tiết trong tài liệu kiểm thử riêng.

---

## 5. PHỤ LỤC

### 5.1 Máy trạng thái chiến dịch (Campaign State Machine)

```
┌─────────────┐
│   DRAFT     │
└──────┬──────┘
       │ submit
       ▼
┌─────────────────┐
│ PENDING_REVIEW  │
└──────┬──────────┘
       │ approve
       ▼
┌─────────────┐
│   ACTIVE    │◄─────────────┐
└──────┬──────┘              │
       │                     │
       │ expire (success)    │ expire (failed)
       ▼                     │
┌─────────────┐              │
│  SUCCESS    │              │
└─────────────┘              │
                              │
                              ▼
                       ┌─────────────┐
                       │   FAILED    │
                       └─────────────┘

┌─────────────┐
│   DRAFT     │───── cancel ─────▶ CANCELED
└─────────────┘

┌─────────────────┐
│ PENDING_REVIEW  │───── reject ────▶ CANCELED
└─────────────────┘

┌─────────────┐
│   ACTIVE    │───── cancel ──────▶ CANCELED
└─────────────┘
```

**Chuyển trạng thái hợp lệ:**
- DRAFT → PENDING_REVIEW (submit)
- DRAFT → CANCELED (cancel)
- PENDING_REVIEW → ACTIVE (approve)
- PENDING_REVIEW → CANCELED (reject)
- ACTIVE → SUCCESS (expire, currentAmount >= goalAmount)
- ACTIVE → FAILED (expire, currentAmount < goalAmount)
- ACTIVE → CANCELED (cancel)

### 5.2 Máy trạng thái Pledge (Pledge State Machine)

```
┌─────────────┐
│   PENDING   │
└──────┬──────┘
       │ payment success
       ▼
┌─────────────┐
│  SUCCESS    │◄─────────────┐
└──────┬──────┘              │
       │                     │ refund
       │                     │
       ▼                     │
┌─────────────┐              │
│  REFUNDED   │              │
└─────────────┘              │
                              │
┌─────────────┐              │
│   PENDING   │──── timeout ──┘
└──────┬──────┘
       │ payment failed
       ▼
┌─────────────┐
│   FAILED    │
└─────────────┘
```

**Chuyển trạng thái hợp lệ:**
- PENDING → SUCCESS (webhook thanh toán thành công)
- PENDING → FAILED (webhook thanh toán thất bại hoặc timeout)
- PENDING → FAILED (cron cleanup-payments)
- SUCCESS → REFUNDED (refund khi campaign FAILED/CANCELED hoặc refund request)

### 5.3 Máy trạng thái KYC (KYC State Machine)

```
┌─────────────┐
│   PENDING   │
└──────┬──────┘
       │ approve
       ▼
┌─────────────┐
│  VERIFIED   │◄─────────────┐
└──────┬──────┘              │
       │                     │ expire
       │                     │
       ▼                     │
┌─────────────┐              │
│   EXPIRED   │              │
└──────┬──────┘              │
       │                     │
       │ resubmit            │
       └─────────────────────┘

┌─────────────┐
│   PENDING   │──── reject ────▶ REJECTED
└─────────────┘

┌─────────────┐
│  REJECTED   │──── resubmit ───▶ PENDING
└─────────────┘

┌─────────────┐
│   EXPIRED   │──── resubmit ────▶ PENDING
└─────────────┘
```

**Chuyển trạng thái hợp lệ:**
- PENDING → VERIFIED (admin approve)
- PENDING → REJECTED (admin reject)
- REJECTED → PENDING (resubmit)
- VERIFIED → EXPIRED (expire theo thời gian)
- EXPIRED → PENDING (resubmit)

### 5.4 Enum Definitions

**UserRole:** ADMIN, BACKER, CREATOR_PENDING, CREATOR

**UserStatus:** NORMAL, PRO, BANNED

**CampaignType:** REWARD, DONATION

**CampaignStatus:** DRAFT, PENDING_REVIEW, ACTIVE, SUCCESS, FAILED, CANCELED

**CampaignReportReason:** FRAUD, INAPPROPRIATE, MISLEADING, SCAM, INTELLECTUAL_PROPERTY, OTHER

**PledgeStatus:** PENDING, SUCCESS, FAILED, REFUNDED

**RefundStatus:** NO_REFUND, REQUESTED, PROCESSING, COMPLETED, FAILED

**KYCStatus:** PENDING, VERIFIED, REJECTED, EXPIRED

**IDCardType:** CMND, CCCD, PASSPORT

**RiskLevel:** LOW, MEDIUM, HIGH, CRITICAL

**InvoiceStatus:** PENDING, PAID, OVERDUE, CANCELLED

**BadgeType:** custom, achievement

**BadgeRarity:** common, rare, epic, legendary

**BlogPostStatus:** DRAFT, PENDING_REVIEW, PUBLISHED, ARCHIVED, REJECTED

**BlogPostType:** PLATFORM, CAMPAIGN_UPDATE, ANNOUNCEMENT, STORY, IMPACT_REPORT

**BlogVisibility:** PUBLIC, BACKERS_ONLY, OWNER_ONLY, PRIVATE

**BlogCommentStatus:** VISIBLE, HIDDEN, DELETED, PENDING_REVIEW

**BlogReportReason:** SPAM, ABUSE, MISINFORMATION, SCAM, INAPPROPRIATE, OTHER

**ReportStatus:** PENDING, REVIEWING, RESOLVED, DISMISSED

**BlacklistType:** IP, EMAIL, PHONE, BANK_ACCOUNT, DEVICE_ID

**AuditAction:** CREATE, UPDATE, DELETE, REFUND, APPROVE, REJECT, CANCEL, LOGIN, LOGOUT, KYC_SUBMIT, KYC_APPROVE, KYC_REJECT

---

**KẾT THÚC TÀI LIỆU**
