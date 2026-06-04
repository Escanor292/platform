"use client";

import DOMPurify from "dompurify";
import { useRef, useSyncExternalStore } from "react";
import { generateHTML } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextStyle from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { ImageWithCaption, VideoEmbed, Callout } from "@/components/editor/extensions";

// Extensions list used by the editor
const TIPTAP_EXTENSIONS = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3],
    },
  }),
  Link.configure({ openOnClick: false }),
  ImageWithCaption,
  VideoEmbed,
  Callout,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Underline,
  Highlight.configure({ multicolor: true }),
  TextStyle,
  Color,
  TaskList,
  TaskItem.configure({ nested: true }),
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

// useSyncExternalStore-based hydration guard (no setState in effect)
function subscribe() {
  return () => { };
}
function getServerSnapshot() {
  return false;
}
function getClientSnapshot() {
  return true;
}

interface RichTextRendererProps {
  content: string;
}

export default function RichTextRenderer({ content }: RichTextRendererProps) {
  // Safe hydration: false on server, true on client — no setState in effect
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  if (!mounted) {
    return (
      <div
        className="prose prose-lg max-w-none text-gray-700 leading-relaxed animate-pulse"
        suppressHydrationWarning
      />
    );
  }

  const html = contentToHtml(content);
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "src", "style", "target", "rel", "data-type", "data-variant"],
  });

  return (
    <div
      className="prose prose-lg max-w-none text-gray-700 leading-relaxed
        prose-headings:text-dblue prose-headings:font-bold
        prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
        prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
        prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
        prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
        prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
        prose-li:text-gray-700 prose-li:mb-1
        prose-strong:text-dblue prose-strong:font-semibold
        prose-a:text-pgreen prose-a:underline hover:prose-a:text-dblue prose-a:transition-colors
        prose-blockquote:border-l-4 prose-blockquote:border-pgreen prose-blockquote:bg-cream/60 prose-blockquote:rounded-r-2xl prose-blockquote:pl-4 prose-blockquote:py-1 prose-blockquote:pr-4 prose-blockquote:italic"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
