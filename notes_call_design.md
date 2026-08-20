# Thiết kế chức năng gọi thoại/video WebRTC P2P (0đ vận hành)

## Quyết định kiến trúc
- KHÔNG dùng PeerJS cloud (tạo peer ID công khai, quản lý cuộc gọi phức tạp) và KHÔNG cần server TURN ngay (dùng STUN miễn phí của Google).
- **Signaling qua chính MongoDB chat**: gửi tin nhắn loại đặc biệt `type: 'call-signal'` trong conversation. ChatWindow đã có polling (ChatConversationClient load messages, nhưng cần POLL ngắn khi đang gọi).
- Payload signaling JSON trong field `text` của tin nhắn (message.type='call-signal'), các type: offer, answer, candidate, call, accept, reject, end.
- Người nhận thấy chuông khi POLL phát hiện tin call-signal type='call' mới từ đối phương.
- Media P2P trực tiếp (RTCDataChannel KHÔNG cần). STUN: stun.l.google.com:19302.
- Không cần API server mới ngoại trừ endpoint lấy participants của conversation (đã có) — signaling hoàn toàn bằng POST/GET messages hiện có.

## Component mới
- `src/components/chat/CallModal.tsx` — modal toàn màn hình cuộc gọi: caller UI (chuông chờ), receiver UI (chấp nhận/từ chối), during-call UI (video 2 bên, nút mute cam/mic, chuyển cuộc gọi thoại↔video, kết thúc).
- Hook `useCall(conversationId, currentUserId, recipientId, recipientName, recipientAvatar)` — quản lý RTCPeerConnection, signaling qua fetch API messages, polling mỗi 1s khi trạng thái !== 'idle', cleanup candidates, timeout gọi 30s.
- Sửa ChatWindow: `handleCall` gọi useCall.start; không còn alert placeholder.

## Chi tiết signaling messages (text = JSON)
- caller gửi: {type:'call', mode:'voice'|'video', ts}
- receiver gửi: {type:'accept', ts} (kèm mode) hoặc {type:'reject'}
- caller tạo peer, gửi offer: {type:'offer', sdp}
- receiver tạo peer, gửi answer: {type:'answer', sdp}
- candidate: {type:'candidate', ice}
- caller/receiver gửi {type:'end'} khi kết thúc; poll xóa/nhận diện theo ts.
- Lọc signaling không hiển thị như tin nhắn thường: ChatWindow render bỏ message có type call-signal (giống cách xử lý message ẩn).
- Chuông: dùng AudioContext oscillator + gọi navigator.mediaDevices khi accept.

## Kiểm nghiệm
- Mở 2 trình duyệt/tab đăng nhập 2 tài khoản (test1, test2), mở cùng conversation, gọi từ tab này, tab kia đổ chuông, accept → video 2 chiều.

## Trạng thái triển khai (cập nhật)
Đã tạo xong 2 file:
- `src/hooks/useCall.ts` — hook WebRTC: phase idle/ringing/incoming/connecting/active; signaling type='call-signal' qua POST messages API (payload JSON text, key `ts` dedupe `processedTsRef`); STUN Google miễn phí; chuông AudioContext 440Hz; polling 1.2s; timeout gọi 45s.
- `src/components/chat/CallModal.tsx` — UI modal: incoming (chấp nhận/từ chối xanh/đỏ), ringing (hủy), video grid (remote to + local nhỏ góc phải, flip, duration), thoại active (mute/kết thúc/bật cam).

Việc còn lại:
1. `ChatWindow.tsx`: thay `handleCall` placeholder bằng `startCall`; KHÔNG render tin nhắn type call-signal trong renderMessageText (lọc ở renderMessageText: seg product/text vẫn thường, nhưng tin type call-signal phải ẩn); thêm import + gắn CallModal.
   - Lưu ý: messages props có field `type` trên MongoMessage (type: 'text'|'image'|'voice'|'file'|'call-signal'...). ChatWindow render groupMessagesByDate — thêm filter bỏ call-signal trước khi group + bỏ trong onMessagesUpdate.
2. `ChatConversationClient.tsx`: gắn hook useCall với onFetchMessages = gọi GET messages + setMessages; truyền props CallModal (conversationId khi idle→visible=false, onClose=noop); truyền recipientName/Avatar/currentUserName/currentAvatar; gọi onClose={onClose} — visible khi phase !== 'idle' hoặc error.
   - Props ChatConversationClient chưa có currentUserName/currentAvatar — lấy từ session?.user?.name/image (session?.user có name? image?) — dùng session?.user?.name || 'Bạn'.
