import type { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';
import { PUBLIC_CAMPAIGN_STATUSES } from '@/lib/moderation/policy';
import { getSiteUrl } from '@/lib/seo';

const MAX_URLS = 2000;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/campaigns`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${base}/projects`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/gioi-thieu`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/policy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/policy/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/policy/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/policy/creator`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/policy/refund`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/huong-dan/creator`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  try {
    const [campaigns, projects, posts, products] = await Promise.all([
      prisma.campaigns.findMany({
        where: { status: { in: [...PUBLIC_CAMPAIGN_STATUSES] as any } },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
        take: MAX_URLS,
      }),
      prisma.projects.findMany({
        where: { isLocked: false },
        select: { id: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
        take: MAX_URLS,
      }),
      prisma.blog_posts.findMany({
        where: {
          deletedAt: null,
          status: 'PUBLISHED',
          visibility: 'PUBLIC',
          OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
        },
        select: { slug: true, updatedAt: true, publishedAt: true },
        orderBy: { updatedAt: 'desc' },
        take: MAX_URLS,
      }),
      prisma.rewards.findMany({
        where: { isActive: true },
        select: { id: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
        take: MAX_URLS,
      }),
    ]);

    return [
      ...staticPages,
      ...campaigns.map((row) => ({
        url: `${base}/campaigns/${row.slug}`,
        lastModified: row.updatedAt,
        changeFrequency: 'hourly' as const,
        priority: 0.8,
      })),
      ...projects.map((row) => ({
        url: `${base}/projects/${row.id}`,
        lastModified: row.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
      ...posts.map((row) => ({
        url: `${base}/blog/${row.slug}`,
        lastModified: row.publishedAt || row.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })),
      ...products.map((row) => ({
        url: `${base}/products/${row.id}`,
        lastModified: row.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      })),
    ];
  } catch (error) {
    console.error('[SITEMAP]', error);
    return staticPages;
  }
}
