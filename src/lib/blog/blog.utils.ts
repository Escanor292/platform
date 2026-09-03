// ============================================================
// BLOG UTILITIES
// ============================================================

import { prisma } from '@/lib/prisma';
import { sanitizeForStorage, extractTextContent } from '@/lib/editor/sanitize';

export async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.blog_posts.findUnique({
      where: { slug },
    });

    if (!existing) {
      return slug;
    }

    counter++;
    slug = `${baseSlug}-${counter}`;
  }
}

export function sanitizeHtml(html: string): string {
  return sanitizeForStorage(html);
}

export function extractPlainText(html: string): string {
  return extractTextContent(html);
}

export function generateExcerpt(content: string, maxLength: number = 200): string {
  const plainText = extractPlainText(content);
  if (plainText.length <= maxLength) {
    return plainText;
  }
  return plainText.substring(0, maxLength).trim() + '...';
}
