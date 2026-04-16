# Hướng Dẫn Sử Dụng Link Editor Mới 🔗

## Tính Năng Mới

Editor hiện đã có tính năng chèn link hiện đại với **floating popover** - một ô nổi nhỏ xuất hiện ngay gần vị trí bạn đang làm việc, thay vì popup giữa màn hình như trước.

## Cách Sử Dụng

### 1️⃣ Chèn Link Cho Text Đã Chọn

**Bước 1:** Bôi đen text bạn muốn biến thành link
```
Ví dụ: Bôi đen chữ "Xem thêm"
```

**Bước 2:** Bấm nút Link trên toolbar HOẶC nhấn `Ctrl+K` (Windows) / `Cmd+K` (Mac)

**Bước 3:** Một ô nhỏ sẽ xuất hiện ngay gần text bạn vừa chọn

**Bước 4:** Nhập URL vào ô (ví dụ: `example.com` hoặc `https://example.com`)

**Bước 5:** Nhấn `Enter` hoặc click nút "Áp dụng"

✅ **Kết quả:** Text "Xem thêm" đã trở thành link!

---

### 2️⃣ Chèn Link Mới (Không Chọn Text Trước)

**Bước 1:** Đặt con trỏ ở vị trí muốn chèn link

**Bước 2:** Nhấn `Ctrl+K` / `Cmd+K` hoặc click nút Link

**Bước 3:** Ô nổi xuất hiện với 2 ô nhập:
- **Text hiển thị:** Nhập text bạn muốn hiển thị (ví dụ: "Trang chủ")
- **URL:** Nhập địa chỉ web (ví dụ: `example.com`)

**Bước 4:** Nhấn `Enter` hoặc click "Áp dụng"

✅ **Kết quả:** Link "Trang chủ" được chèn vào editor!

---

### 3️⃣ Sửa Link Đã Có

**Bước 1:** Click vào link bạn muốn sửa

**Bước 2:** Một ô nhỏ hiện ra với:
- URL hiện tại
- Nút "Sửa"
- Nút "Mở" 
- Nút "Xóa"

**Bước 3:** Click nút "Sửa"

**Bước 4:** Chỉnh sửa URL

**Bước 5:** Nhấn `Enter` để lưu

✅ **Kết quả:** Link đã được cập nhật!

---

### 4️⃣ Xóa Link

**Bước 1:** Click vào link muốn xóa

**Bước 2:** Click nút "Xóa" trong ô nổi

✅ **Kết quả:** Link bị xóa, nhưng text vẫn giữ nguyên!

---

### 5️⃣ Mở Link Để Kiểm Tra

**Bước 1:** Click vào link

**Bước 2:** Click nút "Mở"

✅ **Kết quả:** Link mở trong tab mới!

---

## Phím Tắt Hữu Ích ⌨️

| Phím Tắt | Chức Năng |
|----------|-----------|
| `Ctrl+K` / `Cmd+K` | Mở ô chèn link |
| `Enter` | Áp dụng link |
| `Esc` | Đóng ô link |
| `Tab` | Di chuyển giữa các ô nhập |

## Tính Năng Thông Minh 🧠

### ✨ Tự Động Thêm https://
Bạn chỉ cần nhập `example.com`, hệ thống tự động chuyển thành `https://example.com`

### ✨ Kiểm Tra URL Hợp Lệ
Nếu bạn nhập URL không đúng (ví dụ: chỉ gõ "abc"), hệ thống sẽ báo lỗi và không cho phép áp dụng.

### ✨ Ô Nổi Thông Minh
Ô nhập link luôn xuất hiện gần vị trí bạn đang làm việc, không che khuất nội dung.

### ✨ Không Mất Vùng Chọn
Khi bạn mở ô link, text bạn đã chọn vẫn được giữ nguyên, không bị mất.

## So Sánh Với Cách Cũ

### ❌ Cách Cũ (Window Prompt)
1. Click nút Link
2. Popup xuất hiện giữa màn hình
3. Nhập URL
4. Click OK
5. Không thể edit dễ dàng

