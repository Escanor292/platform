import { BaseMongoService } from './base-mongo.service';
import { Document } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import type { AnalyticsEventName, MongoAnalyticsEvent } from '@/types/mongodb.types';

type TrackableAnalyticsEventName = AnalyticsEventName | 'PAGE_LEAVE' | 'CTA_CLICK';

export const ANALYTICS_TTL_OPTIONS = [30, 90, 180, 365] as const;
export type AnalyticsTtlDays = (typeof ANALYTICS_TTL_OPTIONS)[number];
export const DEFAULT_ANALYTICS_TTL_DAYS: AnalyticsTtlDays = 180;
const TTL_INDEX_NAME = 'ttl_createdAt';
const SETTINGS_ID = 'behavior';
const BEHAVIOR_EVENTS = ['PAGE_VIEW', 'PAGE_LEAVE', 'CTA_CLICK'] as const;

type DailyPoint = {
  date: string;
  pageViews: number;
  pageLeaves: number;
  ctaClicks: number;
};

function isTtlDays(value: number): value is AnalyticsTtlDays {
  return (ANALYTICS_TTL_OPTIONS as readonly number[]).includes(value);
}

function vnDayKey(date: Date) {
  return new Date(date.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

class AnalyticsService extends BaseMongoService {
  protected collectionName = 'analytics_events';
  protected featureFlag = 'ENABLE_MONGO_ANALYTICS';

  public isFeatureEnabled(): boolean {
    return this.isEnabled();
  }

  public track(data: Omit<MongoAnalyticsEvent, '_id' | 'createdAt' | 'updatedAt' | 'eventName'> & { eventName: TrackableAnalyticsEventName }): void {
    this.runAsync(async () => {
      const collection = await this.getCollection<MongoAnalyticsEvent & Document>();
      if (!collection) return;

      const now = new Date();
      await collection.insertOne({
        ...data,
        createdAt: now,
        updatedAt: now,
      } as MongoAnalyticsEvent & Document);
    });
  }

  public async ensureIndexes(): Promise<void> {
    const collection = await this.getCollection<MongoAnalyticsEvent & Document>();
    if (!collection) return;

    await collection.createIndex({ eventName: 1 });
    await collection.createIndex({ userId: 1 });
    await collection.createIndex({ campaignId: 1 });
    await collection.createIndex({ path: 1, eventName: 1 });
    await collection.createIndex({ createdAt: -1 });
    const ttlDays = await this.getTtlDays();
    await this.applyTtlIndex(ttlDays);
  }

  public async getCampaignStats(campaignId: string) {
    const collection = await this.getCollection<MongoAnalyticsEvent & Document>();
    if (!collection) return null;

    return collection.aggregate([
      { $match: { campaignId } },
      { $group: { _id: '$eventName', count: { $sum: 1 } } },
    ]).toArray();
  }

  public async getTtlDays(): Promise<AnalyticsTtlDays> {
    const settings = await this.getSettingsCollection();
    if (!settings) return DEFAULT_ANALYTICS_TTL_DAYS;
    const doc = await settings.findOne({ _id: SETTINGS_ID as never });
    const ttlDays = Number((doc as { ttlDays?: number } | null)?.ttlDays);
    return isTtlDays(ttlDays) ? ttlDays : DEFAULT_ANALYTICS_TTL_DAYS;
  }

  public async setTtlDays(ttlDays: number, updatedBy?: string) {
    if (!isTtlDays(ttlDays)) {
      throw new Error('TTL khong hop le.');
    }
    const settings = await this.getSettingsCollection();
    if (!settings) return { enabled: false, ttlDays: DEFAULT_ANALYTICS_TTL_DAYS };

    const now = new Date();
    await settings.updateOne(
      { _id: SETTINGS_ID as never },
      {
        $set: {
          ttlDays,
          updatedAt: now,
          ...(updatedBy ? { updatedBy } : {}),
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );
    await this.applyTtlIndex(ttlDays);
    return { enabled: true, ttlDays };
  }

  public async purgeEvents(options: {
    all?: boolean;
    beforeDate?: Date;
    eventNames?: string[];
  }) {
    const collection = await this.getCollection<MongoAnalyticsEvent & Document>();
    if (!collection) return { enabled: false, deletedCount: 0 };

    const filter: Record<string, unknown> = {};
    if (!options.all) {
      if (!options.beforeDate) return { enabled: true, deletedCount: 0 };
      filter.createdAt = { $lt: options.beforeDate };
    }
    if (options.eventNames?.length) {
      const allowed = options.eventNames.filter((name) =>
        (BEHAVIOR_EVENTS as readonly string[]).includes(name),
      );
      if (allowed.length) filter.eventName = { $in: allowed };
    } else {
      filter.eventName = { $in: [...BEHAVIOR_EVENTS] };
    }

    const result = await collection.deleteMany(filter);
    return { enabled: true, deletedCount: result.deletedCount || 0 };
  }

  public async getBehaviorStats(fromDate: Date, limit = 15) {
    const collection = await this.getCollection<MongoAnalyticsEvent & Document>();
    const ttlDays = await this.getTtlDays();
    if (!collection) {
      return {
        enabled: this.isFeatureEnabled(),
        ttlDays,
        topPages: [],
        longestDwell: [],
        topCtas: [],
        daily: [] as DailyPoint[],
        totals: { pageViews: 0, pageLeaves: 0, ctaClicks: 0 },
      };
    }

    const matchSince = { createdAt: { $gte: fromDate } };
    const [topPages, longestDwell, topCtas, totals, dailyRows] = await Promise.all([
      collection.aggregate([
        { $match: { ...matchSince, eventName: 'PAGE_VIEW' } },
        { $group: { _id: '$path', views: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: limit },
        { $project: { _id: 0, path: '$_id', views: 1 } },
      ]).toArray(),
      collection.aggregate([
        { $match: { ...matchSince, eventName: 'PAGE_LEAVE', 'payload.durationMs': { $gte: 1000 } } },
        {
          $group: {
            _id: '$path',
            visits: { $sum: 1 },
            totalMs: { $sum: '$payload.durationMs' },
            avgMs: { $avg: '$payload.durationMs' },
          },
        },
        { $sort: { avgMs: -1 } },
        { $limit: limit },
        {
          $project: {
            _id: 0,
            path: '$_id',
            visits: 1,
            totalMs: 1,
            avgMs: { $round: ['$avgMs', 0] },
          },
        },
      ]).toArray(),
      collection.aggregate([
        { $match: { ...matchSince, eventName: 'CTA_CLICK' } },
        {
          $group: {
            _id: { ctaId: '$payload.ctaId', label: '$payload.label', path: '$path' },
            clicks: { $sum: 1 },
          },
        },
        { $sort: { clicks: -1 } },
        { $limit: limit },
        {
          $project: {
            _id: 0,
            ctaId: '$_id.ctaId',
            label: '$_id.label',
            path: '$_id.path',
            clicks: 1,
          },
        },
      ]).toArray(),
      collection.aggregate([
        { $match: matchSince },
        { $group: { _id: '$eventName', count: { $sum: 1 } } },
      ]).toArray(),
      collection.aggregate([
        { $match: { ...matchSince, eventName: { $in: [...BEHAVIOR_EVENTS] } } },
        {
          $group: {
            _id: {
              day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Ho_Chi_Minh' } },
              eventName: '$eventName',
            },
            count: { $sum: 1 },
          },
        },
      ]).toArray(),
    ]);

    const countByName = Object.fromEntries(totals.map((row) => [row._id, row.count]));
    return {
      enabled: true,
      ttlDays,
      topPages,
      longestDwell,
      topCtas,
      daily: this.fillDailySeries(fromDate, dailyRows as Array<{ _id: { day: string; eventName: string }; count: number }>),
      totals: {
        pageViews: Number(countByName.PAGE_VIEW || 0),
        pageLeaves: Number(countByName.PAGE_LEAVE || 0),
        ctaClicks: Number(countByName.CTA_CLICK || 0),
      },
    };
  }

  private fillDailySeries(
    fromDate: Date,
    rows: Array<{ _id: { day: string; eventName: string }; count: number }>,
  ): DailyPoint[] {
    const byDay: Record<string, Omit<DailyPoint, 'date'>> = {};
    for (const row of rows) {
      const day = row._id?.day;
      if (!day) continue;
      if (!byDay[day]) byDay[day] = { pageViews: 0, pageLeaves: 0, ctaClicks: 0 };
      if (row._id.eventName === 'PAGE_VIEW') byDay[day].pageViews = row.count;
      if (row._id.eventName === 'PAGE_LEAVE') byDay[day].pageLeaves = row.count;
      if (row._id.eventName === 'CTA_CLICK') byDay[day].ctaClicks = row.count;
    }

    const series: DailyPoint[] = [];
    const cursor = new Date(fromDate.getTime() + 7 * 60 * 60 * 1000);
    cursor.setUTCHours(0, 0, 0, 0);
    const endKey = vnDayKey(new Date());
    for (let i = 0; i < 120; i += 1) {
      const date = cursor.toISOString().slice(0, 10);
      series.push({ date, ...(byDay[date] || { pageViews: 0, pageLeaves: 0, ctaClicks: 0 }) });
      if (date >= endKey) break;
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return series;
  }

  private async applyTtlIndex(ttlDays: AnalyticsTtlDays) {
    const collection = await this.getCollection<MongoAnalyticsEvent & Document>();
    if (!collection) return;
    const indexes = await collection.indexes();
    for (const index of indexes) {
      const name = String(index.name || '');
      const isTtl =
        name === TTL_INDEX_NAME ||
        name === 'ttl_180_days' ||
        (typeof index.expireAfterSeconds === 'number' && Boolean(index.key?.createdAt));
      if (isTtl && name !== '_id_') {
        await collection.dropIndex(name).catch(() => undefined);
      }
    }
    await collection.createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: ttlDays * 24 * 60 * 60, name: TTL_INDEX_NAME },
    );
  }

  private async getSettingsCollection() {
    if (!this.isEnabled()) return null;
    try {
      const db = await getDb();
      return db.collection('analytics_settings');
    } catch (error) {
      console.warn('[MONGODB] analytics_settings unavailable', (error as Error)?.message || error);
      return null;
    }
  }
}

export const analyticsService = new AnalyticsService();
