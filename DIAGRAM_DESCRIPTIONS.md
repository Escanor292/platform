# 📖 MÔ TẢ CHI TIẾT SƠ ĐỒ USE CASE VÀ ER DIAGRAM - TỬ TẾ FUND

Tài liệu này cung cấp mô tả chi tiết và chính xác về cấu trúc chức năng và cơ sở dữ liệu của hệ thống **TửTế Fund**, phục vụ cho việc lập tài liệu kỹ thuật và thuyết trình.

---

## I. MÔ TẢ CHI TIẾT SƠ ĐỒ USE CASE (USE CASE DESCRIPTIONS)

### 1. Danh sách các Actor
*   **Guest (Người dùng chưa đăng nhập):** Đối tượng tiềm năng muốn tìm hiểu dự án.
*   **Backer (Người ủng hộ):** Cá nhân/tổ chức đóng góp tài chính để nhận lại các phần quà hoặc giá trị tinh thần.
*   **Creator (Nhà sáng tạo):** Chủ dự án cần huy động vốn, chịu trách nhiệm triển khai ý tưởng.
*   **Admin (Quản trị viên):** Người điều phối, kiểm duyệt và bảo vệ tính minh bạch của nền tảng.
*   **System (Hệ thống):** Các tác vụ tự động hóa (gửi mail, xử lý thanh toán, lưu nhật ký).

### 2. Các nhóm chức năng chính

#### A. Nhóm Quản lý Tài khoản & Định danh
*   **Đăng ký/Đăng nhập:** Hỗ trợ đăng nhập qua email/mật khẩu hoặc OAuth.
*   **Xác minh KYC (Chỉ dành cho Creator):** Nhà sáng tạo phải cung cấp CCCD/Hộ chiếu và ảnh chân dung. Admin sẽ kiểm tra tính hợp lệ để cấp quyền tạo chiến dịch. Đây là chốt chặn quan trọng để chống gian lận.
*   **Quản lý Hồ sơ cá nhân:** Nơi hiển thị uy tín, lịch sử các dự án đã thực hiện hoặc các dự án đã ủng hộ.

#### B. Nhóm Quản lý Chiến dịch (Creator & Admin)
*   **Tạo chiến dịch (Draft):** Creator soạn thảo nội dung, tải ảnh, video, thiết lập mục tiêu tài chính và các mức phần thưởng (Rewards).
*   **Gửi duyệt (Pending Review):** Sau khi hoàn thiện, dự án được gửi đến Admin.
*   **Phê duyệt dự án (Admin):** Admin kiểm tra nội dung có vi phạm chính sách hay không trước khi cho phép hiển thị công khai.
*   **Đăng cập nhật (Project Updates):** Trong suốt quá trình gọi vốn, Creator đăng bài viết để báo cáo tiến độ cho Backer.

#### C. Nhóm Ủng hộ & Thanh toán (Backer)
*   **Chọn phần thưởng (Reward Selection):** Backer chọn mức ủng hộ tương ứng với quà tặng mong muốn.
*   **Thanh toán trực tuyến:** Hệ thống kết nối với PayOS/VNPay/Momo. Tiền được chuyển qua bên thứ ba uy tín giữ hộ.
*   **Nhận hóa đơn điện tử:** Sau khi thanh toán thành công, hệ thống tự động tạo file PDF hóa đơn và gửi về email người dùng.

#### D. Nhóm Tương tác & Uy tín
*   **Trò chuyện 1-1:** Kết nối trực tiếp giữa Backer và Creator để giải đáp thắc mắc.
*   **Hệ thống Huy hiệu (Badges):** Tự động trao tặng huy hiệu cho người dùng tích cực dựa trên số tiền ủng hộ hoặc số dự án đã hoàn thành.
*   **Báo cáo vi phạm (Report):** Backer có thể báo cáo dự án nếu thấy dấu hiệu không minh bạch.

---

## II. MÔ TẢ CHI TIẾT SƠ ĐỒ THỰC THỂ (ER DIAGRAM DESCRIPTIONS)

