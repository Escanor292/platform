# 📋 Rich Text Editor - Manual Test Checklist

## ✅ Pre-Test Setup

- [ ] Clear browser cache
- [ ] Test in Chrome, Firefox, Safari
- [ ] Test on mobile device (iOS/Android)
- [ ] Open browser console to check for errors
- [ ] Navigate to `/demo/production-editor`

---

## 🎯 CRITICAL TESTS (Must Pass)

### 1. Basic Typing & Selection

- [ ] **Type text** - Should be smooth, no lag
- [ ] **Select text** - Selection should be stable
- [ ] **Select all (Ctrl+A)** - Should select all content
- [ ] **Copy/paste** - Should work correctly
- [ ] **Undo/Redo (Ctrl+Z/Ctrl+Shift+Z)** - Should work
- [ ] **Delete text** - Should work normally
- [ ] **Backspace at start of line** - Should merge with previous line

### 2. Paste Handling (CRITICAL - XSS Risk)

- [ ] **Paste plain text** - Should work
- [ ] **Paste from Word** - Should strip formatting correctly
- [ ] **Paste from Google Docs** - Should work
- [ ] **Paste HTML with scripts** - Should strip `<script>` tags
- [ ] **Paste with inline events** - Should strip `onclick` etc.
- [ ] **Paste malicious iframe** - Should block or sanitize
- [ ] **Paste very long content** - Should not crash

### 3. Keyboard Shortcuts

- [ ] **Ctrl+B** - Bold (should not conflict with browser bookmark)
- [ ] **Ctrl+I** - Italic
- [ ] **Ctrl+U** - Underline (should not conflict with view source)
- [ ] **Ctrl+K** - Link (should not conflict with browser search)
- [ ] **Ctrl+E** - Inline code
- [ ] **Ctrl+Shift+8** - Bullet list
- [ ] **Ctrl+Shift+7** - Numbered list
- [ ] **Ctrl+Z** - Undo
- [ ] **Ctrl+Shift+Z** - Redo
- [ ] **Tab in list** - Should indent (if supported)
- [ ] **Shift+Tab in list** - Should outdent (if supported)

### 4. Autosave & State Management

- [ ] **Type and wait 2 seconds** - Should show "Đang lưu..."
- [ ] **After save** - Should show "Đã lưu vừa xong"
- [ ] **Rapid typing** - Should debounce saves (not save on every keystroke)
- [ ] **Network error** - Should show error state
- [ ] **Unmount component** - Should not cause console errors
- [ ] **External content update** - Editor should sync with prop changes

### 5. Image Upload

- [ ] **Click image button** - File picker should open
- [ ] **Upload valid image (< 5MB)** - Should upload and insert
- [ ] **Upload large image (> 5MB)** - Should show error
- [ ] **Upload non-image file** - Should show error
- [ ] **Upload during typing** - Should show loading overlay
- [ ] **Cancel upload** - Should handle gracefully
- [ ] **Multiple uploads** - Should work sequentially

### 6. Link Insertion

- [ ] **Select text + Ctrl+K** - Should prompt for URL
- [ ] **Enter valid URL** - Should create link
- [ ] **Enter invalid URL** - Should show error
- [ ] **Enter URL without https://** - Should add https://
- [ ] **Click existing link + Ctrl+K** - Should show current URL
- [ ] **Empty URL** - Should remove link
- [ ] **Cancel prompt** - Should do nothing
- [ ] **Link opens in new tab** - Should have `target="_blank"`

---

## 🎨 UI/UX TESTS

### 7. Toolbar

- [ ] **Desktop toolbar** - All buttons visible
- [ ] **Mobile toolbar** - Simplified, scrollable
- [ ] **Button states** - Active state shows correctly
- [ ] **Disabled buttons** - Undo/redo disabled when appropriate
- [ ] **Tooltips** - Show on hover
- [ ] **Sticky toolbar** - Stays at top when scrolling
- [ ] **Toolbar doesn't cover content** - Proper spacing

### 8. Bubble Menu

- [ ] **Select text** - Bubble menu appears
- [ ] **Click without selection** - Bubble menu doesn't appear
- [ ] **Select in code block** - Bubble menu doesn't appear
- [ ] **Bubble menu positioning** - Doesn't go off-screen
- [ ] **Click bubble button** - Applies formatting
- [ ] **Deselect text** - Bubble menu disappears

### 9. Empty State & Placeholder

- [ ] **Empty editor** - Placeholder shows
- [ ] **Focus empty editor** - Placeholder color changes
- [ ] **Type first character** - Placeholder disappears
- [ ] **Delete all content** - Placeholder reappears
- [ ] **Placeholder text** - Correct for context (campaign, FAQ, etc.)

