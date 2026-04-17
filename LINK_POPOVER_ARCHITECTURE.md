# Link Popover - Architecture & Flow

## 🏗️ Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    RichTextEditor.tsx                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                      Toolbar                            │ │
│  │  [B] [I] [U] [🔗] [H1] [H2] ...                        │ │
│  │                      ↓ onClick                          │ │
│  │              handleLinkClick()                          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Editor Content Area                        │ │
│  │                                                          │ │
│  │  Lorem ipsum dolor sit amet...                          │ │
│  │  [Selected text] ← caret/selection position            │ │
│  │         ↓                                                │ │
│  │    ┌─────────────────────────────────┐                 │ │
│  │    │  LinkPopover (floating)         │                 │ │
│  │    │  ┌───────────────────────────┐  │                 │ │
│  │    │  │ 🔗 Chèn liên kết          │  │                 │ │
│  │    │  ├───────────────────────────┤  │                 │ │
│  │    │  │ [example.com...        ]  │  │                 │ │
│  │    │  │                           │  │                 │ │
│  │    │  │ [✓ Áp dụng] [✗ Hủy]      │  │                 │ │
│  │    │  │                           │  │                 │ │
│  │    │  │ Enter/Esc hints           │  │                 │ │
│  │    │  └───────────────────────────┘  │                 │ │
│  │    └─────────────────────────────────┘                 │ │
│  │                                                          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  State:                                                      │
│  - isLinkPopoverOpen: boolean                               │
│  - linkPopoverInitialUrl: string                            │
│  - isLinkEditMode: boolean                                  │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

### 1. User clicks link icon

```
User Action
    ↓
handleLinkClick()
    ↓
Check: Is cursor in existing link?
    ├─ YES → Edit Mode
    │   ├─ setLinkPopoverInitialUrl(existingUrl)
    │   └─ setIsLinkEditMode(true)
    │
    └─ NO → Insert Mode
        ├─ setLinkPopoverInitialUrl('')
        └─ setIsLinkEditMode(false)
    ↓
setIsLinkPopoverOpen(true)
    ↓
LinkPopover renders
```

### 2. LinkPopover opens

```
LinkPopover mounted
    ↓
useEffect (isOpen changed)
    ↓
calculatePosition()
    ├─ Get editor.state.selection
    ├─ Get editor.view.coordsAtPos(to)
    ├─ Calculate relative to editor container
    └─ setPosition({ top, left })
    ↓
Focus input & select text
    ↓
Setup event listeners
    ├─ Click outside
    ├─ Keyboard (Enter/Escape)
    └─ URL validation
```

### 3. User enters URL

```
User types in input
    ↓
handleUrlChange(value)
    ↓
setUrl(value)
    ↓
Clear error if exists
    ↓
Real-time validation (optional)
```

### 4. User applies link

```
User presses Enter or clicks "Áp dụng"
    ↓
handleApply()
    ↓
Validate URL
    ├─ Empty? → Show error
    ├─ Invalid? → Show error
    └─ Valid → Continue
    ↓
normalizeUrl(url)
    ├─ "example.com" → "https://example.com"
    └─ "https://..." → keep as is
    ↓
Check: Has selection?
    ├─ YES → Apply to selection
    │   └─ editor.chain().setLink({ href: url })
    │
    └─ NO → Insert as text + link
        └─ editor.chain().insertContent(...)
    ↓
onClose()
    ↓
Popover unmounts
```

## 📐 Position Calculation

```typescript
// Step 1: Get selection coordinates
const { state, view } = editor;
const { from, to } = state.selection;

// Step 2: Get DOM coordinates at selection end
const coords = view.coordsAtPos(to);
// coords = { top: 150, bottom: 170, left: 200, right: 250 }

// Step 3: Get editor container position
const editorRect = view.dom.getBoundingClientRect();
// editorRect = { top: 100, left: 50, ... }

// Step 4: Calculate relative position
const top = coords.bottom - editorRect.top + 8;  // 170 - 100 + 8 = 78
const left = coords.left - editorRect.left;      // 200 - 50 = 150

// Step 5: Apply to popover
setPosition({ top: 78, left: 150 });
```

### Visual Representation

```
Browser Viewport
┌─────────────────────────────────────────┐
│                                          │
│  ┌─────────────────────────────────┐   │
│  │  Editor Container               │   │
│  │  (position: relative)           │   │
│  │                                  │   │
│  │  Lorem ipsum [selected text]    │   │
│  │                ↑                 │   │
│  │                │ coords.bottom   │   │
│  │                ↓                 │   │
│  │         ┌──────────────┐        │   │
│  │         │  Popover     │        │   │
│  │         │  (absolute)  │        │   │
│  │         └──────────────┘        │   │
│  │         ↑              ↑        │   │
│  │         │              │        │   │
│  │      top: 78px    left: 150px  │   │
│  │                                  │   │
│  └─────────────────────────────────┘   │
│                                          │
└─────────────────────────────────────────┘
```

