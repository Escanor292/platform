# Testing Checklist - Rich Text Editor Migration

## 🎯 Quick Testing Guide

Checklist này giúp bạn test nhanh editor mới sau khi migration.

---

## ✅ Pre-Testing Setup

- [ ] Dev server đang chạy (`npm run dev`)
- [ ] Browser console mở (F12)
- [ ] Không có errors trong console

---

## 📝 Test 1: Demo Page

**URL:** `/demo/editor`

### Basic Functionality
- [ ] Page loads without errors
- [ ] Editor renders correctly
- [ ] Can type text
- [ ] Toolbar buttons visible

### Link Features
- [ ] Click Link button → popover appears
- [ ] Press `Ctrl+K` / `Cmd+K` → popover appears
- [ ] Popover appears near cursor (not center screen)
- [ ] Can type URL
- [ ] Press `Enter` → link applied
- [ ] Press `Esc` → popover closes
- [ ] Click outside → popover closes

### Link with Selection
- [ ] Select text "Xem thêm"
- [ ] Press `Ctrl+K`
- [ ] Popover shows only URL input (no text input)
- [ ] Type `example.com`
- [ ] Press `Enter`
- [ ] Text becomes link
- [ ] Link is blue and underlined

### Link without Selection
- [ ] Place cursor in editor
- [ ] Press `Ctrl+K`
- [ ] Popover shows 2 inputs (text + URL)
- [ ] Type text: "Trang chủ"
- [ ] Type URL: `example.com`
- [ ] Press `Enter`
- [ ] Link "Trang chủ" inserted
- [ ] URL is `https://example.com` (auto-added)

### Edit Existing Link
- [ ] Click on existing link
- [ ] Preview bubble appears
- [ ] Shows current URL
- [ ] Click "Sửa" button
- [ ] URL is pre-filled
- [ ] Change URL
- [ ] Press `Enter`
- [ ] Link updated

### Remove Link
- [ ] Click on link
- [ ] Click "Xóa" button
- [ ] Link removed
- [ ] Text remains

### Open Link
- [ ] Click on link
- [ ] Click "Mở" button
- [ ] Link opens in new tab

### URL Validation
- [ ] Try invalid URL: "abc"
- [ ] Error message appears
- [ ] Cannot apply link
- [ ] Try valid URL: "example.com"
- [ ] No error
- [ ] Link applied

---

## 🚀 Test 2: Campaign Create Page

**URL:** `/campaigns/create`

### Page Load
- [ ] Page loads without errors
- [ ] Editor renders in "Nội dung chi tiết" section
- [ ] Placeholder text shows
- [ ] All toolbar buttons visible

### Basic Editing
- [ ] Can type campaign description
- [ ] Bold/Italic/Underline work
- [ ] Headings work
- [ ] Lists work

### Link Insertion
- [ ] Select text in description
- [ ] Press `Ctrl+K`
- [ ] Floating popover appears
- [ ] Insert link
- [ ] Link works

### Form Submission
- [ ] Fill all required fields
- [ ] Add description with links
- [ ] Submit form
- [ ] Check if links are saved correctly

---

## 📊 Test 3: Campaign Update Section

**URL:** Navigate to any campaign → Click "Cập nhật" tab

### Page Load
- [ ] Update section loads
- [ ] Editor shows existing content
- [ ] Existing links are clickable
- [ ] Can edit content

### Edit Existing Content
- [ ] Can modify text
- [ ] Can add new links
- [ ] Can edit existing links
- [ ] Can remove links

### Save Changes
- [ ] Make changes
- [ ] Save update
- [ ] Refresh page
- [ ] Changes persisted
- [ ] Links still work

---

## ⌨️ Test 4: Keyboard Navigation

### Shortcuts
- [ ] `Ctrl+K` / `Cmd+K` opens link popover
- [ ] `Enter` applies link
- [ ] `Esc` closes popover
- [ ] `Tab` moves between inputs
- [ ] `Ctrl+B` for bold
- [ ] `Ctrl+I` for italic
- [ ] `Ctrl+Z` for undo
- [ ] `Ctrl+Y` for redo

### Focus Management
- [ ] Popover opens → input auto-focused
- [ ] Apply link → focus returns to editor
- [ ] Close popover → focus returns to editor

---

## 📱 Test 5: Mobile Responsiveness

**Test on mobile device or responsive mode (F12 → Toggle device)**

### Layout
- [ ] Editor responsive
- [ ] Toolbar wraps correctly
- [ ] Popover fits screen
- [ ] No horizontal scroll

