import { prisma } from '@/lib/prisma';

export const ANALYTICS_TTL_OPTIONS = [30, 90, 180, 365] as const;
export type AnalyticsTtlDays = (typeof ANALYTICS_TTL_OPTIONS)[number];
export const DEFAULT_ANALYTICS_TTL_DAYS: AnalyticsTtlDays = 180;

function isTtlDays(v: number): v is AnalyticsTtlDays {
    return (ANALYTICS_TTL_OPTIONS as readonly number[]).includes(v);
}

type DailyPoint = {
    date: string;
    pageViews: number;
    pageLeaves: number;
    ctaClicks: number;
};

class AnalyticsService {
    public isFeatureEnabled(): boolean {
        return true;
    }

    public track(data: {
        eventName: string;
        userId?: string;
        campaignId?: string;
        sessionId?: string;
        path?: string;
        payload?: Record<string, unknown>;
        device?: { browser?: string; os?: string; type?: 'DESKTOP' | 'MOBILE' | 'TABLET' };
    }): void {
        Promise.resolve().then(async () => {
            try {
                await prisma.analytics_events.create({ data: data as any });
            } catch (err) {
                console.warn('[ANALYTICS] track failed', err);
            }
        });
    }

    public async getCampaignStats(campaignId: string) {
        const rows = await prisma.analytics_events.groupBy({
            by: ['eventName'],
            where: { campaignId },
            _count: { eventName: true },
        });
        return rows.map((r) => ({ _id: r.eventName, count: r._count.eventName }));
    }

    public async getTtlDays(): Promise<AnalyticsTtlDays> {
        const s = await prisma.analytics_settings.findUnique({ where: { id: 'behavior' } });
        const v = s?.ttlDays ?? DEFAULT_ANALYTICS_TTL_DAYS;
        return isTtlDays(v) ? v : DEFAULT_ANALYTICS_TTL_DAYS;
    }

    public async setTtlDays(ttlDays: number, updatedBy?: string) {
        if (!isTtlDays(ttlDays)) throw new Error('TTL không hợp lệ.');
        await prisma.analytics_settings.upsert({
            where: { id: 'behavior' },
            create: { id: 'behavior', ttlDays, updatedBy: updatedBy ?? null },
            update: { ttlDays, updatedBy: updatedBy ?? null },
        });
        return { enabled: true, ttlDays };
    }

    public async purgeEvents(options: {
        all?: boolean;
        beforeDate?: Date;
        eventNames?: string[];
    }) {
        const BEHAVIOR = ['PAGE_VIEW', 'PAGE_LEAVE', 'CTA_CLICK'];
        const where: any = {};
        if (!options.all && options.beforeDate) {
            where.createdAt = { lt: options.beforeDate };
        }
        const names = options.eventNames?.filter((e) => BEHAVIOR.includes(e));
        where.eventName = { in: names?.length ? names : BEHAVIOR };

        const { count } = await prisma.analytics_events.deleteMany({ where });
        return { enabled: true, deletedCount: count };
    }

    public async getBehaviorStats(fromDate: Date, limit = 15) {
        const ttlDays = await this.getTtlDays();
        const BEHAVIOR = ['PAGE_VIEW', 'PAGE_LEAVE', 'CTA_CLICK'] as const;

        const [totals, pageViewRows, dailyRaw] = await Promise.all([
            prisma.analytics_events.groupBy({
                by: ['eventName'],
                where: { createdAt: { gte: fromDate }, eventName: { in: [...BEHAVIOR] } },
                _count: { eventName: true },
            }),
            prisma.analytics_events.groupBy({
                by: ['path'],
                where: { createdAt: { gte: fromDate }, eventName: 'PAGE_VIEW' },
                _count: { path: true },
                orderBy: { _count: { path: 'desc' } },
                take: limit,
            }),
            // daily: fetch raw and bucket in JS (Prisma GroupBy không hỗ trợ datepart trực tiếp)
            prisma.analytics_events.findMany({
                where: { createdAt: { gte: fromDate }, eventName: { in: [...BEHAVIOR] } },
                select: { eventName: true, createdAt: true },
                orderBy: { createdAt: 'asc' },
            }),
        ]);

        const countByName = Object.fromEntries(
            totals.map((r) => [r.eventName, r._count.eventName])
        );

        const topPages = pageViewRows
            .filter((r) => r.path)
            .map((r) => ({ path: r.path!, views: r._count.path }));

        // bucket daily in JS
        const byDay: Record<string, Omit<DailyPoint, 'date'>> = {};
        for (const e of dailyRaw) {
            const day = new Date(e.createdAt.getTime() + 7 * 3600000)
                .toISOString()
                .slice(0, 10);
            if (!byDay[day]) byDay[day] = { pageViews: 0, pageLeaves: 0, ctaClicks: 0 };
            if (e.eventName === 'PAGE_VIEW') byDay[day].pageViews++;
            if (e.eventName === 'PAGE_LEAVE') byDay[day].pageLeaves++;
            if (e.eventName === 'CTA_CLICK') byDay[day].ctaClicks++;
        }
        const daily: DailyPoint[] = Object.entries(byDay)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, counts]) => ({ date, ...counts }));

        return {
            enabled: true,
            ttlDays,
            topPages,
            longestDwell: [],
            topCtas: [],
            daily,
            totals: {
                pageViews: countByName.PAGE_VIEW || 0,
                pageLeaves: countByName.PAGE_LEAVE || 0,
                ctaClicks: countByName.CTA_CLICK || 0,
            },
        };
    }
}

export const analyticsService = new AnalyticsService();
