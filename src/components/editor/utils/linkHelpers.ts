/**
 * Link operation helpers for TipTap editor
 */

import { Editor } from '@tiptap/react';

export function applyLinkToSelection(
  editor: Editor,
  url: string
): void {
  if (!editor || !url) return;
  
  editor
    .chain()
    .focus()
    .extendMarkRange('link')
    .setLink({ href: url })
    .run();
}

export function insertLinkAtCaret(
  editor: Editor,
  text: string,
  url: string
): void {
  if (!editor || !text || !url) return;
  
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
          },
        },
      ],
    })
    .run();
}

export function removeLink(editor: Editor): void {
  if (!editor) return;
  
  editor
    .chain()
    .focus()
    .extendMarkRange('link')
    .unsetLink()
    .run();
}

export function updateLink(
  editor: Editor,
  url: string
): void {
  if (!editor || !url) return;
  
  editor
    .chain()
    .focus()
    .extendMarkRange('link')
    .setLink({ href: url })
    .run();
}

export function getLinkAtCursor(editor: Editor): string | null {
  if (!editor) return null;
  
  const { href } = editor.getAttributes('link');
  return href || null;
}

export function hasSelection(editor: Editor): boolean {
  if (!editor) return false;
  
  const { from, to } = editor.state.selection;
  return from !== to;
}

export function getSelectedText(editor: Editor): string {
  if (!editor) return '';
  
  const { from, to } = editor.state.selection;
  return editor.state.doc.textBetween(from, to, ' ');
}

export function isLinkActive(editor: Editor): boolean {
  if (!editor) return false;
  return editor.isActive('link');
}
