# TEMP RICH TEXT SOURCE EXPORT

File này là bản tổng hợp mã nguồn Rich Text Editor/Renderer của TửTế Fund để gửi cho ChatGPT phân tích.
Không phải tài liệu chính thức.
Có thể xóa sau khi dùng xong.

## 1. Mục tiêu phân tích

Rich Text cần được cải thiện cho:
- Tạo chiến dịch
- Chỉnh sửa chiến dịch
- Cập nhật chiến dịch
- Viết blog
- Hiển thị nội dung đã lưu
- Chèn link/ảnh/video
- Toolbar/bubble menu
- Mobile/responsive
- Creator UX

## 2. Danh sách file đã gom

| STT | File | Vai trò |
|---|---|---|
| 1 | `src/components/editor/ProductionEditor.tsx` | Rich Text Editor chính |
| 2 | `src/components/editor/RichTextEditor.tsx` | Rich Text Editor (legacy) |
| 3 | `src/components/editor/EditorToolbar.tsx` | Toolbar editor |
| 4 | `src/components/editor/EditorBubbleMenu.tsx` | Bubble menu floating |
| 5 | `src/components/editor/LinkPopover.tsx` | Popover chèn link |
| 6 | `src/components/editor/VideoPopover.tsx` | Popover chèn video |
| 7 | `src/components/editor/editor.css` | Styles cho editor |
| 8 | `src/components/editor/extensions/index.ts` | Cấu hình extensions |
| 9 | `src/components/editor/extensions/callout.ts` | Extension callout |
| 10 | `src/components/editor/extensions/image-with-caption.ts` | Extension ảnh có caption |
| 11 | `src/components/editor/extensions/video-embed.ts` | Extension video embed |
| 12 | `src/components/editor/extensions/slash-command.tsx` | Extension slash command |
| 13 | `src/components/editor/index.ts` | Export public API |
| 14 | `src/components/shared/RichTextRenderer.tsx` | Renderer hiển thị rich text |
| 15 | `src/app/campaigns/create/page.tsx` | Trang tạo chiến dịch (sử dụng editor) |
| 16 | `src/components/campaign/CampaignEditForm.tsx` | Form edit chiến dịch (sử dụng editor) |
| 17 | `src/components/campaign/UpdateSection.tsx` | Section cập nhật chiến dịch (sử dụng editor & renderer) |
| 18 | `src/components/campaign/CampaignTabsWrapper.tsx` | Tabs wrapper chiến dịch (sử dụng renderer) |
| 19 | `src/app/blog/editor/page.tsx` | Blog editor (sử dụng editor) |
| 20 | `src/app/blog/[slug]/page.tsx` | Blog detail page (hiển thị content) |
| 21 | `src/components/blog/BlogCard.tsx` | Blog card component |
| 22 | `src/lib/editor/constants.ts` | Constants editor |
| 23 | `src/types/editor.ts` | Types cho editor |
| 24 | `src/lib/editor/link-validation.ts` | Validation cho link |
| 25 | `src/lib/editor/link-commands.ts` | Commands cho link |

## 3. File không tìm thấy

- `src/components/blog/BlogEditor.tsx` - Không tồn tại
- `src/components/blog/BlogContent.tsx` - Không tồn tại

## 4. Nơi Rich Text đang được dùng

| Trang/Component | File | Field | Vai trò |
|---|---|---|---|
| Tạo chiến dịch | `src/app/campaigns/create/page.tsx` | `description` | Nhập mô tả chiến dịch |
| Edit chiến dịch | `src/components/campaign/CampaignEditForm.tsx` | `description` | Chỉnh sửa mô tả chiến dịch |
| Cập nhật chiến dịch | `src/components/campaign/UpdateSection.tsx` | `content` | Nhập nội dung cập nhật |
| Cập nhật chiến dịch (hiển thị) | `src/components/campaign/UpdateSection.tsx` | `content` | Hiển thị nội dung cập nhật |
| Chi tiết chiến dịch | `src/components/campaign/CampaignTabsWrapper.tsx` | `longDescription` hoặc `description` | Hiển thị mô tả chiến dịch |
| Blog editor | `src/app/blog/editor/page.tsx` | `content` | Nhập nội dung blog |
| Blog detail | `src/app/blog/[slug]/page.tsx` | `content` hoặc `richContent` | Hiển thị nội dung blog |

---

## 5. Source Code

### 5.1 `src/components/editor/ProductionEditor.tsx`

```tsx
/**
 * Production-Ready Rich Text Editor
 * Complete editor with all features, optimizations, and security
 */

'use client';

import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Editor } from '@tiptap/core';
import { getEditorExtensions } from './extensions';
import { EditorToolbar } from './EditorToolbar';
import { EditorBubbleMenu } from './EditorBubbleMenu';
import { LinkPopover } from './LinkPopover';
import { VideoPopover } from './VideoPopover';
import { getLinkAtCursor, isSelectionInsideLink, saveSelection, type SavedSelection } from '@/lib/editor/link-commands';
import { sanitizeHtml } from '@/lib/editor/sanitize';
import { getUrlError, normalizeUrl, isValidVideoUrl, getVideoProvider } from '@/lib/editor/validation';
import { EDITOR_LIMITS, ERROR_MESSAGES } from '@/lib/editor/constants';
import { RichTextEditorProps, SaveStatus, UploadProgress } from '@/types/editor';
import { toast } from 'sonner';
import './editor.css';

export function ProductionEditor({
  content,
  onChange,
  config = {},
  callbacks = {},
  className = '',
}: RichTextEditorProps) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
  const [linkPopoverInitialUrl, setLinkPopoverInitialUrl] = useState('');
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);
  const [linkSavedSelection, setLinkSavedSelection] = useState<SavedSelection | null>(null);
  const [isVideoPopoverOpen, setIsVideoPopoverOpen] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const editorRef = useRef<Editor | null>(null);
  const isMountedRef = useRef(true);
  const onChangeDebounceRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isLinkPopoverOpenRef = useRef(false); // Track popover state
  const isVideoPopoverOpenRef = useRef(false); // Track video popover state

  // Editor configuration
  const {
    placeholder,
    maxLength = EDITOR_LIMITS.MAX_CONTENT_LENGTH,
    autosave = true,
    autosaveDelay = EDITOR_LIMITS.AUTOSAVE_DELAY,
    enableBubbleMenu = true,
    readOnly = false,
    editable = true,
  } = config;

  // Initialize editor
  const editor = useEditor({
    immediatelyRender: false, // Fix SSR hydration warning
    extensions: getEditorExtensions({
      placeholder,
      maxLength,
    }),
    content: content || '',
    editable: editable && !readOnly,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none min-h-[400px] px-6 py-6 focus:outline-none',
      },
      handlePaste: (view, event, slice) => {
        // Let Tiptap handle paste, it will sanitize through extensions
        return false;
      },
      handleDOMEvents: {
        // Simplified - no special handling needed
        // LinkPopover handles its own click outside
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();

      // Update counts (debounced for performance)
      if (onChangeDebounceRef.current) {
        clearTimeout(onChangeDebounceRef.current);
      }

      onChangeDebounceRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          const text = editor.getText();
          setWordCount(text.split(/\s+/).filter(w => w.length > 0).length);
          setCharCount(text.length);
        }
      }, 300);

      // Call onChange callback immediately
      onChange(html);

      // Handle autosave
      if (autosave && callbacks.onSave) {
        handleAutosave(html);
      } else {
        if (isMountedRef.current) {
          setSaveStatus('idle');
        }
      }
    },
    onFocus: ({ editor, event }) => {
      console.log('[ProductionEditor] Editor focused');
      callbacks.onFocus?.();
    },
    onBlur: ({ editor, event }) => {
      console.log('[ProductionEditor] Editor blurred');
      callbacks.onBlur?.();
    },
  });

  // Store editor ref and track mount status
  useEffect(() => {
    isMountedRef.current = true;
    if (editor) {
      editorRef.current = editor;
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [editor]);

  // Sync content when prop changes (external updates)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      const { from, to } = editor.state.selection;
      editor.commands.setContent(content, false);
      // Restore selection if possible
      if (from !== to) {
        editor.commands.setTextSelection({ from, to });
      }
    }
  }, [content, editor]);

  // Autosave handler with debounce
  const handleAutosave = useCallback(
    (content: string) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      setSaveStatus('saving');

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          if (callbacks.onSave) {
            await callbacks.onSave(content);
            if (isMountedRef.current) {
              setSaveStatus('saved');
              setLastSaved(new Date());
            }
          }
        } catch (error) {
          if (isMountedRef.current) {
            setSaveStatus('error');
          }
          callbacks.onError?.(error as Error);
          toast.error(ERROR_MESSAGES.SAVE_FAILED);
        }
      }, autosaveDelay);
    },
    [callbacks, autosaveDelay]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (onChangeDebounceRef.current) {
        clearTimeout(onChangeDebounceRef.current);
      }
    };
  }, []);

  // Image upload handler
  const handleImageUpload = useCallback(async () => {
    if (!editor) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Validate file
      if (file.size > EDITOR_LIMITS.MAX_IMAGE_SIZE) {
        toast.error(ERROR_MESSAGES.FILE_TOO_LARGE);
        return;
      }

      try {
        setIsUploading(true);
        callbacks.onUploadStart?.();

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();

        // Insert image
        editor.chain().focus().setImage({
          src: data.url,
          alt: file.name,
        }).run();

        callbacks.onUploadComplete?.(data);
        toast.success('Ảnh đã được tải lên');
      } catch (error) {
        console.error('Upload error:', error);
        callbacks.onUploadError?.(error as Error);
        toast.error(ERROR_MESSAGES.UPLOAD_FAILED);
      } finally {
        setIsUploading(false);
      }
    };

    input.click();
  }, [editor, callbacks]);

  // Video embed handler with modern popover
  const handleVideoEmbed = useCallback(() => {
    if (!editorRef.current) return;

    // CRITICAL: Prevent reopen if already open
    if (isVideoPopoverOpenRef.current) {
      console.log('[ProductionEditor] Video popover already open - ignoring');
      return;
    }

    console.log('[ProductionEditor] handleVideoEmbed called');

    // Set ref BEFORE state
    isVideoPopoverOpenRef.current = true;

    // Open popover
    console.log('[ProductionEditor] Opening video popover');
    setIsVideoPopoverOpen(true);
  }, []);

  // Close video popover handler
  const handleVideoPopoverClose = useCallback(() => {
    console.log('[ProductionEditor] Closing video popover');
    isVideoPopoverOpenRef.current = false;
    setIsVideoPopoverOpen(false);
  }, []);

  // Link insert handler with modern popover
  const handleLinkInsert = useCallback(() => {
    const currentEditor = editorRef.current;
    if (!currentEditor) return;

    // CRITICAL: Prevent reopen if already open
    if (isLinkPopoverOpenRef.current) {
      console.log('[ProductionEditor] Popover already open - ignoring');
      return;
    }

    console.log('[ProductionEditor] handleLinkInsert called');

    // Save selection
    const selection = saveSelection(currentEditor);
    console.log('[ProductionEditor] Saved selection:', selection);
    setLinkSavedSelection(selection);

    // Check for existing link
    const previousUrl = getLinkAtCursor(currentEditor);

    if (previousUrl) {
      console.log('[ProductionEditor] Edit mode');
      setLinkPopoverInitialUrl(previousUrl);
      setIsLinkEditMode(true);
    } else {
      console.log('[ProductionEditor] Insert mode');
      setLinkPopoverInitialUrl('');
      setIsLinkEditMode(false);
    }

    // Set ref BEFORE state
    isLinkPopoverOpenRef.current = true;

    // Open popover
    console.log('[ProductionEditor] Opening popover');
    setIsLinkPopoverOpen(true);
  }, []); // Stable reference

  // Close popover handler
  const handleLinkPopoverClose = useCallback(() => {
    console.log('[ProductionEditor] Closing popover');
    isLinkPopoverOpenRef.current = false;
    setIsLinkPopoverOpen(false);
  }, []);

  // Keyboard shortcuts (fixed - use stable callback)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if editor is focused
      if (!editorRef.current?.isFocused) return;

      // Ctrl/Cmd + K for link
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        e.stopPropagation();
        handleLinkInsert();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true); // Capture phase
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [handleLinkInsert]);

  if (!editor) {
    return (
      <div className="w-full border border-gray-200 rounded-lg bg-gray-50 animate-pulse">
        <div className="h-12 bg-gray-200" />
        <div className="h-96" />
      </div>
    );
  }

  return (
    <div className={`w-full border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all ${className}`}>
      {/* Toolbar */}
      <EditorToolbar
        editor={editor}
        onImageUpload={handleImageUpload}
        onVideoEmbed={handleVideoEmbed}
        onLinkInsert={handleLinkInsert}
      />

      {/* Bubble Menu */}
      {enableBubbleMenu && (
        <EditorBubbleMenu
          editor={editor}
          onLinkInsert={handleLinkInsert}
        />
      )}

      {/* Editor Content */}
      <div
        className="cursor-text bg-white relative"
        onClick={() => editor.commands.focus()}
      >
        <EditorContent editor={editor} />

        {/* Keep selection visible when link popover is open */}
        {isLinkPopoverOpen && (
          <style>{`
            /* Keep selection visible even when editor loses focus */
            .ProseMirror-selectednode {
              outline: 2px solid rgba(59, 130, 246, 0.4);
            }
            
            /* Fake selection highlight when popover is open */
            .ProseMirror::selection,
            .ProseMirror ::selection {
              background-color: rgba(59, 130, 246, 0.3) !important;
            }
            
            /* Even when not focused */
            .ProseMirror:not(:focus)::selection,
            .ProseMirror:not(:focus) ::selection {
              background-color: rgba(59, 130, 246, 0.25) !important;
            }
          `}</style>
        )}

        {/* Link Popover */}
        {isLinkPopoverOpen && (
          <LinkPopover
            editor={editor}
            isOpen={isLinkPopoverOpen}
            onClose={handleLinkPopoverClose}
            initialUrl={linkPopoverInitialUrl}
            isEditMode={isLinkEditMode}
            savedSelection={linkSavedSelection}
          />
        )}

        {/* Video Popover */}
        {isVideoPopoverOpen && (
          <VideoPopover
            editor={editor}
            isOpen={isVideoPopoverOpen}
            onClose={handleVideoPopoverClose}
          />
        )}

        {/* Upload overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium text-gray-700">Đang tải ảnh lên...</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        {/* Save Status */}
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          <div
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${saveStatus === 'saved'
              ? 'bg-emerald-500'
              : saveStatus === 'saving'
                ? 'bg-amber-500 animate-pulse'
                : saveStatus === 'error'
                  ? 'bg-red-500'
                  : 'bg-gray-300'
              }`}
          />
          <span>
            {saveStatus === 'saved' && lastSaved
              ? `Đã lưu ${formatRelativeTime(lastSaved)}`
              : saveStatus === 'saving'
                ? 'Đang lưu...'
                : saveStatus === 'error'
                  ? 'Lỗi khi lưu'
                  : 'Chưa lưu'}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-gray-400">
            {wordCount} từ
          </span>
          <span className="text-xs font-semibold text-gray-400">
            {charCount} / {maxLength} ký tự
          </span>
        </div>
      </div>
    </div>
  );
}

// Helper function
function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 10) return 'vừa xong';
  if (seconds < 60) return `${seconds} giây trước`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;

  return date.toLocaleDateString('vi-VN');
}
```

### 5.2 `src/components/editor/RichTextEditor.tsx`

```tsx
/**
 * Simplified Enhanced Rich Text Editor - Without BubbleMenu to avoid React 19 issues
 */

'use client';

import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Youtube from '@tiptap/extension-youtube';
import TextStyle from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CharacterCount from '@tiptap/extension-character-count';
import Image from '@tiptap/extension-image';

import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Link as LinkIcon, Heading1, Heading2, Quote, Code,
  Minus, Undo, Redo, Youtube as YoutubeIcon,
  Highlighter, CheckSquare, ImageIcon
} from 'lucide-react';

import { getLinkAtCursor, isSelectionInsideLink, saveSelection, type SavedSelection } from '@/lib/editor/link-commands';
import { LinkPopover } from './LinkPopover';
import { VideoPopover } from './VideoPopover';
import './editor.css';

interface SimplifiedEnhancedEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

type ToolbarButtonProps = {
  onClick: () => void;
  isActive?: boolean;
  title: string;
  children: React.ReactNode;
};

function ToolbarButton({ onClick, isActive, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`
        flex items-center justify-center w-8 h-8 rounded-md text-sm transition-all duration-150
        ${isActive
          ? "bg-blue-100 text-blue-700 shadow-inner"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }
      `}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-gray-200 mx-1 flex-shrink-0" />;
}

