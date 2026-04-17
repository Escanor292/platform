# Link Popover - Quick Start Guide

## 🚀 Bắt đầu ngay

### 1. Mở editor trong browser
```bash
npm run dev
```

### 2. Test basic flow

#### Chèn link mới
1. Gõ text "click here" trong editor
2. Bôi đen text
3. Click icon 🔗 trong toolbar (hoặc Ctrl+K)
4. Nhập "example.com" trong popover
5. Press Enter

✅ **Kết quả**: "click here" trở thành link màu xanh

#### Chỉnh sửa link
1. Click vào link vừa tạo
2. Click icon 🔗
3. Sửa URL thành "google.com"
4. Click "Áp dụng"

✅ **Kết quả**: Link được update

#### Xóa link
1. Click vào link
2. Click icon 🔗
3. Click nút "Xóa" màu đỏ

✅ **Kết quả**: Link bị remove, text giữ nguyên

## 🎯 Key Points

### Popover Position
- ✅ Hiện **gần vùng text được chọn**
- ✅ Hiện **gần vị trí con trỏ** nếu không có selection
- ❌ KHÔNG hiện theo vị trí chuột
- ❌ KHÔNG hiện giữa màn hình

### URL Handling
```
Input: example.com
Output: https://example.com ✅

Input: www.google.com
Output: https://www.google.com ✅

Input: not a url
Output: Error message ❌
```

### Keyboard Shortcuts
- `Ctrl+K` / `Cmd+K` - Mở popover
- `Enter` - Áp dụng link
- `Escape` - Đóng popover

### Click Outside
- Click bên ngoài popover → Đóng
- Click vào editor → Đóng
- Click vào toolbar → Đóng

## 🧪 Quick Test Checklist

```
[ ] Bôi đen text → click link icon → popover hiện gần selection
[ ] Nhập URL → Enter → link được apply
[ ] Click vào link → click icon → hiện URL hiện tại
[ ] Sửa URL → "Áp dụng" → link được update
[ ] Click "Xóa" → link bị remove
[ ] Escape → popover đóng
[ ] Click outside → popover đóng
[ ] Nhập URL không hợp lệ → hiện error
```

## 📱 Test trên Mobile

1. Mở browser mobile
2. Long press để select text
3. Tap icon link
4. Nhập URL
5. Tap "Áp dụng"

## 🐛 Troubleshooting

### Popover không hiện
- Check console có error không
- Verify editor đang active
- Refresh page và thử lại

### Popover hiện sai vị trí
- Check parent container có `position: relative`
- Verify không có CSS conflict

### Input không focus
- Check không có element nào block focus
- Try click vào input manually

## 📚 Đọc thêm

- **Chi tiết implementation**: `LINK_POPOVER_REFACTOR.md`
- **Hướng dẫn sử dụng**: `src/components/editor/LINK_POPOVER_GUIDE.md`
- **Test cases đầy đủ**: `src/components/editor/LINK_POPOVER_TEST_CASES.md`

## 🎉 Done!

Bạn đã sẵn sàng sử dụng Link Popover! 

Nếu có vấn đề, check documentation hoặc console errors.
