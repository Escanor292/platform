# Link Fix - Quick Test Script

## 🧪 QUICK TEST (5 phút)

### Test 1: Link Bleeding (BUG CHÍNH) ⭐
```
1. Gõ: "Click here to learn more"
2. Bôi đen: "Click here"
3. Click 🔗 (hoặc Ctrl+K)
4. Nhập: "google.com"
5. Press: Enter
6. Click sau "here" (cuối link)
7. Gõ: " now"

✅ PASS nếu: "Click here" = link, " now" = plain text
❌ FAIL nếu: " now" cũng là link
```

### Test 2: Insert Link Without Selection
```
1. Đặt caret ở cuối paragraph
2. Click 🔗
3. Nhập: "google.com"
4. Press: Enter
5. Gõ: " is great"

✅ PASS nếu: "google.com" = link, " is great" = plain
❌ FAIL nếu: " is great" cũng là link
```

### Test 3: Edit Existing Link
```
1. Click vào link có sẵn
2. Click 🔗
3. Verify: URL hiện trong input
4. Sửa URL thành: "facebook.com"
5. Press: Enter
6. Gõ text sau link

✅ PASS nếu: Link updated, text mới là plain
❌ FAIL nếu: Text mới là link
```

### Test 4: Remove Link
```
1. Click vào link
2. Click 🔗
3. Click: "Xóa"
4. Gõ text sau

✅ PASS nếu: Text giữ nguyên, không còn href, text mới plain
❌ FAIL nếu: Text mới vẫn là link
```

### Test 5: Ctrl+K Shortcut
```
1. Bôi đen text
2. Press: Ctrl+K (Cmd+K on Mac)
3. Nhập URL
4. Press: Enter

✅ PASS nếu: Popover mở, link applied đúng
❌ FAIL nếu: Không mở hoặc mất selection
```

## 🎯 EXPECTED RESULTS

Tất cả 5 tests phải PASS ✅

Nếu có bất kỳ test nào FAIL ❌:
1. Check console errors
2. Verify đã import đúng từ `@/lib/editor/link-commands`
3. Verify LinkPopover đang dùng new commands
4. Check `unsetMark('link')` có được gọi không

## 🔍 DEBUG CHECKLIST

Nếu link vẫn bleeding:
```
[ ] Check link-commands.ts có `unsetMark('link')` không
[ ] Check LinkPopover import từ link-commands.ts
[ ] Check RichTextEditor import getLinkAtCursor từ link-commands
[ ] Check ProductionEditor import getLinkAtCursor từ link-commands
[ ] Check console có errors không
```

## 📊 VISUAL TEST

### Before Fix (Bug)
```
Type: "Click here to learn more"
Select: "Click here"
Apply link
Type: " now"

Result: "Click here now" ← ALL link ❌
```

### After Fix (Working)
```
Type: "Click here to learn more"
Select: "Click here"
Apply link
Type: " now"

Result: "Click here" = link, " now" = plain ✅
```

## 🚀 QUICK START

```bash
# 1. Start dev server
npm run dev

# 2. Open editor page
# Navigate to page with RichTextEditor or ProductionEditor

# 3. Run Test 1 (Link Bleeding)
# Follow steps above

# 4. Verify result
# Text after link should be plain text
```

## ✅ SUCCESS CRITERIA

**ALL of these must be true:**

1. ✅ Text sau link KHÔNG bị dính link
2. ✅ Selection không bị mất khi mở popover
3. ✅ Caret ở vị trí đúng sau apply
4. ✅ Edit link không tạo duplicate marks
5. ✅ Remove link cleanup state đúng
6. ✅ Ctrl+K shortcut hoạt động
7. ✅ Link works với bold/italic/heading/list
8. ✅ Multiple links work independently

## 🐛 KNOWN ISSUES (Should NOT happen)

If you see these, something is wrong:

❌ Text after link becomes link
❌ Selection lost when opening popover
❌ Caret jumps to wrong position
❌ Edit creates nested links
❌ Remove doesn't clear state
❌ Ctrl+K doesn't work
❌ Console errors

## 📞 TROUBLESHOOTING

### Issue: Link still bleeding
**Solution**: Check `unsetMark('link')` is called after every link operation

### Issue: Selection lost
**Solution**: Check `saveSelection()` and `restoreSelection()` are working

### Issue: Caret wrong position
**Solution**: Check `setTextSelection(to)` is called

### Issue: TypeScript errors
**Solution**: Check imports from `@/lib/editor/link-commands`

### Issue: Console errors
**Solution**: Check all files are saved and server restarted

---

**Test Duration**: ~5 minutes
**Critical Test**: Test 1 (Link Bleeding)
**Status**: Ready for Testing
