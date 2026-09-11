/**
 * PostgreSQL/Prisma services — barrel export.
 * Dùng thay cho @/services/mongodb khi refactor caller.
 */

export { notificationService } from './notification.service';
export type { NotificationType, NotificationPayload } from './notification.service';

export { activityLogService } from './activity-log.service';
export type { ActivityAction } from './activity-log.service';

export { analyticsService } from './analytics.service';
export type { AnalyticsTtlDays } from './analytics.service';

export { commentService } from './comment.service';
export { userMetadataService } from './user-metadata.service';
export { campaignUpdateService } from './campaign-update.service';
export { campaignContentService } from './campaign-content.service';

export * from './blog.service';
export * from './chat.service';
