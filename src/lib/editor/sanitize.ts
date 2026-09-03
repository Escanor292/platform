/**
 * Content Sanitization
 * Shared allowlist for editor preview, public render, and API persist.
 * Uses isomorphic-dompurify so API routes and RSC can sanitize on the server.
 */

import DOMPurify, { type Config as DOMPurifyConfig } from 'isomorphic-dompurify';
import {
  ALLOWED_HTML_TAGS,
  ALLOWED_HTML_ATTRIBUTES,
  ALLOWED_VIDEO_DOMAINS,
} from './constants';
import { SanitizeOptions, SanitizeResult } from '@/types/editor';

const HOOK_NAME = 'uponSanitizeElement';

function collectAllowedAttrs(): string[] {
  const set = new Set<string>();
  Object.values(ALLOWED_HTML_ATTRIBUTES).forEach((attrs) => {
    attrs.forEach((attr) => set.add(attr));
  });
  [
    'target', 'rel', 'allowfullscreen', 'allow',
    'data-type', 'data-variant', 'data-payload', 'data-slot',
    'data-checked', 'data-provider', 'data-src', 'data-width', 'data-height',
    'data-alignment', 'data-caption', 'data-reward-id', 'data-title',
    'data-price', 'data-image-url', 'data-link-url', 'data-campaign-id',
    'data-is-preorder', 'data-delivery-date',
  ].forEach((attr) => set.add(attr));
  return Array.from(set);
}

export const DEFAULT_SANITIZE_CONFIG: DOMPurifyConfig = {
  ALLOWED_TAGS: [...ALLOWED_HTML_TAGS],
  ALLOWED_ATTR: collectAllowedAttrs(),
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  ALLOW_DATA_ATTR: false,
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

function hostnameAllowed(hostname: string, domains: readonly string[]): boolean {
  const host = hostname.toLowerCase();
  return domains.some((domain) => {
    const d = domain.toLowerCase();
    return host === d || host.endsWith(`.${d}`);
  });
}

export function isAllowedIframeSrc(src: string, allowedDomains?: readonly string[]): boolean {
  try {
    const url = new URL(src);
    if (!['https:', 'http:'].includes(url.protocol)) return false;
    const domains = allowedDomains || ALLOWED_VIDEO_DOMAINS;
    return hostnameAllowed(url.hostname, domains);
  } catch {
    return false;
  }
}

let hooksInstalled = false;

function ensureIframeHook() {
  if (hooksInstalled) return;
  try {
    DOMPurify.addHook(HOOK_NAME, (node, data) => {
      if (data.tagName === 'iframe') {
        const element = node as Element;
        const src = element.getAttribute('src');
        if (!src || !isAllowedIframeSrc(src)) {
          element.parentNode?.removeChild(element);
        }
      }
    });
    hooksInstalled = true;
  } catch {
    hooksInstalled = false;
  }
}

function fallbackSanitize(html: string, allowedDomains?: readonly string[]): string {
  let clean = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '');

  clean = clean.replace(/<iframe\b([^>]*)>([\s\S]*?)<\/iframe>/gi, (full, attrs) => {
    const srcMatch = /src\s*=\s*["']([^"']+)["']/i.exec(attrs);
    if (srcMatch && isAllowedIframeSrc(srcMatch[1], allowedDomains)) {
      return full;
    }
    return '';
  });

  return clean;
}

export function sanitizeHtml(
  html: string,
  options: SanitizeOptions = {}
): string {
  if (!html || typeof html !== 'string') return '';

  const config: DOMPurifyConfig = {
    ...DEFAULT_SANITIZE_CONFIG,
    ...(options.allowedTags && { ALLOWED_TAGS: options.allowedTags }),
    ...(options.allowedAttributes && {
      ALLOWED_ATTR: Object.values(options.allowedAttributes).flat(),
    }),
  };

  try {
    ensureIframeHook();
    return DOMPurify.sanitize(html, config as any) as unknown as string;
  } catch {
    return fallbackSanitize(html, options.allowedIframeDomains || ALLOWED_VIDEO_DOMAINS);
  }
}

export function sanitizeHtmlWithTracking(
  html: string,
  options: SanitizeOptions = {}
): SanitizeResult {
  const original = html;
  const clean = sanitizeHtml(html, options);
  const removed: string[] = [];
  const modified = original !== clean;

  if (modified) {
    if (/<script/i.test(original) && !/<script/i.test(clean)) removed.push('script tags');
    if (/on\w+=/i.test(original) && !/on\w+=/i.test(clean)) removed.push('event handlers');
    if (/<iframe/i.test(original) && !/<iframe/i.test(clean)) removed.push('unsafe iframes');
  }

  return { clean, removed, modified };
}

export function sanitizeForPreview(html: string): string {
  return sanitizeHtml(html, {
    allowedIframeDomains: [...ALLOWED_VIDEO_DOMAINS],
  });
}

export function sanitizeForStorage(html: string): string {
  return sanitizeHtml(html).trim();
}

export function sanitizePlainText(text: string): string {
  if (!text || typeof text !== 'string') return '';

  return text
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';

  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) return '';
    if (url.toLowerCase().includes('javascript:') || url.toLowerCase().includes('data:')) {
      return '';
    }
    return urlObj.toString();
  } catch {
    return '';
  }
}

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
    sanitized.rel = 'noopener noreferrer';
  }

  return sanitized;
}

export function sanitizePastedContent(html: string): string {
  let clean = html;
  clean = clean.replace(/<\/?o:p>/gi, '');
  clean = clean.replace(/<\/?w:[^>]*>/gi, '');
  clean = clean.replace(/<\/?m:[^>]*>/gi, '');
  clean = clean.replace(/style="[^"]*"/gi, '');
  clean = clean.replace(/class="[^"]*"/gi, '');
  clean = clean.replace(/<p[^>]*>\s*<\/p>/gi, '');
  clean = clean.replace(/<!--[\s\S]*?-->/g, '');
  return sanitizeHtml(clean);
}

export function stripAllHtml(html: string): string {
  try {
    return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
  } catch {
    return html.replace(/<[^>]*>/g, '');
  }
}

export function extractTextContent(html: string): string {
  const clean = stripAllHtml(html);
  return clean.replace(/\s+/g, ' ').trim();
}
