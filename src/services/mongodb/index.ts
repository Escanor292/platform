/**
 * MongoDB Services — DEPRECATED.
 * Đã migrate toàn bộ sang PostgreSQL/Prisma.
 * File này re-export từ services/pg để không phá import cũ.
 * TODO: Cập nhật caller sang import trực tiếp từ @/services/pg
 */

export { notificationService } from '@/services/pg/notification.service';
export { activityLogService } from '@/services/pg/activity-log.service';
export { analyticsService } from '@/services/pg/analytics.service';
export { commentService } from '@/services/pg/comment.service';
export { userMetadataService } from '@/services/pg/user-metadata.service';
export { campaignUpdateService } from '@/services/pg/campaign-update.service';
export { campaignContentService } from '@/services/pg/campaign-content.service';

// auditLogMongoService — dừng dual-write, dùng Prisma audit_logs trực tiếp
export const auditLogMongoService = {
    log: (_data: unknown) => undefined,
    getEntityLogs: async () => [] as any[],
    getUserLogs: async () => [] as any[],
    getLogsByAction: async () => [] as any[],
    aggregateByAction: async () => [] as any[],
    getByPgId: async () => null,
    ensureIndexes: async () => undefined,
};

export type * from '@/types/mongodb.types';
