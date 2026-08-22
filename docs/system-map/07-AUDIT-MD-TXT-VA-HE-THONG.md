# Audit tài liệu MD/TXT và toàn bộ hệ thống

> **Ngày audit:** 22/08/2026
> **Phạm vi:** source tree hiện tại, `prisma/schema.prisma`, migrations, MongoDB services/types/index scripts, package scripts và toàn bộ docs đã gom.
> **Nguyên tắc:** Tài liệu chỉ là bản đồ; nguồn sự thật runtime vẫn là `prisma/schema.prisma`, `src/`, `prisma/migrations/`, `package.json`, cấu hình runtime và trạng thái deployment thực tế.

## 1. Kết luận

Tài liệu hệ thống đã được tinh gọn thành một bộ nhỏ dưới `docs/`. Các báo cáo cũ về implementation, seed, provider và schema vẫn được giữ trong archive để truy nguyên nhưng không được dùng làm hướng dẫn triển khai. Hai DBML hiện hành đã được tái tạo từ source: PostgreSQL bao phủ 35 Prisma model/25 enum, còn MongoDB bao phủ các collection và index được code xác nhận.

Theo yêu cầu vận hành của chủ dự án, `docs/VERCEL_ENV_VARIABLES.txt` được giữ lại để phục hồi cấu hình Vercel. File này có thể chứa credential; không in, chia sẻ hoặc đưa vào log. `docs/VERCEL_ENV_VARIABLES.example.txt` vẫn được giữ làm template placeholder an toàn. `docs/SEED_COMPLETE.txt` không tồn tại và không được khôi phục.

## 2. Snapshot source

| Thành phần | Trạng thái quan sát |
|---|---|
| Framework | Next.js 15 App Router, React 19, Tailwind CSS |
| ORM/database chính | Prisma 5.22.0 với PostgreSQL qua `DATABASE_URL` |
| Authentication | NextAuth 5 beta, Credentials và Google OAuth trong source |
| API routes | 102 file `src/app/api/**/route.ts` theo audit snapshot |
| Pages/components | 52 page file và 148 component file theo audit snapshot |
| Prisma | 35 model, 25 enum; DBML được sinh lại từ schema |
| MongoDB | Native driver; chat, blog content và các collection phụ trợ |
| Build | `prisma generate && prisma migrate deploy && next build` qua `vercel-build` |
| Payment readiness | ONLINE/COD flow có trong code; provider adapter/credentials/webhook cần xác minh runtime; không tuyên bố PayOS production-ready |

Các miền chính gồm identity/auth, project, campaign, reward/product, blog, chat/realtime, dashboard/admin, KYC, notification, upload và payment/checkout.

## 3. Bộ tài liệu hoạt động

Trong phạm vi `docs/` ngoài archive hiện có **11 file**: 7 Markdown và 4 TXT. DBML là snapshot sinh từ source, không phải nguồn sự thật; file environment là tài liệu vận hành nhạy cảm theo yêu cầu riêng.

| File | Vai trò | Trạng thái |
|---|---|---|
| `docs/README.md` | Chỉ mục tài liệu | Hiện hành |
| `docs/system-map/00-CHI-MUC-HE-THONG.md` | Bản đồ và nguồn sự thật | Hiện hành |
| `docs/system-map/01-KIEN-TRUC-DU-LIEU.md` | Kiến trúc, domain, quan hệ dữ liệu | Hiện hành ở mức tổng quan |
| `docs/system-map/02-API-AUTH-THANH-TOAN.md` | API, auth, reset password, checkout, provider | Hiện hành ở mức luồng chính |
| `docs/system-map/03-LUONG-UI-CHAT-NOI-DUNG.md` | UI, project, campaign, product, blog, chat | Hiện hành ở mức luồng chính |
| `docs/system-map/04-BAO-MAT-VAN-HANH-CAP-NHAT.md` | Security, migration, test, deployment | Hiện hành; cần xác minh môi trường |
| `docs/system-map/07-AUDIT-MD-TXT-VA-HE-THONG.md` | Audit và khoảng trống tài liệu | Báo cáo này |
| `docs/DATABASE_SCHEMA_DBML.txt` | Snapshot PostgreSQL/Prisma | Mới tái tạo; 35 bảng, 25 enum |
| `docs/MONGODB_SCHEMA_DBML.txt` | Snapshot Mongo document/index/TTL | Mới tái tạo từ services/types/scripts |
| `docs/VERCEL_ENV_VARIABLES.txt` | Danh sách biến Vercel cần phục hồi | Giữ theo yêu cầu; nhạy cảm |
| `docs/VERCEL_ENV_VARIABLES.example.txt` | Template placeholder | An toàn để tham khảo |

## 4. Archive, đặc tả và fixture

`docs/archive/LEGACY_MARKDOWN.md` và `docs/archive/LEGACY_TXT.md` giữ nội dung lịch sử đã được gom; bản archive của environment đã redacted. Các nội dung “complete”, “production-ready”, schema cũ hoặc lệnh deploy cũ trong archive không phản ánh runtime hiện tại.

