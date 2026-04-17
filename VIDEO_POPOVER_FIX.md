# Video Popover Fix - Method Name Error

## 🐛 ERROR

```
TypeError: editor.chain(...).focus(...).setYoutubeVideo is not a function
```

## 🔍 ROOT CAUSE

Method name sai: `setYoutubeVideo` → Đúng phải là `setYouTubeVideo` (chữ T viết hoa)

## ✅ FIX

### Before (Wrong)
```typescript
editor.chain().focus().setYoutubeVideo({ src: url }).run();
//                      ^^^^^^^^^^^^^^ Wrong - lowercase 't'
```

### After (Correct)
```typescript
editor.chain().focus().setYouTubeVideo({ src: url }).run();
//                      ^^^^^^^^^^^^^^ Correct - uppercase 'T'
```

## 📁 FILE FIXED

```
src/components/editor/VideoPopover.tsx
Line 164: setYoutubeVideo → setYouTubeVideo
Line 168: setYoutubeVideo → setYouTubeVideo
```

## 🔧 CHANGES APPLIED

```typescript
// VideoPopover.tsx - handleApply()

const provider = getVideoProvider(trimmedUrl);

if (provider === 'youtube') {
  editor.chain().focus().setYouTubeVideo({ src: trimmedUrl }).run();
  //                      ^^^^^^^^^^^^^^ FIXED
} else if (provider === 'vimeo') {
  editor.chain().focus().setYouTubeVideo({ src: trimmedUrl }).run();
  //                      ^^^^^^^^^^^^^^ FIXED
}
```

## ✅ VERIFICATION

Extension method name từ `video-embed.ts`:
```typescript
addCommands() {
  return {
    setYouTubeVideo: // ← Correct name with uppercase T
      (options: { src: string }) =>
      ({ commands }) => {
        // ...
      },
  };
}
```

## 🧪 TEST

```
1. Click YouTube icon
2. Paste YouTube URL
3. Press Enter
4. ✅ Video should embed successfully
```

## 📊 STATUS

- ✅ Method name fixed
- ✅ TypeScript errors cleared
- ✅ Ready for testing

---

**Fix Applied**: 2026-04-17
**Status**: ✅ Fixed