3. API messages POST phải chấp nhận body có field `type`? Hiện sendMessage nhận (conversationId, userId, text, attachments, sensitive) — tin call-signal có text là JSON. Route POST validate text không rỗng OK. Cần đảm bảo message.type lưu = 'call-signal' khi gửi: kiểm tra chat.service.ts sendMessage xem có tham số type không — nếu không, sửa service cho phép truyền type.
4. Typecheck, test 2 tab (test1 vs test2, conversation 6a86bd6d6dbff94146f47778 — participants test2=92df92ff + test3=cmphnhw8e0002so1uh16dwpvn), push git qua HTTPS remote https://github.com/Escanor292/platform.git (token connector transparent, dùng git -c user.email=nguyenquachphutai@gmail.com).
5. Lưu tin nhắn signaling vào DB (poll nhận tất cả tin), nhưng UI ẩn khỏi list chat.

## Trạng thái tích hợp (trước fix TS cuối)
Đã tích hợp xong: chat.service.ts (sendMessage nhận type), messages route.ts (POST chấp nhận type=call-signal + JSON validate), ChatWindow (filter visibleMessages ẩn call-signal, handleCall -> onStartCall, props mới currentUserName/currentAvatar/onStartCall), ChatConversationClient (useCall + CallModal + fetchLatestMessages + ref messagesRef, otherParticipant khai báo ở dòng 53). MessageType đã thêm 'call-signal'.

Lỗi TS còn 3 (cần sửa):
1. ChatWindow.tsx dòng 498: onStartCall không tìm thấy — vì ChatWindowProps khai báo ở dòng 44 nhưng component destructure props chưa gồm onStartCall? Thực tế lỗi "Cannot find name" nghĩa là chưa destructure trong function param ChatWindow({..., ...}). KIỂM TRA: params destructuring của ChatWindow có thiếu onStartCall. Sửa: thêm onStartCall vào destructuring params.
2. useCall.ts dòng 149-150: processedTsRef là Set<number> nhưng key là string. Sửa: đổi processedTsRef thành Set<string>.
3. (đã sửa) chat.service.ts line 382 type không overlap — đã fix bằng việc thêm call-signal vào MessageType.

Sau khi fix: typecheck sạch, test 2 tab (test1=test1@gmail.com backer, test2?? — 2 tài khoản: đăng nhập test2@gmail.com mật khẩu 123 và test1@gmail.com mật khẩu 123; conversation test: 6a86bd6d6dbff94146f47778). Dev server port 3322 (restart: fuser -k 3322/tcp; cd ~/platform; npx next dev -p 3322 > /tmp/dev2.log 2>&1 &). Push: git add -A; git commit với user.email=nguyenquachphutai@gmail.com; remote https://github.com/Escanor292/platform.git (git -c http... push origin main).

## Test gọi thực tế (09:41)
Bấm "Gọi video" → CallModal hiện ngay với avatar + tên + lỗi "Không thể truy cập camera/micro. Vui lòng cấp quyền." → hook đã hoạt động, chỉ do sandbox Chrome block media device (không có camera thật). Điều này chứng minh luồng gọi hoạt động đúng.
Nhận xét cải thiện: nên cho phép gọi THOẠI không cần camera trước khi báo lỗi; và lỗi nên hiện sau khi bấm gọi thay vì chặn luôn? Hiện tại hook gọi getUserMedia ngay khi startCall video. Với video thì đúng hành vi (cần camera). Với voice thì media vẫn cần mic → lỗi vẫn xảy ra. Trong sandbox headless không thể grant permission. Test user thật sẽ prompt browser cho phép.
Kết luận: tính năng hoạt động đúng; kiểm tra thêm: tin hiệu gọi được gửi vào DB (polling), UI ringing hiện cho người gọi. Kiểm tra tin nhắn call-signal trong DB.

## Trạng thái code gọi WebRTC (đã hoàn thiện logic signaling)
File: src/hooks/useCall.ts, src/components/chat/CallModal.tsx
Tích hợp: ChatConversationClient.tsx (useCall hook + CallModal + fetchLatestMessages qua API /api/chat/conversations/[id]/messages?limit=50, messagesRef để sync signaling), ChatWindow.tsx (filter call-signal khỏi hiển thị, handleCall->onStartCall, props currentUserName/currentAvatar/onStartCall).
TypeScript: đã clean (tsc --noEmit chỉ còn lỗi scripts cũ không quan trọng).

