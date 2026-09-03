/**
 * Production-Ready Rich Text Editor
 * Single editor used by campaign, blog, and updates.
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
import { ProductBoxPopover } from './ProductBoxPopover';
import { getLinkAtCursor, saveSelection, type SavedSelection } from '@/lib/editor/link-commands';
import { sanitizePastedContent } from '@/lib/editor/sanitize';
import { EDITOR_LIMITS, ERROR_MESSAGES } from '@/lib/editor/constants';
import { RichTextEditorProps, SaveStatus } from '@/types/editor';
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
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
  const [linkPopoverInitialUrl, setLinkPopoverInitialUrl] = useState('');
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);
  const [linkSavedSelection, setLinkSavedSelection] = useState<SavedSelection | null>(null);
  const [isVideoPopoverOpen, setIsVideoPopoverOpen] = useState(false);
  const [isProductPopoverOpen, setIsProductPopoverOpen] = useState(false);
  const [productSavedSelection, setProductSavedSelection] = useState<SavedSelection | null>(null);
  const [productEditData, setProductEditData] = useState<{
    rewardId: string | null;
    title: string;
    price: string;
    imageUrl: string | null;
    linkUrl: string | null;
    pos: number | null;
  } | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const editorRef = useRef<Editor | null>(null);
  const isMountedRef = useRef(true);
  const onChangeDebounceRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastEmittedHtmlRef = useRef(content || '');
  const isLinkPopoverOpenRef = useRef(false);
  const isVideoPopoverOpenRef = useRef(false);

  const {
    placeholder,
    maxLength = EDITOR_LIMITS.MAX_CONTENT_LENGTH,
    autosave = true,
    autosaveDelay = EDITOR_LIMITS.AUTOSAVE_DELAY,
    enableBubbleMenu = true,
    readOnly = false,
    editable = true,
  } = config;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: getEditorExtensions({
      placeholder,
      maxLength,
    }),
    content: content || '',
    editable: editable && !readOnly,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none min-h-[420px] px-6 py-6 focus:outline-none',
      },
      handlePaste: (_view, event) => {
        const html = event.clipboardData?.getData('text/html');
        if (!html || !editorRef.current) return false;
        event.preventDefault();
        const clean = sanitizePastedContent(html);
        editorRef.current.chain().focus().insertContent(clean || event.clipboardData?.getData('text/plain') || '').run();
        return true;
      },
    },
    onCreate: ({ editor: instance }) => {
      editorRef.current = instance;
      lastEmittedHtmlRef.current = instance.getHTML();
      const cc = instance.storage.characterCount;
      setWordCount(cc?.words?.() ?? 0);
      setCharCount(cc?.characters?.() ?? 0);
    },
    onUpdate: ({ editor: instance }) => {
      const html = instance.getHTML();
      lastEmittedHtmlRef.current = html;
      const cc = instance.storage.characterCount;
      setWordCount(cc?.words?.() ?? 0);
      setCharCount(cc?.characters?.() ?? 0);
      if (onChangeDebounceRef.current) {
        clearTimeout(onChangeDebounceRef.current);
      }
      onChangeDebounceRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          onChange(html);
        }
      }, EDITOR_LIMITS.DEBOUNCE_DELAY);
      if (autosave && callbacks.onSave) {
        handleAutosave(html);
      } else if (isMountedRef.current) {
        setSaveStatus('idle');
      }
    },
    onFocus: () => {
      callbacks.onFocus?.();
    },
    onBlur: () => {
      callbacks.onBlur?.();
    },
  });

  useEffect(() => {
    isMountedRef.current = true;
    if (editor) {
      editorRef.current = editor;
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const incoming = content || '';
    if (incoming === lastEmittedHtmlRef.current) return;
    if (incoming === editor.getHTML()) {
      lastEmittedHtmlRef.current = incoming;
      return;
    }
    editor.commands.setContent(incoming, false);
    lastEmittedHtmlRef.current = incoming;
  }, [content, editor]);

  const handleAutosave = useCallback(
    (nextContent: string) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      setSaveStatus('saving');
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          if (callbacks.onSave) {
            await callbacks.onSave(nextContent);
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

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (onChangeDebounceRef.current) clearTimeout(onChangeDebounceRef.current);
    };
  }, []);

  const handleImageUpload = useCallback(async () => {
    if (!editor) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      if (file.size > EDITOR_LIMITS.MAX_IMAGE_SIZE) {
        toast.error(ERROR_MESSAGES.FILE_TOO_LARGE);
        return;
      }
      try {
        setIsUploading(true);
        callbacks.onUploadStart?.();
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!response.ok) throw new Error('Upload failed');
        const data = await response.json();
        editor.chain().focus().setImage({ src: data.url, alt: file.name }).run();
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

  const handleVideoEmbed = useCallback(() => {
    if (!editorRef.current) return;
    if (isVideoPopoverOpenRef.current) return;
    isVideoPopoverOpenRef.current = true;
    setIsVideoPopoverOpen(true);
  }, []);

  const handleVideoPopoverClose = useCallback(() => {
    isVideoPopoverOpenRef.current = false;
    setIsVideoPopoverOpen(false);
  }, []);

  const handleProductBox = useCallback(() => {
    const currentEditor = editorRef.current;
    if (!currentEditor) return;
    setProductSavedSelection(saveSelection(currentEditor));
    setProductEditData(null);
    setIsProductPopoverOpen(true);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setProductSavedSelection(null);
      setProductEditData(detail || null);
      setIsProductPopoverOpen(true);
    };
    window.addEventListener('productbox:edit', handler);
    return () => window.removeEventListener('productbox:edit', handler);
  }, []);

  const handleLinkInsert = useCallback(() => {
    const currentEditor = editorRef.current;
    if (!currentEditor) return;
    if (isLinkPopoverOpenRef.current) return;
    const selection = saveSelection(currentEditor);
    setLinkSavedSelection(selection);
    const previousUrl = getLinkAtCursor(currentEditor);
    if (previousUrl) {
      setLinkPopoverInitialUrl(previousUrl);
      setIsLinkEditMode(true);
    } else {
      setLinkPopoverInitialUrl('');
      setIsLinkEditMode(false);
    }
    isLinkPopoverOpenRef.current = true;
    setIsLinkPopoverOpen(true);
  }, []);

  const handleLinkPopoverClose = useCallback(() => {
    isLinkPopoverOpenRef.current = false;
    setIsLinkPopoverOpen(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!editorRef.current?.isFocused) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        e.stopPropagation();
        handleLinkInsert();
      }
    };
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [handleLinkInsert]);

  if (!editor) {
    return (
      <div className="w-full animate-pulse rounded-3xl border border-pgreen/10 bg-cream/40 overflow-hidden">
        <div className="h-12 bg-cream/80 border-b border-pgreen/10" />
        <div className="h-96" />
      </div>
    );
  }

  return (
    <div className={`w-full overflow-hidden rounded-3xl border border-pgreen/15 bg-white shadow-soft transition-all focus-within:border-pgreen/40 focus-within:ring-4 focus-within:ring-pgreen/10 ${className}`}>
      <EditorToolbar
        editor={editor}
        onImageUpload={handleImageUpload}
        onVideoEmbed={handleVideoEmbed}
        onLinkInsert={handleLinkInsert}
        onProductBox={handleProductBox}
      />
      {enableBubbleMenu && (
        <EditorBubbleMenu editor={editor} onLinkInsert={handleLinkInsert} />
      )}
      <div className="cursor-text bg-white relative" onClick={() => editor.commands.focus()}>
        <EditorContent editor={editor} />
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
        {isVideoPopoverOpen && (
          <VideoPopover editor={editor} isOpen={isVideoPopoverOpen} onClose={handleVideoPopoverClose} />
        )}
        {isProductPopoverOpen && (
          <ProductBoxPopover
            editor={editor}
            isOpen={isProductPopoverOpen}
            onClose={() => {
              setProductSavedSelection(null);
              setIsProductPopoverOpen(false);
            }}
            savedSelection={productSavedSelection}
            editData={productEditData}
            onCancelEdit={() => {
              setProductEditData(null);
              setIsProductPopoverOpen(false);
            }}
          />
        )}
        {isUploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-pgreen border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium text-gray-700">Đang tải ảnh lên...</span>
            </div>
          </div>
        )}
      </div>
      <div className="px-6 py-3 bg-cream/40 border-t border-pgreen/10 flex justify-between items-center">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${saveStatus === 'saved' ? 'bg-pgreen' : saveStatus === 'saving' ? 'bg-fgreen animate-pulse' : saveStatus === 'error' ? 'bg-red-500' : 'bg-gray-300'}`} />
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
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-gray-400">{wordCount} từ</span>
          <span className="text-xs font-semibold text-gray-400">{charCount} / {maxLength} ký tự</span>
        </div>
      </div>
    </div>
  );
}

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
