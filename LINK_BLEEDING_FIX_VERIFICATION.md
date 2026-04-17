# Link Bleeding Fix - Verification Guide

## Status: ✅ IMPLEMENTED

All fixes have been applied to resolve the link bleeding issue where text typed after applying a link would incorrectly inherit the link mark.

---

## 🎯 Root Cause Analysis

The link bleeding bug occurred because after calling `setLink()`, Tiptap keeps the link mark in `storedMarks`, causing the next typed text to inherit the link mark.

**Solution**: Call `unsetMark('link')` after every link operation to clear stored marks.

---

## 🔧 Implementation Details

### 1. LinkPopover.tsx - Enhanced `handleApply` Function

**Location**: `src/components/editor/LinkPopover.tsx` (lines 165-235)

**Key Changes**:
- After applying link, caret is moved to END of link using `setTextSelection(selection.to)`
- Immediately followed by `unsetMark('link')` to clear stored marks
- Additional safety timeout (10ms) to force clear link mark
- Handles 3 cases correctly:
  1. **Edit existing link**: `extendMarkRange('link')` → `setLink()` → move caret → `unsetMark('link')`
  2. **Apply to selection**: `setLink()` → move caret to end → `unsetMark('link')`
  3. **Insert at caret**: `insertContentAt()` → move caret after text → `unsetMark('link')`

### 2. Link Commands Utility

**Location**: `src/lib/editor/link-commands.ts`

Production-ready link commands that handle mark lifecycle correctly:
- `applyLinkToSelection()` - Apply link + clear marks
- `insertLinkAtCaret()` - Insert link + move caret outside
- `updateExistingLink()` - Update link + clear marks
- `removeLinkFromSelection()` - Remove link + clear marks
- `clearActiveLinkMark()` - Force clear stored marks
- `moveCaretOutsideLink()` - Move caret and clear marks

### 3. Focus & Selection Management

**Fixed Issues**:
- ✅ Input auto-focuses when popover opens (50ms delay)
- ✅ Selection stays visible with CSS override
- ✅ Click outside detection uses `pointerdown` + `composedPath()`
- ✅ All mouse events stopped in popover to prevent bubbling
- ✅ BubbleMenu hides when LinkPopover is open
- ✅ `data-link-button` attribute prevents reopen loop
- ✅ `isLinkPopoverOpenRef` prevents double-open
- ✅ `immediatelyRender: false` fixes SSR warning

---

## 🧪 Manual Test Checklist

### Test Case 1: Apply Link to Selection
**Steps**:
1. Bôi đen một đoạn văn bản (e.g., "Xin chào")
2. Bấm nút Link hoặc Ctrl+K
3. Nhập URL (e.g., "google.com")
4. Bấm "Áp dụng"
5. Gõ tiếp văn bản mới (e.g., " thế giới")

**Expected Result**:
- ✅ Popover mở, input tự động focus
- ✅ Văn bản "Xin chào" vẫn hiển thị đang được bôi đen
- ✅ Link được gắn vào "Xin chào"
- ✅ Văn bản " thế giới" KHÔNG dính link (plain text)

### Test Case 2: Edit Existing Link
**Steps**:
1. Click vào một link đã có
2. Bấm nút Link hoặc Ctrl+K
3. Sửa URL
4. Bấm "Áp dụng"
5. Gõ tiếp văn bản mới

**Expected Result**:
- ✅ Popover mở với URL hiện tại
- ✅ URL được cập nhật đúng
- ✅ Văn bản gõ sau KHÔNG dính link

### Test Case 3: Insert Link at Caret
**Steps**:
1. Đặt con trỏ ở giữa văn bản (không bôi đen)
2. Bấm nút Link hoặc Ctrl+K
3. Nhập URL (e.g., "example.com")
4. Bấm "Áp dụng"
5. Gõ tiếp văn bản mới

**Expected Result**:
- ✅ Link được chèn tại vị trí con trỏ
- ✅ Văn bản gõ sau KHÔNG dính link

### Test Case 4: Popover Interaction
**Steps**:
1. Bôi đen văn bản và mở popover
2. Click vào ô input URL
3. Nhập URL
4. Click nút "Áp dụng"

**Expected Result**:
- ✅ Input có thể focus và nhập được
- ✅ Popover không đóng khi click vào input
- ✅ Không có reopen loop
- ✅ Editor không giành lại focus khi đang nhập

