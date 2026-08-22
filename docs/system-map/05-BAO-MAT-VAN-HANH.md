# Bảo mật và vận hành

Tài liệu này tập trung vào những điểm có thể gây mất dữ liệu, lộ credential hoặc deployment lỗi. Các secret chỉ được tham chiếu theo tên; tuyệt đối không ghi giá trị vào Markdown, commit hoặc log.

## 1. Secrets và dịch vụ ngoài

| Biến/nhóm | Công dụng | Nguyên tắc |
|---|---|---|
| `DATABASE_URL` | PostgreSQL/Prisma | Chỉ server/build; kiểm tra đúng môi trường trước migrate |
| `NEXTAUTH_URL`, secret auth | Session và callback | Không đưa vào client bundle |
| `GOOGLE_CLIENT_ID/SECRET` | Google OAuth | Giữ secret phía server |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL`/`EMAIL_FROM` | Gửi reset password | Cấu hình domain gửi hợp lệ trong production |
| `MONGODB_URI`, `MONGODB_DB_NAME` | Chat/dữ liệu phụ trợ | Không log connection string |
| `CLOUDINARY_*` | Upload media | Không expose API secret |
| `PAYOS_*`, `SEPAY_*`, `MOMO_*`, `VNPAY_*` | Provider payment legacy/hosted | Chỉ server; cần merchant approval và webhook verification |
| `REDIS_URL` | Rate limiting/cache nếu module sử dụng | Không giả định đã active nếu source không gọi |
| `ASSISTANT_TELEMETRY_READ_KEY` | Telemetry read-only | Không đưa vào `NEXT_PUBLIC_*` |

Nguồn tên biến thực tế cần đối chiếu `.env.example`, code và Vercel project settings. Không commit `.env` hoặc giá trị secret.

## 2. Password reset

Token reset được tạo ngẫu nhiên, lưu hash và có expiry 30 phút. Response forgot password không phân biệt email tồn tại. API reset yêu cầu password mới tối thiểu 8 ký tự, hash bằng bcrypt, đánh dấu token đã dùng và vô hiệu hóa token khác. Production phải cấu hình Resend; cơ chế debug link chỉ phù hợp development và không được lộ token production.

Cần bổ sung rate limiting thực tế ở edge/Redis/provider email trước khi public production nếu chưa có ở route hiện hành. Việc giới hạn tại memory process đơn lẻ không đủ tin cậy trong serverless.

## 3. Payment safety

Platform chỉ lưu provider reference/token được provider cấp và metadata hiển thị an toàn như brand, last4, label và loại method. Platform không được lưu số thẻ đầy đủ, CVV, OTP, password ngân hàng/ví hoặc số dư. Raw payment collection phải nằm trong hosted checkout của provider.

API payment phải tính lại amount, kiểm tra campaign/reward, stock, availability, quantity, shipping và ownership. Webhook phải kiểm tra chữ ký, idempotency và trạng thái hợp lệ; browser không được tự đánh dấu pledge là paid. COD phải được hiển thị là chờ giao/đang xử lý, không phải thanh toán online thành công.

MoMo, ZaloPay, bank account và card tokenization production cần merchant credentials, callback/IPN và quyền tokenization được provider phê duyệt. Code scaffolding không đồng nghĩa với việc tài khoản người dùng đã được liên kết thật.

## 4. Database và migration

`package.json` dùng `prisma migrate deploy` trong `vercel-build`. Quy trình an toàn là sửa `schema.prisma`, tạo migration, đọc SQL, chạy `prisma validate`/`generate`, kiểm tra môi trường và chỉ sau đó deploy. Không áp migration production bằng `db push` hoặc seed phá dữ liệu.

Các migration gần đây liên quan checkout và password reset phải được kiểm tra theo database thực tế. Nếu database production chưa có bảng/enum mới, deployment có thể build thành công nhưng runtime API sẽ lỗi cho tới khi migration chạy thành công.

## 5. Kiểm thử và quality gate

Các script chính:

| Lệnh | Mục đích |
|---|---|
| `pnpm lint` | ESLint toàn dự án |
| `npx tsc --noEmit` | TypeScript check |
| `pnpm prisma validate` | Kiểm tra schema |
| `pnpm prisma generate` | Sinh Prisma client |
| `pnpm build` | Build Next production |
| `pnpm test` | Jest |
| `pnpm test:db` | Test database |
| `pnpm test:e2e` | Playwright |
| `pnpm test:all` | Jest và database tests |
| `pnpm vercel-build` | Generate, migrate deploy và build |

Build xanh không chứng minh provider payment, email delivery, webhook hoặc database production đã hoạt động. Những phần đó cần smoke test có credential test/sandbox phù hợp.

## 6. Deployment và Git

Branch `main` được bảo vệ và thay đổi phải đi qua Pull Request. Trước khi commit/push, fetch và rebase với `origin/main`, chạy `git diff --check`, dùng đúng identity GitHub `NQP Tai / nguyenquachphutai@gmail.com`, rồi kiểm tra deployment Vercel. Preview deployment là branch/PR; Production deployment phải xuất phát từ `main` sau merge.

## 7. Rủi ro còn cần theo dõi

| Rủi ro | Mức độ | Cách xử lý |
|---|---|---|
| Provider tokenization chưa được merchant approval | Cao | Không tuyên bố one-tap thật; hoàn thiện adapter sau khi có credential và docs |
| Legacy provider routes tồn tại song song | Trung bình | Giữ tương thích webhook nhưng không đưa thành lựa chọn UI chính |
| Migration chưa áp dụng đúng database | Cao | Kiểm tra migration table và `prisma migrate deploy` ở môi trường mục tiêu |
| Tài liệu lịch sử ghi số liệu test khác nhau | Trung bình | Ưu tiên test run hiện tại và cập nhật status file |
| Rate limiting chưa đồng đều | Cao cho public API | Dùng Redis/edge provider hoặc middleware phù hợp |
| Log body nhạy cảm | Cao nếu tồn tại | Audit log, redact token/password/payment payload |
| MongoDB feature flags/config không nhất quán | Trung bình | Kiểm tra runtime flag và index initialization |

## References

[1]: ../../package.json "Scripts build/test/deploy"
[2]: ../../prisma/schema.prisma "Schema hiện tại"
[3]: ../../.env.example "Mẫu biến môi trường nếu có"
[4]: ../3.6.2_CICD_DEPLOYMENT.md "Hướng dẫn CI/CD lịch sử"
[5]: ../VERCEL_DEPLOYMENT_GUIDE.md "Hướng dẫn Vercel lịch sử"
[6]: ../assistant-safety-audit.md "Audit an toàn lịch sử"