## 🎯 State Management

### Component State

```typescript
// RichTextEditor.tsx
const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
const [linkPopoverInitialUrl, setLinkPopoverInitialUrl] = useState('');
const [isLinkEditMode, setIsLinkEditMode] = useState(false);

// LinkPopover.tsx
const [url, setUrl] = useState(initialUrl);
const [error, setError] = useState('');
const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
```

### State Transitions

```
Initial State
    isLinkPopoverOpen: false
    linkPopoverInitialUrl: ''
    isLinkEditMode: false
    ↓
User clicks link icon (no existing link)
    isLinkPopoverOpen: true
    linkPopoverInitialUrl: ''
    isLinkEditMode: false
    ↓
User clicks link icon (existing link)
    isLinkPopoverOpen: true
    linkPopoverInitialUrl: 'https://example.com'
    isLinkEditMode: true
    ↓
User closes popover
    isLinkPopoverOpen: false
    (other states unchanged)
```

## 🔌 Event Handling

### Click Outside

```typescript
useEffect(() => {
  if (!isOpen) return;

  const handleClickOutside = (event: MouseEvent) => {
    if (!popoverRef.current?.contains(event.target)) {
      onClose();
    }
  };

  // Delay to prevent immediate close
  const timeoutId = setTimeout(() => {
    document.addEventListener('mousedown', handleClickOutside);
  }, 100);

  return () => {
    clearTimeout(timeoutId);
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [isOpen, onClose]);
```

### Keyboard Shortcuts

```typescript
useEffect(() => {
  if (!isOpen) return;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleApply();
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [isOpen, url, onClose]);
```

## 🎨 CSS Architecture

```css
/* Popover Container */
.popover {
  position: absolute;      /* Relative to editor container */
  z-index: 50;            /* Above editor content */
  top: [calculated]px;    /* From position state */
  left: [calculated]px;   /* From position state */
}

/* Editor Container (must have) */
.editor-container {
  position: relative;     /* Required for absolute positioning */
}
```

## 🔄 Lifecycle

```
Mount
  ↓
isOpen = true
  ↓
calculatePosition()
  ↓
Focus input
  ↓
Setup listeners
  ↓
User interaction
  ↓
Apply or Cancel
  ↓
onClose()
  ↓
Cleanup listeners
  ↓
Unmount
```

## 🧩 Integration Points

### With Tiptap Editor

```typescript
// Get link at cursor
editor.getAttributes('link').href

// Set link
editor.chain().focus()
  .extendMarkRange('link')
  .setLink({ href: url })
  .run()

// Remove link
editor.chain().focus()
  .unsetLink()
  .run()

// Insert content with link
editor.chain().focus()
  .insertContent({
    type: 'text',
    text: text,
    marks: [{ type: 'link', attrs: { href: url } }]
  })
  .run()
```

### With URL Validation

```typescript
import { normalizeUrl, isValidUrl } from './utils/urlValidation';

// Normalize
const normalized = normalizeUrl('example.com');
// → 'https://example.com'

// Validate
const isValid = isValidUrl('example.com');
// → true
```

## 📊 Performance Considerations

### Optimization Techniques

1. **useCallback for handlers**
   ```typescript
   const handleLinkClick = useCallback(() => {
     // Stable reference, no re-render
   }, [editor]);
   ```

2. **Debounced position calculation**
   ```typescript
   // Only recalculate when needed
   useEffect(() => {
     if (isOpen) calculatePosition();
   }, [isOpen]);
   ```

3. **Event listener cleanup**
   ```typescript
   useEffect(() => {
     // Setup
     return () => {
       // Cleanup to prevent memory leaks
     };
   }, []);
   ```

## 🎯 Key Design Decisions

1. **Position anchoring**: Caret/selection, NOT mouse
   - Why: Better UX, follows user's focus
   
2. **Floating popover**: Not modal dialog
   - Why: Less intrusive, faster workflow

3. **Real-time validation**: Show errors immediately
   - Why: Better feedback, prevent mistakes

4. **Auto-focus input**: Focus on open
   - Why: Faster typing, better UX

5. **Click outside to close**: Standard behavior
   - Why: Intuitive, matches user expectations

## 🔮 Future Enhancements

1. **Smart positioning**: Flip if near viewport edge
2. **Link preview**: Show preview on hover
3. **Recent links**: Suggest recently used URLs
4. **Link validation**: Check if URL is reachable
5. **Accessibility**: Improve ARIA labels and keyboard nav
