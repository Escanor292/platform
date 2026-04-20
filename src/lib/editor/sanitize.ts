/**
 * Content Sanitization
 * Multi-layer security for user-generated content
 */

import DOMPurify from 'dompurify';
import {
  ALLOWED_HTML_TAGS,
  ALLOWED_HTML_ATTRIBUTES,
  ALLOWED_URL_SCHEMES,
  ALLOWED_VIDEO_DOMAINS,
} from './constants';
import { SanitizeOptions, SanitizeResult } from '@/types/editor';

// ============================================
// DOMPURIFY CONFIGURATION
// ============================================

const DEFAULT_SANITIZE_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: [...ALLOWED_HTML_TAGS],
  ALLOWED_ATTR: Object.keys(ALLOWED_HTML_ATTRIBUTES).reduce((acc, tag) => {
    return [...acc, ...ALLOWED_HTML_ATTRIBUTES[tag]];
  }, [] as string[]),
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  ALLOW_DATA_ATTR: true,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  SAFE_FOR_TEMPLATES: true,
  WHOLE_DOCUMENT: false,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  FORCE_BODY: false,
  SANITIZE_DOM: true,
  KEEP_CONTENT: true,
  IN_PLACE: false,
};

// ============================================
// SANITIZE HTML
// ============================================

export function sanitizeHtml(
  html: string,
  options: SanitizeOptions = {}
): string {
  if (!html || typeof html !== 'string') return '';

  const config: DOMPurify.Config = {
    ...DEFAULT_SANITIZE_CONFIG,
    ...(options.allowedTags && { ALLOWED_TAGS: options.allowedTags }),
    ...(options.allowedAttributes && { ALLOWED_ATTR: Object.values(options.allowedAttributes).flat() }),
  };

  // Add hooks for iframe validation
  DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    if (data.tagName === 'iframe') {
      const element = node as Element;
      const src = element.getAttribute('src');
      if (src && !isAllowedIframeSrc(src, options.allowedIframeDomains)) {
        element.remove();
      }
    }
  });

  const clean = DOMPurify.sanitize(html, config as any);

  // Remove hooks after sanitization
  DOMPurify.removeAllHooks();

  return clean;
}

export function sanitizeHtmlWithTracking(
  html: string,
  options: SanitizeOptions = {}
): SanitizeResult {
  const original = html;
  const clean = sanitizeHtml(html, options);

  const removed: string[] = [];
  const modified = original !== clean;

  // Track what was removed (simplified)
  if (modified) {
    if (/<script/i.test(original) && !/<script/i.test(clean)) {
      removed.push('script tags');
    }
    if (/on\w+=/i.test(original) && !/on\w+=/i.test(clean)) {
      removed.push('event handlers');
    }
    if (/<iframe/i.test(original) && !/<iframe/i.test(clean)) {
      removed.push('unsafe iframes');
    }
  }

  return {
    clean,
    removed,
    modified,
  };
}

// ============================================
// IFRAME VALIDATION
// ============================================

function isAllowedIframeSrc(src: string, allowedDomains?: string[]): boolean {
  try {
    const url = new URL(src);

    // Check protocol
    if (!['https:', 'http:'].includes(url.protocol)) {
      return false;
    }

    // Check against allowed domains
    const domains = allowedDomains || ALLOWED_VIDEO_DOMAINS;
    return domains.some(domain => url.hostname === domain || url.hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

// ============================================
// SANITIZE FOR PREVIEW
// ============================================

export function sanitizeForPreview(html: string): string {
  return sanitizeHtml(html, {
    allowedIframeDomains: [...ALLOWED_VIDEO_DOMAINS],
  });
}

// ============================================
// SANITIZE FOR STORAGE
// ============================================

export function sanitizeForStorage(html: string): string {
  // More strict sanitization for storage
  const clean = sanitizeHtml(html);

  // Additional cleanup
  return clean
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/>\s+</g, '><') // Remove whitespace between tags
    .trim();
}

// ============================================
// SANITIZE PLAIN TEXT
// ============================================

export function sanitizePlainText(text: string): string {
  if (!text || typeof text !== 'string') return '';

  return text
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

// ============================================
// SANITIZE URL
// ============================================

export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';

  try {
    const urlObj = new URL(url);

    // Only allow http and https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return '';
    }

    // Remove javascript: and data: protocols
    if (url.toLowerCase().includes('javascript:') || url.toLowerCase().includes('data:')) {
      return '';
    }

    return urlObj.toString();
  } catch {
    return '';
  }
}

// ============================================
// SANITIZE ATTRIBUTES
// ============================================

export function sanitizeImageAttributes(attrs: Record<string, any>): Record<string, any> {
  return {
    src: sanitizeUrl(attrs.src || ''),
    alt: sanitizePlainText(attrs.alt || ''),
    title: sanitizePlainText(attrs.title || ''),
    caption: sanitizePlainText(attrs.caption || ''),
    alignment: ['left', 'center', 'right'].includes(attrs.alignment) ? attrs.alignment : 'center',
    width: typeof attrs.width === 'number' && attrs.width > 0 ? attrs.width : undefined,
    height: typeof attrs.height === 'number' && attrs.height > 0 ? attrs.height : undefined,
  };
}

export function sanitizeLinkAttributes(attrs: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {
    href: sanitizeUrl(attrs.href || ''),
  };

  if (attrs.title) {
    sanitized.title = sanitizePlainText(attrs.title);
  }

  if (attrs.target === '_blank') {
    sanitized.target = '_blank';
    sanitized.rel = 'noopener noreferrer'; // Security best practice
  }

  return sanitized;
}

// ============================================
// PASTE SANITIZATION
// ============================================

export function sanitizePastedContent(html: string): string {
  // Remove common junk from Word/Google Docs
  let clean = html;

  // Remove Word-specific tags
  clean = clean.replace(/<\/?o:p>/gi, '');
  clean = clean.replace(/<\/?w:[^>]*>/gi, '');
  clean = clean.replace(/<\/?m:[^>]*>/gi, '');

  // Remove style attributes (keep only allowed ones)
  clean = clean.replace(/style="[^"]*"/gi, '');

  // Remove class attributes (except allowed ones)
  clean = clean.replace(/class="[^"]*"/gi, '');

  // Remove empty paragraphs
  clean = clean.replace(/<p[^>]*>\s*<\/p>/gi, '');

  // Remove comments
  clean = clean.replace(/<!--[\s\S]*?-->/g, '');

  // Final sanitization
  return sanitizeHtml(clean);
}

// ============================================
// EXPORT UTILITIES
// ============================================

export function stripAllHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
}

export function extractTextContent(html: string): string {
  const clean = stripAllHtml(html);
  return clean.replace(/\s+/g, ' ').trim();
}
