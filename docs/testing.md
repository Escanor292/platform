# Kiểm thử Platform

`npm test` chạy các kiểm thử unit, component và integration không cần database. Các suite truy cập Prisma trực tiếp được tách riêng để chúng không bao giờ vô tình sử dụng `DATABASE_URL` phát hành trong môi trường phát triển hoặc CI không có database test.

Để chạy toàn bộ kiểm thử, tạo một PostgreSQL database **riêng** có tên chứa `test` (ví dụ `tutefund_platform_test`) rồi cấu hình biến môi trường `JEST_DATABASE_URL` chỉ cho CI/test. Chạy `npm run test:db` để áp dụng migration vào database test rồi chạy các suite database tuần tự. `npm run test:all` ghép hai đường chạy này.

> Không đặt `JEST_DATABASE_URL` trỏ tới database phát hành. Script kiểm tra giao thức PostgreSQL và yêu cầu tên database chứa `test` trước khi áp dụng migration.

Xác minh ngày 21/08/2026: `npm test -- --runInBand` đạt **16 suite / 188 test**. Trên PostgreSQL riêng `tutefund_platform_test`, `JEST_DATABASE_URL=... npm run test:db` đạt **3 suite / 24 test** sau khi áp dụng migration. Lệnh `npm run test:all` đã chạy nối tiếp hai đường và hoàn tất thành công; database test có owner riêng `platform_test`, tách biệt hoàn toàn với URL phát hành.

## Telemetry trợ lý

Telemetry của trợ lý nền tảng **tắt mặc định** và chỉ hoạt động khi người dùng tự chọn đồng ý. Endpoint chỉ ghi loại sự kiện, số trace ngữ cảnh (0–24) và cờ có liên kết hành động. Hệ thống không gửi hoặc lưu nội dung câu hỏi/trả lời, dữ liệu nhận diện, địa chỉ IP, user-agent hoặc Zero-Mem trace.

Kiểm tra trực quan tại preview local ngày 21/08/2026 xác nhận panel trợ lý hiển thị checkbox đồng ý riêng cùng thông báo giới hạn dữ liệu. Trạng thái ban đầu là không chọn; control chỉ xuất hiện trong panel hỗ trợ và không ảnh hưởng nút Hỏi nhanh theo thực thể. Sau thao tác chọn tự nguyện, cài đặt được lưu cục bộ dưới giá trị `granted`; không có nội dung chat nào được dùng trong cài đặt hoặc payload.