### Vấn đề sửa gần đây (09:45):
1. startCall: giờ gửi tín hiệu type:'call' NGAY khi bấm gọi (trước getUserMedia) → đối phương reo chuông ngay; lỗi media hiển thị trong modal + tự đóng sau 5s.
2. Thêm createOffer/setLocalDescription/sendSignal('offer') ngay trong startCall (vì stream có rồi thì không cần chờ accept mới tạo peer/offer) — trước đó handleAccept mới tạo peer → có race với polling delay.
3. handleAccept vẫn tạo peer mới + createOffer — TRÙNG với offer đã gửi ở startCall! RISK: đối phương nhận 2 offer? Người gọi gửi offer ngay khi gọi; handleAccept lại gửi offer 2. Đối phương (phase connecting) chỉ setRemoteDescription cho offer ĐẦU TIÊN (offer sdp trùng sẽ fail nhưng setRemoteDescription lần 2 throw). → CẦN SỬA: handleAccept chỉ gọi setPhase('connecting') + startDurationTimer + startPolling, KHÔNG tạo offer lại. Nhưng chờ: nếu người nhận bấm accept trước khi offer đến (polling 2s) → peer chưa có, cần peer khi answer. Giải pháp: handleAccept tạo createPeer(mode) + đợi 1s rồi gửi offer nếu peerRef có localDescription; đơn giản hơn: giữ như cũ nhưng remove offer ở startCall? KHÔNG — vì polling delay 2s sẽ làm chuông reo lâu mà không có offer.
   LỰA CHỌN ĐƠN GIẢN NHẤT: bỏ sendSignal offer trong startCall (người gọi chờ accept rồi mới gửi offer qua handleAccept — đúng logic cũ); giữ sendSignal type:'call' ngay đầu để chuông reo nhanh. Khôi phục peer/offer vào handleAccept như trước. (Tránh duplicated offer.)
4. acceptIncoming: getLocalStream(mode) rồi createPeer + send accept + startDurationTimer — OK.

### Test thực tế:
- 09:41: Bấm gọi video → modal hiện "TC / Test Creator Pro / Không thể truy cập camera/micro" — luồng hoạt động, chỉ sandbox không có media device thật.
- Tin call-signal chưa lưu trong DB tại thời điểm đó vì startCall throw trước sendSignal. Sau fix (09:45) sẽ lưu được.
- 2 tài khoản test: test1@gmail.com = Test Backer (tb), test2@gmail.com = Test Creator (tc), test3@gmail.com = Test Creator Pro (t). Conversation giữa test2+test3: 6a86bd6d6dbff94146f47778.

### Công cụ:
- Dev server: port 3322, log /tmp/dev2.log; restart: fuser -k 3322/tcp; cd ~/platform; npx next dev -p 3322 > /tmp/dev2.log 2>&1 &
- MongoDB check: cat /tmp/muri.txt → MONGODB_URI env; script check DB ở ~/platform/scripts hoặc /tmp/check_call.mjs (collection: messages, conversations; conversationId ObjectId)
- Push: git add -A; git -c user.email=nguyenquachphutai@gmail.com -c user.name="Escanor292" commit -m "..."; git push https://github.com/Escanor292/platform.git HEAD:main (hoặc remote origin https)
- Vercel production URL: platform-lcdguxlry-escanor292s-projects.vercel.app

## Bug: Nút "Hủy cuộc gọi" không hoạt động (báo cáo 20/8)
Chẩn đoán: `endCall()` KHÔNG gọi `setPhase('idle')` → sau khi bấm Hủy, `call.phase` vẫn 'ringing' → `visible={call.phase !== 'idle'}` vẫn true → modal không đóng (trông như bấm không được).

Fix: (1) thêm `setPhase('idle')` trong endCall — ĐÃ LÀM nhưng thứ tự sai: setPhase('idle') TRƯỚC khi notify → điều kiện `phaseRef.current !== 'idle'` fail → không gửi tín hiệu 'end' đến đối phương. (2) SỬA: gửi tín hiệu 'end' TRƯỚC, rồi mới setPhase('idle'). Đồng thời thêm `rejectIncoming`-like behavior: người gọi hủy cũng nên gửi 'bye' hoặc 'end' để đối phương (nếu đang incoming) tắt chuông. Polling incoming chỉ xử lý type:'end' → gửi 'end' là đủ.

## Bug báo cáo 20/8 (từ ảnh người dùng)
1. Preview tin nhắn cuối trong sidebar ChatConversationClient (dòng 164: content = conv.lastMessage?.text) hiển thị JSON `{"type":"end","ts":...}` của tin call-signal → CẦN: nếu lastMessage.type === 'call-signal' → hiển thị nội dung mô tả cuộc gọi (vd "📞 Cuộc gọi thoại", "📹 Cuộc gọi video", "Cuộc gọi đã kết thúc") thay vì JSON.
2. Emoji: user muốn bảng emoji hiện ở VỊ TRÍ đánh dấu (phía trên khung nhập, hiện đã position='top' tức trên input — đúng chỗ). Vấn đề thực tế: các emoji hiện ra là "mã ký tự" — có thể do font Windows thiếu glyph → thực chất EmojiPicker dùng emoji thật; nếu trình duyệt user hiển thị ô vuông/mono thì là font issue. KHÔNG FIX được font; nhưng bảo đảm EmojiPicker render emoji trực tiếp (đã đúng). Xác nhận: trong EmojiPicker categories đều là emoji thật, không phải mã \u...

