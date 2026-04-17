/**
 * Editor Preview Component
 * Safely render rich text content with proper sanitization
 */

'use client';

import React, { useMemo } from 'react';
import { sanitizeForPreview } from '@/lib/editor/sanitize';
import { RichTextPreviewProps } from '@/types/editor';
import './editor.css';

export function EditorPreview({ content, className = '' }: RichTextPreviewProps) {
  // Sanitize content
  const sanitizedContent = useMemo(() => {
    if (!content) return '';
    return sanitizeForPreview(content);
  }, [content]);

  // Empty state
  if (!sanitizedContent || sanitizedContent === '<p></p>') {
    return (
      <div className={`text-gray-400 italic ${className}`}>
        Chưa có nội dung
      </div>
    );
  }

  return (
    <div
      className={`prose prose-lg max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}

// Server-safe version (no hooks)
export function EditorPreviewServer({ content, className = '' }: RichTextPreviewProps) {
  const sanitizedContent = content ? sanitizeForPreview(content) : '';

  if (!sanitizedContent || sanitizedContent === '<p></p>') {
    return (
      <div className={`text-gray-400 italic ${className}`}>
        Chưa có nội dung
      </div>
    );
  }

  return (
    <div
      className={`prose prose-lg max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
