# Software Requirements Specification — Tử Tế Fund

**Phiên bản:** 1.1
**Ngày lập:** 22/08/2026
**Tác giả:** Manus AI
**Trạng thái:** Baseline kỹ thuật dựa trên source hiện tại
**Repository:** [`Escanor292/platform`](https://github.com/Escanor292/platform)

> Tài liệu này mô tả hệ thống Tử Tế Fund theo hai lớp: **yêu cầu sản phẩm cần duy trì** và **trạng thái đã quan sát trong source**. Một tính năng có API, UI hoặc schema chưa đồng nghĩa đã sẵn sàng production. Các nhãn **Đã xác nhận**, **Có code — cần xác minh runtime** và **Khoảng trống/đề xuất** được dùng xuyên suốt tài liệu.

---

## 1. Mục đích và cách sử dụng

SRS này là baseline chung cho product owner, developer, QA, reviewer migration, người vận hành và người tích hợp provider. Mục tiêu là trả lời bốn câu hỏi: nền tảng làm gì, ai được phép làm gì, dữ liệu và luồng nghiệp vụ được ràng buộc ra sao, và phần nào vẫn cần kiểm thử hoặc xác minh trên môi trường thật.

Nguồn sự thật của SRS là mã nguồn, schema, migration và cấu hình runtime. Khi tài liệu cũ hoặc acceptance criteria lịch sử mâu thuẫn với source, ưu tiên `prisma/schema.prisma`, `src/`, `prisma/migrations/`, `package.json` và cấu hình deployment.[1] [2] Các DBML dưới `docs/` chỉ là snapshot dễ đọc, không thay thế source.[3] [4]

### 1.1 Quy ước trạng thái

| Nhãn | Ý nghĩa |
|---|---|
| **Đã xác nhận** | Có thể kiểm tra trực tiếp trong source/schema/migration và mô tả đúng hành vi hiện tại. |
| **Có code — cần xác minh runtime** | Có route, service hoặc UI nhưng còn phụ thuộc database, secret, provider, cron, webhook, seed hoặc deployment. |
| **Khoảng trống** | SRS yêu cầu hoặc kỳ vọng sản phẩm nhưng chưa đủ bằng chứng trong source để coi là đã hoàn tất. |
| **Lịch sử** | Nội dung từ spec/report cũ; chỉ dùng để truy nguyên, không dùng làm trạng thái release. |

### 1.2 Mức ưu tiên

| Mức | Diễn giải |
|---|---|
| **P0** | Cản trở đăng nhập, phân quyền, dữ liệu, thanh toán hoặc an toàn; phải xử lý trước release. |
| **P1** | Ảnh hưởng trực tiếp đến luồng chính, doanh thu, moderation hoặc trải nghiệm cốt lõi. |
| **P2** | Cải thiện hoàn thiện sản phẩm, quản trị, hiệu năng hoặc khả năng bảo trì. |
| **P3** | Nâng cấp sau khi baseline ổn định. |

---

## 2. Tổng quan sản phẩm

Tử Tế Fund là nền tảng kết hợp **crowdfunding/ủng hộ chiến dịch**, **catalog sản phẩm hoặc phần quà**, **project hub của nhà sáng tạo**, **blog rich-content** và **cộng đồng chat**. Người dùng có thể khám phá chiến dịch, dự án, sản phẩm, bài viết và hồ sơ; người sáng tạo quản lý project/campaign/reward/blog; backer thực hiện ủng hộ hoặc mua sản phẩm; admin kiểm duyệt, quản lý người dùng, badge, báo cáo và nội dung.

Ứng dụng hiện chạy trên Next.js App Router, React 19 và Tailwind CSS. PostgreSQL qua Prisma là kho dữ liệu quan hệ trung tâm; MongoDB native driver phục vụ chat và các dữ liệu phụ trợ như blog content, notification, analytics, audit/activity log, campaign content và user metadata. Media đi qua upload/Cloudinary khi môi trường được cấu hình.[2] [5]

### 2.1 Mục tiêu kinh doanh

| Mục tiêu | Kết quả mong muốn |
|---|---|
| Hỗ trợ gây quỹ minh bạch | Campaign có mục tiêu, trạng thái, thời gian, tiến độ, pledge, cập nhật và review. |
| Hỗ trợ creator xây dựng hệ sinh thái | Creator có project trung tâm liên kết campaign, blog và reward/product. |
| Kết hợp ủng hộ với thương mại | Reward có thể là sản phẩm có sẵn hoặc phần quà đang phát triển; có tồn kho, số lượng, media và giao nhận phù hợp. |
| Tăng khả năng giữ chân cộng đồng | Blog, follow, like, bookmark, comment, notification và chat. |
| Bảo vệ người dùng và nền tảng | Auth, KYC, role/status, report, blacklist, audit log, validation server-side và không lưu dữ liệu thanh toán nhạy cảm. |

### 2.2 Phạm vi trong SRS

SRS bao gồm public discovery, tài khoản, creator/project/campaign/reward, blog/editor, cart/checkout/payment, chat, notification, KYC, moderation/admin, media upload, MongoDB supporting services, cron, telemetry, testing và deployment assumptions.

### 2.3 Ngoài phạm vi hoặc chưa đủ bằng chứng

SRS không coi provider payment thật, WebRTC signaling production, email delivery production, cron scheduler production, backup/restore database, SLA pháp lý, thuế, vận chuyển bên thứ ba hoặc KYC verification bên ngoài là đã hoàn thành nếu source chỉ có scaffolding hoặc route thử nghiệm. Các nội dung này được ghi rõ trong phần rủi ro và khoảng trống.

---

## 3. Bối cảnh hệ thống và kiến trúc logic

### 3.1 Kiến trúc cấp cao

```text
Browser / Mobile Web
        │ HTTPS
        ▼
Next.js 15 App Router
  ├─ Server and Client Components
  ├─ Route handlers: src/app/api/**/route.ts
  ├─ NextAuth v5 + middleware
  ├─ Prisma Client ───────── PostgreSQL
  ├─ MongoDB native driver ─ chat/realtime/supporting content
  ├─ Upload/Cloudinary ───── image/video/media
  └─ Payment providers ───── hosted checkout/webhook/scaffolding
```

Build production được khai báo là `prisma generate && prisma migrate deploy && next build`; scripts test, seed, Mongo init, chat init và blog init được khai báo trong `package.json`.[2] Các biến kết nối và secret phải được cấu hình ngoài source; file environment reference được giữ riêng theo yêu cầu vận hành nhưng không phải nguồn runtime.[5]

### 3.2 Các bounded context

| Context | Trách nhiệm | Kho dữ liệu chính |
|---|---|---|
| Identity | Đăng ký, đăng nhập, OAuth, session, password reset, status/role | PostgreSQL + JWT session |
| Profile/KYC | Hồ sơ, privacy/notification settings, upgrade creator, KYC | PostgreSQL + media |
| Project | Hub creator, hero background, rich description, liên kết content/reward | PostgreSQL |
| Campaign | Chiến dịch, trạng thái, mục tiêu, update, follow, report, review | PostgreSQL; Mongo supporting content khi bật |
| Reward/Product | Phần quà/sản phẩm, availability, stock, price, media, review | PostgreSQL |
| Blog | Post, category/tag, editor, draft/publish, engagement, product box | PostgreSQL + Mongo content/version/view log |
| Payment | Pledge, order-like checkout, COD/online, payment method metadata, webhook | PostgreSQL + provider |
| Chat | Conversation, messages, read/unread, reaction, sensitive reveal, notes, report/block, calls | MongoDB + PostgreSQL user enrichment |
| Notification | Notification list/read/TTL và event delivery | MongoDB hoặc fallback theo service |
| Trust/Admin | Badge, report, blacklist, KYC review, audit | PostgreSQL + Mongo audit/activity |
| Analytics/Telemetry | Assistant telemetry, analytics events, operational logs | PostgreSQL/Mongo tùy service flag |

---

## 4. Stakeholder và actor

| Actor | Mục tiêu | Quyền/trách nhiệm chính |
|---|---|---|
| Visitor | Khám phá nội dung | Xem public campaign, project, product, blog, profile và tra cứu giao dịch ở mức được phép. |
| Backer | Ủng hộ hoặc mua sản phẩm | Đăng ký/đăng nhập khi cần, pledge, chọn COD/online, theo dõi trạng thái, review sản phẩm/campaign, follow và chat. |
| Creator pending | Hoàn thiện điều kiện creator | Cập nhật hồ sơ/KYC và chờ platform/admin phê duyệt theo policy. |
| Creator | Xây dựng và vận hành nội dung | CRUD project/campaign/reward/blog, quản lý update, liên kết dữ liệu, xem statement và xử lý tương tác. |
| Admin | Trust, safety và vận hành | Review campaign/blog, quản lý user status, badge, reports, moderation, analytics/revenue tùy UI/API. |
| Provider | Xác nhận giao dịch hoặc media | Hosted checkout, callback/webhook, upload/media; provider không được thay thế validation server-side. |
| Scheduler | Dọn dẹp và đồng bộ trạng thái | Gọi cron cleanup payments và update campaign status; cần xác minh trigger/secret production. |
| Database operator | Duy trì lưu trữ | Apply migration, index, TTL, backup/recovery và kiểm tra drift giữa source với database thật. |

---

## 5. Yêu cầu chức năng

### 5.1 Identity, authentication và account recovery

| ID | Yêu cầu | Trạng thái | Ưu tiên |
|---|---|---|---|
| FR-AUTH-001 | Người dùng phải đăng ký bằng email, mật khẩu, tên và thông tin cần thiết; email được chuẩn hóa/kiểm tra theo route. | Đã xác nhận | P0 |
| FR-AUTH-002 | Hệ thống hỗ trợ đăng nhập Credentials bằng email/password đã bcrypt hash. | Đã xác nhận | P0 |
| FR-AUTH-003 | Hệ thống hỗ trợ Google OAuth khi `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET` hợp lệ. | Có code — cần xác minh runtime | P1 |
| FR-AUTH-004 | Session dùng JWT và expose tối thiểu `id`, `role`, `status`, `isAdmin` cho server/UI. | Đã xác nhận | P0 |
| FR-AUTH-005 | Public route phải cho phép visitor xem nội dung public; protected route phải redirect người chưa đăng nhập đến login với callback URL an toàn cùng origin. | Đã xác nhận trong middleware/config | P0 |
| FR-AUTH-006 | Người đã đăng nhập không được quay lại login/register nếu không cần; callback URL phải chống open redirect. | Đã xác nhận | P1 |
| FR-AUTH-007 | Forgot password phải trả phản hồi tổng quát, không tiết lộ email có tồn tại hay không. | Đã xác nhận | P0 |
| FR-AUTH-008 | Reset password dùng token hash SHA-256, hết hạn sau 30 phút, dùng một lần và cập nhật password atomically. | Đã xác nhận trong source | P0 |
| FR-AUTH-009 | Không được tin `userId`/`role` từ client cho quyết định quyền; server lấy identity từ session và kiểm tra ownership. | Yêu cầu bảo mật bắt buộc | P0 |
| FR-AUTH-010 | Tài khoản bị banned/inactive phải được xử lý nhất quán ở login, middleware, API và UI. | Có code — cần kiểm thử xuyên luồng | P0 |

Cơ chế thực tế nằm ở `src/lib/auth.ts`, `src/auth.config.ts`, `src/middleware.ts` và các route auth.[6] [7] Password reset lưu các trường tokenHash, expiresAt, usedAt và userId trong PostgreSQL.[1]

### 5.2 Profile, role, creator upgrade và KYC

| ID | Yêu cầu | Trạng thái | Ưu tiên |
|---|---|---|---|
| FR-PROF-001 | Người dùng có thể xem hồ sơ public gồm tên hiển thị, avatar, cover, bio, location, website/social và nội dung public. | Đã xác nhận ở page/API/schema | P1 |
| FR-PROF-002 | Người dùng có thể chỉnh sửa hồ sơ và privacy/notification settings bằng route có auth. | Đã xác nhận | P1 |
| FR-PROF-003 | Hệ thống phân biệt backer, creator pending, creator và admin; role không được nâng bằng input tùy ý. | Đã xác nhận ở schema/source | P0 |
| FR-PROF-004 | Người dùng có thể gửi yêu cầu upgrade creator; hệ thống phải lưu trạng thái và hiển thị kết quả rõ ràng. | Có code — cần xác minh policy/runtime | P1 |
| FR-PROF-005 | KYC submit/status phải kiểm tra session, validate dữ liệu, lưu ảnh giấy tờ an toàn và không hiển thị tùy tiện cho public. | Có code — cần review bảo mật/runtime | P0 |
| FR-PROF-006 | Admin có thể cập nhật status người dùng và quản lý badge theo quyền admin. | Đã xác nhận route | P1 |
| FR-PROF-007 | Khi user bị xóa hoặc không còn lookup được, các UI liên quan chat/profile phải hiển thị fallback `Người dùng đã xóa`. | Đã xác nhận trong chat UI/service | P1 |

### 5.3 Project management

Project là entity trung tâm của creator, có title/slug/description, rich description, cover image và cấu hình hero background kiểu ảnh hoặc màu/gradient. Project có quan hệ với campaigns, blog posts, rewards và các bảng junction project-blog/project-reward.[1] [8]

| ID | Yêu cầu | Trạng thái | Ưu tiên |
|---|---|---|---|
| FR-PROJ-001 | Creator hợp lệ có thể tạo project với thông tin cơ bản, slug và mô tả. | Đã xác nhận API/UI | P1 |
| FR-PROJ-002 | Creator chỉ được sửa/xóa project thuộc quyền sở hữu; API phải validate CUID/ID và ownership server-side. | Đã xác nhận | P0 |
| FR-PROJ-003 | Project editor hỗ trợ rich description, preview và upload media theo policy upload. | Đã xác nhận UI | P1 |
| FR-PROJ-004 | Creator có thể chọn hero background bằng cover image hoặc một/multiple mã màu với gradient angle. | Đã xác nhận UI/schema | P2 |
| FR-PROJ-005 | Creator có thể liên kết blog posts và rewards vào project, gồm nội dung draft khi policy cho phép. | Đã xác nhận UI/schema | P1 |
| FR-PROJ-006 | Public project page phải hiển thị campaign, blog, product/reward được liên kết cùng thông tin creator. | Có code — cần kiểm thử dữ liệu rỗng và quyền | P1 |
| FR-PROJ-007 | Xóa project phải có policy rõ ràng về campaign, blog, reward và junction; không làm mất dữ liệu ngoài quan hệ cascade đã định nghĩa. | Có code — cần review destructive action | P0 |
| FR-PROJ-008 | Project có thể tồn tại không có campaign/blog/reward; UI phải có empty state và không lỗi render. | Yêu cầu UX | P1 |

### 5.4 Campaign management và discovery

Campaign có code, slug, title, description, category/tags, goal/current amount, status, type, dates, creator, image/video và tùy chọn `projectId`. API hiện cho phép campaign không gắn project; nếu product policy mới yêu cầu mọi campaign bắt buộc thuộc project thì đây là khoảng trống cần thay đổi schema/validation/UI, không được ghi là đã hoàn tất.[1] [9]

| ID | Yêu cầu | Trạng thái | Ưu tiên |
|---|---|---|---|
| FR-CAMP-001 | Visitor có thể duyệt, tìm kiếm, lọc, sắp xếp và phân trang campaign public. | Đã xác nhận page/API | P1 |
| FR-CAMP-002 | Creator có thể tạo campaign với goal, category, tags, type, media, thời gian và mô tả. | Đã xác nhận API/UI | P1 |
| FR-CAMP-003 | Khi gắn project, campaign chỉ được gắn vào project thuộc cùng creator. | Đã xác nhận server-side | P0 |
| FR-CAMP-004 | Campaign có lifecycle tối thiểu DRAFT, PENDING_REVIEW, ACTIVE và các trạng thái kết thúc/hủy theo enum/schema. | Đã xác nhận schema; cần test transition matrix | P0 |
| FR-CAMP-005 | Admin có thể review campaign pending và thông báo kết quả cho creator. | Đã xác nhận route/service | P1 |
| FR-CAMP-006 | Creator có thể sửa campaign theo ownership và policy; campaign đã có pledge không được xóa tùy tiện. | Đã xác nhận một phần | P0 |
| FR-CAMP-007 | Creator có thể hủy campaign theo điều kiện nghiệp vụ; hệ thống phải bảo toàn pledge/audit và xử lý giao dịch liên quan. | Có code — cần xác minh runtime | P0 |
| FR-CAMP-008 | Campaign có update với title/content/image/tags, pin và trạng thái publish. | Đã xác nhận API/schema | P1 |
| FR-CAMP-009 | Backer có thể follow/unfollow, review và report campaign theo điều kiện auth. | Đã xác nhận API | P1 |
| FR-CAMP-010 | Campaign detail phải liên kết creator, project nếu có, rewards, progress, updates, blogs và CTA pledge. | Đã xác nhận component/API ở mức luồng | P1 |
| FR-CAMP-011 | Hệ thống phải ngăn pledge vào campaign chưa ACTIVE hoặc ngoài thời gian nhận ủng hộ khi policy yêu cầu. | Đã xác nhận một phần trong payment route | P0 |
| FR-CAMP-012 | Public API phải có pagination/caching hợp lý và không leak dữ liệu private của creator/backer. | Có code — cần test | P1 |

### 5.5 Reward, product và catalog

Reward vừa đại diện phần quà crowdfunding vừa có thể được hiển thị như product. Schema cho phép campaignId/projectId nullable, availability `AVAILABLE` hoặc `DEVELOPMENT`, min/max amount, maxQuantity, stock, product images/video, deliveryDate, active flag và cờ đưa vào project.[1] [10]

| ID | Yêu cầu | Trạng thái | Ưu tiên |
|---|---|---|---|
| FR-REWARD-001 | Creator có thể tạo reward/product mới với title, description, giá, tồn kho/số lượng, delivery date và media. | Đã xác nhận UI/API | P1 |
| FR-REWARD-002 | Creator có thể tái sử dụng reward của campaign hoặc tạo reward độc lập theo luồng hiện tại. | Đã xác nhận UI/API | P1 |
| FR-REWARD-003 | Product có thể không thuộc project/campaign; nếu tạo trong campaign, API phải kiểm tra ownership và có thể kế thừa project của campaign. | Đã xác nhận một phần | P1 |
| FR-REWARD-004 | Creator có thể bật/tắt active/visibility và cờ `isIncludedInProject` theo quyền sở hữu. | Đã xác nhận | P1 |
| FR-REWARD-005 | Media upload hỗ trợ tối đa 8 ảnh và 1 video, mỗi file tối đa 30 MB theo UI hiện tại; server vẫn phải validate MIME/size. | Đã xác nhận UI; cần server audit | P1 |
| FR-REWARD-006 | Product detail phải hiển thị gallery, video nếu có, giá VND, discount/reference presentation nếu có, availability, stock, creator, project/campaign link và CTA phù hợp. | Có code — cần kiểm thử | P1 |
| FR-REWARD-007 | Sản phẩm `AVAILABLE` có thể dùng flow mua/COD; sản phẩm `DEVELOPMENT` không được dùng COD. | Đã xác nhận payment route | P0 |
| FR-REWARD-008 | Stock phải được decrement atomically trong COD flow và không được xuống âm; online flow phải có chiến lược reserve/release rõ ràng. | COD đã xác nhận; online reserve là khoảng trống | P0 |
| FR-REWARD-009 | Product review chỉ được tạo sau khi có điều kiện pledge/received phù hợp và mỗi pledge chỉ có review hợp lệ theo schema. | Có code — cần test policy | P1 |
| FR-REWARD-010 | Thẻ product trong chat/blog phải có ảnh/video nếu có và click được đến product detail hoặc external link hợp lệ. | Đã xác nhận UI một phần | P1 |

### 5.6 Blog, editor và product merchandising

Blog post có author, slug, title, excerpt, cover, status, type, visibility, publish time, counters và liên kết project/campaign. Editor production dùng Tiptap với heading/list/blockquote/code, link, underline, màu/highlight, alignment, task list, image-caption, video, callout và product box; renderer sanitize output bằng DOMPurify.[11] [12]

| ID | Yêu cầu | Trạng thái | Ưu tiên |
|---|---|---|---|
| FR-BLOG-001 | Visitor có thể xem danh sách và chi tiết bài blog public theo visibility/status. | Đã xác nhận | P1 |
| FR-BLOG-002 | User authenticated có thể tạo blog post; author hoặc admin mới được sửa/xóa/archive theo policy. | Đã xác nhận API | P0 |
| FR-BLOG-003 | Editor hỗ trợ autosave/debounced save, hiển thị trạng thái lưu, word count/character count và preview. | Đã xác nhận UI | P1 |
| FR-BLOG-004 | Editor hỗ trợ link HTTP(S), hình ảnh, video embed, callout, rich formatting và product box. | Đã xác nhận UI/extension | P1 |
| FR-BLOG-005 | Product box lưu payload đủ để render title, price, image và CTA; renderer phải sanitize và không cho XSS qua HTML/iframe. | Đã xác nhận một phần; cần security test | P0 |
| FR-BLOG-006 | Blog post có thể độc lập hoặc liên kết project/campaign theo validation ownership. | Đã xác nhận API/schema | P1 |
| FR-BLOG-007 | Blog type campaign update phải có campaignId; project link phải là project của author khi thêm/sửa. | Đã xác nhận API | P0 |
| FR-BLOG-008 | Author có thể publish; admin có thể review status và thông báo kết quả. | Đã xác nhận route | P1 |
| FR-BLOG-009 | Reader có thể like, bookmark, comment, reply và report; mỗi hành vi cần idempotency/unique constraint phù hợp. | Đã xác nhận schema/API | P1 |
| FR-BLOG-010 | Draft, version, content và view log Mongo phải được phân biệt với metadata/visibility PostgreSQL. | Có code — cần xác minh feature flag và runtime | P1 |

Các hình thức merchandising phù hợp với nền tảng là product box trong bài viết, inline text link, comparison table có kiểm soát và banner có moderation. Product box đã có evidence rõ nhất trong editor/renderer; comparison table/banner cần chuẩn hóa schema, sanitize, responsive behavior và tracking trước khi coi là baseline.

### 5.7 Cart, checkout và payment

#### 5.7.1 Nguyên tắc nghiệp vụ

Checkout hiện dùng hai phương thức logic `ONLINE` và `COD`. `POST /api/payments` xác thực campaign ACTIVE, reward thuộc campaign, amount, quantity, maxQuantity, stock, availability, email và shipping; COD decrement stock trong transaction rồi tạo pledge PENDING; online tạo pledge PENDING và trả hosted checkout/mock URL khi provider flow cho phép.[13]

| ID | Yêu cầu | Trạng thái | Ưu tiên |
|---|---|---|---|
| FR-PAY-001 | Hệ thống phải tính amount, tip, platform fee, VAT và total ở server; không tin total do client gửi. | Đã xác nhận một phần; cần test tamper | P0 |
| FR-PAY-002 | Campaign phải ACTIVE và reward phải active/đúng campaign trước khi tạo pledge. | Đã xác nhận | P0 |
| FR-PAY-003 | Quantity là số nguyên từ 1 đến 99; maxQuantity và stock phải được kiểm tra. | Đã xác nhận | P0 |
| FR-PAY-004 | COD chỉ dành cho reward availability `AVAILABLE`, yêu cầu email hợp lệ và shipping address. | Đã xác nhận | P0 |
| FR-PAY-005 | COD phải decrement stock atomically và tạo transactionId không trùng; lỗi hết hàng trả conflict, không tạo pledge dở dang. | Đã xác nhận ở route; cần integration test | P0 |
| FR-PAY-006 | Online phải tạo pledge PENDING, redirect đến hosted provider hoặc mock development; webhook phải idempotent và xác minh chữ ký. | Có code — provider readiness cần xác minh | P0 |
| FR-PAY-007 | Payment success/failure/refund phải cập nhật pledge, stock, invoice, audit và thông báo nhất quán. | Có code — cần state-machine/E2E test | P0 |
| FR-PAY-008 | Guest được phép đi vào checkout ở mức flow cho phép; khi cần login, checkout session phải lưu payload tối thiểu và hết hạn sau 30 phút. | Đã xác nhận API | P1 |
| FR-PAY-009 | User đăng nhập có thể khôi phục checkout session của chính mình, không truy cập session người khác. | Đã xác nhận API | P0 |
| FR-PAY-010 | Cart phải xử lý reward bị tắt, stock thay đổi, campaign kết thúc và price/availability thay đổi trước submit. | Khoảng trống cần E2E | P0 |
| FR-PAY-011 | Payment method liên kết chỉ lưu provider/token reference an toàn, label/brand/last4/status; không lưu PAN, CVV, OTP hoặc mật khẩu ví/ngân hàng. | Đã xác nhận schema/API policy | P0 |
| FR-PAY-012 | API payment method phải yêu cầu login khi list/create/revoke; revoke chuyển status thành REVOKED thay vì xóa mù. | Đã xác nhận | P1 |
| FR-PAY-013 | Việc charge bằng linked payment method chỉ được bật sau khi adapter/provider thật được cấu hình và kiểm thử; hiện route có thể trả 503 adapter chưa sẵn sàng. | Đã xác nhận giới hạn hiện tại | P0 |
| FR-PAY-014 | MoMo/PayOS/SePay/VNPay legacy routes phải được gắn nhãn rõ là active, test, mock hoặc legacy; không hiển thị như provider production-ready nếu chưa xác minh. | Khoảng trống documentation/runtime | P0 |
| FR-PAY-015 | User có thể xem payment success/lookup/transaction status mà không leak secret hoặc dữ liệu của người khác. | Có code — cần security test | P1 |

#### 5.7.2 Checkout session

`POST /api/checkout-sessions` tạo session có campaignId, rewardId, payload, returnPath, status, expiresAt; `GET` yêu cầu auth để claim/restore và phải kiểm tra owner, expiry và status.[1] [14]

#### 5.7.3 Invoice và financial records

Schema có backer invoice, platform invoice, daily tip invoice, pledge, transaction limits và audit logs. SRS yêu cầu invoice/financial records phải có unique reference, amount breakdown, status transition, timestamp, retry/idempotency và quyền xem theo actor; chi tiết đối soát production vẫn cần xác minh với database/provider thật.[1]

### 5.8 Chat, calling và realtime-like behavior

Chat page gồm sidebar, conversation window, info panel, input, emoji picker, reaction, product message card và call modal. `ChatConversationClient` tải thread/messages, đánh dấu read khi mở, gửi message/attachment, reveal sensitive content, xử lý deleted participant fallback và tích hợp voice/video calling.[15]

| ID | Yêu cầu | Trạng thái | Ưu tiên |
|---|---|---|---|
| FR-CHAT-001 | User authenticated có thể tạo/tìm conversation direct hoặc theo ngữ cảnh campaign/product. | Đã xác nhận API | P1 |
| FR-CHAT-002 | Chỉ participant mới được đọc/gửi/xóa message, xem info, read state hoặc thao tác thread. | Có code — cần penetration/E2E test | P0 |
| FR-CHAT-003 | Message hỗ trợ text, emoji, attachment/media và product context khi payload hợp lệ. | Đã xác nhận UI/API ở mức luồng | P1 |
| FR-CHAT-004 | Message sensitive phải có cờ ẩn và route reveal riêng; reveal không được làm trang nhảy scroll hoặc lộ nội dung ngoài quyền. | Đã xác nhận UI/API một phần | P1 |
| FR-CHAT-005 | Khi mở conversation, hệ thống phải mark messages đã xem; unread count không tiếp tục báo các message đã read. | Đã xác nhận client/API; cần regression test | P0 |
| FR-CHAT-006 | Reaction/emoji phải toggle ổn định, hiển thị ngoài bubble theo thiết kế và không tự mất khi phản ứng trên message của chính mình. | Có code — cần UI regression test | P1 |
| FR-CHAT-007 | Typing state có timeout ngắn và không lưu vô hạn; UI phải tránh layout shift. | Có code — cần runtime test | P2 |
| FR-CHAT-008 | Participant bị xóa phải hiển thị đồng nhất `Người dùng đã xóa`, avatar/label fallback không gây exception. | Đã xác nhận yêu cầu UI/source | P1 |
| FR-CHAT-009 | User có thể block/report conversation; moderation lưu status/reason/audit phù hợp. | Đã xác nhận API/schema một phần | P1 |
| FR-CHAT-010 | Notes/user notes phải kiểm soát owner, expiresAt và không lộ cho participant không có quyền. | Có code — cần kiểm thử | P1 |
| FR-CHAT-011 | Voice/video call phải có start, ringing, accept/reject/cancel/end và cleanup media; failure không khóa input hoặc page. | Có code UI/hook — cần WebRTC runtime test | P1 |
| FR-CHAT-012 | Chat desktop/mobile phải giữ header, input, scroll position và panel responsive; info panel chỉ mở khi user yêu cầu. | Yêu cầu UX cần regression suite | P1 |

### 5.9 Notification

Notification service có feature flag, user preferences, danh sách notification, read state, user/time indexes và TTL 90 ngày khi Mongo path hoạt động.[16]

| ID | Yêu cầu | Trạng thái | Ưu tiên |
|---|---|---|---|
| FR-NOTI-001 | User authenticated có thể xem notification của chính mình, phân trang và lọc read/unread nếu UI hỗ trợ. | Có code — cần verify UI/API contract | P1 |
| FR-NOTI-002 | User có thể đánh dấu notification đã đọc; badge/unread count phải giảm đúng. | Có code — cần regression test | P0 |
| FR-NOTI-003 | Event review campaign/blog, chat unread và payment status phải tạo notification phù hợp nếu feature flag/handler bật. | Có code — cần event matrix | P1 |
| FR-NOTI-004 | Notification cũ phải được TTL/retention theo policy; việc xóa không ảnh hưởng audit bắt buộc. | Đã xác nhận index service; cần runtime check | P2 |

### 5.10 Admin, moderation, badge và trust

| ID | Yêu cầu | Trạng thái | Ưu tiên |
|---|---|---|---|
| FR-ADMIN-001 | Chỉ ADMIN mới truy cập dashboard/admin và admin APIs. | Đã xác nhận một phần | P0 |
| FR-ADMIN-002 | Admin quản lý badge: list/create/get/update/soft-delete, assign và revoke cho user. | Đã xác nhận route/schema | P1 |
| FR-ADMIN-003 | Admin review blog post và campaign, đổi status và gửi notification cho creator. | Đã xác nhận route | P1 |
| FR-ADMIN-004 | Admin xem campaign reports và xử lý moderation theo status/resolution. | Đã xác nhận API/schema | P1 |
| FR-ADMIN-005 | Blacklist, audit log và user status update phải có actor, reason, timestamp và khả năng truy vết. | Có code/schema — cần operational verification | P0 |
| FR-ADMIN-006 | Revenue/analytics dashboard phải phân biệt số liệu thực tế, dữ liệu test/mock và dữ liệu thiếu provider. | Khoảng trống cần data contract | P1 |

### 5.11 Upload, taxonomy, lookup và assistant telemetry

| ID | Yêu cầu | Trạng thái | Ưu tiên |
|---|---|---|---|
| FR-PLAT-001 | Upload phải xác thực session/quyền, MIME, kích thước, loại resource và trả URL/reference an toàn. | Có code — cần security/runtime test | P0 |
| FR-PLAT-002 | Taxonomy/category/tag API phục vụ filter, search và editor; dữ liệu phải có quy tắc normalize slug. | Đã xác nhận route | P1 |
| FR-PLAT-003 | Lookup/transaction API chỉ trả dữ liệu cần thiết và chống enumeration/rate abuse. | Có code — cần security test | P1 |
| FR-PLAT-004 | Public/internal assistant telemetry phải giới hạn payload, không nhận secret/PII không cần thiết và có retention. | Có code/schema — cần policy/runtime review | P1 |
| FR-PLAT-005 | Error response phải nhất quán giữa 400/401/403/404/409/429/500/503; không trả stack trace hoặc provider secret. | Khoảng trống cần API standard | P0 |

### 5.12 Profile Studio và cá nhân hóa trang cá nhân

Profile Studio là khu vực owner-only cho phép chọn preset, chỉnh design token màu sắc/phong cách, bật/tắt section, sắp xếp section bằng nút hoặc native drag-and-drop, chọn featured project/campaign/reward/blog, cấu hình CTA, hiển thị analytics, thử nghiệm preset B, lưu nháp, xuất bản, khôi phục bản public và khôi phục snapshot phiên bản. Cấu hình được lưu riêng trong `profile_customizations` và `profile_customization_versions`; API chỉ nhận enum/token/block ID đã validate, không nhận HTML/CSS/JavaScript tự do.[19] [20]

| ID | Yêu cầu | Trạng thái | Ưu tiên |
|---|---|---|---|
| FR-PROFILE-CUST-001 | Chỉ owner đã đăng nhập mới tải/lưu/publish/restore cấu hình profile của chính mình. | Đã xác nhận | P0 |
| FR-PROFILE-CUST-002 | Preset chỉ được chọn từ allowlist; theme chỉ dùng mã HEX, font/style/radius/density đã định nghĩa. | Đã xác nhận | P0 |
| FR-PROFILE-CUST-003 | Section và featured content phải giới hạn theo schema; server kiểm tra ownership của project/campaign/reward/blog trước khi lưu. | Đã xác nhận | P0 |
| FR-PROFILE-CUST-004 | Public profile dùng `publishedConfig`; owner preview dùng draft; malformed/missing config fallback về default an toàn. | Đã xác nhận | P0 |
| FR-PROFILE-CUST-005 | Owner có thể lưu draft, publish, reset, restore public hoặc restore một snapshot trong lịch sử. | Đã xác nhận | P1 |
| FR-PROFILE-CUST-006 | Homepage hiển thị quick-edit panel cho user đã đăng nhập và dẫn tới Profile Studio hoặc chỉnh hồ sơ. | Đã xác nhận | P1 |
| FR-PROFILE-CUST-007 | Profile render vẫn tôn trọng privacy settings và không cho layout config làm lộ email, phone, KYC, draft hoặc private content. | Đã xác nhận trong thiết kế; cần security regression | P0 |
| FR-PROFILE-CUST-008 | Analytics/A-B chỉ điều khiển presentation/rollout, không thay đổi amount, pledge, stock hoặc quyền nghiệp vụ. | Đã xác nhận | P1 |

---

## 6. Use case chính

### UC-01 — Visitor khám phá và chọn campaign

Visitor vào home/campaign listing, tìm kiếm/lọc, mở campaign detail, xem creator/project/reward/update/blog/review và chọn CTA pledge. Hệ thống không yêu cầu login cho nội dung public nhưng yêu cầu auth khi thao tác follow, review, report, chat hoặc checkout cần identity. Acceptance: không render lỗi khi campaign thiếu project/reward/blog và không hiển thị pledge/private fields.

### UC-02 — Backer ủng hộ hoặc mua sản phẩm

Backer chọn reward, quantity, payment mode, email/shipping; server re-check campaign, reward, availability, amount, max quantity và stock. COD tạo pledge PENDING sau transaction decrement stock; online tạo pledge PENDING rồi redirect hosted checkout/mock. Acceptance: mọi thất bại phải không để stock âm, không tạo duplicate transaction và hiển thị trạng thái tiếp theo rõ ràng.

### UC-03 — Guest chuyển sang login nhưng giữ checkout

Guest tạo checkout session; khi bị yêu cầu login, session được lưu với expiry; sau login hệ thống chỉ restore nếu session hợp lệ và đúng owner/claim policy. Acceptance: không mất campaign/reward/quantity/shipping đã nhập; session hết hạn phải yêu cầu tạo lại an toàn.

### UC-04 — Creator tạo project

Creator mở project management, nhập basic info, cover/hero, rich description, chọn blog/reward liên kết và submit. Server kiểm tra role/ownership/format; public page render project và empty states. Acceptance: project tạo thành công, không gắn dữ liệu của creator khác và patch/delete bị từ chối khi không sở hữu.

### UC-05 — Creator tạo campaign trong hoặc ngoài project

Creator nhập campaign data, chọn project tùy contract hiện tại, submit; server xác nhận project cùng creator và lưu status ban đầu. Admin review nếu policy yêu cầu. Acceptance: nếu product policy muốn campaign bắt buộc có project, test phải fail cho null project cho tới khi code được đổi; không ghi nhận policy đó là đang chạy.

### UC-06 — Creator tạo product/reward

Creator chọn reuse reward hoặc tạo mới, nhập giá, availability, stock, delivery, media và project/campaign relation. API có thể kế thừa project từ campaign và bảo vệ ownership. Acceptance: product card/detail hiển thị đúng relation, stock, media và CTA; reward độc lập không gây lỗi link.

### UC-07 — Author soạn và publish blog

Author tạo draft, dùng Tiptap editor, upload ảnh/video, chèn link/product box, autosave, preview, publish hoặc gửi review tùy policy. Reader xem rendered content sanitized; admin review nếu cần. Acceptance: reload draft không mất nội dung; product box link đúng; HTML/URL độc hại bị chặn/sanitize.

### UC-08 — User chat với participant hoặc creator

User start/find conversation, gửi text/emoji/file/product card, nhận unread badge, mở thread để mark read, search message, reaction/reveal sensitive, block/report hoặc start call. Acceptance: deleted user fallback ổn định; opening conversation không nhảy footer; read/unread idempotent; cancel call luôn hoạt động.

### UC-09 — Admin moderation

Admin mở dashboard, xem pending campaigns/blogs/reports/users/badges, review/update status, assign/revoke badge và nhận audit. Acceptance: non-admin nhận 403; admin action có actor/time/reason và notification khi cần.

### UC-10 — Operator deploy và kiểm tra health

Operator apply migration, configure env, init indexes nếu cần, build/start, chạy test suite, kiểm tra provider/webhook/cron và xác nhận không có secret trong logs. Acceptance: `vercel-build` pass trong môi trường có database migration hợp lệ; deployment không phụ thuộc report seed cũ.

---

## 7. Mô hình dữ liệu và quy tắc toàn vẹn

### 7.1 PostgreSQL/Prisma

Schema hiện có 37 model và 25 enum. Các nhóm model chính là users/auth-support, project/campaign/reward/pledge, blog, payment/checkout, KYC/badge/moderation, invoice/limits và assistant telemetry.[1]

| Nhóm | Model tiêu biểu | Quy tắc quan trọng |
|---|---|---|
| Identity | `users`, `password_reset_tokens` | Email unique; password nullable cho OAuth; reset token hash unique, expiry và usedAt. |
| Project | `projects`, `project_blog_links`, `project_reward_links` | Creator ownership; unique relation pair; cascade junction. |
| Campaign | `campaigns`, `campaign_updates`, `campaign_followers`, `campaign_reports` | Campaign code/slug unique; creator relation; project nullable hiện tại; report unique theo campaign/user. |
| Reward | `rewards`, `product_reviews` | Campaign/project nullable; availability, stock, amount limits; review gắn pledge unique. |
| Blog | `blog_posts`, categories/tags, comments/likes/bookmarks/reports và link tables | Slug unique; author/project/campaign relation; engagement unique per user/post. |
| Payment | `pledges`, `payment_methods`, `checkout_sessions` | TransactionId unique; provider reference metadata; session expiry/status indexes. |
| Trust | `kyc_info`, `badges`, `user_badges`, `blacklist`, `audit_logs` | KYC identifiers unique; badge assignment/revoke traceable; audit actor/reason. |
| Finance | `backer_invoices`, `platform_invoices`, `daily_tip_invoices`, `transaction_limits` | Invoice references/status/amount breakdown; limits theo user/KYC policy. |
| Telemetry | `assistant_telemetry_events` | Assistant/eventType/time indexes; metadata JSON optional. |

### 7.2 MongoDB

MongoDB runtime dùng database name từ `MONGODB_DB_NAME`, mặc định `crowdfunding_vn`, và kết nối qua `MONGODB_URI`. Collection/service có feature flag riêng ở một số miền; index/TTL phải được init và kiểm tra trên database thật.[16] [17]

| Collection/service | Vai trò | Retention/index đáng chú ý |
|---|---|---|
| `conversations` | Thread, participant IDs, type, last message/read context | Index conversation key/participants/updated/created theo chat init. |
| `messages` | Message text/media/sensitive/reaction/read context | Index conversation/created/sender/deleted theo chat init. |
| `chat_reports` | Report conversation/message | Index reporter/status/created theo chat init. |
| `user_notes` | Note gắn user/conversation, expiry | Field `expiresAt` được service dùng; cần verify TTL thực tế. |
| `notifications` | User notification/read state/payload | User+created, user+isRead, TTL 90 ngày. |
| `blog_contents` | Rich content gắn post | Unique `postId`. |
| `blog_drafts` | Draft/autosave authoring | Index postId, authorId. |
| `blog_versions` | Version history | Index postId + versionNumber descending. |
| `blog_view_logs` | View event | Index postId+viewedAt, userId. |
| `campaign_contents` | Supporting campaign content/draft | Campaign+isDraft unique trong bootstrap; lastSavedBy. |
| `campaign_updates` | Supporting update content | Campaign/status/publishedAt, creator, pinned, tags. |
| `comments` | Mongo campaign comments khi feature flag bật | Campaign/time, parent/time, user/time, status. |
| `activity_logs` | Activity/operational logs | User/action/entity/time; TTL 90 ngày. |
| `audit_logs` | Audit mirror/extended event | Entity/user/action/time, sparse pgAuditLogId; TTL 365 ngày. |
| `analytics_events` | Analytics event | eventName/user/campaign/time; TTL 180 ngày. |
| `user_metadata` | Supporting user metadata/tags | Unique userId, tags. |

Mongo documents là schemaless ở database level nhưng application types/service phải được coi là contract. Không tự suy diễn field mới từ archive hoặc DBML cũ.[4] [17]

### 7.3 Cascade, soft delete và privacy

Các quan hệ Prisma có onDelete cascade/set-null khác nhau; destructive action phải review theo relation trước khi triển khai. Blog, badge, report và user-facing records có nhiều trường soft-delete/status. SRS yêu cầu API mặc định loại record đã deleted/archived khỏi public result, ngoại trừ admin/audit view có lý do và quyền phù hợp.

---

## 8. State machine và business rules

### 8.1 User

```text
REGISTERED / NORMAL
        ├─ upgrade creator → CREATOR_PENDING → approved → CREATOR
        ├─ KYC → PENDING → VERIFIED / REJECTED
        └─ admin status action → BANNED / SUSPENDED / restored
```

Giá trị enum chính thức phải lấy từ Prisma schema; sơ đồ trên mô tả các trạng thái được source và UI sử dụng ở mức nghiệp vụ, không thay thế enum.[1]

### 8.2 Campaign

```text
DRAFT → PENDING_REVIEW → ACTIVE → SUCCESS / FAILED / ENDED
                         └→ REJECTED
DRAFT/ACTIVE → CANCELLED (theo policy và điều kiện pledge)
```

Transition phải được kiểm tra ở server. Không cho phép pledge mới nếu campaign không ACTIVE; admin review phải kiểm tra status hiện tại để tránh approve nhầm phiên bản cũ.

### 8.3 Reward/product

```text
ACTIVE + AVAILABLE      → purchasable / COD eligible if other rules pass
ACTIVE + DEVELOPMENT    → support/pledge flow; COD rejected
INACTIVE                → not selectable for new checkout
stock = 0               → out of stock; no new quantity
```

`AVAILABLE`/`DEVELOPMENT`, stock, min/max amount và maxQuantity là dữ liệu server-side; UI chỉ trình bày và gửi intent.[1] [13]

### 8.4 Pledge/payment

```text
created → PENDING → SUCCESS
                  ├→ FAILED
                  ├→ CANCELLED
                  └→ REFUND_PENDING → REFUNDED / REFUND_FAILED
```

Tên enum/status cuối cùng phải đối chiếu schema. Webhook phải idempotent theo transaction/provider reference; duplicate callback không được nhân pledge, invoice hoặc notification.

### 8.5 Checkout session

```text
ACTIVE → CLAIMED / COMPLETED / EXPIRED
       └→ INVALIDATED
```

Session chứa payload checkout và `expiresAt`; GET restore phải kiểm tra authentication, ownership, expiry và status.[1] [14]

### 8.6 Blog

```text
DRAFT → IN_REVIEW → PUBLISHED
  ├→ ARCHIVED
  └→ REJECTED → DRAFT
```

Các trạng thái thực tế phải lấy enum `BlogPostStatus` và admin route. Không dùng report cũ để suy ra transition chưa có trong source.

---

## 9. API và contract surface

Repository hiện có 102 route handler API. Danh mục dưới đây nhóm theo bounded context; method là method đã quan sát từ source snapshot.[18]

### 9.1 Admin và trust

| Method | Route pattern | Mục đích |
|---|---|---|
| GET/POST/PATCH/DELETE | `/api/admin/badges`, `/api/admin/badges/[id]` | List/create/update/delete badge. |
| POST | `/api/admin/badges/[id]/assign` | Assign badge. |
| POST | `/api/admin/user-badges/[id]/revoke` | Revoke assignment. |
| GET | `/api/admin/users/[userId]/badges` | List user badges. |
| POST | `/api/admin/users/[userId]/update-status` | Update user status. |
| GET | `/api/admin/blog/posts` | Admin list blog posts. |
| PATCH | `/api/admin/blog/posts/[id]/review` | Review blog status. |
| PATCH | `/api/admin/campaigns/[id]/review` | Review campaign status. |
| GET | `/api/admin/reports` | Admin report queue. |

### 9.2 Auth/profile/KYC

| Method | Route pattern | Mục đích |
|---|---|---|
| POST | `/api/auth/register` | Đăng ký. |
| POST | `/api/auth/forgot-password` | Tạo reset token và gửi/hiển thị dev handling. |
| POST | `/api/auth/reset-password` | Consume one-time reset token. |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth handlers/provider callbacks. |
| GET/POST/PATCH | `/api/profile/settings` | Preference/settings. |
| POST | `/api/profile/update` | Update profile. |
| GET | `/api/user/profile` | Current profile. |
| POST | `/api/user/upgrade-creator` | Creator upgrade flow. |
| GET/POST | `/api/kyc/status`, `/api/kyc/submit` | KYC status/submit. |
| GET | `/api/users`, `/api/users/[userId]`, `/api/users/[userId]/badges` | User discovery/profile/badges. |
| GET | `/api/users/search` | User search. |
| GET | `/api/badges`, `/api/me/badges` | Public/current badge views. |

### 9.3 Project/campaign/reward

| Method | Route pattern | Mục đích |
|---|---|---|
| GET/POST | `/api/projects` | Public list và creator create. |
| GET/PATCH/DELETE | `/api/projects/[id]` | Detail/edit/delete. |
| GET | `/api/projects/public/[id]` | Public project detail. |
| GET/POST | `/api/campaigns` | Discovery/create. |
| GET/PUT/DELETE | `/api/campaigns/[slug]` | Detail/edit/delete. |
| POST | `/api/campaigns/[slug]/cancel` | Cancel. |
| GET/POST/DELETE | `/api/campaigns/[slug]/follow` | Follow state/toggle. |
| GET/POST | `/api/campaigns/[slug]/reviews` | Review list/create. |
| GET/POST | `/api/campaigns/[slug]/reports` | Report list/create by policy. |
| GET/POST | `/api/campaigns/[slug]/updates` | Campaign updates. |
| PUT/DELETE | `/api/campaigns/[slug]/updates/[id]` | Update edit/delete. |
| GET | `/api/campaigns/[slug]/blog-posts` | Linked blog posts. |
| GET/POST | `/api/rewards` | Creator reward create/list. |
| GET/PUT/DELETE | `/api/rewards/[id]` | Reward detail/edit/delete. |
| PATCH | `/api/rewards/[id]/toggle` | Toggle visibility/active relation. |
| GET | `/api/rewards/my` | Current creator rewards. |
| GET/POST | `/api/products/[rewardId]/reviews` | Product review list/create. |
| POST | `/api/products/[rewardId]/received` | Mark received. |

### 9.4 Blog/content

| Method | Route pattern | Mục đích |
|---|---|---|
| GET/POST | `/api/blog/posts` | Public listing và create. |
| GET/PATCH/DELETE | `/api/blog/posts/[slug]` | Detail/edit/delete. |
| PATCH | `/api/blog/posts/[slug]/publish` | Publish. |
| PATCH | `/api/blog/posts/[slug]/archive` | Archive. |
| GET | `/api/blog/my-posts` | Author dashboard. |
| GET/POST | `/api/blog/posts/[slug]/comments` | Comment list/create. |
| DELETE | `/api/blog/comments/[id]` | Delete own/authorized comment. |
| POST | `/api/blog/posts/[slug]/like` | Toggle like. |
| POST | `/api/blog/posts/[slug]/bookmark` | Toggle bookmark. |
| GET | `/api/blog/categories` | Categories. |

### 9.5 Chat/notification

| Method | Route pattern | Mục đích |
|---|---|---|
| GET | `/api/chat/conversations` | Current user's conversations. |
| POST | `/api/chat/conversations/start` | Start direct/context conversation. |
| POST | `/api/chat/conversations/find-or-create` | Resolve conversation. |
| DELETE | `/api/chat/conversations/[conversationId]/delete` | Delete/archive conversation. |
| POST/DELETE | `/api/chat/conversations/[conversationId]/block` | Block/unblock. |
| GET/POST | `/api/chat/conversations/[conversationId]/messages` | List/send messages. |
| DELETE | `/api/chat/messages/[messageId]` | Delete message. |
| GET | `/api/chat/conversations/[conversationId]/messages/search` | Search messages. |
| PATCH | `/api/chat/conversations/[conversationId]/read` | Mark read. |
| PATCH | `/api/chat/conversations/[conversationId]/messages/[messageId]/reaction` | Toggle reaction. |
| POST | `/api/chat/conversations/[conversationId]/messages/[messageId]/reveal` | Reveal sensitive message. |
| POST/GET | `/api/chat/conversations/[conversationId]/typing` | Typing state. |
| POST | `/api/chat/conversations/[conversationId]/report` | Report chat. |
| GET | `/api/chat/unread-count` | Unread summary. |
| GET/POST | `/api/chat/notes` | User notes. |
| GET | `/api/chat/users/search` | Search chat users. |
| GET/PATCH | `/api/notifications` | List/mark notification read. |

### 9.6 Payment/checkout/operations

| Method | Route pattern | Mục đích |
|---|---|---|
| POST/GET | `/api/checkout-sessions` | Create/restore guest-to-login checkout. |
| POST | `/api/payments` | Unified ONLINE/COD checkout. |
| POST/GET | `/api/payments/webhook` | Unified webhook surface. |
| POST | `/api/payments/refund` | Refund action by policy. |
| GET | `/api/transactions/[txId]` | Transaction lookup. |
| GET/POST/DELETE | `/api/payment-methods` | Linked metadata list/create/revoke. |
| POST/GET | `/api/payment/payos/*` | PayOS create/mock/test/webhook. |
| POST/GET | `/api/payment/momo/*` | MoMo create/webhook. |
| POST/GET | `/api/payment/sepay/*` | SePay create/status/webhook. |
| POST/GET | `/api/payment/vnpay/*` | VNPay create/webhook. |
| GET | `/api/cron/cleanup-payments` | Payment cleanup job. |
| GET | `/api/cron/update-campaign-status` | Campaign status job. |

### 9.7 Platform APIs

`/api/upload`, `/api/lookup`, `/api/stats`, `/api/taxonomy`, `/api/public/entities`, `/api/public/assistant-telemetry`, `/api/internal/assistant-telemetry`, `/api/simple-test` và `/api/payments-debug` tồn tại trong source. Các route debug/test/internal phải bị hạn chế hoặc loại khỏi production exposure, có auth/rate limit/log policy rõ ràng.[18]

### 9.8 API contract chung

Mọi route phải tuân thủ các quy tắc sau:

1. Parse và validate input bằng schema phù hợp; reject unknown/invalid shape khi an toàn.
2. Lấy actor từ `auth()`/session; kiểm tra role, status, participant hoặc ownership server-side.
3. Trả status code nhất quán: 400 input, 401 unauthenticated, 403 unauthorized, 404 missing, 409 conflict, 429 rate limit, 500 unexpected, 503 dependency unavailable.
4. Không trả password hash, token raw, PAN/CVV/OTP, provider secret, internal stack trace hoặc dữ liệu private ngoài actor scope.
5. Các mutation quan trọng phải idempotent hoặc có unique constraint/transaction/compare-and-set.
6. Log phải mask PII/secret và có correlation/reference id khi xử lý payment, webhook, moderation hoặc upload.

---

## 10. Yêu cầu phi chức năng

### 10.1 Security và privacy

| ID | Yêu cầu | Mức |
|---|---|---|
| NFR-SEC-001 | Password hash bằng bcrypt; reset token chỉ lưu hash và consume một lần. | P0 |
| NFR-SEC-002 | Authorization phải kiểm tra server-side theo session, role, status, ownership và participant. | P0 |
| NFR-SEC-003 | Payment card/wallet/bank credentials phải do hosted provider thu thập; platform chỉ lưu metadata/token reference an toàn. | P0 |
| NFR-SEC-004 | Rich HTML, URL, iframe, image/video và upload phải sanitize/validate chống XSS, SSRF, malware và oversized payload. | P0 |
| NFR-SEC-005 | Webhook phải verify signature/secret, chống replay/duplicate và không trust amount từ callback mù. | P0 |
| NFR-SEC-006 | Audit phải ghi actor/action/entity/time/reason ở mutation nhạy cảm, đồng thời không ghi secret. | P0 |
| NFR-SEC-007 | API public cần rate limit/chống enumeration cho auth, lookup, search, telemetry, upload và payment. | P1 |
| NFR-SEC-008 | Secret không commit trong source, docs công khai, issue, screenshot hoặc log; file Vercel retained là ngoại lệ vận hành cần bảo vệ. | P0 |

### 10.2 Hiệu năng

Đây là target cần đo bằng production-like test, không phải số đã nghiệm thu.

| Mục tiêu | Target đề xuất để nghiệm thu |
|---|---|
| Public page/API read | p95 dưới 500 ms khi cache/database khỏe, không tính provider. |
| Authenticated CRUD | p95 dưới 800 ms cho mutation không upload/payment. |
| Checkout creation | p95 dưới 1.5 s trước redirect provider. |
| Chat list/read/send | p95 dưới 500 ms cho request database khỏe; upload/call tách riêng. |
| Largest Contentful Paint | dưới 2.5 s ở trang public trên profile thiết bị mục tiêu. |
| Error rate | dưới 1% cho non-provider request trong smoke load test. |

Cần đo lại bằng observability thật; không lấy các target này làm cam kết SLA.

### 10.3 Availability, recovery và data lifecycle

| ID | Yêu cầu | Trạng thái |
|---|---|---|
| NFR-OPS-001 | Deployment phải chạy migration an toàn, có backup/rollback plan và migration review. | Khoảng trống vận hành |
| NFR-OPS-002 | PostgreSQL backup/restore và Mongo backup/restore phải được diễn tập định kỳ. | Khoảng trống |
| NFR-OPS-003 | Mongo TTL 90/180/365 ngày phải được xác nhận bằng index thật, không chỉ nhìn code. | Có code — cần xác minh |
| NFR-OPS-004 | Cron route phải có authentication/secret hoặc scheduler restriction và idempotent retry. | Có code — cần review |
| NFR-OPS-005 | Health check phải phân biệt app sống với database/provider sẵn sàng. | Khoảng trống |

### 10.4 Accessibility và responsive UX

UI phải keyboard reachable, có focus ring, label/aria phù hợp, contrast đủ, không phụ thuộc hover duy nhất và hiển thị loading/empty/error rõ ràng. Chat phải giữ scroll position hợp lý, không nhảy footer khi mở/reveal message; panel responsive trên mobile/desktop. Editor, dialog, dropdown, call modal, payment modal và upload input cần có focus management và escape/cancel path.

### 10.5 Maintainability

Mọi schema change phải kèm migration và cập nhật type/caller/test; mọi thay đổi Mongo phải cập nhật service type/index snapshot; mọi feature mới phải bổ sung acceptance test. Không thêm file status/report trùng nội dung; tài liệu phải phân biệt code-confirmed với runtime-verified.

---

## 11. Media, upload và content safety

### 11.1 Upload contract

Upload component được dùng cho cover, gallery, blog image/video, avatar, KYC và attachment tùy context. Mỗi context phải định nghĩa allowlist MIME, max bytes, số lượng, dimension/duration nếu cần, ownership và cleanup orphan asset. URL trả về phải là URL/reference có thể lưu DB; không lưu file binary lớn trong repository.

### 11.2 Rich content

Rich content có thể tồn tại ở PostgreSQL metadata/content và Mongo content/draft/version tùy service flag. Renderer phải sanitize ở boundary render và không tin payload product box/link từ client. Embedded video/iframe phải allowlist host hoặc policy rõ ràng; product box chỉ được tham chiếu reward/public entity hợp lệ.

### 11.3 Moderation

Blog, campaign update, comment, chat attachment và report cần status/moderation path. Nội dung bị report không tự động kết luận vi phạm; admin action cần reason, actor và audit. Public query không được trả soft-deleted/hidden/rejected record trừ khi policy cho preview/admin.

---

## 12. Testing và nghiệm thu

### 12.1 Test layers

| Layer | Phạm vi | Script hiện có |
|---|---|---|
| Unit/component | Validation, service helper, renderer, UI interactions | `npm test`, Jest config |
| Database/integration | Prisma, migration, transaction, Mongo/index | `npm run test:db`, integration suite |
| UI/functional | Page, form, chat, product, blog, dashboard | `npm run test:ui`, `npm run test:functional` |
| E2E | Auth, creator/backer journey, checkout, chat | `npm run test:e2e` |
| Coverage/report | Coverage và report hợp nhất | `npm run test:coverage`, `npm run test:report` |
| Build | Prisma generate, migration deploy, Next build | `npm run vercel-build` |

Scripts hiện có trong `package.json`; việc script tồn tại không chứng minh tất cả suite đang pass hoặc coverage đạt ngưỡng.[2]

### 12.2 Acceptance checklist release

- [ ] Đăng ký, Credentials login, Google OAuth tùy environment và redirect callback đã test.
- [ ] Forgot/reset password không enumeration, token hết hạn/one-time và password cũ không dùng được.
- [ ] Non-owner/non-participant/non-admin đều nhận response authorization đúng.
- [ ] Project/campaign/reward relation đúng, including null/empty relation và deletion policy.
- [ ] Blog draft/autosave/reload/publish/render/sanitize/product box đã test.
- [ ] Cart revalidate stock/status/amount tại submit; COD không âm stock; online webhook idempotent.
- [ ] Linked payment method không lộ sensitive data và provider adapter readiness được kiểm chứng.
- [ ] Chat read/unread, deleted user, sensitive reveal, reaction, attachment, block/report và cancel call đã test.
- [ ] Notification read state và TTL/index đã xác minh trên Mongo thật.
- [ ] Admin moderation/badge/audit có role guard và reason.
- [ ] Migration deploy/build pass trên môi trường staging với secret thật được cấp qua dashboard.
- [ ] Cron/webhook/upload/debug endpoint được bảo vệ và quan sát được.
- [ ] Không có secret mới trong diff/log/artifact; environment reference được quản lý riêng.

### 12.3 Test data policy

Seed và fixture chỉ dùng cho development/test. `SEED_COMPLETE.txt` không phải bằng chứng database đã được seed và không thuộc tài liệu hoạt động. Mọi test data phải có namespace/environment rõ ràng, không dùng credential thật, không chạy destructive seed trên production.

---

## 13. Deployment và configuration requirements

### 13.1 Build/deploy

Deployment phải cài dependency theo lockfile, chạy `prisma generate`, apply migration bằng `prisma migrate deploy`, sau đó build Next.js. Trước deploy cần kiểm tra schema drift, migration order, database connection, Mongo connection, upload provider, OAuth callback, email reset, payment credentials, webhook URL và cron scheduler.

### 13.2 Environment groups

| Nhóm | Ví dụ mục đích | Quy tắc |
|---|---|---|
| Database | PostgreSQL `DATABASE_URL`, Mongo `MONGODB_URI`, `MONGODB_DB_NAME` | Chỉ server-side; rotate khi lộ. |
| Auth | `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, Google credentials | Không đưa vào client bundle/log. |
| Media | Cloudinary URL/key/secret | Upload server-side; validate resource type. |
| Payment | PayOS/MoMo/SePay/VNPay credentials, webhook secrets | Chỉ bật provider sau test signature/idempotency. |
| Email | Resend/API credentials/from address | Forgot password không leak user existence. |
| Feature flags | `ENABLE_MONGO_*` | Ghi rõ fallback, retention và migration. |
| Operations | Cron/scheduler secret, telemetry flags | Restrict route, mask logs. |

`docs/VERCEL_ENV_VARIABLES.txt` được giữ để hỗ trợ khôi phục cấu hình Vercel theo yêu cầu riêng; không được xem là nơi an toàn để chia sẻ secret hoặc nguồn khai báo runtime. Template placeholder an toàn nằm ở `docs/VERCEL_ENV_VARIABLES.example.txt`.[5]

### 13.3 Rollback

Rollback application không tự động rollback database nếu migration destructive. Mỗi migration phải có compatibility window hoặc rollback plan; payment/pledge migration cần backup và đối soát trước khi release. Nếu provider callback thay đổi, cần hỗ trợ phiên bản callback cũ trong thời gian chuyển tiếp.

---

## 14. Khoảng trống và backlog ưu tiên

| ID | Khoảng trống | Ưu tiên | Điều kiện đóng |
|---|---|---:|---|
| GAP-001 | Provider readiness matrix cho PayOS/MoMo/SePay/VNPay và linked payment adapter. | P0 | Mỗi provider có env checklist, signature test, sandbox E2E, idempotency và production approval. |
| GAP-002 | API authorization matrix đầy đủ theo route/method/role/ownership. | P0 | Có bảng và test 401/403 cho critical routes. |
| GAP-003 | Payment state machine/invoice/refund reconciliation. | P0 | Integration tests với duplicate/out-of-order webhook, retry và refund. |
| GAP-004 | Transactional stock reservation cho online checkout. | P0 | Không oversell dưới concurrency; release khi payment timeout/fail. |
| GAP-005 | Secret rotation và xử lý credential từng xuất hiện trong lịch sử Git. | P0 | Rotate/revoke, verify no active exposure, document owner and expiry. |
| GAP-006 | Mongo backup/recovery/TTL/index verification. | P1 | Restore drill, index report từ DB thật, retention sign-off. |
| GAP-007 | WebRTC call production signaling, permission, reconnect và billing/policy nếu áp dụng. | P1 | Cross-browser/device E2E, cancel/end cleanup và privacy review. |
| GAP-008 | Upload security pipeline và orphan cleanup. | P1 | MIME sniffing, malware/SSRF checks, size limits, cleanup job. |
| GAP-009 | Campaign project policy. | P1 | Product owner chốt campaign bắt buộc project hay cho phép standalone; đồng bộ schema/UI/API/docs. |
| GAP-010 | Notification event/read/retention matrix. | P1 | Event catalog, idempotency, user preference, read badge và TTL test. |
| GAP-011 | Backup/restore và disaster recovery cho PostgreSQL/Mongo. | P1 | RPO/RTO, backup encryption, restore drill và owner. |
| GAP-012 | API error, rate-limit, correlation ID và observability standard. | P1 | Shared response contract và dashboard/alert. |
| GAP-013 | Accessibility/performance budgets. | P2 | Lighthouse/axe/load baseline cho page và chat/editor. |
| GAP-014 | Comparison table/banner blog blocks. | P2 | Schema, sanitize, responsive editor/renderer và analytics. |

---

## 15. Traceability matrix

| Product capability | Schema/source evidence | SRS sections |
|---|---|---|
| Auth/password recovery | NextAuth config/lib, auth routes, `users`, `password_reset_tokens` | 5.1, 6 UC-01/03, NFR-SEC |
| Project hierarchy | `projects`, campaign/blog/reward links, project UI/API | 5.3, 6 UC-04/05, 7 |
| Campaign crowdfunding | `campaigns`, `pledges`, updates/reports/reviews, campaign APIs | 5.4, 5.7, 8.2 |
| Product/reward commerce | `rewards`, product reviews, reward/product UI/API | 5.5, 5.7, 8.3 |
| Rich blog/merchandising | blog schema, Tiptap editor/extensions/renderer, blog APIs | 5.6, 11 |
| Chat/community | Mongo chat services, chat routes/components/types | 5.8, 6 UC-08 |
| Notifications | notification service/API, TTL/index bootstrap | 5.9, 7.2 |
| Admin/trust | admin routes, KYC/badge/report/blacklist/audit models | 5.10, 6 UC-09 |
| Deployment/operations | `package.json`, migrations, init scripts, config/middleware | 3, 10, 12, 13 |

---

## 16. Glossary

| Thuật ngữ | Định nghĩa |
|---|---|
| Backer | Người ủng hộ campaign hoặc mua reward/product. |
| Creator | Người sáng tạo đã được phép tạo/quản lý project, campaign, reward hoặc blog theo role/policy. |
| Project | Hub nội dung/sản phẩm của creator, có thể liên kết campaign, blog và reward. |
| Campaign | Chiến dịch gây quỹ có goal, status, pledge và lifecycle. |
| Reward/Product | Phần quà hoặc sản phẩm; có thể available/development và có campaign/project relation nullable theo schema hiện tại. |
| Pledge | Bản ghi ý định/ giao dịch ủng hộ hoặc mua gắn campaign, reward, amount, status và transactionId. |
| Checkout session | Payload tạm thời giúp giữ/khôi phục checkout qua login, có expiry. |
| Hosted checkout | Trang thanh toán do provider xử lý; platform không nhận PAN/CVV/OTP. |
| Sensitive message | Chat message cần reveal riêng trước khi đọc nội dung. |
| Soft delete | Đánh dấu deleted/archived/status thay vì xóa vật lý ngay. |
| Feature flag | Cấu hình bật/tắt một Mongo supporting service hoặc hành vi bổ sung. |

---

## References

[1] [`../../prisma/schema.prisma`](../prisma/schema.prisma) — Prisma schema hiện hành, model, enum, relation, index và default.

[2] [`../../package.json`](../package.json) — scripts build/test/seed/init và dependency runtime.

[3] [`DATABASE_SCHEMA_DBML.txt`](./DATABASE_SCHEMA_DBML.txt) — snapshot DBML PostgreSQL được sinh từ Prisma; không thay thế schema.

[4] [`MONGODB_SCHEMA_DBML.txt`](./MONGODB_SCHEMA_DBML.txt) — snapshot collection/index MongoDB từ service/type/bootstrap; không thay thế source.

[5] [`VERCEL_ENV_VARIABLES.example.txt`](./VERCEL_ENV_VARIABLES.example.txt) — template environment placeholder; file environment retained thật không được lặp lại trong tài liệu.

[6] [`../../src/lib/auth.ts`](../src/lib/auth.ts) — NextAuth runtime, Credentials, PrismaAdapter, JWT/session callbacks.

[7] [`../../src/auth.config.ts`](../src/auth.config.ts) và [`../../src/middleware.ts`](../src/middleware.ts) — public/protected route policy và redirect.

[8] [`../../src/app/api/projects/`](../src/app/api/projects/) và [`../../src/components/dashboard/ProjectFormDialog.tsx`](../src/components/dashboard/ProjectFormDialog.tsx) — project API/UI và hero/linking behavior.

[9] [`../../src/app/api/campaigns/`](../src/app/api/campaigns/) — campaign CRUD, review, follow, report, review và update routes.

[10] [`../../src/app/api/rewards/`](../src/app/api/rewards/) và [`../../src/components/profile/AddProductModal.tsx`](../src/components/profile/AddProductModal.tsx) — reward/product relation, media và visibility flow.

[11] [`../../src/components/editor/ProductionEditor.tsx`](../src/components/editor/ProductionEditor.tsx) và [`../../src/components/editor/extensions/index.ts`](../src/components/editor/extensions/index.ts) — editor/autosave/extensions/upload.

[12] [`../../src/components/shared/RichTextRenderer.tsx`](../src/components/shared/RichTextRenderer.tsx) và [`../../src/components/shared/ProductBoxRenderer.tsx`](../src/components/shared/ProductBoxRenderer.tsx) — render/sanitize/product box.

[13] [`../../src/app/api/payments/route.ts`](../src/app/api/payments/route.ts) — unified ONLINE/COD validation, stock và pledge flow.

[14] [`../../src/app/api/checkout-sessions/route.ts`](../src/app/api/checkout-sessions/route.ts) và [`../../src/app/api/payment-methods/route.ts`](../src/app/api/payment-methods/route.ts) — checkout restore và payment metadata.

[15] [`../../src/components/chat/ChatConversationClient.tsx`](../src/components/chat/ChatConversationClient.tsx) và [`../../src/app/api/chat/`](../src/app/api/chat/) — chat orchestration, read state, attachments, reveal, reactions, block/report và calls.

[16] [`../../src/services/mongodb/notification.service.ts`](../src/services/mongodb/notification.service.ts) — notification feature flag, indexes và TTL.

[17] [`../../src/services/mongodb/`](../src/services/mongodb/) và [`../../scripts/init-mongodb.js`](../scripts/init-mongodb.js), [`../../scripts/init-chat-indexes.ts`](../scripts/init-chat-indexes.ts) — Mongo collection/service/index/retention evidence.

[18] [`../../src/app/api/`](../src/app/api/) — API route surface hiện hành được phân nhóm trong SRS.

[19] [`../src/lib/profile-customization.ts`](../src/lib/profile-customization.ts) — allowlist preset/theme/section, normalization và deterministic A/B presentation.

[20] [`../src/app/api/profile/customization/route.ts`](../src/app/api/profile/customization/route.ts), [`../src/components/profile/ProfileCustomizationEditor.tsx`](../src/components/profile/ProfileCustomizationEditor.tsx) và [`../src/app/profile/[userId]/customize/page.tsx`](../src/app/profile/[userId]/customize/page.tsx) — Profile Studio, owner authorization, draft/publish/restore/version history và preview.
