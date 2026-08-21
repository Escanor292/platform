# Xác minh Zero-Mem trên giao diện

Ngày kiểm tra: 21/08/2026.

Trợ lý robot/lá xuất hiện ở góc phải và mở được panel hỗ trợ gọn trên trang `/gioi-thieu`. Panel hiển thị đúng nhãn **Zero-Mem cục bộ**, nội dung giới hạn bộ nhớ trên thiết bị trong phiên, TTL 30 phút, cảnh báo không nhập mật khẩu/OTP/token/dữ liệu thẻ, và có nút xóa bộ nhớ riêng. Các kết quả này được kiểm tra trực quan tại preview local sau khi thay bộ nhớ phiên cũ bằng bản tái triển khai Zero-Mem.

Đã gửi câu hỏi “Tôi muốn tạo chiến dịch” bằng chip gợi ý. Trợ lý hiển thị hướng dẫn phù hợp cùng liên kết `/campaigns/create`; trace câu hỏi và phản hồi được ghi vào bộ nhớ phiên cục bộ qua Zero-Mem. Các kiểm thử đơn vị riêng bao phủ truy hồi theo thời gian, TTL, xóa bộ nhớ và chặn chuỗi nhạy cảm.
