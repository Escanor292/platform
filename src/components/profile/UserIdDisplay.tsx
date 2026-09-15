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
    <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 pr-16 md:pr-3">
      <span className="text-xs font-bold text-gray-400">ID:</span>
      <code className="max-w-full break-all text-xs font-mono text-gray-600">{userId}</code>
      <button
        onClick={handleCopy}
        className="inline-flex shrink-0 items-center gap-1 text-blue-600 transition hover:text-blue-700"
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
