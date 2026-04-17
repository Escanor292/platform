# Link Popover - Hướng dẫn sử dụng

## 🎯 Tổng quan

LinkPopover là component floating popover hiện đại để chèn/chỉnh sửa link trong Rich Text Editor, thay thế `window.prompt()`.

## 📦 Import

```typescript
import { LinkPopover } from './LinkPopover';
```

## 🔧 Props

```typescript
interface LinkPopoverProps {
  editor: Editor;           // Tiptap editor instance
  isOpen: boolean;          // Trạng thái mở/đóng
  onClose: () => void;      // Callback khi đóng
  initialUrl?: string;      // URL ban đầu (cho edit mode)
  isEditMode?: boolean;     // Có phải đang edit link không
}
```

## 💡 Cách sử dụng

### 1. Setup State

```typescript
const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
const [linkPopoverInitialUrl, setLinkPopoverInitialUrl] = useState('');
const [isLinkEditMode, setIsLinkEditMode] = useState(false);
```

### 2. Handle Link Click

```typescript
const handleLinkClick = useCallback(() => {
  if (!editor) return;

  // Check if cursor is in existing link
  const existingUrl = editor.getAttributes('link').href || '';
  
  if (existingUrl) {
    // Edit mode
    setLinkPopoverInitialUrl(existingUrl);
    setIsLinkEditMode(true);
  } else {
    // Insert mode
    setLinkPopoverInitialUrl('');
    setIsLinkEditMode(false);
  }

  setIsLinkPopoverOpen(true);
}, [editor]);
```

### 3. Render Popover

```typescript
<div className="relative">
  <EditorContent editor={editor} />
  
  {isLinkPopoverOpen && (
    <LinkPopover
      editor={editor}
      isOpen={isLinkPopoverOpen}
      onClose={() => setIsLinkPopoverOpen(false)}
      initialUrl={linkPopoverInitialUrl}
      isEditMode={isLinkEditMode}
    />
  )}
</div>
```

## 🎨 Features

### Positioning
- Tự động tính vị trí dựa trên caret/selection
- Hiện bên dưới selection với offset 8px
- Relative đến editor container

### Validation
- Real-time validation
- Auto-add `https://` nếu thiếu
- Hiển thị lỗi inline

### Keyboard
- `Enter` - Apply link
- `Escape` - Close popover

### Click Outside
- Tự động đóng khi click bên ngoài

## 📝 Examples

### Insert Link (No Selection)
```typescript
// User clicks link icon without selecting text
// Popover opens near caret
// User enters "example.com"
// Result: "example.com" text with link to https://example.com
```

### Apply Link (With Selection)
```typescript
// User selects "click here"
// User clicks link icon
// Popover opens near selection
// User enters "example.com"
// Result: "click here" becomes a link to https://example.com
```

### Edit Link
```typescript
// User clicks inside existing link
// User clicks link icon
// Popover shows current URL
// User can edit or remove link
```

## 🔍 Position Calculation

```typescript
// Get selection coordinates
const { state, view } = editor;
const { from, to } = state.selection;
const coords = view.coordsAtPos(to);

// Calculate relative to editor
const editorRect = view.dom.getBoundingClientRect();
const top = coords.bottom - editorRect.top + 8;
const left = coords.left - editorRect.left;
```

## ⚠️ Important Notes

1. **Container must be relative**: Parent container cần có `position: relative`
2. **Z-index**: Popover có `z-index: 50`
3. **Focus management**: Input tự động focus khi mở
4. **Selection preservation**: Không làm mất selection khi mở

## 🎯 Best Practices

1. Luôn check `editor` trước khi mở popover
2. Dùng `useCallback` cho handlers để tránh re-render
3. Clear state khi đóng popover
4. Handle edge cases (scroll, viewport bounds)

## 🐛 Troubleshooting

### Popover không hiện đúng vị trí
- Check parent container có `position: relative`
- Verify editor instance đang active
- Check console cho errors

### Input không focus
- Verify `isOpen` prop đang true
- Check không có element nào block focus

### Click outside không hoạt động
- Verify popover ref được set đúng
- Check không có element nào có `pointer-events: none`
