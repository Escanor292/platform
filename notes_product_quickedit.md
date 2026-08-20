# Nhiệm vụ: Quick Edit trang sản phẩm + tạo blog mẫu + sửa hiển thị giá

## Yêu cầu user
1. Trang sản phẩm `/products/[rewardId]` chưa có "Chỉnh sửa nhanh" (blog + project đã có, dùng OwnerEditPanel).
   - Khi bấm sửa nhanh → sửa ngay tại chỗ trên trang đang mở, không dẫn tới trang quản lý.
2. Tạo blog mẫu thuộc tài khoản cmphnhw8e0002so1uh16dwpvn (test3@gmail.com, Test Creator Pro).
3. Ảnh user: giá hiển thị "55.000 VNĐ đ" → thừa chữ "đ" (formatVND trong src/lib/utils.ts đã trả "XXX VNĐ", code page append thêm " đ").

## Thông tin kỹ thuật quan trọng
- Trang sản phẩm: `src/app/products/[rewardId]/page.tsx` (418 dòng, server component thuần async, KHÔNG có client wrapper, KHÔNG có OwnerEditPanel).
  - 2 chế độ render: chế độ 1 (có campaign ~ dòng 100-260), chế độ 2 độc lập (262-392).
  - Query reward include: campaigns (users, projects, pledges), projects. contactUserId = campaign?.users?.id || campaign?.creatorId || project?.creatorId.
  - Format giá: `formatVND(x) + " đ"` → phải sửa thành chỉ `formatVND(x)` (các chỗ: dòng 157, 162, 310, 315, 179, 190, 206).
  - ShareScript ở cuối (dòng 395-417).
- OwnerEditPanel: `src/components/OwnerEditPanel.tsx` — prop `isOwner: boolean`, `blocks: [{label, editUrl?, description?, onEdit?}]`. isOwner=true luôn hiện (blog dùng hardcoded isOwner={true}).
- Blog client wrapper pattern: `src/app/blog/[slug]/BlogDetailPageClient.tsx`:
  - state editing, formData {title, excerpt, content, coverImage, type, visibility}, fetch `/api/blog/posts/${slug}` PATCH, toast.success + router.refresh().
  - Dialog fixed inset-0 z-50, max-w-4xl, header gradient, form overflow-y-auto.
  - Dùng ProductionEditor (tiptap), ImageUpload.
- API rewards: `src/app/api/rewards/[id]/route.ts`: GET, PUT, DELETE.
  - PUT body: title, description, minAmount, maxAmount, stock, productImages, productVideo, maxQuantity, deliveryDate, isActive, isIncludedInProject.
  - Auth: `await auth()` (import {auth} từ "@/lib/auth"), check creatorId của campaign.
  - LƯU Ý: access check chỉ so (reward.campaigns).creatorId — sản phẩm độc lập (campaign=null) sẽ không so sánh được → PUT DELETE sẽ fail "Access denied". Khi thêm quick edit cần sửa access check: nếu không có campaign, check reward.projects.creatorId === userId; nếu không có cả hai thì cho chủ sở hữu (userId === user id nếu có trường userId... rewards không có userId → dùng project.creatorId).
- Session server component: `const session = await auth(); const currentUserId = (session?.user as any)?.id;`
- Auth client: import { useSession } from "next-auth/react" (client), blog dùng `import { auth } from "@/lib/auth"` ở server page.
- Tài khoản: test1@gmail.com (BACKER), test2@gmail.com (CREATOR), test3@gmail.com (CREATOR, id cmphnhw8e0002so1uh16dwpvn, dự án "Mầm xanh tử tế" slug mam-xanh-tu-te, sản phẩm reward id b30ad967-c249-40ff-b6e4-f0b878d56e3b), admin@gmail.com (ADMIN). MK chung: 123.
- Dev server chạy port 3322; git email nguyenquachphutai@gmail.com, name Escanor292.
- MongoDB Atlas bị chặn IP sandbox (chat không test được từ sandbox), nhưng product/blog dùng PostgreSQL OK.
- Blog API: PATCH /api/blog/posts/[slug], body {title, excerpt, content, coverImage, type, visibility}; blog_categories route /api/blog/categories; blog model prisma blog_posts.
- Scripts mẫu tạo user/project: scripts/recreate_user_and_product.ts (dùng PrismaClient + bcrypt hashSync(password, 10)).
  - Chạy script: `cat .env | grep -v "^#" > /tmp/env_clean.txt && (set -a; source /tmp/env_clean.txt; set +a; npx tsx scripts/xxx.ts)` (file .env có 2 dòng DATABASE_URL, một dòng comment).

## Kế hoạch thực hiện
1. Sửa formatVND: đổi thành không thêm "VNĐ" hoặc page không append " đ" → chọn sửa page (giữ "55.000 đ").
2. Sửa API rewards [id]: access check đúng cho sản phẩm độc lập (không campaign) + hỗ trợ cập nhật projectId.
3. Biến page.tsx sản phẩm thành client-capable: thêm component client `ProductDetailClient` (hoặc import OwnerEditPanel trực tiếp — page.tsx là server async component không thể có hooks) → tách phần render ra client component nhận reward+isOwner props.
4. Dialog quick edit sản phẩm: fields title, description (textarea), minAmount, maxAmount, stock, maxQuantity, deliveryDate, isActive, isIncludedInProject. Gọi PUT /api/rewards/[id].
5. Tạo blog mẫu cho test3: scripts/create_sample_blog.ts → blog_posts with authorId, status published, rich content hoặc content string. Kiểm tra model blog_posts trước (cần title, slug, excerpt?, content?, coverImage?, type?, visibility?, authorId...).
6. Typecheck, test dev server, commit push.

