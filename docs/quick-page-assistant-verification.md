# Xác minh biểu tượng Hỏi nhanh

Ngày 21/08/2026, trigger Hỏi nhanh được thay bằng mascot robot hình giọt nước màu xanh cyan, khác biệt trực quan với trợ lý robot/lá màu emerald. Kiểm thử component xác nhận trigger có hình giọt nước, mở panel đúng và vẫn tải tóm tắt dữ liệu công khai.

Đường dẫn sản phẩm trong ảnh tham chiếu hiện chuyển sang đăng nhập trên deployment đang hoạt động; vì vậy không sử dụng route đó để xác nhận trực quan trên production. Thay đổi không làm nới quyền truy cập: logic Hỏi nhanh và allowlist dữ liệu công khai giữ nguyên.
