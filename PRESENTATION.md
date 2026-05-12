# Cấu Trúc Thuyết Trình Đồ Án: Nền Tảng Crowdfunding VN

**Thông tin dự án:** Ứng dụng Web Gọi vốn cộng đồng (Crowdfunding)  
**Công nghệ sử dụng:** Next.js, React, Tailwind CSS, Prisma (PostgreSQL), MongoDB, NextAuth, VNPay, PayOS.

---

## Slide 1: Tiêu đề (Mở đầu)
- **Tiêu đề chính:** Nền tảng Gọi vốn cộng đồng (Crowdfunding Web Application)
- **Tiêu đề phụ:** Xây dựng hệ thống kết nối nhà sáng tạo và nhà tài trợ với kiến trúc Hybrid Database
- **Thông tin:** Tên nhóm / Người trình bày / Giảng viên hướng dẫn
- **Gợi ý:** Sử dụng logo dự án hoặc hình ảnh minh họa về cộng đồng và startup.

## Slide 2: Giới thiệu Crowdfunding
- **Crowdfunding là gì?** Là hình thức huy động vốn từ một số lượng lớn người dùng thông qua internet.
- **Mục tiêu của nền tảng:** Làm cầu nối an toàn, minh bạch giữa người có ý tưởng (Project Creator) và người muốn tài trợ/đầu tư (Backer).
- **Các mô hình crowdfunding:** Reward-based (Dựa trên phần thưởng), Donation (Từ thiện).

## Slide 3: Vấn Đề Thực Tế
- **Các khó khăn hiện nay:**
  - Startup khó tiếp cận nhà đầu tư truyền thống.
  - Các nền tảng hiện tại thiếu minh bạch hoặc quy trình gọi vốn quá phức tạp.
  - Người dùng khó tìm kiếm và xác thực các dự án uy tín.
  - Cổng thanh toán quốc tế có rào cản với người dùng Việt.
- **Ví dụ thực tế:** Kickstarter, GoFundMe rất thành công ở nước ngoài, nhưng thị trường VN cần một nền tảng tối ưu hóa cho người Việt.

## Slide 4: Mục Tiêu Đề Tài
- **Hệ thống cần đạt được:**
  - Cho phép tạo chiến dịch gọi vốn với nội dung phong phú (Rich Text, Video).
  - Hỗ trợ thanh toán online tiện lợi qua các cổng nội địa (VNPay, PayOS).
  - Quản lý người dùng, phân quyền chặt chẽ.
  - Theo dõi tiến độ dự án real-time (tự động cập nhật quỹ).
  - Ứng dụng kiến trúc cơ sở dữ liệu linh hoạt và hiệu năng cao.

## Slide 5: Đối Tượng Người Dùng (Actors)
- **Nhà sáng tạo dự án (Project Creator):** Đăng tải ý tưởng, thiết lập phần thưởng, cập nhật tiến độ.
- **Nhà tài trợ (Backer / Investor):** Đóng góp tiền, theo dõi dự án, nhận phần thưởng.
- **Quản trị viên (Admin):** Kiểm duyệt dự án, quản lý người dùng, thống kê báo cáo.
- **Gợi ý:** Dùng sơ đồ Use Case đơn giản để minh họa.

## Slide 6: Chức Năng Chính
- **Người dùng / Khách:** Đăng ký / đăng nhập, Tìm kiếm & Xem chi tiết dự án, Tài trợ (Donate).
- **Chủ dự án:** Tạo chiến dịch (thêm mô tả, ảnh, video), Cập nhật trạng thái, Quản lý các gói phần thưởng, Theo dõi số tiền nhận được.
- **Admin:** Duyệt dự án trước khi public, Quản lý tài khoản, Báo cáo hệ thống.

## Slide 7: Kiến Trúc Hệ Thống & Công Nghệ
- **Giới thiệu mô hình:** Tách biệt Frontend UI, API Serverless và Hybrid Database.
- **Công nghệ cốt lõi:**
  - **Frontend:** Next.js 15, React 19, Tailwind CSS, Framer Motion (cho UI/UX động).
  - **Backend:** Next.js API Routes.
  - **Database (Kiến trúc Hybrid):** 
    - **PostgreSQL (qua Prisma):** Lưu trữ dữ liệu quan hệ cốt lõi (User, Auth, Transactions chặt chẽ).
    - **MongoDB:** Lưu trữ dữ liệu phi cấu trúc, nhật ký (audit logs), nội dung mở rộng của chiến dịch để tăng hiệu năng đọc/ghi.
  - **Authentication:** NextAuth.js.
  - **Payment Gateway:** VNPay & PayOS.
  - **Lưu trữ Media:** Cloudinary.

