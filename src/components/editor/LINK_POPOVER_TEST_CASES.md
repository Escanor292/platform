# Link Popover - Test Cases

## ✅ Manual Test Checklist

### 1. Basic Insert Link

#### Test 1.1: Insert link with text selection
**Steps:**
1. Mở editor
2. Gõ text "click here"
3. Bôi đen "click here"
4. Click icon link trong toolbar
5. Nhập "example.com"
6. Press Enter

**Expected:**
- Popover hiện gần vùng text được bôi đen
- Input được focus và trống
- Sau khi Enter, "click here" trở thành link màu xanh
- Hover vào link thấy underline
- Link href là `https://example.com`

#### Test 1.2: Insert link without selection
**Steps:**
1. Đặt cursor trong editor (không bôi đen gì)
2. Click icon link
3. Nhập "google.com"
4. Press Enter

**Expected:**
- Popover hiện gần vị trí cursor
- Sau khi Enter, text "google.com" được insert với link
- Link href là `https://google.com`

#### Test 1.3: Insert link with Ctrl+K
**Steps:**
1. Bôi đen text
2. Press Ctrl+K (hoặc Cmd+K trên Mac)
3. Nhập URL
4. Press Enter

**Expected:**
- Popover mở bằng keyboard shortcut
- Hoạt động giống click icon

### 2. Edit Existing Link

#### Test 2.1: Edit link URL
**Steps:**
1. Tạo link "example.com"
2. Click vào trong link
3. Click icon link
4. Sửa thành "google.com"
5. Click "Áp dụng"

**Expected:**
- Popover hiện với URL hiện tại "https://example.com"
- Có nút "Xóa" màu đỏ
- Sau khi apply, link được update thành "https://google.com"
- Text giữ nguyên

#### Test 2.2: Remove link
**Steps:**
1. Tạo link "example.com"
2. Click vào trong link
3. Click icon link
4. Click nút "Xóa"

**Expected:**
- Link bị remove
- Text "example.com" giữ nguyên nhưng không còn là link
- Không còn màu xanh, không còn underline

### 3. Validation

#### Test 3.1: Valid URLs
**Test các URL sau:**
- `example.com` → `https://example.com` ✅
- `www.example.com` → `https://www.example.com` ✅
- `https://example.com` → `https://example.com` ✅
- `http://example.com` → `http://example.com` ✅
- `example.com/path` → `https://example.com/path` ✅
- `example.com?query=1` → `https://example.com?query=1` ✅

**Expected:**
- Tất cả được accept
- Auto-add https:// nếu thiếu protocol

#### Test 3.2: Invalid URLs
**Test các input sau:**
- `` (empty) → Error: "URL không được để trống"
- `not a url` → Error: "URL không hợp lệ"
- `just text` → Error: "URL không hợp lệ"
- `123` → Error: "URL không hợp lệ"

**Expected:**
- Hiển thị error message màu đỏ dưới input
- Border input chuyển màu đỏ
- Không apply link khi có error

### 4. Keyboard Shortcuts

#### Test 4.1: Enter to apply
**Steps:**
1. Mở popover
2. Nhập URL hợp lệ
3. Press Enter

**Expected:**
- Link được apply
- Popover đóng
- Focus quay về editor

#### Test 4.2: Escape to cancel
**Steps:**
1. Mở popover
2. Nhập URL
3. Press Escape

**Expected:**
- Popover đóng
- Không apply link
- Focus quay về editor

#### Test 4.3: Ctrl+K to open
**Steps:**
1. Bôi đen text
2. Press Ctrl+K (Cmd+K on Mac)

**Expected:**
- Popover mở
- Input được focus

### 5. Click Outside

#### Test 5.1: Click outside to close
**Steps:**
1. Mở popover
2. Click vào editor bên ngoài popover
3. Click vào toolbar
4. Click vào footer

**Expected:**
- Popover đóng trong tất cả cases
- Không apply link

#### Test 5.2: Click inside popover
**Steps:**
1. Mở popover
2. Click vào input
3. Click vào buttons

**Expected:**
- Popover KHÔNG đóng
- Chỉ đóng khi click bên ngoài

### 6. Position & Layout

#### Test 6.1: Popover position with selection
**Steps:**
1. Bôi đen text ở đầu editor
2. Click link icon
3. Bôi đen text ở giữa editor
4. Click link icon
5. Bôi đen text ở cuối editor
6. Click link icon

**Expected:**
- Popover luôn hiện gần vùng selection
- Không bị che bởi toolbar
- Không tràn ra ngoài viewport

#### Test 6.2: Popover position with scroll
**Steps:**
1. Tạo content dài để editor có scrollbar
2. Scroll xuống giữa
3. Bôi đen text
4. Click link icon

