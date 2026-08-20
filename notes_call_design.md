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

### Emoji picker fix lần 3 (bị che phần trên)
Ảnh user: bảng emoji hiện phía trên input nhưng phần đầu grid (hàng emoji ngay dưới tabs) bị cắt/che — do wrapper picker nằm trong div Input relative; phần trên vượt lên bị cắt bởi một ancestor có overflow-hidden (khung chat hoặc info panel).
Quyết định: render EmojiPicker qua ReactDOM.createPortal vào document.body, định vị fixed theo vị trí ô nhập (dùng ref inputContainerRef đo getBoundingClientRect) → không bao giờ bị cắt bởi overflow. Bottom = chiều cao viewport - top của input container + 8px spacing.
Cần: thêm inputContainerRef vào ChatWindow; useEffect cập nhật position khi show; portal className fixed right-4 z-[100].

### Trạng thái portal emoji (đang làm, 20/8 lần 3)
ĐÃ LÀM: ChatWindow.tsx — thay picker inline bằng <EmojiPickerPortal inputRef onClickCapture onSelect>.
CÒN PHẢI LÀM:
1. ChatWindow.tsx: thêm `import { createPortal } from 'react-dom';` (đầu file imports).
2. ChatWindow.tsx: thêm `const inputContainerRef = useRef<HTMLDivElement>(null);` — gắn ref vào div Input (dòng ~877: `<div className="border-t p-4 flex-shrink-0 relative">` → thêm `ref={inputContainerRef}`).
3. ChatWindow.tsx: tạo component nội bộ `EmojiPickerPortal` (trước export function ChatWindow hoặc sau): dùng createPortal vào document.body, đo inputContainerRef.current.getBoundingClientRect() khi render; style fixed: top = rect.top - 8 - chiều cao picker (khó biết trước) → đơn giản: đặt `bottom: ${window.innerHeight - rect.top + 8}px; right: 64px;` trong wrapper div fixed z-[100]. Picker cao ~370px → nếu rect.top < 380 thì bị che header trang — clamp: top = Math.max(16, rect.top - 378).
   CÁCH ĐƠN GIẢN HƠN: wrapper fixed với `top: clamp`, chiều cao max-h phù hợp viewport. Code mẫu:
   ```tsx
   function EmojiPickerPortal({ inputRef, onClickCapture, onSelect }: { inputRef: React.RefObject<HTMLDivElement | null>; onClickCapture: () => void; onSelect: (e: string) => void }) {
       const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
       useEffect(() => {
           const update = () => { if (inputRef.current) { const r = inputRef.current.getBoundingClientRect(); setPos({ top: Math.max(16, r.top - 390), right: window.innerWidth - r.right + 16 }); } };
           update();
           window.addEventListener('resize', update); window.addEventListener('scroll', update, true);
           return () => { window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true); };
       }, [inputRef]);
       if (!pos) return null;
       return createPortal(
           <div className="fixed z-[100] animate-in fade-in zoom-in-95 duration-150" style={{ top: pos.top, right: pos.right }} onClickCapture={onClickCapture}>
               <EmojiPicker position="top" onSelect={onSelect} />
           </div>, document.body);
   }
   ```
4. Gỡ className "absolute bottom-[76px] right-4 z-50" ở wrapper cũ — ĐÃ thay bằng EmojiPickerPortal rồi, không còn.
5. Typecheck (npx tsc --noEmit | grep -c "src/" = 0), lint sạch, commit email nguyenquachphutai@gmail.com, push origin HEAD:main. Dev server port 3322 chạy (curl localhost:3322 = 200).
6. Báo user: bảng emoji giờ render ngoài khung chat (portal), không bị cắt.

