import { useEditor, EditorContent, Mark } from "@tiptap/react";
import React, { useState, useEffect, useRef } from "react";
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
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Undo,
  Redo,
  Strikethrough,
  Palette,
  Plus,
  Type
} from "lucide-react";
import { Button } from "@/components/ui/button";

// --- TypeScript Augmentation for Custom Commands ---
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      /**
       * Set the font size
       */
      setFontSize: (size: string) => ReturnType,
    },
    textColor: {
      /**
       * Set the text color
       */
      setTextColor: (color: string) => ReturnType,
      /**
       * Unset the text color
       */
      unsetTextColor: () => ReturnType,
    }
  }
}

// --- Custom Extensions (Keeping existing logic) ---
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
      setFontSize: (size: string) => ({ chain, state }: any) => {
        const isCurrentSize = this.editor.isActive("fontSize", { size });
        if (isCurrentSize) return (chain() as any).unsetMark("fontSize").run();
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

// --- Custom Floating Components ---

const ColorPalette = ({ editor }: { editor: any }) => {
  const colors = ["#000000", "#4b5563", "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];
  return (
    <div className="flex gap-1.5 p-2 bg-black/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 flex-wrap w-40 justify-center">
      {colors.map(c => (
        <button key={c} onClick={() => editor.chain().focus().setTextColor(c).run()} className="w-5 h-5 rounded-full border border-white/20 transition-transform hover:scale-125" style={{ backgroundColor: c }} />
      ))}
      <button onClick={() => editor.chain().focus().unsetTextColor().run()} className="w-full text-[10px] font-bold text-gray-400 hover:text-white pt-1 uppercase">Clear</button>
    </div>
  );
};

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [bubblePos, setBubblePos] = useState<{ show: boolean; top: number; left: number }>({ show: false, top: 0, left: 0 });
  const [floatingPos, setFloatingPos] = useState<{ show: boolean; top: number; left: number }>({ show: false, top: 0, left: 0 });

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
        class: "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-8 focus:outline-none min-h-[450px] max-w-none text-gray-800 selection:bg-blue-100",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    immediatelyRender: false,
  });

  // --- Engine: Calculate Menu Positions ---
  useEffect(() => {
    if (!editor || !containerRef.current) return;

    const updateMenus = () => {
      const { selection } = editor.state;
      const { view } = editor;

      // 1. Bubble Menu Engine (Multi-word selection)
      if (!selection.empty) {
        try {
          const coords = view.coordsAtPos(selection.from);
          const containerRect = containerRef.current!.getBoundingClientRect();
          
          setBubblePos({
            show: true,
            top: coords.top - containerRect.top - 50, // 50px above selection
            left: coords.left - containerRect.left,
          });
        } catch (e) { setBubblePos(p => ({ ...p, show: false })); }
      } else {
        setBubblePos(p => ({ ...p, show: false }));
      }

      // 2. Floating Menu Engine (Empty line)
      const isLineEmpty = editor.state.doc.resolve(selection.from).parent.content.size === 0;
      if (isLineEmpty && editor.isFocused) {
        try {
          const coords = view.coordsAtPos(selection.from);
          const containerRect = containerRef.current!.getBoundingClientRect();
          
          setFloatingPos({
            show: true,
            top: coords.top - containerRect.top - 5,
            left: containerRect.left - containerRect.left + 10, // Far left
          });
        } catch (e) { setFloatingPos(p => ({ ...p, show: false })); }
      } else {
        setFloatingPos(p => ({ ...p, show: false }));
      }
    };

    editor.on("selectionUpdate", updateMenus);
    editor.on("focus", updateMenus);
    editor.on("blur", () => {
        setTimeout(() => { // Small delay to allow button clicks
            setBubblePos(p => ({ ...p, show: false }));
            setFloatingPos(p => ({ ...p, show: false }));
        }, 200);
    });

    return () => {
      editor.off("selectionUpdate", updateMenus);
      editor.off("focus", updateMenus);
      editor.off("blur");
    };
  }, [editor]);

  if (!editor) return null;

  const setLink = () => {
    const url = window.prompt("URL:", editor.getAttributes("link").href);
    if (url === null) return;
    if (url === "") return editor.chain().focus().extendMarkRange("link").unsetLink().run();
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addYoutube = () => {
    const url = window.prompt("YouTube Link:");
    if (url) editor.chain().focus().setYoutubeVideo({ src: url, width: 640, height: 480 }).run();
  };

  return (
    <div ref={containerRef} className="flex flex-col w-full border border-gray-100 rounded-[2.5rem] overflow-hidden bg-white shadow-2xl relative ring-1 ring-black/[0.05] min-h-[600px]">
      
      {/* 1. Custom Bubble Menu (Floating) */}
      {bubblePos.show && (
        <div 
          className="absolute z-50 flex items-center gap-1 p-1.5 bg-black/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-200"
          style={{ top: bubblePos.top, left: bubblePos.left }}
          onMouseDown={(e) => e.preventDefault()} // Keep editor focus
        >
          <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().toggleBold().run()} className={`h-8 w-8 p-0 rounded-xl text-white hover:bg-white/10 ${editor.isActive("bold") ? "text-blue-400 bg-white/20" : ""}`}><Bold size={14} /></Button>
          <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().toggleItalic().run()} className={`h-8 w-8 p-0 rounded-xl text-white hover:bg-white/10 ${editor.isActive("italic") ? "text-blue-400 bg-white/20" : ""}`}><Italic size={14} /></Button>
          <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`h-8 w-8 p-0 rounded-xl text-white hover:bg-white/10 ${editor.isActive("underline") ? "text-blue-400 bg-white/20" : ""}`}><UnderlineIcon size={14} /></Button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().setFontSize("24px").run()} className={`h-8 px-2 text-white font-bold text-xs rounded-xl hover:bg-white/10 ${editor.isActive("fontSize", { size: "24px" }) ? "text-blue-400 bg-white/20" : ""}`}>H2</Button>
          <Button size="sm" variant="ghost" onClick={setLink} className={`h-8 w-8 p-0 rounded-xl text-white hover:bg-white/10 ${editor.isActive("link") ? "text-blue-400 bg-white/20" : ""}`}><LinkIcon size={14} /></Button>
          <div className="relative group/color-custom ml-1">
             <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-xl text-white hover:bg-white/10"><Palette size={14} style={{ color: editor.getAttributes("textColor").color }} /></Button>
             <div className="hidden group-hover/color-custom:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2"><ColorPalette editor={editor} /></div>
          </div>
        </div>
      )}

      {/* 2. Custom Floating Menu (Empty Line) */}
      {floatingPos.show && (
        <div 
          className="absolute z-40 bg-white/95 backdrop-blur-3xl rounded-[2rem] shadow-2xl border border-gray-100 w-64 p-2 animate-in fade-in zoom-in-95 duration-200"
          style={{ top: floatingPos.top, left: floatingPos.left + 40 }} // Shift right from the cursor
          onMouseDown={(e) => e.preventDefault()}
        >
          <p className="px-4 py-1 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-5">Block Settings</p>
          <button onClick={() => editor.chain().focus().setFontSize("36px").run()} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-2xl hover:bg-blue-50 transition-all text-left">
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center font-bold">H1</div>
            <div><p className="text-sm font-bold text-gray-700">Heading 1</p><p className="text-[10px] text-gray-400">Large title (36px)</p></div>
          </button>
          <button onClick={() => editor.chain().focus().setFontSize("24px").run()} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-2xl hover:bg-blue-50 transition-all text-left">
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center font-bold">H2</div>
            <div><p className="text-sm font-bold text-gray-700">Heading 2</p><p className="text-[10px] text-gray-400">Medium title (24px)</p></div>
          </button>
          <button onClick={addYoutube} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-2xl hover:bg-red-50 transition-all text-left mt-1">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center"><YoutubeIcon size={16} /></div>
            <div><p className="text-sm font-bold text-red-600">Embed Video</p><p className="text-[10px] text-red-400">YouTube Frame</p></div>
          </button>
        </div>
      )}

      {/* 3. Minimal Static Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-gray-50 bg-white/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200"><Plus className="text-white" size={20} /></div>
          <div><p className="text-sm font-black text-gray-900">Premium Editor</p><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Custom Engine Active</p></div>
        </div>
        <div className="flex gap-2">
           <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="h-10 w-10 p-0 rounded-2xl hover:shadow-md transition-all"><Undo size={16} /></Button>
           <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="h-10 w-10 p-0 rounded-2xl hover:shadow-md transition-all"><Redo size={16} /></Button>
        </div>
      </div>

      <div className="flex-grow p-4 relative">
        <EditorContent editor={editor} />
        {placeholder && editor.isEmpty && (
          <div className="absolute top-12 left-12 text-gray-200 pointer-events-none text-3xl font-black italic opacity-30">
            {placeholder}
          </div>
        )}
      </div>

      <div className="px-10 py-6 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
         <div className="flex gap-6">
            <span>{editor.getText().split(/\s+/).filter(w => w.length > 0).length} Words</span>
            <span>{editor.getText().length} Chars</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>AI Ready</span>
         </div>
      </div>
    </div>
  );
}
