/**
 * Simplified Enhanced Rich Text Editor - Without BubbleMenu to avoid React 19 issues
 */

'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Youtube from '@tiptap/extension-youtube';
import TextStyle from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CharacterCount from '@tiptap/extension-character-count';
import Image from '@tiptap/extension-image';

import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Link as LinkIcon, Heading1, Heading2, Quote, Code,
  Minus, Undo, Redo, Youtube as YoutubeIcon,
  Highlighter, CheckSquare, ImageIcon
} from 'lucide-react';

import { getLinkAtCursor, isSelectionInsideLink } from '@/lib/editor/link-commands';
import { LinkPopover } from './LinkPopover';
import { VideoPopover } from './VideoPopover';
import './editor.css';

interface SimplifiedEnhancedEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

type ToolbarButtonProps = {
  onClick: () => void;
  isActive?: boolean;
  title: string;
  children: React.ReactNode;
};

function ToolbarButton({ onClick, isActive, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`
        flex items-center justify-center w-8 h-8 rounded-md text-sm transition-all duration-150
        ${isActive
          ? "bg-blue-100 text-blue-700 shadow-inner"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }
      `}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-gray-200 mx-1 flex-shrink-0" />;
}

export default function SimplifiedEnhancedEditor({ 
  content, 
  onChange, 
  placeholder 
}: SimplifiedEnhancedEditorProps) {
  const [saveStatus, setSaveStatus] = useState("Đã lưu");
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
  const [linkPopoverInitialUrl, setLinkPopoverInitialUrl] = useState('');
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);
  const [isVideoPopoverOpen, setIsVideoPopoverOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Underline,
      TextStyle,
      Highlight.configure({ multicolor: true }),
      Link.configure({ 
        openOnClick: false, 
        HTMLAttributes: { 
          class: "text-blue-600 underline cursor-pointer hover:text-blue-700" 
        } 
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Youtube.configure({ controls: false, nocookie: true }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto my-4",
        },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ 
        placeholder: placeholder ?? "Viết nội dung chiến dịch của bạn ở đây..." 
      }),
      CharacterCount.configure({ limit: 50000 }),
    ],
    content: content || "",
    editorProps: {
      attributes: {
        class: "prose prose-lg max-w-none min-h-[400px] px-6 py-6 sm:px-8 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      setSaveStatus("Đang lưu...");
      onChange(editor.getHTML());
      
      setTimeout(() => {
        setSaveStatus("Đã lưu");
      }, 500);
    },
  });

  // Modern link insertion with floating popover
  const handleLinkClick = useCallback(() => {
    if (!editor) return;

    // Check if cursor is in an existing link
    const existingUrl = getLinkAtCursor(editor);
    
    if (existingUrl) {
      // Edit mode - show existing URL
      setLinkPopoverInitialUrl(existingUrl);
      setIsLinkEditMode(true);
    } else {
      // Insert mode
      setLinkPopoverInitialUrl('');
      setIsLinkEditMode(false);
    }

    setIsLinkPopoverOpen(true);
  }, [editor]);

  // Keyboard shortcut for link (Ctrl/Cmd + K)
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if editor is focused
      if (!editor.isFocused) return;
      
      // Ctrl/Cmd + K for link
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        e.stopPropagation();
        handleLinkClick();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [editor, handleLinkClick]);

  const addYoutube = useCallback(() => {
    if (!editor) return;
    setIsVideoPopoverOpen(true);
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước ảnh không được vượt quá 5MB');
        return;
      }

      // Show loading state
      setSaveStatus("Đang tải ảnh...");

      try {
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
        
        // Insert image into editor
        editor.chain().focus().setImage({ src: data.url }).run();
        setSaveStatus("Đã lưu");
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Lỗi khi tải ảnh lên. Vui lòng thử lại.');
        setSaveStatus("Đã lưu");
      }
    };
    
    input.click();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="w-full border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
      
      {/* ── TOOLBAR ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 bg-gray-50 border-b border-gray-200">
        
        {/* History */}
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Hoàn tác (Ctrl+Z)">
          <Undo size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Làm lại (Ctrl+Y)">
          <Redo size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Headings */}
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
          isActive={editor.isActive("heading", { level: 1 })} 
          title="Tiêu đề 1"
        >
          <Heading1 size={15} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
          isActive={editor.isActive("heading", { level: 2 })} 
          title="Tiêu đề 2"
        >
          <Heading2 size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Text formatting */}
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          isActive={editor.isActive("bold")} 
          title="In đậm (Ctrl+B)"
        >
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          isActive={editor.isActive("italic")} 
          title="In nghiêng (Ctrl+I)"
        >
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleUnderline().run()} 
          isActive={editor.isActive("underline")} 
          title="Gạch chân (Ctrl+U)"
        >
          <UnderlineIcon size={15} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleStrike().run()} 
          isActive={editor.isActive("strike")} 
          title="Gạch ngang"
        >
          <Strikethrough size={15} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleHighlight().run()} 
          isActive={editor.isActive("highlight")} 
          title="Tô sáng (Highlight)"
        >
          <Highlighter size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Lists & Blocks */}
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleBulletList().run()} 
          isActive={editor.isActive("bulletList")} 
          title="Danh sách dấu chấm"
        >
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleOrderedList().run()} 
          isActive={editor.isActive("orderedList")} 
          title="Danh sách đánh số"
        >
          <ListOrdered size={15} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleTaskList().run()} 
          isActive={editor.isActive("taskList")} 
          title="Checklist công việc"
        >
          <CheckSquare size={15} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleBlockquote().run()} 
          isActive={editor.isActive("blockquote")} 
          title="Trích dẫn"
        >
          <Quote size={15} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleCode().run()} 
          isActive={editor.isActive("code")} 
          title="Code"
        >
          <Code size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Alignment */}
        <ToolbarButton 
          onClick={() => editor.chain().focus().setTextAlign("left").run()} 
          isActive={editor.isActive({ textAlign: "left" })} 
          title="Căn trái"
        >
          <AlignLeft size={15} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().setTextAlign("center").run()} 
          isActive={editor.isActive({ textAlign: "center" })} 
          title="Căn giữa"
        >
          <AlignCenter size={15} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().setTextAlign("right").run()} 
          isActive={editor.isActive({ textAlign: "right" })} 
          title="Căn phải"
        >
          <AlignRight size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Insert - Improved Link with validation */}
        <ToolbarButton 
          onClick={handleLinkClick} 
          isActive={isSelectionInsideLink(editor)} 
          title="Chèn liên kết (Ctrl+K)"
        >
          <LinkIcon size={15} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().setHorizontalRule().run()} 
          title="Đường kẻ ngang"
        >
          <Minus size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={addYoutube} title="Chèn video YouTube">
          <YoutubeIcon size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} title="Chèn ảnh">
          <ImageIcon size={15} />
        </ToolbarButton>
      </div>

      {/* ── EDITOR AREA ── */}
      <div className="cursor-text bg-white relative" onClick={() => editor.commands.focus()}>
        <EditorContent editor={editor} />
        
        {/* Link Popover */}
        {isLinkPopoverOpen && (
          <LinkPopover
            editor={editor}
            isOpen={isLinkPopoverOpen}
            onClose={() => setIsLinkPopoverOpen(false)}
            initialUrl={linkPopoverInitialUrl}
            isEditMode={isLinkEditMode}
          />
        )}
        
        {/* Video Popover */}
        {isVideoPopoverOpen && (
          <VideoPopover
            editor={editor}
            isOpen={isVideoPopoverOpen}
            onClose={() => setIsVideoPopoverOpen(false)}
          />
        )}
      </div>

      {/* ── FOOTER ── */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        {/* Left Side: Status */}
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
            saveStatus === "Đã lưu" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
          }`} />
          <span>{saveStatus}</span>
        </div>

        {/* Right Side: Counters */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-gray-400">
            {editor.storage.characterCount.words()} từ
          </span>
          <span className="text-xs font-semibold text-gray-400">
            {editor.storage.characterCount.characters()} ký tự
          </span>
        </div>
      </div>

      {/* ── TYPOGRAPHY STYLES ── */}
      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.5rem;
        }
        .ProseMirror ul { list-style-type: disc; }
        .ProseMirror ol { list-style-type: decimal; }
        .ProseMirror li { margin: 0.25rem 0; }
        .ProseMirror blockquote {
          border-left: 3px solid #e5e7eb;
          padding-left: 1rem;
          color: #6b7280;
          font-style: italic;
          margin: 1rem 0;
        }
        .ProseMirror hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 1.5rem 0;
        }
        .ProseMirror h1 { font-size: 1.875rem; font-weight: 700; margin: 1rem 0 0.5rem; }
        .ProseMirror h2 { font-size: 1.5rem; font-weight: 600; margin: 1rem 0 0.5rem; }
        .ProseMirror mark {
          background-color: #fef08a;
          border-radius: 2px;
          padding: 0.1em 0.2em;
        }
        .ProseMirror code {
          background: #f3f4f6;
          border-radius: 4px;
          padding: 0.1em 0.4em;
          font-size: 0.875em;
          font-family: monospace;
        }
        .ProseMirror a { 
          color: #2563eb; 
          text-decoration: underline;
          cursor: pointer;
        }
        .ProseMirror a:hover {
          color: #1d4ed8;
        }
        .ProseMirror iframe { 
          max-width: 100%; 
          border-radius: 8px; 
          margin: 1rem auto; 
          display: block; 
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1rem 0;
          display: block;
        }
        
        /* Task List Styles */
        ul[data-type="taskList"] {
          list-style: none;
          padding: 0;
        }
        ul[data-type="taskList"] li[data-type="taskItem"] {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          margin: 0.5rem 0;
        }
        ul[data-type="taskList"] li[data-type="taskItem"] > label {
          margin-top: 0.25rem;
          user-select: none;
        }
        ul[data-type="taskList"] li[data-type="taskItem"] > div {
          flex: 1;
        }
      `}</style>
    </div>
  );
}
