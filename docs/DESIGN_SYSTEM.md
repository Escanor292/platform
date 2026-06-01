# DESIGN_SYSTEM.md

## 1. Nguồn chuẩn giao diện

Trang chủ hiện tại là nguồn chuẩn giao diện gốc của TửTế Fund.

Các file đại diện cho design system hiện tại:

```txt
src/app/page.tsx
src/components/shared/HeroSection.tsx
src/components/shared/StatsSection.tsx
src/components/shared/WhyUsSection.tsx
src/components/shared/ThreeStepsSection.tsx
src/components/shared/TestimonialsSection.tsx
src/components/shared/CTASection.tsx
src/components/layout/NavbarNew.tsx
src/components/shared/FooterNew.tsx
src/app/globals.css
tailwind.config.ts
```

Khi cải thiện UI, ưu tiên dùng lại các class đã có trong `globals.css` và `tailwind.config.ts`, không tự bịa style mới nếu không cần.

---

## 2. Bảng màu chính

### Primary Green — `pgreen` 

```txt
Tên: Primary Green
Tailwind class: pgreen
HEX: #2E8B57
Vai trò: Màu thương hiệu chính
```

Dùng cho:

* CTA chính
* Link hover
* Icon chính
* Badge tích cực
* Progress chính
* Các điểm nhấn liên quan đến hành động tử tế/gây quỹ

Ví dụ class:

```txt
text-pgreen
bg-pgreen
border-pgreen
hover:text-pgreen
```

---

### Fresh Green — `fgreen` 

```txt
Tên: Fresh Green
Tailwind class: fgreen
HEX: #6BCB77
Vai trò: Màu xanh phụ, tạo cảm giác tươi mới
```

Dùng cho:

* Gradient phụ
* Hover/active state
* Icon trang trí
* Progress bar
* Thành phần thể hiện sự tăng trưởng, phát triển

Ví dụ:

```txt
from-pgreen to-fgreen
text-fgreen
bg-fgreen
```

---

### Trust Blue — `tblue` 

```txt
Tên: Trust Blue
Tailwind class: tblue
HEX: #2F80ED
Vai trò: Màu phụ cho sự tin cậy, xác minh, bảo mật
```

Dùng cho:

* Thông tin về minh bạch
* Bảo mật
* Xác minh
* Dữ liệu phụ
* Một số icon phụ nếu cần phân cấp màu

Không dùng `tblue` để thay thế CTA chính.

Ví dụ:

```txt
text-tblue
bg-tblue
from-tblue to-dblue
```

---

### Dark Blue — `dblue` 

```txt
Tên: Dark Blue
Tailwind class: dblue
HEX: #1F4E79
Vai trò: Màu chữ chính cho tiêu đề
```

Dùng cho:

* Heading lớn
* Tiêu đề section
* Tên thương hiệu
* Text quan trọng cần độ tin cậy cao

Ví dụ:

```txt
text-dblue
bg-dblue
```

---

### Earth Brown — `ebrown` 

```txt
Tên: Earth Brown
Tailwind class: ebrown
HEX: #8B6B4A
Vai trò: Màu nhấn ấm, nhân văn, gần gũi
```

Dùng cho:

* Điểm nhấn phụ
* Icon hoặc badge mang cảm giác ấm áp
* Section liên quan câu chuyện, con người, cộng đồng
* Một số trạng thái phụ không mang tính lỗi

Ví dụ:

```txt
text-ebrown
bg-ebrown
from-ebrown to-amber-600
```

---

### Cream — `cream` 

```txt
Tên: Cream
Tailwind class: cream
HEX: #F8F7F2
Vai trò: Nền ấm, nhẹ, thân thiện
```

Dùng cho:

* Background section
* Trang public/marketing
* Khoảng nghỉ thị giác giữa các section
* Nền phụ cho card hoặc page wrapper

Ví dụ:

```txt
bg-cream
gradient-warm
```

---

### Glass White

```txt
Tên: Glass White
Class gốc: glass
Giá trị chính: bg-white/70 backdrop-blur-xl border border-white/50 shadow-soft
Vai trò: Card trong suốt nhẹ, hiện đại
```

Dùng cho:

* Card thống kê
* Card feature
* Card testimonial
* Floating card
* Khu vực UI cần cảm giác mềm, hiện đại

Ví dụ:

```txt
glass
glass-morphism
```

---

## 3. Quy tắc dùng màu

### 3.1 CTA chính

CTA chính phải dùng xanh thương hiệu.

Ưu tiên:

```txt
gradient-green
bg-pgreen
from-pgreen to-fgreen
```

Ví dụ:

```tsx
className="rounded-2xl gradient-green text-white font-bold hover:shadow-lg"
```

Không dùng:

