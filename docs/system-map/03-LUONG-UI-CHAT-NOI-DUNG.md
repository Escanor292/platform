# Luồng người dùng, UI, chat và nội dung

## 1. Nguyên tắc giao diện

Trang chủ là nguồn chuẩn visual của Tử Tế Fund. Public UI ưu tiên nền `cream`/trắng/gradient ấm; heading dùng `dblue`; CTA chính dùng `pgreen` hoặc `gradient-green`; `tblue` dành cho thông tin tin cậy/bảo mật; đỏ chỉ dùng cho lỗi hoặc hành động nguy hiểm.

Card public ưu tiên `glass`, `rounded-3xl`, spacing rộng và hover nhẹ. Card dữ liệu/campaign dùng nền trắng, shadow và transition; dashboard/admin ưu tiên border rõ, shadow nhẹ, ít blur. Button khi loading phải disabled, có spinner và text rõ như “Đang xử lý...”. Tránh blue mặc định, indigo, purple, màu neon và nền xám lạnh trên public page nếu có thể dùng palette thương hiệu.

## 2. Campaign/project/reward

Khách khám phá campaign hoặc project, mở detail, xem nội dung liên quan, reward/product và creator. Campaign hiển thị project liên kết nếu có; project hiển thị campaign, blog và sản phẩm liên quan theo các quan hệ trong schema. Creator có thể tạo/sửa campaign, project, reward và gắn media.

Khi mở pledge từ campaign, modal checkout phải mở đúng reward hoặc donation chung. Reward `AVAILABLE` dùng nhãn mua/đặt hàng, không bắt buộc ngày giao dự kiến và có thể chọn COD nếu đủ điều kiện. Reward `DEVELOPMENT` dùng nhãn ủng hộ, có thể hiển thị ngày dự kiến và không cho COD.

Nếu checkout cần login/register để lưu hoặc dùng payment method, thông tin trước đó được lưu trong checkout session tạm thời; sau xác thực phải quay lại đúng trang, mở lại đúng modal và giữ amount, tip, reward, shipping, anonymous và payment method.

## 3. Product detail và cart

Reward/product có card media, giá, stock, giảm giá nếu có, chia sẻ link, quick edit theo quyền creator và nút mua/ủng hộ. Khi stock bằng 0, giao diện có thể chuyển sang liên hệ creator theo nghiệp vụ hiện hành. Product detail có thể mở chat kèm product context. Giỏ hàng và checkout phải lấy giá/stock thật từ server, không tin tổng tiền do client tính.

## 4. Blog và rich text

Creator/admin tạo draft, sửa, preview, publish và quản lý bài viết. Blog có thể độc lập hoặc liên kết project/campaign, gắn product qua product box/card, inline link, comparison hoặc banner tùy editor hỗ trợ. Public reader có thể xem, like, bookmark, comment và report theo quyền/visibility.

Rich text phải được sanitize trước khi render. Slug duy nhất; status và visibility cần được kiểm tra server-side. Admin có luồng review nội dung, comment và report. Các acceptance criteria đầy đủ của SRS cũ được giữ trong archive; khi phát triển thêm cần xác minh với route/schema hiện tại.

## 5. Chat

Người dùng mở chat trực tiếp hoặc từ campaign/product. Conversation lưu participant, loại direct/campaign, last message và unread state. Người dùng có thể gửi tin, xuống dòng, emoji nhiều lựa chọn, reaction dưới bong bóng, tìm kiếm tin, đánh dấu đã xem, reveal tin nhạy cảm, block/report và xóa mềm tin của mình.

UI chat cần giữ panel tin nhắn ở vùng nhìn thấy, cuộn về tin mới nhất khi mở conversation nhưng không nhảy xuống footer khi reveal nội dung hoặc loading. Tin nhắn mới tạo unread notification; khi mở hoặc đánh dấu read phải bỏ thông báo tương ứng. Nếu participant bị xóa, cả sidebar và message header dùng cùng một style trung lập và nhãn `Người dùng đã xóa`.

Gọi thoại/video dùng WebRTC ở mức client signaling hiện có; cần kiểm tra TURN/NAT, quyền microphone/camera và cleanup call state trước khi coi là production-ready.

## 6. KYC, badge và admin

Creator pending có thể đi qua KYC submit/status; admin có dashboard review, badge, campaign/blog moderation, report và user management. KYC, transaction limit, hóa đơn, audit log và cron trong SRS cũ là các yêu cầu chi tiết cần phân biệt với phần đã triển khai thật trong source.

## 7. Checklist UI

| Trước khi sửa | Cần bảo đảm |
|---|---|
| Màu | CTA dùng pgreen/gradient-green, heading dblue, không tự thêm palette lệch |
| Responsive | Modal, card, chat và editor không tràn ở mobile |
| Loading | Disable thật, spinner và thông báo trạng thái |
| Auth callback | Không làm mất callback checkout khi chuyển login/register |
| Dữ liệu | Hiển thị loading/error/empty state và fallback user đã xóa |
| Payment | Không tạo input raw card/CVV/OTP/password trong client |
| Rich text | Sanitize trước render, giữ link/entity an toàn |

## References

- [`../../src/app/`](../../src/app/)
- [`../../src/components/`](../../src/components/)
- [`../../src/components/editor/`](../../src/components/editor/)
- [`../../src/components/chat/`](../../src/components/chat/)
- [`../../src/components/products/`](../../src/components/products/)
- [`../../src/app/globals.css`](../../src/app/globals.css)
- [`../archive/LEGACY_MARKDOWN.md`](../archive/LEGACY_MARKDOWN.md)
