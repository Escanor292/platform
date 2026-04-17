# Video Popover Fix - Summary

## ✅ Đã Sửa Xong

Đã áp dụng các fix tương tự LinkPopover cho VideoPopover để khắc phục các vấn đề về focus và interaction.

---

## 🐛 Vấn Đề Đã Fix

VideoPopover trước đây thiếu các fix quan trọng mà LinkPopover đã có:

1. **Click outside detection không robust**
   - Dùng `mousedown` thay vì `pointerdown`
   - Không dùng `composedPath()` để detect chính xác

2. **Input bị mất focus**
   - Không stop mouse events từ popover
   - Editor giành lại focus khi click vào input

3. **Reopen loop**
   - Không có ref để track state
   - Có thể bị mở lại nhiều lần

4. **Thiếu data attribute**
   - Không có `data-video-button` trên toolbar button
   - Không có `data-video-popover` trên popover element

---

## 🔧 Các Thay Đổi

### 1. VideoPopover.tsx

**Click Outside Detection - Robust**:
```typescript
// Chuyển từ mousedown sang pointerdown
// Dùng composedPath() để detect chính xác
const handlePointerDown = (event: PointerEvent) => {
  const path = event.composedPath();
  
  const isInsidePopover = path.some(el => 
    el === popoverRef.current || 
    (el as HTMLElement).closest?.('[data-video-popover]')
  );
  
  const isToolbarButton = path.some(el =>
    (el as HTMLElement).closest?.('[data-video-button]')
  );
  
  if (isInsidePopover || isToolbarButton) return;
  
  onClose();
};
```

**Stop Mouse Events**:
```typescript
const stopMouseEvents = (e: React.MouseEvent | React.PointerEvent) => {
  e.stopPropagation();
};

<div
  data-video-popover="true"
  onPointerDown={stopMouseEvents}
  onPointerUp={stopMouseEvents}
  onMouseDown={stopMouseEvents}
  onMouseUp={stopMouseEvents}
  onClick={stopMouseEvents}
>
```

### 2. EditorToolbar.tsx

**Added data-video-button attribute**:
```typescript
interface ToolbarButtonProps {
  // ...
  'data-video-button'?: string;
}

<ToolbarButton
  onClick={onVideoEmbed || (() => {})}
  data-video-button="true"
  title="Chèn video"
>
```

### 3. ProductionEditor.tsx

**Prevent Reopen Loop**:
```typescript
const isVideoPopoverOpenRef = useRef(false);

const handleVideoEmbed = useCallback(() => {
  if (isVideoPopoverOpenRef.current) {
    console.log('Video popover already open - ignoring');
    return;
  }
  
  isVideoPopoverOpenRef.current = true;
  setIsVideoPopoverOpen(true);
}, []);

const handleVideoPopoverClose = useCallback(() => {
  isVideoPopoverOpenRef.current = false;
  setIsVideoPopoverOpen(false);
}, []);
```

### 4. RichTextEditor.tsx

**Same fixes as ProductionEditor**:
- Added `useRef` import
- Added `isVideoPopoverOpenRef`
- Updated `addYoutube` handler
- Added `handleVideoPopoverClose` handler

---

## 🧪 Test Cases

### Test Case 1: Open Video Popover
**Steps**:
1. Click nút Video hoặc YouTube trên toolbar
2. Popover mở ra

**Expected**:
- ✅ Popover mở, input tự động focus
- ✅ Không có reopen loop
- ✅ Không có lỗi console

### Test Case 2: Input Interaction
**Steps**:
1. Mở video popover
2. Click vào ô input URL
3. Nhập URL YouTube (e.g., "https://youtube.com/watch?v=dQw4w9WgXcQ")
4. Click nút "Chèn video"

**Expected**:
- ✅ Input có thể focus và nhập được
- ✅ Popover không đóng khi click vào input
- ✅ Video được chèn vào editor
- ✅ Popover đóng sau khi chèn

### Test Case 3: Click Outside
**Steps**:
1. Mở video popover
2. Click ra ngoài popover (vào editor)

**Expected**:
- ✅ Popover đóng lại
- ✅ Không có lỗi console

### Test Case 4: Keyboard Shortcuts
**Steps**:
1. Mở video popover
2. Nhập URL
3. Bấm Enter để chèn
4. Mở popover lại
5. Bấm Escape để hủy

**Expected**:
- ✅ Enter chèn video
- ✅ Escape đóng popover

### Test Case 5: URL Validation
**Steps**:
1. Mở video popover
2. Nhập URL không hợp lệ (e.g., "google.com")
3. Bấm "Chèn video"

**Expected**:
- ✅ Hiển thị lỗi validation
- ✅ Popover không đóng
- ✅ Input vẫn focus

### Test Case 6: Valid YouTube URL
**Steps**:
1. Mở video popover
2. Nhập URL YouTube hợp lệ
3. Quan sát feedback

**Expected**:
- ✅ Hiển thị "✓ YouTube video detected"
- ✅ Màu xanh lá
- ✅ Không có lỗi

### Test Case 7: Prevent Reopen
**Steps**:
1. Mở video popover
2. Click lại nút Video trên toolbar

**Expected**:
- ✅ Popover không mở lại
- ✅ Console log: "Video popover already open - ignoring"

---

## 📁 Files Changed

1. **src/components/editor/VideoPopover.tsx**
   - Fixed click outside detection with `pointerdown` + `composedPath()`
   - Added `data-video-popover` attribute
   - Stop all mouse events to prevent bubbling
   - Added console logs for debugging

2. **src/components/editor/EditorToolbar.tsx**
   - Added `data-video-button` attribute to video button
   - Added `'data-video-button'?: string` to ToolbarButtonProps

3. **src/components/editor/ProductionEditor.tsx**
   - Added `isVideoPopoverOpenRef` to prevent reopen loop
   - Updated `handleVideoEmbed` with reopen check
   - Added `handleVideoPopoverClose` handler

4. **src/components/editor/RichTextEditor.tsx**
   - Added `useRef` import
   - Added `isVideoPopoverOpenRef`
   - Updated `addYoutube` handler
   - Added `handleVideoPopoverClose` handler

---

## 🎯 Kết Quả

VideoPopover giờ đây có:
- ✅ Robust click outside detection
- ✅ Stable input focus
- ✅ No reopen loop
- ✅ Proper event handling
- ✅ Consistent with LinkPopover behavior

---

## 🚀 Next Steps

1. Chạy dev server: `npm run dev`
2. Test tất cả các test cases ở trên
3. Verify video embedding hoạt động đúng
4. Kiểm tra không có lỗi console

---

**Status**: ✅ Complete - Ready for testing
**Last Updated**: Now
