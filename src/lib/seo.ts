import type { Metadata } from 'next';
import { extractTextFromDescription } from '@/lib/utils';

export const SITE_NAME = 'Tử Tế Fund';
export const SITE_TAGLINE = 'Lấy sự tử tế trồng tương lai';
export const SITE_DESCRIPTION =
  'Lấy sự tử tế trồng tương lai. Nền tảng gây quỹ cộng đồng minh bạch tại Việt Nam.';
export const DEFAULT_OG_PATH = '/images/hero-bg.jpg';
export const GA4_ID_PATTERN = /^(G|GT|AW)-[A-Z0-9]{4,20}$/;

export function getSiteUrl(): string {
  const raw =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : '');
  const cleaned = String(raw || '').trim().replace(/\/$/, '');
  if (!cleaned) return 'http://localhost:3000';
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  return `https://${cleaned}`;
}

export function absoluteUrl(path = '/'): string {
  const base = getSiteUrl();
  if (!path || path === '/') return base;
  if (/^https?:\/\//i.test(path)) return path;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function toPlainDescription(input?: string | null, max = 160): string {
  const text = extractTextFromDescription(String(input || ''))
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return SITE_DESCRIPTION;
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(1, max - 1)).trimEnd()}…`;
}

export function pickImageUrl(...candidates: Array<string | null | undefined>): string {
  for (const value of candidates) {
    const url = String(value || '').trim();
    if (url) return /^https?:\/\//i.test(url) ? url : absoluteUrl(url);
  }
  return absoluteUrl(DEFAULT_OG_PATH);
}

export function normalizeGa4Id(raw?: string | null): string | null {
  const value = String(raw || '').trim().toUpperCase();
  if (!value) return null;
  return GA4_ID_PATTERN.test(value) ? value : null;
}

type SocialMetaInput = {
  title: string;
  description?: string | null;
  path: string;
  image?: string | null;
  type?: 'website' | 'article';
  index?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
};

export function buildSocialMetadata(input: SocialMetaInput): Metadata {
  const pageTitle = input.title.trim();
  const fullTitle = pageTitle.includes(SITE_NAME) ? pageTitle : `${pageTitle} | ${SITE_NAME}`;
  const description = toPlainDescription(input.description);
  const url = absoluteUrl(input.path);
  const image = pickImageUrl(input.image);
  const index = input.index !== false;

  const ogType = input.type || 'website';
  return {
    title: pageTitle.includes(SITE_NAME) ? { absolute: fullTitle } : pageTitle,
    description,
    alternates: { canonical: url },
    robots: { index, follow: index },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'vi_VN',
      type: ogType,
      images: [{ url: image, width: 1200, height: 630, alt: pageTitle }],
      ...(ogType === 'article'
        ? {
            publishedTime: input.publishedTime,
            modifiedTime: input.modifiedTime,
            authors: input.authors,
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },
  };
}
