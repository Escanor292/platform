# Xác minh Zero-Mem trên giao diện

Ngày kiểm tra: 21/08/2026.

Trợ lý robot/lá xuất hiện ở góc phải và mở được panel hỗ trợ gọn trên trang `/gioi-thieu`. Panel hiển thị đúng nhãn **Zero-Mem cục bộ**, nội dung giới hạn bộ nhớ trên thiết bị trong phiên, TTL 30 phút, cảnh báo không nhập mật khẩu/OTP/token/dữ liệu thẻ, và có nút xóa bộ nhớ riêng. Các kết quả này được kiểm tra trực quan tại preview local sau khi thay bộ nhớ phiên cũ bằng bản tái triển khai Zero-Mem.

Đã gửi câu hỏi “Tôi muốn tạo chiến dịch” bằng chip gợi ý. Trợ lý hiển thị hướng dẫn phù hợp cùng liên kết `/campaigns/create`; trace câu hỏi và phản hồi được ghi vào bộ nhớ phiên cục bộ qua Zero-Mem. Các kiểm thử đơn vị riêng bao phủ truy hồi theo thời gian, TTL, xóa bộ nhớ và chặn chuỗi nhạy cảm.

Deployment `https://platform-seven-navy-44.vercel.app/gioi-thieu` đã được kiểm tra trực tiếp. Nút “Hướng dẫn sử dụng” xuất hiện, mở được panel robot/lá, hiển thị nhãn Zero-Mem cục bộ, mô tả TTL/chặn dữ liệu nhạy cảm và nút xóa bộ nhớ.

Đã nhập chuỗi OTP giả lập trên deployment. Giao diện từ chối lưu/xử lý nội dung nhạy cảm và hiển thị cảnh báo an toàn. Sau đó, nút xóa bộ nhớ trả thông báo “Đã xóa bộ nhớ Zero-Mem của phiên này trên thiết bị của bạn”, xác minh fallback UI và quyền xóa hoạt động trực tiếp.

Kiểm thử TTL cục bộ được thực hiện với TTL rút ngắn tạm thời; trước khi ghi trace thử nghiệm, bộ nhớ phiên được xóa để loại bỏ trace cũ có thời hạn 30 phút từ phiên preview trước.

Với trace mới “Tôi cần hỗ trợ tạo chiến dịch”, panel đã trả lời hướng dẫn phù hợp và lưu trace theo phiên. Sau khi TTL thử nghiệm hết hạn và tải lại trang, panel chỉ hiển thị lời chào mặc định “Chào bạn, tôi có thể hướng dẫn cách dùng nền tảng…”; không còn tin nhắn cũ hay lời chào tiếp tục ngữ cảnh. Kết quả xác nhận trace hết hạn bị loại khỏi `loadZeroMemTraces`, giao diện không tái sử dụng ngữ cảnh cũ, và bằng chứng UI được lưu tại `screenshots/localhost_2026-08-21_10-17-41_6099.webp` trong môi trường kiểm thử. TTL sản phẩm đã được hoàn nguyên về 30 phút sau khi kiểm thử.
