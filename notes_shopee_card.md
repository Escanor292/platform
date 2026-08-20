# Nhiệm vụ: Thẻ sản phẩm phong cách Shopee

## Yêu cầu user
1. Bỏ dòng chữ "SẢN PHẨM ĐỘC LẬP" trên thẻ sản phẩm
2. Thêm ảnh sản phẩm hiển thị phía trên thẻ
3. Hiển thị % giảm giá (badge "-17%") như Shopee
4. Thêm nút giỏ hàng tròn ở mỗi thẻ
5. Card gọn, style giống Shopee (ảnh vuông trên, tên 2 dòng, giá cam/đỏ dưới cùng)

## Bối cảnh hiện tại
- Thẻ sản phẩm chính ở `src/components/profile/ProfileTabs.tsx` dòng 502-633 (grid `products.map`):
  - Line 504: grid grid-cols-1 md:grid-cols-2 gap-6
  - Line 506: images = reward.productImages (mảng URL)
  - Line 507-510: discount = round((max-min)/max*100) nếu maxAmount > minAmount
  - Line 516-539: Gallery ảnh HÒA ĐÃ CÓ (chỉ hiện khi images.length>0, img h-44)
  - Line 541-586: body card: tên + mô tả + giá đỏ + giá gạch + badges (GIẢM %, Tồn kho, tên campaign, "Sản phẩm độc lập" dòng 580-584)
  - Line 589-629: isOwnerMode admin buttons (share/edit/delete) — giữ nguyên
  - Badge "Sản phẩm độc lập": dòng 580-584 — XÓA
- Reward fields: productImages (string[]), minAmount (giá bán), maxAmount (giá gốc/giá gạch), stock, title, description
- API /api/rewards/[id] GET (productImages là array URL string upload lên S3/CDN)
- Sản phẩm hiện tại (id b30ad967-c249-40ff-b6e4-f0b878d56e3b): productImages rỗng [], cần test có/không ảnh
- formatVND trả "X VNĐ" (src/lib/utils.ts)
- Header web: src/app layout — GIỎ HÀNG CHƯA CÓ (grep "Giỏ hàng|cart" không ra component nào)
- Có thể có các thẻ sản phẩm ở src/app/projects/[projectId]/page.tsx và products list — chỉ user yêu cầu thẻ trên profile (ảnh user gửi là trang profile), nhưng nên tạo component chung ProductCardShopee và dùng lại ở các nơi grid sản phẩm khác nếu dễ.

## Kế hoạch
1. Tạo component chung `src/components/products/ShopeeProductCard.tsx`: ảnh vuông 1:1 trên (placeholder icon nếu không có ảnh), badge % giảm góc trên phải ảnh, tên 2 dòng (line-clamp-2), giá cam-600 font-bold + giá gốc gạch nhỏ (màu xám nhỏ), nút giỏ hàng tròn cam góc dưới phải, hover border-cam, nền trắng, rounded nhỏ (rounded-md — Shopee dùng square-ish), nút giỏ hàng thêm vào state context (context giỏ hàng đơn giản: useState global qua event toast + localStorage? giữ đơn giản: thêm "toast: Đã thêm vào giỏ hàng" + icon số lượng trên header nếu muốn).
2. User chỉ nói "thêm chức năng giỏ hàng" — làm đơn giản: click giỏ hàng → thêm vào localStorage cart (cartCount hiển thị badge ở header icon) + toast xác nhận. Dialog giỏ hàng: icon header mở dropdown list cart items (ảnh, tên, giá, tăng/giảm số lượng, tổng, nút "Đặt qua nhà sáng tạo" dẫn chat). 
3. Xóa badge "Sản phẩm độc lập" trong ProfileTabs; thay phần body card cũ bằng ShopeeProductCard trong ProfileTabs + projects/[projectId] nếu có grid tương tự.
4. typecheck, test dev 3322, commit push (email nguyenquachphutai@gmail.com, name Escanor292, repo Escanor292/platform main).

## Tiến độ
- [x] Rà soát code
- [ ] ShopeeProductCard component
- [ ] Cart context/localStorage + header badge + dropdown
- [ ] Thay card cũ ProfileTabs, xóa "Sản phẩm độc lập"
- [ ] Test, commit, push, báo user