export default function SimplifiedEnhancedEditor({ 
  content, 
  onChange, 
  placeholder 
}: SimplifiedEnhancedEditorProps) {
  const [saveStatus, setSaveStatus] = useState("Đã lưu");
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
  const [linkPopoverInitialUrl, setLinkPopoverInitialUrl] = useState('');
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);
  const [linkSavedSelection, setLinkSavedSelection] = useState<SavedSelection | null>(null);
  const [isVideoPopoverOpen, setIsVideoPopoverOpen] = useState(false);
  const isVideoPopoverOpenRef = useRef(false); // Track video popover state

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Underline,
      TextStyle,
      Highlight.configure({ multicolor: true }),
      Link.configure({ 
        openOnClick: false, 
        HTMLAttributes: { 
          class: "text-blue-600 underline cursor-pointer hover:text-blue-700" 
        } 
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Youtube.configure({ controls: false, nocookie: true }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto my-4",
        },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ 
        placeholder: placeholder ?? "Viết nội dung chiến dịch của bạn ở đây..." 
      }),
      CharacterCount.configure({ limit: 50000 }),
    ],
    content: content || "",
    editorProps: {
      attributes: {
        class: "prose prose-lg max-w-none min-h-[400px] px-6 py-6 sm:px-8 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      setSaveStatus("Đang lưu...");
      onChange(editor.getHTML());
      
      setTimeout(() => {
        setSaveStatus("Đã lưu");
      }, 500);
    },
  });

  // Modern link insertion with floating popover
  const handleLinkClick = useCallback(() => {
    if (!editor) return;

    // CRITICAL: Save selection FIRST, before any state changes
    const selection = saveSelection(editor);
    setLinkSavedSelection(selection);

    // Check if cursor is in an existing link
    const existingUrl = getLinkAtCursor(editor);
    
    if (existingUrl) {
      // Edit mode - show existing URL
      setLinkPopoverInitialUrl(existingUrl);
      setIsLinkEditMode(true);
    } else {
      // Insert mode
      setLinkPopoverInitialUrl('');
      setIsLinkEditMode(false);
    }

    // Open popover AFTER saving selection
    setIsLinkPopoverOpen(true);
  }, [editor]);

  // Keyboard shortcut for link (Ctrl/Cmd + K)
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if editor is focused
      if (!editor.isFocused) return;
      
      // Ctrl/Cmd + K for link
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        e.stopPropagation();
        handleLinkClick();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [editor, handleLinkClick]);

  const addYoutube = useCallback(() => {
    if (!editor) return;

    // CRITICAL: Prevent reopen if already open
    if (isVideoPopoverOpenRef.current) {
      console.log('[RichTextEditor] Video popover already open - ignoring');
      return;
    }

    console.log('[RichTextEditor] addYoutube called');

    // Set ref BEFORE state
    isVideoPopoverOpenRef.current = true;
    
    // Open popover
    console.log('[RichTextEditor] Opening video popover');
    setIsVideoPopoverOpen(true);
  }, [editor]);
  
  // Close video popover handler
  const handleVideoPopoverClose = useCallback(() => {
    console.log('[RichTextEditor] Closing video popover');
    isVideoPopoverOpenRef.current = false;
    setIsVideoPopoverOpen(false);
  }, []);

  const addImage = useCallback(() => {
    if (!editor) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước ảnh không được vượt quá 5MB');
        return;
      }

      // Show loading state
      setSaveStatus("Đang tải ảnh...");

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        
        // Insert image into editor
        editor.chain().focus().setImage({ src: data.url }).run();
        setSaveStatus("Đã lưu");
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Lỗi khi tải ảnh lên. Vui lòng thử lại.');
        setSaveStatus("Đã lưu");
      }
    };
    
    input.click();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="w-full border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
      
      {/* ── TOOLBAR ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 bg-gray-50 border-b border-gray-200">
        
        {/* History */}
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Hoàn tác (Ctrl+Z)">
          <Undo size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Làm lại (Ctrl+Y)">
          <Redo size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Headings */}
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
          isActive={editor.isActive("heading", { level: 1 })} 
          title="Tiêu đề 1"
        >
          <Heading1 size={15} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
          isActive={editor.isActive("heading", { level: 2 })} 
          title="Tiêu đề 2"
        >
          <Heading2 size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Text formatting */}
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          isActive={editor.isActive("bold")} 
          title="In đậm (Ctrl+B)"
        >
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          isActive={editor.isActive("italic")} 
          title="In nghiêng (Ctrl+I)"
        >
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleUnderline().run()} 
          isActive={editor.isActive("underline")} 
          title="Gạch chân (Ctrl+U)"
        >
          <UnderlineIcon size={15} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleStrike().run()} 
          isActive={editor.isActive("strike")} 
          title="Gạch ngang"
        >
          <Strikethrough size={15} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleHighlight().run()} 
          isActive={editor.isActive("highlight")} 
          title="Tô sáng (Highlight)"
        >
          <Highlighter size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Lists & Blocks */}
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleBulletList().run()} 
          isActive={editor.isActive("bulletList")} 
          title="Danh sách dấu chấm"
        >
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleOrderedList().run()} 
          isActive={editor.isActive("orderedList")} 
          title="Danh sách đánh số"
        >
          <ListOrdered size={15} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleTaskList().run()} 
          isActive={editor.isActive("taskList")} 
          title="Checklist công việc"
        >
          <CheckSquare size={15} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleBlockquote().run()} 
          isActive={editor.isActive("blockquote")} 
          title="Trích dẫn"
        >
          <Quote size={15} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleCode().run()} 
          isActive={editor.isActive("code")} 
          title="Code"
        >
          <Code size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Alignment */}
        <ToolbarButton 
          onClick={() => editor.chain().focus().setTextAlign("left").run()} 
          isActive={editor.isActive({ textAlign: "left" })} 
          title="Căn trái"
        >
          <AlignLeft size={15} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().setTextAlign("center").run()} 
          isActive={editor.isActive({ textAlign: "center" })} 
          title="Căn giữa"
        >
          <AlignCenter size={15} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().setTextAlign("right").run()} 
          isActive={editor.isActive({ textAlign: "right" })} 
          title="Căn phải"
        >
          <AlignRight size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Insert - Improved Link with validation */}
        <ToolbarButton 
          onClick={handleLinkClick} 
          isActive={isSelectionInsideLink(editor)} 
          title="Chèn liên kết (Ctrl+K)"
        >
          <LinkIcon size={15} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().setHorizontalRule().run()} 
          title="Đường kẻ ngang"
        >
          <Minus size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={addYoutube} title="Chèn video YouTube">
          <YoutubeIcon size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} title="Chèn ảnh">
          <ImageIcon size={15} />
        </ToolbarButton>
      </div>

      {/* ── EDITOR AREA ── */}
      <div className="cursor-text bg-white relative" onClick={() => editor.commands.focus()}>
        <EditorContent editor={editor} />
        
        {/* Link Popover */}
        {isLinkPopoverOpen && (
          <LinkPopover
            editor={editor}
            isOpen={isLinkPopoverOpen}
            onClose={() => setIsLinkPopoverOpen(false)}
            initialUrl={linkPopoverInitialUrl}
            isEditMode={isLinkEditMode}
            savedSelection={linkSavedSelection}
          />
        )}
        
        {/* Video Popover */}
        {isVideoPopoverOpen && (
          <VideoPopover
            editor={editor}
            isOpen={isVideoPopoverOpen}
            onClose={handleVideoPopoverClose}
          />
        )}
      </div>

      {/* ── FOOTER ── */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        {/* Left Side: Status */}
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
            saveStatus === "Đã lưu" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
          }`} />
          <span>{saveStatus}</span>
        </div>

        {/* Right Side: Counters */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-gray-400">
            {editor.storage.characterCount.words()} từ
          </span>
          <span className="text-xs font-semibold text-gray-400">
            {editor.storage.characterCount.characters()} ký tự
          </span>
        </div>
      </div>

      {/* ── TYPOGRAPHY STYLES ── */}
      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.5rem;
        }
        .ProseMirror ul { list-style-type: disc; }
        .ProseMirror ol { list-style-type: decimal; }
        .ProseMirror li { margin: 0.25rem 0; }
        .ProseMirror blockquote {
          border-left: 3px solid #e5e7eb;
          padding-left: 1rem;
          color: #6b7280;
          font-style: italic;
          margin: 1rem 0;
        }
        .ProseMirror hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 1.5rem 0;
        }
        .ProseMirror h1 { font-size: 1.875rem; font-weight: 700; margin: 1rem 0 0.5rem; }
        .ProseMirror h2 { font-size: 1.5rem; font-weight: 600; margin: 1rem 0 0.5rem; }
        .ProseMirror mark {
          background-color: #fef08a;
          border-radius: 2px;
          padding: 0.1em 0.2em;
        }
        .ProseMirror code {
          background: #f3f4f6;
          border-radius: 4px;
          padding: 0.1em 0.4em;
          font-size: 0.875em;
          font-family: monospace;
        }
        .ProseMirror a { 
          color: #2563eb; 
          text-decoration: underline;
          cursor: pointer;
        }
        .ProseMirror a:hover {
          color: #1d4ed8;
        }
        .ProseMirror iframe { 
          max-width: 100%; 
          border-radius: 8px; 
          margin: 1rem auto; 
          display: block; 
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1rem 0;
          display: block;
        }
        
        /* Task List Styles */
        ul[data-type="taskList"] {
          list-style: none;
          padding: 0;
        }
        ul[data-type="taskList"] li[data-type="taskItem"] {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          margin: 0.5rem 0;
        }
        ul[data-type="taskList"] li[data-type="taskItem"] > label {
          margin-top: 0.25rem;
          user-select: none;
        }
        ul[data-type="taskList"] li[data-type="taskItem"] > div {
          flex: 1;
        }
      `}</style>
    </div>
  );
}
```

### 5.3 `src/components/editor/EditorToolbar.tsx`

```tsx
/**
 * Editor Toolbar
 * Fixed toolbar with all formatting options
 */

'use client';

import React from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  CodeIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  Minus,
  Undo,
  Redo,
  Highlighter,
  Info,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface EditorToolbarProps {
  editor: Editor | null;
  onImageUpload?: () => void;
  onVideoEmbed?: () => void;
  onLinkInsert?: () => void;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
  'data-link-button'?: string;
  'data-video-button'?: string;
}

function ToolbarButton({ onClick, isActive, disabled, title, children, ...props }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      {...props}
      className={`
        flex items-center justify-center w-9 h-9 rounded-md transition-all duration-150
        disabled:opacity-30 disabled:cursor-not-allowed
        ${
          isActive
            ? 'bg-blue-100 text-blue-700 shadow-sm'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }
      `}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-gray-200 mx-1" />;
}

function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>;
}

export function EditorToolbar({ editor, onImageUpload, onVideoEmbed, onLinkInsert }: EditorToolbarProps) {
  if (!editor) return null;

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      {/* Desktop Toolbar */}
      <div className="hidden md:flex flex-wrap items-center gap-1 px-3 py-2">
        {/* History */}
        <ToolbarGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Hoàn tác (Ctrl+Z)"
        >
          <Undo size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Làm lại (Ctrl+Shift+Z)"
        >
          <Redo size={16} />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      {/* Headings */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Tiêu đề 1"
        >
          <Heading1 size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Tiêu đề 2"
        >
          <Heading2 size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Tiêu đề 3"
        >
          <Heading3 size={16} />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      {/* Text formatting */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="In đậm (Ctrl+B)"
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="In nghiêng (Ctrl+I)"
        >
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Gạch chân (Ctrl+U)"
        >
          <UnderlineIcon size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Gạch ngang"
        >
          <Strikethrough size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="Code (Ctrl+E)"
        >
          <Code size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive('highlight')}
          title="Tô sáng"
        >
          <Highlighter size={16} />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Danh sách dấu chấm"
        >
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Danh sách đánh số"
        >
          <ListOrdered size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          isActive={editor.isActive('taskList')}
          title="Checklist"
        >
          <CheckSquare size={16} />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      {/* Blocks */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Trích dẫn"
        >
          <Quote size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title="Code block"
        >
          <CodeIcon size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Đường kẻ ngang"
        >
          <Minus size={16} />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      {/* Alignment */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Căn trái"
        >
          <AlignLeft size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Căn giữa"
        >
          <AlignCenter size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Căn phải"
        >
          <AlignRight size={16} />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      {/* Insert */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={onLinkInsert || (() => {})}
          data-link-button="true"
          isActive={editor.isActive('link')}
          title="Chèn liên kết (Ctrl+K)"
        >
          <LinkIcon size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={onImageUpload || (() => {})}
          title="Chèn ảnh"
        >
          <ImageIcon size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={onVideoEmbed || (() => {})}
          data-video-button="true"
          title="Chèn video"
        >
          <Video size={16} />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      {/* Callouts */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().setCallout('info').run()}
          isActive={editor.isActive('callout', { variant: 'info' })}
          title="Info box"
        >
          <Info size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setCallout('warning').run()}
          isActive={editor.isActive('callout', { variant: 'warning' })}
          title="Warning box"
        >
          <AlertTriangle size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setCallout('success').run()}
          isActive={editor.isActive('callout', { variant: 'success' })}
          title="Success box"
        >
          <CheckCircle size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setCallout('danger').run()}
          isActive={editor.isActive('callout', { variant: 'danger' })}
          title="Danger box"
        >
          <AlertCircle size={16} />
        </ToolbarButton>
      </ToolbarGroup>
    </div>
    
    {/* Mobile Toolbar - Simplified */}
    <div className="flex md:hidden items-center gap-1 px-2 py-2 overflow-x-auto">
      {/* Essential formatting only */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold"
      >
        <Bold size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic"
      >
        <Italic size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={onLinkInsert || (() => {})}
        isActive={editor.isActive('link')}
        title="Link"
      >
        <LinkIcon size={16} />
      </ToolbarButton>
      
      <ToolbarDivider />
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        title="Heading"
      >
        <Heading2 size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="List"
      >
        <List size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        title="Quote"
      >
        <Quote size={16} />
      </ToolbarButton>
      
      <ToolbarDivider />
      
      <ToolbarButton
        onClick={onImageUpload || (() => {})}
        title="Image"
      >
        <ImageIcon size={16} />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <Undo size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <Redo size={16} />
      </ToolbarButton>
    </div>
  </div>
  );
}
```

### 5.4 `src/components/editor/EditorBubbleMenu.tsx`

```tsx
/**
 * Editor Bubble Menu
 * Floating menu that appears when text is selected
 */

'use client';

import React from 'react';
import { BubbleMenu, Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Link as LinkIcon,
  Highlighter,
} from 'lucide-react';

interface EditorBubbleMenuProps {
  editor: Editor | null;
  onLinkInsert?: () => void;
}

interface BubbleButtonProps {
  onClick: () => void;
  isActive?: boolean;
  title: string;
  children: React.ReactNode;
}

function BubbleButton({ onClick, isActive, title, children }: BubbleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={(e) => {
        // Prevent default to avoid focus issues
        e.preventDefault();
      }}
      title={title}
      className={`
        flex items-center justify-center w-8 h-8 rounded transition-all
        ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }
      `}
    >
      {children}
    </button>
  );
}

