"use client";

import DOMPurify from "dompurify";
import { useEffect, useState } from "react";
import { generateHTML } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextStyle from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";

// Extensions list used by the editor
const TIPTAP_EXTENSIONS = [
  StarterKit,
  Link.configure({ openOnClick: false }),
  Image,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Underline,
  Highlight.configure({ multicolor: true }),
  TextStyle,
  Color,
];

/**
 * Tries to parse the content string as TipTap JSON.
 * Returns the parsed object if valid, or null.
 */
function parseTipTapJson(content: string): object | null {
  try {
    const parsed = JSON.parse(content);
    if (parsed && parsed.type === "doc" && Array.isArray(parsed.content)) {
      return parsed;
    }
  } catch {
    // Not JSON
  }
  return null;
}

/**
 * Converts content (TipTap JSON string OR plain HTML) to an HTML string.
 */
function contentToHtml(content: string): string {
  if (!content) return "";

  // Detect TipTap JSON
  const json = parseTipTapJson(content);
  if (json) {
    try {
      return generateHTML(json as any, TIPTAP_EXTENSIONS);
    } catch {
      // Fallback to raw if generateHTML fails
      return `<p>${content}</p>`;
    }
  }

  // Already HTML or plain text
  return content;
}

interface RichTextRendererProps {
  content: string;
}

export default function RichTextRenderer({ content }: RichTextRendererProps) {
  const [mounted, setMounted] = useState(false);
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    setHtml(contentToHtml(content));
    setMounted(true);
  }, [content]);

  if (!mounted) {
    return (
      <div
        className="prose prose-blue prose-lg max-w-none text-gray-700 leading-relaxed animate-pulse"
        suppressHydrationWarning
      />
    );
  }

  const sanitizedHtml = DOMPurify.sanitize(html, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "src", "style", "target", "rel"],
  });

  return (
    <div
      className="prose prose-blue prose-lg max-w-none text-gray-700 leading-relaxed
        prose-headings:text-gray-900 prose-headings:font-bold
        prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
        prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
        prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
        prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
        prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
        prose-li:text-gray-700 prose-li:mb-1
        prose-strong:text-gray-900 prose-strong:font-semibold
        prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800
        prose-blockquote:border-l-4 prose-blockquote:border-blue-400 prose-blockquote:pl-4 prose-blockquote:italic"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
