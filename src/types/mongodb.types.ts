/**
 * MongoDB TypeScript Interfaces — Hybrid Architecture
 *
 * Quy tắc thiết kế:
 * - _id: ObjectId (MongoDB default) — KHÔNG dùng cuid
 * - legacyId: string (lưu cuid cũ từ PostgreSQL nếu cần mapping)
 * - Các ID tham chiếu về PostgreSQL (userId, campaignId...) lưu dạng string
 * - KHÔNG lưu dữ liệu tài chính (amount, payment) trong MongoDB
 * - Tất cả collections có createdAt, updatedAt
 */

import { ObjectId } from 'mongodb';

// ─────────────────────────────────────────────────────────────────────────────
// Shared base
// ─────────────────────────────────────────────────────────────────────────────

export interface MongoBase {
  _id?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  /** cuid từ PostgreSQL nếu cần mapping, không bắt buộc */
  legacyId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CAMPAIGN UPDATES — Bài đăng tiến độ từ creator
// ─────────────────────────────────────────────────────────────────────────────

export type CampaignUpdateType = 'TEXT' | 'MILESTONE' | 'MEDIA' | 'ANNOUNCEMENT';
export type CampaignUpdateStatus = 'DRAFT' | 'PUBLISHED';

export interface MongoCampaignUpdate extends MongoBase {
  /** ID từ PostgreSQL campaigns.id (string/cuid) */
  campaignId: string;
  /** ID từ PostgreSQL users.id (string/cuid) — creator */
  creatorId: string;
  title: string;
  content: string; // Rich text HTML/Markdown
  type: CampaignUpdateType;
  status: CampaignUpdateStatus;
  isPinned: boolean;
  tags: string[];
  /** Ảnh/video đính kèm */
  media: {
    url: string;
    type: 'IMAGE' | 'VIDEO';
    caption?: string;
    order: number;
  }[];
  /** Số lượt xem (tăng mỗi khi user mở bài update) */
  viewCount: number;
  publishedAt?: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMMENTS — Bình luận (nested, cây 2 cấp)
// ─────────────────────────────────────────────────────────────────────────────

export type CommentStatus = 'PENDING' | 'APPROVED' | 'HIDDEN' | 'DELETED';

export interface CommentReaction {
  type: 'LIKE' | 'LOVE' | 'HAHA' | 'WOW' | 'SAD' | 'ANGRY';
  /** Array userIds (PostgreSQL) đã react */
  userIds: string[];
}

export interface EditHistory {
  content: string;
  editedAt: Date;
}

export interface MongoComment extends MongoBase {
  /** ID từ PostgreSQL campaigns.id */
  campaignId: string;
  /** ID từ PostgreSQL users.id */
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  /** ObjectId của comment cha (nếu là reply), null nếu là root comment */
  parentId?: string | null;
  /** Độ sâu nesting (0 = root, 1 = reply). Giới hạn tối đa 2. */
  depth: number;
  reactions: CommentReaction[];
  editHistory: EditHistory[];
  isEdited: boolean;
  /** Soft delete — giữ document nhưng ẩn content */
  isDeleted: boolean;
  status: CommentStatus;
  /** Số lượng replies trực tiếp (denormalized cho performance) */
  replyCount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS — Thông báo người dùng
// ─────────────────────────────────────────────────────────────────────────────

export type NotificationType =
  | 'PLEDGE_RECEIVED'    // Creator nhận donation
  | 'PAYMENT_SUCCESS'    // Backer thanh toán thành công
  | 'PAYMENT_FAILED'     // Backer thanh toán thất bại
  | 'CAMPAIGN_APPROVED'  // Admin duyệt campaign
  | 'CAMPAIGN_REJECTED'  // Admin từ chối campaign
  | 'CAMPAIGN_UPDATE'    // Creator đăng bài update
  | 'COMMENT_REPLY'      // Có reply vào comment của mình
  | 'COMMENT_MENTION'    // Được @mention trong comment
  | 'CAMPAIGN_ENDING'    // Campaign sắp kết thúc (cho backer chưa donate)
  | 'REFUND_PROCESSED'   // Hoàn tiền thành công
  | 'KYC_APPROVED'       // KYC được duyệt
  | 'KYC_REJECTED'       // KYC bị từ chối
  | 'SYSTEM';            // Thông báo hệ thống

export interface NotificationPayload {
  /** Relative URL để deep link (VD: /campaigns/slug) */
  href?: string;
  /** PostgreSQL IDs liên quan */
  campaignId?: string;
  pledgeId?: string;
  commentId?: string;
  amount?: number;
  /** Extra data tùy theo loại notification */
  extra?: Record<string, unknown>;
}

export interface MongoNotification extends MongoBase {
  /** ID từ PostgreSQL users.id — người nhận */
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  payload: NotificationPayload;
  isRead: boolean;
  readAt?: Date;
  /** TTL — tự động xóa sau 90 ngày (set qua TTL index) */
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVITY LOGS — Lịch sử hành động người dùng
// ─────────────────────────────────────────────────────────────────────────────

export type ActivityAction =
  // Auth
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_REGISTER'
  // Campaign
  | 'CAMPAIGN_VIEW'
  | 'CAMPAIGN_SEARCH'
  | 'CAMPAIGN_FOLLOW'
  | 'CAMPAIGN_UNFOLLOW'
  | 'CAMPAIGN_SHARE'
  // Donation flow (không lưu amount ở đây)
  | 'DONATION_MODAL_OPEN'
  | 'DONATION_SUBMITTED'
  | 'DONATION_PAYMENT_REDIRECT'
  | 'DONATION_PAYMENT_CANCEL'
  // Content
  | 'COMMENT_CREATE'
  | 'COMMENT_EDIT'
  | 'COMMENT_DELETE'
  | 'UPDATE_VIEW'
  // Admin
  | 'ADMIN_CAMPAIGN_APPROVE'
  | 'ADMIN_CAMPAIGN_REJECT'
  | 'ADMIN_USER_BAN';

export interface MongoActivityLog extends MongoBase {
  /** ID từ PostgreSQL users.id — có thể null nếu anonymous */
  userId?: string;
  action: ActivityAction;
  /** Loại entity liên quan: CAMPAIGN, USER, PLEDGE, COMMENT... */
  entityType: string;
  /** ID của entity (PostgreSQL ID dạng string) */
  entityId: string;
  /** Chi tiết thêm dưới dạng JSON linh hoạt */
  details?: Record<string, unknown>;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    path?: string;
  };
  /** TTL — tự động xóa sau 90 ngày */
}

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT LOGS — Log thay đổi dữ liệu quan trọng (bản MongoDB song song với PG)
// ─────────────────────────────────────────────────────────────────────────────

export type AuditAction =
  | 'CREATE' | 'UPDATE' | 'DELETE'
  | 'APPROVE' | 'REJECT' | 'CANCEL'
  | 'REFUND'
  | 'KYC_SUBMIT' | 'KYC_APPROVE' | 'KYC_REJECT'
  | 'LOGIN' | 'LOGOUT';

export interface MongoAuditLog extends MongoBase {
  /** ID từ PostgreSQL users.id — người thực hiện (null nếu system) */
  userId?: string;
  action: AuditAction;
  entityType: string;
  /** ID của entity trong PostgreSQL */
  entityId: string;
  /** Snapshot giá trị cũ (KHÔNG lưu sensitive data như password) */
  oldValue?: Record<string, unknown>;
  /** Snapshot giá trị mới */
  newValue?: Record<string, unknown>;
  /** Chỉ các field thay đổi */
  changes?: Record<string, { from: unknown; to: unknown }>;
  ipAddress?: string;
  userAgent?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
  /** PostgreSQL AuditLog.id để cross-reference nếu cần */
  pgAuditLogId?: string;
  /** TTL — tự động xóa sau 365 ngày */
}

// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS EVENTS — Tracking hành vi
// ─────────────────────────────────────────────────────────────────────────────

export type AnalyticsEventName =
  | 'PAGE_VIEW'
  | 'CAMPAIGN_VIEW'
  | 'CAMPAIGN_CREATED'
  | 'CAMPAIGN_SCROLL_DEPTH'
  | 'DONATION_MODAL_OPEN'
  | 'DONATION_AMOUNT_SELECT'
  | 'DONATION_FORM_SUBMIT'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAIL'
  | 'SEARCH_QUERY'
  | 'FILTER_APPLY'
  | 'SHARE_CLICK'
  | 'FOLLOW_CAMPAIGN';

export interface MongoAnalyticsEvent extends MongoBase {
  eventName: AnalyticsEventName;
  /** ID từ PostgreSQL users.id — null nếu anonymous */
  userId?: string;
  /** ID từ PostgreSQL campaigns.id */
  campaignId?: string;
  sessionId?: string;
  path?: string;
  /** Extra data tùy theo loại event */
  payload?: Record<string, unknown>;
  device?: {
    browser?: string;
    os?: string;
    type?: 'DESKTOP' | 'MOBILE' | 'TABLET';
  };
  /** TTL — tự động xóa sau 180 ngày */
}

// ─────────────────────────────────────────────────────────────────────────────
// CAMPAIGN CONTENT — Nội dung phong phú / draft
// ─────────────────────────────────────────────────────────────────────────────

export type ContentSectionType =
  | 'TEXT'
  | 'IMAGE_GALLERY'
  | 'VIDEO'
  | 'FAQ'
  | 'TIMELINE'
  | 'RISK_INFO'
  | 'CUSTOM';

export interface ContentSection {
  type: ContentSectionType;
  title?: string;
  /** JSON linh hoạt tùy theo loại section */
  content: unknown;
  order: number;
}

export interface MongoCampaignContent extends MongoBase {
  /** ID từ PostgreSQL campaigns.id */
  campaignId: string;
  /** ID từ PostgreSQL users.id — người lưu cuối */
  lastSavedBy: string;
  /** Phiên bản (tăng dần mỗi khi publish) */
  version: number;
  sections: ContentSection[];
  mediaGallery: {
    url: string;
    type: 'IMAGE' | 'VIDEO';
    caption?: string;
    order: number;
  }[];
  customFields: Record<string, unknown>;
  isDraft: boolean;
  publishedAt?: Date;
  /** Lịch sử phiên bản trước (chỉ lưu tối đa 5 bản) */
  versionHistory?: {
    version: number;
    savedAt: Date;
    savedBy: string;
    sections: ContentSection[];
  }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// USER METADATA — Extended profile linh hoạt
// ─────────────────────────────────────────────────────────────────────────────

export interface MongoUserMetadata extends MongoBase {
  /** ID từ PostgreSQL users.id */
  userId: string;
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    newsletterSubscribed: boolean;
    language: string;
    timezone: string;
  };
  onboarding: {
    completedSteps: string[];
    isCompleted: boolean;
    completedAt?: Date;
  };
  stats: {
    /** Denormalized counters — cập nhật async */
    totalDonations: number;
    campaignsFollowed: number;
    commentsPosted: number;
    lastActiveAt?: Date;
  };
  tags: string[]; // User interest tags
  customData?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORT METADATA — Metadata linh hoạt cho report
// ─────────────────────────────────────────────────────────────────────────────

export interface MongoReportMeta extends MongoBase {
  /** ID từ PostgreSQL campaign_reports.id */
  pgReportId: string;
  /** ID từ PostgreSQL campaigns.id */
  campaignId: string;
  /** ID từ PostgreSQL users.id — người báo cáo */
  userId: string;
  /** Bằng chứng: ảnh chụp màn hình, link... */
  evidence: {
    type: 'SCREENSHOT' | 'URL' | 'TEXT';
    value: string;
    description?: string;
  }[];
  adminNotes: {
    note: string;
    adminId: string;
    createdAt: Date;
  }[];
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}