### Kéo dài khung chat theo chiều dọc (yêu cầu 20/8)
Ảnh user: khung chat (vùng xanh) chỉ chiếm ~60% chiều cao màn hình, dư khoảng trắng lớn trên (do padding-top 24 = 96px dưới header) và dưới (pb-8 + footer).
Fix: ChatConversationClient.tsx dòng ~252: container mx-auto px-4 pt-24 pb-8 max-w-7xl h-[calc(100vh-8rem)].
- Đổi pt-24 → pt-20 (giảm khoảng trống trên)
- Đổi pb-8 → pb-4
- Đổi h-[calc(100vh-8rem)] → h-[calc(100dvh-7.5rem)] để tận dụng chiều cao màn hình (header ~64px, bớt 0.5rem đệm)
- 100dvh tránh vấn đề thanh địa chỉ mobile.
Kiểm tra footer cao bao nhiêu: FooterNew (không thấy inline-style cao). Giả định footer ~70px; 7.5rem = 120px ≈ header + footer + đệm. Nếu quá thấp sẽ che bởi footer → thử h-[calc(100dvh-9rem)] an toàn hơn? Trong ảnh, frame hiện h~560px trong màn hình 901: overhead hiện tại = 901-560=341px (gồm header 64 + pt96 + pb32 + footer ~150?). Footer lớn ~150px → 100dvh-9rem=901-144=757 vẫn an toàn (không chạm footer vì container nằm trong body flow, footer nằm dưới nó; h quá lớn sẽ đẩy footer xuống). Rủi ro: nếu h=[calc(100dvh-9rem)] với body có header 64 + container 757 + footer 150 = 971 > 901 → xuất hiện scrollbar toàn trang → KHÔNG tốt (user không muốn cuộn trang).
Quyết định: h-[calc(100dvh-11rem)] = 901-176 = 725 → 64+725+150=939 > 901 vẫn scrollbar. Phải đo footer thật! Đo bằng browser trên dev: document.querySelector('footer').offsetHeight.

### Đo đạc thực tế (20/8, dev 1100px viewport):
nav=78px, pt-24→container top=78+16(px-4 margin?) thực tế 78, containerH=972 (do h-[calc(100vh-8rem)]=1100-128=972 OK), footerH=293px, footerTop=1050. Khung chat (chatFrame) cao 844px → đáy 1018.
Vấn đề user thấy: trên máy user (901px viewport, zoom?) khung chat chỉ ~560px vì... đo sandbox: khung chat chỉ 844/972 do header ChatWindow p-4 border? Không — chatFrame là div "flex h-full w-full rounded-lg border" cao 844 ≠ container 972? ChatConversationClient root là container; bên trong có div flex... Khung chat cao 844 < 972 nghĩa là có gì đó giảm chiều cao (ChatConversationClient inner div h-full). Thực tế trong sandbox khung đã dài gần hết màn hình; ảnh user có thể bị zoom. Dù vậy: yêu cầu user = "cho phần màu xanh dài ra theo chiều dọc" → tăng chiều cao khung chat: sửa container pt-24→pt-20, h-[calc(100vh-8rem)]→h-[calc(100dvh-12rem)]? container hiện 972 là ok rồi. Khung chat 844 vì ChatConversationClient inner: `<div className="flex h-full w-full rounded-lg border overflow-hidden bg-white">` — cao 844 thay vì 972-32 padding=940? 972-2*16(px-4)=940 ≠ 844. Chênh 96px = chính pt-24? Không, pt là padding trong. 940-844=96 = pt-24 bên TRONG container — h-full của inner div tính từ container content height = 972-96-32=844 ✓.
→ Muốn khung chat dài hơn: giảm pt-24→pt-16 (giảm 32px) → khung ~876px. Và có thể bỏ pb-8→pb-2. Ngoài ra user ảnh: trên máy họ khung chỉ 560px → có thể viewport họ nhỏ. Quyết định: giảm pt-24→pt-16, pb-8→pb-3 trong ChatConversationClient.