### 10. Word/Character Count

- [ ] **Type text** - Count updates (debounced)
- [ ] **Paste text** - Count updates
- [ ] **Delete text** - Count updates
- [ ] **Count accuracy** - Matches actual content
- [ ] **Near limit** - Shows warning (if implemented)
- [ ] **Over limit** - Prevents typing (if implemented)

---

## 📱 MOBILE TESTS

### 11. Mobile UX

- [ ] **Toolbar usable** - Buttons not too small
- [ ] **Toolbar doesn't cover keyboard** - Proper positioning
- [ ] **Typing smooth** - No lag on mobile
- [ ] **Selection works** - Can select text on touch
- [ ] **Paste works** - Long-press paste works
- [ ] **Image upload** - Camera/gallery picker works
- [ ] **Zoom disabled** - Page doesn't zoom on input focus
- [ ] **Landscape mode** - Works correctly
- [ ] **Scroll behavior** - Smooth scrolling

---

## 🎯 FORMATTING TESTS

### 12. Text Formatting

- [ ] **Bold** - Works, toggles correctly
- [ ] **Italic** - Works, toggles correctly
- [ ] **Underline** - Works, toggles correctly
- [ ] **Strikethrough** - Works, toggles correctly
- [ ] **Inline code** - Works, styled correctly
- [ ] **Highlight** - Works, yellow background
- [ ] **Combine formats** - Bold + italic works
- [ ] **Remove formatting** - Can remove all formatting

### 13. Headings

- [ ] **H1** - Large, bold
- [ ] **H2** - Medium, bold
- [ ] **H3** - Small, bold
- [ ] **Toggle heading** - Can toggle on/off
- [ ] **Heading in list** - Should work (or be prevented)

### 14. Lists

- [ ] **Bullet list** - Creates bullets
- [ ] **Numbered list** - Creates numbers
- [ ] **Task list** - Creates checkboxes
- [ ] **Check task** - Checkbox works
- [ ] **Nested lists** - Can nest (if supported)
- [ ] **Exit list** - Enter twice exits list
- [ ] **Backspace in empty list item** - Exits list

### 15. Blocks

- [ ] **Blockquote** - Styled with left border
- [ ] **Code block** - Dark background, monospace
- [ ] **Horizontal rule** - Creates line
- [ ] **Callout info** - Blue box
- [ ] **Callout warning** - Amber box
- [ ] **Callout success** - Green box
- [ ] **Callout danger** - Red box

### 16. Alignment

- [ ] **Align left** - Text aligns left
- [ ] **Align center** - Text centers
- [ ] **Align right** - Text aligns right
- [ ] **Alignment persists** - Stays after typing

---

## 🎬 MEDIA TESTS

### 17. Images

- [ ] **Image displays** - Shows correctly
- [ ] **Image responsive** - Scales on mobile
- [ ] **Image alignment** - Left/center/right works (if implemented)
- [ ] **Image caption** - Shows below image (if implemented)
- [ ] **Delete image** - Can delete with backspace
- [ ] **Multiple images** - Can add multiple

### 18. Videos

- [ ] **YouTube URL** - Embeds correctly
- [ ] **Vimeo URL** - Embeds correctly
- [ ] **Invalid URL** - Shows error
- [ ] **Video plays** - Can play in editor
- [ ] **Video responsive** - 16:9 aspect ratio
- [ ] **Delete video** - Can delete

---

## 🔒 SECURITY TESTS (CRITICAL)

### 19. XSS Prevention

- [ ] **Paste `<script>alert('XSS')</script>`** - Should strip script
- [ ] **Paste `<img src=x onerror=alert('XSS')>`** - Should strip onerror
- [ ] **Paste `<a href="javascript:alert('XSS')">link</a>`** - Should block javascript:
- [ ] **Paste `<iframe src="evil.com">`** - Should block or whitelist
- [ ] **Paste with inline styles** - Should sanitize
- [ ] **Preview malicious content** - Should be safe
- [ ] **Check console** - No XSS warnings

### 20. Content Validation

- [ ] **Empty content** - Validation catches
- [ ] **Too long content** - Validation catches
- [ ] **Invalid URLs** - Validation catches
- [ ] **Invalid images** - Validation catches

---

## ⚡ PERFORMANCE TESTS

### 21. Performance