```txt
bg-blue-600
bg-indigo-600
bg-purple-600
```

cho CTA chính.

---

### 3.2 Tiêu đề

Tiêu đề chính và section heading dùng:

```txt
text-dblue
font-display
font-bold hoặc font-black
```

Ví dụ:

```tsx
<h2 className="font-display font-bold text-3xl lg:text-4xl text-dblue">
  Vì sao chọn TửTế Fund?
</h2>
```

Không dùng đen tuyệt đối nếu không cần:

```txt
text-black
text-neutral-950
```

---

### 3.3 Text nội dung

Text nội dung dùng slate/gray mềm:

```txt
text-gray-500
text-gray-600
text-gray-700
text-slate-600
```

Không dùng text quá nhạt cho nội dung quan trọng:

```txt
text-gray-300
text-slate-300
```

---

### 3.4 Link

Link thường:

```txt
text-pgreen
hover:text-dblue
hover:underline
```

Link trong navbar:

```txt
text-gray-600 hover:text-pgreen
```

Active/hover underline dùng:

```txt
bg-pgreen
```

---

### 3.5 Trạng thái thành công

Dùng xanh thương hiệu:

```txt
text-pgreen
bg-pgreen/10
border-pgreen/20
```

hoặc xanh tươi:

```txt
text-fgreen
bg-fgreen/10
```

---

### 3.6 Trạng thái tin cậy/bảo mật/xác minh

Dùng:

```txt
text-tblue
bg-tblue/10
border-tblue/20
```

hoặc:

```txt
text-dblue
```

Không dùng blue mặc định nếu có thể dùng `tblue`.

---

### 3.7 Cảnh báo nhẹ

Dùng vàng/nâu ấm:

```txt
text-ebrown
bg-ebrown/10
border-ebrown/20
```

hoặc amber nếu cần:

```txt
text-amber-700
bg-amber-50
border-amber-200
```

---

### 3.8 Lỗi/nguy hiểm

Được phép dùng red cho lỗi thật sự:

```txt
text-red-600
bg-red-50
border-red-200
```

Chỉ dùng red cho:

* Xóa
* Từ chối
* Lỗi validate
* Tài khoản bị khóa
* Cảnh báo nguy hiểm

Không dùng red để nhấn mạnh thông thường.

---

### 3.9 Background section

Trang public nên xen kẽ:

```txt
bg-white
bg-cream
gradient-warm
```

Hero có thể dùng gradient mềm như trang chủ:

```txt
linear-gradient(180deg, #F8F7F2 0%, #f0f8f4 25%, #ecf2f9 55%, #f4f3f0 80%, #F8F7F2 100%)
```

Không dùng background xám lạnh quá nhiều:

```txt
bg-gray-100
bg-slate-100
```

trừ dashboard/admin.

---

## 4. Quy tắc button

### 4.1 Primary button

Dùng cho hành động chính:

* Bắt đầu gây quỹ
* Tạo chiến dịch
* Ủng hộ
* Lưu thay đổi
* Tìm kiếm chính

Class khuyến nghị:

```tsx
className="rounded-2xl gradient-green px-6 py-3 font-bold text-white transition-all hover:shadow-lg hover:shadow-green-200"
```

Hoặc:

```tsx
className="rounded-2xl bg-pgreen px-6 py-3 font-bold text-white transition hover:bg-fgreen"
```

---

### 4.2 Secondary button

Dùng cho hành động phụ:

* Khám phá chiến dịch
* Xem thêm
* Quay lại
* Hủy

Class khuyến nghị:

```tsx
className="rounded-2xl glass border border-white/70 px-6 py-3 font-bold text-dblue hover:bg-white/80"
```

Hoặc:

```tsx
className="rounded-2xl border border-gray-200 bg-white px-6 py-3 font-semibold text-dblue hover:border-pgreen/30 hover:text-pgreen"
```

---

### 4.3 Danger button

Dùng cho hành động nguy hiểm:

```tsx
className="rounded-2xl bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700"
```

Chỉ dùng cho xóa/từ chối/khóa.

---

### 4.4 Disabled button

Dùng:

```txt
disabled:cursor-not-allowed
disabled:opacity-60
```

Không chỉ đổi màu mà không disable thật.

---

### 4.5 Loading button

Khi loading:

* Disable button
* Hiển thị spinner nhỏ
* Text đổi rõ ràng: "Đang xử lý...", "Đang tìm...", "Đang lưu..."

---

## 5. Quy tắc card

### 5.1 Card public/marketing

Ưu tiên dùng:

```txt
glass
rounded-3xl
p-6 hoặc p-8
card-hover
```

Ví dụ:

```tsx
className="glass rounded-3xl p-8 card-hover"
```

Dùng cho:

