# Xác minh deployment Platform

## 21/08/2026

Commit `0c8e40e` đã được đẩy lên nhánh `main` để kích hoạt deployment tự động. Lần truy cập thụ động đầu tiên đến `/gioi-thieu` trả về trang Platform; phiên trình duyệt tương tác sau đó bị khởi tạo lại về trang trống trước khi có thể mở panel. Cần thực hiện lại kiểm tra tương tác sau khi deployment mới ổn định, gồm xác minh telemetry opt-in và hồi quy Zero-Mem TTL.

Lần kiểm tra tương tác lại cho thấy nút trợ lý mở được và panel hiển thị lời chào mặc định không có ngữ cảnh cũ, cùng cảnh báo Zero-Mem TTL 30 phút. Tuy nhiên control telemetry opt-in của commit `0c8e40e` chưa xuất hiện tại URL production, vì vậy deployment mới chưa được coi là đã phát hành; kiểm tra hồi quy cuối cùng sẽ chỉ thực hiện sau khi giao diện telemetry xuất hiện.

Sau khi deployment ổn định, kiểm tra lại `/gioi-thieu` đã xác nhận control telemetry opt-in xuất hiện trong panel với mặc định chưa chọn, đồng thời lời chào vẫn là trạng thái không có ngữ cảnh cũ. Đây là bằng chứng URL production đã phục vụ commit `0c8e40e`; bước tiếp theo là seed trace đã hết TTL để kiểm tra cơ chế loại bỏ trace ngay trên deployment.

Đã seed một trace có `expiresAt` nằm trong quá khứ cho session `platform-help` vào `sessionStorage` của deployment rồi tải lại trang. Bước xác nhận sau reload kiểm tra kho trace đã rỗng và panel chỉ dùng lời chào mặc định.

Kết quả xác nhận: sau reload, `tutefund-zero-mem-v1` trả về mảng rỗng. Mở lại panel hiển thị chính xác lời chào mặc định “Chào bạn, tôi có thể hướng dẫn cách dùng nền tảng…” thay vì lời chào tiếp tục ngữ cảnh. Vì vậy trace quá TTL đã bị loại bỏ trước retrieval và giao diện không sử dụng lại ngữ cảnh cũ.
