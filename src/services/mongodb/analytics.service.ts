import { BaseMongoService } from './base-mongo.service';
import { Document } from 'mongodb';
import type { MongoAnalyticsEvent } from '@/types/mongodb.types';

class AnalyticsService extends BaseMongoService {
  protected collectionName = 'analytics_events';
  protected featureFlag = 'ENABLE_MONGO_ANALYTICS';

  /**
   * Track an event (non-blocking)
   */
  public track(data: Omit<MongoAnalyticsEvent, '_id' | 'createdAt' | 'updatedAt'>): void {
    this.runAsync(async () => {
      const collection = await this.getCollection<MongoAnalyticsEvent & Document>();
      if (!collection) return;

      await collection.insertOne({
        ...data,
        createdAt: new Date(),
      } as MongoAnalyticsEvent & Document);
    });
  }

  /**
   * Ensure indexes for analytics
   */
  public async ensureIndexes(): Promise<void> {
    const collection = await this.getCollection<MongoAnalyticsEvent & Document>();
    if (!collection) return;

    await collection.createIndex({ eventName: 1 });
    await collection.createIndex({ userId: 1 });
    await collection.createIndex({ campaignId: 1 });
    await collection.createIndex({ createdAt: -1 });
  }

  /**
   * Get event counts for a specific campaign (blocking)
   */
  public async getCampaignStats(campaignId: string) {
    const collection = await this.getCollection<MongoAnalyticsEvent & Document>();
    if (!collection) return null;

    const stats = await collection.aggregate([
      { $match: { campaignId } },
      { $group: { _id: '$eventName', count: { $sum: 1 } } }
    ]).toArray();

    return stats;
  }
}

export const analyticsService = new AnalyticsService();
