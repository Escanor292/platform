import { useEditor, EditorContent, Mark } from "@tiptap/react";
import React, { useState } from "react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Youtube from "@tiptap/extension-youtube";
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Link as LinkIcon, 
  Youtube as YoutubeIcon,
  Undo,
  Redo,
  Strikethrough,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Baseline,
  List,
  ListOrdered
} from "lucide-react";
import { Button } from "@/components/ui/button";

// --- TypeScript Augmentation for Custom Commands ---
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType,
    },
    textColor: {
      setTextColor: (color: string) => ReturnType,
      unsetTextColor: () => ReturnType,
    }
  }
}

// --- Custom Extensions ---
const FontSize = Mark.create({
  name: "fontSize",
  addAttributes() {
    return {
      size: {
        default: null,
        parseHTML: (element: any) => element.style.fontSize,
        renderHTML: (attributes: any) => {
          if (!attributes.size) return {};
          return { style: `font-size: ${attributes.size}` };
        },
      },
    };
  },
  parseHTML() { return [{ tag: "span[style*=font-size]" }]; },
  renderHTML({ HTMLAttributes }: any) { return ["span", HTMLAttributes, 0]; },
  addCommands() {
    return {
      setFontSize: (size: string) => ({ chain }: any) => {
        if (size === "16px") return (chain() as any).unsetMark("fontSize").run();
        return (chain() as any).setMark("fontSize", { size }).run();
      },
    };
  },
} as any);

const TextColor = Mark.create({
  name: "textColor",
  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element: any) => element.style.color,
        renderHTML: (attributes: any) => {
          if (!attributes.color) return {};
          return { style: `color: ${attributes.color}` };
        },
      },
    };
  },
  parseHTML() { return [{ tag: "span[style*=color]" }]; },
  renderHTML({ HTMLAttributes }: any) { return ["span", HTMLAttributes, 0]; },
  addCommands() {
    return {
      setTextColor: (color: string) => ({ chain }: any) => chain().setMark("textColor", { color }).run(),
      unsetTextColor: () => ({ chain }: any) => chain().unsetMark("textColor").run(),
    };
  },
} as any);

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

