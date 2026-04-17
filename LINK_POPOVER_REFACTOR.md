# Link Popover Refactor - Hoàn thành ✅

## 📋 Tổng quan

Đã refactor tính năng chèn/chỉnh sửa link trong Rich Text Editor từ `window.prompt()` sang **floating inline link popover** hiện đại, bám theo vị trí caret/selection.

## ✨ Tính năng mới

### 1. LinkPopover Component
- **Vị trí**: `src/components/editor/LinkPopover.tsx`
- **Chức năng**: Floating popover hiện đại để nhập/chỉnh sửa link
- **Anchor**: Bám theo vị trí caret/selection trong editor (KHÔNG theo chuột)

### 2. UX Cases được xử lý

#### Case 1: Có bôi đen text
- User bôi đen text → bấm icon link
- Popover hiện gần vùng selection
- Nhập URL → Enter hoặc click "Áp dụng"
- Link được apply vào text đã chọn

#### Case 2: Chỉ có caret (không bôi đen)
- User đặt con trỏ trong editor → bấm icon link
- Popover hiện gần vị trí caret
- Nhập URL → Enter
- URL được chèn vào làm cả text và link

#### Case 3: Đang đứng trong link có sẵn
- Caret nằm trong link → bấm icon link
- Popover hiện URL hiện tại (edit mode)
- Có thể:
  - Sửa URL → "Áp dụng"
  - Xóa link → nút "Xóa" màu đỏ
  - Hủy → "Hủy" hoặc Escape

## 🎯 Tính năng chính

### Positioning
- ✅ Bám theo `editor.view.coordsAtPos()` - vị trí selection/caret
- ✅ KHÔNG dùng mouse position (`clientX`, `clientY`)
- ✅ Tính toán relative đến editor container
- ✅ Hiện bên dưới selection/caret với offset 8px

### Validation
- ✅ Real-time validation khi nhập
- ✅ Tự động thêm `https://` nếu thiếu protocol
- ✅ Hiển thị lỗi inline (không dùng alert)
- ✅ Ví dụ: `example.com` → `https://example.com`

### Keyboard Shortcuts
- ✅ `Enter` - Áp dụng link
- ✅ `Escape` - Đóng popover
- ✅ `Ctrl/Cmd + K` - Mở popover (giữ nguyên)

### Click Outside
- ✅ Click bên ngoài popover để đóng
- ✅ Có delay 100ms để tránh đóng ngay khi mở

### UI/UX
- ✅ Input autofocus + select all khi mở
- ✅ Hiển thị hint keyboard shortcuts
- ✅ Nút "Xóa" chỉ hiện trong edit mode
- ✅ Tailwind CSS styling hiện đại
- ✅ Shadow, border, rounded corners

## 📁 Files đã sửa

### 1. `src/components/editor/LinkPopover.tsx` (NEW)
```typescript
// Component chính - Floating link popover
- calculatePosition(): Tính vị trí dựa trên editor selection
- handleApply(): Validate và apply link
- handleRemove(): Xóa link
- useClickOutside: Hook xử lý click outside
- useKeyboard: Hook xử lý Enter/Escape
```

### 2. `src/components/editor/RichTextEditor.tsx` (UPDATED)
```typescript
// Thay thế window.prompt bằng LinkPopover
- Thêm state: isLinkPopoverOpen, linkPopoverInitialUrl, isLinkEditMode
- handleLinkClick(): Mở popover thay vì prompt
- Render LinkPopover trong editor container
```

### 3. `src/components/editor/ProductionEditor.tsx` (UPDATED)
```typescript
// Tương tự RichTextEditor
- Thêm state cho LinkPopover
- handleLinkInsert(): Mở popover
- Render LinkPopover với z-index cao hơn upload overlay
```

## 🔧 Cách hoạt động

### 1. Lấy vị trí caret/selection
```typescript
const { state, view } = editor;
const { from, to } = state.selection;
const coords = view.coordsAtPos(to); // Tọa độ DOM

// Tính relative đến editor container
const editorRect = view.dom.getBoundingClientRect();
const top = coords.bottom - editorRect.top + 8;
const left = coords.left - editorRect.left;
```

