import { prisma } from '@/lib/prisma';

class CampaignContentService {
    public async saveContent(data: {
        campaignId: string;
        lastSavedBy: string;
        version?: number;
        sections?: unknown[];
        mediaGallery?: unknown[];
        customFields?: Record<string, unknown>;
        isDraft: boolean;
    }) {
        return prisma.campaign_contents.upsert({
            where: {
                campaignId_isDraft: { campaignId: data.campaignId, isDraft: data.isDraft },
            },
            create: {
                campaignId: data.campaignId,
                lastSavedBy: data.lastSavedBy,
                version: data.version ?? 1,
                sections: (data.sections ?? []) as any,
                mediaGallery: (data.mediaGallery ?? []) as any,
                customFields: (data.customFields ?? {}) as any,
                isDraft: data.isDraft,
            },
            update: {
                lastSavedBy: data.lastSavedBy,
                sections: (data.sections ?? []) as any,
                mediaGallery: (data.mediaGallery ?? []) as any,
                customFields: (data.customFields ?? {}) as any,
            },
        });
    }

    public async getContent(campaignId: string, isDraft = false) {
        return prisma.campaign_contents.findUnique({
            where: { campaignId_isDraft: { campaignId, isDraft } },
        });
    }

    // ensureIndexes no-op
    public async ensureIndexes(): Promise<void> { }
}

export const campaignContentService = new CampaignContentService();
