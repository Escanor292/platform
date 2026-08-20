# Ghi chú: Xử lý "Người dùng đã xóa" trong chat

## Nhiệm vụ hiện tại (user yêu cầu)
Giữ nguyên dữ liệu chat MongoDB, sửa code để khi người tham gia trò chuyện bị xóa tài khoản (không còn trong PostgreSQL `users`) thì hiển thị "Người dùng đã xóa" thay vì tên lạ/lỗi.

## Kiến trúc chat
- Tin nhắn/conversation lưu ở MongoDB Atlas (collection `conversations`, `messages`, DB name `DuAn`).
- Thông tin người dùng tra từ PostgreSQL `users` qua `getUserInfo(userId)` trong `src/services/mongodb/chat.service.ts` → trả về `ConversationParticipant { userId, name, email, avatarUrl, role }`.
- `getUserInfo` hiện trả về `null` khi user không tồn tại → chỗ gọi có thể crash hoặc hiển thị undefined.
- MONGODB_URI trong `/home/ubuntu/platform/.env` dòng 23: `mongodb://nguyenquachphutai_db_user:0909115079%40Tai@ac-qlbdgty-shard-00-00.b4wcshp.mongodb.net:27017/?replicaSet=atlas-f7q58x-shard-0&readPreference=primaryPreferred&retryWrites=true&w=majority&appName=DuAn`
- IP sandbox bị MongoDB Atlas chặn (connection closed 159.143.78.200) — dev server vẫn chạy chat vì env đã load sẵn từ session khác. Không test trực tiếp MongoDB được từ sandbox.

## Trạng thái DB
- PostgreSQL: chỉ còn 1 user `test3@gmail.com` id `cmphnhw8e0002so1uh16dwpvn` (mật khẩu ManusTest@123), 1 project `cmt0y1lls000196jc66m2pj7t` "Mầm xanh tử tế", 1 reward `b30ad967-c249-40ff-b6e4-f0b878d56e3b`.
- MongoDB: còn conversations cũ với participants là các user đã bị xóa (Test Backer, Test Creator...).

## Các điểm cần sửa (UI components)
- `src/components/chat/ConversationItem.tsx`: `otherParticipant.name` hiển thị trực tiếp; link `/profile/${otherParticipant.userId}`. Nếu participant bị xóa → tên từ MongoDB cũ vẫn là name gốc (không phải "tên lạ"). Cần hiển thị "Người dùng đã xóa".
- `src/components/chat/ChatConversationClient.tsx` dòng ~108,194,240-260: otherParticipant props.
- `src/components/chat/ChatInfoPanel.tsx`: otherUserName/avatar/role hiển thị; link profile.
- `src/components/chat/ChatScreen.tsx` dòng 145.
- `src/components/chat/ChatPageClient.tsx` dòng 49.
- `src/components/chat/MessageBubble.tsx` dòng 29-46: senderName/senderAvatar từ message (lưu sẵn trong message).
- UserAvatar có prop `userId` — khi user bị xóa, avatar hiện chữ đầu của name gốc.

## Cách tiếp cận sửa
1. Server: thêm trường `userDeleted?: boolean` vào `ConversationParticipant`; trong `getUserInfo` đánh dấu; khi tạo conversation gửi message dùng snapshot name nhưng lưu `userDeleted` flag dựa trên check user tồn tại.
2. API GET conversations: enrich participants bằng check PostgreSQL (batch) để đánh dấu user đã xóa.
3. UI: khi `userDeleted` → hiển thị tên "Người dùng đã xóa", ẩn avatar/link profile (hoặc link vẫn đến nhưng avatar hiện icon mặc định), message bubbles giữ nguyên senderName gốc nhưng có thể thêm badge.
4. Chặn việc gửi tin nhắn mới tới user đã xóa (startConversation đã throw "Target user not found" — OK).
5. ConversationItem: thay tên + link profile thành "Người dùng đã xóa" không link.

## Context khác (đã hoàn thành trong task)
- Đã sửa lỗi trang sản phẩm `/products/[rewardId]` crash khi `campaign.users` null → dùng `contactUserId` fallback (commit b440090 đã push lên GitHub).
- Dev server chạy cổng 3322, đăng nhập browser đã có session test3@gmail.com.
- Vercel connector chưa được bật (user chưa chấp nhận); email git đã set đúng `nguyenquachphutai@gmail.com`.

## TIẾN ĐỘ SỬA (cập nhật 2026-08-20)

### ĐÃ XONG
1. `src/types/chat.types.ts`: thêm `deleted?: boolean` vào `ConversationParticipant`; thêm `senderDeleted?: boolean` vào `MongoMessage`.
2. `src/services/mongodb/chat.service.ts`: thêm `DELETED_USER_LABEL = 'Người dùng đã xóa'` + hàm `enrichDeletedUsers(items)` (check PostgreSQL batch, đánh dấu deleted + làm mới name/avatar/role nếu user còn). `getUserInfo` trả về participant với deleted=true khi user không tồn tại. `getUserConversations` và `getConversationById` gọi enrichDeletedUsers. `getMessages` đánh dấu `senderDeleted` cho từng message.
3. `src/components/chat/UserAvatar.tsx`: thêm prop `deleted` — icon User xám, nền gray-200, không link profile.
4. `src/components/chat/ConversationItem.tsx`: tên xám italic "Người dùng đã xóa", không link, không hiển thị role.
5. `src/components/chat/ChatConversationClient.tsx`: type Conversation có `userDeleted`, map `userDeleted: !!otherParticipant?.deleted`; truyền `recipientDeleted` + `otherUserDeleted` tới ChatWindow/ChatInfoPanel.
6. `src/components/chat/ChatWindow.tsx`: thêm prop `recipientDeleted`; header avatar icon xám + tên xám italic + "Tài khoản đã bị xóa" thay "Không hoạt động".
7. `src/components/chat/MessageBubble.tsx`: dùng `message.senderDeleted` — tên "Người dùng đã xóa" không link, avatar icon xám.

### CÒN CẦN LÀM
1. `ChatInfoPanel.tsx` (dòng 12-26 props, 36-44 destructuring, ~200-217 user info block, 137 handleBlockUser): thêm prop `otherUserDeleted` — avatar icon User xám, tên xám italic "Người dùng đã xóa", role "Tài khoản đã bị xóa", không link profile, handleBlockUser vẫn giữ.
2. Kiểm tra các component chat khác dùng participants: `ChatScreen.tsx` (dòng ~145), `ChatPageClient.tsx` (dòng ~49), `ChatSidebar.tsx`, `CampaignChatHeader.tsx` — xem có hiển thị tên user không.
3. Build/typecheck: `cd /home/ubuntu/platform && npx tsc --noEmit 2>&1 | head -30` (dev server cổng 3322 tự reload).
4. Test trên browser http://localhost:3322/chat (đã login test3@gmail.com). MONGODB Atlas block IP sandbox nên chat real không load được từ script trực tiếp, nhưng dev server có MONGODB_URI sẵn trong process pts/2 (env export trước đó) → test qua browser sẽ thật sự hit API.
5. Commit + push: git email `nguyenquachphutai@gmail.com` name `Escanor292`. Repo: Escanor292/platform branch main.

### Lưu ý
- IP sandbox bị MongoDB Atlas chặn (connection closed) — chỉ process có env đã load URI mới kết nối được.
- Dev server port 3322 chạy từ pts/2 session cũ; browser đã login test3@gmail.com.
- Trước đây lỗi "Không thể tải danh sách cuộc trò chuyện" ở trang /chat chính là do MongoDB không kết nối được từ sandbox — nhưng production Vercel có kết nối bình thường.
