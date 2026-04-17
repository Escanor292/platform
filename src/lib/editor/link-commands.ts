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