export function EditorBubbleMenu({ editor, onLinkInsert }: EditorBubbleMenuProps) {
  if (!editor) return null;

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{
        duration: 100,
        placement: 'top',
        animation: 'shift-toward-subtle',
      }}
      shouldShow={({ editor, state, view }) => {
        const { selection } = state;
        const { empty } = selection;
        
        // Don't show if selection is empty
        if (empty) return false;
        
        // Don't show if selection is in code block
        if (editor.isActive('codeBlock')) return false;
        
        // CRITICAL: Don't show if LinkPopover is open
        const linkPopover = document.querySelector('[data-link-popover="true"]');
        if (linkPopover) {
          console.log('[BubbleMenu] Hidden because LinkPopover is open');
          return false;
        }
        
        return true;
      }}
      className="flex items-center gap-0.5 px-2 py-1.5 bg-white border border-gray-200 rounded-lg shadow-lg"
    >
      <BubbleButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold"
      >
        <Bold size={14} />
      </BubbleButton>

      <BubbleButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic"
      >
        <Italic size={14} />
      </BubbleButton>

      <BubbleButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        title="Underline"
      >
        <UnderlineIcon size={14} />
      </BubbleButton>

      <BubbleButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        title="Strikethrough"
      >
        <Strikethrough size={14} />
      </BubbleButton>

      <BubbleButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        title="Code"
      >
        <Code size={14} />
      </BubbleButton>

      <BubbleButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        isActive={editor.isActive('highlight')}
        title="Highlight"
      >
        <Highlighter size={14} />
      </BubbleButton>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      <BubbleButton
        onClick={onLinkInsert || (() => {})}
        isActive={editor.isActive('link')}
        title="Link"
      >
        <LinkIcon size={14} />
      </BubbleButton>
    </BubbleMenu>
  );
}
```

### 5.5 `src/components/editor/LinkPopover.tsx`

```tsx
/**
 * Link Popover - Stable, no reopen loop, no input remount
 * Fixed: Click outside detection, input focus stability, no double render
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { Link as LinkIcon, Check, X, Trash2 } from 'lucide-react';
import {
  normalizeUrl,
  getUrlError,
  sanitizeUrlInput,
} from '@/lib/editor/link-validation';

interface LinkPopoverProps {
  editor: Editor;
  isOpen: boolean;
  onClose: () => void;
  initialUrl?: string;
  isEditMode?: boolean;
  savedSelection: { from: number; to: number } | null;
}

interface Position {
  top: number;
  left: number;
}

export function LinkPopover({
  editor,
  isOpen,
  onClose,
  initialUrl = '',
  isEditMode = false,
  savedSelection,
}: LinkPopoverProps) {
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState('');
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectionRef = useRef(savedSelection);

  // Update selection ref when prop changes
  useEffect(() => {
    selectionRef.current = savedSelection;
  }, [savedSelection]);

  // Calculate position - stable function
  useEffect(() => {
    if (!isOpen || !editor?.view) return;

    try {
      const { state, view } = editor;
      const { to } = state.selection;
      const coords = view.coordsAtPos(to);
      const editorElement = view.dom;
      const editorRect = editorElement.getBoundingClientRect();
      
      setPosition({
        top: coords.bottom - editorRect.top + 8,
        left: coords.left - editorRect.left,
      });
    } catch (error) {
      console.error('[LinkPopover] Position calculation error:', error);
      setPosition({ top: 50, left: 50 });
    }
  }, [isOpen, editor]);

  // Initialize when opened - run ONCE
  useEffect(() => {
    if (!isOpen) return;

    console.log('[LinkPopover] Opened - initializing');
    setUrl(initialUrl);
    setError('');

    // Auto-focus input immediately
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
        console.log('[LinkPopover] Input auto-focused');
      }
    }, 50);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); // Only run when isOpen changes

  // Add visual highlight to selected text when popover is open
  useEffect(() => {
    if (!isOpen || !savedSelection || !editor) return;

    const { from, to } = savedSelection;
    if (from === to) return; // No selection

    try {
      // Add a decoration to highlight the selection
      const { view } = editor;
      const decorations = document.createElement('style');
      decorations.id = 'link-popover-highlight';
      decorations.textContent = `
        .ProseMirror .selection-highlight {
          background-color: rgba(59, 130, 246, 0.3);
          border-radius: 2px;
        }
      `;
      document.head.appendChild(decorations);

      // Add highlight class to selected range
      const transaction = view.state.tr;
      transaction.setMeta('addToHistory', false);
      
      console.log('[LinkPopover] Added visual highlight');

      return () => {
        // Cleanup
        const style = document.getElementById('link-popover-highlight');
        if (style) {
          style.remove();
        }
      };
    } catch (error) {
      console.error('[LinkPopover] Highlight error:', error);
    }
  }, [isOpen, savedSelection, editor]);

  // Click outside handler - ROBUST with pointerdown
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      
      // Use composedPath for accurate detection
      const path = event.composedPath();
      
      // Check if event originated from inside popover
      const isInsidePopover = path.some(el => 
        el === popoverRef.current || 
        (el as HTMLElement).closest?.('[data-link-popover]')
      );
      
      if (isInsidePopover) {
        console.log('[LinkPopover] Pointer down inside - keeping open');
        return;
      }

      // Check if event is from toolbar button
      const isToolbarButton = path.some(el =>
        (el as HTMLElement).closest?.('[data-link-button]')
      );
      
      if (isToolbarButton) {
        console.log('[LinkPopover] Pointer down on toolbar button - ignoring');
        return;
      }

      // Truly outside - close
      console.log('[LinkPopover] Pointer down outside - closing');
      onClose();
    };

    // Add listener after delay, use capture phase
    const timer = setTimeout(() => {
      document.addEventListener('pointerdown', handlePointerDown, true);
      console.log('[LinkPopover] Pointer down listener added');
    }, 200);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('pointerdown', handlePointerDown, true);
      console.log('[LinkPopover] Pointer down listener removed');
    };
  }, [isOpen, onClose]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        console.log('[LinkPopover] Escape pressed - closing');
        onClose();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        console.log('[LinkPopover] Enter pressed - applying');
        handleApply();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, url, onClose]);

  // Apply link
  const handleApply = () => {
    const trimmedUrl = sanitizeUrlInput(url);

    // Validate
    const validationError = getUrlError(trimmedUrl);
    if (validationError) {
      setError(validationError);
      return;
    }

    const normalizedUrl = normalizeUrl(trimmedUrl);
    const selection = selectionRef.current;

    if (!selection) {
      console.error('[LinkPopover] No selection saved');
      return;
    }

    console.log('[LinkPopover] Applying link:', { url: normalizedUrl, selection });

    try {
      const hasSelection = selection.from !== selection.to;

      if (isEditMode) {
        // Case: Edit existing link
        editor
          .chain()
          .focus()
          .setTextSelection({ from: selection.from, to: selection.to })
          .extendMarkRange('link')
          .setLink({ href: normalizedUrl, target: '_blank' })
          .setTextSelection(selection.to) // Move caret to END of link
          .unsetMark('link') // CRITICAL: Clear stored marks
          .run();
        
        console.log('[LinkPopover] Updated existing link');
      } else if (hasSelection) {
        // Case: Apply link to selection
        editor
          .chain()
          .focus()
          .setTextSelection({ from: selection.from, to: selection.to })
          .setLink({ href: normalizedUrl, target: '_blank' })
          .setTextSelection(selection.to) // Move caret to END of link
          .unsetMark('link') // CRITICAL: Clear stored marks so next typing is plain
          .run();
        
        console.log('[LinkPopover] Applied link to selection');
      } else {
        // Case: Insert new link at caret
        const text = trimmedUrl;
        const insertPos = selection.from;
        
        editor
          .chain()
          .focus()
          .insertContentAt(insertPos, {
            type: 'text',
            text: text,
            marks: [{ type: 'link', attrs: { href: normalizedUrl, target: '_blank' } }],
          })
          .setTextSelection(insertPos + text.length) // Move caret AFTER inserted link
          .unsetMark('link') // CRITICAL: Clear stored marks
          .run();
        
        console.log('[LinkPopover] Inserted new link');
      }

      // Additional safety: Force clear link mark from stored marks
      setTimeout(() => {
        if (editor && !editor.isDestroyed) {
          editor.commands.unsetMark('link');
          console.log('[LinkPopover] Force cleared link mark');
        }
      }, 10);

      console.log('[LinkPopover] Link applied successfully');
      onClose();
    } catch (error) {
      console.error('[LinkPopover] Apply error:', error);
      setError('Không thể áp dụng liên kết');
    }
  };

  // Remove link
  const handleRemove = () => {
    const selection = selectionRef.current;
    if (!selection) return;

    console.log('[LinkPopover] Removing link');

    try {
      editor.commands.focus();
      editor.commands.setTextSelection({
        from: selection.from,
        to: selection.to,
      });

      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .unsetLink()
        .setTextSelection(selection.to)
        .unsetMark('link')
        .run();

      console.log('[LinkPopover] Link removed');
      onClose();
    } catch (error) {
      console.error('[LinkPopover] Remove error:', error);
    }
  };

  if (!isOpen) return null;

  // CRITICAL: Stop all mouse events from bubbling
  const stopMouseEvents = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      ref={popoverRef}
      data-link-popover="true"
      onPointerDown={stopMouseEvents}
      onPointerUp={stopMouseEvents}
      onMouseDown={stopMouseEvents}
      onMouseUp={stopMouseEvents}
      onClick={stopMouseEvents}
      className="absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-3 min-w-[320px] max-w-[400px]"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <LinkIcon size={16} className="text-blue-600" />
        <span className="text-sm font-semibold text-gray-700">
          {isEditMode ? 'Chỉnh sửa liên kết' : 'Chèn liên kết'}
        </span>
      </div>

      {/* Input - Auto-focused */}
      <div className="mb-3">
        <input
          ref={inputRef}
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (error) setError('');
          }}
          placeholder="example.com hoặc https://example.com"
          className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 transition-all ${
            error
              ? 'border-red-300 focus:ring-red-200'
              : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400'
          }`}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleApply}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Check size={14} />
            Áp dụng
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <X size={14} />
            Hủy
          </button>
        </div>

        {isEditMode && (
          <button
            type="button"
            onClick={handleRemove}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
            title="Xóa liên kết"
          >
            <Trash2 size={14} />
            Xóa
          </button>
        )}
      </div>

      {/* Hint */}
      <div className="mt-2 pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded">Enter</kbd> để áp dụng • <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded">Esc</kbd> để hủy
        </p>
      </div>
    </div>
  );
}
```

### 5.6 `src/components/editor/VideoPopover.tsx`

```tsx
/**
 * Floating Video Popover - For YouTube/Vimeo embeds
 * Anchored to caret position, similar to LinkPopover
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { Youtube, Check, X } from 'lucide-react';

interface VideoPopoverProps {
  editor: Editor;
  isOpen: boolean;
  onClose: () => void;
}

interface Position {
  top: number;
  left: number;
}

// Video URL validation
function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i.test(url);
}

function isVimeoUrl(url: string): boolean {
  return /(?:vimeo\.com\/)(\d+)/i.test(url);
}

function getVideoProvider(url: string): 'youtube' | 'vimeo' | null {
  if (isYouTubeUrl(url)) return 'youtube';
  if (isVimeoUrl(url)) return 'vimeo';
  return null;
}

function getVideoError(url: string): string | null {
  const trimmed = url.trim();

  if (!trimmed) {
    return 'URL video không được để trống';
  }

  const provider = getVideoProvider(trimmed);
  if (!provider) {
    return 'URL không hợp lệ. Vui lòng nhập URL YouTube hoặc Vimeo.';
  }

  return null;
}

export function VideoPopover({
  editor,
  isOpen,
  onClose,
}: VideoPopoverProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Calculate position based on caret
  const calculatePosition = useCallback(() => {
    if (!editor || !editor.view) return;

    try {
      const { state, view } = editor;
      const { from } = state.selection;

      // Get coordinates from editor view
      const coords = view.coordsAtPos(from);

      // Get editor container position
      const editorElement = view.dom;
      const editorRect = editorElement.getBoundingClientRect();

      // Calculate popover position
      const top = coords.bottom - editorRect.top + 8;
      const left = coords.left - editorRect.left;

      setPosition({ top, left });
    } catch (error) {
      console.error('Error calculating position:', error);
      setPosition({ top: 50, left: 50 });
    }
  }, [editor]);

  // Update position when opened
  useEffect(() => {
    if (isOpen) {
      calculatePosition();
      setUrl('');
      setError('');

      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, calculatePosition]);

  // Click outside handler - ROBUST with pointerdown
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      // Use composedPath for accurate detection
      const path = event.composedPath();

      // Check if event originated from inside popover
      const isInsidePopover = path.some(el =>
        el === popoverRef.current ||
        (el as HTMLElement).closest?.('[data-video-popover]')
      );

      if (isInsidePopover) {
        console.log('[VideoPopover] Pointer down inside - keeping open');
        return;
      }

      // Check if event is from toolbar button
      const isToolbarButton = path.some(el =>
        (el as HTMLElement).closest?.('[data-video-button]')
      );

      if (isToolbarButton) {
        console.log('[VideoPopover] Pointer down on toolbar button - ignoring');
        return;
      }

      // Truly outside - close
      console.log('[VideoPopover] Pointer down outside - closing');
      onClose();
    };

    // Add listener after delay, use capture phase
    const timer = setTimeout(() => {
      document.addEventListener('pointerdown', handlePointerDown, true);
      console.log('[VideoPopover] Pointer down listener added');
    }, 200);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('pointerdown', handlePointerDown, true);
      console.log('[VideoPopover] Pointer down listener removed');
    };
  }, [isOpen, onClose]);

  // Validate URL on change
  const handleUrlChange = (value: string) => {
    setUrl(value);

    if (error) {
      setError('');
    }
  };

  // Apply video embed
  const handleApply = useCallback(() => {
    const trimmedUrl = url.trim();

    // Validate
    const validationError = getVideoError(trimmedUrl);
    if (validationError) {
      setError(validationError);
      return;
    }

    const provider = getVideoProvider(trimmedUrl);

    if (provider === 'youtube') {
      editor.chain().focus().setYouTubeVideo({ src: trimmedUrl }).run();
    } else if (provider === 'vimeo') {
      // Vimeo support (if extension is configured)
      // For now, just YouTube
      editor.chain().focus().setYouTubeVideo({ src: trimmedUrl }).run();
    }

    onClose();
  }, [url, editor, onClose]);

  // Handle keyboard shortcuts
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
  }, [isOpen, handleApply, onClose]);

  if (!isOpen) return null;

  const provider = url.trim() ? getVideoProvider(url.trim()) : null;

  // CRITICAL: Stop all mouse events from bubbling
  const stopMouseEvents = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      ref={popoverRef}
      data-video-popover="true"
      onPointerDown={stopMouseEvents}
      onPointerUp={stopMouseEvents}
      onMouseDown={stopMouseEvents}
      onMouseUp={stopMouseEvents}
      onClick={stopMouseEvents}
      className="absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-3 min-w-[320px] max-w-[400px]"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Youtube size={16} className="text-red-600" />
        <span className="text-sm font-semibold text-gray-700">
          Chèn video YouTube/Vimeo
        </span>
      </div>

      {/* Input */}
      <div className="mb-3">
        <input
          ref={inputRef}
          type="text"
          value={url}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="https://youtube.com/watch?v=... hoặc https://vimeo.com/..."
          className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 transition-all ${error
              ? 'border-red-300 focus:ring-red-200'
              : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400'
            }`}
        />
        {error && (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        )}
        {provider && !error && (
          <p className="mt-1 text-xs text-green-600">
            ✓ {provider === 'youtube' ? 'YouTube' : 'Vimeo'} video detected
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleApply}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
        >
          <Check size={14} />
          Chèn video
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          <X size={14} />
          Hủy
        </button>
      </div>

      {/* Hint */}
      <div className="mt-2 pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded">Enter</kbd> để chèn,{' '}
          <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded">Esc</kbd> để hủy
        </p>
      </div>
    </div>
  );
}
```

### 5.7 `src/components/editor/editor.css`

```css
/**
 * Rich Text Editor Custom Styles
 */

/* Editor content area */
.ProseMirror {
  outline: none;
}

.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}

/* Link styles */
.ProseMirror a {
  cursor: pointer;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
}

.ProseMirror a:hover {
  text-decoration-thickness: 2px;
}

/* Selection */
.ProseMirror ::selection {
  background-color: rgba(59, 130, 246, 0.3);
}

/* Lists */
.ProseMirror ul,
.ProseMirror ol {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.ProseMirror ul {
  list-style-type: disc;
}

.ProseMirror ol {
  list-style-type: decimal;
}

.ProseMirror li {
  margin: 0.25rem 0;
}

/* Headings */
.ProseMirror h1 {
  font-size: 2em;
  font-weight: bold;
  margin: 0.67em 0;
}

.ProseMirror h2 {
  font-size: 1.5em;
  font-weight: bold;
  margin: 0.75em 0;
}

.ProseMirror h3 {
  font-size: 1.17em;
  font-weight: bold;
  margin: 0.83em 0;
}

/* Code */
.ProseMirror code {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

/* Blockquote */
.ProseMirror blockquote {
  border-left: 3px solid #e5e7eb;
  padding-left: 1rem;
  margin: 1rem 0;
  color: #6b7280;
}

/* Dark mode adjustments */
.dark .ProseMirror p.is-editor-empty:first-child::before {
  color: #6b7280;
}

.dark .ProseMirror code {
  background-color: rgba(255, 255, 255, 0.1);
}

.dark .ProseMirror blockquote {
  border-left-color: #4b5563;
  color: #9ca3af;
}

/* Floating popover animations */
.floating-link-popover,
.link-preview-bubble {
  animation: fadeInScale 0.15s ease-out;
}

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

/* Focus states */
.floating-link-popover input:focus,
.floating-link-popover button:focus {
  outline: none;
}

/* Keyboard hint styling */
kbd {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
```

### 5.8 `src/components/editor/extensions/index.ts`

```ts
/**
 * Editor Extensions Configuration
 * Centralized extension setup for Tiptap editor
 */

import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CharacterCount from '@tiptap/extension-character-count';
import Typography from '@tiptap/extension-typography';
import { Color } from '@tiptap/extension-color';

import { ImageWithCaption } from './image-with-caption';
import { VideoEmbed } from './video-embed';
import { Callout } from './callout';
import { EDITOR_LIMITS, KEYBOARD_SHORTCUTS } from '@/lib/editor/constants';

export interface EditorExtensionsConfig {
  placeholder?: string;
  maxLength?: number;
  enableSlashCommands?: boolean;
}

export function getEditorExtensions(config: EditorExtensionsConfig = {}) {
  const {
    placeholder = 'Bắt đầu viết hoặc gõ / để xem các lệnh...',
    maxLength = EDITOR_LIMITS.MAX_CONTENT_LENGTH,
    enableSlashCommands = true,
  } = config;

  return [
    // Core editing
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
      bulletList: {
        keepMarks: true,
        keepAttributes: false,
      },
      orderedList: {
        keepMarks: true,
        keepAttributes: false,
      },
      blockquote: {
        HTMLAttributes: {
          class: 'border-l-4 border-gray-300 pl-4 italic text-gray-700',
        },
      },
      code: {
        HTMLAttributes: {
          class: 'bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono',
        },
      },
      codeBlock: {
        HTMLAttributes: {
          class: 'bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm',
        },
      },
      horizontalRule: {
        HTMLAttributes: {
          class: 'my-8 border-gray-300',
        },
      },
      dropcursor: {
        color: '#3b82f6',
        width: 2,
      },
      gapcursor: false,
    }),

    // Text formatting
    Underline,
    TextStyle,
    Color,
    Highlight.configure({
      multicolor: true,
      HTMLAttributes: {
        class: 'bg-yellow-200 px-1 rounded',
      },
    }),

    // Links
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-blue-600 underline hover:text-blue-700 cursor-pointer',
        rel: 'noopener noreferrer',
      },
      validate: href => /^https?:\/\//.test(href),
    }),

    // Text alignment
    TextAlign.configure({
      types: ['heading', 'paragraph'],
      alignments: ['left', 'center', 'right'],
    }),

    // Task lists
    TaskList.configure({
      HTMLAttributes: {
        class: 'not-prose',
      },
    }),
    TaskItem.configure({
      nested: true,
      HTMLAttributes: {
        class: 'flex items-start gap-2',
      },
    }),

    // Typography improvements
    Typography.configure({
      // Smart quotes, dashes, ellipsis
    }),

    // Placeholder
    Placeholder.configure({
      placeholder,
      showOnlyWhenEditable: true,
      showOnlyCurrent: false,
    }),

    // Character count
    CharacterCount.configure({
      limit: maxLength,
    }),

    // Custom extensions
    ImageWithCaption.configure({
      inline: false,
      allowBase64: false,
      HTMLAttributes: {
        class: 'rounded-lg max-w-full h-auto',
      },
    }),

    VideoEmbed.configure({
      width: 640,
      height: 360,
      controls: true,
      nocookie: true,
      allowFullscreen: true,
    }),

    Callout.configure({
      HTMLAttributes: {
        class: 'callout',
      },
    }),
  ];
}