### Touch Interaction
- [ ] Can tap to place cursor
- [ ] Can select text
- [ ] Can tap Link button
- [ ] Popover appears correctly
- [ ] Can type in inputs
- [ ] Virtual keyboard doesn't cover popover

---

## 🌐 Test 6: Cross-Browser

Test in multiple browsers:

### Chrome
- [ ] All features work
- [ ] No console errors
- [ ] Popover positioning correct

### Firefox
- [ ] All features work
- [ ] No console errors
- [ ] Popover positioning correct

### Safari (if available)
- [ ] All features work
- [ ] No console errors
- [ ] Popover positioning correct

### Edge
- [ ] All features work
- [ ] No console errors
- [ ] Popover positioning correct

---

## 🎨 Test 7: Visual & UX

### Popover Appearance
- [ ] Rounded corners
- [ ] Shadow visible
- [ ] Border visible
- [ ] Proper spacing
- [ ] Readable text
- [ ] Buttons styled correctly

### Animations
- [ ] Popover fades in smoothly
- [ ] No jarring movements
- [ ] Smooth transitions

### Positioning
- [ ] Popover near cursor/selection
- [ ] Doesn't overflow viewport
- [ ] Flips if near edge
- [ ] Proper offset (8px)

---

## 🔍 Test 8: Edge Cases

### Empty States
- [ ] Empty URL → error message
- [ ] Empty text (no selection) → error message
- [ ] Whitespace only → trimmed

### Special Characters
- [ ] URL with query params: `example.com?foo=bar`
- [ ] URL with hash: `example.com#section`
- [ ] URL with path: `example.com/path/to/page`

### Multiple Links
- [ ] Insert 3+ links in same paragraph
- [ ] Each link works independently
- [ ] Can edit each link separately

### Long Content
- [ ] Type 1000+ words
- [ ] Insert links throughout
- [ ] Scroll and insert link
- [ ] Popover still positioned correctly

---

## 🐛 Test 9: Error Scenarios

### Invalid URLs
- [ ] "abc" → error
- [ ] "123" → error
- [ ] "test" → error
- [ ] "http://" → error
- [ ] "https://" → error

### Valid URLs
- [ ] "example.com" → `https://example.com`
- [ ] "https://example.com" → `https://example.com`
- [ ] "http://example.com" → `http://example.com`
- [ ] "sub.example.com" → `https://sub.example.com`

### Network Issues
- [ ] Slow connection → editor still works
- [ ] Offline → editor still works (no external deps)

---

## ♿ Test 10: Accessibility

### Keyboard Only
- [ ] Can navigate entire editor with keyboard
- [ ] Can open popover with keyboard
- [ ] Can fill inputs with keyboard
- [ ] Can apply link with keyboard
- [ ] Can close popover with keyboard

### Screen Reader (if available)
- [ ] ARIA labels present
- [ ] Buttons announced correctly
- [ ] Inputs announced correctly
- [ ] Errors announced

### Focus Indicators
- [ ] Focus ring visible on inputs
- [ ] Focus ring visible on buttons
- [ ] Focus order logical

---

## 📊 Test Results Summary

### Pass Criteria
- [ ] All critical tests pass (Test 1-3)
- [ ] No console errors
- [ ] No visual glitches
- [ ] Keyboard navigation works
- [ ] Mobile responsive

### Issues Found
Document any issues here:

```
Issue 1: [Description]
Severity: [Critical/High/Medium/Low]
Steps to reproduce: [...]

Issue 2: [Description]
Severity: [Critical/High/Medium/Low]
Steps to reproduce: [...]
```

---

## ✅ Sign-off

**Tested by:** _______________
**Date:** _______________
**Browser(s):** _______________
**Device(s):** _______________

**Overall Status:**
- [ ] ✅ Pass - Ready for production
- [ ] ⚠️ Pass with minor issues - Can deploy
- [ ] ❌ Fail - Needs fixes before deploy

**Notes:**
```
[Add any additional notes here]
```

---

## 🚨 If Tests Fail

### Critical Issues (Cannot deploy)
- Editor doesn't render
- Cannot insert links
- Data loss on save
- Console errors breaking functionality

**Action:** Rollback immediately

### Non-Critical Issues (Can deploy)
- Minor visual glitches
- Edge case bugs
- Performance issues

**Action:** Create issues, fix in next sprint

---

## 📞 Need Help?

1. Check `LINK_EDITOR_USER_GUIDE.md` for usage
2. Check `TESTING.md` for detailed test cases
3. Check `EDITOR_MIGRATION_COMPLETE.md` for rollback
4. Check browser console for errors

---

**Happy Testing! 🧪**
