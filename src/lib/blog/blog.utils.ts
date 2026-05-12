// ============================================================
// BLOG UTILITIES
// ============================================================

import { prisma } from '@/lib/prisma';

/**
 * Generate unique slug from title
 */
export async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (!existing) {
      return slug;
    }

    counter++;
    slug = `${baseSlug}-${counter}`;
  }
}

/**
 * Sanitize HTML content
 */
export function sanitizeHtml(html: string): string {
  // Basic sanitization - in production, use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
}

/**
 * Extract plain text from HTML
 */
export function extractPlainText(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Generate excerpt from content
 */
export function generateExcerpt(content: string, maxLength: number = 200): string {
  const plainText = extractPlainText(content);
  if (plainText.length <= maxLength) {
    return plainText;
  }
  return plainText.substring(0, maxLength).trim() + '...';
}