### 2. Apply link logic
```typescript
// Có selection → apply vào selection
if (hasSelection) {
  editor.chain().focus()
    .extendMarkRange('link')
    .setLink({ href: url })
    .run();
}
// Không có selection → insert URL làm text
else {
  editor.chain().focus()
    .insertContent({
      type: 'text',
      text: url,
      marks: [{ type: 'link', attrs: { href: url } }]
    })
    .run();
}
```

### 3. Edit mode detection
```typescript
const existingUrl = editor.getAttributes('link').href;
if (existingUrl) {
  // Edit mode - show Remove button
  setIsLinkEditMode(true);
  setLinkPopoverInitialUrl(existingUrl);
}
```

## ✅ Test Checklist

### Basic Functionality
- [ ] Bôi đen text → click icon link → popover hiện gần selection
- [ ] Nhập URL → Enter → link được apply
- [ ] Click icon link không bôi đen → popover hiện gần caret
- [ ] Nhập URL → link được insert với URL làm text
- [ ] Click vào link có sẵn → click icon → popover hiện URL hiện tại

### Validation
- [ ] Nhập `example.com` → tự động thành `https://example.com`
- [ ] Nhập URL không hợp lệ → hiện lỗi inline
- [ ] Để trống URL → hiện lỗi "không được để trống"
- [ ] URL hợp lệ → không có lỗi

### Keyboard Shortcuts
- [ ] `Enter` trong input → apply link
- [ ] `Escape` → đóng popover
- [ ] `Ctrl/Cmd + K` → mở popover

### Click Outside
- [ ] Click bên ngoài popover → đóng
- [ ] Click vào editor → đóng popover

### Edit Mode
- [ ] Đứng trong link → click icon → hiện URL hiện tại
- [ ] Sửa URL → "Áp dụng" → link được update
- [ ] Click "Xóa" → link bị remove, text giữ nguyên
- [ ] Nút "Xóa" chỉ hiện khi edit link

### Edge Cases
- [ ] Popover không bị lệch khi editor scroll
- [ ] Popover không bị che bởi toolbar
- [ ] Popover không bị tràn ra ngoài viewport
- [ ] Input được focus ngay khi mở
- [ ] Text trong input được select all khi mở edit mode
- [ ] Không mất selection khi mở popover
- [ ] Multiple editors trên cùng page hoạt động độc lập

### Cross-browser
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

## 🎨 UI Preview

```
┌─────────────────────────────────────┐
│ 🔗 Chèn liên kết                    │
├─────────────────────────────────────┤
│ [example.com hoặc https://...     ] │
│                                     │
│ [✓ Áp dụng] [✗ Hủy]      [🗑️ Xóa]  │
│                                     │
│ Enter để áp dụng, Esc để hủy        │
└─────────────────────────────────────┘
```

## 🚀 Cải tiến so với trước

| Trước | Sau |
|-------|-----|
| `window.prompt()` | Floating popover hiện đại |
| Popup giữa màn hình | Bám theo caret/selection |
| Không có validation real-time | Validation inline |
| Dùng `alert()` cho lỗi | Hiển thị lỗi trong popover |
| Không có visual feedback | UI đẹp với Tailwind |
| Không có keyboard hints | Hiển thị Enter/Esc hints |
| Không có nút Remove | Nút "Xóa" trong edit mode |

## 📝 Notes

- YouTube/Vimeo embed vẫn dùng `window.prompt()` - có thể refactor sau nếu cần
- LinkPopover có `z-index: 50` để hiện trên các element khác
- Position calculation fallback về `{top: 50, left: 50}` nếu có lỗi
- Click outside có delay 100ms để tránh close ngay khi open

## 🎯 Kết luận

Đã hoàn thành refactor tính năng insert/edit link với:
- ✅ Floating popover bám theo caret/selection (KHÔNG theo chuột)
- ✅ UX hiện đại giống Notion/Medium/Tiptap
- ✅ Validation real-time
- ✅ Keyboard shortcuts
- ✅ Click outside to close
- ✅ Edit mode với nút Remove
- ✅ Không dùng `window.prompt()` hay `alert()`
- ✅ Production-ready code với TypeScript

Ready for testing! 🚀
