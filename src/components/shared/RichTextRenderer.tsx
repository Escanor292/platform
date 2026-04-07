"use client";

import DOMPurify from "dompurify";
import { useEffect, useState } from "react";

interface RichTextRendererProps {
  content: string;
}

export default function RichTextRenderer({ content }: RichTextRendererProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder or the raw content with a hydration warning handled
    return (
      <div 
        className="prose prose-blue prose-lg max-w-none text-gray-600 font-medium leading-relaxed animate-pulse"
        dangerouslySetInnerHTML={{ __html: content }}
        suppressHydrationWarning
      />
    );
  }

  const sanitizedHtml = DOMPurify.sanitize(content, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "src"],
  });

  return (
    <div 
      className="prose prose-blue prose-lg max-w-none text-gray-600 font-medium leading-relaxed"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }} 
    />
  );
}
