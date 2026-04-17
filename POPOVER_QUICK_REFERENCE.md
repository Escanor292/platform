# Popover Quick Reference Card

## 🚀 Quick Start

### Test Link Popover
```
1. Bôi đen text "click here"
2. Click 🔗 hoặc Ctrl+K
3. Nhập "example.com"
4. Press Enter
✅ Link created!
```

### Test Video Popover
```
1. Click 🎥
2. Paste "https://youtube.com/watch?v=..."
3. Press Enter
✅ Video embedded!
```

## ⌨️ Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open link popover | `Ctrl+K` / `Cmd+K` |
| Apply/Insert | `Enter` |
| Cancel/Close | `Escape` |

## 🎯 Use Cases

### LinkPopover

#### Insert with selection
```
1. Select text
2. Click 🔗
3. Enter URL
4. Press Enter
→ Text becomes link
```

#### Insert without selection
```
1. Place cursor
2. Click 🔗
3. Enter URL
4. Press Enter
→ URL inserted as text + link
```

#### Edit existing link
```
1. Click inside link
2. Click 🔗
3. Edit URL or click "Xóa"
4. Press Enter
→ Link updated or removed
```

### VideoPopover

#### Insert YouTube
```
1. Click 🎥
2. Paste YouTube URL
3. See "✓ YouTube video detected"
4. Press Enter
→ Video embedded
```

#### Insert Vimeo
```
1. Click 🎥
2. Paste Vimeo URL
3. See "✓ Vimeo video detected"
4. Press Enter
→ Video embedded
```

## ✅ Valid URL Formats

### Links
```
✅ example.com
✅ www.example.com
✅ https://example.com
✅ http://example.com
✅ example.com/path?query=1

❌ not a url
❌ just text
❌ (empty)
```

### Videos
```
✅ https://youtube.com/watch?v=dQw4w9WgXcQ
✅ https://youtu.be/dQw4w9WgXcQ
✅ https://vimeo.com/123456789

❌ https://example.com
❌ not a video url
❌ (empty)
```

## 🎨 Visual Indicators

### LinkPopover
- **Blue border** - Normal state
- **Red border** - Error state
- **Blue button** - Apply action
- **Red button** - Remove action (edit mode only)

### VideoPopover
- **Blue border** - Normal state
- **Red border** - Error state
- **Green text** - "✓ YouTube/Vimeo detected"
- **Red button** - Insert action

## 🔧 Troubleshooting

### Popover không hiện
```
✓ Check editor is active
✓ Check console for errors
✓ Try refresh page
```

### Popover sai vị trí
```
✓ Check parent has position: relative
✓ Check no CSS conflicts
✓ Try scroll to different position
```

### Input không focus
```
✓ Check no element blocks focus
✓ Try click input manually
✓ Check z-index conflicts
```

### URL không valid
```
✓ Check format (example.com)
✓ Check protocol (https://)
✓ Check no typos
```

## 📁 File Locations

```
Components:
src/components/editor/LinkPopover.tsx
src/components/editor/VideoPopover.tsx

Integration:
src/components/editor/RichTextEditor.tsx
src/components/editor/ProductionEditor.tsx

Utils:
src/components/editor/utils/linkHelpers.ts
src/components/editor/utils/urlValidation.ts
```

## 📚 Documentation

```
Quick:
- POPOVER_QUICK_REFERENCE.md (this file)
- LINK_POPOVER_QUICK_START.md

Summary:
- POPOVER_COMPLETE_SUMMARY.md
- LINK_REFACTOR_SUMMARY.md
- VIDEO_POPOVER_SUMMARY.md

Detailed:
- LINK_POPOVER_REFACTOR.md
- LINK_POPOVER_ARCHITECTURE.md
- LINK_POPOVER_BEFORE_AFTER.md

API:
- src/components/editor/LINK_POPOVER_GUIDE.md
- src/components/editor/LINK_POPOVER_TEST_CASES.md

Checklist:
- LINK_POPOVER_FINAL_CHECKLIST.md
```

## 🧪 Quick Test Checklist

```
LinkPopover:
[ ] Insert with selection
[ ] Insert without selection
[ ] Edit existing link
[ ] Remove link
[ ] Keyboard shortcuts
[ ] Click outside

VideoPopover:
[ ] Insert YouTube
[ ] Insert Vimeo
[ ] Auto-detect
[ ] Keyboard shortcuts
[ ] Click outside

Both:
[ ] Position near caret
[ ] No console errors
[ ] Mobile works
```

## 💡 Pro Tips

1. **Keyboard shortcuts** - Ctrl+K nhanh hơn click
2. **Auto-add https** - Chỉ cần gõ "example.com"
3. **Click outside** - Nhanh hơn click Cancel
4. **Edit mode** - Click vào link để edit
5. **Remove link** - Nút "Xóa" trong edit mode

## 🎯 Common Patterns

### Quick link insert
```
Select text → Ctrl+K → Type URL → Enter
(4 actions, ~3 seconds)
```

### Quick video insert
```
Click 🎥 → Paste URL → Enter
(3 actions, ~2 seconds)
```

### Edit link
```
Click in link → Ctrl+K → Edit → Enter
(4 actions, ~3 seconds)
```

### Remove link
```
Click in link → Ctrl+K → Click "Xóa"
(3 actions, ~2 seconds)
```

## 🚨 Important Notes

1. **Position**: Popover bám theo CARET/SELECTION, không theo chuột
2. **Validation**: Real-time, không cần submit mới biết lỗi
3. **Auto-detect**: Video provider tự động detect
4. **Click outside**: Có delay 100ms để tránh close ngay
5. **Focus**: Input tự động focus khi mở

## 📞 Need Help?

1. Check console errors
2. Read troubleshooting section
3. Review documentation
4. Test in isolation
5. Check browser compatibility

---

**Quick Reference v1.0**
**Last Updated**: 2026-04-17
**Print this for quick access!**
