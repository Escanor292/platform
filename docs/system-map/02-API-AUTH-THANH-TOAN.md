# API, authentication và thanh toán

## 1. Quy ước API

Route handler nằm dưới `src/app/api/**/route.ts`. Route public vẫn phải validate input và chỉ trả dữ liệu công khai; route protected phải đọc session server-side, kiểm tra ownership/role và không tin các trường `userId`, `role`, `status`, `amount`, `stock` hoặc `paymentStatus` do client gửi.

## 2. Bản đồ route theo nhóm

| Nhóm | Route tiêu biểu | Vai trò |
|---|---|---|
| Auth | `/api/auth/[...nextauth]`, `/api/auth/register`, `/api/auth/forgot-password`, `/api/auth/reset-password` | Credential/Google, đăng ký và khôi phục mật khẩu |
| User/profile | `/api/users`, `/api/users/:id`, `/api/user/profile`, `/api/profile/*` | Hồ sơ, tìm user và cài đặt |
| Project | `/api/projects`, `/api/projects/:id`, `/api/projects/public/:id` | CRUD và public detail |
| Campaign | `/api/campaigns`, `/api/campaigns/:slug/*` | CRUD, updates, follow, review, report |
| Reward/product | `/api/rewards`, `/api/rewards/:id`, `/api/rewards/my` | Tạo/sửa/xóa mềm reward/product và stock |
| Blog | `/api/blog/posts/*`, `/api/admin/blog/*` | Draft, publish, like, bookmark, comment, report, moderation |
| Chat | `/api/chat/conversations/*` | Conversation, messages, read, reaction, reveal, typing, block/report |
| Checkout | `/api/checkout-sessions`, `/api/payment-methods`, `/api/payments`, `/api/lookup` | Lưu phiên, metadata payment method, tạo pledge/đơn và tra cứu |
| Provider | `/api/payment/*`, `/api/payments/webhook` | Hosted payment, webhook và tương thích legacy |
| KYC/admin | `/api/kyc/*`, `/api/admin/*`, `/api/me/badges` | KYC, moderation, badge và quản trị |
| Hệ thống | `/api/notifications`, `/api/upload`, `/api/cron/*`, assistant telemetry | Notification, media, job và telemetry |

## 3. Authentication và callback

Login/register nhận `callbackUrl` nội bộ để người dùng quay lại đúng checkout sau xác thực. Callback hợp lệ phải bắt đầu bằng một dấu `/`, không được là `//` hoặc URL ngoài domain. Credential success, Google callback và fallback register đều phải giữ callback này.

Credentials dùng bcrypt để so sánh password. Google/OAuth có thể tạo user không có password. Password reset không dùng session cũ làm quyền; token ngẫu nhiên trên URL được hash trong database, kiểm tra `expiresAt`/`usedAt` và vô hiệu hóa sau một lần dùng.

## 4. Forgot/reset password

`POST /api/auth/forgot-password` chuẩn hóa email, trả phản hồi chung cho cả email tồn tại và không tồn tại để chống email enumeration. Với user phù hợp, server tạo token ngẫu nhiên, chỉ lưu hash trong `password_reset_tokens`, xóa token cũ và gửi link qua Resend nếu đã cấu hình.

`POST /api/auth/reset-password` nhận token và password mới, kiểm tra hash và thời hạn 30 phút, yêu cầu password tối thiểu 8 ký tự, hash bằng bcrypt, cập nhật user và đánh dấu token đã dùng. Không log password, token hoặc reset URL trong production.

## 5. Checkout

| Method | Điều kiện | Kết quả |
|---|---|---|
| `ONLINE` | Guest được phép tạo checkout; dùng payment method đã lưu thì phải đăng nhập | Tạo pledge pending rồi chuyển sang hosted checkout/provider flow |
| `COD` | Reward `AVAILABLE`, còn stock, có địa chỉ giao hàng và email/định danh cần thiết | Tạo pledge/đơn chờ giao, không redirect sang cổng online |

`paymentMethodId` chỉ hợp lệ khi thuộc user hiện tại và ở trạng thái `ACTIVE`. `payment_methods` chỉ lưu provider, loại phương thức, provider-issued reference/token và metadata an toàn như label, brand, last4. Client không được gửi raw card number, CVV, OTP, mật khẩu ngân hàng/ví hay token tự phát.

Server phải kiểm tra campaign/reward relationship, campaign active, availability, quantity, stock, COD eligibility và tổng tiền. COD không được đánh dấu là online paid. Việc giữ/trừ stock phải nhất quán với trạng thái đơn và cần idempotency khi bổ sung webhook hoặc fulfillment.

## 6. Provider và webhook

Repository còn route PayOS, SePay, VNPay và MoMo từ các giai đoạn trước. Đây là provider legacy, không nên hiển thị thành bốn lựa chọn QR trong checkout mới. Hosted checkout/token-provider chỉ là kiến trúc sẵn sàng cho MoMo, ZaloPay, ngân hàng và thẻ; muốn chạy thật cần merchant credentials, callback/IPN ký xác thực và quyền tokenization của từng provider.

Webhook phải xác minh chữ ký, tìm pledge bằng reference an toàn, xử lý idempotent và chỉ chuyển trạng thái theo state machine hợp lệ. Browser không được tự đánh dấu giao dịch paid. Trang payment-success phải phân biệt online paid/pending với COD pending delivery; `/api/lookup` chỉ tra cứu trạng thái.

## 7. Checklist API

| Kiểm tra | Câu hỏi |
|---|---|
| Auth | Route public hay cần session? |
| Authorization | User có sở hữu entity hoặc có role phù hợp không? |
| Validation | Input có giới hạn kích thước và kiểu không? |
| Integrity | Có transaction, unique, index, FK hoặc idempotency không? |
| Privacy | Response có lộ email, token, credential hay dữ liệu người khác không? |
| Payment | Client có thể sửa amount/status/provider/stock không? |
| Logging | Log có vô tình chứa body nhạy cảm không? |

## References

- [`../../src/app/api/`](../../src/app/api/)
- [`../../src/lib/auth.ts`](../../src/lib/auth.ts)
- [`../../src/lib/password-reset.ts`](../../src/lib/password-reset.ts)
- [`../../src/app/api/payments/route.ts`](../../src/app/api/payments/route.ts)
- [`../../src/app/api/checkout-sessions/route.ts`](../../src/app/api/checkout-sessions/route.ts)
- [`../../src/app/api/payment-methods/route.ts`](../../src/app/api/payment-methods/route.ts)
