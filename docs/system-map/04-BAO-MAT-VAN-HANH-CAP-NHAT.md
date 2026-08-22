# Bảo mật, vận hành và cập nhật hệ thống

## 1. Nguyên tắc bảo mật bắt buộc

Không lưu hoặc log password, raw PAN/card number, CVV, OTP, mật khẩu ngân hàng/ví, số dư hoặc provider credential. Payment method chỉ lưu metadata masked và reference/token do provider phát hành sau callback/verification. Client không được quyết định ownership, role, amount, stock, payment status hoặc quyền admin.

Mọi route cần validate input, kiểm tra session/role/ownership và giới hạn payload. Webhook phải xác minh chữ ký, idempotent và không tin request browser. Nội dung rich text phải sanitize. Chat phải kiểm tra participant trước khi đọc/gửi/sửa/xóa/report.

## 2. Secret và môi trường

Secret phải cấu hình trong environment của Vercel hoặc môi trường chạy, không commit vào Markdown, source, log hay screenshot. Tài liệu deployment cũ từng chứa chuỗi cấu hình trông giống secret; bản đó đã được chuyển vào archive nhưng không dùng làm hướng dẫn và không nên sao chép secret từ archive.

Các nhóm biến thường cần kiểm tra gồm `DATABASE_URL`, MongoDB URI, `AUTH_SECRET`/NextAuth secret, Google OAuth, Cloudinary, Resend, payment provider credentials và URL ứng dụng. Chỉ dùng placeholder trong tài liệu; credential thật phải được rotate nếu từng bị commit hoặc hiển thị công khai.

## 3. Database và migration

Prisma schema là nguồn chuẩn cho PostgreSQL. Sau khi sửa schema cần chạy `pnpm prisma generate`, `pnpm prisma validate`, review SQL migration và dùng `prisma migrate deploy` trong production. Không tự động áp dụng migration production khi chưa xác nhận đúng database/environment.

Các mốc gần đây gồm migration checkout đa phương thức và `password_reset_tokens`. Cần kiểm tra migration history trước khi tạo migration mới, đặc biệt sau khi rebase branch hoặc có người khác push song song.

## 4. Build, test và deployment

Quy trình tối thiểu trước merge:

```bash
pnpm prisma validate
pnpm prisma generate
npx tsc --noEmit
pnpm exec eslint <file-da-thay-doi>
pnpm build
git diff --check
```

`package.json` có build script phục vụ Vercel; deployment production cần migration hợp lệ và `DATABASE_URL`. Branch `main` được bảo vệ nên thay đổi nên đi qua Pull Request, required checks và kiểm tra deployment Preview trước khi merge.

## 5. Provider/payment readiness

Checkout `ONLINE` hiện là tuyến hosted checkout, còn provider cụ thể và tokenization phụ thuộc merchant credentials, callback/IPN và quyền phê duyệt của từng provider. PayOS/SePay/VNPay/MoMo legacy vẫn có thể tồn tại trong source nhưng không nên được trình bày như các lựa chọn QR riêng trong UI checkout mới. Không tuyên bố MoMo/ZaloPay/bank/card liên kết một chạm production nếu chưa có adapter và callback đã xác minh.

COD chỉ là đơn chờ giao, không phải online paid. Cần có chính sách rõ về giữ/trừ stock, xác nhận giao hàng, hủy và hoàn trả trước khi mở rộng fulfillment.

## 6. Các yêu cầu cũ cần xác minh runtime

SRS cũ ghi acceptance criteria chi tiết về hóa đơn PDF/email, transaction limit theo KYC, KYC expiry cron, audit log, moderation blog/comment/report, badge admin và cleanup pledge pending. Source hiện có nhiều route/service liên quan, nhưng tài liệu lịch sử không đủ để kết luận tất cả đã hoàn thành end-to-end. Khi làm các tính năng này, kiểm tra đồng thời schema, route, migration, cron, secret và test.

## 7. Thay đổi tài liệu lần này

| Thay đổi | Kết quả |
|---|---|
| Đọc lại Markdown cũ | 68 file cũ đã được lưu nguyên văn |
| Tài liệu hoạt động | Gộp thành 4 file system-map chuyên đề và 1 chỉ mục |
| Duplicate/overlap | Loại các bản báo cáo rời khỏi vị trí hoạt động; nội dung còn trong archive |
| Nguồn lịch sử | `docs/archive/LEGACY_MARKDOWN.md`, mỗi mục giữ đường dẫn nguồn và toàn văn |
| Code runtime | Không thay đổi logic ứng dụng trong lần tinh gọn tài liệu này |
| Cập nhật GitHub | Đối chiếu `origin/main` tại `9bf7ad1`; tài liệu được chuẩn bị trên branch/PR riêng |

## 8. Quy tắc duy trì

Tài liệu hiện hành chỉ cập nhật theo thay đổi đã xác nhận trong code. Báo cáo triển khai một tính năng nên được ghi vào changelog/tài liệu chuyên đề; không tạo thêm bản `FINAL` trùng chủ đề. Khi một tài liệu lịch sử có thông tin độc đáo, bổ sung vào chuyên đề hiện hành trước khi đưa file đó vào archive.

## References

- [`../../package.json`](../../package.json)
- [`../../prisma/schema.prisma`](../../prisma/schema.prisma)
- [`../../prisma/migrations/`](../../prisma/migrations/)
- [`../../scripts/`](../../scripts/)
- [`../archive/LEGACY_MARKDOWN.md`](../archive/LEGACY_MARKDOWN.md)