## CẬP NHẬT TIẾN ĐỘ (2026-08-20)
- [x] Đã tạo `src/components/products/ShopeeProductCard.tsx`: ảnh vuông aspect-square (placeholder SVG box khi không có ảnh), badge "-X%" góc trên phải ảnh (màu pgreen), tên line-clamp-2 13px, giá `formatVND(x).replace("VNĐ","") + "đ"` màu pgreen bold 15px, giá gốc gạch nhỏ gray-400 11px, nút giỏ hàng tròn 8x8 bottom-2 right-2 màu pgreen (đổi dblue khi vừa thêm), owner mode: share/edit/delete ở top-left (opacity-0 group-hover), card rounded-md border-gray-200 hover:border-pgreen.
- [x] Đã tạo `src/components/products/CartProvider.tsx`: Context giỏ hàng localStorage key "tutefund_cart", event "tutefund_cart_change" + "tutefund_cart_open"; export CartProvider, useCart, CartBadge, CartDropdown (dropdown phải với tăng/giảm số lượng, tổng, link /cart). NOTE: link /cart CHƯA CÓ TRANG — cần tạo trang /cart hoặc đổi link sang chat.
- [ ] Gắn CartProvider vào app layout (src/app/layout.tsx — là server component, bọc "use client" CartProvider trong provider client component hoặc import trực tiếp vì CartProvider đã "use client").
- [ ] Gắn CartDropdown + CartBadge vào NavbarNew: thêm import, đặt trước icon chat MessageCircle (khoảng dòng 158-166).
- [ ] Trang /cart mới: trang giỏ hàng dạng Shopee (danh sách, tăng/giảm, tổng, nút "Liên hệ nhà sáng tạo" → mở /chat hoặc dẫn về chat với creator). Creator lấy từ product: /api/rewards/[id] trả project.creatorId hoặc campaign.creatorId.
- [ ] ProfileTabs.tsx dòng 502-633: thay body card cũ bằng ShopeeProductCard, xóa badge "Sản phẩm độc lập" (dòng 580-584), grid chuyển grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 kiểu Shopee, truyền isOwnerMode={isOwnerMode}, onEditUrl=`/products/${reward.id}?edit=1`, onDelete=handleDelete.
- [ ] Kiểm tra src/app/projects/[projectId]/page.tsx và src/app/products/[rewardId]/page.tsx có grid sản phẩm tương tự không để áp dụng (user chỉ thấy trên profile).
- Typecheck: npx tsc --noEmit -p tsconfig.json (lỗi bcrypt trong scripts bỏ qua, là lỗi cũ).
- Dev server: http://localhost:3322, login test3@gmail.com/123.
- Commit/push: git -c user.email=nguyenquachphutai@gmail.com -c user.name=Escanor292, repo Escanor292/platform branch main.
- formatVND trả "X VNĐ" (src/lib/utils.ts).

## KẾT QUẢ KIỂM THỬ (dev, 2026-08-20)
- Tab Sản phẩm profile test3: card Shopee-style OK — ảnh (placeholder do chưa có ảnh thật), tên, giá "55.000 đ" màu xanh, tồn kho, nút giỏ tròn. KHÔNG còn "SẢN PHẨM ĐỘC LẬP".
- Header: icon giỏ hàng có badge số 1 (tutefund-cart-trigger). Toast "Đã thêm vào giỏ hàng". OK.
- Trang /cart: hiển thị sản phẩm, +/- số lượng, xóa, xóa toàn bộ, tổng cộng, "Liên hệ nhà sáng tạo" + ghi chú chưa tích hợp thanh toán. OK.
- TODO còn lại: test badge % giảm (set maxAmount > minAmount) + card có ảnh thật; rồi commit+push.
- Typecheck src: 0 lỗi.

