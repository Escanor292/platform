# API, authentication và thanh toán

Tài liệu này mô tả các nhóm route hiện có trong `src/app/api`. Danh sách dưới đây là bản đồ chức năng, không thay thế contract chi tiết trong từng route. Mọi input vẫn phải được đọc và validate từ code hiện tại trước khi tích hợp [1].

## 1. Quy ước chung

Route handler nằm ở `src/app/api/**/route.ts` và dùng các method HTTP chuẩn. Route public cần kiểm tra input và tránh lộ dữ liệu riêng tư; route protected phải đọc session server-side và kiểm tra ownership/role. Không tin các trường `userId`, `role`, `status`, `paymentStatus` hoặc giá từ client nếu server có thể tự suy ra.

## 2. Nhóm API chính

| Nhóm | Route tiêu biểu | Mục đích |
|---|---|---|
| Auth | `/api/auth/[...nextauth]`, `/api/auth/register`, `/api/auth/forgot-password`, `/api/auth/reset-password` | OAuth/credentials, đăng ký và reset password |
| Users/profile | `/api/users`, `/api/users/:id`, `/api/user/profile`, `/api/profile/settings`, `/api/profile/update` | Hồ sơ, tìm user và cài đặt |
| Projects | `/api/projects`, `/api/projects/:id`, `/api/projects/public/:id` | CRUD project và public detail |
| Campaigns | `/api/campaigns`, `/api/campaigns/:slug`, `/api/campaigns/:slug/updates`, `/follow`, `/reviews`, `/reports` | Campaign, update, follow, review và report |
| Rewards/products | `/api/rewards`, `/api/rewards/:id`, `/api/rewards/my`, `/api/rewards/:id/toggle` | Quản lý reward/product, trạng thái và ownership |
| Blog | `/api/blog/posts`, `/my-posts`, `/:slug`, `/:slug/publish`, `/:slug/comments`, `like`, `bookmark`, `archive` | Soạn, xuất bản và tương tác bài viết |
| Chat | `/api/chat/conversations`, `messages`, `read`, `reaction`, `reveal`, `typing`, `search`, `block`, `report` | Hội thoại, tin nhắn, reaction, đã xem và bảo vệ người dùng |
| Checkout/payment | `/api/checkout-sessions`, `/api/payment-methods`, `/api/payments`, provider routes và `/api/lookup` | Giữ phiên checkout, phương thức đã liên kết, tạo pledge/đơn và webhook |
| Admin/KYC | `/api/admin/**`, `/api/kyc/status`, `/api/kyc/submit` | Moderation, badge, user status và KYC |
| Notifications/telemetry | `/api/notifications`, `/api/internal/assistant-telemetry`, `/api/public/assistant-telemetry` | Thông báo và telemetry theo quyền riêng |
| Jobs/uploads | `/api/cron/**`, `/api/upload` | Tác vụ định kỳ và media upload |

## 3. Authentication và callback

Trang login/register nhận `callbackUrl` nội bộ để người dùng quay lại đúng checkout sau khi xác thực. Callback hợp lệ phải là đường dẫn nội bộ bắt đầu bằng một dấu `/`, không được là `//` hoặc URL ngoài domain. Credential success, Google callback và fallback register đều phải bảo toàn callback này.

Luồng credential tổng quát là: người dùng gửi email/password, server hash/compare bằng bcrypt, NextAuth tạo session và client điều hướng đến callback hợp lệ. Password reset không dùng session cũ để cấp quyền; quyền được cấp tạm thời bằng token ngẫu nhiên trên URL, token được hash trong database, kiểm tra expiry/usedAt và bị vô hiệu hóa sau khi đổi password.

## 4. API quên mật khẩu

### `POST /api/auth/forgot-password`

API nhận email đã chuẩn hóa. Nếu email tồn tại và phù hợp reset, server tạo token ngẫu nhiên, lưu hash trong `password_reset_tokens`, xóa hoặc vô hiệu hóa token cũ và gửi link qua Resend khi môi trường đã cấu hình. Response phải giống nhau cho email tồn tại và không tồn tại để chống email enumeration.

