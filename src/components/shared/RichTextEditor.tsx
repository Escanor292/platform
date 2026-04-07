"use client";

import React, { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { type Editor as TiptapEditor } from "@tiptap/core";

// Import Novel Editor dynamic to avoid SSR issues in Next.js 15
const Editor = dynamic(() => import("novel").then((m) => m.Editor), {
  ssr: false,
  loading: () => (
    <div className="flex w-full h-[500px] items-center justify-center bg-gray-50/50 rounded-2xl border border-gray-100 animate-pulse">
        <div className="text-gray-400 font-medium tracking-widest text-xs uppercase">Khởi tạo trình soạn thảo...</div>
    </div>
  ),
});

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const [saveStatus, setSaveStatus] = useState("Đã lưu");

  const handleUpdate = useCallback((editor?: TiptapEditor) => {
    if (!editor) return;
    setSaveStatus("Đang lưu...");
    const html = editor.getHTML();
    onChange(html);
    
    // Simulate a small delay for "Saved" status feedback
    setTimeout(() => {
        setSaveStatus("Đã lưu");
    }, 500);
  }, [onChange]);

  return (
    <div className="relative w-full border border-gray-200 rounded-3xl bg-white shadow-soft transition-all focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-200 group/editor">
      
      {/* Novel Editor Component */}
      <div className="novel-editor-wrapper min-h-[500px]">
        <Editor
          defaultValue={content}
          onUpdate={handleUpdate}
          className="relative min-h-[500px] w-full max-w-none bg-white p-8 prose prose-lg sm:prose-xl focus:outline-none"
          disableLocalStorage={true}
        />
      </div>

      {/* Modern Status Footer */}
      <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center rounded-b-3xl">
         <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${saveStatus === "Đã lưu" ? "bg-green-500" : "bg-amber-500 animate-pulse"}`} />
                <span>{saveStatus}</span>
            </div>
         </div>
         <div className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] group-hover/editor:text-blue-400 transition-colors">
            Novel Core Engine
         </div>
      </div>

      {/* Global CSS for Novel Styles override */}
      <style jsx global>{`
        .novel-editor-wrapper .prose {
          max-width: 100%;
          min-height: 500px;
        }
        .novel-editor-wrapper .prose :focus {
          outline: none;
        }
        /* Custom scrollbar for better feel */
        .novel-editor-wrapper::-webkit-scrollbar {
          width: 8px;
        }
        .novel-editor-wrapper::-webkit-scrollbar-track {
          background: transparent;
        }
        .novel-editor-wrapper::-webkit-scrollbar-thumb {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .novel-editor-wrapper::-webkit-scrollbar-thumb:hover {
          background: #e5e5e5;
        }
      `}</style>
    </div>
  );
}
