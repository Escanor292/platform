import { prisma } from '@/lib/prisma';
import { normalizeNotificationSettings, notificationPreferenceKey } from '@/lib/profile-settings';

export type NotificationType =
    | 'PLEDGE_RECEIVED'
    | 'PAYMENT_SUCCESS'
    | 'PAYMENT_FAILED'
    | 'CAMPAIGN_APPROVED'
    | 'CAMPAIGN_REJECTED'
    | 'CAMPAIGN_SUBMITTED'
    | 'BLOG_APPROVED'
    | 'BLOG_REJECTED'
    | 'BLOG_SUBMITTED'
    | 'CAMPAIGN_FOLLOWED'
    | 'CAMPAIGN_UPDATE'
    | 'COMMENT_RECEIVED'
    | 'COMMENT_REPLY'
    | 'COMMENT_MENTION'
    | 'CAMPAIGN_ENDING'
    | 'REFUND_PROCESSED'
    | 'KYC_APPROVED'
    | 'KYC_REJECTED'
    | 'CONTENT_HIDDEN'
    | 'BROKEN_LINK'
    | 'SYSTEM';

export interface NotificationPayload {
    href?: string;
    campaignId?: string;
    pledgeId?: string;
    commentId?: string;
    amount?: number;
    extra?: Record<string, unknown>;
}

class NotificationService {
    public send(data: {
        userId: string;
        type: NotificationType;
        title: string;
        message: string;
        payload?: NotificationPayload;
    }): void {
        Promise.resolve().then(async () => {
            try {
                const recipient = await prisma.users.findUnique({
                    where: { id: data.userId },
                    select: { notificationSettings: true },
                });
                const settings = normalizeNotificationSettings(recipient?.notificationSettings);
                if (!settings[notificationPreferenceKey(data.type)]) return;

                await prisma.notifications.create({
                    data: {
                        userId: data.userId,
                        type: data.type,
                        title: data.title,
                        message: data.message,
                        payload: (data.payload ?? {}) as any,
                    },
                });
            } catch (err) {
                console.warn('[NOTIFICATION] send failed', err);
            }
        });
    }

    public sendBulk(
        userIds: string[],
        data: Omit<Parameters<NotificationService['send']>[0], 'userId'>
    ): void {
        if (userIds.length === 0) return;
        Promise.resolve().then(async () => {
            try {
                const recipients = await prisma.users.findMany({
                    where: { id: { in: userIds } },
                    select: { id: true, notificationSettings: true },
                });
                const preference = notificationPreferenceKey(data.type);
                const allowedIds = recipients
                    .filter((r) => normalizeNotificationSettings(r.notificationSettings)[preference])
                    .map((r) => r.id);
                if (allowedIds.length === 0) return;
                await prisma.notifications.createMany({
                    data: allowedIds.map((userId) => ({
                        userId,
                        type: data.type,
                        title: data.title,
                        message: data.message,
                        payload: (data.payload ?? {}) as any,
                    })),
                });
            } catch (err) {
                console.warn('[NOTIFICATION] sendBulk failed', err);
            }
        });
    }

    public async markAsRead(notificationId: string, userId: string): Promise<void> {
        await prisma.notifications.updateMany({
            where: { id: notificationId, userId },
            data: { isRead: true, readAt: new Date() },
        });
    }

    public async markAllAsRead(userId: string): Promise<void> {
        await prisma.notifications.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true, readAt: new Date() },
        });
    }

    public async delete(notificationId: string, userId: string): Promise<void> {
        await prisma.notifications.deleteMany({ where: { id: notificationId, userId } });
    }

    public async getForUser(userId: string, limit = 20, skip = 0) {
        return prisma.notifications.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });
    }

    public async countUnread(userId: string): Promise<number> {
        return prisma.notifications.count({ where: { userId, isRead: false } });
    }
}

export const notificationService = new NotificationService();
