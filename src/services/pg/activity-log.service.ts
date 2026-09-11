import { prisma } from '@/lib/prisma';

export type ActivityAction =
    | 'USER_LOGIN' | 'USER_LOGOUT' | 'USER_REGISTER'
    | 'CAMPAIGN_VIEW' | 'CAMPAIGN_SEARCH' | 'CAMPAIGN_FOLLOW'
    | 'CAMPAIGN_UNFOLLOW' | 'CAMPAIGN_SHARE'
    | 'DONATION_MODAL_OPEN' | 'DONATION_SUBMITTED'
    | 'DONATION_PAYMENT_REDIRECT' | 'DONATION_PAYMENT_CANCEL'
    | 'COMMENT_CREATE' | 'COMMENT_EDIT' | 'COMMENT_DELETE'
    | 'UPDATE_VIEW'
    | 'ADMIN_CAMPAIGN_APPROVE' | 'ADMIN_CAMPAIGN_REJECT' | 'ADMIN_USER_BAN';

class ActivityLogService {
    public log(data: {
        userId?: string;
        action: ActivityAction | string;
        entityType: string;
        entityId: string;
        details?: Record<string, unknown>;
        metadata?: {
            ipAddress?: string;
            userAgent?: string;
            sessionId?: string;
            path?: string;
        };
    }): void {
        Promise.resolve().then(async () => {
            try {
                await prisma.activity_logs_v2.create({ data: data as any });
            } catch (err) {
                console.warn('[ACTIVITY_LOG] insert failed', err);
            }
        });
    }

    public async getLogs(
        filter: { userId?: string; entityType?: string; entityId?: string },
        limit = 50
    ) {
        return prisma.activity_logs_v2.findMany({
            where: filter as any,
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    public async getUserLogs(userId: string, limit = 50) {
        return this.getLogs({ userId }, limit);
    }

    public async getEntityLogs(entityType: string, entityId: string, limit = 50) {
        return this.getLogs({ entityType, entityId }, limit);
    }

    public async aggregateByAction(fromDate: Date, toDate: Date) {
        return prisma.activity_logs_v2.groupBy({
            by: ['action'],
            where: { createdAt: { gte: fromDate, lte: toDate } },
            _count: { action: true },
            orderBy: { _count: { action: 'desc' } },
        });
    }

    public async getCampaignViewCount(campaignId: string): Promise<number> {
        return prisma.activity_logs_v2.count({
            where: { entityType: 'CAMPAIGN', entityId: campaignId, action: 'CAMPAIGN_VIEW' },
        });
    }
}

export const activityLogService = new ActivityLogService();
