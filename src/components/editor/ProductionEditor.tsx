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
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const editorRef = useRef<Editor | null>(null);
  const isMountedRef = useRef(true);
  const onChangeDebounceRef = useRef<NodeJS.Timeout>();
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
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              saveStatus === 'saved'
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
