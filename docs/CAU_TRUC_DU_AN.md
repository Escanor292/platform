# CẤU TRÚC VÀ PHÂN TÍCH DỰ ÁN CROWDFUNDING-VN

## I. Tổng Quan Dự Án
**Crowdfunding-VN** là nền tảng gọi vốn cộng đồng dành cho thị trường Việt Nam. Dự án được xây dựng với kiến trúc hiện đại, kết hợp giữa RDBMS (PostgreSQL/MySQL qua Prisma ORM) và NoSQL (MongoDB cho tính năng chat/log real-time), cùng các tích hợp thanh toán ngân hàng (SePay/PayOS).

* **Framework chính:** Next.js (App Router, React 19 / Next 15)
* **Ngôn ngữ:** TypeScript
* **Database & ORM:** Prisma ORM (Relational DB) + MongoDB Native Client (NoSQL)
* **Styling:** Tailwind CSS + Radix UI / Shadcn UI components
* **Cổng thanh toán:** SePay (QR Banking), PayOS
* **Xác thực:** NextAuth.js / Custom Auth Middleware

---

## II. Sơ Đồ Cây Cấu Trúc Thư Mục (Project Tree)

```text
crowdfunding-vn/
├── docs/                       # Tài liệu thiết kế, kiến trúc hệ thống, báo cáo & hướng dẫn
├── prisma/                     # Cấu hình Prisma ORM & Database Schema
│   ├── schema.prisma           # Cấu trúc bảng SQL (User, Campaign, Pledge, Transaction, v.v.)
│   └── migrations/             # Lịch sử các bản migration cơ sở dữ liệu
├── public/                     # Tài nguyên tĩnh (Hình ảnh, Logo, Icons, Fonts)
├── scripts/                    # Scripts CLI hỗ trợ seed dữ liệu, bảo trì & test hệ thống
├── __tests__/                  # Bộ kiểm thử tự động (Unit test, Integration test)
├── src/                        # MÃ NGUỒN CHÍNH CỦA ỨNG DỤNG
│   ├── app/                    # Next.js App Router (Pages, Layouts, API Routes)
│   │   ├── (marketing)/        # Các trang Landing Page, Marketing
│   │   ├── admin/              # Trang quản trị hệ thống (Admin Dashboard)
│   │   ├── api/                # Các endpoint Backend (RESTful APIs)
│   │   │   ├── admin/          # API dành cho Quản trị viên
│   │   │   ├── auth/           # API đăng ký, đăng nhập, quên mật khẩu
│   │   │   ├── campaigns/      # API tạo, sửa, xóa, duyệt dự án gọi vốn
│   │   │   ├── chat/           # API tin nhắn & cuộc trò chuyện
│   │   │   ├── kyc/            # API xác minh danh tính Creator
│   │   │   ├── payment/        # API thanh toán & Webhook (SePay, PayOS)
│   │   │   ├── profile/        # API quản lý hồ sơ cá nhân
│   │   │   ├── projects/       # API thông tin dự án chi tiết
│   │   │   ├── rewards/        # API gói phần thưởng ủng hộ
│   │   │   └── users/          # API quản lý người dùng
│   │   ├── auth/               # Trang Đăng nhập / Đăng ký / Xác thực
│   │   ├── blog/               # Trang tin tức, bài viết cập nhật dự án
│   │   ├── campaigns/          # Trang danh sách & chi tiết chiến dịch gọi vốn
│   │   ├── chat/               # Giao diện trò chuyện real-time
│   │   ├── dashboard/          # Bảng điều khiển dành cho Nhà sáng tạo (Creator)
│   │   ├── gioi-thieu/         # Trang giới thiệu về nền tảng
│   │   ├── lookup/             # Trang tra cứu giao dịch & ủng hộ
│   │   ├── payment-success/    # Trang thông báo thanh toán thành công
│   │   ├── policy/             # Trang điều khoản & chính sách bảo mật
│   │   ├── profile/            # Trang cá nhân của người dùng
│   │   ├── upgrade/            # Trang nâng cấp tài khoản lên Creator/Pro
│   │   ├── globals.css         # CSS toàn cục (Tailwind Directives)
│   │   └── layout.tsx          # Root Layout toàn dự án
│   ├── components/             # Các UI Components tái sử dụng
│   │   ├── admin/              # Components dành cho giao diện Admin
│   │   ├── badge/              # Huy hiệu danh dự, danh hiệu nhà đầu tư
│   │   ├── blog/               # Components danh sách & chi tiết bài viết
│   │   ├── campaign/           # Components chi tiết chiến dịch (Progress bar, Form ủng hộ)
│   │   ├── campaigns/          # Cards dự án, bộ lọc dự án
│   │   ├── chat/               # Hộp thoại chat, danh sách tin nhắn
│   │   ├── create-campaign/    # Form nhiều bước (Multi-step form) tạo dự án mới
│   │   ├── dashboard/          # Thống kê, biểu đồ cho Creator Dashboard
│   │   ├── editor/             # Trình soạn thảo văn bản phong phú (Rich Text Editor)
│   │   ├── layout/             # Header, Navbar, Footer, Sidebar
│   │   ├── payment/            # Modal thanh toán, QR code SePay/PayOS
│   │   ├── profile/            # Form chỉnh sửa cá nhân, danh sách dự án đã tạo/đã ủng hộ
│   │   ├── shared/             # Components chia sẻ (Modal, Toast, Loading Spinner)
│   │   └── ui/                 # UI Primitives cơ bản (Button, Input, Card, Dialog, Badge,...)
│   ├── contexts/               # React Context Providers (Auth, Notification, Socket)
│   ├── hooks/                  # Custom React Hooks (useAuth, useCampaign, useDebounce,...)
│   ├── lib/                    # Các module tiện ích & Kết nối tích hợp
│   │   ├── actions/            # Next.js Server Actions
│   │   ├── audit.ts            # Ghi log nhật ký hoạt động hệ thống
│   │   ├── auth.ts             # Cấu hình xử lý Authentication & Tokens
│   │   ├── kyc.ts              # Xử lý quy trình xác minh identity
│   │   ├── mongodb.ts          # Kết nối MongoDB client
│   │   ├── prisma.ts           # Singleton Prisma Client kết nối SQL DB
│   │   ├── invoice-generator.ts# Tiện ích tạo hóa đơn tự động
│   │   ├── campaign-utils.ts   # Helper tính phần trăm tiến độ, thời hạn gọi vốn
│   │   └── payment/            # Cấu hình & Handler tích hợp SePay/PayOS
│   ├── middleware/             # Các middleware hỗ trợ
│   ├── services/               # Tầng giao tiếp API & MongoDB Data Services
│   ├── types/                  # Khai báo TypeScript Interfaces & Types
│   ├── auth.config.ts          # Cấu hình phân quyền & router protection
│   └── middleware.ts           # Next.js Middleware kiểm tra quyền truy cập route
├── .env.example                # File cấu hình biến môi trường mẫu
├── deploy.sh                   # Script triển khai tự động lên server
├── jest.config.js              # Cấu hình Jest cho Unit Test
├── next.config.ts              # Cấu hình framework Next.js
├── package.json                # Định nghĩa thư viện & lệnh chạy (scripts)
├── tailwind.config.ts          # Cấu hình giao diện Tailwind CSS
├── tsconfig.json               # Cấu hình trình biên dịch TypeScript
└── vercel.json                 # Cấu hình Deployment trên Vercel
```

