# Xác minh Hỏi nhanh với dự án công khai

Ngày 22/08/2026, profile công khai `cmphnhw8e0002so1uh16dwpvn` mở trực tiếp trên deployment mà không yêu cầu đăng nhập. Giao diện profile hiển thị một dự án công khai “Mầm xanh tử tế”.

Khi mở Hỏi nhanh, phần tóm tắt hiển thị “Dự án công khai: 1” và “Dự án gần đây: Mầm xanh tử tế”. Dữ liệu được lấy từ endpoint allowlist công khai; response chỉ chọn trường profile, `_count.projects` và tối đa sáu dự án với metadata hiển thị công khai, không gồm email, mật khẩu, tài khoản ngân hàng hoặc dữ liệu ghi.

Trên cùng deployment, câu hỏi “Coz bao nhiêu dự án?” nhận phản hồi: “Test Creator Pro có 1 dự án công khai. Dự án hiển thị: Mầm xanh tử tế.” Điều này xác nhận Hỏi nhanh dùng đúng số liệu và tên dự án đã công khai, không cần đăng nhập.
