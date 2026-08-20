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
