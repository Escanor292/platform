# Bản đồ hệ thống Tử Tế Fund

**Ngày đối chiếu:** 22/08/2026
**Repository:** [`Escanor292/platform`](https://github.com/Escanor292/platform)  
**Nguồn code đối chiếu:** `main` tại commit audit gần nhất; kiểm tra lại commit thực tế sau khi push

## Mục đích và nguồn sự thật

Bộ tài liệu này là bản đồ kỹ thuật ngắn gọn của hệ thống hiện tại. Khi nội dung tài liệu lịch sử khác với mã nguồn, ưu tiên theo thứ tự: `prisma/schema.prisma`, source trong `src/`, migration, `package.json` và cấu hình triển khai. Tài liệu trong `docs/archive/LEGACY_MARKDOWN.md` và `docs/archive/LEGACY_TXT.md` được giữ để tra cứu lịch sử, nhưng không phải nguồn sự thật runtime.

## Bộ tài liệu hoạt động

| File | Dùng khi |
|---|---|
| [`../SRS-TU-TE-FUND.md`](../SRS-TU-TE-FUND.md) | Đọc đặc tả yêu cầu phần mềm, actor, use case, acceptance checklist và backlog |
| [`01-KIEN-TRUC-DU-LIEU.md`](./01-KIEN-TRUC-DU-LIEU.md) | Hiểu stack, source tree, domain và quan hệ database |
| [`02-API-AUTH-THANH-TOAN.md`](./02-API-AUTH-THANH-TOAN.md) | Làm việc với API, quyền truy cập, auth, checkout và provider |
| [`03-LUONG-UI-CHAT-NOI-DUNG.md`](./03-LUONG-UI-CHAT-NOI-DUNG.md) | Sửa giao diện, campaign, product, blog, chat và các luồng người dùng |
| [`04-BAO-MAT-VAN-HANH-CAP-NHAT.md`](./04-BAO-MAT-VAN-HANH-CAP-NHAT.md) | Migration, secret, test, deployment, rủi ro và lịch sử cập nhật |
| [`../archive/LEGACY_MARKDOWN.md`](../archive/LEGACY_MARKDOWN.md) | Tìm lại toàn văn Markdown cũ đã được gộp |
| [`../archive/LEGACY_TXT.md`](../archive/LEGACY_TXT.md) | Tìm lại TXT lịch sử đã redacted, không dùng làm nguồn runtime |
| [`07-AUDIT-MD-TXT-VA-HE-THONG.md`](./07-AUDIT-MD-TXT-VA-HE-THONG.md) | Xem lỗi thời, thiếu thông tin, tham chiếu và khuyến nghị |
| [`../DATABASE_SCHEMA_DBML.txt`](../DATABASE_SCHEMA_DBML.txt) | Snapshot 35 bảng PostgreSQL/Prisma hiện tại |
| [`../MONGODB_SCHEMA_DBML.txt`](../MONGODB_SCHEMA_DBML.txt) | Snapshot collection, document shape, index và TTL MongoDB từ source |
| [`../VERCEL_ENV_VARIABLES.txt`](../VERCEL_ENV_VARIABLES.txt) | Danh sách biến Vercel được giữ theo yêu cầu riêng; có thể chứa secret |
| [`../VERCEL_ENV_VARIABLES.example.txt`](../VERCEL_ENV_VARIABLES.example.txt) | Template biến môi trường không chứa secret |

## Snapshot hệ thống

Tử Tế Fund là ứng dụng Next.js 15 App Router, React 19 và Tailwind CSS. PostgreSQL/Prisma là nguồn dữ liệu quan hệ; MongoDB được dùng cho chat và một số nội dung phụ trợ; Cloudinary và các provider thanh toán chỉ hoạt động khi môi trường đã cấu hình. Audit hiện tại ghi nhận 102 route handler API, 52 page file, 148 component file, 35 Prisma model và 25 Prisma enum. Đây là số lượng file/model, không phải cam kết test coverage hay số route đã nghiệm thu production.

Các miền chính gồm identity/auth, project, campaign, reward/product, blog, chat/realtime, dashboard/admin, KYC, notification, upload và payment/checkout.

## Cách đọc và cập nhật

Người mới đọc SRS trước để nắm phạm vi và yêu cầu, sau đó đọc file này, kiến trúc/dữ liệu, API/auth/payment, rồi UI/luồng và vận hành. Mỗi thay đổi lớn phải cập nhật đúng tài liệu chuyên đề thay vì tạo thêm một file `FINAL_STATUS` hoặc `IMPLEMENTATION_SUMMARY` mới.

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
| `2f2f80c` / PR #4 | Tài liệu hóa hệ thống; sau đó được tinh gọn ở `main` |
| `fc70d2c` / `6680834` | Archive Markdown/TXT và loại file tài liệu rời |
| `d883807` | Xóa TXT lịch sử rời sau khi đã redacted/archive |
| `75a5f5d` | Audit MD/TXT, archive lịch sử và tạo template môi trường an toàn |
| `working update` | Giữ lại Vercel environment list, xóa Seed report và tái tạo hai DBML từ source |

Lần audit này giữ lại `docs/VERCEL_ENV_VARIABLES.txt` theo yêu cầu vận hành của chủ dự án, xóa `docs/SEED_COMPLETE.txt`, và tái tạo hai DBML từ schema/service hiện tại. File Vercel không phải nguồn runtime và không nên chia sẻ công khai.

## Quy tắc bảo toàn thông tin

Các Markdown và TXT cũ đã được đọc, redacted khi cần và gộp vào archive trước khi loại khỏi vị trí rời. Vì vậy việc giảm số file không làm mất nội dung; chỉ thay đổi nơi tra cứu. SRS cũ, design system cũ, audit API, hướng dẫn chat, deployment note, provider note và các báo cáo tính năng đều nằm trong archive với tiêu đề nguồn riêng; hai DBML hiện hành nằm trực tiếp dưới `docs/` và được xem là snapshot, không phải nguồn sự thật.

> Tài liệu này không thay thế code review, test, migration review, kiểm tra production hoặc xác nhận pháp lý/provider.

## References

- [`../../prisma/schema.prisma`](../../prisma/schema.prisma)
- [`../../package.json`](../../package.json)
- [`../../src/`](../../src/)
- [`../README.md`](../README.md)
- [`../archive/LEGACY_MARKDOWN.md`](../archive/LEGACY_MARKDOWN.md)
