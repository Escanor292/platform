"use client";

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
import { Node, mergeAttributes } from "@tiptap/core";
import { ProductBoxRenderer } from "@/components/shared/ProductBoxRenderer";
import { sanitizeForPreview } from "@/lib/editor/sanitize";
import { isTipTapDoc, parseFixtureSections, tryParseJsonObject } from "@/lib/project/rich-text";

const ProductBox = Node.create({
  name: "productBox",
  group: "block",
  inline: false,
  addAttributes() {
    return {
      rewardId: { default: null },
      title: { default: "" },
      price: { default: "" },
      imageUrl: { default: null },
      linkUrl: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="product-box"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    const attrs = HTMLAttributes as Record<string, any>;
    const payload = encodeURIComponent(
      JSON.stringify({
        rewardId: attrs.rewardId,
        title: attrs.title || "",
        price: attrs.price || "",
        imageUrl: attrs.imageUrl,
        linkUrl: attrs.linkUrl,
      })
    );
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, {
        "data-type": "product-box",
        "data-payload": payload,
        "data-slot": "product-box",
        class: "product-box-slot",
      }),
      0,
    ];
  },
});

const TIPTAP_EXTENSIONS = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
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
  ProductBox,
];

const PROSE_CLASS =
  "prose prose-lg max-w-none text-gray-700 leading-relaxed prose-headings:text-dblue prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4 prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6 prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6 prose-li:text-gray-700 prose-li:mb-1 prose-strong:text-dblue prose-strong:font-semibold prose-a:text-pgreen prose-a:underline hover:prose-a:text-dblue prose-a:transition-colors prose-blockquote:border-l-4 prose-blockquote:border-pgreen prose-blockquote:bg-cream/60 prose-blockquote:rounded-r-2xl prose-blockquote:pl-4 prose-blockquote:py-1 prose-blockquote:pr-4 prose-blockquote:italic";

export function normalizeRichTextContent(content: unknown): string {
  if (parseFixtureSections(content)) return "";
  if (typeof content === "string") return content;
  if (content && typeof content === "object") {
    try {
      return JSON.stringify(content);
    } catch {
      return "";
    }
  }
  return "";
}

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

function contentToHtml(content: unknown): string {
  if (isTipTapDoc(content)) {
    const doc = tryParseJsonObject(content);
    if (doc) {
      try {
        return generateHTML(doc as any, TIPTAP_EXTENSIONS);
      } catch {
        return "<p></p>";
      }
    }
  }

  const normalized = normalizeRichTextContent(content);
  if (!normalized) return "";

  const json = parseTipTapJson(normalized);
  if (json) {
    try {
      return generateHTML(json as any, TIPTAP_EXTENSIONS);
    } catch {
      return "<p></p>";
    }
  }

  return normalized;
}

interface RichTextRendererProps {
  content: unknown;
}

export default function RichTextRenderer({ content }: RichTextRendererProps) {
  const fixture = parseFixtureSections(content);
  if (fixture) {
    return (
      <div className="space-y-8">
        {fixture.map((section, index) => (
          <article key={`${section.title}-${index}`} className="space-y-3">
            <h3 className="font-display text-xl font-bold text-dblue">{section.title}</h3>
            {section.body ? (
              <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{section.body}</p>
            ) : null}
          </article>
        ))}
      </div>
    );
  }

  const html = contentToHtml(content);
  const sanitizedHtml = sanitizeForPreview(html);

  if (!sanitizedHtml) {
    return null;
  }

  return (
    <>
      <div
        className={PROSE_CLASS}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
      <ProductBoxRenderer />
    </>
  );
}
