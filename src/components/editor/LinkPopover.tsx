/**
 * Floating Link Popover - Production-ready with proper mark lifecycle
 * Fixes link bleeding, selection loss, and caret placement issues
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { Link as LinkIcon, Check, X, Trash2 } from 'lucide-react';
import {
  applyLinkToSelection,
  insertLinkAtCaret,
  updateExistingLink,
  removeLinkFromSelection,
  hasTextSelection,
  saveSelection,
  restoreSelection,
  type SavedSelection,
} from '@/lib/editor/link-commands';
import {
  normalizeUrl,
  isValidUrl,
  getUrlError,
  sanitizeUrlInput,
} from '@/lib/editor/link-validation';

interface LinkPopoverProps {
  editor: Editor;
  isOpen: boolean;
  onClose: () => void;
  initialUrl?: string;
  isEditMode?: boolean;
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
}: LinkPopoverProps) {
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState('');
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const [savedSelection, setSavedSelection] = useState<SavedSelection | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Calculate position based on selection/caret
  const calculatePosition = useCallback(() => {
    if (!editor || !editor.view) return;

    try {
      const { state, view } = editor;
      const { from, to } = state.selection;

      // Get coordinates from editor view
      // Use 'to' position for better UX (end of selection or caret)
      const coords = view.coordsAtPos(to);
      
      // Get editor container position
      const editorElement = view.dom;
      const editorRect = editorElement.getBoundingClientRect();
      
      // Calculate popover position
      // Position below the selection/caret with some offset
      const top = coords.bottom - editorRect.top + 8;
      const left = coords.left - editorRect.left;

      setPosition({ top, left });
    } catch (error) {
      console.error('Error calculating position:', error);
      // Fallback position
      setPosition({ top: 50, left: 50 });
    }
  }, [editor]);

  // Update position when opened
  useEffect(() => {
    if (isOpen) {
      // CRITICAL: Save selection before opening popover
      // This prevents selection loss when input gets focus
      const selection = saveSelection(editor);
      setSavedSelection(selection);
      
      calculatePosition();
      setUrl(initialUrl);
      setError('');
      
      // Focus input after a brief delay to ensure rendering
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, initialUrl, calculatePosition, editor]);

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Add delay to prevent immediate close on open
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

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
  }, [isOpen, url, onClose]);

  // Validate URL on change
  const handleUrlChange = (value: string) => {
    setUrl(value);
    
    // Clear error when typing
    if (error) {
      setError('');
    }
  };

  // Apply link with proper mark lifecycle management
  const handleApply = () => {
    const trimmedUrl = sanitizeUrlInput(url);

    // Validate
    const validationError = getUrlError(trimmedUrl);
    if (validationError) {
      setError(validationError);
      return;
    }

    const normalizedUrl = normalizeUrl(trimmedUrl);

    // Restore selection before applying
    // This ensures we apply to the correct range
    if (savedSelection) {
      restoreSelection(editor, savedSelection);
    }

    // Determine action based on context
    const hasSelection = hasTextSelection(editor);

    if (isEditMode) {
      // Update existing link
      updateExistingLink(editor, normalizedUrl);
    } else if (hasSelection) {
      // Apply link to selected text
      applyLinkToSelection(editor, normalizedUrl);
    } else {
      // Insert new link at caret
      // Use URL as display text
      insertLinkAtCaret(editor, trimmedUrl, normalizedUrl);
    }

    // Close popover and return focus to editor
    onClose();
    
    // Ensure editor has focus
    setTimeout(() => {
      editor.commands.focus();
    }, 10);
  };

  // Remove link with proper cleanup
  const handleRemove = () => {
    // Restore selection before removing
    if (savedSelection) {
      restoreSelection(editor, savedSelection);
    }

    removeLinkFromSelection(editor);
    
    onClose();
    
    // Return focus to editor
    setTimeout(() => {
      editor.commands.focus();
    }, 10);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
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

      {/* Input */}
      <div className="mb-3">
        <input
          ref={inputRef}
          type="text"
          value={url}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="example.com hoặc https://example.com"
          className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 transition-all ${
            error
              ? 'border-red-300 focus:ring-red-200'
              : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400'
          }`}
        />
        {error && (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        )}
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

        {/* Remove button (only in edit mode) */}
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
          <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded">Enter</kbd> để áp dụng,{' '}
          <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded">Esc</kbd> để hủy
        </p>
      </div>
    </div>
  );
}
