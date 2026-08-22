# Mô hình dữ liệu hiện tại

Tài liệu này là bản tóm tắt theo `prisma/schema.prisma` hiện tại. Đây là nguồn tham chiếu nghiệp vụ cho các entity PostgreSQL; tên bảng thực tế có thể dùng snake_case qua `@@map` [1].

## 1. Nhóm tài khoản và quyền

| Entity | Vai trò |
|---|---|
| `users` | Tài khoản, email, password hash tùy loại đăng nhập, role, status, profile và quan hệ nội dung |
| `accounts` | Liên kết OAuth/NextAuth adapter |
| `sessions` | Session database nếu adapter sử dụng |
| `verification_tokens` | Token xác minh của NextAuth |
| `password_reset_tokens` | Token reset lưu hash, expiry và usedAt; không lưu token nguyên bản |
| `payment_methods` | Metadata an toàn và provider reference/token của phương thức đã liên kết |
| `user_badges`, `badges` | Huy hiệu và quan hệ user-badge |
| `kyc_submissions` | Trạng thái và dữ liệu KYC theo quy trình hiện tại |

Tài khoản OAuth có thể không có password. Chức năng reset chỉ phù hợp với tài khoản credential có email; API vẫn nên trả phản hồi chung để không tiết lộ tài khoản tồn tại.

## 2. Project, campaign và nội dung

```text
users ──< projects ──< campaigns
  │          │             │
  │          ├──< project_blogs >── blog_posts
  │          └──< project_rewards >─ rewards
  │                                │
  └────────────── owns/creates ─────┘
```

| Entity | Quan hệ và ý nghĩa |
|---|---|
| `projects` | Dự án do creator quản lý; có thể chứa campaigns, blog và rewards theo quan hệ trực tiếp/junction |
| `campaigns` | Chiến dịch gây quỹ; `projectId` có thể nullable để giữ hỗ trợ campaign độc lập trong code hiện tại |
| `blog_posts` | Bài viết của user; có thể độc lập hoặc liên kết project/campaign |
| `rewards` | Quà tặng/sản phẩm; có campaign/project tùy trường và bảng liên kết hiện hành |
| Bảng junction project-content | Bảo đảm một project có thể hiển thị campaign, blog và reward liên quan mà không sao chép entity |

Một số tài liệu cũ mô tả mọi campaign bắt buộc thuộc project. Khi code/schema hiện tại cho phép `projectId` nullable, tài liệu mới phải ghi rõ đó là khả năng đang tồn tại, không tự suy ra yêu cầu UI mới.

## 3. Reward/product và tồn kho

`rewards` dùng cho cả quà tặng của campaign và sản phẩm hiển thị theo kiểu thương mại điện tử. Các trường quan trọng gồm tên, mô tả, giá, media, stock, active/status, campaign/project association và `availability`.

| Availability | Nghiệp vụ |
|---|---|
| `AVAILABLE` | Hàng có sẵn; có thể mua như product và có thể dùng COD nếu API cho phép |
| `DEVELOPMENT` | Hàng đang phát triển; dùng pledge/support flow và có thể hiển thị ngày giao dự kiến |

Sản phẩm `AVAILABLE` không yêu cầu nhập ngày giao dự kiến trong form creator. Cả hàng có sẵn và hàng đang phát triển vẫn cần địa chỉ nếu là hàng vật lý; đây là quy tắc UI/API hiện hành cần được giữ nhất quán.

## 4. Pledge và payment

`pledges` là bản ghi đóng góp/đơn liên quan tới campaign hoặc reward. Schema hiện tại có `quantity` và `isCashOnDelivery`; trạng thái payment và provider được dùng để phân biệt pending, paid, failed hoặc COD chờ xử lý theo route.

`payment_methods` chỉ nên lưu `provider`, `methodType`, `providerMethodRef`, label, brand, last4, status, timestamps và user relation. Không lưu PAN, CVV, OTP, password ngân hàng/ví hoặc số dư.

`checkout_sessions` là payload tạm thời để giữ lựa chọn trước khi khách guest đăng nhập/đăng ký. Session có owner nullable trước claim, expiry, status và payload JSON. Payload có thể gồm campaign/reward, amount, tip, quantity, COD, shipping, anonymous và payment method id; không được chứa dữ liệu thẻ thô.

## 5. Trạng thái và ràng buộc cần bảo vệ

| Ràng buộc | Nơi phải kiểm tra |
|---|---|
| Reward thuộc campaign được chọn | API checkout/payment |
| Campaign đang hoạt động/cho phép nhận | API checkout/payment |
| Quantity dương và stock đủ | API payment, transaction nếu reserve/decrement |
| COD chỉ cho `AVAILABLE` | API payment và UI |
| Payment method thuộc user hiện tại và còn `ACTIVE` | API payment-methods/payment |
| Token reset chưa dùng và chưa hết hạn | API reset password |
| User chỉ sửa/xóa nội dung của mình hoặc admin | Route handlers/service layer |
| Project association hợp lệ | Project/campaign/blog/reward API |

## 6. Quan hệ dữ liệu phụ trợ

Schema còn có các nhóm reviews, comments, likes, bookmarks, follows, reports, notifications, campaign updates, transactions, uploads và taxonomy. Các nhóm này phục vụ tương tác và quản trị; khi sửa entity chính cần kiểm tra foreign key, cascade/set-null và quyền truy cập tương ứng thay vì chỉ đổi UI.

## 7. Migration hiện hành cần chú ý

Các migration checkout và reset password đã được tạo trong repository, nhưng migration production chỉ nên chạy qua `prisma migrate deploy` trong build sau khi kiểm tra `DATABASE_URL` đúng môi trường. Không chạy migration hoặc seed phá dữ liệu production chỉ để kiểm tra giao diện.

## References

[1]: ../../prisma/schema.prisma "Schema Prisma hiện tại"
[2]: ../../prisma/migrations "Các migration PostgreSQL"
[3]: ../FULL_DATABASE_SCHEMA.md "Mô tả schema lịch sử"
[4]: ../PROJECT_VS_CAMPAIGN_ANALYSIS.md "Phân tích project/campaign lịch sử"
[5]: ../../src/app/api "API thao tác dữ liệu"
