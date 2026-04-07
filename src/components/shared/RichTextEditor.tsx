import { useEditor, EditorContent, Mark } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Youtube from "@tiptap/extension-youtube";
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Link as LinkIcon, 
  Youtube as YoutubeIcon,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Strikethrough,
  Palette,
  Type
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Custom Extension for Font Size
const FontSize = Mark.create({
  name: "fontSize",
  addAttributes() {
    return {
      size: {
        default: null,
        parseHTML: (element) => element.style.fontSize,
        renderHTML: (attributes) => {
          if (!attributes.size) return {};
          return { style: `font-size: ${attributes.size}` };
        },
      },
    };
  },
  parseHTML() {
    return [{ tag: "span[style*=font-size]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["span", HTMLAttributes, 0];
  },
  addCommands() {
    return {
      setFontSize: (size: string) => ({ chain }) => {
        return chain().setMark("fontSize", { size }).run();
      },
      unsetFontSize: () => ({ chain }) => {
        return chain().unsetMark("fontSize").run();
      },
    };
  },
} as any);

// Custom Extension for Text Color
const TextColor = Mark.create({
  name: "textColor",
  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element) => element.style.color,
        renderHTML: (attributes) => {
          if (!attributes.color) return {};
          return { style: `color: ${attributes.color}` };
        },
      },
    };
  },
  parseHTML() {
    return [{ tag: "span[style*=color]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["span", HTMLAttributes, 0];
  },
  addCommands() {
    return {
      setTextColor: (color: string) => ({ chain }) => {
        return chain().setMark("textColor", { color }).run();
      },
      unsetTextColor: () => ({ chain }) => {
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

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const sizes = ["12px", "14px", "16px", "18px", "20px", "24px", "30px", "36px", "48px", "60px"];
  const colors = [
    "#000000", "#444444", "#666666", "#999999", "#cccccc", "#ffffff",
    "#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", "#2196f3",
    "#03a9f4", "#00bcd4", "#009688", "#4caf50", "#8bc34a", "#cddc39",
    "#ffeb3b", "#ffc107", "#ff9800", "#ff5722", "#795548", "#607d8b"
  ];

  const addYoutubeVideo = () => {
    const url = window.prompt("Nhập link YouTube video:");
    if (url) {
      editor.chain().focus().setYoutubeVideo({
        src: url,
        width: 640,
        height: 480,
      }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Nhập URL (ví dụ: https://google.com):", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    let finalUrl = url;
    if (!url.startsWith("http") && !url.startsWith("/") && !url.startsWith("#")) {
      finalUrl = `https://${url}`;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: finalUrl }).run();
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl items-center">
      {/* Group: History */}
      <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
        <Button
          type="button" variant="ghost" size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo size={14} />
        </Button>
        <Button
          type="button" variant="ghost" size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo size={14} />
        </Button>
      </div>

      {/* Group: Basic Formatting */}
      <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
        <Button
          type="button" variant="ghost" size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-blue-100 text-blue-600" : ""}
        >
          <Bold size={14} />
        </Button>
        <Button
          type="button" variant="ghost" size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-blue-100 text-blue-600" : ""}
        >
          <Italic size={14} />
        </Button>
        <Button
          type="button" variant="ghost" size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "bg-blue-100 text-blue-600" : ""}
        >
          <UnderlineIcon size={14} />
        </Button>
        <Button
          type="button" variant="ghost" size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "bg-blue-100 text-blue-600" : ""}
        >
          <Strikethrough size={14} />
        </Button>
      </div>

      {/* Group: Font Size & Inline Headings */}
      <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1">
          <Type size={14} className="text-gray-400" />
          <select 
            className="text-xs bg-transparent outline-none border-none cursor-pointer"
            value={editor.getAttributes("fontSize").size || "16px"}
            onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
          >
            {sizes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        
        <Button
          type="button" variant="ghost" size="sm"
          onClick={() => editor.chain().focus().setFontSize("36px").run()}
          className={editor.getAttributes("fontSize").size === "36px" ? "bg-blue-100 text-blue-600" : ""}
          title="H1 - Inline (36px)"
        >
          <span className="font-bold">H1</span>
        </Button>
        <Button
          type="button" variant="ghost" size="sm"
          onClick={() => editor.chain().focus().setFontSize("24px").run()}
          className={editor.getAttributes("fontSize").size === "24px" ? "bg-blue-100 text-blue-600" : ""}
          title="H2 - Inline (24px)"
        >
          <span className="font-bold">H2</span>
        </Button>
      </div>

      {/* Group: Color Picker */}
      <div className="flex items-center gap-1 pr-2 border-r border-gray-200 group relative">
        <Button type="button" variant="ghost" size="sm">
          <Palette size={14} style={{ color: editor.getAttributes("textColor").color || "inherit" }} />
        </Button>
        <div className="hidden group-hover:flex absolute top-full left-0 z-50 bg-white border border-gray-200 p-2 rounded-xl shadow-xl grid-cols-6 gap-1 w-48">
          {colors.map(c => (
            <button
              key={c}
              type="button"
              className="w-6 h-6 rounded-md border border-gray-100 transition-transform hover:scale-125"
              style={{ backgroundColor: c }}
              onClick={() => editor.chain().focus().setTextColor(c).run()}
            />
          ))}
          <button 
            type="button" 
            className="col-span-6 text-[10px] text-gray-500 hover:text-blue-600 pt-1"
            onClick={() => editor.chain().focus().unsetTextColor().run()}
          >
            Xóa màu
          </button>
        </div>
      </div>

      {/* Group: Lists & Alignment */}
      <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
        <Button
          type="button" variant="ghost" size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-blue-100 text-blue-600" : ""}
        >
          <List size={14} />
        </Button>
        <Button
          type="button" variant="ghost" size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-blue-100 text-blue-600" : ""}
        >
          <ListOrdered size={14} />
        </Button>
        <Button
          type="button" variant="ghost" size="sm"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={editor.isActive({ textAlign: "center" }) ? "bg-blue-100 text-blue-600" : ""}
        >
          <AlignCenter size={14} />
        </Button>
      </div>

      {/* Group: Links & Media */}
      <div className="flex items-center gap-1">
        <Button
          type="button" variant="ghost" size="sm"
          onClick={setLink}
          className={editor.isActive("link") ? "bg-blue-100 text-blue-600" : ""}
        >
          <LinkIcon size={14} />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={addYoutubeVideo}>
          <YoutubeIcon size={14} />
        </Button>
      </div>
    </div>
  );
};

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // Turn off standard block headings to avoid confusion
      }),
      Underline,
      FontSize,
      TextColor,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline cursor-pointer",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[300px] max-w-none text-gray-700",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  return (
    <div className="flex flex-col w-full border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-soft focus-within:border-blue-500 transition-colors">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      {placeholder && !content && editor?.isEmpty && (
        <div className="absolute top-12 left-5 text-gray-400 pointer-events-none text-sm">
          {placeholder}
        </div>
      )}
    </div>
  );
}
