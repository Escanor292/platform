import { prisma } from '@/lib/prisma';

class UserMetadataService {
    public async upsert(
        userId: string,
        data: Partial<{
            preferences: Record<string, unknown>;
            onboarding: Record<string, unknown>;
            stats: Record<string, unknown>;
            tags: string[];
            customData: Record<string, unknown>;
        }>
    ) {
        return prisma.user_metadata.upsert({
            where: { userId },
            create: { userId, ...(data as any) },
            update: data as any,
        });
    }

    public setPreferences(userId: string, prefs: Record<string, unknown>): void {
        this.upsert(userId, { preferences: prefs }).catch((e) =>
            console.warn('[USER_META] setPreferences failed', e)
        );
    }

    public completeOnboardingStep(userId: string, step: string): void {
        prisma.user_metadata
            .findUnique({ where: { userId }, select: { onboarding: true } })
            .then(async (meta) => {
                const ob: any = (meta?.onboarding as any) ?? {
                    completedSteps: [],
                    isCompleted: false,
                };
                if (!ob.completedSteps?.includes(step)) {
                    ob.completedSteps = [...(ob.completedSteps ?? []), step];
                }
                await prisma.user_metadata.upsert({
                    where: { userId },
                    create: { userId, onboarding: ob },
                    update: { onboarding: ob },
                });
            })
            .catch((e) => console.warn('[USER_META] onboarding failed', e));
    }

    public incrementStat(
        userId: string,
        field: 'totalDonations' | 'campaignsFollowed' | 'commentsPosted',
        amount = 1
    ): void {
        prisma.user_metadata
            .findUnique({ where: { userId }, select: { stats: true } })
            .then(async (meta) => {
                const stats: any = { ...((meta?.stats as any) ?? {}) };
                stats[field] = (stats[field] || 0) + amount;
                stats.lastActiveAt = new Date().toISOString();
                await prisma.user_metadata.upsert({
                    where: { userId },
                    create: { userId, stats },
                    update: { stats },
                });
            })
            .catch((e) => console.warn('[USER_META] incrementStat failed', e));
    }

    public async getByUserId(userId: string) {
        return prisma.user_metadata.findUnique({ where: { userId } });
    }

    public async getPreferences(userId: string) {
        const meta = await this.getByUserId(userId);
        return (meta?.preferences as any) ?? null;
    }

    // ensureIndexes no-op (Prisma manages)
    public async ensureIndexes(): Promise<void> { }
}

export const userMetadataService = new UserMetadataService();
