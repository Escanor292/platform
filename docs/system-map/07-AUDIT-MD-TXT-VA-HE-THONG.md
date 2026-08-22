# Audit tài liệu MD/TXT và toàn bộ hệ thống

> **Ngày audit:** 22/08/2026
> **Nguồn đối chiếu:** `origin/main` tại `d883807`, source tree, Prisma schema, migrations, package scripts và tham chiếu trực tiếp trong code.
> **Nguyên tắc:** Tài liệu lịch sử chỉ để truy nguyên. Nguồn sự thật runtime là `prisma/schema.prisma`, `src/`, `prisma/migrations/`, `package.json`, cấu hình runtime và trạng thái deployment thực tế.

## 1. Kết luận nhanh

Sau khi đọc lại toàn bộ tài liệu và đối chiếu với code, hệ thống có tài liệu mô tả khá rộng nhưng tồn tại nhiều bản báo cáo lịch sử không còn phản ánh chính xác runtime. Các file cũ không nên tiếp tục được dùng làm hướng dẫn triển khai nếu chúng ghi trạng thái “complete/production-ready”, framework cũ, schema cũ hoặc lệnh không còn tồn tại.

Nội dung lịch sử đã được giữ trong archive, còn các file TXT rời có nguy cơ gây nhầm lẫn đã được loại khỏi khu vực hoạt động. Không phát hiện source runtime tham chiếu trực tiếp đến các TXT lịch sử đã xóa. Các Markdown dưới `scripts/sample-blog-posts/markdown/` vẫn được xem là fixture/nội dung mẫu và không được xóa nếu script seed còn sử dụng.

## 2. Snapshot source hiện tại

| Thành phần | Trạng thái quan sát |
|---|---|
| Framework | Next.js `15.1.4`, React `19`, App Router |
| ORM/database chính | Prisma `5.22.0`, PostgreSQL qua `DATABASE_URL` |
| Authentication | NextAuth `5.0.0-beta.30`, Credentials và Google OAuth |
| API routes | 102 file `src/app/api/**/route.ts` |
| Pages | 52 file `src/app/**/page.tsx` |
| Components | 148 file TypeScript/TSX dưới `src/components` |
| Prisma models | 35 |
| Prisma enums | 25 |
| Build Vercel | `prisma generate && prisma migrate deploy && next build` |
| Migrations checkout/reset | `20260822150000_checkout_multi_method`, `20260822161000_password_reset_tokens` |
| Chat/data phụ | MongoDB; Redis và Cloudinary được dùng theo cấu hình/tính năng |
| Git | `origin/main` và local cùng ở `d883807` trước commit audit này |

## 3. Danh mục file MD/TXT hiện còn

Sau lần tinh gọn và trước commit audit này, repository có **25 Markdown và 1 TXT hoạt động**. Trong đó có tài liệu hệ thống, tài liệu đặc thù cho công cụ, fixture và archive; không nên coi tất cả là cùng một loại tài liệu.

### 3.1. Tài liệu hiện hành

| File | Vai trò | Đánh giá |
|---|---|---|
| `docs/README.md` | Chỉ mục docs | Nguồn bắt đầu đọc |
| `docs/system-map/00-CHI-MUC-HE-THONG.md` | Chỉ mục hệ thống | Nguồn điều hướng |
| `docs/system-map/01-KIEN-TRUC-DU-LIEU.md` | Kiến trúc và mô hình dữ liệu | Khớp source ở mức tổng quan; còn thiếu chi tiết MongoDB/index |
| `docs/system-map/02-API-AUTH-THANH-TOAN.md` | API, auth, reset password, checkout | Đúng hướng; chưa phải ma trận đủ 102 route |
| `docs/system-map/03-LUONG-UI-CHAT-NOI-DUNG.md` | UI, project, campaign, product, blog, chat | Mô tả luồng chính; còn thiếu edge cases và component map |
| `docs/system-map/04-BAO-MAT-VAN-HANH-CAP-NHAT.md` | Security, migration, test, deployment | Cần ghi cụ thể revision migration ở từng môi trường |
| `docs/system-map/07-AUDIT-MD-TXT-VA-HE-THONG.md` | Báo cáo audit | Chỉ là báo cáo kiểm tra, không phải hướng dẫn runtime |
| `docs/VERCEL_ENV_VARIABLES.example.txt` | Template biến môi trường an toàn | Không chứa secret; nên dùng làm template duy nhất |

