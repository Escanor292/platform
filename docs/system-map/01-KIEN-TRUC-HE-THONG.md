# Kiến trúc hệ thống hiện hành

Tài liệu này mô tả kiến trúc đang có trong repository tại commit `9bf7ad1`. Nó được chuẩn hóa từ tài liệu kiến trúc cũ và đối chiếu với cấu trúc `src/`, `prisma/` và `package.json` hiện tại [1] [2].

## 1. Tổng quan runtime

```text
Trình duyệt
   │ HTTPS / fetch
   ▼
Next.js 15 App Router
   ├── Server Components và Client Components
   ├── Route handlers: src/app/api/**/route.ts
   ├── Middleware và NextAuth
   ├── Prisma Client ───── PostgreSQL
   ├── MongoDB native driver ───── chat, realtime/supporting content
   ├── Cloudinary ───── media upload nếu được cấu hình
   └── Payment providers ───── PayOS/SePay hiện hữu; adapter mở rộng cho hosted checkout
```

Mọi request đi qua giao diện hoặc route handler. Route handler cần xác thực input, kiểm tra session/quyền sở hữu, thực hiện nghiệp vụ và trả JSON hoặc redirect. PostgreSQL là nguồn dữ liệu quan hệ chính. MongoDB được dùng cho một số vùng dữ liệu phụ trợ, đặc biệt là chat và nội dung liên quan; không nên suy ra rằng mọi dữ liệu trong tài liệu cũ còn nằm ở MongoDB nếu source hiện tại không gọi nó.

## 2. Cấu trúc source

| Vùng | Vai trò hiện tại |
|---|---|
| `src/app/` | Page, layout và App Router route handler |
| `src/app/api/` | Backend HTTP API; hiện snapshot có 102 `route.ts` |
| `src/components/` | Component giao diện dùng lại; hiện snapshot có 148 file TypeScript/TSX |
| `src/contexts/` | Trạng thái UI chia sẻ, nổi bật là `CampaignContext` |
| `src/hooks/` | Hook cho auth, campaign, pledge và UI |
| `src/lib/` | Prisma, auth, payment, project service, validation và utility |
| `src/types/` | Kiểu dữ liệu frontend/backend dùng chung |
| `prisma/` | Schema, generated client và migration PostgreSQL |
| `scripts/` | Seed, khởi tạo MongoDB/chat/blog, test và công cụ audit |
| `public/` | Tài nguyên tĩnh |
| `docs/` | Tài liệu kỹ thuật, báo cáo lịch sử và bộ bản đồ hệ thống này |

## 3. Các miền chức năng

### 3.1. Identity và authentication

NextAuth v5 beta được dùng cho session và credential/Google login. User có email duy nhất, password có thể null cho tài khoản OAuth, role `BACKER`, `CREATOR_PENDING`, `CREATOR` hoặc `ADMIN`, cùng trạng thái tài khoản. Luồng reset mật khẩu sử dụng bảng `password_reset_tokens`, hash token và thời hạn 30 phút; chi tiết nằm trong tài liệu API/auth.

### 3.2. Campaign và project

`projects` là entity độc lập trong schema hiện tại, không còn chỉ là alias của campaign như một số tài liệu cũ mô tả. Campaign có `projectId` nullable, vì vậy campaign độc lập vẫn được hỗ trợ. Project có thể liên kết campaign, blog, reward trực tiếp và qua bảng junction. Quan hệ chi tiết được mô tả ở `02-MO-HINH-DU-LIEU.md`.

### 3.3. Reward/product

`rewards` là entity dùng cho quà tặng hoặc sản phẩm. Reward có thể thuộc campaign, project hoặc không thuộc project/campaign tùy nghiệp vụ hiện hành; có media, giá tối thiểu, tồn kho, trạng thái hoạt động, loại `AVAILABLE` hoặc `DEVELOPMENT`. Product detail, creator management và pledge/checkout dùng chung entity này.

### 3.4. Blog/content

Blog post có author, có thể gắn campaign hoặc project, có trạng thái draft/review/published/archived/rejected, visibility và các bảng liên kết category, tag, comment, like, bookmark. Nội dung rich text có thể lưu trong PostgreSQL hoặc tham chiếu content phụ trợ tùy route/component.

### 3.5. Chat

Chat có conversation, messages, reactions, reveal nội dung nhạy cảm, read state, typing, search, block/report/delete và unread count. Một số chi tiết realtime/WebRTC nằm ở component và service; MongoDB được bật qua các feature flag tương ứng. Khi user bị xóa, UI phải dùng nhãn trung lập “Người dùng đã xóa” thay vì truy cập tên/avatar không còn tồn tại.

### 3.6. Payment và checkout

Checkout mới gom lựa chọn thành một tuyến `ONLINE` hoặc `COD`. Hosted checkout chịu trách nhiệm thu thập thông tin ví/ngân hàng/thẻ bên provider. Platform chỉ lưu payment method metadata và provider-issued reference/token nếu provider cho phép. COD chỉ dành cho reward `AVAILABLE`, yêu cầu thông tin giao hàng và tạo pledge chờ xử lý; không được coi là giao dịch online đã thanh toán.

## 4. Build và triển khai

`package.json` định nghĩa `vercel-build` là `prisma generate && prisma migrate deploy && next build`. Vì vậy deployment production phụ thuộc vào biến `DATABASE_URL`, migration hợp lệ và Prisma client tương thích. Không dùng `prisma db push` như quy trình production mặc định; migration phải được review trước khi deploy [2].

## 5. Sơ đồ thư mục tra cứu nhanh

```text
src/app/
├── api/                    # HTTP API
├── auth/                   # login, register, forgot/reset password
├── campaigns/              # discovery, detail, create, pledge
├── projects/               # project discovery/detail
├── products/               # product/reward detail
├── blog/                   # blog pages
├── chat/                   # conversation UI
└── dashboard/              # admin, creator, backer

src/components/
├── campaign/               # pledge, campaign cards/detail
├── products/               # product card/detail/checkout trigger
├── chat/                   # chat shell, message, call/reaction UI
├── blog/                   # editor, cards, content blocks
├── project/                # project management/detail
└── ui/                     # primitives and shared design components
```

## 6. Nguyên tắc kiến trúc

Mã nguồn nên giữ ranh giới giữa route handler và component, không để client tự quyết định ownership, payment status, stock hoặc quyền creator. Dữ liệu nhạy cảm chỉ đi qua provider-hosted UI hoặc callback đã xác thực. Thay đổi schema phải đi cùng migration; thay đổi API cần cập nhật caller, type và tài liệu chuyên đề.

## References

[1]: ../../prisma/schema.prisma "Schema Prisma hiện tại"
[2]: ../../package.json "Cấu hình scripts và dependencies"
[3]: ../3.1_KIEN_TRUC_HE_THONG.md "Tài liệu kiến trúc lịch sử"
[4]: ../../src/app "App Router và route handlers"
[5]: ../../src/components "Component giao diện"
