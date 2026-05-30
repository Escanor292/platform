# 🎤 HƯỚNG DẪN THUYẾT TRÌNH & NỘI DUNG SLIDE

Tài liệu này tổng hợp cấu trúc bài thuyết trình và nội dung chi tiết cho từng slide của dự án **TửTế Fund**.

---

## 📋 Thông tin chung
- **Tên đề tài:** CROWDFUNDING PLATFORM - TửTế Fund
- **Môn học:** Lập trình ứng dụng web
- **Giảng viên hướng dẫn:** Lương Trường An
- **Nhóm thực hiện:** Nhóm 5
- **Thành viên:** 
    - Nguyễn Quách Phú Tài (123000609)
    - Trần Xuân Ân (123001127)
    - Bùi Đặng Quốc Khánh (123001005)

---

## 📑 Cấu trúc Slide (13-15 Slide)

### Slide 1: Cover Slide
- **Tiêu đề:** CROWDFUNDING PLATFORM
- **Nội dung:** Tên trường, khoa, thông tin nhóm và giảng viên.
- **Thông điệp:** "Lấy sự tử tế trồng tương lai".

### Slide 2: Agenda (Nội dung trình bày)
1. Giới thiệu và bối cảnh.
2. Mục tiêu và phạm vi.
3. Phương pháp thực hiện.
4. Kiến trúc hệ thống & Công nghệ.
5. Triển khai và kết quả (Demo).
6. Kiểm thử và kết luận.

### Slide 3: Giới thiệu & Bối cảnh
- **Vấn đề:** Các startup và dự án cộng đồng tại Việt Nam khó tiếp cận nguồn vốn. Nhu cầu minh bạch trong quyên góp từ thiện.
- **Giải pháp:** Xây dựng nền tảng nội địa, tích hợp thanh toán dễ dàng, quy trình xác minh chặt chẽ.

### Slide 4: Mục tiêu & Phạm vi
- **Mục tiêu:** Xây dựng web fullstack hiện đại, hỗ trợ thanh toán QR, quản lý chiến dịch chuyên nghiệp.
- **Phạm vi:** Tập trung vào nền tảng Web Responsive (Next.js), tích hợp PayOS, xác minh KYC.

### Slide 5: Phương pháp thực hiện
- **Mô hình:** Agile Development, MVC Architecture.
- **Quy trình:** Phân tích ➔ Thiết kế DB ➔ Phát triển Backend/Frontend ➔ Tích hợp Thanh toán ➔ Kiểm thử ➔ Triển khai.

### Slide 6: Kiến trúc hệ thống (Hybrid Database)
- **Mô hình:** Client (Next.js) ➔ Server (API Routes) ➔ Hybrid DB.
- **Điểm nhấn:** 
    - **PostgreSQL:** Dữ liệu quan hệ (Tài chính, User).
    - **MongoDB:** Dữ liệu phi cấu trúc (Nội dung blog, Chat, Logs).

### Slide 7: Triển khai kỹ thuật & Công nghệ
- **Next.js 15, React 19, TypeScript.**
- **Prisma, NextAuth, PayOS SDK, Cloudinary.**
- **Tiptap Editor** (Rich Text).

### Slide 8: Thiết kế Cơ sở dữ liệu (ERD)
- Giải thích các thực thể chính: User, Campaign, Pledge, Reward, Blog.
- Mối quan hệ giữa Creator - Campaign và Backer - Pledge.

### Slide 9: Kết quả thực hiện & Demo
- Hiển thị các tính năng đã hoàn thành 100%.
- Screenshot các trang chính: Home, Campaign Detail, Admin Dashboard.

### Slide 10: Kiểm thử & Đánh giá (Testing)
- **Thông số:** 88 test cases, 100% Pass Rate.
- **Code Coverage:** >90%.
- **Hiệu năng:** Page load < 3s, Lighthouse Score > 90.

### Slide 11: Thảo luận & Hạn chế
- **Khó khăn:** Tích hợp Webhook đồng bộ trạng thái thanh toán.
- **Hạn chế:** Chưa có Mobile App native, chưa tích hợp AI gợi ý dự án.

### Slide 12: Kết luận & Hướng phát triển
- **Kết luận:** Dự án đạt 100% mục tiêu, sẵn sàng cho thực tế.
- **Phát triển:** Mobile App, AI Fraud Detection, Blockchain Transparency.

### Slide 13: Q&A
- Lời cảm ơn và mời đặt câu hỏi.

---

## 🛠️ Checklist chuẩn bị Demo
1. Đảm bảo server local hoặc staging đang chạy ổn định.
2. Chuẩn bị tài khoản: Admin, Creator, và Backer.
3. Tài khoản test PayOS/Ngân hàng để demo thanh toán.
4. Một chiến dịch mẫu đã có dữ liệu (Ví dụ: Dự án năng lượng xanh).