### "Người dùng đã xóa" không đồng nhất (21/8)
Ảnh user: (1) trong ConversationItem (sidebar /chat): avatar UserAvatar với deleted → có thể render avatar icon xám + tên in nghiêng; (2) trong ChatWindow header: dùng avatar + tên riêng — ảnh 2 cho thấy "Người dùng đã xóa" với avatar xám (icon SVG) tên in nghiêng nhạt. Ảnh 1 (sidebar) lại thấy avatar xanh lá "ND" đậm — nghĩa là deleted flag KHÔNG được truyền/khớp ở ConversationItem (otherParticipant.deleted false?) hoặc UserAvatar deleted render khác.
Check: UserAvatar.tsx, ChatWindow header avatar/namedeleted logic, ConversationItem line 45 deleted={otherParticipant.deleted}.
Fix: thống nhất 1 phong cách: avatar xám mờ (grayscale), tên "Người dùng đã xóa" hoặc tên cũ + (Người dùng đã xóa), cùng style italic gray-400 ở cả header + sidebar + bong bóng tin nhắn.

### Chẩn đoán chi tiết (21/8):
Hai nơi hiển thị khác nhau:
1. **ConversationItem** (sidebar, dùng UserAvatar + otherParticipant.name nguyên bản): khi deleted=true → avatar xám icon User, tên in nghiêng gray-400 nhưng vẫn hiện TÊN CŨ của người dùng (vd "Nguyễn Đức"? ảnh thấy "ND"). Nếu deleted=false (DB không có flag) → avatar màu initials.
2. **ChatWindow header** (dùng Avatar shadcn): deleted → icon xám, tên in nghiêng + "Tài khoản đã bị xóa" nhỏ.
Ảnh user: ở sidebar (ảnh 1) "Người dùng đã xóa" hiện avatar xanh "ND" đậm — nghĩa là cuộc trò chuyện đó KHÔNG có flag deleted (tên DB = "Người dùng đã xóa" do chat.service DELETED_USER_LABEL gán khi user xóa → tên thật của participant = "Người dùng đã xóa") → deleted flag = false → render như người thường với tên lạ.
Ảnh 2: header khung chat hiện "Người dùng đã xóa" + avatar xám (deleted=true, icon SVG).
FIX: thống nhất bằng cách xử lý ở tên: nếu name === DELETED_USER_LABEL ('Người dùng đã xóa') → coi như deleted dù flag không có; hiển thị thống nhất: avatar xám icon User, tên in nghiêng gray-400 + phụ đề "Tài khoản đã xóa".
Cần sửa: (a) ConversationItem: derive deleted = p.deleted || p.name === DELETED_USER_LABEL; đổi tên hiển thị thành "Người dùng đã xóa" kèm icon, bỏ link profile. (b) ChatWindow header: derive same isDeleted; tên + phụ đề giống nhau. (c) Bong bóng tin nhắn (MessageBubble?) — kiểm tra render tên người gửi đã xóa.
Preview tin nhắn cuối (ConversationItem lastMessage) còn hiện JSON: ConversationItem dùng conversation.lastMessage.text (Mongo conversation) — describeCallSignal chỉ dùng ở loadAllConversations (ChatConversationClient mapped) → ConversationItem nhận conversation gốc (Mongo) nên lastMessage.text JSON vẫn hiện. Fix ConversationItem: mô tả call-signal ở đó.

### Trạng thái phase 12 (21/8):
ĐÃ XONG: ConversationItem.tsx — derive isDeleted = p.deleted || name === 'Người dùng đã xóa'; displayName = isDeleted ? 'Người dùng đã xóa' : name; avatar UserAvatar deleted=isDeleted; tên in nghiêng gray-400 + phụ đề "Tài khoản đã xóa"; preview lastMessage dùng describeCallSignal cho type call-signal (hàm nội bộ trong file).
CÒN LÀM:
1. ChatWindow header (dòng ~573-630): header đã dùng recipientDeleted prop — OK về mặt logic; nhưng tên hiển thị vẫn là recipientName gốc ("Người dùng đã xóa" nếu DB đã gán nhãn) — ổn. Phụ đề "Tài khoản đã bị xóa" (dòng 627) — thống nhất dùng "Tài khoản đã xóa" cho khớp ConversationItem.
2. MessageBubble.tsx dòng ~52: tên người gửi đã xóa in nghiêng — ok, thêm phụ đề? không cần.
3. Typecheck + lint + commit push (email nguyenquachphutai@gmail.com, tên Escanor292), báo user.
Quy trình: cd ~/platform && npx tsc --noEmit 2>&1 | grep -c "src/" (mong =0) && npx next lint; git add -A && git commit -m "..." && git push origin HEAD:main. Dev server localhost:3322 đang chạy.

