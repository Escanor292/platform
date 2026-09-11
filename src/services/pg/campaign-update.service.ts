import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

class CampaignUpdateService {
    public async createUpdate(data: {
        campaignId: string;
        creatorId?: string;
        title: string;
        content: string;
        type?: string;
        status?: string;
        isPinned?: boolean;
        tags?: string[];
        media?: Array<{ url: string; type: string; caption?: string; order: number }>;
    }) {
        return prisma.campaign_updates.create({
            data: {
                id: randomUUID(),
                campaignId: data.campaignId,
                title: data.title,
                content: data.content,
                isPinned: data.isPinned ?? false,
                tags: data.tags ?? [],
                updatedAt: new Date(),
            },
        });
    }

    public async updateById(
        updateId: string,
        data: Partial<{
            title: string;
            content: string;
            isPinned: boolean;
            tags: string[];
            imageUrl: string;
        }>
    ) {
        return prisma.campaign_updates.update({
            where: { id: updateId },
            data: { ...data, updatedAt: new Date() },
        });
    }

    /** viewCount không có trong schema campaign_updates — no-op */
    public incrementViewCount(_updateId: string): void { }

    public async deleteById(updateId: string, _creatorId?: string) {
        return prisma.campaign_updates.delete({ where: { id: updateId } });
    }

    public async getPublishedUpdates(campaignId: string, limit = 20, skip = 0) {
        return prisma.campaign_updates.findMany({
            where: { campaignId },
            orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
            skip,
            take: limit,
        });
    }

    public async getById(updateId: string) {
        return prisma.campaign_updates.findUnique({ where: { id: updateId } });
    }

    public async countByCampaign(campaignId: string) {
        return prisma.campaign_updates.count({ where: { campaignId } });
    }
}

export const campaignUpdateService = new CampaignUpdateService();
