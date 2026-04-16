# 🧪 Quick Test Guide - Floating Link Popover

## Cách Test Để Thấy Sự Khác Biệt

### 📍 Bước 1: Mở Trang Tạo Dự Án
```
http://localhost:3000/campaigns/create
```

### 📍 Bước 2: Scroll Xuống "Nội dung chi tiết"

### 📍 Bước 3: Test Floating Link Popover

#### Test A: Chèn Link Với Text Đã Chọn

1. **Gõ text:** "Xem thêm thông tin"
2. **Bôi đen** text vừa gõ
3. **Nhấn Ctrl+K** (Windows) hoặc **Cmd+K** (Mac)
   - HOẶC click nút Link (icon 🔗) trên toolbar
4. **Quan sát:**
   - ✅ Một ô nổi nhỏ (floating popover) xuất hiện NGAY GẦN text bạn chọn
   - ✅ KHÔNG phải window prompt giữa màn hình
   - ✅ Ô có style đẹp với border, shadow, rounded corners
   - ✅ Focus tự động vào ô nhập URL
5. **Nhập URL:** `example.com`
6. **Nhấn Enter**
7. **Kết quả:**
   - ✅ Text "Xem thêm thông tin" trở thành link
   - ✅ URL được normalize thành `https://example.com`
   - ✅ Link màu xanh, có underline

#### Test B: Chèn Link Không Có Selection

1. **Đặt cursor** ở cuối paragraph
2. **Nhấn Ctrl+K** / **Cmd+K**
3. **Quan sát:**
   - ✅ Floating popover xuất hiện gần cursor
   - ✅ Có 2 ô input:
     - "Text hiển thị"
     - "URL"
4. **Nhập:**
   - Text: "Trang chủ"
   - URL: `google.com`
5. **Nhấn Enter**
6. **Kết quả:**
   - ✅ Link "Trang chủ" được chèn
   - ✅ URL: `https://google.com`

#### Test C: Edit Link Đã Có

1. **Click vào link** vừa tạo
2. **Quan sát:**
   - ✅ Preview bubble xuất hiện gần link
   - ✅ Hiển thị URL hiện tại
   - ✅ Có 3 nút: Sửa, Mở, Xóa
3. **Click "Sửa"**
4. **Quan sát:**
   - ✅ Chuyển sang edit mode
   - ✅ URL cũ được preload
5. **Đổi URL** thành `facebook.com`
6. **Nhấn Enter**
7. **Kết quả:**
   - ✅ Link updated thành `https://facebook.com`

#### Test D: URL Validation

1. **Bôi đen text**
2. **Nhấn Ctrl+K**
3. **Nhập URL không hợp lệ:** `abc`
4. **Nhấn Enter**
5. **Quan sát:**
   - ✅ Error message hiện: "URL không hợp lệ"
   - ✅ Màu đỏ
   - ✅ Không apply link
   - ✅ Popover vẫn mở

#### Test E: Keyboard Navigation

1. **Nhấn Ctrl+K** để mở popover
2. **Nhấn Tab** để di chuyển giữa inputs
3. **Nhấn Esc** để đóng
4. **Quan sát:**
   - ✅ Tab works
   - ✅ Esc đóng popover
   - ✅ Focus quay về editor

## 🎯 Sự Khác Biệt Chính

### ❌ Editor CŨ (Window Prompt)
```
Click Link → Window Prompt giữa màn hình → Nhập URL → OK
```
- Popup trắng của browser
- Giữa màn hình
- Không có validation
- Không có preview
- Không edit dễ dàng

### ✅ Editor MỚI (Floating Popover)
```
Ctrl+K → Floating popover gần cursor → Nhập URL → Enter
```
- Ô nổi đẹp, hiện đại
- Gần vị trí làm việc
- Có validation real-time
- Có preview bubble
- Edit/Remove/Open dễ dàng
- Keyboard shortcuts

## 🐛 Nếu Không Thấy Popover

### Debug Steps:

1. **Check console:**
   - F12 → Console tab
   - Có errors không?

2. **Check import:**
   ```tsx
   // Phải là:
   import RichTextEditor from "@/components/editor/EnhancedRichTextEditor";
   
   // KHÔNG phải:
   import RichTextEditor from "@/components/shared/RichTextEditor";
   ```

3. **Restart dev server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

4. **Clear browser cache:**
   - Ctrl+Shift+R (hard refresh)

5. **Check file saved:**
   - Đảm bảo file đã save
   - Check git status

## 📸 Visual Comparison

### Old Editor (Window Prompt):
```
┌─────────────────────────────────────┐
│  Browser Window Prompt              │
│  ┌───────────────────────────────┐  │
│  │ Enter URL:                    │  │
│  │ [____________________]        │  │
│  │                               │  │
│  │        [OK]    [Cancel]       │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### New Editor (Floating Popover):
```
Editor content here...
Selected text here ← [Floating Popover]
                     ┌──────────────────┐
                     │ URL              │
                     │ [example.com]    │
                     │                  │
                     │ [Áp dụng] [Hủy]  │
                     │                  │
                     │ Enter • Esc      │
                     └──────────────────┘
More content...
```

## ✅ Success Criteria

Nếu bạn thấy:
- ✅ Floating popover xuất hiện gần text/cursor
- ✅ Không phải window prompt
- ✅ Có validation errors
- ✅ Ctrl+K works
- ✅ Click link → preview bubble
- ✅ Có nút Sửa/Mở/Xóa

→ **Editor mới đang hoạt động đúng!** 🎉

## 🚨 Common Issues

### Issue 1: Vẫn thấy window prompt
**Cause:** Đang dùng old editor
**Fix:** Check import path

### Issue 2: Popover không hiện
**Cause:** BubbleMenu chưa render
**Fix:** Restart dev server

### Issue 3: Ctrl+K không hoạt động
**Cause:** Event listener chưa attach
**Fix:** Check console errors

## 📞 Need Help?

Check:
1. Console errors (F12)
2. Import path correct
3. Dev server running
4. File saved
5. Browser cache cleared
