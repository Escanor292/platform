"use client";

import { useState, KeyboardEvent } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text);
    setText("");
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Nhập tin nhắn..."
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
        style={{ minHeight: "40px", maxHeight: "120px" }}
      />
      <button
        onClick={handleSend}
        disabled={!text.trim() || disabled}
        className="flex-shrink-0 rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        <Send className="h-5 w-5" />
      </button>
    </div>
  );
}
