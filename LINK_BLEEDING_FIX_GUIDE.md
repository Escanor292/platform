# Link Bleeding Fix - Quick Guide

## 🐛 THE BUG

**Symptom**: Sau khi gắn link, text tiếp theo vẫn bị dính link

```
User actions:
1. Select "Xem thêm"
2. Apply link
3. Type " ngay tại đây"

Expected: "Xem thêm" = link, " ngay tại đây" = plain text
Actual (BUG): "Xem thêm ngay tại đây" = ALL link ❌
```

## 🔍 ROOT CAUSE

```typescript
// OLD CODE - WRONG
editor.chain().focus()
  .extendMarkRange('link')
  .setLink({ href: url })
  .run();

// ❌ Problem: After setLink(), editor keeps link in stored marks
// ❌ Caret is still inside link mark context
// ❌ Next typed character automatically inherits link mark
```

### Why This Happens

1. **Tiptap's stored marks**: Editor maintains "active marks" for next character
2. **setLink() doesn't clear**: After applying link, link mark stays in stored marks
3. **Caret position**: Caret is at end of selection, still INSIDE link range
4. **Auto-inheritance**: Next character inherits all stored marks including link

## ✅ THE FIX

```typescript
// NEW CODE - CORRECT
editor.chain().focus()
  .extendMarkRange('link')
  .setLink({ href: url })
  .run();

// CRITICAL FIX: Clear stored marks
editor.chain().focus()
  .setTextSelection(to)      // Move caret to end
  .unsetMark('link')          // Clear link from stored marks
  .run();
```

### What This Does

1. **Apply link**: `setLink()` applies link to selection
2. **Move caret**: `setTextSelection(to)` ensures caret is at end
3. **Clear stored marks**: `unsetMark('link')` removes link from stored marks
4. **Result**: Next character is plain text ✅

## 🔧 IMPLEMENTATION

### In link-commands.ts

```typescript
export function applyLinkToSelection(editor: Editor, url: string): boolean {
  const { from, to } = editor.state.selection;

  // Step 1: Apply link to selection
  editor.chain().focus()
    .extendMarkRange('link')
    .setLink({ href: url, target: '_blank' })
    .run();

  // Step 2: CRITICAL FIX - Clear stored marks
  editor.chain().focus()
    .setTextSelection(to)      // Move to end of selection
    .unsetMark('link')          // Remove link from stored marks
    .run();

  return true;
}
```

### Same Pattern for All Link Operations

```typescript
// Insert link
export function insertLinkAtCaret(editor: Editor, text: string, url: string) {
  const { from } = editor.state.selection;

  // Insert
  editor.chain().focus()
    .insertContent({ /* ... */ })
    .run();

  // CRITICAL: Clear stored marks
  const newPos = from + text.length;
  editor.chain().focus()
    .setTextSelection(newPos)
    .unsetMark('link')
    .run();
}

// Update link
export function updateExistingLink(editor: Editor, url: string) {
  const { to } = editor.state.selection;

  // Update
  editor.chain().focus()
    .extendMarkRange('link')
    .setLink({ href: url })
    .run();

  // CRITICAL: Clear stored marks
  editor.chain().focus()
    .setTextSelection(to)
    .unsetMark('link')
    .run();
}

// Remove link
export function removeLinkFromSelection(editor: Editor) {
  const { to } = editor.state.selection;

  // Remove
  editor.chain().focus()
    .extendMarkRange('link')
    .unsetLink()
    .run();

  // CRITICAL: Clear stored marks
  editor.chain().focus()
    .setTextSelection(to)
    .unsetMark('link')
    .run();
}
```

## 🧪 TEST THE FIX

### Test Case 1: Basic Link Bleeding
```
1. Type "Click here to learn more"
2. Select "Click here"
3. Apply link (google.com)
4. Click after "here" (end of link)
5. Type " now"

Expected: "Click here" = link, " now" = plain text
Result: ✅ FIXED
```

### Test Case 2: Insert Link
```
1. Place caret at end of paragraph
2. Insert link (text: "Google", url: google.com)
3. Type " is great"

Expected: "Google" = link, " is great" = plain text
Result: ✅ FIXED
```

### Test Case 3: Edit Link
```
1. Click inside existing link
2. Edit URL
3. Apply
4. Type text after link

Expected: New text is plain
Result: ✅ FIXED
```

### Test Case 4: Remove Link
```
1. Click inside link
2. Remove link
3. Type text after

Expected: New text is plain
Result: ✅ FIXED
```

## 📊 BEFORE vs AFTER

### Before (Bug)
```typescript
// Apply link
editor.chain().focus()
  .setLink({ href: url })
  .run();

// State after:
// - Link applied ✅
// - Stored marks: { link: { href: url } } ❌
// - Next character: inherits link ❌
```

### After (Fixed)
```typescript
// Apply link
editor.chain().focus()
  .setLink({ href: url })
  .run();

// Clear stored marks
editor.chain().focus()
  .setTextSelection(to)
  .unsetMark('link')
  .run();

// State after:
// - Link applied ✅
// - Stored marks: {} ✅
// - Next character: plain text ✅
```

## 🎯 KEY TAKEAWAYS

1. **Always clear stored marks** after link operations
2. **Use `unsetMark('link')`** to remove from stored marks
3. **Move caret explicitly** with `setTextSelection()`
4. **Apply pattern consistently** to all link operations

## 🚀 QUICK FIX CHECKLIST

If you have link bleeding bug:

- [ ] Find all `setLink()` calls
- [ ] Add `unsetMark('link')` after each
- [ ] Add `setTextSelection()` to position caret
- [ ] Test: type after link
- [ ] Verify: new text is plain

## 💡 WHY THIS WORKS

### Tiptap's Mark System

```
Stored Marks = Marks that will be applied to next character

When you type:
1. Editor checks stored marks
2. Applies all stored marks to new character
3. Character inherits marks

Problem:
- After setLink(), link stays in stored marks
- Next character gets link mark

Solution:
- Call unsetMark('link') to clear stored marks
- Next character is plain
```

### Visual Explanation

```
Before fix:
[Link text]|  <- caret here, stored marks: {link}
Type "x"
[Link textx]   <- "x" inherits link ❌

After fix:
[Link text]|  <- caret here, stored marks: {}
Type "x"
[Link text]x  <- "x" is plain ✅
```

## 🔗 RELATED FIXES

This same pattern fixes:

- Bold bleeding
- Italic bleeding
- Any mark bleeding
- Stored marks not clearing

Pattern:
```typescript
editor.chain().focus()
  .toggleBold()
  .unsetMark('bold')  // Clear stored mark
  .run();
```

---

**TL;DR**: Link bleeding happens because Tiptap keeps link in stored marks after `setLink()`. Fix by calling `unsetMark('link')` after every link operation.

**One-line fix**: Add `.unsetMark('link')` after `.setLink()`

✅ **Status**: FIXED in link-commands.ts