## TASK MỚI (2026-08-20): Nút chat trên trang sản phẩm
Yêu cầu user: trang sản phẩm thêm nút chat → mở khung chat kèm thông tin sản phẩm để backer trao đổi với creator (giống trang chiến dịch: "Nhắn tin với Test Creator Pro").
Đã làm:
- `src/components/chat/StartChatButton.tsx`: thêm props `rewardId`, `rewardTitle`, `rewardPrice`. Intro message ưu tiên sản phẩm (📦 tên, 💰 giá, 🔗 link /products/{id}) nếu có rewardId+rewardTitle, else dùng campaign title. Callback login cũng ưu tiên /products/{rewardId}.
- Còn lại: gắn StartChatButton vào `src/app/products/[rewardId]/page.tsx` thay nút `<a>Liên hệ nhà sáng tạo</a>` (chế độ chiến dịch ~dòng 383: `href={`/profile/${contactUserId}#products`}`, và chế độ độc lập có nút tương tự). Props: campaignOwnerId=contactUserId (lấy từ campaign.users.id || campaign.creatorId || project.creatorId), campaignOwnerName (cần fetch tên user — dùng campaign.users.name nếu có, else query thêm user name), rewardId=reward.id, rewardTitle=reward.title, rewardPrice=formatVND(reward.minAmount) (đã sửa page dùng replace "VNĐ"→"đ" cho giá), variant="outline" className="w-full" hoặc giữ style pgreen.
- Lưu ý page là server component async; cần import StartChatButton ("use client") trực tiếp. Tên chủ sở hữu: campaign.users?.name, nếu null fetch thêm user name qua prisma.
- Typecheck: npx tsc --noEmit -p tsconfig.json (lỗi bcrypt scripts bỏ qua).
- Sau đó: test login test2@gmail.com/123 (backer) mở /products/b30ad967-... bấm nút chat → trang /chat/{id} hiện tin nhắn intro kèm sản phẩm. Commit/push: git -c user.email=nguyenquachphutai@gmail.com -c user.name=Escanor292 repo Escanor292/platform branch main.
- Sản phẩm test: id b30ad967-c249-40ff-b6e4-f0b878d56e3b, owner=test3 (cmphnhw8e0002so1uh16dwpvn), KHÔNG thuộc chiến dịch (chế độ độc lập), thuộc dự án Mầm xanh tử tế.
- Dev: localhost:3322. Login: test1/test2/admin/test3 @gmail.com pass 123.

### Kết quả kiểm tra trang sản phẩm (2026-08-20)
Nút "Nhắn tin với Nhà sáng tạo" đã hiện đúng trên trang sản phẩm (chế độ độc lập), render bằng StartChatButton với props rewardId/rewardTitle/rewardPrice. Trang load bình thường không lỗi. Khi bấm với session chủ sở hữu (test3) thì đúng logic hiện alert "Bạn không thể nhắn tin với chính mình". Browser click thật bị timeout do alert block, nhưng hành vi đúng (alert đã hiện → click JS mô phỏng đã pass trước đó, url không đổi).
Chưa test được luồng full (tạo conversation + gửi intro message) vì MongoDB Atlas chặn IP sandbox (API chat 500). Trên production sẽ hoạt động.
Còn lại: login test2@gmail.com (backer) thử bấm nút chat → nếu không test được do Atlas, commit/push là đủ.
Git: cd ~/platform, git config user.email nguyenquachphutai@gmail.com, user.name Escanor292, repo Escanor292/platform, branch main.

### Chẩn đoán lỗi chat (2026-08-20 08:24)
Trang /chat hiện "Không thể tải danh sách cuộc trò chuyện". Dev log: `MongoServerSelectionError: connection <monitor> to 159.143.78.200:27017 closed` — .env dùng MONGODB_URI dạng trực tiếp với IP shard cũ, Atlas đã đổi IP shard. Dạng `mongodb+srv://` ping thành công. Fix: đổi MONGODB_URI trong .env sandbox sang dạng mongodb+srv; user cần cập nhật Vercel env var riêng nếu lỗi còn trên production.

### Debug MongoDB Node driver (08:28)
- Port 27017 trên cả 3 IP shard mới (159.143.78.200/218/231) đều OPEN qua TCP.
- pymongo (Python) kết nối SRV **thành công**.
- Node mongodb driver 7.5: mọi URI `mongodb+srv://` đều fail `TypeError: Cannot read properties of undefined (reading 'join')` tại resolveSRV (connection_string.js:88:66) — có vẻ là bug của driver 7.5 với DNS resolver trong sandbox (resolveSrv trả OK, TXT record có thể là nguyên nhân).
- URI `mongodb://hostlist` với replicaSet=atlas-q4j8k3-shard-0 fail `connection <monitor> closed` — có thể cần authSource hoặc TLS. Thử tiếp: thêm `tls=true` hoặc check authSource admin.

### Kết luận MongoDB (08:35)
Kiểm tra thực tế: `c.DuAn.command('ping')` fail `OperationFailure: bad auth Authentication failed` (code 8000 AtlasError). Kết nối mạng OK (TCP mở, DNS SRV đúng), nhưng credential không xác thực được. Nguyên nhân khả dĩ: mật khẩu Atlas có chứa ký tự đặc biệt và chuỗi trong .env bị encode sai tầng (%40Tai → thực tế mk có thể là "0909115079@Tai" nhưng đã qua 2 lần encode ở đâu đó, hoặc mk thật đã đổi). Không nên tự đoán mật khẩu mới — hỏi user. Lưu ý: user có thể đã thay đổi mk database hoặc credential trong Vercel env khác với .env sandbox.

### KẾT QUẢ (08:40) — MongoDB cluster MỚI hoạt động
User cung cấp URI mới: cluster `duan.b4wcshp.mongodb.net`, mk `0909115079@Tai`. Đã cập nhật .env (dòng MONGODB_URI). DB mới chứa conversations, messages... — API chat /api/chat/conversations trả 200.
Luồng test hoàn chỉnh ĐÃ PASS: login test2@gmail.com/123 (backer) → mở /products/b30ad967-c249-40ff-b6e4-f0b878d56e3b → bấm "Nhắn tin với Nhà sáng tạo" → backend log: POST /api/chat/conversations/6a86bd6d6dbff94146f47778/messages 200, PATCH read 200, GET messages 200. Conversation mới id `6a86bd6d6dbff94146f47778` giữa test2 (TC backer) và Test Creator.
Còn lại: typecheck, commit, push (git -c user.email=nguyenquachphutai@gmail.com -c user.name=Escanor292, repo Escanor292/platform branch main), báo user. Nhắc user: cập nhật biến MONGODB_URI trên Vercel (production) sang `mongodb+srv://nguyenquachphutai_db_user:0909115079%40Tai@duan.b4wcshp.mongodb.net/?retryWrites=true&w=majority&appName=DuAn` để chat hoạt động trên production.
Lưu ý: không push .env lên GitHub (đã có trong .gitignore).
