# Rich Text Editor Migration Guide

## Overview

The new **Production Editor** is a complete rewrite of the rich text editor with enhanced features, better performance, security, and UX. This guide helps you migrate from the old `RichTextEditor` to the new `ProductionEditor`.

## What's New

### Features
- ✅ **Callout boxes** (info, warning, success, danger)
- ✅ **Enhanced image support** with captions and alignment
- ✅ **Video embeds** (YouTube & Vimeo)
- ✅ **Bubble menu** for text selection
- ✅ **Slash commands** (type `/` to insert blocks)
- ✅ **Better paste handling** (Word, Google Docs)
- ✅ **Autosave** with debounce
- ✅ **Save status indicator**
- ✅ **Character/word count**
- ✅ **Keyboard shortcuts**
- ✅ **Mobile optimized**
- ✅ **Security hardened** (multi-layer sanitization)

### Architecture
- Modular extension system
- Separate sanitization layer
- Validation utilities
- Type-safe throughout
- Better performance with long content

## Migration Steps

### 1. Update Imports

**Before:**
```typescript
import RichTextEditor from '@/components/editor/RichTextEditor';
```

**After:**
```typescript
import { ProductionEditor } from '@/components/editor';
// or
import { ProductionEditor } from '@/components/editor/ProductionEditor';
```

### 2. Update Component Usage

**Before:**
```tsx
<RichTextEditor
  content={content}
  onChange={setContent}
  placeholder="Enter content..."
/>
```

**After:**
```tsx
<ProductionEditor
  content={content}
  onChange={setContent}
  config={{
    placeholder: "Enter content...",
    autosave: true,
    autosaveDelay: 2000,
    enableBubbleMenu: true,
  }}
  callbacks={{
    onSave: async (content) => {
      await saveToDatabase(content);
    },
    onError: (error) => {
      console.error(error);
    },
  }}
/>
```

### 3. Update Preview Component

**Before:**
```tsx
<RichTextRenderer content={content} />
```

**After:**
```tsx
import { EditorPreview } from '@/components/editor';

<EditorPreview content={content} />
```

### 4. Add Autosave (Optional)

```tsx
<ProductionEditor
  content={content}
  onChange={setContent}
  config={{
    autosave: true,
    autosaveDelay: 2000, // 2 seconds
  }}
  callbacks={{
    onSave: async (content) => {
      // Save to your backend
      await fetch('/api/save', {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
    },
  }}
/>
```

## API Reference

### ProductionEditor Props

```typescript
interface RichTextEditorProps {
  content: string;                    // HTML content
  onChange: (content: string) => void; // Called on every change
  config?: {
    placeholder?: string;              // Placeholder text
    maxLength?: number;                // Max character count (default: 50000)
    autosave?: boolean;                // Enable autosave (default: true)
    autosaveDelay?: number;            // Debounce delay in ms (default: 2000)
    enableBubbleMenu?: boolean;        // Show bubble menu on selection (default: true)
    readOnly?: boolean;                // Read-only mode (default: false)
    editable?: boolean;                // Editable mode (default: true)
  };
  callbacks?: {
    onSave?: (content: string) => Promise<void>;  // Autosave callback
    onBlur?: () => void;                          // Editor blur
    onFocus?: () => void;                         // Editor focus
    onError?: (error: Error) => void;             // Error handler
    onUploadStart?: () => void;                   // Upload started
    onUploadComplete?: (response) => void;        // Upload completed
    onUploadError?: (error: Error) => void;       // Upload failed
  };
  className?: string;                  // Additional CSS classes
}
```

### EditorPreview Props

```typescript
interface RichTextPreviewProps {
  content: string;      // HTML content to render
  className?: string;   // Additional CSS classes
}
```

## Use Cases

### Campaign Description Editor

```tsx
import { ProductionEditor } from '@/components/editor';
import { EDITOR_PLACEHOLDERS } from '@/lib/editor/constants';

<ProductionEditor
  content={campaign.description}
  onChange={(content) => setFormData({ ...formData, description: content })}
  config={{
    placeholder: EDITOR_PLACEHOLDERS.CAMPAIGN_DESCRIPTION,
    maxLength: 50000,
    autosave: true,
  }}
  callbacks={{
    onSave: async (content) => {
      await updateCampaign({ description: content });
    },
  }}
/>
```

### Update Post Editor

```tsx
<ProductionEditor
  content={updatePost.content}
  onChange={setContent}
  config={{
    placeholder: EDITOR_PLACEHOLDERS.UPDATE_POST,
    autosave: true,
  }}
  callbacks={{
    onSave: async (content) => {
      await saveUpdatePost(content);
    },
  }}
/>
```

### FAQ Editor

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

## Validation & Sanitization

### Validate Content

```typescript
import { validateContent } from '@/lib/editor/validation';

const result = validateContent(content, {
  required: true,
  minLength: 100,
  maxLength: 50000,
  maxImages: 20,
});

if (!result.isValid) {
  console.error(result.errors);
}
```

### Sanitize Content

```typescript
import { sanitizeHtml, sanitizeForPreview } from '@/lib/editor/sanitize';

// For storage
const clean = sanitizeHtml(userContent);

// For preview/display
const safe = sanitizeForPreview(userContent);
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | Bold |
| `Ctrl+I` | Italic |
| `Ctrl+U` | Underline |
| `Ctrl+K` | Insert link |
| `Ctrl+E` | Inline code |
| `Ctrl+Shift+8` | Bullet list |
| `Ctrl+Shift+7` | Numbered list |
| `Ctrl+Shift+9` | Task list |
| `Ctrl+Alt+1` | Heading 1 |
| `Ctrl+Alt+2` | Heading 2 |
| `Ctrl+Alt+3` | Heading 3 |
| `/` | Slash commands |

## Slash Commands

Type `/` in the editor to see available commands:

- `/heading1` - Large heading
- `/heading2` - Medium heading
- `/heading3` - Small heading
- `/bullet` - Bullet list
- `/numbered` - Numbered list
- `/checklist` - Task list
- `/quote` - Blockquote
- `/code` - Code block
- `/divider` - Horizontal rule
- `/info` - Info callout
- `/warning` - Warning callout
- `/success` - Success callout
- `/danger` - Danger callout

## Backward Compatibility

The old `RichTextEditor` component is still available for backward compatibility, but it's recommended to migrate to `ProductionEditor` for new features and better performance.

```tsx
// Still works, but deprecated
import RichTextEditor from '@/components/editor/RichTextEditor';
```

## Demo

Visit `/demo/production-editor` to see all features in action.

## Troubleshooting

### Images not uploading
- Check that `/api/upload` endpoint is working
- Verify Cloudinary credentials in `.env`
- Check file size limit (default: 5MB)

### Autosave not working
- Ensure `onSave` callback is provided
- Check browser console for errors
- Verify network connectivity

### Content not rendering
- Check that content is properly sanitized
- Verify HTML structure is valid
- Use `EditorPreview` component for safe rendering

## Support

For issues or questions, check:
- Demo page: `/demo/production-editor`
- Type definitions: `src/types/editor.ts`
- Constants: `src/lib/editor/constants.ts`
- Validation: `src/lib/editor/validation.ts`
- Sanitization: `src/lib/editor/sanitize.ts`
