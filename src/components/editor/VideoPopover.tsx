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
