# Quick Start Guide

## Installation

Dependencies đã được cài sẵn trong project. Nếu cần cài mới:

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-placeholder
```

## Basic Usage

### 1. Import Component

```tsx
import { RichTextEditor } from '@/components/editor/RichTextEditor';
```

### 2. Use in Your Component

```tsx
'use client';

import { useState } from 'react';
import { RichTextEditor } from '@/components/editor/RichTextEditor';

export default function MyPage() {
  const [content, setContent] = useState('');

  return (
    <div>
      <RichTextEditor
        content={content}
        onChange={setContent}
        placeholder="Bắt đầu viết..."
      />
    </div>
  );
}
```

### 3. Access Demo

Navigate to: `/demo/editor`

## Quick Examples

### Example 1: Simple Editor

```tsx
<RichTextEditor
  content=""
  onChange={(html) => console.log(html)}
/>
```

### Example 2: With Initial Content

```tsx
<RichTextEditor
  content="<p>Hello <strong>world</strong>!</p>"
  onChange={setContent}
/>
```

### Example 3: Custom Placeholder

```tsx
<RichTextEditor
  content=""
  onChange={setContent}
  placeholder="Nhập nội dung bài viết..."
/>
```

### Example 4: With Custom Styling

```tsx
<RichTextEditor
  content={content}
  onChange={setContent}
  className="min-h-[500px] shadow-lg"
/>
```

## Using Link Features

### Insert Link (with selection)

1. Bôi đen text: "Click here"
2. Press `Cmd/Ctrl+K` or click Link button
3. Type URL: `example.com`
4. Press `Enter`

Result: [Click here](https://example.com)

### Insert Link (without selection)

1. Place cursor in editor
2. Press `Cmd/Ctrl+K`
3. Type text: "Visit site"
4. Type URL: `example.com`
5. Press `Enter`

Result: [Visit site](https://example.com)

### Edit Existing Link

1. Click on link
2. Click "Sửa" button
3. Update URL
4. Press `Enter`

### Remove Link

1. Click on link
2. Click "Xóa" button

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl+K` | Open link popover |
| `Cmd/Ctrl+B` | Bold |
| `Cmd/Ctrl+I` | Italic |
| `Cmd/Ctrl+Z` | Undo |
| `Cmd/Ctrl+Shift+Z` | Redo |
| `Enter` | Apply link |
| `Esc` | Close popover |
| `Tab` | Navigate fields |

## Props API

### RichTextEditor Props

```typescript
interface RichTextEditorProps {
  content?: string;           // HTML content
  onChange?: (html: string) => void;  // Change handler
  placeholder?: string;       // Placeholder text
  className?: string;         // Additional CSS classes
}
```

## Utility Functions

### URL Validation

```typescript
import { isValidUrl, normalizeUrl } from '@/components/editor';

// Check if URL is valid
isValidUrl('example.com'); // true
isValidUrl('abc'); // false

// Normalize URL
normalizeUrl('example.com'); // 'https://example.com'
normalizeUrl('https://test.com'); // 'https://test.com'
```

### Link Operations

```typescript
import { 
  applyLinkToSelection,
  insertLinkAtCaret,
  removeLink 
} from '@/components/editor';

// Apply link to selected text
applyLinkToSelection(editor, 'https://example.com');

// Insert new link at cursor
insertLinkAtCaret(editor, 'Link text', 'https://example.com');

// Remove link
removeLink(editor);
```

## Styling Customization

### Custom Toolbar

Modify `Toolbar.tsx` to add/remove buttons.

### Custom Popover

Modify `FloatingLinkPopover.tsx` for custom UI.

### Custom Link Styles

Update Link extension config in `RichTextEditor.tsx`:

```typescript
Link.configure({
  HTMLAttributes: {
    class: 'your-custom-classes',
  },
})
```

## Common Patterns

### Save to Database

```tsx
const handleSave = async () => {
  await fetch('/api/posts', {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
};
```

### Load from Database

```tsx
useEffect(() => {
  fetch('/api/posts/123')
    .then(res => res.json())
    .then(data => setContent(data.content));
}, []);
```

### Character Limit

```tsx
const MAX_LENGTH = 5000;

<RichTextEditor
  content={content}
  onChange={(html) => {
    if (html.length <= MAX_LENGTH) {
      setContent(html);
    }
  }}
/>
```

### Word Count

```tsx
const getWordCount = (html: string) => {
  const text = html.replace(/<[^>]*>/g, ' ');
  return text.split(/\s+/).filter(w => w.length > 0).length;
};

const wordCount = getWordCount(content);
```

## Troubleshooting

### Popover không hiện

- Kiểm tra editor đã được khởi tạo chưa
- Kiểm tra có selection hoặc link active không

### Styles không apply

- Import CSS: `import './editor.css'`
- Kiểm tra Tailwind config

### TypeScript errors

- Kiểm tra types đã được import
- Kiểm tra TipTap version compatibility

## Next Steps

1. ✅ Read [README.md](./README.md) for features overview
2. ✅ Check [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for details
3. ✅ Review [TESTING.md](./TESTING.md) for test cases
4. ✅ Explore [IMPROVEMENTS.md](./IMPROVEMENTS.md) for future features

## Support

For issues or questions:
1. Check documentation files
2. Review demo page at `/demo/editor`
3. Check TipTap docs: https://tiptap.dev
