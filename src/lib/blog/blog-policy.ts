export const EDITORIAL_BLOG_TYPES = ['PLATFORM', 'ANNOUNCEMENT', 'STORY', 'IMPACT_REPORT'] as const;
export const SLA_HOURS = 24;
export const MAX_BULK_REVIEW = 50;

const EDITORIAL_TYPES = new Set<string>(EDITORIAL_BLOG_TYPES);

export function isEditorialBlogType(type: string | null | undefined): boolean {
  return !!type && EDITORIAL_TYPES.has(type);
}

export function isScheduledInFuture(
  publishedAt: Date | string | null | undefined,
  now: Date = new Date()
): boolean {
  if (!publishedAt) return false;
  const date = publishedAt instanceof Date ? publishedAt : new Date(publishedAt);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() > now.getTime();
}

export function isPubliclyVisibleBlog(
  status: string | null | undefined,
  publishedAt?: Date | string | null,
  now: Date = new Date()
): boolean {
  return status === 'PUBLISHED' && !isScheduledInFuture(publishedAt, now);
}

export function hoursWaiting(createdAt: Date | string, now: Date = new Date()): number {
  const date = createdAt instanceof Date ? createdAt : new Date(createdAt);
  if (Number.isNaN(date.getTime())) return 0;
  return Math.max(0, (now.getTime() - date.getTime()) / 36e5);
}

export function isSlaOverdue(
  createdAt: Date | string,
  hours: number = SLA_HOURS,
  now: Date = new Date()
): boolean {
  return hoursWaiting(createdAt, now) >= hours;
}

export function resolvePublishAt(
  scheduledAt?: Date | string | null,
  now: Date = new Date()
): Date {
  if (!scheduledAt) return now;
  const date = scheduledAt instanceof Date ? scheduledAt : new Date(scheduledAt);
  if (Number.isNaN(date.getTime())) return now;
  return date.getTime() > now.getTime() ? date : now;
}

export function normalizeRejectReason(reason?: string | null): string {
  return String(reason || '').trim();
}
