# Implementation Guide - Rich Text Editor

## Overview

Đây là implementation guide chi tiết cho Rich Text Editor với floating link popover. Editor được build với TipTap, React, TypeScript và Tailwind CSS.

## Architecture

### Component Hierarchy

```
RichTextEditor (Main)
├── Toolbar (Fixed toolbar)
├── EditorContent (TipTap)
└── BubbleMenu (Floating UI)
    ├── FloatingLinkPopover (Insert/Edit)
    └── LinkPreviewBubble (Preview)
```

### State Management

```typescript
useLinkPopover() {
  mode: 'insert' | 'edit' | 'preview' | 'closed'
  url: string
  text: string
  error: string | null
  isOpen: boolean
}
```

### Data Flow

1. User action (click button / keyboard shortcut)
2. State update (open popover)
3. User input (type URL/text)
4. Validation (check URL)
5. Apply operation (insert/update link)
6. State cleanup (close popover)

## Key Implementation Details

### 1. Selection Management

**Problem:** Khi mở popover, selection trong editor có thể bị mất.

**Solution:** TipTap tự động maintain selection state. BubbleMenu component được anchor theo selection range.

```typescript
// TipTap tự động handle selection
editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
```

### 2. Popover Positioning

**Current:** Sử dụng TipTap BubbleMenu với Tippy.js positioning.

**Configuration:**
```typescript
<BubbleMenu
  editor={editor}
  tippyOptions={{
    duration: 100,
    placement: 'top',
    offset: [0, 8],
  }}
>
```

**Behavior:**
- Auto-position gần selection
- Auto-flip nếu không đủ chỗ
- Offset 8px từ selection

### 3. URL Validation

**Implementation:**
```typescript
function isValidUrl(input: string): boolean {
  try {
    const normalized = normalizeUrl(input);
    const url = new URL(normalized);
    return (url.protocol === 'http:' || url.protocol === 'https:') && 
           url.hostname.includes('.');
  } catch {
    return false;
  }
}
```

**Normalization:**
- Trim whitespace
- Add `https://` if no protocol
- Preserve existing protocol

### 4. Keyboard Shortcuts

**Implementation:**
```typescript
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      handleLinkButtonClick();
    }
  };
  
  editor.view.dom.addEventListener('keydown', handleKeyDown);
  return () => editor.view.dom.removeEventListener('keydown', handleKeyDown);
}, [editor]);
```

**Shortcuts:**
- `Cmd/Ctrl+K`: Open link popover
- `Enter`: Apply link
- `Esc`: Close popover
- `Tab`: Navigate fields

### 5. Click Outside Detection

**Implementation:**
```typescript
useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
      onClose();
    }
  };
  
  // Delay để tránh close ngay khi mở
  const timer = setTimeout(() => {
    document.addEventListener('mousedown', handleClickOutside);
  }, 100);
  
  return () => {
    clearTimeout(timer);
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [onClose]);
```

### 6. Link Operations

**Insert link với selection:**
```typescript
function applyLinkToSelection(editor: Editor, url: string) {
  editor
    .chain()
    .focus()
    .extendMarkRange('link')
    .setLink({ href: url })
    .run();
}
```

**Insert link không có selection:**
```typescript
function insertLinkAtCaret(editor: Editor, text: string, url: string) {
  editor
    .chain()
    .focus()
    .insertContent({
      type: 'text',
      text: text,
      marks: [{ type: 'link', attrs: { href: url } }],
    })
    .run();
}
```

**Remove link:**
```typescript
function removeLink(editor: Editor) {
  editor
    .chain()
    .focus()
    .extendMarkRange('link')
    .unsetLink()
    .run();
}
```

## TipTap Configuration

### Extensions

```typescript
const editor = useEditor({
  extensions: [
    StarterKit,
    Link.configure({
      openOnClick: false, // Không mở link khi click
      HTMLAttributes: {
        class: 'text-blue-600 underline cursor-pointer',
      },
    }),
    Placeholder.configure({
      placeholder: 'Bắt đầu viết...',
    }),
  ],
  content,
  onUpdate: ({ editor }) => {
    onChange?.(editor.getHTML());
  },
});
```

