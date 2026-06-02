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
        flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-150
        disabled:opacity-30 disabled:cursor-not-allowed
        ${
          isActive
            ? 'bg-pgreen text-white shadow-sm'
            : 'text-gray-600 hover:bg-pgreen/10 hover:text-pgreen'
        }
      `}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-pgreen/10 mx-1" />;
}

function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-1">{children}</div>;
}

export function EditorToolbar({ editor, onImageUpload, onVideoEmbed, onLinkInsert }: EditorToolbarProps) {
  if (!editor) return null;

  return (
    <div className="sticky top-0 z-10 bg-cream/40 backdrop-blur-md border-b border-pgreen/10 shadow-sm">
      {/* Desktop Toolbar */}
      <div className="hidden md:flex flex-wrap items-center gap-1.5 px-4 py-2.5">
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
    <div className="flex md:hidden items-center gap-2 px-3 py-2.5 overflow-x-auto hide-scrollbar">
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
