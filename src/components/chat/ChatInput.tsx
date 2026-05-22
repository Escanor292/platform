"use client";

import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px";
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2 bg-white p-2 rounded-xl border border-gray-200 focus-within:border-primary transition-colors shadow-sm">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Nhập tin nhắn..."
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none bg-transparent px-2 py-2 text-sm focus:outline-none disabled:cursor-not-allowed"
        style={{ minHeight: "40px", maxHeight: "120px" }}
      />
      <button
        onClick={handleSend}
        disabled={!text.trim() || disabled}
        className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-primary text-white transition-all hover:bg-primary/90 hover:scale-105 active:scale-95 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:scale-100"
      >
        <Send className="h-5 w-5" />
      </button>
    </div>
  );
}