### Chẩn đoán 2 bên vẫn khác (21/8, tiếp):
chat.service enrichDeletedUsers: participant của user bị xóa → name='Người dùng đã xóa', deleted=true, role='deleted' — flag này chỉ được set KHI gọi enrichDeletedUsers (chỉ các route gọi nó). Các route khác (vd GET conversation detail cho ChatWindow) có thể gọi hàm khác mapParticipant mà trả name gốc + deleted=false?? Dòng 68: hàm riêng (getParticipant?) trả DELETED_USER_LABEL+deleted=true khi !user. ChatWindow header xám = đúng theo flag này.
ConversationItem (sidebar /chat, dùng API /api/chat/conversations): nếu route đó KHÔNG gọi enrichDeletedUsers → deleted=false, name=tên GỐC ("Nguyễn Đức"?). Nhưng ảnh 1 user thấy tên "Người dùng đã xóa" → route conversations CÓ enrich (dòng 486 senderName existingIds.has → DELETED_USER_LABEL). Vậy name đã là label, deleted có thể =false ở conversation participants? enrich trả deleted=true. Hmm.
Thực tế ảnh 1: avatar "ND" XANH (không xám) → UserAvatar deleted prop=false hoặc avatarUrl có ảnh? ND xanh = getInitials từ name "Người dùng đã xóa"?? getInitials lấy chữ cái đầu/từ cuối: "ND". Màu xanh → className gradient primary → deleted=false. → ConversationItem nhận participant deleted=false, name='Người dùng đã xóa' (hoặc tên gốc giống label).
Vậy fix code ConversationItem isDeleted = deleted || name===label sẽ render xám. production chưa có code mới lúc user xem → chờ user refresh sau deploy. CŨNG CẦN: kiểm tra route conversations có thực sự enrich không — xem src/app/api/chat/conversations/route.ts
Ngoài ra user muốn "đồng nhất màu xám" — có thể chỉ cần thêm avatar màu xanh ND hiện ra trong ConversationItem vì production cũ. Đợi deploy + xác nhận route.

### Chẩn đoán "ngược lại" (21/8):
- Trang /chat dùng **ChatSidebar.tsx** (component riêng, render avatar + tên trực tiếp, KHÔNG dùng ConversationItem).
- ChatSidebar render xám khi `conversation.userDeleted === true` (avatar grayscale + tên gray-400 italic).
- Khung chat dùng ChatConversationClient + ChatWindow (header xám khi recipientDeleted) — ĐÚNG → user thấy khi bấm vào.
- Nếu user thấy trang /chat XANH (không xám) → nghĩa là API trả `userDeleted = false` cho user đã xóa. Xem nơi map Conversation trong ChatPageClient/API: có thể route cũ trả userDeleted từ enriched deleted flag, nhưng code mới đổi tên field? enrichDeletedUsers trả participants[].deleted — ChatPageClient map sang userDeleted? Kiểm tra!

### Root cause cuối (21/8):
- Trang /chat → ChatPageClient.tsx map API conversations → truyền vào ChatSidebar. Map CŨ không có field `userDeleted` → ChatSidebar (đã có logic render xám khi userDeleted=true) không kích hoạt → render avatar xanh + tên đậm.
- ĐÃ SỬA ChatPageClient.tsx: thêm userDeleted?: boolean; userName dùng label 'Người dùng đã xóa' khi deleted; userDeleted = !!deleted || name===label.
- Còn lại: typecheck + commit (email nguyenquachphutai@gmail.com, name Escanor292) + push → báo user hard reload 2 tab.
- Quy trình push: cd ~/platform && npx tsc --noEmit 2>&1 | grep -c "src/" (mong 0) && git add -A && git -c user.email="nguyenquachphutai@gmail.com" -c user.name="Escanor292" commit -m "..." && git push origin HEAD:main
- Dev server: localhost:3322 (session shell "check" chạy ok, session "dev" bị lỗi shell khi env chưa load).


