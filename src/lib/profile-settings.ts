import type { NotificationType } from '@/types/mongodb.types';

export type PrivacyField = 'email' | 'phone' | 'location' | 'bio' | 'website' | 'socialLinks';

export interface PrivacySettings {
  email: boolean;
  phone: boolean;
  location: boolean;
  bio: boolean;
  website: boolean;
  socialLinks: boolean;
}

export interface NotificationSettings {
  paymentSuccess: boolean;
  pledgeReceived: boolean;
  campaignReview: boolean;
  blogReview: boolean;
  campaignFollowed: boolean;
  comments: boolean;
  system: boolean;
}

const booleanValue = (value: unknown, fallback: boolean) => typeof value === 'boolean' ? value : fallback;

export function normalizePrivacySettings(role: string, value: unknown): PrivacySettings {
  const input = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
  const creatorContactLocked = role === 'CREATOR' || role === 'CREATOR_PENDING' || role === 'ADMIN';

  return {
    // Account name, account ID and display identity are intentionally not configurable.
    email: creatorContactLocked ? true : booleanValue(input.email, true),
    phone: creatorContactLocked ? true : booleanValue(input.phone, false),
    location: booleanValue(input.location, true),
    bio: booleanValue(input.bio, true),
    website: booleanValue(input.website, true),
    socialLinks: booleanValue(input.socialLinks, true),
  };
}

export function normalizeNotificationSettings(value: unknown): NotificationSettings {
  const input = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
  return {
    paymentSuccess: booleanValue(input.paymentSuccess, true),
    pledgeReceived: booleanValue(input.pledgeReceived, true),
    campaignReview: booleanValue(input.campaignReview, true),
    blogReview: booleanValue(input.blogReview, true),
    campaignFollowed: booleanValue(input.campaignFollowed, true),
    comments: booleanValue(input.comments, true),
    system: booleanValue(input.system, true),
  };
}

export function canExposePrivacyField(
  role: string,
  settings: unknown,
  field: PrivacyField,
  isOwner: boolean,
) {
  if (isOwner) return true;
  return normalizePrivacySettings(role, settings)[field];
}

export function notificationPreferenceKey(type: NotificationType): keyof NotificationSettings {
  switch (type) {
    case 'PAYMENT_SUCCESS':
    case 'PAYMENT_FAILED':
      return 'paymentSuccess';
    case 'PLEDGE_RECEIVED':
      return 'pledgeReceived';
    case 'CAMPAIGN_APPROVED':
    case 'CAMPAIGN_REJECTED':
      return 'campaignReview';
    case 'BLOG_APPROVED':
    case 'BLOG_REJECTED':
      return 'blogReview';
    case 'CAMPAIGN_FOLLOWED':
      return 'campaignFollowed';
    case 'COMMENT_RECEIVED':
    case 'COMMENT_REPLY':
    case 'COMMENT_MENTION':
      return 'comments';
    default:
      return 'system';
  }
}
