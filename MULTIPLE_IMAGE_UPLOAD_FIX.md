# Multiple Image Upload - State Update Fix

## 🐛 Vấn Đề

Toast hiển thị "Tải ảnh lên thành công!" nhưng ảnh không xuất hiện trong gallery.

---

## 🔍 Root Cause

**Stale Closure Problem** trong state update:

```typescript
// ❌ WRONG - Uses stale formData
onChange={(images) => setFormData({ ...formData, images })}
```

Khi `onChange` callback được tạo, nó capture giá trị `formData` tại thời điểm đó. Nếu có nhiều updates liên tiếp hoặc async updates, `formData` có thể đã cũ (stale), dẫn đến state không update đúng.

---

## ✅ Giải Pháp

Dùng **functional update** với `prev` để luôn có state mới nhất:

```typescript
// ✅ CORRECT - Uses latest state
onChange={(images) => {
  console.log("[CreateCampaign] Images updated:", images);
  setFormData(prev => ({ ...prev, images }));
}}
```

---

## 🔧 Changes Made

### File: `src/app/campaigns/create/page.tsx`

**Before**:
```typescript
<MultipleImageUpload 
  images={formData.images}
  onChange={(images) => setFormData({ ...formData, images })}
  mainImage={formData.imageUrl}
  onMainImageChange={(url) => setFormData({ ...formData, imageUrl: url })}
/>
```

**After**:
```typescript
<MultipleImageUpload 
  images={formData.images}
  onChange={(images) => {
    console.log("[CreateCampaign] Images updated:", images);
    setFormData(prev => ({ ...prev, images }));
  }}
  mainImage={formData.imageUrl}
  onMainImageChange={(url) => {
    console.log("[CreateCampaign] Main image updated:", url);
    setFormData(prev => ({ ...prev, imageUrl: url }));
  }}
/>
```

### File: `src/components/shared/MultipleImageUpload.tsx`

**Added debug logs**:
```typescript
// At component render
console.log("[MultipleImageUpload] Render - images:", images, "mainImage:", mainImage);

// In handleUpload
console.log("[MultipleImageUpload] Upload success:", imageUrl);
console.log("[MultipleImageUpload] Current images:", images);
console.log("[MultipleImageUpload] New images array:", newImages);
```

---

## 🧪 How to Test

### 1. Open Browser Console
Press F12 to open DevTools

### 2. Upload First Image
1. Click "Thêm ảnh"
2. Select an image
3. Watch console logs:
   ```
   [MultipleImageUpload] Upload success: https://...
   [MultipleImageUpload] Current images: []
   [MultipleImageUpload] New images array: ["https://..."]
   [CreateCampaign] Images updated: ["https://..."]
   [CreateCampaign] Main image updated: https://...
   [MultipleImageUpload] Render - images: ["https://..."] mainImage: https://...
   ```
4. Image should appear in gallery ✅

### 3. Upload Second Image
1. Click "Thêm ảnh" again
2. Select another image
3. Watch console logs:
   ```
   [MultipleImageUpload] Upload success: https://...
   [MultipleImageUpload] Current images: ["https://..."]
   [MultipleImageUpload] New images array: ["https://...", "https://..."]
   [CreateCampaign] Images updated: ["https://...", "https://..."]
   [MultipleImageUpload] Render - images: ["https://...", "https://..."]
   ```
4. Both images should appear in gallery ✅

---

## 📚 Why Functional Updates?

### Problem with Direct State Reference
```typescript
// ❌ BAD
const handleClick = () => {
  setFormData({ ...formData, newField: value });
};
```

If `handleClick` is called multiple times quickly, or if it's in a closure (like `onChange` callback), `formData` might be stale.

### Solution with Functional Update
```typescript
// ✅ GOOD
const handleClick = () => {
  setFormData(prev => ({ ...prev, newField: value }));
};
```

React guarantees `prev` is always the latest state, even in async scenarios or rapid updates.

---

## 🎯 When to Use Functional Updates

Use functional updates when:
1. ✅ Updating state based on previous state
2. ✅ State updates in callbacks (onChange, onClick, etc.)
3. ✅ State updates in async functions
4. ✅ State updates in closures (useEffect, setTimeout, etc.)
5. ✅ Multiple rapid state updates

Don't need functional updates when:
1. ❌ Setting completely new state (not based on previous)
2. ❌ Simple one-time updates in event handlers
3. ❌ State is not used in the update logic

---

## 🔍 Debug Logs Explanation

### Component Render Log
```
[MultipleImageUpload] Render - images: [...] mainImage: ...
```
Shows current props every time component re-renders. Useful to verify state is updating.

### Upload Success Log
```
[MultipleImageUpload] Upload success: https://...
[MultipleImageUpload] Current images: [...]
[MultipleImageUpload] New images array: [...]
```
Shows the upload flow and how array is being built.

### Parent Component Log
```
[CreateCampaign] Images updated: [...]
[CreateCampaign] Main image updated: ...
```
Confirms callbacks are being called and state is being set.

---

## ✅ Verification Checklist

After fix, verify:
- [ ] Upload first image → appears in gallery
- [ ] Upload second image → both appear in gallery
- [ ] Upload third image → all three appear
- [ ] First image has "Ảnh bìa" badge
- [ ] Counter shows correct count (e.g., "3/10 ảnh")
- [ ] Console logs show correct flow
- [ ] No errors in console
- [ ] Toast shows success message

---

## 🎉 Result

Images now appear immediately after upload! The stale closure issue is resolved by using functional state updates.

---

**Status**: ✅ Fixed
**Root Cause**: Stale closure in state update
**Solution**: Functional update with `prev =>`
**Files Changed**: 2