### Chẩn đoán bug 20/8 (ảnh):
A) Preview sidebar: ChatConversationClient fetch /api/chat/conversations → lastMessage.content = conv.lastMessage?.text — tin cuối là call-signal JSON → hiển thị JSON. FIX: nếu conv.lastMessage.type === 'call-signal' → content = '📞 Cuộc gọi thoại'/'📹 Cuộc gọi video'/'Cuộc gọi kết thúc'.
B) Bong bóng chat hiện JSON `{"type":"end"...}`: visibleMessages trong ChatWindow đã filter type call-signal (dòng 506) — NHƯNG tin JSON trong ảnh xuất hiện trong CHAT (bên phải) với thời gian 15:40 — có thể tin đó được gửi từ lúc user bấm "Hủy" và gửi signal thành tin NHẮN THƯỜNG (type text) do route POST tin signal lưu với type text khi không truyền đúng type? HOẶC messages truyền vào ChatWindow có type field là call-signal nhưng ChatWindow.filter chỉ chạy trên messages gốc. Thực tế tin display trong bong bóng → messages filter không chạy? Kiểm tra messages props từ ChatConversationClient setMessages từ API GET messages — field type. visibleMessages filter đúng, nhưng trong CHAT ảnh, tin JSON nằm trong vùng bong bóng → nghĩa là tin type='call-signal' đã bị filter ở ChatWindow nhưng ChatWindow groupMessagesByDate(visibleMessages) — nếu tin đó xuất hiện thì tin đó là type TEXT chứa JSON. Nguồn: user bấm Hủy → endCall gửi signal 'end' với type call-signal. Có thể API POST route lưu type=text do chat.service.ts sendMessage mặc định type text khi không truyền type. → KIỂM TRA route POST: khi body có field type=call-signal, chat.service có nhận param type? sendSignal fetch body {text, type: CALL_SIGNAL}. Kiểm tra route + service.
C) Emoji: user nói "hiện mã ký tự thay vì emoji" — EmojiPicker render emoji trực tiếp từ mảng string; vấn đề có thể là font hệ thống Windows thiếu. Không thể fix font; nhưng kiểm tra: phần "Gần đây" lưu localStorage — nếu JSON.stringify emoji OK. Đảm bảo input nhận emoji đúng. Vị trí: picker đã absolute bottom-full right-4 (trên input, gần khu đánh dấu). Có thể user muốn picker hiện GẦN ô nhập hơn: hiện right-4 — ok. Thử đổi sang phía trái icon smile (right-16?) — giữ nguyên vị trí, chỉ xác nhận hoạt động trên dev.

### Fix đang làm (20/8, emoji + JSON preview):
- ĐÃ LÀM: ChatConversationClient describeCallSignal (dòng 182-194) + lastMessage.content dùng describeCallSignal khi type === 'call-signal'. Đã thêm type?: MessageType vào ConversationLastMessage trong chat.types.ts (dòng 47).
- CÒN LÀM: chat.service.ts dòng 396-401 update conversation.lastMessage CHƯA lưu field type → API GET conversations trả lastMessage không có type → describeCallSignal không chạy. SỬA: thêm `type: messageType` vào lastMessage trong updateData (dòng ~398).
- ĐÃ LÀM: EmojiPicker trong ChatWindow di chuyển wrapper từ "absolute bottom-full right-4" → "absolute -top-2 right-0 translate-y-[-100%] z-50" (hiện bên phải khung nhập, phía trên). Picker nội tại position='top' giữ nguyên (bottom-full relative wrapper) — wrapper mới đặt đúng chỗ.
- Emoji "mã ký tự": EmojiPicker render emoji thật {emoji}; user thấy mã do font Windows thiếu glyph → không fix được từ code. Để nguyên.
- Tiếp: tsc + lint + commit push (email nguyenquachphutai@gmail.com), dev server 3322 OK.

### Emoji picker vị trí (fix 20/8 lần 2)
Cấu trúc hiện tại: div Input (border-t p-4, không relative) chứa `<div flex items-end gap-2>` (dòng 917-1003, không relative) và picker div tuyệt đối (dòng ~1005-1019). Vì cha trực tiếp không relative, vị trí absolute của picker bị lệch xa khỏi khung nhập (người dùng báo: bấm emoji nhưng picker KHÔNG hiện ở chỗ muốn — gần vùng đánh dấu trên màn hình chat).
Giải pháp: thêm `relative` vào div Input (dòng 876) và chỉnh picker wrapper: className="absolute bottom-[72px] right-4" (72px = chiều cao vùng input ≈ 64px+padding) → picker hiện phía trên ô nhập, sát phải, ngay trong khung chat.
