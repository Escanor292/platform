import { describe, expect, it } from '@jest/globals';
import {
  hoursWaiting,
  isEditorialBlogType,
  isPubliclyVisibleBlog,
  isScheduledInFuture,
  isSlaOverdue,
  normalizeRejectReason,
  resolvePublishAt,
  SLA_HOURS,
} from './blog-policy';

describe('blog editorial helpers', () => {
  it('marks platform, announcement, story and impact report as editorial', () => {
    expect(isEditorialBlogType('PLATFORM')).toBe(true);
    expect(isEditorialBlogType('ANNOUNCEMENT')).toBe(true);
    expect(isEditorialBlogType('STORY')).toBe(true);
    expect(isEditorialBlogType('IMPACT_REPORT')).toBe(true);
    expect(isEditorialBlogType('CAMPAIGN_UPDATE')).toBe(false);
    expect(isEditorialBlogType(null)).toBe(false);
  });

  it('hides scheduled posts until publish time', () => {
    const now = new Date('2026-09-07T05:00:00.000Z');
    expect(isScheduledInFuture('2026-09-07T08:00:00.000Z', now)).toBe(true);
    expect(isScheduledInFuture('2026-09-07T04:00:00.000Z', now)).toBe(false);
    expect(isPubliclyVisibleBlog('PUBLISHED', '2026-09-07T08:00:00.000Z', now)).toBe(false);
    expect(isPubliclyVisibleBlog('PUBLISHED', '2026-09-07T04:00:00.000Z', now)).toBe(true);
    expect(isPubliclyVisibleBlog('PENDING_REVIEW', null, now)).toBe(false);
    expect(isPubliclyVisibleBlog('PUBLISHED', null, now)).toBe(true);
  });

  it('flags queue items older than 24h as SLA overdue', () => {
    const now = new Date('2026-09-07T12:00:00.000Z');
    expect(hoursWaiting('2026-09-06T11:00:00.000Z', now)).toBe(25);
    expect(isSlaOverdue('2026-09-06T11:00:00.000Z', SLA_HOURS, now)).toBe(true);
    expect(isSlaOverdue('2026-09-07T10:00:00.000Z', SLA_HOURS, now)).toBe(false);
  });

  it('uses a future schedule, otherwise publishes immediately', () => {
    const now = new Date('2026-09-07T05:00:00.000Z');
    expect(resolvePublishAt('2026-09-08T00:00:00.000Z', now).toISOString()).toBe(
      '2026-09-08T00:00:00.000Z'
    );
    expect(resolvePublishAt('2026-09-07T01:00:00.000Z', now).toISOString()).toBe(now.toISOString());
    expect(resolvePublishAt(null, now).toISOString()).toBe(now.toISOString());
  });

  it('requires a trimmed reject reason', () => {
    expect(normalizeRejectReason('  thiếu nguồn  ')).toBe('thiếu nguồn');
    expect(normalizeRejectReason('   ')).toBe('');
  });
});