### 3.2. Archive lịch sử

| File | Vai trò | Lưu ý |
|---|---|---|
| `docs/archive/LEGACY_MARKDOWN.md` | Toàn văn Markdown cũ | Không dùng làm nguồn sự thật |
| `docs/archive/LEGACY_TXT.md` | Toàn văn TXT cũ đã audit | Phần môi trường Vercel đã được redacted; không lưu secret nguyên văn |

### 3.3. File đặc thù không phải tài liệu runtime

| Vị trí | Đánh giá |
|---|---|
| `.kiro/specs/project-hierarchy-management/` | Requirements/design/tasks/verification của một feature. Có giá trị đặc tả và truy nguyên, nhưng nhiều báo cáo tiến độ đã lỗi thời. |
| `.windsurf/workflows/gioi-thieu.md` | Workflow của công cụ hỗ trợ; hiện là file rỗng, không phải tài liệu hệ thống. Có thể xóa nếu không còn dùng workflow này. |
| `scripts/sample-blog-posts/markdown/` | Nội dung mẫu/fixture cho blog; không phải tài liệu hệ thống. Giữ nếu script seed còn đọc. |

## 4. File và tuyên bố lỗi thời

| Mức độ | Nguồn | Vấn đề phát hiện | Kết luận |
|---|---|---|---|
| Cao | Nội dung cũ trong `docs/archive/LEGACY_TXT.md` từ `IMPLEMENTATION_COMPLETE.txt` | Ghi “implementation complete/ready for deployment” và dùng `npm run deploy`, nhưng `package.json` hiện không có script `deploy`. | Chỉ giữ lịch sử; không dùng để deploy. Dùng `pnpm build`/Vercel workflow hiện tại. |
| Cao | Nội dung cũ từ `PAYOS_SUMMARY.txt` | Tuyên bố PayOS “Production-Ready” trong khi provider flow hiện vẫn phụ thuộc merchant credentials, webhook/IPN và adapter cần xác minh. | Không coi là xác nhận thanh toán production. |
| Cao | Nội dung cũ từ `DATABASE_SCHEMA_DBML.txt`, `MONGODB_SCHEMA_DBML.txt` | Là snapshot schema cũ; không bao phủ đầy đủ 35 Prisma models, checkout, reset password và code MongoDB hiện tại. | Chỉ dùng để xem lịch sử. |
| Trung bình | `.kiro/specs/project-hierarchy-management/*.md` | Có các mốc “71% complete”, “100% core functionality” và mô tả Next.js 14+, không phải snapshot hiện hành. | Giữ vì là đặc tả; nên gắn nhãn historical hoặc cập nhật khi feature được tiếp tục sửa. |
| Trung bình | Nội dung cũ từ `SEED_COMPLETE.txt` | Có thể mô tả dữ liệu mẫu/tài khoản đã thay đổi. | Chỉ chạy theo scripts hiện có trên database test riêng; không suy ra trạng thái database thật. |
| Thấp | `.windsurf/workflows/gioi-thieu.md` | File rỗng. | Xóa nếu không có workflow nào cần file này. |
| Thấp | Một số tài liệu lịch sử dùng `npm run` | Một số lệnh vẫn có thể chạy qua npm, nhưng danh sách script chuẩn phải lấy từ `package.json`; các lệnh như `deploy` không tồn tại. | Không copy lệnh cũ nếu chưa kiểm tra. |

## 5. Thông tin còn thiếu trong tài liệu hoạt động

