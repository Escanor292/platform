# Xác minh Hỏi nhanh với dự án công khai

Ngày 22/08/2026, profile công khai `cmphnhw8e0002so1uh16dwpvn` mở trực tiếp trên deployment mà không yêu cầu đăng nhập. Giao diện profile hiển thị một dự án công khai “Mầm xanh tử tế”.

Khi mở Hỏi nhanh, phần tóm tắt hiển thị “Dự án công khai: 1” và “Dự án gần đây: Mầm xanh tử tế”. Dữ liệu được lấy từ endpoint allowlist công khai; response chỉ chọn trường profile, `_count.projects` và tối đa sáu dự án với metadata hiển thị công khai, không gồm email, mật khẩu, tài khoản ngân hàng hoặc dữ liệu ghi.

Trên cùng deployment, câu hỏi “Coz bao nhiêu dự án?” nhận phản hồi: “Test Creator Pro có 1 dự án công khai. Dự án hiển thị: Mầm xanh tử tế.” Điều này xác nhận Hỏi nhanh dùng đúng số liệu và tên dự án đã công khai, không cần đăng nhập.

Route dự án `/projects/cmt0y1lls000196jc66m2pj7t` cũng mở trực tiếp không cần đăng nhập, hiển thị dự án “Mầm xanh tử tế” và nút Hỏi nhanh. Route này được middleware cho phép chỉ đọc; không có thao tác tạo, sửa hoặc xoá nào được mở thêm.

Trên trang dự án, Hỏi nhanh nhận diện “Đang xem: dự án”, nạp tiêu đề, mô tả và người tạo từ allowlist. Câu hỏi “Dự án này nói về gì?” nhận tóm tắt đúng về việc trồng cây xanh cho trường học vùng khó khăn. Điều này hoàn tất xác minh production cho cả profile và project page.