## Blog model blog_posts (từ schema, cần verify lại)
- Chưa xem chi tiết trong session này; trước khi tạo blog script hãy grep "model blog_posts" prisma/schema.prisma.

## Commits mới nhất
- 7e759f5: Chat deleted user display
- b440090: product page campaign null fix
Git repo: https://github.com/Escanor292/platform.git branch main.

## Tiến độ (cập nhật)
- [x] formatVND: hoàn tác về "X VNĐ" (vì 62 chỗ dùng). Sửa riêng page sản phẩm: sed thay "} đ" → "}" tại 7 chỗ — XONG (trang hiển thị "55.000 VNĐ" đúng).
- [x] Tạo component `src/components/products/ProductQuickEdit.tsx` — dialog sửa: title, description, minAmount, maxAmount, stock, maxQuantity, deliveryDate, isActive, images (nhiều ảnh qua nhiều ImageUpload label), gọi PUT /api/rewards/[id], toast + router.refresh(). Props: {product: QuickEditProduct, isOwner}.
- [ ] ImageUpload props: {value?, onChange:(url)=>void, className?, label?} — KHÔNG có multiple. Đã khớp.
- [ ] Gắn ProductQuickEdit + OwnerEditPanel vào page.tsx sản phẩm: page là server component async → gọi auth() lấy isOwner (check user id === project.creatorId || campaign.creatorId; admin luôn OK), sau đó render client fragment chứa ProductQuickEdit. page.tsx trả JSX từ hàm async → import dynamic client component ở cuối file.
- [ ] Sửa access check API PUT/DELETE rewards [id]: sản phẩm không có campaign thì access denied hiện tại → cần cho chủ project.owner... check reward.projects.creatorId. Admin luôn pass.
- [ ] Tạo blog mẫu test3: scripts/create_sample_blog.ts — blog_posts fields: id (crypto.randomUUID), authorId = cmphnhw8e0002so1uh16dwpvn, projectId (Mầm xanh tử tế), title, slug (du-nhat-dau-tien? chưa — blog mới "Hành trình Mầm xanh tử tế" slug hanh-trinh-mam-xanh-tu-te), excerpt, coverImage null, status PUBLISHED (BlogPostStatus: kiểm tra enum — DRAFT/PUBLISHED/...), type PLATFORM, visibility PUBLIC, content (string text), publishedAt new Date(), wordCount, readingTimeMinutes ~ content.length/200/5.
- [ ] BlogPostStatus enum: cần grep "enum BlogPostStatus" schema.
- Chạy script env: `cat .env | grep -v "^#" > /tmp/env_clean.txt && (set -a; source /tmp/env_clean.txt; set +a; npx tsx scripts/x.ts)`
- typecheck: `npx tsc --noEmit -p tsconfig.json` (ignore scripts/recreate... bcrypt error cũ).
- Commit: git -c user.email=nguyenquachphutai@gmail.com -c user.name=Escanor292; repo Escanor292/platform main.

## Kết quả kiểm tra (phase 3)
- Blog mẫu ĐÃ TẠO THÀNH CÔNG: id de9194b3-c31d-4e95-91ee-2648cb4c0481, slug hanh-trinh-mam-xanh-tu-te, thuộc dự án Mầm xanh tử tế, tác giả test3 (cmphnhw8e0002so1uh16dwpvn), status PUBLISHED, content JSON Tiptap đầy đủ (heading, paragraph, bold, blockquote).
- Đã test trên dev server localhost:3322/blog/hanh-trinh-mam-xanh-tu-te — hiển thị nội dung hoàn chỉnh, nút "Chỉnh sửa nhanh" hiện ở góc (chế độ đã login test3).
- Trang sản phẩm: đã sửa formatVND hiển thị "55.000 VNĐ" (không thừa "đ"), đã gắn ProductQuickEdit ở cả 2 chế độ render (campaign + độc lập), đã sửa access check PUT/DELETE /api/rewards/[id] cho sản phẩm độc lập + admin. Typecheck src sạch.
- Blog page có component OwnerEditPanel hiện sẵn, chỉ cần thêm vào trang sản phẩm (đã xong).

## Còn lại
- Test trang sản phẩm với user test3 login (xem panel Chỉnh sửa nhanh có hiện).
- Commit + push (git email nguyenquachphutai@gmail.com, name Escanor292, repo Escanor292/platform, branch main).
- Báo kết quả user.


## KẾT QUẢ KIỂM THỬ CUỐI CÙNG (hoàn tất)
- Trang sản phẩm: tên đã khôi phục về "Bộ hạt giống cây xanh tử tế" (nguyên bản), giá hiển thị "55.000 VNĐ" đúng, không thừa "đ". Nút Chỉnh sửa nhanh hiện ở góc dưới phải khi login test3; dialog mở đúng; PUT API 200 OK; toast "Sản phẩm đã được cập nhật!".
- Blog mẫu slug hanh-trinh-mam-xanh-tu-te: hiển thị nội dung đầy đủ, nút Chỉnh sửa nhanh hiện cho test3.
- Login test3@gmail.com / 123 đã có sẵn trên browser dev.

## CÒN LẠI
- Commit + push, báo kết quả.
