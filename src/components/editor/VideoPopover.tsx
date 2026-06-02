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

  // Calculate position - stable effect
  useEffect(() => {
    if (!isOpen || !editor?.view) return;

    try {
      const { state, view } = editor;
      const { from } = state.selection;
      const coords = view.coordsAtPos(from);
      const editorElement = view.dom;
      const editorRect = editorElement.getBoundingClientRect();
      
      requestAnimationFrame(() => {
        setPosition({
          top: coords.bottom - editorRect.top + 8,
          left: coords.left - editorRect.left,
        });
      });
    } catch (error) {
      console.error('[VideoPopover] Position calculation error:', error);
      requestAnimationFrame(() => {
        setPosition({ top: 50, left: 50 });
      });
    }
  }, [isOpen, editor]);

  // Reset input and focus when opened
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        setUrl('');
        setError('');
      });

      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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
        return;
      }

      // Check if event is from toolbar button
      const isToolbarButton = path.some(el =>
        (el as HTMLElement).closest?.('[data-video-button]')
      );

      if (isToolbarButton) {
        return;
      }

      // Truly outside - close
      onClose();
    };

    // Add listener after delay, use capture phase
    const timer = setTimeout(() => {
      document.addEventListener('pointerdown', handlePointerDown, true);
    }, 200);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('pointerdown', handlePointerDown, true);
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
      className="absolute z-50 bg-white rounded-2xl shadow-2xl border border-pgreen/15 p-4 min-w-[320px] max-w-[400px]"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2.5">
        <Youtube size={16} className="text-pgreen" />
        <span className="text-sm font-semibold text-dblue">
          Chèn video YouTube/Vimeo
        </span>
      </div>

      {/* Input */}
      <div className="mb-3.5">
        <input
          ref={inputRef}
          type="text"
          value={url}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="https://youtube.com/watch?v=... hoặc https://vimeo.com/..."
          className={`w-full px-3.5 py-2 text-sm border rounded-xl focus:outline-none focus:ring-4 transition-all ${error
              ? 'border-red-300 focus:ring-red-200'
              : 'border-pgreen/20 focus:ring-pgreen/10 focus:border-pgreen/40 bg-white'
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
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white gradient-green rounded-xl hover:shadow-md transition-all"
        >
          <Check size={14} />
          Chèn video
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-dblue bg-cream rounded-xl hover:text-pgreen hover:bg-cream/80 transition-all"
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
