/**
 * MongoDB Services — Barrel Export
 *
 * Import từ đây thay vì import trực tiếp từng file:
 * import { commentService, notificationService } from '@/services/mongodb';
 */

export { activityLogService }     from './activity-log.service';
export { analyticsService }       from './analytics.service';
export { auditLogMongoService }   from './audit-log.service';
export { campaignContentService } from './campaign-content.service';
export { campaignUpdateService }  from './campaign-update.service';
export { commentService }         from './comment.service';
export { notificationService }    from './notification.service';
export { userMetadataService }    from './user-metadata.service';

// Re-export types từ mongodb.types
export type * from '@/types/mongodb.types';