---

## III. Mô Tả Chi Tiết Chức Năng Nổi Bật Theo Thư Mục

### 1. `src/app/` (Next.js App Router - Routing & APIs)
* **`api/`**: Chứa toàn bộ các RESTful API endpoints xử lý phía Server.
  * `api/campaigns`: Quản lý các dự án gọi vốn (CRUD, tìm kiếm, lọc theo thể loại).
  * `api/payment` & `api/payments`: Xử lý tạo link thanh toán, tạo mã QR ngân hàng và nhận **Webhook** xác nhận tiền về từ SePay/PayOS để cập nhật số tiền gọi vốn tức thì.
  * `api/chat`: Xử lý lưu trữ và gửi/nhiệt tin nhắn giữa nhà đầu tư và creator.
  * `api/kyc`: Tiếp nhận tài liệu xác minh danh tính người tạo dự án (CMND/CCCD, giấy phép).
  * `api/admin`: Các API đặc quyền kiểm duyệt dự án, khóa tài khoản, báo cáo doanh thu.
* **`campaigns/` & `projects/`**: Giao diện hiển thị danh sách các chiến dịch đang gọi vốn, trang chi tiết từng dự án (nội dung, hình ảnh, tiến độ %, danh sách quà đáp lễ - rewards).
* **`dashboard/` & `admin/`**: Bảng điều khiển quản trị giúp Creator theo dõi số tiền gọi vốn, quản lý người ủng hộ (backers), và giúp Admin kiểm duyệt chiến dịch trước khi công khai.
* **`auth/`**: Đăng nhập, đăng ký tài khoản (Hỗ trợ người dùng thông thường và Creator).