// --- Toolbar Component ---
const Toolbar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const fontSizes = [
    { label: "Nhỏ (12px)", value: "12px" },
    { label: "Thường (16px)", value: "16px" },
    { label: "Tiêu đề nhỏ (20px)", value: "20px" },
    { label: "Tiêu đề vừa (24px)", value: "24px" },
    { label: "Tiêu đề lớn (32px)", value: "32px" },
    { label: "Cực lớn (48px)", value: "48px" },
  ];

  const colors = ["#000000", "#4b5563", "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];

  const setLink = () => {
    const url = window.prompt("Nhập URL:", editor.getAttributes("link").href);
    if (url === null) return;
    if (url === "") return editor.chain().focus().extendMarkRange("link").unsetLink().run();
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addYoutube = () => {
    const url = window.prompt("Nhập link YouTube:");
    if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
  };

  const resetToNormal = () => {
    editor.chain().focus().unsetAllMarks().clearNodes().run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-100 bg-white sticky top-0 z-20 shadow-sm">
      {/* Nhóm Undo/Redo */}
      <div className="flex items-center border-r border-gray-100 pr-1 mr-1 gap-0.5">
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="h-8 w-8 p-0"><Undo size={14} /></Button>
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="h-8 w-8 p-0"><Redo size={14} /></Button>
      </div>

      {/* Nhóm Kích thước chữ */}
      <div className="flex items-center border-r border-gray-100 pr-2 mr-1 gap-2">
         <div className="relative flex items-center group/size ml-1">
            <Type size={14} className="absolute left-2.5 text-gray-400 z-10 pointer-events-none" />
            <select 
               className="h-8 pl-8 pr-2 w-32 text-[11px] font-bold bg-gray-50 border-none rounded-xl focus:ring-0 cursor-pointer hover:bg-gray-100 transition-all appearance-none text-gray-700"
               onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
               value={editor.getAttributes("fontSize").size || "16px"}
            >
               {fontSizes.map((s) => (
                 <option key={s.value} value={s.value}>{s.label}</option>
               ))}
            </select>
            <div className="absolute right-2 pointer-events-none text-[10px] opacity-30 select-none">▼</div>
         </div>
         <Button variant="ghost" size="sm" onClick={resetToNormal} className="h-8 px-2 text-[10px] font-black uppercase transition-all hover:bg-gray-100 tracking-tighter text-blue-500">Normal</Button>
      </div>

      {/* Nhóm Định dạng chữ */}
      <div className="flex items-center border-r border-gray-100 pr-1 mr-1 gap-0.5">
        <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().toggleBold().run()} className={`h-8 w-8 p-0 ${editor.isActive("bold") ? "bg-gray-100 text-blue-600" : ""}`}><Bold size={14} /></Button>
        <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().toggleItalic().run()} className={`h-8 w-8 p-0 ${editor.isActive("italic") ? "bg-gray-100 text-blue-600" : ""}`}><Italic size={14} /></Button>
        <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`h-8 w-8 p-0 ${editor.isActive("underline") ? "bg-gray-100 text-blue-600" : ""}`}><UnderlineIcon size={14} /></Button>
        <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().toggleStrike().run()} className={`h-8 w-8 p-0 ${editor.isActive("strike") ? "bg-gray-100 text-blue-600" : ""}`}><Strikethrough size={14} /></Button>
      </div>

      {/* Nhóm Màu sắc */}
      <div className="flex items-center border-r border-gray-100 pr-1 mr-1 gap-0.5 relative group">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Palette size={14} style={{ color: editor.getAttributes("textColor").color }} /></Button>
          <div className="hidden group-hover:flex absolute top-full left-0 pt-2 z-30">
             <div className="bg-white border border-gray-100 shadow-xl rounded-xl p-2 flex gap-1 flex-wrap w-36">
                {colors.map(c => (
                  <button key={c} onClick={() => editor.chain().focus().setTextColor(c).run()} className="w-5 h-5 rounded-full border border-gray-50 hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
                ))}
                <button onClick={() => editor.chain().focus().unsetTextColor().run()} className="w-full text-[10px] text-gray-400 font-bold uppercase mt-1">Mặc định</button>
             </div>
          </div>
      </div>

      {/* Nhóm Căn lề & Liệt kê */}
      <div className="flex items-center border-r border-gray-100 pr-1 mr-1 gap-0.5">
        <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().setTextAlign("left").run()} className={`h-8 w-8 p-0 ${editor.isActive({ textAlign: "left" }) ? "bg-gray-100 text-blue-600" : ""}`}><AlignLeft size={14} /></Button>
        <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().setTextAlign("center").run()} className={`h-8 w-8 p-0 ${editor.isActive({ textAlign: "center" }) ? "bg-gray-100 text-blue-600" : ""}`}><AlignCenter size={14} /></Button>
        <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().setTextAlign("right").run()} className={`h-8 w-8 p-0 ${editor.isActive({ textAlign: "right" }) ? "bg-gray-100 text-blue-600" : ""}`}><AlignRight size={14} /></Button>
        
        <div className="w-px h-4 bg-gray-100 mx-1" />
        
        <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`h-8 w-8 p-0 ${editor.isActive("bulletList") ? "bg-gray-100 text-blue-600" : ""}`}><List size={14} /></Button>
        <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`h-8 w-8 p-0 ${editor.isActive("orderedList") ? "bg-gray-100 text-blue-600" : ""}`}><ListOrdered size={14} /></Button>
      </div>

      {/* Nhóm Multimedia */}
      <div className="flex items-center gap-0.5 ml-auto">
        <Button size="sm" variant="ghost" onClick={setLink} className={`h-8 w-8 p-0 ${editor.isActive("link") ? "bg-gray-100 text-blue-600" : ""}`}><LinkIcon size={14} /></Button>
        <Button size="sm" variant="ghost" onClick={addYoutube} className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"><YoutubeIcon size={14} /></Button>
      </div>
    </div>
  );
};

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Underline,
      FontSize,
      TextColor,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-blue-600 underline" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Youtube.configure({ controls: true, nocookie: true }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl px-12 py-8 focus:outline-none min-h-[500px] max-w-none text-gray-800 leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <div className="flex flex-col w-full border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm transition-all focus-within:border-blue-300">
      <Toolbar editor={editor} />
      
      <div className="flex-grow relative bg-gray-50/5">
        <EditorContent editor={editor} />
        {placeholder && editor.isEmpty && (
          <div className="absolute top-8 left-12 text-gray-300 pointer-events-none text-xl font-medium opacity-50">
            {placeholder}
          </div>
        )}
      </div>

      <div className="px-6 py-3 bg-white border-t border-gray-50 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
         <div className="flex gap-4">
            <span>{editor.getText().split(/\s+/).filter(w => w.length > 0).length} Words</span>
            <span>{editor.getText().length} Chars</span>
         </div>
         <div className="flex items-center gap-2">
            <span>Clean Mode</span>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
         </div>
      </div>
    </div>
  );
}
