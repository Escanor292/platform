# 📚 TỬ TẾ FUND - NỀN TẢNG CROWDFUNDING VIỆT NAM

**TửTế Fund** là một nền tảng gọi vốn cộng đồng (crowdfunding) hiện đại, minh bạch và an toàn, được thiết kế dành riêng cho thị trường Việt Nam. Hệ thống cho phép các nhà sáng tạo (Creators) hiện thực hóa ý tưởng và những nhà tài trợ (Backers) ủng hộ các dự án ý nghĩa thông qua quy trình thanh toán trực tuyến tiện lợi.

---

## 🚀 Trạng thái dự án
- **Phiên bản:** 1.0.0 (Production Ready)
- **Tính năng cốt lõi:** ✅ Hoàn thành 100%
- **Hệ thống kiểm thử:** ✅ 88 test cases (100% Pass)
- **Triển khai:** Vercel (Next.js 15)

---

## 🏗️ Kiến trúc & Công nghệ

### 💻 Stack công nghệ
- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend:** Next.js API Routes, Server Actions.
- **Xác thực:** NextAuth.js 5.0 (JWT & Session).
- **Cơ sở dữ liệu:** 
  - **PostgreSQL (Prisma ORM):** Lưu trữ dữ liệu quan hệ (Users, Campaigns, Pledges, Invoices).
  - **MongoDB:** Lưu trữ dữ liệu phi cấu trúc và hiệu năng cao (Blog Content, Chat Messages, Audit Logs).
- **Thanh toán:** Tích hợp **PayOS** (VietQR), hỗ trợ Webhook và xác minh chữ ký an toàn.
- **Lưu trữ:** **Cloudinary** (Ảnh đại diện, Ảnh chiến dịch, Blog media).

### 📐 Mô hình kiến trúc
Hệ thống sử dụng kiến trúc **Hybrid Database** để tối ưu hóa giữa tính nhất quán (PostgreSQL) và tính linh hoạt/tốc độ (MongoDB).

---

## ✨ Các tính năng chính

### 1. Quản lý Chiến dịch (Campaigns)
- **Tạo & Quản lý:** Quy trình tạo chiến dịch chuyên nghiệp với trạng thái (Draft, Pending Review, Active, Success, Failed).
- **Phần thưởng (Rewards):** Thiết lập nhiều mức ủng hộ với các phần thưởng tương ứng.
- **Cập nhật:** Đăng tải tiến độ dự án dưới dạng blog/update để tương tác với Backers.

### 2. Hệ thống Thanh toán & Ủng hộ
- **Thanh toán QR:** Tích hợp PayOS cho phép thanh toán qua ngân hàng cực nhanh.
- **Ủng hộ ẩn danh:** Lựa chọn ẩn danh tính khi quyên góp.
- **Hóa đơn điện tử:** Tự động tạo và gửi hóa đơn (PDF) cho người ủng hộ qua email.
- **Hoàn tiền:** Quy trình quản lý yêu cầu hoàn tiền minh bạch cho Admin.

### 3. Blog System (Hybrid Storage)
- **Soạn thảo Rich Text:** Tích hợp **Tiptap Editor** hỗ trợ định dạng văn bản chuyên nghiệp, chèn ảnh/video.
- **Phân quyền đăng bài:**
    - **Admin/Creator:** Đăng bài không giới hạn.
    - **User/Backer:** Đăng bài dưới dạng chờ duyệt (Pending Review).
- **Ảnh bìa:** Hỗ trợ tải ảnh trực tiếp từ máy tính lên Cloudinary.
- **Visibility:** Cấu hình quyền xem (Public, Backers Only, Private).

### 4. Hệ thống Huy hiệu (Badge System)
- **Huy hiệu Thành tựu:** Tự động hoặc Admin cấp cho User dựa trên đóng góp.
- **Phân loại:** Common, Rare, Epic, Legendary với màu sắc và icon tùy chỉnh.
- **Hiển thị:** Huy hiệu xuất hiện trên Profile, Blog và Chat để khẳng định uy tín.

### 5. Chat 1-1 (Real-time Experience)
- **Kết nối trực tiếp:** Backer có thể nhắn tin hỏi đáp trực tiếp với chủ chiến dịch.
- **Lưu trữ MongoDB:** Đảm bảo tốc độ load tin nhắn nhanh và không làm nặng database chính.
- **Tính năng:** Thông báo tin nhắn chưa đọc, chặn/báo cáo người dùng vi phạm.

### 6. Quản trị & Bảo mật (Admin Dashboard)
- **Dashboard:** Thống kê doanh thu, tỷ lệ thành công và tăng trưởng người dùng.
- **Kiểm duyệt:** Phê duyệt chiến dịch, xác minh danh tính (KYC) và xử lý báo cáo vi phạm.
- **Audit Log:** Ghi lại mọi hành động nhạy cảm của Admin và người dùng để truy vết.
- **An toàn:** Chống SQL Injection, XSS (DOMPurify), và Rate Limiting.

---

## 🗄️ Cấu trúc Database (Sơ lược)

### PostgreSQL (Prisma)
- `User`: Thông tin tài khoản, vai trò (ADMIN, CREATOR, BACKER).
- `Campaign`: Thông tin dự án, mục tiêu, thời hạn.
- `Pledge`: Bản ghi ủng hộ, mã giao dịch, trạng thái thanh toán.
- `Reward`: Danh mục quà tặng theo mức ủng hộ.
- `KYCInfo`: Dữ liệu xác minh danh tính người dùng.

### MongoDB
- `blog_contents`: Nội dung bài viết định dạng JSON (Tiptap).
- `chat_messages`: Nội dung tin nhắn giữa các người dùng.
- `audit_logs`: Lịch sử hệ thống chi tiết.

---

## 🛠️ Cài đặt & Phát triển

### 1. Cài đặt môi trường
```bash
npm install
```

### 2. Cấu hình biến môi trường (.env)
Tạo file `.env` dựa trên `.env.example` với các khóa sau:
- `DATABASE_URL` (PostgreSQL)
- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### 3. Khởi tạo Database
```bash
npx prisma db push
npm run blog:init
npm run chat:init
```

### 4. Chạy dự án
```bash
npm run dev
```

---

## 🧪 Kiểm thử (Testing)
Hệ thống đi kèm bộ test toàn diện:
```bash
npm run test          # Chạy toàn bộ test suite
npm run test:coverage # Xem tỷ lệ bao phủ code (>90%)
```

---

## 📞 Liên hệ & Hỗ trợ
- **Nhóm thực hiện:** Nhóm 5 - Lớp 23CT113 (Đại học Lạc Hồng).
- **Thành viên:** Nguyễn Quách Phú Tài, Trần Xuân Ân, Bùi Đặng Quốc Khánh.
- **Giảng viên hướng dẫn:** Lương Trường An.

---

**TửTế Fund - Lấy sự tử tế trồng tương lai.** 🚀