### ✅ Cách Mới (Floating Popover)
1. Chọn text hoặc đặt con trỏ
2. Nhấn `Ctrl+K` / `Cmd+K`
3. Ô nổi xuất hiện ngay gần vị trí làm việc
4. Nhập URL (có validation)
5. Nhấn `Enter`
6. Click vào link để edit/remove/open dễ dàng

## Ví Dụ Thực Tế

### Ví Dụ 1: Thêm Link Trang Web
```
Text: "Tìm hiểu thêm về dự án"
URL: "https://example.com/project"
```

**Cách làm:**
1. Bôi đen "Tìm hiểu thêm về dự án"
2. Nhấn `Ctrl+K`
3. Nhập: `example.com/project`
4. Nhấn `Enter`

### Ví Dụ 2: Thêm Link Mạng Xã Hội
```
Text: "Facebook"
URL: "https://facebook.com/yourpage"
```

**Cách làm:**
1. Nhấn `Ctrl+K` (không cần chọn text)
2. Nhập text: `Facebook`
3. Nhập URL: `facebook.com/yourpage`
4. Nhấn `Enter`

### Ví Dụ 3: Sửa Link Sai
```
Link cũ: https://old-site.com
Link mới: https://new-site.com
```

**Cách làm:**
1. Click vào link
2. Click "Sửa"
3. Đổi thành `new-site.com`
4. Nhấn `Enter`

## Lỗi Thường Gặp & Cách Khắc Phục

### ❗ "URL không hợp lệ"
**Nguyên nhân:** URL bạn nhập không đúng định dạng

**Cách khắc phục:** 
- Đảm bảo URL có dạng: `example.com` hoặc `https://example.com`
- Không nhập khoảng trắng thừa
- Phải có tên miền hợp lệ (có dấu chấm)

### ❗ "Vui lòng nhập text hiển thị"
**Nguyên nhân:** Bạn chưa chọn text và chưa nhập text hiển thị

**Cách khắc phục:**
- Nhập text vào ô "Text hiển thị"
- Hoặc bôi đen text trước khi mở ô link

### ❗ Ô link không hiện
**Nguyên nhân:** Có thể do lỗi tạm thời

**Cách khắc phục:**
- Thử click lại nút Link
- Hoặc nhấn `Ctrl+K` / `Cmd+K`
- Refresh trang nếu cần

## Tips & Tricks 💡

### 💡 Tip 1: Dùng Phím Tắt
Thay vì click chuột, dùng `Ctrl+K` / `Cmd+K` sẽ nhanh hơn nhiều!

### 💡 Tip 2: Không Cần Gõ https://
Chỉ cần gõ `example.com`, hệ thống tự thêm `https://` cho bạn.

### 💡 Tip 3: Kiểm Tra Link Trước Khi Lưu
Click nút "Mở" để xem link có đúng không trước khi publish.

### 💡 Tip 4: Sửa Link Nhanh
Click vào link → Sửa → Enter. Chỉ 3 bước!

### 💡 Tip 5: Dùng Tab Để Di Chuyển
Khi có nhiều ô nhập, dùng `Tab` để di chuyển nhanh giữa các ô.

## Câu Hỏi Thường Gặp ❓

**Q: Tôi có thể chèn link email không?**
A: Có! Nhập `mailto:email@example.com` vào ô URL.

**Q: Link có mở trong tab mới không?**
A: Khi click nút "Mở" trong preview, link sẽ mở tab mới. Link trong nội dung sẽ mở theo cài đặt trình duyệt.

**Q: Tôi có thể chèn nhiều link trong một đoạn không?**
A: Có! Mỗi link hoạt động độc lập.

**Q: Làm sao để xóa link nhưng giữ text?**
A: Click vào link → Click nút "Xóa". Text sẽ được giữ nguyên.

**Q: Ô link có tự đóng không?**
A: Có, ô sẽ tự đóng khi bạn:
- Nhấn `Enter` (sau khi áp dụng)
- Nhấn `Esc`
- Click ra ngoài ô

## Kết Luận

Tính năng link mới giúp bạn:
- ✅ Chèn link nhanh hơn
- ✅ Sửa link dễ dàng hơn
- ✅ Không làm gián đoạn luồng viết
- ✅ Trải nghiệm hiện đại, mượt mà

Hãy thử ngay và trải nghiệm sự khác biệt! 🚀
