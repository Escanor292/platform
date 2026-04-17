# Fix Focus Loop - BubbleMenu vs LinkPopover Conflict

## 🐛 VẤN ĐỀ PHÁT HIỆN

Sau khi fix selection saving, phát hiện vấn đề mới:

**Focus loop giữa Editor ↔ BubbleMenu ↔ LinkPopover**

```
Editor focused
Editor blurred
Editor focused
Editor blurred
... (lặp lại liên tục)
```

## 🔍 ROOT CAUSE

1. **BubbleMenu (Tippy.js)** tự động update position khi editor focus/blur
2. **BubbleMenu buttons** gọi `editor.chain().focus()` khi click
3. **LinkPopover auto-focus** trong useEffect gây re-trigger BubbleMenu
4. **BubbleMenu shouldShow** check selection → trigger update → focus loop

## ✅ GIẢI PHÁP

### 1. Ẩn BubbleMenu khi LinkPopover mở

**File: `src/components/editor/EditorBubbleMenu.tsx`**

```typescript
shouldShow={({ editor, state, view }) => {
  const { selection } = state;
  const { empty } = selection;
  
  if (empty) return false;
  if (editor.isActive('codeBlock')) return false;
  
  // CRITICAL: Don't show if LinkPopover is open
  const linkPopover = document.querySelector('[data-link-popover="true"]');
  if (linkPopover) {
    console.log('[BubbleMenu] Hidden because LinkPopover is open');
    return false;
  }
  
  return true;
}}
```

### 2. Bỏ auto-focus trong LinkPopover

**File: `src/components/editor/LinkPopover.tsx`**

```typescript
// REMOVED: Auto-focus causes focus loop with BubbleMenu
// User will click input manually, which triggers handleInputPointerDown
// setTimeout(() => {
//   inputRef.current?.focus();
//   inputRef.current?.select();
// }, 50);
```

### 3. Dùng requestAnimationFrame cho manual focus

**File: `src/components/editor/LinkPopover.tsx`**

```typescript
const handleInputPointerDown = (e: React.PointerEvent<HTMLInputElement>) => {
  e.preventDefault();
  e.stopPropagation();
  
  // Use requestAnimationFrame to avoid focus loop
  requestAnimationFrame(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  });
};
```

### 4. Prevent default trên BubbleMenu buttons

**File: `src/components/editor/EditorBubbleMenu.tsx`**

```typescript
function BubbleButton({ onClick, isActive, title, children }: BubbleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={(e) => {
        e.preventDefault(); // Prevent focus issues
      }}
      title={title}
      className="..."
    >
      {children}
    </button>
  );
}
```

## 📊 FLOW SAU KHI FIX

### Trước khi fix (Focus Loop):
```
1. User clicks link button
2. LinkPopover opens
3. useEffect auto-focus input
4. Editor blurs
5. BubbleMenu updates
6. BubbleMenu tries to show
7. Editor focus triggered
8. LinkPopover re-renders
9. useEffect runs again
10. LOOP ↻
```

### Sau khi fix (Stable):
```
1. User clicks link button
2. LinkPopover opens (NO auto-focus)
3. BubbleMenu checks shouldShow
4. BubbleMenu sees LinkPopover → hides itself
5. User manually clicks input
6. handleInputPointerDown prevents default
7. requestAnimationFrame focuses input
8. Editor keeps selection in ref
9. NO focus loop ✅
10. User types URL
11. User clicks Apply
12. Restore selection → Apply link ✅
```

## 🎯 KEY PRINCIPLES

### 1. Conditional BubbleMenu
```typescript
// Hide BubbleMenu when LinkPopover is open
const linkPopover = document.querySelector('[data-link-popover="true"]');
if (linkPopover) return false;
```

### 2. No Auto-Focus
```typescript
// Let user click input manually
// Don't auto-focus in useEffect
```

### 3. requestAnimationFrame
```typescript
// Avoid synchronous focus that triggers loops
requestAnimationFrame(() => {
  input.focus();
});
```

### 4. Prevent Default Everywhere
```typescript
// On input: prevent blur cascade
// On buttons: prevent focus issues
onMouseDown={(e) => e.preventDefault()}
```

## 🧪 TEST RESULTS

### Before Fix:
- ❌ Focus loop in console
- ❌ BubbleMenu flickers
- ❌ Caret jumps
- ❌ Link applies to wrong position

### After Fix:
- ✅ No focus loop
- ✅ BubbleMenu hidden when LinkPopover open
- ✅ Caret stable
- ✅ Link applies to correct position

## 📝 FILES CHANGED

1. **src/components/editor/EditorBubbleMenu.tsx**
   - Added LinkPopover check in `shouldShow`
   - Added `onMouseDown` preventDefault on buttons

2. **src/components/editor/LinkPopover.tsx**
   - Removed auto-focus in useEffect
   - Changed to requestAnimationFrame for manual focus

3. **src/components/editor/ProductionEditor.tsx**
   - Added handleDOMEvents blur prevention
   - Added debug logs

## ✅ VERIFICATION

Test với các bước:
1. Bôi đen text
2. Click link button
3. BubbleMenu biến mất ✅
4. LinkPopover hiện ra ✅
5. Click vào input URL
6. Input nhận focus ✅
7. Editor không bị focus loop ✅
8. Nhập URL
9. Click "Áp dụng"
10. Link gắn đúng vị trí ✅

---

**Status**: ✅ Fixed
**Date**: 2026-04-17
**Issue**: Focus loop between BubbleMenu and LinkPopover
**Solution**: Conditional BubbleMenu + No auto-focus + requestAnimationFrame
