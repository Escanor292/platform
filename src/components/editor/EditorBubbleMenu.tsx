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
        flex items-center justify-center w-8 h-8 rounded-xl transition-all
        ${
          isActive
            ? 'bg-pgreen text-white'
            : 'text-gray-700 hover:bg-pgreen/10 hover:text-pgreen'
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
      className="flex items-center gap-1 px-2.5 py-2 bg-white border border-pgreen/10 rounded-2xl shadow-xl"
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
