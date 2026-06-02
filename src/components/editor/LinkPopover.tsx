/**
 * Link Popover - Stable, no reopen loop, no input remount
 * Fixed: Click outside detection, input focus stability, no double render
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
      
      requestAnimationFrame(() => {
        setPosition({
          top: coords.bottom - editorRect.top + 8,
          left: coords.left - editorRect.left,
        });
      });
    } catch (error) {
      console.error('[LinkPopover] Position calculation error:', error);
      requestAnimationFrame(() => {
        setPosition({ top: 50, left: 50 });
      });
    }
  }, [isOpen, editor]);

  // Initialize when opened - run ONCE
  useEffect(() => {
    if (!isOpen) return;

    setUrl(initialUrl);
    setError('');

    // Auto-focus input immediately
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
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
          background-color: rgba(46, 139, 87, 0.3);
          border-radius: 2px;
        }
      `;
      document.head.appendChild(decorations);

      // Add highlight class to selected range
      const transaction = view.state.tr;
      transaction.setMeta('addToHistory', false);

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
        return;
      }

      // Check if event is from toolbar button
      const isToolbarButton = path.some(el =>
        (el as HTMLElement).closest?.('[data-link-button]')
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

  // Apply link
  const handleApply = useCallback(() => {
    const trimmedUrl = sanitizeUrlInput(url);

    // Validate
    const validationError = getUrlError(trimmedUrl);
    if (validationError) {
      setError(validationError);
      return;
    }

    const normalizedUrl = normalizeUrl(trimmedUrl);
    const selection = selectionRef.current;
    if (!selection) return;

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
      }

      // Additional safety: Force clear link mark from stored marks
      setTimeout(() => {
        if (editor && !editor.isDestroyed) {
          editor.commands.unsetMark('link');
        }
      }, 10);

      onClose();
    } catch (error) {
      console.error('[LinkPopover] Apply error:', error);
      setError('Không thể áp dụng liên kết');
    }
  }, [url, isEditMode, editor, onClose]);

  // Keyboard shortcuts
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
  }, [isOpen, onClose, handleApply]);

  // Remove link
  const handleRemove = () => {
    const selection = selectionRef.current;
    if (!selection) return;

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
      className="absolute z-50 bg-white rounded-2xl shadow-2xl border border-pgreen/15 p-4 min-w-[320px] max-w-[400px]"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2.5">
        <LinkIcon size={16} className="text-pgreen" />
        <span className="text-sm font-semibold text-dblue">
          {isEditMode ? 'Chỉnh sửa liên kết' : 'Chèn liên kết'}
        </span>
      </div>

      {/* Input - Auto-focused */}
      <div className="mb-3.5">
        <input
          ref={inputRef}
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (error) setError('');
          }}
          placeholder="example.com hoặc https://example.com"
          className={`w-full px-3.5 py-2 text-sm border rounded-xl focus:outline-none focus:ring-4 transition-all ${
            error
              ? 'border-red-300 focus:ring-red-200'
              : 'border-pgreen/20 focus:ring-pgreen/10 focus:border-pgreen/40 bg-white'
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
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white gradient-green rounded-xl hover:shadow-md transition-all"
          >
            <Check size={14} />
            Áp dụng
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

        {isEditMode && (
          <button
            type="button"
            onClick={handleRemove}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
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