Các file `.kiro/specs/project-hierarchy-management/` là requirements/design/tasks/verification lịch sử. Chúng có giá trị truy nguyên nhưng có thể chứa mốc tiến độ mâu thuẫn và không được xem là trạng thái tính năng hiện tại. `scripts/sample-blog-posts/markdown/` là fixture/nội dung mẫu nếu seed script còn đọc, không phải tài liệu hệ thống. Các file Markdown của công cụ bên ngoài cũng không thuộc bộ docs hoạt động.

## 5. Những tuyên bố không được dùng làm nguồn runtime

| Nguồn lịch sử | Rủi ro | Cách xử lý |
|---|---|---|
| `IMPLEMENTATION_COMPLETE.txt` | Có thể ghi “complete/ready” và lệnh `deploy` không có trong `package.json` | Chỉ đọc lịch sử; dùng package/Vercel workflow hiện tại |
| `PAYOS_SUMMARY.txt` | Có thể tuyên bố provider production-ready trong khi adapter và merchant/webhook còn cần xác minh | Không dùng để xác nhận thanh toán thật |
| DBML cũ | Thiếu quan hệ project, payment methods, checkout session, quantity/COD, reset token và nhiều collection runtime | Dùng hai DBML mới; kiểm tra lại source khi schema đổi |
| `SEED_COMPLETE.txt` | Report dữ liệu mẫu không chứng minh trạng thái database hiện tại | Đã xóa theo yêu cầu; seed chỉ chạy trên database test phù hợp |
| `.kiro` progress reports | Mốc hoàn thành không phải kiểm chứng runtime | Giữ lịch sử, không dùng thay test/review |

## 6. Khoảng trống còn lại

| Ưu tiên | Khoảng trống | Tác động |
|---|---|---|
| Cao | Ma trận API đầy đủ method, auth, role, input, output, lỗi và side effect | Khó review authorization và E2E coverage |
| Cao | Trạng thái migration theo từng môi trường, gồm revision thực tế đã deploy | Tránh nhầm file migration với database đã áp dụng |
| Cao | Ma trận provider PayOS/MoMo/SePay/VNPay legacy/hosted checkout/tokenization | Tránh tuyên bố sai về ví, thẻ và thanh toán production |
| Cao | Quy trình rotation/revocation secret, đặc biệt credential từng xuất hiện trong lịch sử Git | Giảm rủi ro từ environment reference cũ |
| Trung bình | Ma trận role/permission cho backer, creator và admin | Authenticated không đồng nghĩa authorized |
| Trung bình | Mongo retention, backup/recovery và xác minh index trên database thật | Quan trọng với chat, notification, audit và content |
| Trung bình | Test inventory, CI coverage và phụ thuộc PostgreSQL/Mongo | Tránh coi kết quả test lịch sử là kết quả hiện tại |
| Thấp | Route/component map chi tiết cho blog, product, project, campaign và chat | Hỗ trợ onboarding, không chặn runtime |

## 7. Kiểm tra tham chiếu và bảo mật

Source runtime không được phép phụ thuộc vào các report lịch sử. Khi xóa hoặc đổi tên tài liệu khác, cần chạy `git grep` ngoài `docs/archive/` và loại trừ nội dung nhạy cảm trước khi in kết quả. `SEED_COMPLETE.txt` đã được kiểm tra là absent; hai DBML mới và file Vercel hiện diện trong docs.

`VERCEL_ENV_VARIABLES.txt` được giữ theo yêu cầu cá nhân nhưng không nên public, gửi qua issue/PR, đưa vào screenshot hoặc echo ra terminal. Nếu các giá trị từng là credential thật và đã xuất hiện trong lịch sử Git, nên rotate/revoke database, MongoDB, NextAuth, Cloudinary, payment, OAuth và email credentials trong dashboard tương ứng. Việc giữ file để tiện phục hồi không thay thế quy trình secret management.

## 8. Quy tắc cập nhật tiếp theo

Khi đổi Prisma schema, chạy lại `python3 scripts/generate_postgres_dbml.py` rồi review diff. Khi đổi Mongo service/type/index bootstrap, cập nhật `docs/MONGODB_SCHEMA_DBML.txt` chỉ bằng field/index đã được code xác nhận. Không tạo thêm `FINAL`, `IMPLEMENTATION_SUMMARY`, `STATUS` hoặc seed report trùng nội dung. Mỗi tài liệu phải phân biệt rõ “đã xác nhận trong code”, “có code nhưng cần xác minh runtime” và “lịch sử/kế hoạch”.

## 9. Nguồn sự thật

- `prisma/schema.prisma` và `prisma/migrations/`
- `src/`, đặc biệt `src/services/mongodb/`, `src/types/` và payment/auth routes
- `scripts/init-mongodb.js`, `scripts/init-chat-indexes.ts`
- `package.json`, lockfile và cấu hình deployment
- Vercel Project Settings, deployment/logs và provider dashboard thực tế
- `docs/DATABASE_SCHEMA_DBML.txt` và `docs/MONGODB_SCHEMA_DBML.txt` chỉ là snapshot dễ đọc
- `docs/archive/` chỉ là lịch sử, không phải nguồn sự thật runtime