// Export individual extensions for selective use
export {
  ImageWithCaption,
  VideoEmbed,
  Callout,
};
```

### 5.9 `src/components/editor/extensions/callout.ts`

```ts
/**
 * Callout Extension
 * Info boxes with variants: info, warning, success, danger
 */

import { Node, mergeAttributes } from '@tiptap/core';
import { CalloutVariant } from '@/types/editor';

export interface CalloutOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (variant?: CalloutVariant) => ReturnType;
      toggleCallout: (variant?: CalloutVariant) => ReturnType;
    };
  }
}

export const Callout = Node.create<CalloutOptions>({
  name: 'callout',

  group: 'block',

  content: 'block+',

  defining: true,

  addAttributes() {
    return {
      variant: {
        default: 'info',
        parseHTML: element => element.getAttribute('data-variant') || 'info',
        renderHTML: attributes => {
          return {
            'data-variant': attributes.variant,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="callout"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'callout',
        class: 'callout',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setCallout:
        (variant = 'info') =>
        ({ commands }) => {
          return commands.wrapIn(this.name, { variant });
        },
      toggleCallout:
        (variant = 'info') =>
        ({ commands }) => {
          return commands.toggleWrap(this.name, { variant });
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-i': () => this.editor.commands.toggleCallout('info'),
    };
  },
});
```

### 5.10 `src/components/editor/extensions/image-with-caption.ts`

```ts
/**
 * Enhanced Image Extension
 * Supports captions, alignment, and sizing
 */

import Image from '@tiptap/extension-image';
import { mergeAttributes } from '@tiptap/core';

export interface ImageWithCaptionOptions {
  inline: boolean;
  allowBase64: boolean;
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageWithCaption: {
      setImage: (options: {
        src: string;
        alt?: string;
        title?: string;
        caption?: string;
        alignment?: 'left' | 'center' | 'right';
      }) => ReturnType;
      setImageAlignment: (alignment: 'left' | 'center' | 'right') => ReturnType;
      setImageCaption: (caption: string) => ReturnType;
    };
  }
}

export const ImageWithCaption = Image.extend<ImageWithCaptionOptions>({
  name: 'image',

  addAttributes() {
    return {
      ...this.parent?.(),
      caption: {
        default: null,
        parseHTML: element => element.getAttribute('data-caption'),
        renderHTML: attributes => {
          if (!attributes.caption) return {};
          return {
            'data-caption': attributes.caption,
          };
        },
      },
      alignment: {
        default: 'center',
        parseHTML: element => element.getAttribute('data-alignment') || 'center',
        renderHTML: attributes => {
          return {
            'data-alignment': attributes.alignment,
          };
        },
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const { caption, alignment, ...imgAttrs } = HTMLAttributes;
    
    // If no caption, render simple image
    if (!caption) {
      return [
        'img',
        mergeAttributes(this.options.HTMLAttributes, imgAttrs, {
          'data-alignment': alignment,
        }),
      ];
    }
    
    // Render image with caption wrapper
    return [
      'figure',
      {
        class: 'image-with-caption',
        'data-alignment': alignment,
      },
      [
        'img',
        mergeAttributes(this.options.HTMLAttributes, imgAttrs),
      ],
      [
        'figcaption',
        {},
        caption,
      ],
    ];
  },

  addCommands() {
    return {
      setImage:
        options =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
      setImageAlignment:
        alignment =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { alignment });
        },
      setImageCaption:
        caption =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { caption });
        },
    };
  },
});
```

### 5.11 `src/components/editor/extensions/video-embed.ts`

```ts
/**
 * Video Embed Extension
 * Enhanced YouTube extension with Vimeo support
 */

import { Node, mergeAttributes } from '@tiptap/core';

export interface VideoEmbedOptions {
  addPasteHandler: boolean;
  allowFullscreen: boolean;
  autoplay: boolean;
  ccLanguage?: string;
  ccLoadPolicy?: boolean;
  controls: boolean;
  disableKBcontrols: boolean;
  enableIFrameApi: boolean;
  endTime: number;
  height: number;
  interfaceLanguage?: string;
  ivLoadPolicy: number;
  loop: boolean;
  modestBranding: boolean;
  nocookie: boolean;
  origin?: string;
  playlist?: string;
  progressBarColor?: string;
  width: number;
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    videoEmbed: {
      setYouTubeVideo: (options: { src: string }) => ReturnType;
      setVimeoVideo: (options: { src: string }) => ReturnType;
    };
  }
}

export const VideoEmbed = Node.create<VideoEmbedOptions>({
  name: 'videoEmbed',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      addPasteHandler: true,
      allowFullscreen: true,
      autoplay: false,
      ccLanguage: undefined,
      ccLoadPolicy: undefined,
      controls: true,
      disableKBcontrols: false,
      enableIFrameApi: false,
      endTime: 0,
      height: 480,
      interfaceLanguage: undefined,
      ivLoadPolicy: 0,
      loop: false,
      modestBranding: false,
      nocookie: true,
      origin: undefined,
      playlist: undefined,
      progressBarColor: undefined,
      width: 640,
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      provider: {
        default: 'youtube',
      },
      width: {
        default: this.options.width,
      },
      height: {
        default: this.options.height,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="video-embed"]',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          
          const element = node as HTMLElement;
          const iframe = element.querySelector('iframe');
          
          // Extract src from iframe if exists
          const src = iframe?.getAttribute('src') || element.getAttribute('data-src');
          
          // If no valid src, don't parse this node
          if (!src) return false;
          
          return {
            src,
            provider: element.getAttribute('data-provider') || 'youtube',
            width: element.getAttribute('data-width') || this.options.width,
            height: element.getAttribute('data-height') || this.options.height,
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, provider, width, height } = HTMLAttributes;
    
    // Safety check: if no src, return empty div
    if (!src) {
      return ['div', { class: 'video-embed-error' }, 'Video URL is missing'];
    }
    
    let embedUrl = src;
    
    // Convert YouTube URL to embed format
    if (provider === 'youtube') {
      const videoId = extractYouTubeId(src);
      if (videoId) {
        embedUrl = this.options.nocookie
          ? `https://www.youtube-nocookie.com/embed/${videoId}`
          : `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    // Convert Vimeo URL to embed format
    if (provider === 'vimeo') {
      const videoId = extractVimeoId(src);
      if (videoId) {
        embedUrl = `https://player.vimeo.com/video/${videoId}`;
      }
    }
    
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, {
        'data-type': 'video-embed',
        'data-provider': provider,
      }),
      [
        'iframe',
        {
          src: embedUrl,
          width: width || this.options.width,
          height: height || this.options.height,
          frameborder: '0',
          allowfullscreen: this.options.allowFullscreen ? 'true' : 'false',
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
        },
      ],
    ];
  },

  addCommands() {
    return {
      setYouTubeVideo:
        (options: { src: string }) =>
        ({ commands }) => {
          const videoId = extractYouTubeId(options.src);
          if (!videoId) return false;
          
          return commands.insertContent({
            type: this.name,
            attrs: {
              src: options.src,
              provider: 'youtube',
            },
          });
        },
      setVimeoVideo:
        (options: { src: string }) =>
        ({ commands }) => {
          const videoId = extractVimeoId(options.src);
          if (!videoId) return false;
          
          return commands.insertContent({
            type: this.name,
            attrs: {
              src: options.src,
              provider: 'vimeo',
            },
          });
        },
    };
  },
});

