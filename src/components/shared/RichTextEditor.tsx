import { useEditor, EditorContent, Mark, BubbleMenu, FloatingMenu } from "@tiptap/react";
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
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Custom FontSize Mark (Inline)
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
  parseHTML() {
    return [{ tag: "span[style*=font-size]" }];
  },
  renderHTML({ HTMLAttributes }: any) {
    return ["span", HTMLAttributes, 0];
  },
  addCommands() {
    return {
      setFontSize: (size: string) => ({ chain, state }: any) => {
        const isCurrentSize = this.editor.isActive("fontSize", { size });
        if (isCurrentSize) {
          return (chain() as any).unsetMark("fontSize").run();
        }
        return (chain() as any).setMark("fontSize", { size }).run();
      },
    };
  },
} as any);

// Custom TextColor Mark
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
  parseHTML() {
    return [{ tag: "span[style*=color]" }];
  },
  renderHTML({ HTMLAttributes }: any) {
    return ["span", HTMLAttributes, 0];
  },
  addCommands() {
    return {
      setTextColor: (color: string) => ({ chain }: any) => {
        return chain().setMark("textColor", { color }).run();
      },
      unsetTextColor: () => ({ chain }: any) => {
        return chain().unsetMark("textColor").run();
      },
    };
  },
} as any);

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const ColorPalette = ({ editor }: { editor: any }) => {
  const colors = [
    "#000000", "#4b5563", "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"
  ];
  return (
    <div className="flex gap-1.5 p-2 bg-black/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 flex-wrap w-40 justify-center">
      {colors.map(c => (
        <button
          key={c}
          className="w-5 h-5 rounded-full border border-white/20 transition-transform hover:scale-125 shadow-sm"
          style={{ backgroundColor: c }}
          onClick={() => editor.chain().focus().setTextColor(c).run()}
        />
      ))}
      <button 
        className="w-full text-[10px] font-bold text-gray-400 hover:text-white pt-1 uppercase tracking-tighter"
        onClick={() => editor.chain().focus().unsetTextColor().run()}
      >
        Clear Color
      </button>
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
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-600 underline cursor-pointer" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Youtube.configure({ controls: true, nocookie: true }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-8 focus:outline-none min-h-[450px] max-w-none text-gray-800 selection:bg-blue-100",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const finalUrl = url.startsWith("http") || url.startsWith("/") ? url : `https://${url}`;
    editor.chain().focus().extendMarkRange("link").setLink({ href: finalUrl }).run();
  };

  const addYoutube = () => {
    const url = window.prompt("Enter YouTube link:");
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url, width: 640, height: 480 }).run();
    }
  };

  return (
    <div className="flex flex-col w-full border border-gray-100 rounded-[2.5rem] overflow-hidden bg-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] transition-all duration-500 relative ring-1 ring-black/[0.05]">
      
      {/* Fixed Header (Minimal) */}
      <div className="flex items-center justify-between px-8 py-4 bg-white/50 backdrop-blur-xl border-b border-gray-50/50 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Plus size={18} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-gray-900 tracking-tight">Campaign Editor</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Premium Suite v3.22</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 p-1.5 bg-gray-100/50 rounded-2xl border border-gray-100/30">
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="h-8 w-8 p-0 hover:bg-white hover:shadow-sm transition-all rounded-xl">
            <Undo size={14} className="text-gray-600" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="h-8 w-8 p-0 hover:bg-white hover:shadow-sm transition-all rounded-xl">
            <Redo size={14} className="text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Bubble Menu */}
      <BubbleMenu editor={editor} tippyOptions={{ duration: 200 }} className="flex overflow-hidden p-1.5 bg-black/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 gap-1 item-center">
        <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().toggleBold().run()} className={`h-8 w-8 p-0 rounded-xl text-white hover:bg-white/10 ${editor.isActive("bold") ? "text-blue-400 bg-white/10" : ""}`}>
          <Bold size={14} />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().toggleItalic().run()} className={`h-8 w-8 p-0 rounded-xl text-white hover:bg-white/10 ${editor.isActive("italic") ? "text-blue-400 bg-white/10" : ""}`}>
          <Italic size={14} />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`h-8 w-8 p-0 rounded-xl text-white hover:bg-white/10 ${editor.isActive("underline") ? "text-blue-400 bg-white/10" : ""}`}>
          <UnderlineIcon size={14} />
        </Button>
        
        <div className="w-px h-4 bg-white/10 mx-1 self-center" />
        
        <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().setFontSize("24px").run()} className={`h-8 px-2 text-white font-bold text-xs rounded-xl hover:bg-white/10 ${editor.isActive("fontSize", { size: "24px" }) ? "text-blue-400" : ""}`}>
          H2
        </Button>
        
        <Button size="sm" variant="ghost" onClick={setLink} className={`h-8 w-8 p-0 rounded-xl text-white hover:bg-white/10 ${editor.isActive("link") ? "text-blue-400" : ""}`}>
          <LinkIcon size={14} />
        </Button>

        <div className="w-px h-4 bg-white/10 mx-1 self-center" />
        
        <div className="relative group/color flex items-center pr-1">
           <Button size="sm" variant="ghost" className={`h-8 w-8 p-0 rounded-xl text-white hover:bg-white/10 ${editor.isActive("textColor") ? "text-blue-400" : ""}`}>
             <Palette size={14} style={{ color: editor.getAttributes("textColor").color }} />
           </Button>
           <div className="hidden group-hover/color:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 animate-in fade-in slide-in-from-bottom-2">
             <ColorPalette editor={editor} />
           </div>
        </div>
      </BubbleMenu>

      {/* Floating Menu */}
      <FloatingMenu editor={editor} tippyOptions={{ duration: 200 }} className="flex flex-col gap-1 p-2 bg-white/95 backdrop-blur-3xl rounded-[2rem] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.15)] border border-gray-100 w-64 animate-in fade-in zoom-in-95 duration-200">
        <label className="px-5 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">Typography</label>
        <button onClick={() => editor.chain().focus().setFontSize("36px").run()} className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-blue-50 text-gray-700 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all"><Heading1 size={16} /></div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-bold tracking-tight">Large Title</span>
            <span className="text-[10px] text-gray-400 font-medium tracking-tight">Heading H1 (36px)</span>
          </div>
        </button>
        <button onClick={() => editor.chain().focus().setFontSize("24px").run()} className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-blue-50 text-gray-700 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all"><Heading2 size={16} /></div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-bold tracking-tight">Medium Title</span>
            <span className="text-[10px] text-gray-400 font-medium tracking-tight">Section H2 (24px)</span>
          </div>
        </button>
        
        <label className="px-5 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-t border-gray-50 mt-2 pt-3">Elements</label>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-blue-50 text-gray-700 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all"><List size={16} /></div>
          <span className="text-sm font-bold tracking-tight">Bullet List</span>
        </button>
        <button onClick={addYoutube} className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-red-50 text-gray-700 transition-all group mt-1">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all"><YoutubeIcon size={16} /></div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-black text-red-600 tracking-tight">Embed Video</span>
            <span className="text-[10px] text-red-400 font-medium tracking-tight">YouTube Link</span>
          </div>
        </button>
      </FloatingMenu>

      {/* Editor Surface */}
      <div className="relative min-h-[500px] cursor-text bg-gray-50/5">
        <EditorContent editor={editor} />
        {placeholder && !content && editor.isEmpty && (
          <div className="absolute top-10 left-10 text-gray-200 pointer-events-none text-2xl font-black italic tracking-tighter opacity-70">
            {placeholder}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-10 py-6 bg-white border-t border-gray-100 flex justify-between items-center text-[11px] font-black text-gray-400 uppercase tracking-widest overflow-hidden relative">
         <div className="flex gap-8 z-10 relative">
            <span className="flex items-center gap-2.5"><div className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" /> {editor.storage.starterKit?.wordCount?.words || 0} Words</span>
            <span className="flex items-center gap-2.5"><div className="w-2 h-2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50" /> {content.replace(/<[^>]*>/g, '').length} Characters</span>
         </div>
         <div className="flex items-center gap-6 z-10 relative">
            <span className="hover:text-blue-500 cursor-help transition-colors">Markdown Ready</span>
            <div className="w-2 h-2 rounded-full bg-green-500 border-2 border-white shadow-lg" />
         </div>
         <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />
      </div>
    </div>
  );
}