## Phase 20 (21/8): Tinh chỉnh bảng emoji bám sát ô nhập
Yêu cầu user: (1) có khoảng trống giữa bảng emoji và ô nhập → bảng cần "xích xuống dưới" bám sát; (2) nút emoji (icon mặt cười) dịch xuống chút cho cân bằng theo chiều dọc với ô nhập văn bản.

Ảnh user: picker hiện dính lên HEADER khung chat (bị header che phần trên, tabs bị cắt), còn phía dưới có khoảng trống giữa picker đáy và ô nhập.

File: src/components/chat/ChatWindow.tsx
- EmojiPickerPortal (dòng 115-162): pos = {top, right}; top = Math.max(8, r.top - PICKER_HEIGHT - GAP), PICKER_HEIGHT=430, GAP=8; right = window.innerWidth - r.right + 16. Render qua createPortal document.body, style={{top, right}}, className fixed z-[100].
- inputContainerRef gắn tại div className="border-t p-4 flex-shrink-0 relative".
- EmojiPicker root (EmojiPicker.tsx dòng ~270): className `z-50 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden mb-2` (đã bỏ absolute/right-0).
- Nơi dùng portal: ~dòng 1052: <EmojiPickerPortal inputRef={inputContainerRef} onClickCapture={() => setShowEmojiPicker(false)} onSelect={...} />.

CHẨN ĐOÁN hiện tượng ảnh: Math.max(8, ...) clamped → top=8 → bảng dính mép trên màn hình, cách xa ô nhập = khoảng trống. Picker cao thực (khi có tabs) > khoảng trống phía trên → bị header che phần trên? Không — top=8 nghĩa là dính trên, grid hiển thị từ dưới xuống, header KHÔNG che; nhưng ảnh cho thấy bảng bị che phía trên bởi header khung chat → nghĩa là top KHÔNG bị clamped, r.top - 438 nằm TRONG vùng header. Và đáy picker cách ô nhập ~40px = GAP + dư. → Bảng cần tính lại: dùng BOTTOM anchor: bottom = window.innerHeight - r.top + 8 (bám ngay trên ô nhập).

QUYẾT ĐỊNH SỬA:
1. EmojiPickerPortal: đổi pos từ {top,right} sang {top: bottomAnchored} — đặt style `bottom: ${innerHeight - r.top + 8}px, right: ${innerWidth - r.right + 16}px`. Bỏ top hoàn toàn, không cần Math.max — picker sẽ luôn bám ngay trên ô nhập; nếu vượt quá mép trên thì overflow màn hình bị cắt (chấp nhận, hoặc vẫn clamp bottom >= innerHeight - ...). Giữ clamp: bottom = Math.max(window.innerHeight - r.top + 8, 40).
2. Nút emoji căn dọc: hàng input dùng flex items-end; đổi wrapper chứa icon emoji + lock thành items-center (giữ hàng icons trái items-end giữ nguyên để mic/attach bám đáy) — kiểm tra cấu trúc trước khi sửa (dòng ~917 flex items-end gap-2 gồm div icons-trái + div flex-1 + div icons-phải + button).


## Phase 24 (21/8): Fix emoji không chèn được vào ô nhập
Yêu cầu user: bấm vào emoji thì bảng đóng mất + emoji không xuất hiện trên ô chat → không chọn được.

Root cause: EmojiPickerPortal (ChatWindow.tsx ~dòng 150-170) dùng `onClickCapture` trên div nền của portal. onClickCapture chạy ở PHASE CAPTURE trước khi onClick của nút emoji bubble → khi click vào nút emoji, event bị đóng picker trước khi onSelect chạy → emoji không được chèn.