// Helper functions
function extractYouTubeId(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function extractVimeoId(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  
  const regex = /(?:vimeo\.com\/)(\d+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
```

### 5.12 `src/components/editor/extensions/slash-command.tsx`

```tsx
/**
 * Slash Command Extension
 * Type "/" to show block insertion menu
 */

import { Extension } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import { Editor } from '@tiptap/core';
import Suggestion, { SuggestionOptions } from '@tiptap/suggestion';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import { SlashCommandItem, SlashCommandGroup } from '@/types/editor';
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Minus,
  Info,
  Image as ImageIcon,
  Video,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        startOfLine: false,
        command: ({ editor, range, props }: { editor: Editor; range: any; props: any }) => {
          props.command({ editor, range });
        },
      } as Partial<SuggestionOptions>,
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

// Command groups
export function getSlashCommandGroups(editor: Editor): SlashCommandGroup[] {
  return [
    {
      name: 'Định dạng cơ bản',
      items: [
        {
          title: 'Tiêu đề 1',
          description: 'Tiêu đề lớn',
          icon: 'H1',
          command: (editor) => {
            editor.chain().focus().toggleHeading({ level: 1 }).run();
          },
          keywords: ['heading', 'h1', 'title'],
        },
        {
          title: 'Tiêu đề 2',
          description: 'Tiêu đề trung bình',
          icon: 'H2',
          command: (editor) => {
            editor.chain().focus().toggleHeading({ level: 2 }).run();
          },
          keywords: ['heading', 'h2', 'subtitle'],
        },
        {
          title: 'Tiêu đề 3',
          description: 'Tiêu đề nhỏ',
          icon: 'H3',
          command: (editor) => {
            editor.chain().focus().toggleHeading({ level: 3 }).run();
          },
          keywords: ['heading', 'h3'],
        },
        {
          title: 'Danh sách dấu chấm',
          description: 'Tạo danh sách không đánh số',
          icon: 'list',
          command: (editor) => {
            editor.chain().focus().toggleBulletList().run();
          },
          keywords: ['bullet', 'list', 'ul'],
        },
        {
          title: 'Danh sách đánh số',
          description: 'Tạo danh sách có đánh số',
          icon: 'ordered-list',
          command: (editor) => {
            editor.chain().focus().toggleOrderedList().run();
          },
          keywords: ['numbered', 'list', 'ol'],
        },
        {
          title: 'Checklist',
          description: 'Danh sách công việc',
          icon: 'check-square',
          command: (editor) => {
            editor.chain().focus().toggleTaskList().run();
          },
          keywords: ['todo', 'task', 'checkbox'],
        },
      ],
    },
    {
      name: 'Nội dung',
      items: [
        {
          title: 'Trích dẫn',
          description: 'Khối trích dẫn',
          icon: 'quote',
          command: (editor) => {
            editor.chain().focus().toggleBlockquote().run();
          },
          keywords: ['quote', 'blockquote'],
        },
        {
          title: 'Code',
          description: 'Khối mã nguồn',
          icon: 'code',
          command: (editor) => {
            editor.chain().focus().toggleCodeBlock().run();
          },
          keywords: ['code', 'codeblock', 'pre'],
        },
        {
          title: 'Đường kẻ ngang',
          description: 'Phân cách nội dung',
          icon: 'minus',
          command: (editor) => {
            editor.chain().focus().setHorizontalRule().run();
          },
          keywords: ['hr', 'divider', 'line'],
        },
      ],
    },
    {
      name: 'Callout',
      items: [
        {
          title: 'Info Box',
          description: 'Hộp thông tin',
          icon: 'info',
          command: (editor) => {
            editor.chain().focus().setCallout('info').run();
          },
          keywords: ['callout', 'info', 'note'],
        },
        {
          title: 'Warning Box',
          description: 'Hộp cảnh báo',
          icon: 'alert-triangle',
          command: (editor) => {
            editor.chain().focus().setCallout('warning').run();
          },
          keywords: ['callout', 'warning', 'caution'],
        },
        {
          title: 'Success Box',
          description: 'Hộp thành công',
          icon: 'check-circle',
          command: (editor) => {
            editor.chain().focus().setCallout('success').run();
          },
          keywords: ['callout', 'success', 'tip'],
        },
        {
          title: 'Danger Box',
          description: 'Hộp nguy hiểm',
          icon: 'alert-circle',
          command: (editor) => {
            editor.chain().focus().setCallout('danger').run();
          },
          keywords: ['callout', 'danger', 'error'],
        },
      ],
    },
  ];
}
```

### 5.13 `src/components/editor/index.ts`

```ts
/**
 * Editor Components - Public API
 * Export all editor components and utilities
 */

// Main components
export { ProductionEditor } from './ProductionEditor';
export { EditorPreview, EditorPreviewServer } from './EditorPreview';
export { EditorToolbar } from './EditorToolbar';
export { EditorBubbleMenu } from './EditorBubbleMenu';

// Extensions
export { getEditorExtensions, ImageWithCaption, VideoEmbed, Callout } from './extensions';

// Legacy component (for backward compatibility)
export { default as RichTextEditor } from './RichTextEditor';
```

### 5.14 `src/components/shared/RichTextRenderer.tsx`

```tsx
"use client";

import DOMPurify from "dompurify";
import { useEffect, useState } from "react";
import { generateHTML } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextStyle from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";

// Extensions list used by the editor
const TIPTAP_EXTENSIONS = [
  StarterKit,
  Link.configure({ openOnClick: false }),
  Image,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Underline,
  Highlight.configure({ multicolor: true }),
  TextStyle,
  Color,
];

/**
 * Tries to parse the content string as TipTap JSON.
 * Returns the parsed object if valid, or null.
 */
function parseTipTapJson(content: string): object | null {
  try {
    const parsed = JSON.parse(content);
    if (parsed && parsed.type === "doc" && Array.isArray(parsed.content)) {
      return parsed;
    }
  } catch {
    // Not JSON
  }
  return null;
}

/**
 * Converts content (TipTap JSON string OR plain HTML) to an HTML string.
 */
function contentToHtml(content: string): string {
  if (!content) return "";

  // Detect TipTap JSON
  const json = parseTipTapJson(content);
  if (json) {
    try {
      return generateHTML(json as any, TIPTAP_EXTENSIONS);
    } catch {
      // Fallback to raw if generateHTML fails
      return `<p>${content}</p>`;
    }
  }

  // Already HTML or plain text
  return content;
}

interface RichTextRendererProps {
  content: string;
}

export default function RichTextRenderer({ content }: RichTextRendererProps) {
  const [mounted, setMounted] = useState(false);
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    setHtml(contentToHtml(content));
    setMounted(true);
  }, [content]);

  if (!mounted) {
    return (
      <div
        className="prose prose-blue prose-lg max-w-none text-gray-700 leading-relaxed animate-pulse"
        suppressHydrationWarning
      />
    );
  }

  const sanitizedHtml = DOMPurify.sanitize(html, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "src", "style", "target", "rel"],
  });

  return (
    <div
      className="prose prose-blue prose-lg max-w-none text-gray-700 leading-relaxed
        prose-headings:text-gray-900 prose-headings:font-bold
        prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
        prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
        prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
        prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
        prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
        prose-li:text-gray-700 prose-li:mb-1
        prose-strong:text-gray-900 prose-strong:font-semibold
        prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800
        prose-blockquote:border-l-4 prose-blockquote:border-blue-400 prose-blockquote:pl-4 prose-blockquote:italic"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
```

### 5.15 `src/app/campaigns/create/page.tsx`

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { MultipleImageUpload } from "@/components/shared/MultipleImageUpload";
import { DateInput } from "@/components/shared/DateInput";
import { ProductionEditor } from "@/components/editor";
import { EDITOR_PLACEHOLDERS } from "@/lib/editor/constants";
import { toast } from "sonner";
import { Rocket, Target, AlignLeft, Image as ImageIcon, Calendar, Tags, AlertCircle } from "lucide-react";
import { CategorySelector } from "@/components/create-campaign/category-selector";
import { StarterTagsSelector } from "@/components/create-campaign/starter-tags-selector";
import { BlogSelector } from "@/components/create-campaign/blog-selector";
import type { MainCategory } from "@/types/taxonomy";
import { validateTaxonomySelection, sanitizeSelectedTags, getInvalidTagsForNewCategory, getTagsByIds } from "@/lib/taxonomy-helpers";

export default function CreateCampaignPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    tagline: "",
    description: "",
    goalAmount: 1000000,
    mainCategory: null as MainCategory | null,
    starterTags: [] as string[],
    imageUrl: "",
    images: [] as string[], // Multiple images array
    endDate: "",
    linkedBlogIds: [] as string[], // Blog posts linked to campaign
  });

  const [showCategoryChangeWarning, setShowCategoryChangeWarning] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<MainCategory | null>(null);

  const [displayAmount, setDisplayAmount] = useState("1.000.000");

  // Kiểm tra quyền truy cập
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      toast.error("Vui lòng đăng nhập để tạo dự án");
      router.push("/auth/login?callbackUrl=/campaigns/create");
      return;
    }

    const user = session.user as any;
    const userRole = user?.role;
    const isAdmin = user?.isAdmin === true || userRole === "ADMIN";

    // Chỉ cho phép CREATOR và ADMIN tạo dự án
    if (userRole !== "CREATOR" && !isAdmin) {
      toast.error("Bạn cần nâng cấp lên tài khoản Creator để tạo dự án");
      router.push("/");
    }
  }, [session, status, router]);

  // Hiển thị loading khi đang kiểm tra session
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Không hiển thị form nếu chưa đăng nhập hoặc không có quyền
  if (!session) {
    return null;
  }

  const user = session.user as any;
  const userRole = user?.role;
  const isAdmin = user?.isAdmin === true || userRole === "ADMIN";

  if (userRole !== "CREATOR" && !isAdmin) {
    return null;
  }

  const formatVNDInput = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    if (!numericValue) return "";
    return Number(numericValue).toLocaleString("de-DE");
  };

  const handleCategoryChange = (newCategory: MainCategory) => {
    // If there are selected tags, check if they're valid for the new category
    if (formData.starterTags.length > 0) {
      const invalidTags = getInvalidTagsForNewCategory(
        formData.starterTags,
        newCategory
      );

      if (invalidTags.length > 0) {
        // Show warning
        setPendingCategory(newCategory);
        setShowCategoryChangeWarning(true);
        return;
      }
    }

    // No conflicts, change category directly
    setFormData({
      ...formData,
      mainCategory: newCategory,
    });
  };

  const handleConfirmCategoryChange = () => {
    if (!pendingCategory) return;

    // Sanitize tags for new category
    const sanitizedTags = sanitizeSelectedTags(
      formData.starterTags,
      pendingCategory
    );

    setFormData({
      ...formData,
      mainCategory: pendingCategory,
      starterTags: sanitizedTags,
    });

    setShowCategoryChangeWarning(false);
    setPendingCategory(null);
  };

  const handleCancelCategoryChange = () => {
    setShowCategoryChangeWarning(false);
    setPendingCategory(null);
  };

  const handleTagsChange = (tags: string[]) => {
    setFormData({
      ...formData,
      starterTags: tags,
    });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formatted = formatVNDInput(rawValue);
    const numeric = Number(rawValue.replace(/\D/g, ""));

    setDisplayAmount(formatted);
    setFormData({ ...formData, goalAmount: numeric });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate taxonomy
    const taxonomyValidation = validateTaxonomySelection({
      mainCategory: formData.mainCategory,
      starterTags: formData.starterTags,
    });

    if (!taxonomyValidation.isValid) {
      toast.error(taxonomyValidation.errors[0]);
      return;
    }

    // Validate required fields with specific messages
    const missingFields: string[] = [];
    if (!formData.title) missingFields.push("Tên dự án");
    if (!formData.tagline) missingFields.push("Mô tả ngắn");
    if (!formData.description) missingFields.push("Nội dung chi tiết");
    if (!formData.imageUrl) missingFields.push("Ảnh bìa");
    if (!formData.goalAmount || formData.goalAmount <= 0) missingFields.push("Số vốn mục tiêu");
    if (!formData.endDate) missingFields.push("Hạn chót chiến dịch");

    if (missingFields.length > 0) {
      toast.error(`Vui lòng điền: ${missingFields.join(", ")}`);
      return;
    }

    setLoading(true);
    const promise = fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    }).then(async (res) => {
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Lỗi khi tạo dự án");
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: 'Đang khởi tạo dự án...',
      success: (campaign) => {
        router.push(`/campaigns/${campaign.slug}`);
        return '🎉 Tạo dự án thành công!';
      },
      error: (err) => err.message,
    });

    promise.finally(() => setLoading(false));
  };

  const invalidTagsForPendingCategory = pendingCategory
    ? getInvalidTagsForNewCategory(formData.starterTags, pendingCategory)
    : [];

  const invalidTagObjects = getTagsByIds(invalidTagsForPendingCategory);

  return (
    <main className="min-h-screen bg-gradient-to-b from-cream via-white to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-10 h-72 w-72 rounded-full bg-pgreen/10 blur-3xl" />
          <div className="absolute right-1/4 top-24 h-72 w-72 rounded-full bg-tblue/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-pgreen/10 text-pgreen shadow-soft">
            <Rocket className="h-9 w-9" />
          </div>

          <h1 className="font-display text-4xl font-black text-dblue md:text-5xl">
            Bắt đầu mạch cảm hứng mới
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-gray-600">
            Hãy chia sẻ câu chuyện của bạn với thế giới. Chúng tôi sẽ giúp bạn kết nối với cộng đồng để biến ý tưởng thành hiện thực hiện hữu.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-pgreen/10 px-5 py-2 text-sm font-bold text-pgreen">
            <span className="text-red-500">*</span>
            Các trường có dấu sao là bắt buộc
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 pb-20">

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>

          {/* Category Change Warning Modal */}
          {showCategoryChangeWarning && pendingCategory && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Xác nhận thay đổi danh mục
                </h3>
                <p className="text-sm text-gray-600">
                  Bạn đang thay đổi danh mục từ{" "}
                  <span className="font-semibold">{formData.mainCategory}</span> sang{" "}
                  <span className="font-semibold">{pendingCategory}</span>.
                </p>
                <p className="text-sm text-gray-600">
                  Các thẻ sau sẽ bị xóa vì không phù hợp với danh mục mới:
                </p>
                <div className="flex flex-wrap gap-2 p-3 bg-red-50 rounded-lg">
                  {invalidTagObjects.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCancelCategoryChange}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmCategoryChange}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Block 1: Thông tin cơ bản */}
          <section className="rounded-3xl border border-pgreen/10 bg-white/90 p-8 shadow-soft backdrop-blur">
            <div className="mb-8 flex items-center gap-4 border-b border-gray-100 pb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pgreen/10 text-pgreen">
                <AlignLeft className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-dblue">
                  Thông tin cơ bản
                </h2>
                <p className="text-sm text-gray-500">
                  Những thông tin đầu tiên giúp cộng đồng hiểu dự án của bạn.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="mb-2 block text-sm font-bold text-dblue flex justify-between">
                  <span>Tên dự án <span className="text-red-500">*</span></span>
                  <span className="text-xs font-medium text-gray-400">Tối đa 60 ký tự</span>
                </label>
                <Input
                  required
                  className="h-13 w-full rounded-2xl border border-gray-200 bg-white px-4 text-gray-900 placeholder:text-gray-400 transition focus:border-pgreen focus:outline-none focus:ring-4 focus:ring-pgreen/10 text-lg"
                  placeholder="Ví dụ: Năng lượng xanh cho bản vùng cao..."
                  value={formData.title}
                  maxLength={60}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="mb-2 block text-sm font-bold text-dblue">
                  Mô tả ngắn (Tagline) <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-gray-900 placeholder:text-gray-400 transition focus:border-pgreen focus:outline-none focus:ring-4 focus:ring-pgreen/10"
                  placeholder="Câu tóm tắt ngắn gọn và cuốn hút nhất về dự án của bạn..."
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* Block 2: Nội dung & Hình ảnh */}
          <section className="rounded-3xl border border-pgreen/10 bg-white/90 p-8 shadow-soft backdrop-blur">
            <div className="mb-8 flex items-center gap-4 border-b border-gray-100 pb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pgreen/10 text-pgreen">
                <ImageIcon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-dblue">
                  Câu chuyện & Media
                </h2>
                <p className="text-sm text-gray-500">
                  Một câu chuyện hay cùng hình ảnh đẹp sẽ thu hút nhiều sự chú ý hơn.
                </p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <label className="mb-2 block text-sm font-bold text-dblue">
                  Ảnh chiến dịch <span className="text-red-500">*</span>
                </label>
                <div className="rounded-2xl border-dashed border-pgreen/30 bg-pgreen/5 p-6">
                  <MultipleImageUpload
                    label="Tải ảnh lên (Tỉ lệ khuyến nghị 16:9)"
                    images={formData.images}
                    onChange={(images) => {
                      console.log("[CreateCampaign] Images updated:", images);
                      setFormData(prev => ({ ...prev, images }));
                    }}
                    mainImage={formData.imageUrl}
                    onMainImageChange={(url) => {
                      console.log("[CreateCampaign] Main image updated:", url);
                      setFormData(prev => ({ ...prev, imageUrl: url }));
                    }}
                    maxImages={10}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="mb-2 block text-sm font-bold text-dblue">
                  Nội dung chi tiết <span className="text-red-500">*</span>
                </label>
                <ProductionEditor
                  content={formData.description}
                  onChange={(content) => setFormData({ ...formData, description: content })}
                  config={{
                    placeholder: EDITOR_PLACEHOLDERS.CAMPAIGN_DESCRIPTION,
                    autosave: false,
                    enableBubbleMenu: true,
                  }}
                />
              </div>
            </div>
          </section>

          {/* Block 3: Mục tiêu & Thời gian */}
          <section className="rounded-3xl border border-pgreen/10 bg-white/90 p-8 shadow-soft backdrop-blur">
            <div className="mb-8 flex items-center gap-4 border-b border-gray-100 pb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pgreen/10 text-pgreen">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-dblue">
                  Mục tiêu & Lịch trình
                </h2>
                <p className="text-sm text-gray-500">
                  Đặt mục tiêu thực tế và thời gian phù hợp cho chiến dịch.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="space-y-2">
                <label className="mb-2 block text-sm font-bold text-dblue">
                  Số vốn mục tiêu (VNĐ) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₫</span>
                  <Input
                    type="text"
                    className="h-13 w-full rounded-2xl border border-gray-200 bg-white pl-10 pr-4 text-lg font-black text-gray-900 placeholder:text-gray-400 transition focus:border-pgreen focus:outline-none focus:ring-4 focus:ring-pgreen/10"
                    required
                    placeholder="1.000.000"
                    value={displayAmount}
                    onChange={handleAmountChange}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">Đặt mục tiêu có thể đạt được để tạo động lực cho cộng đồng.</p>
              </div>

              <div className="space-y-2">
                <label className="mb-2 block text-sm font-bold text-dblue">
                  Hạn chót chiến dịch <span className="text-red-500">*</span>
                </label>
                <DateInput
                  value={formData.endDate}
                  onChange={(value) => setFormData({ ...formData, endDate: value })}
                  placeholder="dd/mm/yyyy"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="mt-2 text-xs text-gray-500">Thời gian tối đa thường là 30 - 60 ngày.</p>
              </div>
            </div>
          </section>

          {/* Block 4: Phân loại dự án */}
          <section className="rounded-3xl border border-pgreen/10 bg-white/90 p-8 shadow-soft backdrop-blur">
            <div className="mb-8 flex items-center gap-4 border-b border-gray-100 pb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pgreen/10 text-pgreen">
                <Tags className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-dblue">
                  Phân loại dự án
                </h2>
                <p className="text-sm text-gray-500">
                  Giúp người ủng hộ dễ dàng tìm thấy dự án của bạn.
                </p>
              </div>
            </div>

            <div className="space-y-8">
              <CategorySelector
                selectedCategory={formData.mainCategory}
                onCategoryChange={handleCategoryChange}
              />

              <div className="border-t border-gray-100 pt-8">
                <StarterTagsSelector
                  mainCategory={formData.mainCategory}
                  selectedTags={formData.starterTags}
                  onTagsChange={handleTagsChange}
                />
              </div>

              <div className="border-t border-gray-100 pt-8">
                <BlogSelector
                  selectedBlogIds={formData.linkedBlogIds}
                  onBlogsChange={(blogIds) => setFormData({ ...formData, linkedBlogIds: blogIds })}
                />
              </div>
            </div>
          </section>

          <div className="pt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl gradient-green px-8 py-4 text-base font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-200 disabled:cursor-not-allowed disabled:opacity-60 w-full md:w-auto"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang tạo chiến dịch...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Khởi tạo chiến dịch ngay <Rocket size={20} className="ml-2" />
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
```

### 5.16 `src/components/campaign/CampaignEditForm.tsx`

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MultipleImageUpload } from "@/components/shared/MultipleImageUpload";
import { DateInput } from "@/components/shared/DateInput";
import { ProductionEditor } from "@/components/editor";
import { EDITOR_PLACEHOLDERS } from "@/lib/editor/constants";
import { toast } from "sonner";
import { Save, Target, AlignLeft, Image as ImageIcon, Calendar, Tags, X } from "lucide-react";
import { CategorySelector } from "@/components/create-campaign/category-selector";
import { StarterTagsSelector } from "@/components/create-campaign/starter-tags-selector";
import { BlogSelector } from "@/components/create-campaign/blog-selector";
import type { MainCategory } from "@/types/taxonomy";
import { MAIN_CATEGORIES } from "@/types/taxonomy";
import { validateTaxonomySelection, sanitizeSelectedTags, getInvalidTagsForNewCategory, getTagsByIds } from "@/lib/taxonomy-helpers";
import Link from "next/link";

interface Reward {
  id: string;
  title: string;
  description: string | null;
  minAmount: number;
  maxQuantity: number | null;
  deliveryDate: Date | null;
  isActive: boolean;
}

interface Campaign {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string | null;
  imageUrl: string | null;
  images: string[];
  videoUrl: string | null;
  category: string;
  goalAmount: number;
  endDate: Date | null;
  rewards: Reward[];
}

interface CampaignEditFormProps {
  campaign: Campaign;
}

