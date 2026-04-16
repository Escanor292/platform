# Rich Text Editor với Floating Link Popover

Modern rich text editor với contextual link insertion UX.

## Tính năng chính

### 🎯 Floating Link Popover
- Popover xuất hiện gần vị trí user đang thao tác
- Không dùng modal nặng giữa màn hình
- Giữ được selection của user
- Keyboard-first UX

### ⌨️ Keyboard Shortcuts
- `Cmd/Ctrl + K`: Mở link popover
- `Enter`: Apply link
- `Esc`: Đóng popover
- `Tab`: Di chuyển giữa các field

### 🔗 Link Operations
1. **Insert link với text đã chọn**
   - Bôi đen text
   - Bấm nút Link hoặc Cmd/Ctrl+K
   - Nhập URL
   - Enter để apply

2. **Insert link mới (không có selection)**
   - Đặt con trỏ
   - Cmd/Ctrl+K
   - Nhập text hiển thị và URL
   - Enter để apply

3. **Edit existing link**
   - Click vào link
   - Bấm "Sửa"
   - Chỉnh sửa URL
   - Enter để apply

4. **Remove link**
   - Click vào link
   - Bấm "Xóa"

5. **Open link**
   - Click vào link
   - Bấm "Mở"

## Cấu trúc file

```
src/components/editor/
├── RichTextEditor.tsx          # Main component
├── Toolbar.tsx                 # Fixed toolbar
├── FloatingLinkPopover.tsx     # Insert/edit link popover
├── LinkPreviewBubble.tsx       # Preview existing link
├── hooks/
│   └── useLinkPopover.ts       # State management
└── utils/
    ├── urlValidation.ts        # URL helpers
    └── linkHelpers.ts          # Link operations
```

## Usage

```tsx
import { RichTextEditor } from '@/components/editor/RichTextEditor';

function MyComponent() {
  const [content, setContent] = useState('');

  return (
    <RichTextEditor
      content={content}
      onChange={setContent}
      placeholder="Bắt đầu viết..."
    />
  );
}
```

## Tech Stack

- **TipTap**: Rich text editor framework
- **React**: UI framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **BubbleMenu**: Floating UI positioning

## URL Validation

Editor tự động:
- Trim whitespace
- Thêm `https://` nếu thiếu protocol
- Validate URL format
- Hiển thị error nếu invalid

Ví dụ:
- Input: `google.com` → Output: `https://google.com`
- Input: `https://example.com` → Output: `https://example.com`
- Input: `abc` → Error: URL không hợp lệ

## Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader friendly

## Demo

Xem demo tại: `/demo/editor`
