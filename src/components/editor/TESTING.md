# Testing Guide - Rich Text Editor

## Test Cases

### Case 1: Insert Link với Text Selection

**Steps:**
1. Bôi đen text "Xem thêm"
2. Bấm nút Link trên toolbar (hoặc Cmd/Ctrl+K)
3. Popover xuất hiện gần vùng text được chọn
4. Nhập URL: `https://example.com`
5. Bấm Enter hoặc nút "Áp dụng"

**Expected:**
- Popover hiện gần selection
- Focus vào input URL
- Text "Xem thêm" trở thành link
- Popover đóng lại
- Focus quay về editor

### Case 2: Insert Link không có Selection

**Steps:**
1. Đặt con trỏ ở cuối paragraph
2. Bấm Cmd/Ctrl+K
3. Popover hiện với 2 input fields
4. Nhập text: "Trang chủ"
5. Nhập URL: "example.com"
6. Bấm Enter

**Expected:**
- Popover hiện gần caret
- Có 2 input: text và URL
- URL được normalize thành `https://example.com`
- Link "Trang chủ" được chèn vào editor
- Popover đóng

### Case 3: Edit Existing Link

**Steps:**
1. Click vào link đã có
2. Preview bubble hiện ra
3. Bấm nút "Sửa"
4. Chỉnh sửa URL
5. Bấm Enter

**Expected:**
- Preview bubble hiện gần link
- Hiển thị URL hiện tại
- Chuyển sang edit mode
- URL cũ được preload
- Link được update

### Case 4: Invalid URL

**Steps:**
1. Bôi đen text
2. Mở link popover
3. Nhập URL: "abc"
4. Bấm Enter

**Expected:**
- Hiển thị error message
- Không apply link
- Popover vẫn mở
- Focus vẫn ở input

### Case 5: Selection Preservation

**Steps:**
1. Bôi đen text
2. Mở popover
3. Click vào input URL
4. Nhập URL
5. Bấm Apply

**Expected:**
- Selection trong editor được lưu
- Khi apply, link được gắn đúng vào text đã chọn
- Không bị mất selection

### Case 6: Remove Link

**Steps:**
1. Click vào link
2. Preview bubble hiện
3. Bấm nút "Xóa"

**Expected:**
- Link mark bị xóa
- Text content giữ nguyên
- Bubble đóng lại

### Case 7: Open Link

**Steps:**
1. Click vào link
2. Bấm nút "Mở"

**Expected:**
- Link mở trong tab mới
- Có noopener, noreferrer
- Bubble vẫn mở

### Case 8: Keyboard Navigation

**Steps:**
1. Mở popover
2. Dùng Tab để di chuyển
3. Bấm Esc

**Expected:**
- Tab di chuyển giữa inputs và buttons
- Esc đóng popover
- Focus management đúng

### Case 9: Click Outside

**Steps:**
1. Mở popover
2. Click ra ngoài popover

**Expected:**
- Popover đóng
- Không apply link
- Editor giữ nguyên state

### Case 10: URL Normalization

**Test inputs:**
- `google.com` → `https://google.com`
- `https://example.com` → `https://example.com`
- `http://test.com` → `http://test.com`
- `example.com/path` → `https://example.com/path`
- `  example.com  ` → `https://example.com` (trimmed)

**Expected:**
- Tất cả URLs được normalize đúng
- Whitespace được trim
- Protocol được thêm nếu thiếu

## Edge Cases

### Edge Case 1: Empty URL
- Input: ""
- Expected: Error "URL không được để trống"

### Edge Case 2: Empty Text (no selection)
- URL: "example.com"
- Text: ""
- Expected: Error "Vui lòng nhập text hiển thị"

### Edge Case 3: Multiple Links
- Chèn nhiều links liên tiếp
- Expected: Mỗi link hoạt động độc lập

### Edge Case 4: Link trong List
- Chèn link trong bullet list
- Expected: Link hoạt động bình thường

### Edge Case 5: Nested Formatting
- Bold text + link
- Expected: Cả bold và link đều hoạt động

### Edge Case 6: Long URL
- URL dài > 100 characters
- Expected: Hiển thị truncated trong preview

### Edge Case 7: Special Characters
- URL có query params: `example.com?foo=bar&baz=qux`
- Expected: URL được preserve đúng

### Edge Case 8: Rapid Open/Close
- Mở và đóng popover nhanh nhiều lần
- Expected: Không bị lag, không bị lỗi state

## Accessibility Testing

### Keyboard Only
- [ ] Tab navigation hoạt động
- [ ] Enter apply link
- [ ] Esc đóng popover
- [ ] Cmd/Ctrl+K mở popover

### Screen Reader
- [ ] ARIA labels đúng
- [ ] Focus states rõ ràng
- [ ] Announcements hợp lý

### Focus Management
- [ ] Auto-focus vào input khi mở
- [ ] Focus quay về editor sau khi đóng
- [ ] Focus ring visible

## Performance Testing

- [ ] Popover mở nhanh (< 100ms)
- [ ] Không lag khi typing
- [ ] Smooth animations
- [ ] Không memory leaks

## Browser Testing

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## Mobile Testing

- [ ] Touch events hoạt động
- [ ] Virtual keyboard không che popover
- [ ] Responsive layout