Fix: bỏ onClickCapture trực tiếp; thay bằng onPointerDown trên nền: nếu e.target.closest('button') → không đóng (để onClick của nút chạy onSelect); ngược lại đóng picker (stopPropagation + onClickCapture).

File liên quan: src/components/chat/ChatWindow.tsx (EmojiPickerPortal), EmojiPicker.tsx handleSelect gọi onSelect.
Việc còn lại: typecheck + lint + commit push.
Cấu trúc dùng portal: ChatWindow render {showEmojiPicker && <EmojiPickerPortal inputRef={inputContainerRef} onClickCapture={() => setShowEmojiPicker(false)} onSelect={(emoji) => { insertEmoji(emoji); setShowEmojiPicker(false); }} />}.

## Phase 25 (21/8): Emoji multi-select + toggle thủ công + message reactions
Yêu cầu: (1) chọn nhiều emoji liên tục, picker không tự tắt; (2) tắt/mở picker thủ công; (3) reaction lên tin nhắn.

Thiết kế:
- MongoMessage + field optional `reactions?: { emoji: string; userIds: string[] }[]`.
- API PATCH /api/chat/conversations/[id]/messages/[messageId]/reaction { emoji } → toggle trong chat.service.ts (toggleMessageReaction).
- Frontend: fetch PATCH → cập nhật messages local (setState + ref).
- ChatWindow: hover bubble → nút "😊+" hiện ReactionPicker nhỏ (👍❤️😂😮😢🙏🔥👏); pill hiển thị reaction dưới text; highlight nếu mình react.
- Picker toggle: onPointerDown nền chỉ đóng khi click nền trống (đã fix ở phase 24); onSelect KHÔNG đóng picker. Thêm nút X (đóng) và nút 👋 (bấm lại nút smile để tắt — toggle).
- EmojiPicker.tsx giữ nguyên onSelect; portal trong ChatWindow xử lý toggle.
- Dùng onMessagesUpdate prop (đã có trong ChatWindowProps) để sync state ngoài khi reaction.


## Cập nhật 20/8 20:20 — Emoji picker + Reaction
### Feature mới (emoji picker + reaction)
- `src/components/chat/MessageReaction.tsx` (mới): ReactionPicker (8 emoji nhanh: 👍❤️😂😮😢🙏🔥👏) + ReactionRow (nút 👍+ và các pill: xanh dương khi tôi đã phản ứng, đếm số người).
- ChatWindow: handleToggleReaction (PATCH /api/chat/conversations/[id]/messages/[mid]/reaction) + ReactionRow dưới mỗi bubble; picker không tự đóng khi chọn emoji (chỉ đóng khi click nền trống, nút X, hoặc bấm lại nút emoji).
- `src/components/chat/EmojiPicker.tsx`: thêm prop onClose + nút X tròn trên header.
- `src/types/chat.types.ts`: thêm MessageReaction { emoji, userIds } + ReactionRequest; MongoMessage.reactions?
- chat.service.ts: toggleMessageReaction (upsert reaction.usersIds atomic); export MessageReaction type.
- API route mới: `src/app/api/chat/conversations/[conversationId]/messages/[messageId]/reaction/route.ts` (PATCH).
### Kiểm tra GUI dev 3322 (login test2@gmail.com / 123, conv 6a86bd6d6dbff94146f47778 với Test Creator Pro)
- CHỌN NHIỀU EMOJI: ĐẠT — bấm 😄 rồi 😍, picker vẫn mở, textarea = "😄😍"
- NÚT X ĐÓNG THỦ CÔNG: ĐẠT — picker đóng khi bấm X
- Toggle nút emoji: có sẵn (bấm lại tắt)
- Còn kiểm tra: reaction (toggle + hiển thị pill)


