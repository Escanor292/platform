import prisma from "@/lib/prisma";

export async function generateUniqueCampaignCode(): Promise<string> {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');

  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    const campaignCode = `CF-${dateStr}-${randomStr}`;

    const existing = await prisma.campaigns.findUnique({
      where: { campaignCode }
    });

    if (!existing) {
      return campaignCode;
    }

    attempts++;
  }

  const timestamp = Date.now().toString().slice(-5);
  return `CF-${dateStr}-${timestamp}`;
}

export function formatCampaignCode(code: string): string {
  return code;
}

export function isValidCampaignCode(code: string): boolean {
  const pattern = /^CF-\d{8}-[A-Z0-9]{5}$/;
  return pattern.test(code);
}

export function slugifyCampaignTitle(title: string): string {
  const base = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 72);

  return base || 'campaign';
}

export async function generateUniqueCampaignSlug(title: string): Promise<string> {
  const baseSlug = slugifyCampaignTitle(title);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.campaigns.findUnique({
      where: { slug },
    });
    if (!existing) return slug;
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }
}
