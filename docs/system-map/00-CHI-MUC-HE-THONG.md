# Bản đồ hệ thống Tử Tế Fund

**Ngày đối chiếu:** 22/08/2026
**Repository:** [`Escanor292/platform`](https://github.com/Escanor292/platform)  
**Nguồn code đối chiếu:** `origin/main` tại commit `9bf7ad1`

## Mục đích và nguồn sự thật

Bộ tài liệu này là bản đồ kỹ thuật ngắn gọn của hệ thống hiện tại. Khi nội dung tài liệu lịch sử khác với mã nguồn, ưu tiên theo thứ tự: `prisma/schema.prisma`, source trong `src/`, migration, `package.json` và cấu hình triển khai. Tài liệu trong `docs/archive/LEGACY_MARKDOWN.md` được giữ nguyên để tra cứu lịch sử, nhưng không phải nguồn sự thật runtime.

## Bộ tài liệu hoạt động

| File | Dùng khi |
|---|---|
| [`01-KIEN-TRUC-DU-LIEU.md`](./01-KIEN-TRUC-DU-LIEU.md) | Hiểu stack, source tree, domain và quan hệ database |
| [`02-API-AUTH-THANH-TOAN.md`](./02-API-AUTH-THANH-TOAN.md) | Làm việc với API, quyền truy cập, auth, checkout và provider |
| [`03-LUONG-UI-CHAT-NOI-DUNG.md`](./03-LUONG-UI-CHAT-NOI-DUNG.md) | Sửa giao diện, campaign, product, blog, chat và các luồng người dùng |
| [`04-BAO-MAT-VAN-HANH-CAP-NHAT.md`](./04-BAO-MAT-VAN-HANH-CAP-NHAT.md) | Migration, secret, test, deployment, rủi ro và lịch sử cập nhật |
| [`../archive/LEGACY_MARKDOWN.md`](../archive/LEGACY_MARKDOWN.md) | Tìm lại toàn văn 68 Markdown cũ đã được gộp, không xóa thông tin |

## Snapshot hệ thống

Tử Tế Fund là ứng dụng Next.js 15 App Router, React 19 và Tailwind CSS. PostgreSQL/Prisma là nguồn dữ liệu quan hệ; MongoDB được dùng cho chat và một số nội dung phụ trợ; Cloudinary và các provider thanh toán chỉ hoạt động khi môi trường đã cấu hình. Snapshot trước khi tài liệu hóa ghi nhận khoảng 102 route handler API, 52 page file, 148 component file, 58 thư viện nội bộ và 27 file test. Đây là số lượng file, không phải cam kết test coverage hay số route đã nghiệm thu production.

Các miền chính gồm identity/auth, project, campaign, reward/product, blog, chat/realtime, dashboard/admin, KYC, notification, upload và payment/checkout.

## Cách đọc và cập nhật

Người mới đọc file này trước, sau đó đọc kiến trúc/dữ liệu, API/auth/payment, rồi UI/luồng và vận hành. Mỗi thay đổi lớn phải cập nhật đúng tài liệu chuyên đề thay vì tạo thêm một file `FINAL_STATUS` hoặc `IMPLEMENTATION_SUMMARY` mới.

Các nhãn trạng thái được dùng trong tài liệu:

| Nhãn | Ý nghĩa |
|---|---|
| **Đã xác nhận trong code** | Có thể kiểm tra trực tiếp trong source, schema hoặc migration |
| **Có code, cần xác minh runtime** | Phụ thuộc database, secret, seed, provider, webhook hoặc môi trường |
| **Lịch sử/kế hoạch** | Nội dung cũ, đề xuất hoặc acceptance criteria; không tự động là tính năng đã hoàn tất |

## Changelog hiện hành

| Commit/mốc | Nội dung |
|---|---|
| `d003889` | Đồng bộ theme creator rewards |
| `a32c5ed` | Checkout đa phương thức an toàn |
| `1e8a93d` | Quên và đặt lại mật khẩu |
| `9bf7ad1` | Merge Pull Request #2 vào `main` |
| `2f2f80c` / PR #4 | Tài liệu hóa hệ thống; sau đó được tinh gọn ở branch tài liệu hiện tại |

Lần đối chiếu với `origin/main` không phát hiện commit mới hơn `9bf7ad1` ngoài các thay đổi tài liệu đang thực hiện.

## Quy tắc bảo toàn thông tin

Các Markdown cũ đã được đọc và gộp nguyên văn vào archive trước khi loại khỏi vị trí rời. Vì vậy việc giảm số file không làm mất nội dung; chỉ thay đổi nơi tra cứu. SRS cũ, design system cũ, audit API, hướng dẫn chat, deployment note và các báo cáo tính năng đều nằm trong archive với tiêu đề nguồn riêng.

> Tài liệu này không thay thế code review, test, migration review, kiểm tra production hoặc xác nhận pháp lý/provider.

## References

- [`../../prisma/schema.prisma`](../../prisma/schema.prisma)
- [`../../package.json`](../../package.json)
- [`../../src/`](../../src/)
- [`../README.md`](../README.md)
- [`../archive/LEGACY_MARKDOWN.md`](../archive/LEGACY_MARKDOWN.md)
