import { BaseMongoService } from './base-mongo.service';
import { Document } from 'mongodb';
import type { AnalyticsEventName, MongoAnalyticsEvent } from '@/types/mongodb.types';

type TrackableAnalyticsEventName = AnalyticsEventName | 'PAGE_LEAVE' | 'CTA_CLICK';

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
    await collection.createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 180 * 24 * 60 * 60, name: 'ttl_180_days' },
    );
  }

  public async getCampaignStats(campaignId: string) {
    const collection = await this.getCollection<MongoAnalyticsEvent & Document>();
    if (!collection) return null;

    const stats = await collection.aggregate([
      { $match: { campaignId } },
      { $group: { _id: '$eventName', count: { $sum: 1 } } }
    ]).toArray();

    return stats;
  }

  public async getBehaviorStats(fromDate: Date, limit = 15) {
    const collection = await this.getCollection<MongoAnalyticsEvent & Document>();
    if (!collection) {
      return {
        enabled: this.isFeatureEnabled(),
        topPages: [],
        longestDwell: [],
        topCtas: [],
        totals: { pageViews: 0, pageLeaves: 0, ctaClicks: 0 },
      };
    }

    const matchSince = { createdAt: { $gte: fromDate } };
    const [topPages, longestDwell, topCtas, totals] = await Promise.all([
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
    ]);

    const countByName = Object.fromEntries(totals.map((row) => [row._id, row.count]));
    return {
      enabled: true,
      topPages,
      longestDwell,
      topCtas,
      totals: {
        pageViews: Number(countByName.PAGE_VIEW || 0),
        pageLeaves: Number(countByName.PAGE_LEAVE || 0),
        ctaClicks: Number(countByName.CTA_CLICK || 0),
      },
    };
  }
}

export const analyticsService = new AnalyticsService();
