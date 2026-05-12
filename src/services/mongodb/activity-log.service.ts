import { BaseMongoService } from './base-mongo.service';
import { Document } from 'mongodb';
import type { MongoActivityLog, ActivityAction } from '@/types/mongodb.types';

class ActivityLogService extends BaseMongoService {
  protected collectionName = 'activity_logs';
  protected featureFlag = 'ENABLE_MONGO_LOGS';

  // ──────────────────────────────────────────────
  // Write Methods
  // ──────────────────────────────────────────────

  /** Ghi log hành động (non-blocking, fire-and-forget) */
  public log(data: Omit<MongoActivityLog, '_id' | 'createdAt' | 'updatedAt'>): void {
    this.runAsync(async () => {
      const collection = await this.getCollection<MongoActivityLog & Document>();
      if (!collection) return;

      const now = new Date();
      await collection.insertOne({
        ...data,
        createdAt: now,
        updatedAt: now,
      } as MongoActivityLog & Document);
    });
  }

  // ──────────────────────────────────────────────
  // Read Methods
  // ──────────────────────────────────────────────

  /** Lấy logs với filter tự do */
  public async getLogs(filter: Partial<MongoActivityLog>, limit = 50) {
    const collection = await this.getCollection<MongoActivityLog & Document>();
    if (!collection) return [];

    return collection
      .find(filter as any)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }

  /** Lấy logs theo user */
  public async getUserLogs(userId: string, limit = 50) {
    return this.getLogs({ userId }, limit);
  }

  /** Lấy logs theo entity */
  public async getEntityLogs(entityType: string, entityId: string, limit = 50) {
    return this.getLogs({ entityType, entityId } as any, limit);
  }

  /** Thống kê actions theo loại trong khoảng thời gian */
  public async aggregateByAction(fromDate: Date, toDate: Date) {
    const collection = await this.getCollection<MongoActivityLog & Document>();
    if (!collection) return [];

    return collection.aggregate([
      { $match: { createdAt: { $gte: fromDate, $lte: toDate } } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).toArray();
  }

  /** Đếm page views của campaign */
  public async getCampaignViewCount(campaignId: string) {
    const collection = await this.getCollection<MongoActivityLog & Document>();
    if (!collection) return 0;

    return collection.countDocuments({ entityType: 'CAMPAIGN', entityId: campaignId, action: 'CAMPAIGN_VIEW' });
  }

  // ──────────────────────────────────────────────
  // Indexes — TTL 90 ngày
  // ──────────────────────────────────────────────

  public async ensureIndexes(): Promise<void> {
    const collection = await this.getCollection<MongoActivityLog & Document>();
    if (!collection) return;

    await collection.createIndex({ userId: 1 });
    await collection.createIndex({ action: 1 });
    await collection.createIndex({ entityType: 1, entityId: 1 });
    await collection.createIndex({ createdAt: -1 });
    // TTL: tự động xóa sau 90 ngày
    await collection.createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 90 * 24 * 60 * 60, name: 'ttl_90_days' }
    );
  }
}

export const activityLogService = new ActivityLogService();