- [ ] **Type 1000 words** - Should be smooth
- [ ] **Paste 5000 words** - Should not lag
- [ ] **Scroll long document** - Smooth scrolling
- [ ] **Autosave with long content** - No lag
- [ ] **Multiple images** - Loads quickly
- [ ] **Memory usage** - Check dev tools (no leaks)
- [ ] **CPU usage** - Not excessive

---

## 🎨 PREVIEW TESTS

### 22. Preview Rendering

- [ ] **Switch to preview mode** - Renders correctly
- [ ] **Typography matches** - Same as editor
- [ ] **Images display** - Show correctly
- [ ] **Videos display** - Show correctly
- [ ] **Links work** - Clickable in preview
- [ ] **Code blocks styled** - Dark theme
- [ ] **Callouts styled** - Colored boxes
- [ ] **No XSS in preview** - Safe rendering

---

## 🐛 EDGE CASES

### 23. Edge Cases

- [ ] **Empty editor save** - Handles gracefully
- [ ] **Very long word** - Wraps correctly
- [ ] **Special characters** - Displays correctly (emoji, unicode)
- [ ] **RTL text** - Works (if supported)
- [ ] **Rapid undo/redo** - Doesn't break
- [ ] **Network offline** - Shows error
- [ ] **Slow network** - Shows loading state
- [ ] **Browser back button** - Doesn't lose content (if autosave works)
- [ ] **Refresh page** - Content persists (if autosave works)
- [ ] **Multiple editors on page** - Don't interfere

---

## 📊 BROWSER COMPATIBILITY

### 24. Cross-Browser

- [ ] **Chrome** - All features work
- [ ] **Firefox** - All features work
- [ ] **Safari** - All features work
- [ ] **Edge** - All features work
- [ ] **Mobile Safari** - All features work
- [ ] **Mobile Chrome** - All features work

---

## ✅ FINAL CHECKS

### 25. Console & Network

- [ ] **No console errors** - Clean console
- [ ] **No console warnings** - Clean console
- [ ] **Network requests** - Only necessary requests
- [ ] **No 404s** - All resources load
- [ ] **No CORS errors** - All requests succeed

### 26. Accessibility

- [ ] **Keyboard navigation** - Can navigate with Tab
- [ ] **Focus visible** - Focus outline shows
- [ ] **Screen reader** - Announces content (basic test)
- [ ] **ARIA labels** - Buttons have labels

---

## 🎯 CRITICAL BUGS TO WATCH FOR

### Known Issues to Verify Fixed:

1. ✅ **Paste sanitization** - Should not cause XSS
2. ✅ **Keyboard shortcut conflicts** - Ctrl+K should not conflict
3. ✅ **Memory leaks** - Event listeners cleaned up
4. ✅ **Autosave race condition** - No setState on unmounted component
5. ✅ **Content sync** - External updates sync to editor
6. ✅ **Bubble menu on empty selection** - Should not appear
7. ✅ **Image upload UX** - Shows loading state
8. ✅ **Mobile toolbar** - Simplified and usable
9. ✅ **Word count performance** - Debounced
10. ✅ **Video embed commands** - Should work

---

## 📝 TEST RESULTS TEMPLATE

```
Date: ___________
Tester: ___________
Browser: ___________
Device: ___________

CRITICAL TESTS: ___/20 passed
UI/UX TESTS: ___/15 passed
MOBILE TESTS: ___/9 passed
FORMATTING TESTS: ___/20 passed
MEDIA TESTS: ___/8 passed
SECURITY TESTS: ___/8 passed
PERFORMANCE TESTS: ___/7 passed
PREVIEW TESTS: ___/8 passed
EDGE CASES: ___/10 passed
BROWSER COMPAT: ___/6 passed
FINAL CHECKS: ___/8 passed

TOTAL: ___/119 passed

BUGS FOUND:
1. ___________
2. ___________
3. ___________

NOTES:
___________
```

---

## 🚨 STOP SHIP CRITERIA

Do NOT ship if any of these fail:

- [ ] XSS vulnerability found
- [ ] Data loss on autosave
- [ ] Editor crashes on mobile
- [ ] Cannot type or select text
- [ ] Paste doesn't work
- [ ] Critical keyboard shortcuts broken
- [ ] Memory leak detected
- [ ] Console errors on normal use

---

## ✅ READY TO SHIP CRITERIA

Ship when:

- [ ] All CRITICAL tests pass
- [ ] No STOP SHIP issues
- [ ] 90%+ of all tests pass
- [ ] No console errors
- [ ] Works on Chrome, Firefox, Safari
- [ ] Works on mobile (iOS + Android)
- [ ] Performance acceptable (< 100ms typing lag)
- [ ] Security audit passed

---

**Good luck testing! 🚀**