**Expected:**
- Popover hiện đúng vị trí gần selection
- Không bị lệch do scroll

#### Test 6.3: Multiple editors
**Steps:**
1. Render 2 editors trên cùng page
2. Mở popover ở editor 1
3. Mở popover ở editor 2

**Expected:**
- Mỗi editor có popover riêng
- Không conflict với nhau

### 7. Edge Cases

#### Test 7.1: Very long URL
**Steps:**
1. Nhập URL rất dài (>200 chars)
2. Apply

**Expected:**
- URL được accept
- Input có thể scroll horizontal
- Link hoạt động bình thường

#### Test 7.2: Special characters in URL
**Test:**
- `example.com/path?query=1&foo=bar`
- `example.com/path#section`
- `example.com/path%20with%20spaces`

**Expected:**
- Tất cả được accept và hoạt động

#### Test 7.3: Rapid open/close
**Steps:**
1. Click link icon
2. Press Escape ngay
3. Click link icon lại
4. Press Escape
5. Repeat 5 lần

**Expected:**
- Không có memory leak
- Không có error trong console
- Popover hoạt động bình thường

#### Test 7.4: Link in list
**Steps:**
1. Tạo bullet list
2. Bôi đen text trong list item
3. Click link icon
4. Apply link

**Expected:**
- Popover hiện đúng vị trí
- Link được apply trong list item

#### Test 7.5: Link in heading
**Steps:**
1. Tạo heading (H1 hoặc H2)
2. Bôi đen text trong heading
3. Apply link

**Expected:**
- Link hoạt động trong heading
- Style heading được giữ nguyên

#### Test 7.6: Nested formatting
**Steps:**
1. Tạo text bold + italic
2. Bôi đen text
3. Apply link

**Expected:**
- Link được apply
- Bold + italic được giữ nguyên
- Link có thể bold + italic + underline

### 8. Mobile/Touch

#### Test 8.1: Touch to select
**Steps (on mobile):**
1. Long press để select text
2. Tap link icon
3. Enter URL
4. Tap "Áp dụng"

**Expected:**
- Popover hiện đúng vị trí
- Keyboard mở khi focus input
- Touch outside để đóng

### 9. Accessibility

#### Test 9.1: Tab navigation
**Steps:**
1. Mở popover
2. Press Tab
3. Press Tab again

**Expected:**
- Tab qua input → "Áp dụng" → "Hủy" → "Xóa" (nếu có)
- Focus visible rõ ràng

#### Test 9.2: Screen reader
**Steps:**
1. Dùng screen reader
2. Navigate đến link icon
3. Activate

**Expected:**
- Screen reader đọc "Chèn liên kết"
- Input có label rõ ràng

### 10. Performance

#### Test 10.1: Large document
**Steps:**
1. Tạo document với 1000+ words
2. Scroll xuống giữa
3. Bôi đen text
4. Click link icon

**Expected:**
- Popover mở ngay lập tức (<100ms)
- Không lag
- Position đúng

#### Test 10.2: Multiple rapid operations
**Steps:**
1. Bôi đen text → apply link
2. Bôi đen text khác → apply link
3. Edit link → update
4. Remove link
5. Repeat 10 lần

**Expected:**
- Không có memory leak
- Performance ổn định
- Không có error

## 🐛 Known Issues / Limitations

1. **Viewport bounds**: Popover có thể tràn ra ngoài viewport nếu selection gần edge
   - **Solution**: Cần thêm logic để flip position

2. **Mobile keyboard**: Keyboard có thể che popover
   - **Solution**: Có thể cần adjust position khi keyboard mở

3. **RTL languages**: Chưa test với ngôn ngữ RTL
   - **Solution**: Cần test và adjust nếu cần

## 📊 Test Coverage

- [ ] Basic functionality: 100%
- [ ] Validation: 100%
- [ ] Keyboard shortcuts: 100%
- [ ] Click outside: 100%
- [ ] Position & layout: 80% (cần test viewport bounds)
- [ ] Edge cases: 90%
- [ ] Mobile: 70% (cần test thêm)
- [ ] Accessibility: 60% (cần improve)
- [ ] Performance: 90%

## 🎯 Priority Test Cases

**Must test before production:**
1. ✅ Insert link with selection
2. ✅ Insert link without selection
3. ✅ Edit existing link
4. ✅ Remove link
5. ✅ URL validation
6. ✅ Keyboard shortcuts (Enter, Escape, Ctrl+K)
7. ✅ Click outside
8. ✅ Position calculation

**Nice to have:**
- Mobile touch
- Accessibility
- RTL languages
- Viewport bounds handling
