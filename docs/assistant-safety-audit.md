# Rà soát Hỏi nhanh và trợ lý nền tảng

Ngày 22/08/2026, toàn bộ route nhận diện của Hỏi nhanh được đối chiếu với allowlist public gồm `campaign`, `product`, `blog`, `project` và `profile`. Phần tóm tắt hiện chỉ dùng các trường đã chọn công khai: nội dung, người tạo, mục tiêu/tiến độ, đếm quan hệ, số liệu public, giá/mức ủng hộ và các liên kết hiển thị. Không bổ sung bất kỳ quyền ghi, định danh riêng, credential hoặc dữ liệu thanh toán nào.

Mọi input chat của **Hỏi nhanh** và **Trợ lý nền tảng** đều được kiểm tra theo chính sách command-like. Các đoạn code fence, lệnh shell/phần mềm và yêu cầu chạy/thực thi lệnh nhận phản hồi từ chối cố định; trợ lý không thực thi, không mô phỏng thực thi, không làm theo và không lưu lệnh vào Zero-Mem. Khi người dùng đã opt-in telemetry, hệ thống chỉ ghi event `command_rejected` cùng metadata tổng hợp, không ghi nội dung lệnh.

Rà soát cũng phát hiện `richDescription` TipTap có thể đến client dưới dạng JSON object và bị React ép thành `[object Object]`. Renderer hiện chuẩn hóa object sang JSON trước khi parse/render/sanitize, vì vậy trang dự án không còn hiển thị chuỗi lỗi này.

## Bằng chứng

| Hạng mục | Kết quả |
|---|---|
| Jest không database | 21 suite, 199 test pass |
| Jest database test riêng | 3 suite, 24 test pass |
| TypeScript Platform | Pass sau `prisma generate` từ schema hiện hành |
| Command blocking | Unit và UI tests cho Hỏi nhanh/Trợ lý nền tảng pass |
| Dữ liệu public profile/project/product | Có regression tests cho profile API, project summary, product price và số liệu quan hệ |