### Link Extension Options

- `openOnClick: false` - Không auto-open link
- `HTMLAttributes` - Custom CSS classes
- `validate` - Custom validation (optional)
- `protocols` - Allowed protocols (optional)

## Styling Strategy

### Tailwind Classes

**Popover:**
```css
bg-white dark:bg-gray-800
rounded-lg shadow-lg
border border-gray-200 dark:border-gray-700
p-3 min-w-[320px] max-w-[400px]
```

**Input:**
```css
w-full px-3 py-2 text-sm
border border-gray-300 dark:border-gray-600
rounded-md
focus:outline-none focus:ring-2 focus:ring-blue-500
```

**Button:**
```css
px-3 py-1.5 text-sm font-medium
text-white bg-blue-600 hover:bg-blue-700
rounded-md transition-colors
```

### Custom CSS

**Animation:**
```css
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
```

## Error Handling

### URL Validation Errors

```typescript
const urlError = getUrlError(url);
if (urlError) {
  onError(urlError);
  return; // Không apply
}
```

### Empty Field Errors

```typescript
if (!text.trim()) {
  onError('Vui lòng nhập text hiển thị');
  return;
}
```

### Error Display

```tsx
{error && (
  <p className="mt-1 text-xs text-red-600">
    {error}
  </p>
)}
```

## Performance Considerations

### 1. Auto-focus
- Sử dụng `useEffect` với `useRef`
- Focus ngay sau render

### 2. Event Listeners
- Cleanup trong `useEffect` return
- Debounce nếu cần (future)

### 3. Re-renders
- Memoize callbacks với `useCallback`
- Avoid unnecessary state updates

### 4. Bundle Size
- TipTap: ~50KB gzipped
- Total: ~70KB gzipped
- Code splitting possible

## Testing Strategy

### Unit Tests
- URL validation functions
- Link helper functions
- State management hook

### Integration Tests
- Component interactions
- Keyboard shortcuts
- Click handlers

### E2E Tests
- Complete user flows
- Cross-browser testing
- Mobile testing

## Deployment Checklist

- [ ] All dependencies installed
- [ ] TypeScript compiles without errors
- [ ] No console errors
- [ ] Dark mode works
- [ ] Keyboard shortcuts work
- [ ] Mobile responsive
- [ ] Accessibility tested
- [ ] Performance acceptable
- [ ] Documentation complete

## Common Issues & Solutions

### Issue 1: Popover không hiện

**Cause:** BubbleMenu chỉ hiện khi có selection hoặc link active.

**Solution:** Kiểm tra `isOpen` state và editor state.

### Issue 2: Selection bị mất

**Cause:** Focus ra khỏi editor.

**Solution:** TipTap tự động maintain selection. Dùng `.focus()` trong chain.

### Issue 3: URL không được normalize

**Cause:** Quên gọi `normalizeUrl()`.

**Solution:** Luôn normalize trước khi apply.

### Issue 4: Popover không đóng khi click outside

**Cause:** Event listener chưa được setup đúng.

**Solution:** Thêm delay 100ms trước khi attach listener.

### Issue 5: Dark mode không hoạt động

**Cause:** Thiếu dark: classes.

**Solution:** Thêm dark mode variants cho tất cả colors.

## Best Practices

1. **Always validate URL** trước khi apply
2. **Always normalize URL** để consistent
3. **Always cleanup** event listeners
4. **Always handle errors** gracefully
5. **Always test keyboard navigation**
6. **Always consider mobile UX**
7. **Always provide feedback** (loading, success, error)
8. **Always maintain accessibility**

## Resources

- [TipTap Documentation](https://tiptap.dev)
- [ProseMirror Guide](https://prosemirror.net/docs/guide/)
- [Tailwind CSS](https://tailwindcss.com)
- [React Hooks](https://react.dev/reference/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
