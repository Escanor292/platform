# Tài liệu Tử Tế Fund

## Bắt đầu từ đây

Tài liệu yêu cầu chi tiết nằm tại [`SRS-TU-TE-FUND.md`](./SRS-TU-TE-FUND.md). Đây là baseline SRS được đối chiếu với source hiện tại, gồm actor, yêu cầu chức năng/phi chức năng, use case, API surface, dữ liệu, state machine, acceptance checklist và backlog khoảng trống.

Để tránh nhiều Markdown trùng nhau, tài liệu hệ thống hiện hành được tổ chức thành một bộ nhỏ dưới [`system-map/`](./system-map/):

1. [`SRS-TU-TE-FUND.md`](./SRS-TU-TE-FUND.md) — đặc tả yêu cầu phần mềm chi tiết và baseline nghiệm thu.
2. [`00-CHI-MUC-HE-THONG.md`](./system-map/00-CHI-MUC-HE-THONG.md) — phạm vi, nguồn sự thật và cách đọc.
3. [`01-KIEN-TRUC-DU-LIEU.md`](./system-map/01-KIEN-TRUC-DU-LIEU.md) — stack, source tree, domain và quan hệ dữ liệu.
4. [`02-API-AUTH-THANH-TOAN.md`](./system-map/02-API-AUTH-THANH-TOAN.md) — API, auth, forgot-password, checkout và provider.
5. [`03-LUONG-UI-CHAT-NOI-DUNG.md`](./system-map/03-LUONG-UI-CHAT-NOI-DUNG.md) — giao diện, campaign, project, product, blog và chat.
6. [`04-BAO-MAT-VAN-HANH-CAP-NHAT.md`](./system-map/04-BAO-MAT-VAN-HANH-CAP-NHAT.md) — bảo mật, migration, test, deployment và changelog.
7. [`07-AUDIT-MD-TXT-VA-HE-THONG.md`](./system-map/07-AUDIT-MD-TXT-VA-HE-THONG.md) — audit độ chính xác, lỗi thời và khoảng trống tài liệu.
8. [`DATABASE_SCHEMA_DBML.txt`](./DATABASE_SCHEMA_DBML.txt) — snapshot DBML PostgreSQL sinh từ `prisma/schema.prisma`.
9. [`MONGODB_SCHEMA_DBML.txt`](./MONGODB_SCHEMA_DBML.txt) — snapshot collection/index MongoDB từ source runtime.
10. [`VERCEL_ENV_VARIABLES.txt`](./VERCEL_ENV_VARIABLES.txt) — danh sách biến môi trường do chủ dự án yêu cầu giữ lại; không chia sẻ công khai.
11. [`VERCEL_ENV_VARIABLES.example.txt`](./VERCEL_ENV_VARIABLES.example.txt) — template placeholder an toàn để tham khảo.
12. [`phap-luat/QUY-DINH-PHAP-LUAT.md`](./phap-luat/QUY-DINH-PHAP-LUAT.md) — nghiên cứu đồ án: phân loại dòng tiền A/B, NĐ 93, thuế. Web3/token **không triển khai** trên sản phẩm; chỉ ghi để loại trừ phạm vi. **Không** phải điều khoản người dùng (lớp A nằm ở `/policy/*`).

## Bảo toàn Markdown cũ

[`archive/LEGACY_MARKDOWN.md`](./archive/LEGACY_MARKDOWN.md) và [`archive/LEGACY_TXT.md`](./archive/LEGACY_TXT.md) chứa nội dung lịch sử đã được gộp lại. Archive chỉ phục vụ tra cứu lịch sử; không dùng làm nguồn sự thật runtime. Khi khác với code, ưu tiên `prisma/schema.prisma`, `src/`, migration, `package.json` và cấu hình runtime.

Các tài liệu cũ về SRS, design system, chat, API audit, blog/product, deployment, testing, feature reports và TXT schema/provider đều nằm trong archive. Hai DBML trong danh sách trên là snapshot được cập nhật từ source hiện tại; source code/schema vẫn là nguồn sự thật. File Vercel giữ nguyên theo yêu cầu vận hành riêng và có thể chứa secret, còn template example không chứa secret. Báo cáo lỗi thời và khoảng trống hiện tại nằm ở [`system-map/07-AUDIT-MD-TXT-VA-HE-THONG.md`](./system-map/07-AUDIT-MD-TXT-VA-HE-THONG.md). Các file Markdown dùng làm fixture trong `scripts/` hoặc tài liệu đặc thù của công cụ bên ngoài không thuộc bộ docs hoạt động này.

## Quy tắc cập nhật

Khi thay đổi code, cập nhật đúng tài liệu chuyên đề tương ứng. Không tạo thêm file `FINAL`, `IMPLEMENTATION_SUMMARY` hoặc `STATUS` trùng nội dung. Mỗi mô tả phải phân biệt rõ: đã xác nhận trong code, có code nhưng cần xác minh runtime, hay chỉ là kế hoạch/lịch sử.

> Tài liệu không thay thế test, review migration, kiểm tra secret, code review hoặc xác nhận hoạt động trên production.

## Trợ lý grounded công khai

Trợ lý tại `/api/public/assistant` gọi Gemini từ **server-side**; `GEMINI_API_KEY` không được đặt dưới tiền tố `NEXT_PUBLIC_` và không được đưa vào client, log hoặc dữ liệu chat. Frontend chỉ gửi route hiện tại cùng dữ liệu đã lấy từ các endpoint public allowlist bằng GET. Route loại bỏ trường có tên token/secret/password/credential/private key, giới hạn kích thước câu hỏi và context, áp dụng timeout 18 giây cùng rate limit theo IP, và từ chối yêu cầu chạy hoặc mô phỏng lệnh trước khi gọi model.

Khi có nguồn, phản hồi trả về danh sách citation tương đối như trang hiện tại, endpoint dữ liệu bổ sung hoặc đánh giá công khai; UI hiển thị chúng dưới câu trả lời với nhãn `Nguồn công khai`. URL tuyệt đối bị loại bỏ. Nếu Gemini trả `429`, UI dùng fallback tóm tắt cục bộ và API trả thông báo giới hạn miễn phí kèm `Retry-After`; timeout trả `504` và cũng fallback về dữ liệu public đã tải. Nội dung public có thể chứa prompt injection, vì vậy luôn được coi là bằng chứng dữ liệu chứ không phải chỉ dẫn thực thi.

Để kiểm tra thay đổi, chạy `npm test -- --runInBand` cho Jest non-database, `npm run test:db` cho PostgreSQL test riêng, và `npx tsc --noEmit` trước khi mở pull request. Không ghi key thật vào `.env.example`; khai báo secret thật trong Vercel/secret manager với tên `GEMINI_API_KEY` và tùy chọn `GEMINI_MODEL`.