### `POST /api/auth/reset-password`

API nhận token và password mới. Server hash token để tìm bản ghi chưa dùng, kiểm tra thời hạn 30 phút, yêu cầu mật khẩu tối thiểu 8 ký tự, hash bằng bcrypt, cập nhật user và đánh dấu token đã dùng. Không log token, password hoặc link reset ở production.

## 5. Checkout mới

UI chỉ trình bày hai lựa chọn:

| Method | Điều kiện | Kết quả |
|---|---|---|
| `ONLINE` | Có thể dùng guest; nếu liên kết/sử dụng payment method đã lưu thì cần đăng nhập | Tạo pledge pending và chuyển sang hosted checkout/provider flow |
| `COD` | Reward phải `AVAILABLE`, có stock, thông tin giao hàng và định danh cần thiết | Tạo đơn/pledge chờ giao, không redirect sang cổng thanh toán |

`paymentMethodId` phải được kiểm tra thuộc user hiện tại và ở trạng thái `ACTIVE`. Client không được gửi raw card number, CVV, OTP, mật khẩu ngân hàng hoặc token tự phát. `payment_methods` chỉ nhận provider-issued reference và metadata masked sau callback/provider verification.

Tồn kho, quan hệ campaign/reward, campaign active, quantity và điều kiện COD phải được kiểm tra server-side. Phần client chỉ hỗ trợ trải nghiệm và không phải nguồn sự thật về giá, stock hay payment status.

## 6. Provider legacy và trạng thái thật

Repository vẫn có route PayOS, SePay, VNPay và MoMo riêng cùng webhook tương ứng. Đây là các tích hợp tồn tại từ các giai đoạn trước và không nên tiếp tục hiển thị như bốn lựa chọn QR trong checkout mới. Checkout mới gom thành một hosted route; provider cụ thể phải được cấu hình bằng merchant credentials, callback/IPN ký xác thực và quyền tokenization phù hợp.

Hiện kiến trúc token-provider là lớp sẵn sàng, không được tuyên bố là đã liên kết một chạm MoMo/ZaloPay/ngân hàng/thẻ production. Platform không truy cập số dư và không lưu credential tài chính. PayOS helper hiện có cũng cần được xác minh credential/runtime trước khi coi là production-ready.

## 7. Webhook và xác nhận trạng thái

Webhook phải xác minh chữ ký, tìm pledge bằng mã tham chiếu an toàn, kiểm tra idempotency và chỉ cập nhật trạng thái hợp lệ. Không tin request từ browser để đánh dấu paid. `payment-success` cần phân biệt online paid/pending với COD pending delivery; `lookup` chỉ tra cứu trạng thái, không tự xác nhận thanh toán.

## 8. Checklist khi thêm API

| Kiểm tra | Câu hỏi |
|---|---|
| Authentication | Route có cần session hay public? |
| Authorization | User có sở hữu entity hoặc có role phù hợp không? |
| Validation | Input có schema/Zod và giới hạn kích thước không? |
| Data integrity | Có transaction/unique/index/foreign key cần dùng không? |
| Privacy | Response có lộ email, token, credential hoặc dữ liệu người khác không? |
| Payments | Có chống client tự sửa amount/status/provider không? |
| Observability | Log có tránh body nhạy cảm và có request correlation cần thiết không? |

## References

[1]: ../../src/app/api "Các route handler hiện tại"
[2]: ../../src/lib/auth.ts "Logic credential/auth"
[3]: ../../src/lib/password-reset.ts "Helper password reset và email"
[4]: ../../src/app/api/payments/route.ts "API checkout/payment mới"
[5]: ../../src/app/api/checkout-sessions/route.ts "API checkout session"
[6]: ../../src/app/api/payment-methods/route.ts "API payment method metadata"
[7]: ../../src/app/api/auth/forgot-password/route.ts "API yêu cầu reset"
[8]: ../../src/app/api/auth/reset-password/route.ts "API thực hiện reset"
