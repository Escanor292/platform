# Agile User Stories — Tử Tế Fund

**Phiên bản:** 1.0  
**Ngày soạn:** 24/08/2026  
**Repository:** [`Escanor292/platform`](https://github.com/Escanor292/platform)  
**Nguồn yêu cầu:** [`docs/SRS-TU-TE-FUND.md`](./SRS-TU-TE-FUND.md)  
**Trạng thái:** Backlog đề xuất dựa trên mã nguồn hiện tại

> Tài liệu này chuyển các actor, yêu cầu chức năng và use case hiện có của Tử Tế Fund thành User Story theo cách sử dụng trong Agile. User Story mô tả nhu cầu của người dùng; mã nguồn và test hiện tại chỉ được xem là bằng chứng triển khai khi đã xác minh tương ứng.

## 1. Quy ước

### 1.1 Mẫu User Story

> Là một **[actor]**, tôi muốn **[mục tiêu]**, để **[giá trị nhận được]**.

Mỗi story có acceptance criteria theo dạng **Given/When/Then**. Một story chỉ được chuyển sang `Done` khi code, test, review và môi trường chạy đã đáp ứng đầy đủ tiêu chí nghiệm thu.

### 1.2 Trạng thái

| Trạng thái | Ý nghĩa |
|---|---|
| `Backlog` | Đã xác định nhu cầu nhưng chưa đưa vào sprint. |
| `Ready` | Đã đủ thông tin, có thể giao cho development. |
| `In Progress` | Đang phát triển. |
| `Testing` | Đã có code, đang kiểm thử hoặc sửa lỗi. |
| `Done` | Đã pass acceptance criteria, review và quality gate. |
| `Blocked` | Bị chặn bởi provider, database, môi trường hoặc quyết định nghiệp vụ. |

### 1.3 Ưu tiên và điểm ước lượng

| Mức | Ý nghĩa |
|---|---|
| `P0` | Cản trở dữ liệu, quyền truy cập, thanh toán, an toàn hoặc luồng chính. |
| `P1` | Ảnh hưởng trực tiếp đến trải nghiệm và chức năng cốt lõi. |
| `P2` | Cải thiện hoàn thiện sản phẩm, quản trị hoặc khả năng bảo trì. |
|
| Điểm | Quy ước tương đối |
|---:|---|
| 1–2 | Nhỏ, phạm vi rõ, ít phụ thuộc. |
| 3–5 | Trung bình, cần code và test nhiều lớp. |
| 8 | Lớn hoặc có phụ thuộc database/provider; nên tách nhỏ trước khi làm. |

## 2. User Card / Persona Card

Các User Card dưới đây là **persona đại diện được suy ra từ actor và use case trong SRS**, không phải thông tin cá nhân đã xác minh của người dùng thật. Khi phỏng vấn khách hàng hoặc thành viên dự án, cần thay thế tên giả định bằng tên/mã người dùng thực tế và cập nhật lại mong muốn, khó khăn theo bằng chứng thu thập được.

### UCARD-01 — Nguyễn Minh Anh, người ủng hộ chiến dịch

| Trường thông tin | Nội dung |
|---|---|
| **Tên đại diện** | Nguyễn Minh Anh |
| **Tuổi/khu vực** | 28 tuổi, Hà Nội; dùng nền tảng chủ yếu trên điện thoại |
| **Chức vụ/vai trò** | Nhân viên văn phòng; `Visitor` và `Backer` |
| **Bối cảnh** | Thường biết tới campaign qua mạng xã hội, muốn xem nhanh độ tin cậy trước khi ủng hộ |
| **Mong muốn** | Tìm kiếm campaign dễ dàng; xem tiến độ, creator, reward và thông tin thanh toán rõ ràng; checkout nhanh; nhận trạng thái pledge chính xác |
| **Khó khăn** | Sợ campaign không minh bạch; không muốn nhập lại thông tin khi bị yêu cầu login; lo hết stock hoặc thanh toán trùng; không hiểu trạng thái `PENDING` nghĩa là gì |
| **Tiêu chí thành công** | Có thể tìm campaign trong vài bước, hoàn tất pledge không lỗi và biết chính xác giao dịch đang ở trạng thái nào |
| **User Story liên quan** | `US-CAMP-002`, `US-PAY-001`, `US-PAY-002`, `US-PAY-003` |

### UCARD-02 — Trần Hoàng Nam, nhà sáng tạo nội dung

| Trường thông tin | Nội dung |
|---|---|
| **Tên đại diện** | Trần Hoàng Nam |
| **Tuổi/khu vực** | 32 tuổi, Đà Nẵng; sử dụng laptop để quản lý nội dung |
| **Chức vụ/vai trò** | Creator/Project Owner |
| **Bối cảnh** | Có ý tưởng xã hội hoặc sản phẩm cần gây quỹ, muốn quản lý project, campaign, reward và blog trên cùng một nền tảng |
| **Mong muốn** | Tạo project nhanh; liên kết campaign/blog/reward đúng; kiểm soát stock; theo dõi pledge; biết trạng thái review của admin; xây dựng profile chuyên nghiệp |
| **Khó khăn** | Không rành kỹ thuật; sợ gắn nhầm dữ liệu của creator khác; không biết vì sao campaign bị từ chối; mất thời gian nhập lại nội dung; khó theo dõi nhiều loại nội dung cùng lúc |
| **Tiêu chí thành công** | Tạo được project/campaign/reward hợp lệ, không vi phạm ownership và nhìn thấy rõ trạng thái xử lý của từng nội dung |
| **User Story liên quan** | `US-PROJ-001`, `US-CAMP-001`, `US-REWARD-001`, `US-BLOG-001`, `US-PROFILE-001` |

### UCARD-03 — Lê Thu Hà, biên tập viên nội dung

| Trường thông tin | Nội dung |
|---|---|
| **Tên đại diện** | Lê Thu Hà |
| **Tuổi/khu vực** | 26 tuổi, Thành phố Hồ Chí Minh; làm việc trên laptop |
| **Chức vụ/vai trò** | Content Author/Community Editor |
| **Bối cảnh** | Soạn bài giới thiệu campaign, project và product; cần nội dung hiển thị đẹp trên desktop và mobile |
| **Mong muốn** | Editor rich text dễ dùng; autosave; preview trước khi publish; chèn product box, image, video và link; có thể sửa draft mà không mất nội dung |
| **Khó khăn** | Sợ mất draft khi reload; HTML/iframe không an toàn; không rõ bài đang draft, pending review hay public; nội dung product có thể hiển thị sai |
| **Tiêu chí thành công** | Soạn và preview bài viết ổn định, reload không mất nội dung và nội dung nguy hiểm bị sanitize trước khi public |
| **User Story liên quan** | `US-BLOG-001`, `US-BLOG-002` |

### UCARD-04 — Phạm Gia Bảo, quản trị viên kiểm duyệt

| Trường thông tin | Nội dung |
|---|---|
| **Tên đại diện** | Phạm Gia Bảo |
| **Tuổi/khu vực** | 35 tuổi, Hà Nội; làm việc trên dashboard nội bộ |
| **Chức vụ/vai trò** | Admin/Trust & Safety Reviewer |
| **Bối cảnh** | Kiểm duyệt campaign, blog, report, user và badge; cần bảo đảm mọi thao tác có thể truy vết |
| **Mong muốn** | Có danh sách pending rõ ràng; lọc theo status; xem đủ thông tin cần thiết; approve/reject có reason; audit log và notification tự động |
| **Khó khăn** | Số lượng nội dung tăng nhanh; khó phát hiện item chưa xử lý; sợ non-admin truy cập dữ liệu; không có lý do/reason thì khó giải trình quyết định |
| **Tiêu chí thành công** | Xử lý đúng item, không lộ dữ liệu riêng tư, mọi quyết định có actor/time/reason và creator nhận được thông báo phù hợp |
| **User Story liên quan** | `US-ADMIN-001`, `US-CHAT-002` |

### UCARD-05 — Võ Đức Long, QA và developer

| Trường thông tin | Nội dung |
|---|---|
| **Tên đại diện** | Võ Đức Long |
| **Tuổi/khu vực** | 29 tuổi, làm việc từ xa; sử dụng GitHub và môi trường local/staging |
| **Chức vụ/vai trò** | QA Engineer/Full-stack Developer |
| **Bối cảnh** | Nhận User Story từ backlog, triển khai code, viết test và xác minh Pull Request trước khi release |
| **Mong muốn** | Acceptance criteria rõ; biết story liên kết với module/test nào; CI chạy tự động; report dễ đọc; phân biệt lỗi code, lỗi môi trường và lỗi dữ liệu seed |
| **Khó khăn** | Test có thể pass nhưng lint/build fail; thiếu dữ liệu test cho payment/chat; không biết test nào bắt buộc; code sinh tự động làm nhiễu lint; khó truy nguyên bug về story gốc |
| **Tiêu chí thành công** | Mỗi story có test liên kết, CI có quality gate rõ, lỗi được phân loại và Pull Request có bằng chứng nghiệm thu |
| **User Story liên quan** | `US-OPS-001` và toàn bộ story có trường `Related test` |

### UCARD-06 — Nguyễn Quốc Huy, người vận hành hệ thống

| Trường thông tin | Nội dung |
|---|---|
| **Tên đại diện** | Nguyễn Quốc Huy |
| **Tuổi/khu vực** | 38 tuổi, làm việc tại bộ phận vận hành |
| **Chức vụ/vai trò** | Operator/DevOps/Database Operator |
| **Bối cảnh** | Quản lý environment, migration, database, deployment, webhook, cron và xử lý sự cố production |
| **Mong muốn** | Deployment lặp lại được; migration có kiểm soát; health check rõ; biết provider nào đang hoạt động; có log/audit mà không chứa secret |
| **Khó khăn** | Provider có thể chưa sẵn sàng; migration ảnh hưởng production; thiếu backup/rollback; cron/webhook cần secret; build có thể không phản ánh đầy đủ lỗi runtime |
| **Tiêu chí thành công** | Release có checklist, migration được review, health check pass và có thể xác định nhanh nguyên nhân khi deployment hoặc provider lỗi |
| **User Story liên quan** | `US-PAY-003`, `US-OPS-001` |

### Bảng tổng hợp Persona → nhu cầu → rủi ro

| Persona | Nhu cầu chính | Rủi ro cần kiểm soát | Nhóm kiểm thử ưu tiên |
|---|---|---|---|
| Nguyễn Minh Anh — Backer | Pledge nhanh, payment minh bạch | Duplicate payment, hết stock, mất checkout | Integration/E2E payment |
| Trần Hoàng Nam — Creator | Quản lý project/campaign/reward | Sai ownership, sai lifecycle, mất draft | API/UI/ownership regression |
| Lê Thu Hà — Author | Soạn và publish rich content | Mất draft, XSS, render sai product | Component/security/E2E |
| Phạm Gia Bảo — Admin | Moderation có truy vết | Non-admin access, thiếu audit/reason | Role matrix/API/E2E |
| Võ Đức Long — QA/Developer | CI và acceptance rõ ràng | Test scope thiếu, lint/build fail | Jest/TypeScript/lint/build/Playwright |
| Nguyễn Quốc Huy — Operator | Release và vận hành an toàn | Migration/provider/secret/rollback | Deployment/health/webhook/DB |

> **Lưu ý:** Persona Card giúp team hiểu người dùng; nó không thay thế User Story. Persona trả lời “người dùng là ai, muốn gì và gặp khó khăn gì”, còn User Story trả lời “hệ thống cần cung cấp hành vi nào để giải quyết nhu cầu đó”.

## 3. Product Backlog tổng hợp

| ID | Epic | Tiêu đề | Actor | Ưu tiên | Điểm | Trạng thái ban đầu |
|---|---|---|---|---:|---:|---|
| US-AUTH-001 | Identity | Đăng ký và đăng nhập an toàn | Visitor/User | P0 | 5 | Ready |
| US-AUTH-002 | Identity | Khôi phục mật khẩu | User | P0 | 3 | Ready |
| US-PROJ-001 | Project | Tạo và quản lý project | Creator | P1 | 5 | Testing |
| US-CAMP-001 | Campaign | Tạo campaign và gửi review | Creator | P1 | 5 | Testing |
| US-CAMP-002 | Campaign | Khám phá campaign công khai | Visitor | P1 | 3 | Testing |
| US-REWARD-001 | Reward | Tạo reward/product và quản lý stock | Creator | P1 | 5 | Testing |
| US-PAY-001 | Payment | Pledge hoặc mua reward | Backer | P0 | 8 | Testing |
| US-PAY-002 | Payment | Thanh toán COD không làm âm stock | Backer | P0 | 5 | Testing |
| US-PAY-003 | Payment | Checkout online và webhook idempotent | Backer/Provider | P0 | 8 | Blocked |
| US-BLOG-001 | Blog | Soạn và xuất bản bài viết rich text | Author | P1 | 5 | Testing |
| US-BLOG-002 | Blog | Render nội dung an toàn, chống XSS | Reader | P0 | 3 | Testing |
| US-CHAT-001 | Chat | Trao đổi với creator hoặc participant | User | P1 | 8 | Testing |
| US-CHAT-002 | Chat | Kiểm soát participant, block và report | User/Admin | P0 | 5 | Backlog |
| US-ADMIN-001 | Moderation | Admin review campaign, blog và report | Admin | P0 | 5 | Testing |
| US-PROFILE-001 | Profile Studio | Tùy chỉnh và publish public profile | Creator/User | P1 | 8 | Testing |
| US-OPS-001 | Quality | Kiểm tra release bằng CI/CD | Developer/QA/Operator | P0 | 5 | In Progress |

## 4. Chi tiết User Story

## US-AUTH-001 — Đăng ký và đăng nhập an toàn

**Epic:** Identity  
**Actor:** Visitor/User  
**Priority:** P0  
**Story points:** 5  
**Nguồn yêu cầu:** `FR-AUTH-001` đến `FR-AUTH-006`

> Là một **visitor**, tôi muốn đăng ký và đăng nhập bằng tài khoản an toàn, để có thể sử dụng các chức năng yêu cầu định danh như pledge, chat, follow và quản lý nội dung.

### Acceptance criteria

| ID | Given | When | Then |
|---|---|---|---|
| AC-001 | Visitor đang ở trang đăng ký | Nhập email, mật khẩu và thông tin hợp lệ | Tài khoản được tạo, mật khẩu không lưu dạng plain text |
| AC-002 | User có tài khoản hợp lệ | Gửi thông tin đăng nhập đúng | Hệ thống tạo session và chuyển về trang phù hợp |
| AC-003 | User nhập sai thông tin | Gửi form đăng nhập | Hệ thống trả lỗi tổng quát, không tiết lộ chi tiết nhạy cảm |
| AC-004 | User đã đăng nhập | Truy cập login/register không cần thiết | Hệ thống xử lý redirect nhất quán |
| AC-005 | User dùng callback URL | Hoàn tất login | Chỉ được redirect tới URL hợp lệ cùng origin, không open redirect |

**Mã nguồn liên quan:** [`src/lib/auth.ts`](https://github.com/Escanor292/platform/blob/main/src/lib/auth.ts), [`src/middleware.ts`](https://github.com/Escanor292/platform/blob/main/src/middleware.ts), [`src/app/auth`](https://github.com/Escanor292/platform/tree/main/src/app/auth).  
**Kiểm thử cần có:** unit test auth, integration test login/middleware, E2E login và test tài khoản bị banned/inactive.  
**Trạng thái:** `Ready` — SRS xác nhận phần lớn code, nhưng cần test xuyên luồng.

## US-AUTH-002 — Khôi phục mật khẩu

**Epic:** Identity  
**Actor:** User  
**Priority:** P0  
**Story points:** 3  
**Nguồn yêu cầu:** `FR-AUTH-007`, `FR-AUTH-008`

> Là một **user quên mật khẩu**, tôi muốn nhận liên kết reset an toàn, để lấy lại quyền truy cập mà không làm lộ việc email có tồn tại hay không.

### Acceptance criteria

| ID | Given | When | Then |
|---|---|---|---|
| AC-001 | User nhập email bất kỳ | Gửi yêu cầu forgot password | Phản hồi có nội dung tổng quát trong cả hai trường hợp email có hoặc không tồn tại |
| AC-002 | Reset token được tạo | User mở liên kết | Token phải có thời hạn, được hash và chỉ dùng một lần |
| AC-003 | Token đã hết hạn hoặc đã dùng | User gửi mật khẩu mới | Hệ thống từ chối và không đổi mật khẩu |
| AC-004 | Token hợp lệ | User gửi mật khẩu mới hợp lệ | Mật khẩu được hash và token được đánh dấu đã sử dụng |

**Mã nguồn liên quan:** [`src/app/api/auth`](https://github.com/Escanor292/platform/tree/main/src/app/api/auth), [`prisma/schema.prisma`](https://github.com/Escanor292/platform/blob/main/prisma/schema.prisma).  
**Kiểm thử cần có:** test token hết hạn, dùng lại token, email enumeration và cập nhật mật khẩu atomic.  
**Trạng thái:** `Ready`.

## US-PROJ-001 — Tạo và quản lý project

**Epic:** Project  
**Actor:** Creator  
**Priority:** P1  
**Story points:** 5  
**Nguồn yêu cầu:** `UC-04`, `FR-PROJ-001` đến `FR-PROJ-008`

> Là một **creator**, tôi muốn tạo và quản lý project có mô tả, cover và nội dung liên kết, để tập hợp campaign, blog và reward trong một không gian riêng.

### Acceptance criteria

| ID | Given | When | Then |
|---|---|---|---|
| AC-001 | Creator hợp lệ đã đăng nhập | Gửi dữ liệu project hợp lệ | Project được tạo với slug hợp lệ |
| AC-002 | Creator là owner | Sửa hoặc xóa project | Thao tác được thực hiện theo policy |
| AC-003 | User không phải owner | Sửa hoặc xóa project | API trả `403` và dữ liệu không đổi |
| AC-004 | Project chưa có campaign/blog/reward | Visitor mở public page | Trang hiển thị empty state, không throw exception |
| AC-005 | Creator liên kết blog/reward | Gửi entity của creator khác | Server từ chối do vi phạm ownership |

**Mã nguồn liên quan:** [`src/lib/project`](https://github.com/Escanor292/platform/tree/main/src/lib/project), [`src/app/projects`](https://github.com/Escanor292/platform/tree/main/src/app/projects).  
**Test hiện có:** [`__tests__/unit/project-service.test.ts`](https://github.com/Escanor292/platform/blob/main/__tests__/unit/project-service.test.ts), [`__tests__/unit/project-response-handlers.test.ts`](https://github.com/Escanor292/platform/blob/main/__tests__/unit/project-response-handlers.test.ts), [`src/lib/project/project.validation.test.ts`](https://github.com/Escanor292/platform/blob/main/src/lib/project/project.validation.test.ts).  
**Trạng thái:** `Testing`.

## US-CAMP-001 — Tạo campaign và gửi review

**Epic:** Campaign  
**Actor:** Creator  
**Priority:** P1  
**Story points:** 5  
**Nguồn yêu cầu:** `UC-05`, `FR-CAMP-002` đến `FR-CAMP-008`

> Là một **creator**, tôi muốn tạo campaign với mục tiêu, thời gian, nội dung, category và media, để bắt đầu hoạt động gây quỹ và gửi nội dung cho admin review khi cần.

### Acceptance criteria

| ID | Given | When | Then |
|---|---|---|---|
| AC-001 | Creator có quyền tạo campaign | Gửi dữ liệu hợp lệ | Campaign được lưu với status ban đầu đúng |
| AC-002 | Creator chọn project | Submit campaign | Project phải thuộc cùng creator |
| AC-003 | Campaign cần moderation | Creator submit | Campaign chuyển sang `PENDING_REVIEW` |
| AC-004 | Admin review campaign | Admin approve/reject | Status được cập nhật, actor/reason được lưu nếu policy yêu cầu |
| AC-005 | User không sở hữu campaign | Gửi request sửa/xóa | API từ chối và không thay đổi dữ liệu |

**Mã nguồn liên quan:** [`src/app/campaigns`](https://github.com/Escanor292/platform/tree/main/src/app/campaigns), [`src/app/api/campaigns`](https://github.com/Escanor292/platform/tree/main/src/app/api/campaigns).  
**Test hiện có:** [`__tests__/api/campaigns/create-with-project.test.ts`](https://github.com/Escanor292/platform/blob/main/__tests__/api/campaigns/create-with-project.test.ts).  
**Kiểm thử cần bổ sung:** lifecycle transition matrix, ownership, campaign có/không có project và destructive action.  
**Trạng thái:** `Testing`.

## US-CAMP-002 — Khám phá campaign công khai

**Epic:** Campaign  
**Actor:** Visitor  
**Priority:** P1  
**Story points:** 3  
**Nguồn yêu cầu:** `UC-01`, `FR-CAMP-001`, `FR-CAMP-010`, `FR-CAMP-012`

> Là một **visitor**, tôi muốn tìm kiếm, lọc, sắp xếp và xem campaign public, để chọn hoạt động gây quỹ phù hợp.

### Acceptance criteria

| ID | Given | When | Then |
|---|---|---|---|
| AC-001 | Visitor mở campaign listing | Không đăng nhập | Chỉ campaign public được trả về |
| AC-002 | Visitor nhập từ khóa/filter | Gửi truy vấn | Kết quả có pagination và filter đúng |
| AC-003 | Campaign thiếu project/reward/blog | Visitor mở detail | Trang hiển thị an toàn với empty state |
| AC-004 | Visitor xem campaign | API trả dữ liệu | Không leak thông tin private của creator/backer |

**Mã nguồn liên quan:** [`src/app/campaigns`](https://github.com/Escanor292/platform/tree/main/src/app/campaigns), [`src/app/api/campaigns`](https://github.com/Escanor292/platform/tree/main/src/app/api/campaigns).  
**Kiểm thử cần có:** API contract, pagination, empty state và public-data security test.  
**Trạng thái:** `Testing`.

## US-REWARD-001 — Tạo reward/product và quản lý stock

**Epic:** Reward/Product  
**Actor:** Creator  
**Priority:** P1  
**Story points:** 5  
**Nguồn yêu cầu:** `UC-06`, `FR-REWARD-001` đến `FR-REWARD-009`

> Là một **creator**, tôi muốn tạo reward hoặc product với giá, availability, stock, media và ngày giao hàng, để cung cấp phần quà phù hợp cho backer.

### Acceptance criteria

| ID | Given | When | Then |
|---|---|---|---|
| AC-001 | Creator nhập thông tin reward hợp lệ | Submit form | Reward được tạo và gắn đúng campaign/project |
| AC-002 | Reward thuộc campaign | User gửi relation khác owner | Server từ chối relation không hợp lệ |
| AC-003 | Product độc lập không có campaign | Visitor mở product detail | Trang render đúng và không lỗi nullable relation |
| AC-004 | Reward có stock | Checkout xảy ra đồng thời | Stock không bị âm và không vượt giới hạn |
| AC-005 | Reward `DEVELOPMENT` | User chọn COD | Hệ thống từ chối COD theo policy |

**Mã nguồn liên quan:** [`src/app/products`](https://github.com/Escanor292/platform/tree/main/src/app/products), [`src/app/api/products`](https://github.com/Escanor292/platform/tree/main/src/app/api/products), [`prisma/schema.prisma`](https://github.com/Escanor292/platform/blob/main/prisma/schema.prisma).  
**Kiểm thử cần bổ sung:** stock concurrency, nullable relation, upload MIME/size và availability policy.  
**Trạng thái:** `Testing`.

## US-PAY-001 — Pledge hoặc mua reward

**Epic:** Payment  
**Actor:** Backer  
**Priority:** P0  
**Story points:** 8  
**Nguồn yêu cầu:** `UC-02`, `FR-PAY-001` đến `FR-PAY-005`

> Là một **backer**, tôi muốn chọn reward, số lượng và phương thức thanh toán, để ủng hộ campaign hoặc mua sản phẩm với số tiền được server tính chính xác.

### Acceptance criteria

| ID | Given | When | Then |
|---|---|---|---|
| AC-001 | Campaign không `ACTIVE` | Backer submit pledge | Hệ thống từ chối và không tạo pledge |
| AC-002 | Quantity vượt `maxQuantity` hoặc stock | Backer submit | Hệ thống trả conflict, không tạo giao dịch dở dang |
| AC-003 | Client gửi total đã chỉnh sửa | API nhận request | Server tự tính amount, fee, VAT và total |
| AC-004 | Dữ liệu email/shipping không hợp lệ | Backer chọn COD | Request bị từ chối trước khi tạo pledge |
| AC-005 | Request hợp lệ | Backer submit | Pledge có transaction ID duy nhất và trạng thái phù hợp |

**Mã nguồn liên quan:** [`src/app/api/payments`](https://github.com/Escanor292/platform/tree/main/src/app/api/payments), [`src/app/api/checkout-sessions`](https://github.com/Escanor292/platform/tree/main/src/app/api/checkout-sessions).  
**Kiểm thử cần có:** API integration, tamper total, duplicate request, campaign state, stock race và authorization.  
**Trạng thái:** `Testing`.

## US-PAY-002 — Thanh toán COD không làm âm stock

**Epic:** Payment  
**Actor:** Backer/Operator  
**Priority:** P0  
**Story points:** 5  
**Nguồn yêu cầu:** `FR-PAY-004`, `FR-PAY-005`, `FR-REWARD-008`

> Là một **backer**, tôi muốn đặt COD trong điều kiện hợp lệ, để đơn được tạo mà stock vẫn chính xác và không phát sinh đơn vượt số lượng.

### Acceptance criteria

| ID | Given | When | Then |
|---|---|---|---|
| AC-001 | Reward là `AVAILABLE`, còn stock | Submit COD | Stock bị decrement trong transaction và pledge được tạo `PENDING` |
| AC-002 | Reward hết stock | Submit COD | API trả lỗi conflict, stock không đổi, không tạo pledge |
| AC-003 | Hai request đồng thời cùng mua item cuối | Cả hai submit | Chỉ số lượng hợp lệ được chấp nhận |
| AC-004 | Transaction thất bại | Database rollback | Stock và pledge không ở trạng thái dở dang |

**Mã nguồn liên quan:** [`src/app/api/payments`](https://github.com/Escanor292/platform/tree/main/src/app/api/payments), [`prisma/schema.prisma`](https://github.com/Escanor292/platform/blob/main/prisma/schema.prisma).  
**Kiểm thử cần có:** integration test với PostgreSQL thật và test concurrency.  
**Trạng thái:** `Testing`.

## US-PAY-003 — Checkout online và webhook idempotent

**Epic:** Payment  
**Actor:** Backer/Provider  
**Priority:** P0  
**Story points:** 8  
**Nguồn yêu cầu:** `FR-PAY-006`, `FR-PAY-007`, `FR-PAY-014`

> Là một **backer**, tôi muốn được chuyển tới hosted checkout và nhận trạng thái thanh toán chính xác, để giao dịch online không bị ghi nhận trùng hoặc sai trạng thái.

### Acceptance criteria

| ID | Given | When | Then |
|---|---|---|---|
| AC-001 | Pledge hợp lệ | Backer chọn online | Pledge được tạo `PENDING` và trả checkout URL hợp lệ |
| AC-002 | Provider gửi webhook đúng chữ ký | Hệ thống nhận callback | Webhook cập nhật trạng thái đúng một lần |
| AC-003 | Provider gửi lại cùng webhook | Hệ thống nhận duplicate callback | Không tạo invoice, pledge hoặc stock mutation trùng |
| AC-004 | Webhook sai chữ ký | Hệ thống nhận callback | Request bị từ chối và không thay đổi dữ liệu |
| AC-005 | Provider chưa được cấu hình production | Backer chọn flow chưa sẵn sàng | UI/API hiển thị rõ `Blocked/Unavailable`, không tuyên bố đã thanh toán |

**Mã nguồn liên quan:** [`src/app/api/payment`](https://github.com/Escanor292/platform/tree/main/src/app/api/payment), [`src/app/api/payments`](https://github.com/Escanor292/platform/tree/main/src/app/api/payments).  
**Kiểm thử cần có:** webhook signature, idempotency, state machine, retry, refund và E2E với sandbox provider.  
**Trạng thái:** `Blocked` nếu thiếu credentials/provider callback đã xác minh.

## US-BLOG-001 — Soạn và xuất bản bài viết rich text

**Epic:** Blog  
**Actor:** Author/Creator  
**Priority:** P1  
**Story points:** 5  
**Nguồn yêu cầu:** `UC-07`, `FR-BLOG-001` đến `FR-BLOG-010`

> Là một **author**, tôi muốn soạn, autosave, preview và publish bài blog rich text, để giới thiệu campaign, project hoặc reward tới cộng đồng.

### Acceptance criteria

| ID | Given | When | Then |
|---|---|---|---|
| AC-001 | Author tạo draft | Nhập nội dung | Editor hỗ trợ rich text và hiển thị trạng thái lưu |
| AC-002 | Author reload trang | Draft đã autosave | Nội dung được khôi phục, không mất dữ liệu |
| AC-003 | Author chèn product box | Preview/render bài viết | Product hiển thị title, price, image và CTA đúng |
| AC-004 | Author publish | Dữ liệu hợp lệ | Bài viết có status/visibility đúng và public reader xem được nếu policy cho phép |
| AC-005 | User không phải author/admin | Sửa/xóa post của người khác | API từ chối |

**Mã nguồn liên quan:** [`src/app/blog`](https://github.com/Escanor292/platform/tree/main/src/app/blog), [`src/components/editor`](https://github.com/Escanor292/platform/tree/main/src/components/editor).  
**Test hiện có:** [`src/components/shared/RichTextRenderer.test.tsx`](https://github.com/Escanor292/platform/blob/main/src/components/shared/RichTextRenderer.test.tsx).  
**Kiểm thử cần bổ sung:** autosave/reload, ownership, publish workflow và product box contract.  
**Trạng thái:** `Testing`.

## US-BLOG-002 — Render nội dung an toàn, chống XSS

**Epic:** Blog/Security  
**Actor:** Reader  
**Priority:** P0  
**Story points:** 3  
**Nguồn yêu cầu:** `FR-BLOG-005`, `FR-PLAT-005`

> Là một **reader**, tôi muốn nội dung blog được sanitize, để có thể đọc bài viết mà không bị thực thi HTML, script hoặc iframe độc hại.

### Acceptance criteria

| ID | Given | When | Then |
|---|---|---|---|
| AC-001 | Nội dung chứa script | Reader mở bài viết | Script không được thực thi |
| AC-002 | URL link không hợp lệ | Renderer xử lý | Link bị loại hoặc không được render nguy hiểm |
| AC-003 | Nội dung hợp lệ | Reader mở bài viết | Formatting được giữ đúng ở mức được phép |
| AC-004 | Nội dung có image/video | Renderer xử lý | Media được giới hạn theo policy và không gây layout/runtime error |

**Mã nguồn liên quan:** [`src/components/shared/RichTextRenderer.tsx`](https://github.com/Escanor292/platform/blob/main/src/components/shared/RichTextRenderer.tsx).  
**Test hiện có:** `RichTextRenderer.test.tsx`; cần bổ sung security regression với payload XSS đại diện.  
**Trạng thái:** `Testing`.

## US-CHAT-001 — Trao đổi với creator hoặc participant

**Epic:** Chat  
**Actor:** User  
**Priority:** P1  
**Story points:** 8  
**Nguồn yêu cầu:** `UC-08`, `FR-CHAT-001` đến `FR-CHAT-008`

> Là một **user**, tôi muốn chat với creator hoặc participant, gửi message và xem trạng thái đã đọc, để trao đổi về campaign, product hoặc việc ủng hộ.

### Acceptance criteria

| ID | Given | When | Then |
|---|---|---|---|
| AC-001 | User là participant | Mở conversation | User đọc được thread của mình |
| AC-002 | User gửi text/emoji/attachment hợp lệ | Submit message | Message được lưu và hiển thị đúng |
| AC-003 | Conversation có message chưa đọc | User mở thread | Unread count được cập nhật idempotent |
| AC-004 | Participant đã bị xóa | User mở conversation | UI hiển thị fallback `Người dùng đã xóa` |
| AC-005 | User rời hoặc refresh thread | Conversation mở lại | Scroll position và input không bị khóa bất thường |

**Mã nguồn liên quan:** [`src/app/chat`](https://github.com/Escanor292/platform/tree/main/src/app/chat), [`src/components/chat`](https://github.com/Escanor292/platform/tree/main/src/components/chat), [`src/services/mongodb`](https://github.com/Escanor292/platform/tree/main/src/services/mongodb).  
**Kiểm thử cần có:** API authorization, message persistence, unread/read regression, attachment validation và Playwright responsive test.  
**Trạng thái:** `Testing`.

## US-CHAT-002 — Kiểm soát participant, block và report

**Epic:** Chat/Trust & Safety  
**Actor:** User/Admin  
**Priority:** P0  
**Story points:** 5  
**Nguồn yêu cầu:** `FR-CHAT-002`, `FR-CHAT-009`, `FR-CHAT-010`

> Là một **user**, tôi muốn block hoặc report conversation và chỉ participant mới được xem dữ liệu, để bảo vệ quyền riêng tư và an toàn khi giao tiếp.

### Acceptance criteria

| ID | Given | When | Then |
|---|---|---|---|
| AC-001 | User không thuộc conversation | Gọi API đọc/gửi message | API trả `403` |
| AC-002 | User report conversation | Gửi lý do hợp lệ | Report được lưu với actor, reason và thời gian |
| AC-003 | User block participant | Xác nhận block | Chính sách block được áp dụng nhất quán ở UI/API |
| AC-004 | Admin xem report | Mở moderation view | Admin thấy đủ dữ liệu cần xử lý nhưng không thấy secret |

**Mã nguồn liên quan:** [`src/app/api/chat`](https://github.com/Escanor292/platform/tree/main/src/app/api/chat), [`src/components/chat`](https://github.com/Escanor292/platform/tree/main/src/components/chat).  
**Kiểm thử cần có:** security/integration test cho cross-user access, report idempotency và audit.  
**Trạng thái:** `Backlog`.

## US-ADMIN-001 — Admin review campaign, blog và report

**Epic:** Moderation  
**Actor:** Admin  
**Priority:** P0  
**Story points:** 5  
**Nguồn yêu cầu:** `UC-09`, `FR-ADMIN-001` đến `FR-ADMIN-005`

> Là một **admin**, tôi muốn review campaign, blog, report, user và badge, để duy trì an toàn, minh bạch và chất lượng nội dung trên nền tảng.

### Acceptance criteria

| ID | Given | When | Then |
|---|---|---|---|
| AC-001 | Non-admin gọi admin API | Gửi request | API trả `403` |
| AC-002 | Admin mở danh sách pending | Tải dashboard | Các entity cần review được phân trang và hiển thị rõ status |
| AC-003 | Admin approve/reject | Gửi action kèm reason | Status, actor, timestamp và reason được lưu theo policy |
| AC-004 | Review hoàn tất | Creator có notification | Notification được tạo nếu event handler/feature flag bật |
| AC-005 | Admin xử lý report | Chọn resolution | Report chuyển trạng thái và có audit trail |

**Mã nguồn liên quan:** [`src/app/admin`](https://github.com/Escanor292/platform/tree/main/src/app/admin), [`src/app/api/admin`](https://github.com/Escanor292/platform/tree/main/src/app/api/admin).  
**Kiểm thử cần có:** role matrix, API integration, audit assertion, notification event và E2E admin workflow.  
**Trạng thái:** `Testing`.

## US-PROFILE-001 — Tùy chỉnh và publish public profile

**Epic:** Profile Studio  
**Actor:** Creator/User  
**Priority:** P1  
**Story points:** 8  
**Nguồn yêu cầu:** `FR-PROFILE-CUST-001` đến `FR-PROFILE-CUST-008`

> Là một **creator**, tôi muốn tùy chỉnh bố cục, preset, màu sắc và nội dung nổi bật trên profile, để giới thiệu project, campaign, reward và blog theo nhận diện của mình.

### Acceptance criteria

| ID | Given | When | Then |
|---|---|---|---|
| AC-001 | User đã đăng nhập | Mở Profile Studio | Chỉ owner được chỉnh cấu hình profile của mình |
| AC-002 | Owner chọn preset/theme | Lưu draft | Server chỉ nhận enum/token/ID hợp lệ, không nhận HTML/CSS/JS tự do |
| AC-003 | Owner chọn featured content | Lưu cấu hình | Server kiểm tra ownership từng project/campaign/reward/blog |
| AC-004 | Owner publish | Mở public profile | Public profile dùng `publishedConfig`, không dùng draft |
| AC-005 | Config bị thiếu hoặc malformed | Public profile render | Hệ thống fallback về config mặc định an toàn |
| AC-006 | Owner restore snapshot | Xác nhận restore | Public config được khôi phục và lịch sử vẫn truy vết được |
| AC-007 | Profile có privacy setting | Visitor xem public page | Email, phone, KYC, draft và private content không bị lộ |

**Mã nguồn liên quan:** [`src/app/profile`](https://github.com/Escanor292/platform/tree/main/src/app/profile), [`src/app/api/profile`](https://github.com/Escanor292/platform/tree/main/src/app/api/profile), [`prisma/schema.prisma`](https://github.com/Escanor292/platform/blob/main/prisma/schema.prisma).  
**Test hiện có:** [`__tests__/lib/profile-customization.test.ts`](https://github.com/Escanor292/platform/blob/main/__tests__/lib/profile-customization.test.ts).  
**Kiểm thử cần bổ sung:** owner isolation, privacy regression, malformed config, publish/restore và visual regression.  
**Trạng thái:** `Testing`.

## US-OPS-001 — Kiểm tra release bằng CI/CD

**Epic:** Quality & Operations  
**Actor:** Developer/QA/Operator  
**Priority:** P0  
**Story points:** 5  
**Nguồn yêu cầu:** `UC-10`, tài liệu vận hành và workflow CI

> Là một **developer/QA**, tôi muốn mỗi Pull Request tự động chạy quality gate, để chỉ merge code đã qua test, type check và các kiểm tra build cần thiết.

### Acceptance criteria

| ID | Given | When | Then |
|---|---|---|---|
| AC-001 | Có Pull Request vào `main` | GitHub Actions khởi chạy | CI chạy install, Prisma generate, Jest và TypeScript check |
| AC-002 | Jest hoặc TypeScript fail | CI kết thúc | Quality job fail và Pull Request không được coi là đạt |
| AC-003 | Có thay đổi API/payment/auth | CI chạy | Test liên quan được thực thi hoặc được đánh dấu cần chạy thủ công |
| AC-004 | Có thay đổi E2E public assistant | Workflow E2E khởi chạy | PostgreSQL được seed, Chromium được cài và Playwright chạy |
| AC-005 | Code chuẩn bị release | Operator triển khai | Lint, build, migration và environment được kiểm tra trước deploy |
| AC-006 | Test hoặc build tạo artifact | CI kết thúc | Jest/Playwright report được lưu để review |

**Mã nguồn liên quan:** [`package.json`](https://github.com/Escanor292/platform/blob/main/package.json), [`jest.config.js`](https://github.com/Escanor292/platform/blob/main/jest.config.js), [`playwright.config.ts`](https://github.com/Escanor292/platform/blob/main/playwright.config.ts), [`platform-ci.yml`](https://github.com/Escanor292/platform/blob/main/.github/workflows/platform-ci.yml).  
**Trạng thái hiện tại:** `In Progress`. Jest và TypeScript đã có trong CI; lint và build cần được bổ sung hoặc xử lý quality gate trước khi xem là `Done`.

## 5. Definition of Ready

Một User Story chỉ được đưa vào sprint khi có đủ:

| Điều kiện | Mô tả |
|---|---|
| Actor rõ ràng | Biết ai là người sử dụng hoặc hệ thống nào thực hiện hành vi. |
| Giá trị rõ ràng | Có lý do nghiệp vụ, không chỉ mô tả một thao tác kỹ thuật. |
| Acceptance criteria | Có điều kiện thành công, lỗi và quyền truy cập quan trọng. |
| Phạm vi | Biết route, page, service hoặc schema có liên quan. |
| Dữ liệu test | Có fixture/seed hoặc kế hoạch tạo dữ liệu kiểm thử. |
| Phụ thuộc | Đã ghi rõ database, provider, secret, migration hoặc team phụ thuộc. |
| Độ lớn phù hợp | Story khoảng 1–8 điểm; story 8 điểm nên được tách nếu có thể. |

## 6. Definition of Done

Một User Story được coi là `Done` khi:

1. Acceptance criteria đã được chuyển thành test case hoặc kiểm tra nghiệm thu có thể lặp lại.
2. Code đã được review qua Pull Request và không còn issue P0/P1 chưa xử lý.
3. Unit/integration/UI/E2E test phù hợp đã pass.
4. TypeScript check, lint theo phạm vi quy định và build đã pass.
5. Migration, environment variable, permission và security impact đã được review nếu story có liên quan.
6. Tài liệu SRS hoặc system map đã được cập nhật nếu hành vi hệ thống thay đổi.
7. Story đã được demo trên môi trường preview/staging khi có thay đổi UI hoặc luồng nghiệp vụ.

## 7. Gợi ý chia Sprint

| Sprint | Mục tiêu | User Story đề xuất |
|---|---|---|
| Sprint 1 — Baseline | Ổn định quality gate và identity | `US-AUTH-001`, `US-AUTH-002`, `US-OPS-001` |
| Sprint 2 — Core content | Creator có thể tạo nội dung cơ bản | `US-PROJ-001`, `US-CAMP-001`, `US-CAMP-002`, `US-REWARD-001` |
| Sprint 3 — Payment safety | Hoàn thiện pledge, COD và test giao dịch | `US-PAY-001`, `US-PAY-002` |
| Sprint 4 — Provider | Xác minh online checkout/webhook | `US-PAY-003` |
| Sprint 5 — Community | Blog và chat an toàn | `US-BLOG-001`, `US-BLOG-002`, `US-CHAT-001` |
| Sprint 6 — Trust | Moderation, block/report và admin | `US-CHAT-002`, `US-ADMIN-001` |
| Sprint 7 — Profile | Profile Studio và visual/security regression | `US-PROFILE-001` |

## 8. Traceability matrix

| User Story | SRS/Use Case | Mã nguồn chính | Test hiện có hoặc cần thêm |
|---|---|---|---|
| `US-AUTH-001` | `FR-AUTH-001`–`006` | `src/lib/auth.ts`, `src/middleware.ts` | Auth unit/integration/E2E — cần chuẩn hóa |
| `US-AUTH-002` | `FR-AUTH-007`–`008` | `src/app/api/auth`, `password_reset_tokens` | Token expiry/reuse — cần thêm |
| `US-PROJ-001` | `UC-04`, `FR-PROJ-*` | `src/lib/project`, `src/app/projects` | Project unit/validation — đã có |
| `US-CAMP-001` | `UC-05`, `FR-CAMP-*` | `src/app/api/campaigns` | Create-with-project — đã có; lifecycle — cần thêm |
| `US-CAMP-002` | `UC-01`, `FR-CAMP-001` | `src/app/campaigns` | Public listing/empty state — cần thêm |
| `US-REWARD-001` | `UC-06`, `FR-REWARD-*` | `src/app/products`, reward API | Stock/upload/ownership — cần thêm |
| `US-PAY-001` | `UC-02`, `FR-PAY-*` | `src/app/api/payments` | Payment integration/concurrency — cần thêm |
| `US-PAY-003` | `FR-PAY-006`–`014` | `src/app/api/payment` | Signature/idempotency/E2E — cần thêm |
| `US-BLOG-001` | `UC-07`, `FR-BLOG-*` | `src/app/blog`, `src/components/editor` | Renderer test đã có; editor flow — cần thêm |
| `US-CHAT-001` | `UC-08`, `FR-CHAT-*` | `src/components/chat`, `src/app/chat` | Authorization/read state/E2E — cần thêm |
| `US-ADMIN-001` | `UC-09`, `FR-ADMIN-*` | `src/app/admin`, `src/app/api/admin` | Role/audit/E2E — cần thêm |
| `US-PROFILE-001` | `FR-PROFILE-CUST-*` | `src/app/profile`, profile API | Profile customization test — đã có; visual/security — cần thêm |
| `US-OPS-001` | `UC-10` | `.github/workflows/platform-ci.yml` | Jest/TS/E2E đã có; lint/build — cần hoàn thiện |

## 9. Ghi chú quản lý backlog

Các story trong tài liệu này là **backlog kỹ thuật/nghiệp vụ đề xuất**, không phải tuyên bố rằng mọi story đã hoàn tất production. Trạng thái phải được cập nhật dựa trên Pull Request, test result, deployment preview và xác minh runtime.

Khi triển khai trên GitHub, mỗi story nên được tạo thành một Issue hoặc Project item với các trường `ID`, `Epic`, `Priority`, `Story Points`, `Status`, `Acceptance Criteria`, `Related PR`, `Related Test` và `Release`. Không nên dùng một tài liệu Markdown duy nhất làm nguồn trạng thái sống nếu team đã bắt đầu theo dõi sprint trên GitHub Projects.

## References

[1]: https://github.com/Escanor292/platform "Repository Tử Tế Fund"
[2]: https://github.com/Escanor292/platform/blob/main/docs/SRS-TU-TE-FUND.md "SRS Tử Tế Fund"
[3]: https://github.com/Escanor292/platform/blob/main/package.json "Scripts và dependencies"
[4]: https://github.com/Escanor292/platform/blob/main/.github/workflows/platform-ci.yml "GitHub Actions CI"
[5]: https://github.com/Escanor292/platform/blob/main/jest.config.js "Jest configuration"
[6]: https://github.com/Escanor292/platform/blob/main/playwright.config.ts "Playwright configuration"
