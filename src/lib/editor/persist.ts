/**
 * Persist helpers for rich text — single entry used by campaign/blog APIs.
 */

import { EDITOR_LIMITS, ERROR_MESSAGES } from './constants';
import { sanitizeForStorage, extractTextContent } from './sanitize';

export class RichTextValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RichTextValidationError';
  }
}

export function persistRichText(
  html: unknown,
  maxLength: number = EDITOR_LIMITS.MAX_CONTENT_LENGTH
): string {
  const raw = typeof html === 'string' ? html : '';
  const clean = sanitizeForStorage(raw);

  if (clean.length > maxLength) {
    throw new RichTextValidationError(ERROR_MESSAGES.CONTENT_TOO_LONG);
  }

  return clean;
}

export function isRichTextEmpty(html: string | null | undefined): boolean {
  if (!html) return true;
  const text = extractTextContent(html);
  return text.length === 0;
}