### 2. `src/components/` (Tầng Giao Diện UI)
* **`ui/`**: Các thành phần UI cơ bản chuẩn hóa (Design System), bao gồm nút bấm, ô nhập liệu, hộp thoại modal, tab, dropdown,...
* **`create-campaign/`**: Bộ form nhiều bước hướng dẫn Creator điền thông tin dự án, mục tiêu tài chính, thời gian gọi vốn, các gói quà đáp lễ (Rewards) và tài liệu pháp lý.
* **`payment/`**: Giao diện hiển thị phương thức thanh toán, mã QR quét chuyển khoản ngân hàng qua SePay/PayOS, hiển thị đếm ngược thời gian thanh toán và trạng thái thành công.
* **`chat/`**: Giao diện tin nhắn giúp nhà đầu tư trực tiếp trao đổi với chủ dự án.

### 3. `src/lib/` (Tầng Xử Lý Logic & Kết Nối)
* **`prisma.ts` & `mongodb.ts`**: Đảm bảo khởi tạo kết nối Database duy nhất (Singleton pattern), tránh tràn connection.
* **`payment/`**: Module tích hợp cổng thanh toán, xử lý tạo mã thanh toán duy nhất (checksum, signature verification), tự động kiểm tra cú pháp chuyển khoản để khớp đơn ủng hộ.
* **`campaign-helpers.ts` / `campaign-filters.ts`**: Các hàm tính toán số ngày còn lại, phần trăm hoàn thành chỉ tiêu gọi vốn, lọc dự án theo chuyên mục (Công nghệ, Nghệ thuật, Cộng đồng,...).
* **`invoice-generator.ts`**: Tự động xuất biên nhận/hóa đơn điện tử khi ủng hộ thành công.

### 4. `prisma/` (Cơ Sở Dữ Liệu SQL)
* **`schema.prisma`**: Mô hình hóa toàn bộ dữ liệu chính của hệ thống:
  * `User`: Người dùng, Creator, Admin, trạng thái KYC.
  * `Campaign`: Dự án gọi vốn, mục tiêu (target amount), số tiền hiện tại (current amount), trạng thái (DRAFT, PENDING, APPROVED, SUCCESS, FAILED).
  * `Pledge` / `Transaction`: Thông tin các lượt ủng hộ, gói phần thưởng đã chọn, lịch sử thanh toán.
  * `Reward`: Các mức quà đáp lễ dành cho người ủng hộ.
  * `Badge`: Huy hiệu thưởng cho các nhà đầu tư tích cực.

### 5. `docs/` & `scripts/` (Tài Liệu & Đồ Án Hỗ Trợ)
* **`docs/`**: Chứa hơn 50+ tài liệu phân tích chi tiết về sơ đồ DB, tích hợp SePay/PayOS, kết quả kiểm thử, quy trình Git & CI/CD.
* **`scripts/`**: Các script hữu ích bằng TypeScript/JavaScript dùng để nạp dữ liệu mẫu (`seed-campaigns.ts`), tạo tài khoản Admin thử nghiệm, kiểm tra kết nối MongoDB/PostgreSQL.

---

## IV. Luồng Hoạt Động Cốt Lõi (Core Workflow)

1. **Luồng Tạo Dự Án (Creator):**
   `Trang Create Campaign` ➔ `Nhập thông tin & Reward` ➔ `Nộp KYC` ➔ `Gửi duyệt (PENDING)` ➔ `Admin duyệt (APPROVED)` ➔ `Công khai gọi vốn`.

2. **Luồng Úng Hộ Dự Án (Backer):**
   `Xem chi tiết Campaign` ➔ `Chọn gói Reward / Ủng hộ tùy tâm` ➔ `Tạo đơn thanh toán (Pledge)` ➔ `Hiển thị QR SePay/PayOS` ➔ `Người dùng quét mã chuyển khoản` ➔ `Webhook SePay bắn về API` ➔ `Hệ thống xác thực & cộng tiền vào Campaign` ➔ `Gửi thông báo & Xuất hóa đơn`.