* Feature card
* Stat card
* Testimonial card
* User search card
* Blog card nhẹ

---

### 5.2 Card dữ liệu/campaign

Ưu tiên:

```txt
bg-white
rounded-3xl
shadow-md
hover:shadow-xl
hover:-translate-y-1
transition-all
overflow-hidden
```

Ví dụ:

```tsx
className="rounded-3xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all bg-white"
```

---

### 5.3 Card trong dashboard/admin

Dashboard cần rõ ràng hơn glass quá nhiều.

Dùng:

```txt
bg-white
border border-gray-100
rounded-2xl hoặc rounded-3xl
shadow-sm
```

Không dùng quá nhiều blur nếu làm giảm độ đọc.

---

### 5.4 Card hover

Hover nên nhẹ:

```txt
hover:-translate-y-1
hover:shadow-xl
transition-all duration-300
```

Không dùng hiệu ứng quá mạnh làm giật UI.

---

## 6. Quy tắc section

### 6.1 Section public

Các section public nên có spacing rộng:

```txt
py-20 px-6
max-w-7xl mx-auto
```

Heading section:

```txt
font-display font-bold text-3xl lg:text-4xl text-dblue
```

Mô tả section:

```txt
text-gray-500 hoặc text-gray-600
max-w-2xl mx-auto
```

---

### 6.2 Section Hero

Hero được phép nổi bật hơn:

```txt
pt-28 pb-24 px-6
relative overflow-hidden
```

Có thể dùng gradient nền mềm, floating card, glass effect.

Nhưng phải kiểm tra mobile để tránh chữ quá lớn hoặc card bị tràn.

---

### 6.3 Section Dashboard/Admin

Dashboard/admin nên dùng layout sạch hơn:

```txt
bg-slate-50 hoặc bg-white
rounded-2xl
border-gray-100
shadow-sm
```

Màu chính vẫn theo `pgreen`, `dblue`, nhưng không cần quá nhiều gradient.

---

### 6.4 Section CTA

CTA cuối trang dùng:

```txt
gradient-green
text-white
rounded-3xl
p-12 hoặc p-16
```

Nút phụ trên CTA dùng nền trắng:

```txt
bg-white text-pgreen
```

---

## 7. Những màu không nên dùng

### 7.1 Không dùng blue mặc định cho CTA chính

Tránh:

```txt
bg-blue-600
hover:bg-blue-700
text-blue-600
border-blue-600
focus:ring-blue-500
```

Lý do: dễ lệch khỏi style trang chủ. Nếu cần màu xanh dương, dùng `tblue` hoặc `dblue`.

---

### 7.2 Không dùng indigo/purple làm màu chính

Tránh:

```txt
bg-indigo-600
text-indigo-600
bg-purple-600
text-purple-600
```

Lý do: không thuộc palette thương hiệu TửTế Fund.

Chỉ dùng nếu có chức năng đặc biệt và được yêu cầu rõ.

---

### 7.3 Không dùng đen tuyệt đối quá nhiều

Tránh:

```txt
text-black
bg-black
text-neutral-950
```

Ưu tiên:

```txt
text-dblue
text-gray-900
text-slate-900
```

---

### 7.4 Không dùng gray lạnh quá nhiều ở trang public

Tránh lạm dụng:

```txt
bg-gray-100
bg-slate-100
bg-zinc-100
```

Trang public nên ấm và nhân văn hơn:

```txt
bg-cream
gradient-warm
bg-white
```

---

### 7.5 Không dùng màu neon/chói

Tránh:

```txt
lime quá chói
cyan quá sáng
pink/magenta
orange quá mạnh
```

trừ khi là icon nhỏ hoặc trạng thái đặc biệt.

---

## 8. Checklist trước khi sửa UI

Trước khi sửa giao diện, kiểm tra:

```txt
[ ] Trang này có đang dùng màu blue mặc định không?
[ ] Có thể đổi sang pgreen/fgreen/tblue/dblue không?
[ ] CTA chính có dùng gradient-green hoặc pgreen không?
[ ] Heading có dùng text-dblue không?
[ ] Card có đồng bộ rounded-3xl/shadow/glass/card-hover không?
[ ] Section spacing có đồng bộ py-20 px-6 không?
[ ] Mobile có bị tràn chữ/card không?
[ ] Có dùng lại class trong globals.css chưa?
[ ] Có tránh sửa database/API khi chỉ sửa UI không?
[ ] Có chạy npm run build sau khi sửa không?
```

## 9. Nguyên tắc cuối cùng

Trang chủ là chuẩn gốc. Nếu một trang khác có style lệch khỏi trang chủ, ưu tiên điều chỉnh trang đó về gần style trang chủ thay vì đổi style trang chủ theo trang đó.