export default function CampaignEditForm({ campaign }: CampaignEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: campaign.title,
    tagline: campaign.description,
    description: campaign.longDescription || "",
    goalAmount: campaign.goalAmount,
    mainCategory: (campaign.category && MAIN_CATEGORIES.includes(campaign.category as any))
      ? (campaign.category as MainCategory)
      : null,
    starterTags: ((campaign as any).tags || []) as string[], // Load tags from campaign
    imageUrl: campaign.imageUrl || "",
    images: Array.isArray(campaign.images) ? campaign.images : [],
    endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : "",
    linkedBlogIds: ((campaign as any).linkedBlogIds || []) as string[], // Load linked blogs
  });

  console.log("[CampaignEditForm] Initial data:", {
    campaignCategory: campaign.category,
    isValidCategory: campaign.category && MAIN_CATEGORIES.includes(campaign.category as any),
    mainCategory: formData.mainCategory,
    imageUrl: campaign.imageUrl,
    images: campaign.images,
    formDataImages: Array.isArray(campaign.images) ? campaign.images : []
  });

  const [showCategoryChangeWarning, setShowCategoryChangeWarning] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<MainCategory | null>(null);

  const [displayAmount, setDisplayAmount] = useState(
    Number(campaign.goalAmount).toLocaleString("de-DE")
  );

  const formatVNDInput = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    if (!numericValue) return "";
    return Number(numericValue).toLocaleString("de-DE");
  };

  const handleCategoryChange = (newCategory: MainCategory) => {
    // If there are selected tags, check if they're valid for the new category
    if (formData.starterTags.length > 0) {
      const invalidTags = getInvalidTagsForNewCategory(
        formData.starterTags,
        newCategory
      );

      if (invalidTags.length > 0) {
        // Show warning
        setPendingCategory(newCategory);
        setShowCategoryChangeWarning(true);
        return;
      }
    }

    // No conflicts, change category directly
    setFormData({
      ...formData,
      mainCategory: newCategory,
    });
  };

  const handleConfirmCategoryChange = () => {
    if (!pendingCategory) return;

    // Sanitize tags for new category
    const sanitizedTags = sanitizeSelectedTags(
      formData.starterTags,
      pendingCategory
    );

    setFormData({
      ...formData,
      mainCategory: pendingCategory,
      starterTags: sanitizedTags,
    });

    setShowCategoryChangeWarning(false);
    setPendingCategory(null);
  };

  const handleCancelCategoryChange = () => {
    setShowCategoryChangeWarning(false);
    setPendingCategory(null);
  };

  const handleTagsChange = (tags: string[]) => {
    setFormData({
      ...formData,
      starterTags: tags,
    });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formatted = formatVNDInput(rawValue);
    const numeric = Number(rawValue.replace(/\D/g, ""));

    setDisplayAmount(formatted);
    setFormData({ ...formData, goalAmount: numeric });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate taxonomy
    const taxonomyValidation = validateTaxonomySelection({
      mainCategory: formData.mainCategory,
      starterTags: formData.starterTags,
    });

    if (!taxonomyValidation.isValid) {
      toast.error(taxonomyValidation.errors[0]);
      return;
    }

    // Validate required fields with specific messages
    const missingFields: string[] = [];
    if (!formData.title) missingFields.push("Tên dự án");
    if (!formData.tagline) missingFields.push("Mô tả ngắn");
    if (!formData.description) missingFields.push("Nội dung chi tiết");
    if (!formData.imageUrl) missingFields.push("Ảnh bìa");
    if (!formData.goalAmount || formData.goalAmount <= 0) missingFields.push("Số vốn mục tiêu");
    if (!formData.endDate) missingFields.push("Hạn chót chiến dịch");

    if (missingFields.length > 0) {
      toast.error(`Vui lòng điền: ${missingFields.join(", ")}`);
      return;
    }

    setLoading(true);
    const promise = fetch(`/api/campaigns/${campaign.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    }).then(async (res) => {
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Lỗi khi cập nhật dự án");
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: 'Đang cập nhật dự án...',
      success: () => {
        router.push("/dashboard/creator");
        router.refresh();
        return '✅ Cập nhật dự án thành công!';
      },
      error: (err) => err.message,
    });

    promise.finally(() => setLoading(false));
  };

  const invalidTagsForPendingCategory = pendingCategory
    ? getInvalidTagsForNewCategory(formData.starterTags, pendingCategory)
    : [];

  const invalidTagObjects = getTagsByIds(invalidTagsForPendingCategory);

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Category Change Warning Modal */}
        {showCategoryChangeWarning && pendingCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
              <h3 className="text-lg font-bold text-gray-900">
                Xác nhận thay đổi danh mục
              </h3>
              <p className="text-sm text-gray-600">
                Bạn đang thay đổi danh mục từ{" "}
                <span className="font-semibold">{formData.mainCategory}</span> sang{" "}
                <span className="font-semibold">{pendingCategory}</span>.
              </p>
              <p className="text-sm text-gray-600">
                Các thẻ sau sẽ bị xóa vì không phù hợp với danh mục mới:
              </p>
              <div className="flex flex-wrap gap-2 p-3 bg-red-50 rounded-lg">
                {invalidTagObjects.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancelCategoryChange}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCategoryChange}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Block 1: Thông tin cơ bản */}
        <div className="bg-white p-8 sm:p-10 rounded-[2rem] border border-gray-100 shadow-soft">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <AlignLeft size={20} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Thông tin cơ bản</h2>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-900 flex justify-between">
                <span>Tên dự án <span className="text-red-500">*</span></span>
                <span className="text-gray-400 font-normal">Tối đa 60 ký tự</span>
              </label>
              <Input
                required
                className="text-lg py-6 focus-ring rounded-xl bg-slate-50 border-gray-200"
                placeholder="Ví dụ: Năng lượng xanh cho bản vùng cao..."
                value={formData.title}
                maxLength={60}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-900">
                Mô tả ngắn (Tagline) <span className="text-red-500">*</span>
              </label>
              <Input
                required
                className="py-5 focus-ring rounded-xl bg-slate-50 border-gray-200"
                placeholder="Câu tóm tắt ngắn gọn và cuốn hút nhất về dự án của bạn..."
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Block 2: Nội dung & Hình ảnh */}
        <div className="bg-white p-8 sm:p-10 rounded-[2rem] border border-gray-100 shadow-soft">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ImageIcon size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Câu chuyện & Media</h2>
              <p className="text-sm text-gray-500 font-medium">Một câu chuyện hay cùng hình ảnh đẹp sẽ thu hút nhiều sự chú ý hơn.</p>
            </div>
          </div>

          <div className="space-y-10">
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-900">
                Ảnh chiến dịch <span className="text-red-500">*</span>
              </label>
              <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-gray-300">
                <MultipleImageUpload
                  label="Tải ảnh lên (Tỉ lệ khuyến nghị 16:9)"
                  images={formData.images}
                  onChange={(images) => {
                    console.log("[EditCampaign] Images updated:", images);
                    setFormData(prev => ({ ...prev, images }));
                  }}
                  mainImage={formData.imageUrl}
                  onMainImageChange={(url) => {
                    console.log("[EditCampaign] Main image updated:", url);
                    setFormData(prev => ({ ...prev, imageUrl: url }));
                  }}
                  maxImages={10}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-900">
                Nội dung chi tiết <span className="text-red-500">*</span>
              </label>
              <ProductionEditor
                content={formData.description}
                onChange={(content) => setFormData({ ...formData, description: content })}
                config={{
                  placeholder: EDITOR_PLACEHOLDERS.CAMPAIGN_DESCRIPTION,
                  autosave: false,
                  enableBubbleMenu: true,
                }}
              />
            </div>
          </div>
        </div>

        {/* Block 3: Mục tiêu & Thời gian */}
        <div className="bg-white p-8 sm:p-10 rounded-[2rem] border border-gray-100 shadow-soft">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Target size={20} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Mục tiêu & Lịch trình</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-900">
                Số vốn mục tiêu (VNĐ) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₫</span>
                <Input
                  type="text"
                  className="pl-10 text-lg font-black text-gray-900 py-6 focus-ring rounded-xl bg-slate-50 border-gray-200"
                  required
                  placeholder="1.000.000"
                  value={displayAmount}
                  onChange={handleAmountChange}
                />
              </div>
              <p className="text-xs text-gray-500 font-medium">Đặt mục tiêu có thể đạt được để tạo động lực cho cộng đồng.</p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-900">
                Hạn chót chiến dịch <span className="text-red-500">*</span>
              </label>
              <DateInput
                value={formData.endDate}
                onChange={(value) => setFormData({ ...formData, endDate: value })}
                placeholder="dd/mm/yyyy"
                required
                min={new Date().toISOString().split('T')[0]} // Không cho chọn ngày quá khứ
              />
              <p className="text-xs text-gray-500 font-medium">Thời gian tối đa thường là 30 - 60 ngày.</p>
            </div>
          </div>
        </div>

        {/* Block 4: Phân loại & Tags */}
        <div className="bg-white p-8 sm:p-10 rounded-[2rem] border border-gray-100 shadow-soft">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Tags size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Phân loại dự án</h2>
              <p className="text-sm text-gray-500 font-medium">Giúp người ủng hộ dễ dàng tìm thấy dự án của bạn</p>
            </div>
          </div>

          <div className="space-y-8">
            <CategorySelector
              selectedCategory={formData.mainCategory}
              onCategoryChange={handleCategoryChange}
            />

            <div className="border-t border-gray-100 pt-8">
              <StarterTagsSelector
                mainCategory={formData.mainCategory}
                selectedTags={formData.starterTags}
                onTagsChange={handleTagsChange}
              />
            </div>

            <div className="border-t border-gray-100 pt-8">
              <BlogSelector
                selectedBlogIds={formData.linkedBlogIds}
                onBlogsChange={(blogIds) => setFormData({ ...formData, linkedBlogIds: blogIds })}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className={`
                flex-1 btn-primary px-12 py-5 text-lg shadow-[0_8px_30px_rgb(37,99,235,0.3)]
                ${loading ? "opacity-70 cursor-not-allowed" : ""}
             `}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang cập nhật...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Save size={20} />
                Lưu thay đổi
              </span>
            )}
          </button>
          <Link
            href="/dashboard/creator"
            className="px-8 py-5 bg-gray-100 text-gray-900 rounded-xl font-bold hover:bg-gray-200 transition flex items-center justify-center gap-2"
          >
            <X size={20} />
            Hủy
          </Link>
        </div>
      </form>
    </div>
  );
}
```

### 5.17 `src/components/campaign/UpdateSection.tsx`

```tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { PlusCircle, Sparkles, Send, Search, Tag, Pin, Edit2, Trash2, X } from "lucide-react";
import { formatFullDateTime } from "@/lib/utils";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { Button } from "@/components/ui/button";
import { ProductionEditor } from "@/components/editor";
import { EDITOR_PLACEHOLDERS } from "@/lib/editor/constants";
import RichTextRenderer from "@/components/shared/RichTextRenderer";

interface UpdateSectionProps {
  campaignId: string;
  slug: string;
  isCreator: boolean;
}

// Danh sách tags với màu sắc riêng
const TAG_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
  "Tiến độ": { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  "Sản xuất": { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
  "Thử nghiệm": { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
  "Vận chuyển": { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-200" },
  "Đóng gói": { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-200" },
  "Thiết kế": { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200" },
  "Nguyên liệu": { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  "Chất lượng": { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  "Cải tiến": { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-200" },
  "Hoàn thành": { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  "Khó khăn": { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
  "Thành công": { bg: "bg-lime-100", text: "text-lime-700", border: "border-lime-200" },
  "Cảm ơn": { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200" },
  "Thông báo": { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" }
};

const AVAILABLE_TAGS = Object.keys(TAG_CONFIG);

const getTagStyle = (tag: string) => {
  return TAG_CONFIG[tag] || { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" };
};

export default function UpdateSection({ campaignId, slug, isCreator }: UpdateSectionProps) {
  const { data: session } = useSession();
  const formRef = useRef<HTMLDivElement>(null); // Ref cho form
  const [updates, setUpdates] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // ID của update đang edit
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>(""); // Chỉ 1 tag
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    fetchUpdates();
  }, [slug, searchQuery, filterTag]);

  const fetchUpdates = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (filterTag) params.append("tag", filterTag);

      const res = await fetch(`/api/campaigns/${slug}/updates?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUpdates(data);

      // Extract all unique tags
      const uniqueTags = Array.from(new Set(data.flatMap((u: any) => u.tags || []))) as string[];
      setAllTags(uniqueTags);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    try {
      const url = editingId
        ? `/api/campaigns/${slug}/updates/${editingId}`
        : `/api/campaigns/${slug}/updates`;

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          imageUrl,
          tags: selectedTag ? [selectedTag] : [], // Chỉ 1 tag
          isPinned,
        })
      });

      const data = await res.json();
      if (res.ok) {
        if (editingId) {
          // Cập nhật update trong list
          setUpdates(updates.map(u => u.id === editingId ? data : u));
        } else {
          // Thêm update mới
          setUpdates([data, ...updates]);
        }

        // Reset form
        setTitle("");
        setContent("");
        setImageUrl("");
        setSelectedTag("");
        setIsPinned(false);
        setEditingId(null);
        setShowForm(false);
      } else {
        alert(data.error || "Lỗi khi lưu cập nhật");
      }
    } catch (err) {
      console.error(err);
      alert("Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (update: any) => {
    setEditingId(update.id);
    setTitle(update.title);
    setContent(update.content);
    setImageUrl(update.imageUrl || "");
    setSelectedTag(update.tags?.[0] || "");
    setIsPinned(update.isPinned || false);
    setShowForm(true);

    // Scroll to form sau khi render
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setImageUrl("");
    setSelectedTag("");
    setIsPinned(false);
    setShowForm(false);
  };

  const handleDelete = async (updateId: string) => {
    if (!confirm("Bạn có chắc muốn xóa cập nhật này?")) return;

    try {
      const res = await fetch(`/api/campaigns/${slug}/updates/${updateId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        setUpdates(updates.filter(u => u.id !== updateId));
      } else {
        alert(data.error || "Lỗi khi xóa cập nhật");
      }
    } catch (err) {
      console.error(err);
      alert("Đã có lỗi xảy ra");
    }
  };

  return (
    <div className="space-y-12">
      {/* Nút bật form (Chỉ cho chủ dự án) */}
      {isCreator && (
        <div className="flex justify-between items-center bg-blue-50 border border-blue-100 p-8 rounded-[2.5rem] shadow-soft">
          <div>
            <h3 className="text-xl font-black text-gray-900 mb-1 tracking-tight">Cập nhật tiến độ dự án</h3>
            <p className="text-xs text-blue-600 font-black uppercase tracking-widest leading-relaxed">Chia sẻ tin vui với những người ủng hộ bạn!</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="h-14 px-8 bg-blue-600 text-white font-black rounded-2xl hover:bg-black transition flex items-center gap-2 shadow-lg active:scale-95"
          >
            <PlusCircle size={20} />
            {showForm ? "Đóng Form" : "Đăng cập nhật mới"}
          </Button>
        </div>
      )}

      {/* Form đăng cập nhật */}
      {showForm && (
        <div ref={formRef} className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-premium animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-gray-900">
              {editingId ? "Chỉnh sửa cập nhật" : "Đăng cập nhật mới"}
            </h3>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-600 flex items-center gap-2 text-sm font-bold"
              >
                <X size={16} />
                Hủy chỉnh sửa
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <label className="text-xs font-black text-gray-900 uppercase tracking-widest">Tiêu đề bản tin</label>
              <input
                className="w-full p-6 bg-gray-50 border-0 rounded-[1.5rem] focus:ring-2 focus:ring-blue-600 text-lg font-black placeholder:text-gray-400 leading-none"
                placeholder="VD: Chúng ta đã đạt 50% mục tiêu! 🎉"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-gray-900 uppercase tracking-widest">Nội dung chi tiết</label>
              <ProductionEditor
                content={content}
                onChange={setContent}
                config={{
                  placeholder: EDITOR_PLACEHOLDERS.UPDATE_POST,
                  autosave: false,
                  enableBubbleMenu: true,
                }}
              />
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <Tag size={14} />
                Phân loại (Chọn 1 mục)
              </label>

              <select
                className="w-full p-4 bg-gray-50 border-0 rounded-[1.5rem] focus:ring-2 focus:ring-blue-600 text-sm font-bold"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
              >
                <option value="">-- Không chọn --</option>
                {AVAILABLE_TAGS.map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>

              {selectedTag && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-bold">Đã chọn:</span>
                  <span className={`inline-flex items-center gap-1 px-4 py-2 ${getTagStyle(selectedTag).bg} ${getTagStyle(selectedTag).text} border ${getTagStyle(selectedTag).border} rounded-full text-sm font-bold`}>
                    #{selectedTag}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-200">
              <input
                type="checkbox"
                id="isPinned"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-5 h-5 rounded"
              />
              <label htmlFor="isPinned" className="text-sm font-bold text-amber-900 flex items-center gap-2 cursor-pointer">
                <Pin size={16} />
                Ghim bản tin này lên đầu (Quan trọng)
              </label>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={loading}
                className="h-18 px-12 bg-gray-900 text-white font-black rounded-[1.8rem] hover:bg-blue-600 transition flex items-center gap-3 shadow-xl active:scale-95"
              >
                <Send size={20} />
                {editingId ? "Cập nhật" : "Phát hành cập nhật"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Filter */}
      <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-soft space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc nội dung..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-600 text-sm"
            />
          </div>

          {allTags.length > 0 && (
            <div className="flex items-center gap-2">
              <Tag className="text-gray-400" size={18} />
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-600 text-sm font-bold"
              >
                <option value="">Tất cả phân loại</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {(searchQuery || filterTag) && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 font-bold">Đang lọc:</span>
            {searchQuery && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold">
                "{searchQuery}"
              </span>
            )}
            {filterTag && (
              <span className={`px-3 py-1 ${getTagStyle(filterTag).bg} ${getTagStyle(filterTag).text} rounded-full font-bold`}>
                #{filterTag}
              </span>
            )}
            <button
              onClick={() => { setSearchQuery(""); setFilterTag(""); }}
              className="ml-2 text-gray-400 hover:text-gray-600 underline"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Layout with Sidebar - Kickstarter style */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar - List of updates */}
        {!fetching && updates.length > 0 && (
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sticky top-4">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">
                Danh sách cập nhật
              </h3>
              <div className="space-y-1 max-h-[600px] overflow-y-auto">
                {updates.map((update) => (
                  <a
                    key={update.id}
                    href={`#update-${update.id}`}
                    className="block px-3 py-2 rounded-lg hover:bg-gray-50 transition group"
                  >
                    <div className="flex items-start gap-2">
                      {update.isPinned && (
                        <Pin size={12} className="text-amber-500 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition truncate">
                          {update.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(update.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                        {update.tags && update.tags.length > 0 && (
                          <span className={`inline-block mt-1 px-2 py-0.5 ${getTagStyle(update.tags[0]).bg} ${getTagStyle(update.tags[0]).text} rounded text-xs font-bold`}>
                            {update.tags[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Update details */}
        <div className="flex-1 min-w-0">
          <div className="relative space-y-12">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b pb-4">
              Lịch sử cập nhật chiến dịch ({updates.length})
            </h3>

            {fetching ? (
              <div className="py-24 text-center text-gray-400 font-bold animate-pulse uppercase tracking-widest text-xs italic">Đang đồng bộ dữ liệu...</div>
            ) : updates.length > 0 ? (
              <div className="space-y-16">
                {updates.map((update, idx) => (
                  <div key={update.id} id={`update-${update.id}`} className="relative group animate-fade-in-up scroll-mt-4">
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <h4 className="text-2xl font-black text-gray-900 tracking-tight leading-[0.9] group-hover:text-blue-600 transition">{update.title}</h4>
                          {update.isPinned && (
                            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black uppercase flex items-center gap-1">
                              <Pin size={10} />
                              Ghim
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none bg-gray-50 px-3 py-1 rounded-full">{formatFullDateTime(update.createdAt)}</span>
                      </div>

                      {update.tags && update.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {update.tags.map((tag: string) => {
                            const style = getTagStyle(tag);
                            return (
                              <span key={tag} className={`px-4 py-2 ${style.bg} ${style.text} border ${style.border} rounded-full text-sm font-bold shadow-sm`}>
                                #{tag}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      <div className="bg-white border border-gray-100 p-10 rounded-[2.5rem] shadow-soft group-hover:shadow-premium transition-all duration-500">
                        <div className="mb-8">
                          <RichTextRenderer content={update.content} />
                        </div>
                        {update.imageUrl && (
                          <div className="relative w-full h-[400px] overflow-hidden rounded-[2rem] border border-gray-100 shadow-inner group/img">
                            <img src={update.imageUrl} alt="Update visuals" className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700" />
                          </div>
                        )}

                        {/* Edit & Delete buttons for creator */}
                        {isCreator && (
                          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100">
                            <button
                              onClick={() => handleEdit(update)}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition text-sm font-bold"
                            >
                              <Edit2 size={16} />
                              Chỉnh sửa
                            </button>
                            <button
                              onClick={() => handleDelete(update.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition text-sm font-bold"
                            >
                              <Trash2 size={16} />
                              Xóa
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center glass-morphism rounded-[3rem]">
                <PlusCircle className="mx-auto text-gray-200 mb-4" size={56} />
                <p className="text-gray-400 font-black text-xs uppercase tracking-widest italic">
                  {searchQuery || filterTag ? "Không tìm thấy kết quả phù hợp." : "Chưa có cập nhật nào từ chủ dự án."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 5.18 `src/components/campaign/CampaignTabsWrapper.tsx`

```tsx
'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatVND, formatDate } from "@/lib/utils";
import { Clock, ShieldCheck, BookOpen } from "lucide-react";
import CommentSection from "@/components/campaign/CommentSection";
import UpdateSection from "@/components/campaign/UpdateSection";
import RichTextRenderer from "@/components/shared/RichTextRenderer";
import BackerLink from "@/components/campaign/BackerLink";
import CampaignRewards from "@/components/campaign/CampaignRewards";
import LinkedBlogsSection from "@/components/campaign/LinkedBlogsSection";

interface CampaignTabsWrapperProps {
    campaign: any;
    isCreator: boolean;
    slug: string;
    daysLeft: number | string;
    percentRaised: number;
}

export default function CampaignTabsWrapper({
    campaign,
    isCreator,
    slug,
    daysLeft,
    percentRaised
}: CampaignTabsWrapperProps) {
    return (
        <div className="w-full">
            <Tabs defaultValue="details" className="w-full">
                {/* Tabs Navigation */}
                <div className="border-b border-gray-200 bg-white mb-6">
                    <TabsList className="h-auto bg-transparent p-0 gap-8 w-full justify-start">
                        <TabsTrigger
                            value="details"
                            className="relative py-4 px-0 rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent"
                        >
                            Chi tiết dự án
                        </TabsTrigger>
                        <TabsTrigger
                            value="updates"
                            className="relative py-4 px-0 rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent"
                        >
                            Cập nhật tin tức
                        </TabsTrigger>
                        <TabsTrigger
                            value="blogs"
                            className="relative py-4 px-0 rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent flex items-center gap-2"
                        >
                            <BookOpen className="h-4 w-4" />
                            Blog
                            {campaign.linkedBlogs && campaign.linkedBlogs.length > 0 && (
                                <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                    {campaign.linkedBlogs.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger
                            value="backers"
                            className="relative py-4 px-0 rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent"
                        >
                            Người ủng hộ
                        </TabsTrigger>
                        <TabsTrigger
                            value="comments"
                            className="relative py-4 px-0 rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent"
                        >
                            Thảo luận cộng đồng
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Content */}
                <div className="w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            <TabsContent value="details" className="mt-0">
                                <div className="prose max-w-none">
                                    <RichTextRenderer content={campaign.longDescription || campaign.description} />
                                </div>
                            </TabsContent>

                            <TabsContent value="updates" className="mt-0">
                                <UpdateSection campaignId={campaign.id} slug={slug} isCreator={isCreator} />
                            </TabsContent>

                            <TabsContent value="blogs" className="mt-0">
                                <LinkedBlogsSection linkedBlogs={campaign.linkedBlogs || []} />
                            </TabsContent>

                            <TabsContent value="backers" className="mt-0">
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Người ủng hộ ({(campaign as any)._count?.pledges || 0})
                                    </h2>
                                    {campaign.pledges.length > 0 ? (
                                        <div className="space-y-4">
                                            {campaign.pledges.map((pledge: any) => (
                                                <div key={pledge.id} className="bg-white border border-gray-200 rounded-lg p-4">
                                                    <BackerLink
                                                        userId={pledge.userId}
                                                        userName={pledge.user?.name}
                                                        displayName={pledge.displayName}
                                                        isAnonymous={pledge.isAnonymous}
                                                        userAvatar={pledge.user?.avatar}
                                                    />
                                                    <div className="mt-2 text-sm text-gray-500">
                                                        Ủng hộ {formatVND(pledge.amount)} • {formatDate(pledge.createdAt)}
                                                    </div>
                                                </div>
                                            ))}
                                            {(campaign as any)._count?.pledges > 5 && (
                                                <div className="text-center py-4">
                                                    <p className="text-sm text-gray-500">
                                                        Và {(campaign as any)._count.pledges - 5} người ủng hộ khác...
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-gray-600">Chưa có người ủng hộ</p>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="comments" className="mt-0">
                                <CommentSection campaignId={campaign.id} slug={slug} />
                            </TabsContent>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="lg:sticky lg:top-32 space-y-6">
                                {/* Rewards Section */}
                                <CampaignRewards
                                    rewards={campaign.rewards || []}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Tabs>
        </div>
    );
}
```

### 5.19 `src/app/blog/editor/page.tsx`

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { ProductionEditor } from '@/components/editor/ProductionEditor';
import { ImageUpload } from '@/components/shared/ImageUpload';

export default function BlogEditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const campaignId = searchParams.get('campaignId');

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    coverImage: '',
    type: campaignId ? 'CAMPAIGN_UPDATE' : 'STORY',
    visibility: 'PUBLIC',
    categoryIds: [] as string[],
    tags: [] as string[],
    status: 'DRAFT',
  });

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/blog/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent, publishNow = false) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        campaignId: campaignId || undefined,
        status: publishNow ? 'PUBLISHED' : 'DRAFT',
      };

      const res = await fetch('/api/blog/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create post');
      }

      const post = await res.json();
      toast.success(publishNow ? 'Bài viết đã được xuất bản!' : 'Bản nháp đã được lưu!');
      router.push(`/blog/${post.slug}`);
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {campaignId ? 'Viết cập nhật chiến dịch' : 'Tạo bài viết mới'}
        </h1>

        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập tiêu đề bài viết..."
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tóm tắt
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tóm tắt ngắn gọn về bài viết..."
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung <span className="text-red-500">*</span>
            </label>
            <ProductionEditor
              content={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              config={{
                placeholder: 'Viết nội dung bài viết...',
                maxLength: 10000,
              }}
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh bìa
            </label>
            <ImageUpload
              value={formData.coverImage}
              onChange={(url) => setFormData({ ...formData, coverImage: url })}
            />
            <p className="mt-1 text-xs text-gray-500">
              Chọn một tấm ảnh thật ấn tượng để thu hút người đọc.
            </p>
          </div>

          {/* Type */}
          {!campaignId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại bài viết
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {(session?.user as any)?.isAdmin && (
                  <>
                    <option value="PLATFORM">Tin tức nền tảng</option>
                    <option value="ANNOUNCEMENT">Thông báo</option>
                  </>
                )}
                <option value="STORY">Câu chuyện cá nhân</option>
                <option value="IMPACT_REPORT">Báo cáo tác động</option>
              </select>
            </div>
          )}

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quyền xem
            </label>
            <select
              value={formData.visibility}
              onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="PUBLIC">Công khai</option>
              <option value="BACKERS_ONLY">Chỉ người ủng hộ</option>
              <option value="PRIVATE">Riêng tư</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (phân cách bằng dấu phẩy)
            </label>
            <input
              type="text"
              value={formData.tags.join(', ')}
              onChange={(e) => setFormData({
                ...formData,
                tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="tag1, tag2, tag3"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang lưu...' : 'Lưu nháp'}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang xuất bản...' : 'Xuất bản'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

### 5.20 `src/app/blog/[slug]/page.tsx`

```tsx
// ============================================================
// Blog Detail Page
// ============================================================

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Eye, Heart, Bookmark, Share2, Clock } from 'lucide-react';
import { BlogPostResponse } from '@/types/blog.types';
import { BlogCommentSection } from '@/components/blog/BlogCommentSection';
import { Metadata } from 'next';

async function getBlogPost(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/blog/posts/${slug}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    if (res.status === 404) {
      notFound();
    }
    throw new Error('Failed to fetch blog post');
  }

  return res.json();
}

async function getRelatedPosts(slug: string, currentPostId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/blog/posts?limit=3`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  return data.posts.filter((post: any) => post.id !== currentPostId).slice(0, 3);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    const post = await getBlogPost(slug);

    if (post.status !== 'PUBLISHED') {
      return {
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const title = `${post.title} | TừTế Fund Blog`;
    const description = post.excerpt || post.content?.substring(0, 160) || '';
    const url = `${baseUrl}/blog/${slug}`;
    const imageUrl = post.coverImage || `${baseUrl}/og-image.jpg`;

    return {
      title,
      description,
      alternates: {
        canonical: url,
      },
      openGraph: {
        title,
        description,
        url,
        siteName: 'TừTế Fund',
        locale: 'vi_VN',
        type: 'article',
        publishedTime: post.publishedAt,
        modifiedTime: post.updatedAt,
        authors: [post.author?.name || ''],
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    return {
      title: 'Blog | TừTế Fund',
      description: 'Tin tức, câu chuyện và cập nhật từ cộng đồng crowdfunding TừTế Fund',
    };
  }
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post: BlogPostResponse = await getBlogPost(slug);
  const relatedPosts = await getRelatedPosts(slug, post.id);

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-pgreen transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-pgreen transition-colors">
              Blog
            </Link>
            <span>/</span>
            <span className="max-w-xs truncate font-medium text-dblue">
              {post.title}
            </span>
          </nav>
        </div>
      </div>

      <article className="mx-auto max-w-4xl px-6 py-8">
        {/* Header */}
        <header className="mb-8">
          {/* Type Badge */}
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded-full bg-pgreen/10 px-3 py-1 text-sm font-medium text-pgreen">
              {getTypeLabel(post.type)}
            </span>
            {post.campaign && (
              <a
                href={`/campaigns/${post.campaign.slug}`}
                className="text-sm text-gray-600 hover:text-pgreen"
              >
                → {post.campaign.title}
              </a>
            )}
          </div>

          {/* Title */}
          <h1 className="mb-4 font-display text-4xl font-bold text-dblue leading-tight md:text-5xl">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="mb-6 text-xl text-gray-600 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="mb-4 flex items-center gap-4 text-sm text-gray-600">
            {post.author?.avatar && (
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
            <div>
              <div className="font-medium text-dblue">{post.author?.name}</div>
              <div className="flex items-center gap-2">
                <span>
                  {post.publishedAt
                    ? formatDistanceToNow(new Date(post.publishedAt), {
                      addSuffix: true,
                      locale: vi,
                    })
                    : 'Chưa xuất bản'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.readingTimeMinutes} phút đọc
                </span>
              </div>
            </div>
          </div>

          {/* Stats & Actions */}
          <div className="flex items-center justify-between border-y border-gray-200 py-4">
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-tblue" />
                <span>{post.viewCount} lượt xem</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-pgreen" />
                <span>{post.likeCount} thích</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="rounded-full p-2 transition-colors hover:bg-gray-100">
                <Heart className="w-5 h-5" />
              </button>
              <button className="rounded-full p-2 transition-colors hover:bg-gray-100">
                <Bookmark className="w-5 h-5" />
              </button>
              <button className="rounded-full p-2 transition-colors hover:bg-gray-100">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="relative mb-8 h-96 w-full overflow-hidden rounded-3xl">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none mb-8">
          {post.content && (
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          )}
          {post.richContent && (
            <div>
              {post.richContent.blocks.map((block, index) => (
                <RenderBlock key={index} block={block} />
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <a
                key={tag.id}
                href={`/blog?tag=${tag.slug}`}
                className="rounded-full bg-cream px-3 py-1 text-sm text-gray-600 hover:bg-pgreen/10 hover:text-pgreen"
              >
                #{tag.name}
              </a>
            ))}
          </div>
        )}

        {/* Author Card */}
        <div className="glass rounded-3xl border border-white/50 p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-4">
            {post.author?.avatar && (
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={64}
                height={64}
                className="rounded-full"
              />
            )}
            <div className="flex-1">
              <h3 className="font-display text-lg font-semibold text-dblue">{post.author?.name}</h3>
              <p className="text-sm text-gray-600">Tác giả</p>
            </div>
            {post.author && (
              <Link
                href={`/profile/${post.author.id}`}
                className="rounded-full bg-pgreen/10 px-4 py-2 text-sm font-medium text-pgreen hover:bg-pgreen/20"
              >
                Xem hồ sơ
              </Link>
            )}
          </div>
        </div>

        {/* CTA Section */}
        {post.campaign && (
          <div className="mb-8 rounded-3xl border border-pgreen/20 bg-gradient-to-r from-pgreen/10 to-fgreen/10 p-8">
            <h3 className="mb-4 font-display text-2xl font-bold text-dblue">
              Hỗ trợ chiến dịch này
            </h3>
            <p className="mb-6 text-gray-600">
              Bài viết này là một phần của chiến dịch "{post.campaign.title}".
              Hãy ủng hộ để giúp hiện thực hóa dự án này.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href={`/campaigns/${post.campaign.slug}`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl gradient-green px-6 py-3 font-bold text-white transition-all hover:shadow-lg hover:shadow-green-200"
              >
                Xem chiến dịch
              </Link>
              <Link
                href={`/campaigns/${post.campaign.slug}/pledge`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-pgreen/30 bg-white px-6 py-3 font-semibold text-pgreen hover:bg-pgreen/10"
              >
                Ủng hộ ngay
              </Link>
            </div>
          </div>
        )}

        {/* Related Posts */}
        {relatedPosts && relatedPosts.length > 0 && (
          <div className="mb-8">
            <h3 className="mb-6 flex items-center gap-2 font-display text-2xl font-bold text-dblue">
              <span className="h-2 w-2 rounded-full bg-pgreen"></span>
              Bài viết liên quan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost: BlogPostResponse) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="overflow-hidden rounded-3xl border border-gray-200 bg-white transition-all hover:shadow-lg hover:border-pgreen/30"
                >
                  {relatedPost.coverImage && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={relatedPost.coverImage}
                        alt={relatedPost.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h4 className="mb-2 line-clamp-2 font-semibold text-dblue">
                      {relatedPost.title}
                    </h4>
                    {relatedPost.excerpt && (
                      <p className="line-clamp-2 text-sm text-gray-600">
                        {relatedPost.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <BlogCommentSection postSlug={post.slug} />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: post.title,
              description: post.excerpt || '',
              image: post.coverImage,
              author: {
                '@type': 'Person',
                name: post.author?.name || '',
              },
              datePublished: post.publishedAt,
              dateModified: post.updatedAt,
              url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/blog/${post.slug}`,
            }),
          }}
        />
      </article >
    </div >
  );
}

function RenderBlock({ block }: { block: any }) {
  switch (block.type) {
    case 'paragraph':
      return <p>{block.data.text}</p>;
    case 'heading':
      const HeadingTag = `h${block.data.level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      return <HeadingTag>{block.data.text}</HeadingTag>;
    case 'image':
      return (
        <figure>
          <img src={block.data.url} alt={block.data.alt || ''} />
          {block.data.caption && <figcaption>{block.data.caption}</figcaption>}
        </figure>
      );
    default:
      return null;
  }
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    PLATFORM: 'Tin tức',
    CAMPAIGN_UPDATE: 'Cập nhật dự án',
    ANNOUNCEMENT: 'Thông báo',
    STORY: 'Câu chuyện',
    IMPACT_REPORT: 'Báo cáo tác động',
  };
  return labels[type] || type;
}
```

### 5.21 `src/components/blog/BlogCard.tsx`

```tsx
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Eye, Heart, Clock } from 'lucide-react';

interface BlogCardProps {
  post: {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    coverImage: string;
    author: {
      name: string;
      avatar?: string;
    };
    publishedAt: string;
    viewCount: number;
    likeCount: number;
    readingTimeMinutes: number;
    type: string;
  };
}

export default function BlogCard({ post }: BlogCardProps) {
  const typeLabels: Record<string, string> = {
    PLATFORM: 'Tin tức',
    CAMPAIGN_UPDATE: 'Cập nhật dự án',
    ANNOUNCEMENT: 'Thông báo',
    STORY: 'Câu chuyện',
    IMPACT_REPORT: 'Báo cáo tác động',
  };

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block overflow-hidden rounded-3xl border border-gray-200 bg-white transition-all hover:shadow-lg hover:border-pgreen/30"
    >
      {post.coverImage && (
        <div className="relative h-48 w-full">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      <div className="p-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-full bg-pgreen/10 px-3 py-1 text-sm font-medium text-pgreen">
            {typeLabels[post.type] || post.type}
          </span>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(post.publishedAt), {
              addSuffix: true,
              locale: vi,
            })}
          </span>
        </div>

        <h3 className="mb-2 line-clamp-2 font-semibold text-dblue group-hover:text-pgreen transition-colors">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="mb-4 line-clamp-2 text-sm text-gray-600">
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{post.viewCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            <span>{post.likeCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{post.readingTimeMinutes} phút</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
```

### 5.22 `src/lib/editor/constants.ts`

```ts
/**
 * Editor Constants
 * Centralized configuration for the rich text editor
 */

import { CalloutVariant } from '@/types/editor';

// ============================================
// LIMITS
// ============================================

export const EDITOR_LIMITS = {
  MAX_CONTENT_LENGTH: 50000, // characters
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGES_PER_DOCUMENT: 50,
  AUTOSAVE_DELAY: 2000, // ms
  DEBOUNCE_DELAY: 300, // ms
} as const;

// ============================================
// ALLOWED CONTENT
// ============================================

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
] as const;

export const ALLOWED_VIDEO_DOMAINS = [
  'youtube.com',
  'www.youtube.com',
  'youtu.be',
  'vimeo.com',
  'www.vimeo.com',
] as const;

// ============================================
// SANITIZATION
// ============================================

export const ALLOWED_HTML_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 's', 'code',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote', 'pre',
  'a', 'img', 'iframe',
  'div', 'span',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'hr',
] as const;

export const ALLOWED_HTML_ATTRIBUTES: Record<string, string[]> = {
  a: ['href', 'title', 'target', 'rel'],
  img: ['src', 'alt', 'title', 'width', 'height', 'data-alignment', 'data-caption'],
  iframe: ['src', 'width', 'height', 'frameborder', 'allowfullscreen', 'data-provider'],
  div: ['class', 'data-type', 'data-variant'],
  span: ['class', 'style'],
  code: ['class'],
  pre: ['class'],
  td: ['colspan', 'rowspan'],
  th: ['colspan', 'rowspan'],
};

export const ALLOWED_URL_SCHEMES = ['http', 'https', 'mailto'] as const;

// ============================================
// CALLOUT STYLES
// ============================================

export const CALLOUT_STYLES: Record<CalloutVariant, {
  container: string;
  icon: string;
  iconColor: string;
}> = {
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-900',
    icon: 'ℹ️',
    iconColor: 'text-blue-600',
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 text-amber-900',
    icon: '⚠️',
    iconColor: 'text-amber-600',
  },
  success: {
    container: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    icon: '✓',
    iconColor: 'text-emerald-600',
  },
  danger: {
    container: 'bg-red-50 border-red-200 text-red-900',
    icon: '⚠',
    iconColor: 'text-red-600',
  },
};

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

export const KEYBOARD_SHORTCUTS = {
  BOLD: 'Mod-b',
  ITALIC: 'Mod-i',
  UNDERLINE: 'Mod-u',
  STRIKE: 'Mod-Shift-x',
  CODE: 'Mod-e',
  LINK: 'Mod-k',
  BULLET_LIST: 'Mod-Shift-8',
  ORDERED_LIST: 'Mod-Shift-7',
  TASK_LIST: 'Mod-Shift-9',
  BLOCKQUOTE: 'Mod-Shift-b',
  CODE_BLOCK: 'Mod-Alt-c',
  HEADING_1: 'Mod-Alt-1',
  HEADING_2: 'Mod-Alt-2',
  HEADING_3: 'Mod-Alt-3',
  UNDO: 'Mod-z',
  REDO: 'Mod-Shift-z',
  HARD_BREAK: 'Shift-Enter',
} as const;

// ============================================
// PLACEHOLDERS
// ============================================

export const EDITOR_PLACEHOLDERS = {
  CAMPAIGN_DESCRIPTION: 'Hãy kể câu chuyện chiến dịch của bạn... Người ủng hộ muốn biết dự án này về điều gì, tại sao nó quan trọng, và bạn sẽ sử dụng nguồn vốn như thế nào.',
  UPDATE_POST: 'Chia sẻ tiến độ mới nhất của chiến dịch...',
  FAQ: 'Nhập câu trả lời cho câu hỏi này...',
  REWARD_DESCRIPTION: 'Mô tả chi tiết về phần thưởng này...',
  CREATOR_BIO: 'Giới thiệu về bản thân và đội ngũ của bạn...',
  DEFAULT: 'Bắt đầu viết hoặc gõ / để xem các lệnh...',
} as const;

// ============================================
// ERROR MESSAGES
// ============================================

export const ERROR_MESSAGES = {
  UPLOAD_FAILED: 'Không thể tải ảnh lên. Vui lòng thử lại.',
  FILE_TOO_LARGE: 'Kích thước file vượt quá giới hạn cho phép.',
  INVALID_FILE_TYPE: 'Định dạng file không được hỗ trợ.',
  INVALID_URL: 'URL không hợp lệ.',
  CONTENT_TOO_LONG: 'Nội dung vượt quá giới hạn ký tự cho phép.',
  SAVE_FAILED: 'Không thể lưu nội dung. Vui lòng thử lại.',
  NETWORK_ERROR: 'Lỗi kết nối mạng. Vui lòng kiểm tra và thử lại.',
} as const;

// ============================================
// REGEX PATTERNS
// ============================================

export const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

export const YOUTUBE_REGEX = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;

export const VIMEO_REGEX = /(?:vimeo\.com\/)(\d+)/;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

### 5.23 `src/types/editor.ts`

```ts
/**
 * Rich Text Editor Types
 * Production-ready type definitions for the editor system
 */

import { Editor } from '@tiptap/react';

// ============================================
// EDITOR CONFIGURATION
// ============================================

export interface EditorConfig {
  placeholder?: string;
  maxLength?: number;
  autosave?: boolean;
  autosaveDelay?: number;
  enableSlashCommands?: boolean;
  enableBubbleMenu?: boolean;
  enableFloatingMenu?: boolean;
  readOnly?: boolean;
  editable?: boolean;
}

// ============================================
// CONTENT TYPES
// ============================================

export type EditorContent = string; // HTML string or JSON string

export interface EditorState {
  content: EditorContent;
  isEmpty: boolean;
  wordCount: number;
  characterCount: number;
  isDirty: boolean;
  lastSaved?: Date;
}

// ============================================
// SAVE STATUS
// ============================================

export type SaveStatus = 'saved' | 'saving' | 'error' | 'idle';

export interface SaveState {
  status: SaveStatus;
  lastSaved?: Date;
  error?: string;
}

// ============================================
// CALLOUT VARIANTS
// ============================================

export type CalloutVariant = 'info' | 'warning' | 'success' | 'danger';

export interface CalloutAttrs {
  variant: CalloutVariant;
}

// ============================================
// IMAGE ATTRIBUTES
// ============================================

export type ImageAlignment = 'left' | 'center' | 'right';

export interface ImageAttrs {
  src: string;
  alt?: string;
  title?: string;
  caption?: string;
  alignment?: ImageAlignment;
  width?: number;
  height?: number;
}

// ============================================
// VIDEO EMBED ATTRIBUTES
// ============================================

export type VideoProvider = 'youtube' | 'vimeo';

export interface VideoEmbedAttrs {
  src: string;
  provider: VideoProvider;
  width?: number;
  height?: number;
}

// ============================================
// LINK ATTRIBUTES
// ============================================

export interface LinkAttrs {
  href: string;
  target?: '_blank' | '_self';
  rel?: string;
  title?: string;
}

// ============================================
// SLASH COMMAND ITEMS
// ============================================

export interface SlashCommandItem {
  title: string;
  description: string;
  icon: string;
  command: (editor: Editor) => void;
  keywords?: string[];
}

export interface SlashCommandGroup {
  name: string;
  items: SlashCommandItem[];
}

// ============================================
// VALIDATION
// ============================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface ContentValidationRules {
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  allowedBlocks?: string[];
  maxImages?: number;
}

// ============================================
// UPLOAD
// ============================================

export interface UploadResponse {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// ============================================
// EDITOR CALLBACKS
// ============================================

export interface EditorCallbacks {
  onChange?: (content: EditorContent) => void;
  onSave?: (content: EditorContent) => Promise<void>;
  onBlur?: () => void;
  onFocus?: () => void;
  onError?: (error: Error) => void;
  onUploadStart?: () => void;
  onUploadProgress?: (progress: UploadProgress) => void;
  onUploadComplete?: (response: UploadResponse) => void;
  onUploadError?: (error: Error) => void;
}

// ============================================
// EDITOR PROPS
// ============================================

export interface RichTextEditorProps {
  content: EditorContent;
  onChange: (content: EditorContent) => void;
  config?: EditorConfig;
  callbacks?: EditorCallbacks;
  className?: string;
}

// ============================================
// PREVIEW PROPS
// ============================================

export interface RichTextPreviewProps {
  content: EditorContent;
  className?: string;
}

// ============================================
// TOOLBAR PROPS
// ============================================

export interface EditorToolbarProps {
  editor: Editor | null;
}

export interface BubbleMenuProps {
  editor: Editor | null;
}

// ============================================
// SANITIZATION
// ============================================

export interface SanitizeOptions {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  allowedSchemes?: string[];
  allowedIframeDomains?: string[];
}

export interface SanitizeResult {
  clean: string;
  removed: string[];
  modified: boolean;
}
```

### 5.24 `src/lib/editor/link-validation.ts`

```ts
/**
 * URL validation and normalization for link handling
 */

/**
 * Normalize URL by adding protocol if missing
 */
export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  
  if (!trimmed) return '';
  
  // Already has protocol
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  
  // Add https:// by default
  return `https://${trimmed}`;
}

/**
 * Validate if string is a valid URL
 */
export function isValidUrl(input: string): boolean {
  const trimmed = input.trim();
  
  if (!trimmed) return false;
  
  try {
    const normalized = normalizeUrl(trimmed);
    const url = new URL(normalized);
    
    // Must have valid protocol and hostname
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      url.hostname.length > 0 &&
      url.hostname.includes('.')
    );
  } catch {
    return false;
  }
}

/**
 * Get validation error message
 */
export function getUrlError(input: string): string | null {
  const trimmed = input.trim();
  
  if (!trimmed) {
    return 'URL không được để trống';
  }
  
  if (!isValidUrl(trimmed)) {
    return 'URL không hợp lệ. Ví dụ: example.com hoặc https://example.com';
  }
  
  return null;
}

/**
 * Sanitize URL input
 */
export function sanitizeUrlInput(input: string): string {
  return input.trim();
}
```

### 5.25 `src/lib/editor/link-commands.ts`

```ts
/**
 * Production-ready link commands for Tiptap editor
 * Handles mark lifecycle, selection, and caret placement correctly
 */

import { Editor } from '@tiptap/core';

/**
 * Apply link to current selection
 * Handles: selection, mark application, caret placement, stored marks cleanup
 */
export function applyLinkToSelection(editor: Editor, url: string): boolean {
  if (!editor || !url) return false;

  const { from, to } = editor.state.selection;
  const hasSelection = from !== to;

  if (!hasSelection) {
    console.warn('applyLinkToSelection called without selection');
    return false;
  }

  // Apply link to selection
  editor
    .chain()
    .focus()
    .extendMarkRange('link')
    .setLink({ href: url, target: '_blank' })
    .run();

  // CRITICAL: Move caret to end of link and clear stored marks
  // This prevents link bleeding
  editor
    .chain()
    .focus()
    .setTextSelection(to) // Move to end of selection
    .unsetMark('link') // Clear stored link mark
    .run();

  return true;
}

/**
 * Insert new link at caret position
 * Handles: content insertion, caret placement outside link
 */
export function insertLinkAtCaret(
  editor: Editor,
  text: string,
  url: string
): boolean {
  if (!editor || !text || !url) return false;

  const { from } = editor.state.selection;

  // Insert link content
  editor
    .chain()
    .focus()
    .insertContent({
      type: 'text',
      text: text,
      marks: [
        {
          type: 'link',
          attrs: {
            href: url,
            target: '_blank',
          },
        },
      ],
    })
    .run();

  // CRITICAL: Move caret outside link and clear stored marks
  // Calculate position after inserted text
  const newPos = from + text.length;
  
  editor
    .chain()
    .focus()
    .setTextSelection(newPos)
    .unsetMark('link') // Clear stored link mark
    .run();

  return true;
}

/**
 * Update existing link URL
 * Handles: mark update without duplication
 */
export function updateExistingLink(editor: Editor, url: string): boolean {
  if (!editor || !url) return false;

  // Check if we're in a link
  if (!editor.isActive('link')) {
    console.warn('updateExistingLink called but no link is active');
    return false;
  }

  const { from, to } = editor.state.selection;

  // Update link
  editor
    .chain()
    .focus()
    .extendMarkRange('link')
    .setLink({ href: url, target: '_blank' })
    .run();

  // CRITICAL: Clear stored marks after update
  editor
    .chain()
    .focus()
    .setTextSelection(to)
    .unsetMark('link')
    .run();

  return true;
}

/**
 * Remove link from selection/cursor
 * Handles: mark removal, state cleanup
 */
export function removeLinkFromSelection(editor: Editor): boolean {
  if (!editor) return false;

  const { to } = editor.state.selection;

  // Remove link
  editor
    .chain()
    .focus()
    .extendMarkRange('link')
    .unsetLink()
    .run();

  // CRITICAL: Clear stored marks and ensure caret is clean
  editor
    .chain()
    .focus()
    .setTextSelection(to)
    .unsetMark('link')
    .run();

  return true;
}

/**
 * Clear active link mark from stored marks
 * Use this when you need to ensure next typed character won't have link
 */
export function clearActiveLinkMark(editor: Editor): void {
  if (!editor) return;

  // Remove link from stored marks
  editor.chain().focus().unsetMark('link').run();
}

/**
 * Move caret outside link mark
 * Useful after applying link to ensure next text is plain
 */
export function moveCaretOutsideLink(editor: Editor): void {
  if (!editor) return;

  const { to } = editor.state.selection;

  // Move to end and clear link mark
  editor
    .chain()
    .focus()
    .setTextSelection(to)
    .unsetMark('link')
    .run();
}

/**
 * Check if selection is inside a link
 */
export function isSelectionInsideLink(editor: Editor): boolean {
  if (!editor) return false;
  return editor.isActive('link');
}

/**
 * Get link URL at current cursor position
 */
export function getLinkAtCursor(editor: Editor): string | null {
  if (!editor) return null;

  const attrs = editor.getAttributes('link');
  return attrs.href || null;
}

/**
 * Check if editor has text selection (not just caret)
 */
export function hasTextSelection(editor: Editor): boolean {
  if (!editor) return false;

  const { from, to } = editor.state.selection;
  return from !== to;
}

/**
 * Get selected text
 */
export function getSelectedText(editor: Editor): string {
  if (!editor) return '';

  const { from, to } = editor.state.selection;
  return editor.state.doc.textBetween(from, to, ' ');
}

/**
 * Save current selection for later restore
 */
export interface SavedSelection {
  from: number;
  to: number;
}

export function saveSelection(editor: Editor): SavedSelection | null {
  if (!editor) return null;

  const { from, to } = editor.state.selection;
  return { from, to };
}

/**
 * Restore previously saved selection
 */
export function restoreSelection(
  editor: Editor,
  selection: SavedSelection | null
): void {
  if (!editor || !selection) return;

  try {
    editor.chain().focus().setTextSelection(selection).run();
  } catch (error) {
    console.error('Failed to restore selection:', error);
  }
}
```

---

## Kết luận

- **Đã gom 25 file** liên quan Rich Text Editor/Renderer
- **File không tìm thấy**: `src/components/blog/BlogEditor.tsx`, `src/components/blog/BlogContent.tsx`
- **Rich Text Editor chính**: `src/components/editor/ProductionEditor.tsx`
- **Rich Text Renderer**: `src/components/shared/RichTextRenderer.tsx`
- **Trang tạo chiến dịch**: Đang dùng `ProductionEditor` cho field `description`
- **Blog editor**: Đang dùng `ProductionEditor` cho field `content`
- **Cập nhật chiến dịch**: Đang dùng `ProductionEditor` cho field `content`
- **Hiển thị**: Dùng `RichTextRenderer` để hiển thị nội dung đã lưu

File này có thể xóa sau khi phân tích xong.
