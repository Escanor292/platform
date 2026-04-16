# Installation & Setup Guide

## Prerequisites

- Node.js 18+ 
- npm hoặc yarn
- Next.js 15+
- React 19+
- Tailwind CSS 3+

## Installation Steps

### 1. Dependencies

Tất cả dependencies đã được cài sẵn trong project. Nếu bạn cần cài mới:

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-placeholder
```

Hoặc với yarn:

```bash
yarn add @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-placeholder
```

### 2. File Structure

Tất cả files đã được tạo trong:
```
src/components/editor/
```

Không cần thêm bước nào!

### 3. Tailwind Configuration

Đảm bảo Tailwind đã được config để scan editor files:

```js
// tailwind.config.js
module.exports = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx}',
    // ... other paths
  ],
  // ... rest of config
}
```

### 4. CSS Import

CSS đã được import tự động trong `RichTextEditor.tsx`:

```typescript
import './editor.css';
```

Nếu gặp lỗi import CSS, có thể cần config Next.js:

```js
// next.config.js
module.exports = {
  // ... other config
  webpack: (config) => {
    config.module.rules.push({
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
    });
    return config;
  },
}
```

## Verification

### 1. Check Installation

```bash
npm list @tiptap/react
```

Should show: `@tiptap/react@2.6.6`

### 2. Run Demo

```bash
npm run dev
```

Navigate to: `http://localhost:3000/demo/editor`

### 3. Test Features

- [ ] Editor renders
- [ ] Toolbar buttons work
- [ ] Cmd/Ctrl+K opens link popover
- [ ] Can insert links
- [ ] Can edit existing links
- [ ] Dark mode works (if enabled)

## Troubleshooting

### Issue: Module not found '@tiptap/react'

**Solution:**
```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-placeholder
```

### Issue: CSS not loading

**Solution:**
1. Check `editor.css` exists in `src/components/editor/`
2. Check import in `RichTextEditor.tsx`
3. Restart dev server

### Issue: TypeScript errors

**Solution:**
```bash
npm install --save-dev @types/react @types/node
```

### Issue: Tailwind classes not working

**Solution:**
1. Check `tailwind.config.js` includes editor path
2. Restart dev server
3. Clear `.next` cache: `rm -rf .next`

### Issue: Popover not showing

**Solution:**
1. Check editor is initialized: `if (!editor) return null`
2. Check BubbleMenu is rendered
3. Check z-index in CSS

### Issue: Dark mode not working

**Solution:**
1. Ensure `dark:` classes are in Tailwind config
2. Check `darkMode: 'class'` in tailwind.config.js
3. Add dark mode toggle to your app

## Configuration

### Custom Placeholder

```tsx
<RichTextEditor
  placeholder="Your custom placeholder..."
/>
```

### Custom Styling

```tsx
<RichTextEditor
  className="min-h-[500px] border-2"
/>
```

### Custom Link Attributes

Edit `RichTextEditor.tsx`:

```typescript
Link.configure({
  openOnClick: false,
  HTMLAttributes: {
    class: 'your-custom-classes',
    target: '_blank',
    rel: 'noopener noreferrer',
  },
})
```

## Environment Setup

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Type Checking

```bash
npx tsc --noEmit
```

### Linting

```bash
npm run lint
```

## IDE Setup

### VS Code Extensions

Recommended:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

### VS Code Settings

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.experimental.classRegex": [
    ["className\\s*=\\s*['\"`]([^'\"`]*)['\"`]"]
  ]
}
```

## Next Steps

1. ✅ Read [QUICKSTART.md](./QUICKSTART.md) for basic usage
2. ✅ Check [README.md](./README.md) for features
3. ✅ Review [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for details
4. ✅ Test with [TESTING.md](./TESTING.md) checklist

## Support

If you encounter issues:

1. Check this installation guide
2. Review troubleshooting section
3. Check TipTap docs: https://tiptap.dev
4. Check Next.js docs: https://nextjs.org/docs
5. Check Tailwind docs: https://tailwindcss.com/docs

## Version Compatibility

| Package | Version | Required |
|---------|---------|----------|
| React | 19.0.0 | ✅ |
| Next.js | 15.1.4 | ✅ |
| TypeScript | 5.x | ✅ |
| Tailwind CSS | 3.4.17 | ✅ |
| @tiptap/react | 2.6.6 | ✅ |
| @tiptap/starter-kit | 2.6.6 | ✅ |
| @tiptap/extension-link | 2.6.6 | ✅ |

All versions are compatible and tested! ✨