## Slide 8: Sơ Đồ Kiến Trúc
- **Luồng hoạt động:** 
  `Client` ➔ `Next.js Server (Frontend + API)` ➔ `PostgreSQL (Dữ liệu chính)` & `MongoDB (Dữ liệu phi cấu trúc)`.
  - Kết nối với `VNPay/PayOS API` để thanh toán.
  - Kết nối với `Cloudinary` để lưu ảnh.
- **Gợi ý:** Vẽ sơ đồ hiển thị rõ kiến trúc Hybrid Database (Sử dụng song song cả 2 loại DB).

## Slide 9: Thiết Kế Database (Kiến trúc Hybrid)
- **PostgreSQL (Relational):**
  - Bảng `Users`, `Projects`, `Donations`, `Categories`, `Transactions`.
  - Đảm bảo tính toàn vẹn dữ liệu (ACID) cho tài chính và người dùng.
- **MongoDB (NoSQL):**
  - Collection lưu trữ `Audit Logs` (Lịch sử thao tác).
  - Các cấu hình tính năng (Feature flags) và siêu dữ liệu không cố định.
- **Gợi ý:** Nên có một ERD (Sơ đồ thực thể) cho PostgreSQL và giải thích lý do tại sao dùng thêm MongoDB.

## Slide 10: Quy Trình Hoạt Động (Business Flow)
- **Flow cơ bản:**
  1. Người dùng đăng ký tài khoản.
  2. Tạo dự án gọi vốn ➔ Admin xét duyệt.
  3. Dự án public ➔ Nhà tài trợ chọn gói và thanh toán qua VNPay/PayOS.
  4. Hệ thống xác nhận giao dịch ➔ Tự động cập nhật số dư dự án.
- **Gợi ý:** Sử dụng Flowchart để minh họa.

## Slide 11: Giao Diện Hệ Thống
- **Screenshots nổi bật:**
  - Trang chủ (Hero banner, danh sách dự án nổi bật).
  - Trang chi tiết dự án (Hiển thị video, tiến độ quỹ, các gói phần thưởng).
  - Dashboard quản lý (Biểu đồ thống kê, quản lý chiến dịch).
  - Trang tích hợp cổng thanh toán.

## Slide 12: Demo Chức Năng
- **Luồng Demo:**
  - Tạo một dự án mới.
  - Đăng nhập tài khoản Backer và Donate qua cổng thanh toán (dùng thẻ test).
  - Theo dõi tiến độ quỹ thay đổi.
  - (Chuẩn bị Video dự phòng nếu sợ lỗi mạng khi thuyết trình).

## Slide 13: Bảo Mật Hệ Thống
- Session Management & OAuth với NextAuth.js.
- Mã hóa mật khẩu an toàn với Bcrypt.
- Xác thực thanh toán bằng chữ ký số (Checksum/Signature) từ VNPay/PayOS.
- Bảo vệ API Route (Middleware validation).
- Tách biệt dữ liệu nhạy cảm bằng kiến trúc Hybrid Database.

## Slide 14: Kết Quả Đạt Được
- Xây dựng thành công ứng dụng với kiến trúc Next.js Fullstack hiện đại.
- Áp dụng thành công mô hình **Hybrid Database (PostgreSQL + MongoDB)** để tối ưu cả tính nhất quán và hiệu năng.
- UI/UX chuyên nghiệp, Responsive 100%.
- Tích hợp thanh toán nội địa mượt mà.

## Slide 15: Hạn Chế
- Chưa tích hợp AI để phân tích và gợi ý dự án tự động.
- Chưa có ứng dụng Mobile Native (iOS/Android).
- Chưa hỗ trợ ví tiền điện tử / Blockchain.

## Slide 16: Hướng Phát Triển
- Nghiên cứu tích hợp AI Recommendation.
- Ứng dụng Blockchain (Smart Contract) để minh bạch hóa mọi giao dịch, tiền được giữ trong Smart Contract cho đến khi dự án đạt tiến độ.
- Xây dựng Mobile App.

## Slide 17: Kết Luận
- **Tóm tắt đề tài:** Giải quyết được bài toán kết nối nhà tài trợ và startup tại Việt Nam.
- **Ý nghĩa thực tiễn:** Tạo ra một nền tảng chuyên nghiệp, thúc đẩy sự sáng tạo của cộng đồng.
- **Kỹ năng học được:** Khả năng áp dụng kiến trúc phức tạp (Hybrid DB), tích hợp API bên thứ ba, và thiết kế UI/UX hiện đại.