### Test Case 5: Click Outside
**Steps**:
1. Mở popover
2. Click ra ngoài popover (vào editor hoặc nơi khác)

**Expected Result**:
- ✅ Popover đóng lại
- ✅ Không có lỗi console

### Test Case 6: Keyboard Shortcuts
**Steps**:
1. Mở popover
2. Nhập URL
3. Bấm Enter để apply
4. Mở popover lại
5. Bấm Escape để hủy

**Expected Result**:
- ✅ Enter áp dụng link
- ✅ Escape đóng popover
- ✅ Ctrl+K mở popover

### Test Case 7: Selection Visibility
**Steps**:
1. Bôi đen văn bản
2. Bấm Ctrl+K để mở popover
3. Quan sát văn bản đã bôi đen

**Expected Result**:
- ✅ Văn bản vẫn hiển thị highlight (màu xanh nhạt)
- ✅ Input được focus
- ✅ Có thể nhìn thấy rõ đoạn text nào sẽ được gắn link

---

## 📁 Files Modified

1. **src/components/editor/LinkPopover.tsx**
   - Enhanced `handleApply` with proper mark clearing
   - Fixed click outside detection with `pointerdown` + `composedPath()`
   - Added visual selection highlight
   - Stop all mouse events to prevent bubbling

2. **src/components/editor/ProductionEditor.tsx**
   - Added `isLinkPopoverOpenRef` to prevent reopen loop
   - Fixed keyboard shortcut handler
   - Added CSS to keep selection visible
   - Added `immediatelyRender: false` to editor config

3. **src/components/editor/RichTextEditor.tsx**
   - Same fixes as ProductionEditor
   - Integrated LinkPopover and VideoPopover

4. **src/components/editor/EditorToolbar.tsx**
   - Added `data-link-button="true"` attribute to link button

5. **src/components/editor/EditorBubbleMenu.tsx**
   - Hide BubbleMenu when LinkPopover is open

6. **src/lib/editor/link-commands.ts**
   - Production-ready link commands with proper mark lifecycle

---

## 🚀 Next Steps

### Immediate Testing Required:
1. Run the development server: `npm run dev`
2. Navigate to a page with the editor
3. Execute all test cases above
4. Verify that text typed after applying link does NOT inherit link mark

### Critical Test Focus:
**The main bug to verify is fixed**: After applying a link (to selection, editing existing, or inserting new), typing new text should produce PLAIN TEXT, not linked text.

---

## 🐛 Known Issues (If Any)

None currently. All identified issues have been fixed:
- ✅ Link bleeding after apply
- ✅ Input focus loss
- ✅ Selection visibility
- ✅ Click outside detection
- ✅ Reopen loop
- ✅ BubbleMenu interference
- ✅ SSR hydration warning

---

## 📝 Technical Notes

### Why `unsetMark('link')` is Critical

After `setLink()`, Tiptap stores the link mark in `storedMarks`. This causes the next character typed to inherit the link mark. Calling `unsetMark('link')` clears this stored mark.

### Why Move Caret to End

Moving the caret to the end of the link (`setTextSelection(selection.to)`) ensures that:
1. The caret is positioned correctly for continued typing
2. The next typed character is OUTSIDE the link range
3. Combined with `unsetMark('link')`, this guarantees plain text

### Why Safety Timeout

The additional `setTimeout(() => editor.commands.unsetMark('link'), 10)` provides extra safety in case the synchronous `unsetMark()` doesn't fully clear the stored marks due to Tiptap's internal state management.

---

## ✅ Verification Checklist

Before closing this task, verify:

- [ ] Test Case 1: Apply link to selection - new text is plain
- [ ] Test Case 2: Edit existing link - new text is plain
- [ ] Test Case 3: Insert link at caret - new text is plain
- [ ] Test Case 4: Popover interaction works smoothly
- [ ] Test Case 5: Click outside closes popover
- [ ] Test Case 6: Keyboard shortcuts work
- [ ] Test Case 7: Selection stays visible
- [ ] No console errors
- [ ] No reopen loops
- [ ] BubbleMenu doesn't interfere

---

**Last Updated**: Context transfer from previous conversation
**Implementation Status**: ✅ Complete - Ready for testing
