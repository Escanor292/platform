import { describe, expect, it } from '@jest/globals';
import {
  campaignModerationLabel,
  canRestoreCanceledCampaign,
  canSubmitCampaign,
  canTakedownCampaign,
  canWithdrawCampaign,
  isPublicCampaignStatus,
  lockLabel,
} from './policy';

describe('moderation policy', () => {
  it('keeps fundraising campaigns behind review until ACTIVE', () => {
    expect(canSubmitCampaign('DRAFT')).toBe(true);
    expect(canSubmitCampaign('CANCELED', 0)).toBe(true);
    expect(canSubmitCampaign('CANCELED', 2)).toBe(false);
    expect(canSubmitCampaign('PENDING_REVIEW')).toBe(false);
    expect(canSubmitCampaign('ACTIVE')).toBe(false);
  });

  it('only withdraws campaigns that are waiting in the queue', () => {
    expect(canWithdrawCampaign('PENDING_REVIEW')).toBe(true);
    expect(canWithdrawCampaign('DRAFT')).toBe(false);
  });

  it('does not show draft, pending or canceled campaigns on the public catalog', () => {
    expect(isPublicCampaignStatus('ACTIVE')).toBe(true);
    expect(isPublicCampaignStatus('SUCCESS')).toBe(true);
    expect(isPublicCampaignStatus('DRAFT')).toBe(false);
    expect(isPublicCampaignStatus('PENDING_REVIEW')).toBe(false);
    expect(isPublicCampaignStatus('CANCELED')).toBe(false);
  });

  it('restores a live takedown but not a queue rejection', () => {
    expect(canRestoreCanceledCampaign({ status: 'CANCELED', moderationAction: 'TAKEDOWN' })).toBe(true);
    expect(canRestoreCanceledCampaign({ status: 'CANCELED', moderationAction: 'REJECT' })).toBe(false);
    expect(canRestoreCanceledCampaign({ status: 'CANCELED', successPledgeCount: 3 })).toBe(true);
  });

  it('only takes down public campaigns, not the review queue', () => {
    expect(canTakedownCampaign('ACTIVE')).toBe(true);
    expect(canTakedownCampaign('SUCCESS')).toBe(true);
    expect(canTakedownCampaign('PENDING_REVIEW')).toBe(false);
    expect(canTakedownCampaign('DRAFT')).toBe(false);
    expect(canTakedownCampaign('CANCELED')).toBe(false);
  });

  it('labels lock actions in Vietnamese and distinguishes reject vs takedown', () => {
    expect(lockLabel('campaign', false)).toBe('Gỡ chiến dịch');
    expect(lockLabel('project', true)).toBe('Mở khóa dự án');
    expect(lockLabel('product', false)).toBe('Ẩn sản phẩm');
    expect(campaignModerationLabel('CANCELED', 'REJECT')).toBe('Từ chối');
    expect(campaignModerationLabel('CANCELED', 'TAKEDOWN')).toBe('Đã gỡ');
  });
});