Hệ thống được thiết kế theo kiến trúc **Hybrid Database** để tối ưu hiệu năng.

### 1. Các thực thể cốt lõi (Core Entities - PostgreSQL)

#### **1.1. Thực thể User (Người dùng)**
*   **Vai trò:** Lưu trữ thông tin định danh và phân quyền.
*   **Thuộc tính chính:** `id`, `email`, `role` (ADMIN, CREATOR, BACKER), `status` (NORMAL, BANNED), `isOrganization` (Cá nhân hay tổ chức).
*   **Mối quan hệ:** 
    *   1-N với `Campaign` (Một người dùng có thể tạo nhiều dự án).
    *   1-N với `Pledge` (Một người dùng có thể ủng hộ nhiều lần).
    *   1-1 với `KYCInfo` (Mỗi người dùng có một hồ sơ xác minh duy nhất).

#### **1.2. Thực thể Campaign (Chiến dịch)**
*   **Vai trò:** Trung tâm của hệ thống, chứa thông tin gọi vốn.
*   **Thuộc tính chính:** `title`, `goalAmount` (Mục tiêu), `currentAmount` (Số tiền hiện có), `status` (DRAFT, ACTIVE, SUCCESS, FAILED), `endDate`.
*   **Mối quan hệ:**
    *   1-N với `Reward` (Một dự án có nhiều mức quà tặng).
    *   1-N with `Pledge` (Nhận nhiều lượt ủng hộ).
    *   1-N with `BlogPost` (Chứa các bài viết cập nhật).

#### **1.3. Thực thể Pledge (Lượt ủng hộ)**
*   **Vai trò:** Lưu vết mọi giao dịch tài chính.
*   **Thuộc tính chính:** `amount`, `status` (SUCCESS, PENDING, REFUNDED), `transactionId` (Mã giao dịch từ ngân hàng), `payosOrderCode`.
*   **Mối quan hệ:** Liên kết giữa `User`, `Campaign` và `Reward`.

#### **1.4. Thực thể KYCInfo (Xác minh danh tính)**
*   **Vai trò:** Lưu trữ tài liệu pháp lý của chủ dự án.
*   **Thuộc tính chính:** `idCardNumber`, `idCardFrontImage`, `idCardBackImage`, `verificationStatus`.

### 2. Các thực thể mở rộng (Extended Entities)
*   **Badge (Huy hiệu):** Lưu định nghĩa về tên, icon và độ hiếm của huy hiệu.
*   **UserBadge:** Bảng trung gian quản lý việc cấp phát huy hiệu cho người dùng.
*   **AuditLog (Nhật ký hệ thống):** Lưu vết mọi hành động (Ai đã làm gì, lúc nào, giá trị cũ là gì, giá trị mới là gì).

### 3. Thực thể tại MongoDB (Dữ liệu phi cấu trúc)
*   **BlogContent:** Lưu trữ nội dung bài viết dài dưới dạng JSON (để hỗ trợ trình soạn thảo Rich Text).
*   **ChatMessage:** Lưu trữ nội dung tin nhắn thời gian thực để đảm bảo tốc độ phản hồi cực nhanh và không làm nặng cơ sở dữ liệu quan hệ.

---

## III. QUY TẮC RÀNG BUỘC VÀ TÍNH TOÀN VẸN
1.  **Tính duy nhất:** Mã giao dịch (`transactionId`) và số hóa đơn là duy nhất trên toàn hệ thống.
2.  **Ràng buộc logic:** Chỉ khi `Campaign` ở trạng thái `ACTIVE` mới cho phép `Pledge`.
3.  **Toàn vẹn dữ liệu:** Khi xóa một `User`, tất cả các `Pledge` của người đó sẽ được giữ lại (để đối soát tài chính) nhưng được đánh dấu ẩn danh, trong khi các `KYCInfo` nhạy cảm sẽ bị xóa bỏ theo chính sách bảo mật.