| Ưu tiên | Khoảng trống | Tác động |
|---|---|---|
| Cao | Ma trận API gồm method, auth, role, input, output, lỗi và side effect cho 102 route | Khó review authorization và kiểm thử end-to-end |
| Cao | Trạng thái migration theo môi trường: file đã tạo, đã deploy ở đâu, revision thực tế trong database | Tránh nhầm file SQL với migration đã áp dụng |
| Cao | Ma trận provider: PayOS/MoMo/SePay/VNPay legacy route, hosted checkout, ZaloPay/MoMo tokenization và điều kiện merchant approval | Tránh tuyên bố sai về liên kết ví/thẻ hoặc thanh toán thật |
| Cao | Quy trình secret/rotation/revocation và lịch sử credential | Xóa file không làm credential từng commit tự động an toàn |
| Trung bình | Ma trận role/permission của backer, creator, admin | Authentication không đồng nghĩa authorization đã được mô tả đầy đủ |
| Trung bình | MongoDB collections, TTL, indexes, retention và xử lý user đã xóa | Quan trọng với chat, signaling và dữ liệu riêng tư |
| Trung bình | Test inventory: suite nào cần PostgreSQL/MongoDB, suite nào CI chạy, coverage và thời điểm gần nhất | Không nhầm kết quả test lịch sử với kết quả hiện tại |
| Thấp | Route/component map cho blog, product, project, campaign và chat | Giúp onboarding, không chặn runtime |

## 6. Kiểm tra tham chiếu trực tiếp

Các TXT lịch sử đã xóa (`DATABASE_SCHEMA_DBML.txt`, `IMPLEMENTATION_COMPLETE.txt`, `MONGODB_SCHEMA_DBML.txt`, `PAYOS_SUMMARY.txt`, `SEED_COMPLETE.txt`, `VERCEL_ENV_VARIABLES.txt`, `seed-output.txt`) không được source hiện tại tham chiếu trực tiếp ngoài archive/audit history.

Các Markdown sample dưới `scripts/sample-blog-posts/markdown/` cần được coi là dữ liệu fixture, không phải tài liệu cần hợp nhất. Archive và system-map không được import vào runtime. Trước khi xóa bất kỳ file nào khác, dùng `git grep` ngoài `docs/archive/` để kiểm tra tham chiếu.

## 7. Cảnh báo bảo mật về biến môi trường

`docs/VERCEL_ENV_VARIABLES.txt` đã được loại khỏi repository hoạt động vì có nguy cơ chứa giá trị secret. Bản thay thế `docs/VERCEL_ENV_VARIABLES.example.txt` chỉ có tên biến và placeholder. Archive không giữ giá trị môi trường nguyên văn.

Nếu file cũ từng chứa credential thật và credential đó đã xuất hiện trong lịch sử Git, cần rotate/revoke các key liên quan trong Vercel, database, MongoDB, Cloudinary, payment provider, OAuth và email provider. Xóa file hiện tại không xóa dữ liệu khỏi Git history hoặc log đã phát sinh.

## 8. Thứ tự xử lý khuyến nghị

1. Hoàn thiện ma trận API và role/permission.
2. Xác minh migration checkout/password reset đã áp dụng ở từng môi trường.
3. Xác minh trạng thái thật của từng payment provider, callback/IPN và merchant approval.
4. Bổ sung tài liệu MongoDB collections, TTL, indexes và retention.
5. Gắn nhãn historical cho các báo cáo `.kiro` hoặc di chuyển chúng vào archive đặc thù nếu không còn dùng.
6. Xóa `.windsurf/workflows/gioi-thieu.md` nếu xác nhận workflow không còn sử dụng.
7. Rotate mọi credential từng xuất hiện trong tài liệu môi trường cũ nếu đó là giá trị thật.

## 9. Nguồn sự thật

- `prisma/schema.prisma`
- `prisma/migrations/`
- `src/`
- `package.json` và lockfile
- `next.config.*`, `middleware.*`, `auth.*`
- Vercel Project Settings, deployment và logs thực tế
- Provider dashboard/webhook verification thực tế
- `docs/archive/` chỉ là lịch sử, không phải nguồn sự thật runtime
