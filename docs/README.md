# Tài liệu Tử Tế Fund

## Bắt đầu từ đây

Để tránh nhiều Markdown trùng nhau, tài liệu hệ thống hiện hành được tổ chức thành một bộ nhỏ dưới [`system-map/`](./system-map/):

1. [`00-CHI-MUC-HE-THONG.md`](./system-map/00-CHI-MUC-HE-THONG.md) — phạm vi, nguồn sự thật và cách đọc.
2. [`01-KIEN-TRUC-DU-LIEU.md`](./system-map/01-KIEN-TRUC-DU-LIEU.md) — stack, source tree, domain và quan hệ dữ liệu.
3. [`02-API-AUTH-THANH-TOAN.md`](./system-map/02-API-AUTH-THANH-TOAN.md) — API, auth, forgot-password, checkout và provider.
4. [`03-LUONG-UI-CHAT-NOI-DUNG.md`](./system-map/03-LUONG-UI-CHAT-NOI-DUNG.md) — giao diện, campaign, project, product, blog và chat.
5. [`04-BAO-MAT-VAN-HANH-CAP-NHAT.md`](./system-map/04-BAO-MAT-VAN-HANH-CAP-NHAT.md) — bảo mật, migration, test, deployment và changelog.
6. [`07-AUDIT-MD-TXT-VA-HE-THONG.md`](./system-map/07-AUDIT-MD-TXT-VA-HE-THONG.md) — audit độ chính xác, lỗi thời và khoảng trống tài liệu.

## Bảo toàn Markdown cũ

[`archive/LEGACY_MARKDOWN.md`](./archive/LEGACY_MARKDOWN.md) và [`archive/LEGACY_TXT.md`](./archive/LEGACY_TXT.md) chứa nội dung lịch sử đã được gộp lại. Archive chỉ phục vụ tra cứu lịch sử; không dùng làm nguồn sự thật runtime. Khi khác với code, ưu tiên `prisma/schema.prisma`, `src/`, migration, `package.json` và cấu hình runtime.

Các tài liệu cũ về SRS, design system, chat, API audit, blog/product, deployment, testing, feature reports và TXT schema/provider đều nằm trong archive. Báo cáo lỗi thời và khoảng trống hiện tại nằm ở [`system-map/07-AUDIT-MD-TXT-VA-HE-THONG.md`](./system-map/07-AUDIT-MD-TXT-VA-HE-THONG.md). Các file Markdown dùng làm fixture trong `scripts/` hoặc tài liệu đặc thù của công cụ bên ngoài không thuộc bộ docs hoạt động này.

## Quy tắc cập nhật

Khi thay đổi code, cập nhật đúng tài liệu chuyên đề tương ứng. Không tạo thêm file `FINAL`, `IMPLEMENTATION_SUMMARY` hoặc `STATUS` trùng nội dung. Mỗi mô tả phải phân biệt rõ: đã xác nhận trong code, có code nhưng cần xác minh runtime, hay chỉ là kế hoạch/lịch sử.

> Tài liệu không thay thế test, review migration, kiểm tra secret, code review hoặc xác nhận hoạt động trên production.
