# Luồng người dùng và chức năng

Tài liệu này mô tả hành vi end-to-end đã thấy trong source hiện tại. Các phần phụ thuộc secret, provider hoặc dữ liệu seed được ghi rõ là cần xác minh runtime.

## 1. Người xem và người ủng hộ

Người dùng có thể duyệt campaign, project, reward/product và blog công khai. Campaign có thể hiển thị project liên quan, reward và blog; project có thể tổng hợp campaign, blog và sản phẩm. Product detail có thể mở checkout hoặc mở chat với creator tùy stock và trạng thái sản phẩm.

Khi chọn reward, modal pledge/checkout hiển thị thông tin reward, số lượng, địa chỉ giao hàng nếu là hàng vật lý, anonymous, tip theo flow phù hợp và phương thức `ONLINE`/`COD`. Reward `AVAILABLE` có cách diễn đạt mua/đặt hàng; `DEVELOPMENT` hoặc đóng góp chung dùng cách diễn đạt ủng hộ.

## 2. Guest checkout và đăng nhập giữa chừng

```text
Chọn reward
   │
   ├── Thanh toán ONLINE không lưu method → tiếp tục checkout guest nếu được phép
   ├── Chọn liên kết/lưu method → tạo checkout session → chuyển login/register
   └── Chọn COD → kiểm tra AVAILABLE + shipping + stock

Login/register thành công
   │
   ▼
callbackUrl nội bộ chứa checkoutSessionId
   │
   ▼
claim session → khôi phục reward, amount, quantity, tip, shipping, anonymous, method
```

Checkout session chỉ tồn tại tạm thời. Client không được coi session payload là bằng chứng đã thanh toán; API payment phải tính và kiểm tra lại dữ liệu quan trọng.

## 3. Creator tạo và quản lý project

Creator mở dashboard, tạo project, thêm hình ảnh/mô tả và liên kết campaign/blog/reward theo UI hiện hành. API phải kiểm tra creator role, ownership và relation hợp lệ. Khi chỉnh sửa nhanh một entity, UI nên mở form/editor tại chỗ thay vì đẩy người dùng sang một trang quản lý không liên quan.

## 4. Creator tạo campaign

Campaign có thông tin mục tiêu, nội dung, thời gian, media, trạng thái và association project nếu được chọn. Reward có thể được tạo trong campaign và xuất hiện ở campaign/project theo relation. Campaign create/update phải kiểm tra project thuộc creator hoặc relation hợp lệ; tài liệu cũ có thể mô tả các bước chưa còn đúng, nên đối chiếu API trước khi dùng.

## 5. Creator tạo sản phẩm/reward

Creator nhập tên, mô tả, giá, stock, hình ảnh/video, liên kết project/campaign nếu có và lựa chọn availability:

| Trường hợp | UI/UX |
|---|---|
| `AVAILABLE` | Không bắt nhập ngày giao dự kiến; stock dương cho phép mua/ủng hộ ngay, stock 0 có thể chuyển sang liên hệ creator |
| `DEVELOPMENT` | Có thể nhập ngày giao dự kiến; dùng ngôn ngữ hỗ trợ/pledge và không cho COD |

Reward management phải giữ availability khi serialize từ server sang edit form. Product card/detail cần dùng chung màu sắc và semantic label của hệ thống Tử Tế, không hiển thị các nhánh màu cổng thanh toán cũ.

## 6. Blog

Người viết có thể tạo draft, sửa, preview, publish, archive và tương tác bài viết. Blog có thể độc lập hoặc liên kết project/campaign, có thể chèn product card, inline link, comparison table hoặc banner tùy editor/component đã triển khai. Khi hiển thị liên kết, cần giữ link tới entity hợp lệ và không tạo nested interactive elements gây lỗi HTML/accessibility.

## 7. Chat

Người dùng có thể tìm user, mở hoặc tạo conversation, gửi message, dùng emoji, reaction, gọi voice/video WebRTC, đánh dấu nội dung nhạy cảm, reveal, search, read state, typing, block, report và delete. Conversation cần cuộn đúng container, giữ header ổn định và khi mở nội dung nhạy cảm không tự kéo trang xuống footer.

Unread notification cần được xóa hoặc đánh dấu read khi người dùng thực sự mở conversation/đọc message. Tin nhắn của user đã xóa phải hiển thị nhất quán “Người dùng đã xóa” với giao diện trung tính, không truy cập dữ liệu profile đã mất.

## 8. Đăng ký và quên mật khẩu

Trang login có liên kết forgot password. Người dùng gửi email ở `/auth/forgot-password`, nhận link có token hết hạn và đặt password mới ở `/auth/reset-password`. Luồng này không hiển thị việc email có tồn tại hay không. Sau khi reset, user quay lại login; callback checkout chỉ được giữ nếu là path nội bộ hợp lệ.

## 9. Dashboard và admin

Backer dashboard theo dõi pledge/transaction, profile, notifications và hoạt động. Creator dashboard quản lý project, campaign, reward, blog, KYC và profile. Admin quản lý user status, badges, reports, campaign/blog review và các nghiệp vụ moderation. Mọi quyền admin/creator phải được kiểm tra server-side; việc ẩn nút ở frontend chỉ là tiện ích UX.

## 10. Tình huống cần test thủ công

| Kịch bản | Kết quả mong đợi |
|---|---|
| Guest mở checkout rồi login | Quay lại đúng campaign/product và giữ dữ liệu session |
| Guest chọn lưu/link payment method | Bị yêu cầu đăng nhập; không xuất hiện form nhập PAN/CVV/OTP |
| Chọn COD với reward development | API từ chối dù client cố gửi request thủ công |
| Quantity lớn hơn stock | API từ chối và không tạo pledge vượt tồn |
| Token reset hết hạn/đã dùng | Không đổi password, token không được reuse |
| Email không tồn tại ở forgot password | Response giống email tồn tại |
| User đã xóa trong chat | Hiển thị placeholder ổn định, không lỗi server/client |
| Mở tin nhắn nhạy cảm | Modal/reveal giữ vị trí scroll hiện tại |
| Product stock bằng 0 | Không hiển thị CTA mua như hàng còn sẵn nếu business rule không cho phép |

## References

[1]: ../../src/app "Page và route hiện tại"
[2]: ../../src/components/campaign/PledgeFormContent.tsx "Form checkout chính"
[3]: ../../src/components/products/CampaignRewardDonationButton.tsx "CTA checkout product"
[4]: ../../src/contexts/CampaignContext.tsx "Trạng thái modal campaign"
[5]: ../../src/app/auth/forgot-password/page.tsx "Trang yêu cầu reset"
[6]: ../../src/app/auth/reset-password/page.tsx "Trang đặt password mới"
[7]: ../CHAT_SYSTEM.md "Tài liệu chat lịch sử"
[8]: ../FEATURE_BLOG_LINKS_SUMMARY.md "Tài liệu blog/product lịch sử"
