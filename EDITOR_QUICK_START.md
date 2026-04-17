# Rich Text Editor - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. See the Demo

Visit the demo page to see all features:

```bash
npm run dev
```

Then open: **http://localhost:3000/demo/production-editor**

---

### 2. Basic Usage

```tsx
import { ProductionEditor } from '@/components/editor';

function MyComponent() {
  const [content, setContent] = useState('');

  return (
    <ProductionEditor
      content={content}
      onChange={setContent}
    />
  );
}
```

---

### 3. With Autosave

```tsx
<ProductionEditor
  content={content}
  onChange={setContent}
  config={{
    placeholder: 'Start writing...',
    autosave: true,
  }}
  callbacks={{
    onSave: async (content) => {
      await fetch('/api/save', {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
    },
  }}
/>
```

---

### 4. Display Content

```tsx
import { EditorPreview } from '@/components/editor';

<EditorPreview content={savedContent} />
```

---

### 5. Validate Content

```tsx
import { validateContent } from '@/lib/editor/validation';

const result = validateContent(content, {
  required: true,
  minLength: 100,
  maxLength: 50000,
});

if (!result.isValid) {
  alert(result.errors[0]);
}
```

---

## 🎯 Common Use Cases

### Campaign Description

```tsx
import { EDITOR_PLACEHOLDERS } from '@/lib/editor/constants';

<ProductionEditor
  content={campaign.description}
  onChange={(content) => setCampaign({ ...campaign, description: content })}
  config={{
    placeholder: EDITOR_PLACEHOLDERS.CAMPAIGN_DESCRIPTION,
    autosave: true,
  }}
  callbacks={{
    onSave: async (content) => {
      await updateCampaign(campaign.id, { description: content });
    },
  }}
/>
```

### Update Post

```tsx
<ProductionEditor
  content={post.content}
  onChange={setContent}
  config={{
    placeholder: EDITOR_PLACEHOLDERS.UPDATE_POST,
    autosave: true,
  }}
/>
```

### FAQ Answer

```tsx
<ProductionEditor
  content={faq.answer}
  onChange={(answer) => setFaq({ ...faq, answer })}
  config={{
    placeholder: EDITOR_PLACEHOLDERS.FAQ,
    maxLength: 10000,
  }}
/>
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | Bold |
| `Ctrl+I` | Italic |
| `Ctrl+U` | Underline |
| `Ctrl+K` | Insert link |
| `Ctrl+E` | Inline code |
| `Ctrl+Shift+8` | Bullet list |
| `Ctrl+Shift+7` | Numbered list |
| `/` | Slash commands |

---

## 🎨 Features

### Text Formatting
- Bold, Italic, Underline, Strikethrough
- Inline code, Highlight

### Blocks
- Headings (H1, H2, H3)
- Lists (bullet, numbered, task)
- Blockquote, Code block
- Horizontal rule

### Media
- Image upload (drag & drop or click)
- Video embeds (YouTube, Vimeo)

### Special Blocks
- Info box (blue)
- Warning box (amber)
- Success box (green)
- Danger box (red)

### UX
- Autosave with status indicator
- Word & character count
- Bubble menu on selection
- Slash commands (type `/`)

---

## 🔒 Security

Content is automatically sanitized:
- XSS prevention
- Script tag removal
- Event handler stripping
- Safe iframe embeds

Always use `EditorPreview` to display user content:

```tsx
// ❌ Unsafe
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ Safe
<EditorPreview content={userContent} />
```

---

## 📚 Learn More

- **Full Documentation**: [PRODUCTION_EDITOR_README.md](./PRODUCTION_EDITOR_README.md)
- **Migration Guide**: [EDITOR_MIGRATION_GUIDE.md](./EDITOR_MIGRATION_GUIDE.md)
- **Implementation Details**: [EDITOR_IMPLEMENTATION_SUMMARY.md](./EDITOR_IMPLEMENTATION_SUMMARY.md)
- **Demo Page**: `/demo/production-editor`

---

## 🆘 Troubleshooting

### Images not uploading?
- Check `/api/upload` endpoint
- Verify Cloudinary credentials in `.env`
- Check file size (max 5MB)

### Autosave not working?
- Ensure `onSave` callback is provided
- Check browser console for errors
- Verify network connectivity

### Content not rendering?
- Use `EditorPreview` component
- Check that content is valid HTML
- Verify sanitization isn't too strict

---

## ✅ Checklist

Before going to production:

- [ ] Test image upload
- [ ] Test video embeds
- [ ] Test autosave
- [ ] Test on mobile
- [ ] Verify sanitization
- [ ] Check performance with long content
- [ ] Test paste from Word/Docs
- [ ] Verify keyboard shortcuts
- [ ] Test error handling
- [ ] Review security settings

---

## 🎉 You're Ready!

The editor is production-ready and fully featured. Start building amazing content experiences!

**Need help?** Check the demo page or read the full documentation.
