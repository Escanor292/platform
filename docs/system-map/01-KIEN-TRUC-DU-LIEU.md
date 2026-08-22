# Kiến trúc và mô hình dữ liệu hiện hành

## 1. Kiến trúc runtime

```text
Browser
  │ HTTPS / fetch
  ▼
Next.js 15 App Router
  ├─ Server/Client Components
  ├─ src/app/api/**/route.ts
  ├─ NextAuth middleware/session
  ├─ Prisma Client ── PostgreSQL
  ├─ MongoDB native driver ── chat/realtime/supporting content
  ├─ Cloudinary ── media khi đã cấu hình
  └─ Payment providers ── hosted checkout/webhook
```

`src/app/` chứa page, layout và route handler; `src/components/` chứa UI dùng lại; `src/contexts/` chứa trạng thái chia sẻ; `src/lib/` chứa auth, Prisma, payment, validation và domain service; `prisma/` chứa schema/client/migration; `scripts/` chứa seed, utility và test; `docs/` chứa tài liệu hiện hành và archive.

Production build dùng `prisma generate && prisma migrate deploy && next build` theo `package.json`. Database migration phải được review, không dùng `db push` như quy trình production mặc định.

## 2. Các miền nghiệp vụ

### Identity và quyền

`users` là trung tâm liên kết hồ sơ, role, campaign, project, reward, blog, pledge, payment method và password reset. Role hiện có các cấp backer, creator pending, creator và admin; tài khoản OAuth có thể không có password. Server phải lấy user từ session, không tin `userId` hoặc `role` do client gửi.

### Project, campaign và reward/product

`projects` là entity riêng. `campaigns.projectId` có thể nullable theo code hiện hành; campaign có thể độc lập nếu route nghiệp vụ cho phép. Project có quan hệ với campaign, blog và reward. `rewards` đại diện cho quà tặng hoặc sản phẩm, có media, giá tối thiểu, trạng thái hoạt động, tồn kho và loại `AVAILABLE` hoặc `DEVELOPMENT`. Reward có thể gắn campaign/project hoặc đứng độc lập tùy luồng tạo.

Sản phẩm có sẵn dùng trải nghiệm mua hàng và có thể COD; sản phẩm đang phát triển dùng pledge/support flow và có thể hiển thị ngày giao dự kiến. Client chỉ hiển thị, còn campaign/reward relationship, amount, stock và availability phải được kiểm tra server-side.

### Blog và nội dung

Blog post liên kết với author và có thể liên kết project/campaign. Source hiện có status draft/review/published/archived/rejected, visibility, category, tag, comment, like, bookmark, report và rich-text product block. Blog độc lập vẫn được hỗ trợ. Nội dung cần được sanitize trước khi render; quyền sửa/xuất bản thuộc author hoặc admin theo route.

### Chat

Chat hiện dùng MongoDB cho conversation/message/realtime data và PostgreSQL để enrich user. Các khả năng chính gồm direct/campaign conversation, gửi/xóa tin nhắn mềm, unread/read state, search, reaction/emoji, typing, block/report, reveal tin nhạy cảm và gọi thoại/video WebRTC. Khi user bị xóa, UI phải hiển thị `Người dùng đã xóa`, không truy cập tên/avatar không còn tồn tại.

### Payment và checkout

Schema mới có checkout session, payment method metadata/token provider, quantity, COD flag và reward availability. Checkout gom giao diện thành `ONLINE` hoặc `COD`; thông tin thẻ, ví và ngân hàng phải được thu thập bởi hosted provider. Platform không lưu PAN, CVV, OTP, mật khẩu ngân hàng/ví hoặc số dư.

### KYC, badge và moderation

Source có route KYC submit/status, badge service/admin, campaign review, reports, blacklist và audit service. Một số acceptance criteria chi tiết trong SRS cũ là yêu cầu lịch sử; muốn coi là hoàn tất phải kiểm tra route, schema, migration và runtime tương ứng.

## 3. Quan hệ dữ liệu khái quát

```text
User
 ├─ Projects ── Campaigns ── Rewards ── Pledges
 ├─ Blog posts ── categories/tags/comments/likes/bookmarks/reports
 ├─ Conversations ── Messages ── reactions/read state
 ├─ Payment methods ── Checkout sessions
 ├─ KYC / Badges / Notifications
 └─ Password reset tokens
```

Các bảng junction cho project/campaign/blog/reward cho phép liên kết nội dung mà không biến project thành alias của campaign. Snapshot DBML PostgreSQL nằm ở [`../DATABASE_SCHEMA_DBML.txt`](../DATABASE_SCHEMA_DBML.txt); snapshot MongoDB collection/index nằm ở [`../MONGODB_SCHEMA_DBML.txt`](../MONGODB_SCHEMA_DBML.txt). Hai file chỉ là tài liệu sinh/đối chiếu, không thay thế source. Mọi thay đổi schema phải đi cùng migration tương ứng, regenerate Prisma client và cập nhật caller/type.

## 4. Điểm cần kiểm tra trước khi sửa

| Thay đổi | Cần kiểm tra |
|---|---|
| Thêm field/schema | Prisma schema, migration, generated client, seed và API |
| Thêm route | Session, ownership/role, input validation, response privacy |
| Sửa reward/product | Availability, stock, campaign/project relation và creator ownership |
| Sửa blog rich text | Sanitize, link entity, visibility và preview |
| Sửa chat | Participant, MongoDB shape, read/unread, deleted-user fallback |
| Sửa payment | Provider callback, idempotency, amount/stock server-side và không log secret |

## References

- [`../../prisma/schema.prisma`](../../prisma/schema.prisma)
- [`../../prisma/migrations/`](../../prisma/migrations/)
- [`../../src/app/`](../../src/app/)
- [`../../src/components/`](../../src/components/)
- [`../../src/lib/`](../../src/lib/)