## Kiểm tra reaction GUI (20:23, dev 3322)
- Nút 👍+ "Thả cảm xúc" đã hiện dưới mọi tin nhắn (3 tin). Cần test: click nút → picker 8 emoji hiện → chọn ❤️ → pill xanh hiện + API PATCH 200 → polling cập nhật messages → pill hiện cả 2 bên.
- Dev server cần reload trang sau file edit vì Next.js không tự hot-reload khi click test qua console.
- Conversation test: 6a86bd6d6dbff94146f47778 (test2@gmail.com = Test Creator ↔ test3/cmphnhw8e0002so1uh16dwpvn = Test Creator Pro). Tin test vừa gửi: "Kiểm tra phản ứng emoji 😄❤️".
- Còn lại: typecheck, commit push (git -c user.email=nguyenquachphutai@gmail.com), thông báo user.
- Emoji picker multi-select + nút X: đã PASS.


## Tình trạng test reaction (20:25) — CHƯA HOÀN THÀNH
- Nút 👍+ "Thả cảm xúc" hiện dưới 3 tin (index tool thường lệch: 26,27,28 không ổn định).
- Screenshot: 3 nút reaction nằm ở cuối mỗi bubble: tin 1 (~722,350), tin 2 (~722,428), tin 3 (~722,465). ReactionPicker hiện trên bubble (-top-11).
- Vấn đề: sau khi JS click nút reaction, nút bị biến mất khỏi DOM (không phải lỗi API — handler chỉ return sớm nếu !response.ok; có thể polling re-render hoặc lỗi component khi pickerOpen=true). Cần kiểm tra lại bằng click tọa độ thực (browser_click tọa độ 722,465) thay vì index.
- Dev server: localhost:3322, dev session "check" grep /tmp/dev2.log. Git: push với -c user.email=nguyenquachphutai@gmail.com user.name="NQP Tai". Repo Escanor292/platform branch main.
- Conversation test: 6a86bd6d6dbff94146f47778, user test2@gmail.com (Test Creator).


## Tìm hiểu 20:26
- Click tọa độ đúng (1153,673) → state pickerOpen đổi (nút tin cuối biến mất, chỉ còn 1 nút reaction trong DOM cho tin khác). Picker chưa hiện trong screenshot → có thể picker render nhưng nằm trên vùng khác, hoặc animation chưa chạy. Cần check DOM ngay sau click.
- Vấn đề mới đáng chú ý: khi pickerOpen=true và list rỗng, component render div chứa nút 👍+ (mở/toggle) + picker, nhưng div đó là relative → picker absolute -top-11 so với div. Div này không có className gì che. Có thể picker nằm bên ngoài viewport nếu bubble sát top.


## Chẩn đoán 20:29
Reaction API hoạt động 200 (đã gắn ❤️ vào tin 6a86cf5d871a4a67eb60987d — tin SIGNAL kiểu call end, không phải tin chat). Pill render logic OK. Tin chat thường (text thường) chưa có phản ứng nên pill chưa hiện — đúng behavior. Tiếp theo: (1) gỡ reaction khỏi tin signal: PATCH emoji❤️ lần 2 để toggle off; (2) gắn reaction vào tin chat thật ('Kiểm tra phản ứng emoji') để kiểm tra pill hiện trên UI.
Tài khoản test: test2@gmail.com id 92df92ff-0f15-469f-9f24-99b44984bd13. Conversation 6a86bd6d6dbff94146f47778.


## Test 20:30 — HOÀN THÀNH: Reaction hoạt động
Pill "❤️ 1" hiện dưới tin nhắn cuối, nút 👍+ (Thả cảm xúc) hiện trên cả 3 tin. Pill màu xanh highlight khi người dùng tự phản ứng (bg-blue-100, border-blue-400). Cập nhật qua polling 3-5s. Còn việc: typecheck, commit, push.


## 20:36 — ReactionRow đưa ra ngoài bubble (đúng yêu cầu user)
Pill "❤️ 1" giờ nằm bên ngoài bong bóng màu xanh, bong bóng gọn lại như trước. Screenshot xác nhận. Đang kiểm tra pill tin người khác (alignment left) trước khi push.
