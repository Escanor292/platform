"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface UserIdDisplayProps {
  userId: string;
}

export default function UserIdDisplay({ userId }: UserIdDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
      <span className="text-xs text-gray-400 font-bold">ID:</span>
      <code className="text-xs font-mono text-gray-600">{userId}</code>
      <button
        onClick={handleCopy}
        className="text-blue-600 hover:text-blue-700 transition flex items-center gap-1"
        title="Sao chép ID"
      >
        {copied ? (
          <>
            <Check size={14} />
            <span className="text-xs font-bold">Đã sao chép</span>
          </>
        ) : (
          <>
            <Copy size={14} />
            <span className="text-xs font-bold">Sao chép</span>
          </>
        )}
      </button>
    </div>
  );
}
