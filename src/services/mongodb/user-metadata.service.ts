import { BaseMongoService } from './base-mongo.service';
import { Document, ObjectId } from 'mongodb';
import type { MongoUserMetadata } from '@/types/mongodb.types';

/**
 * User Metadata Service
 *
 * Lưu các thông tin mở rộng của user KHÔNG liên quan đến tài chính:
 * - Preferences (cài đặt thông báo, ngôn ngữ...)
 * - Onboarding progress
 * - Denormalized stats (không dùng cho billing)
 * - Interest tags
 *
 * Thông tin tài chính (số dư, lịch sử giao dịch) vẫn ở PostgreSQL.
 */
class UserMetadataService extends BaseMongoService {
  protected collectionName = 'user_metadata';
  protected featureFlag = 'ENABLE_MONGO_USER_METADATA';

  // ──────────────────────────────────────────────
  // Write Methods
  // ──────────────────────────────────────────────

  /**
   * Tạo hoặc cập nhật metadata của user (upsert)
   */
  public async upsert(
    userId: string,
    data: Partial<Omit<MongoUserMetadata, '_id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ) {
    const collection = await this.getCollection<MongoUserMetadata & Document>();
    if (!collection) return null;

    const now = new Date();
    return collection.findOneAndUpdate(
      { userId },
      {
        $set: { ...data, updatedAt: now },
        $setOnInsert: {
          userId,
          createdAt: now,
        },
      },
      { upsert: true, returnDocument: 'after' }
    );
  }

  /**
   * Cập nhật preferences (non-blocking)
   */
  public setPreferences(
    userId: string,
    prefs: Partial<MongoUserMetadata['preferences']>
  ): void {
    this.runAsync(async () => {
      const collection = await this.getCollection<MongoUserMetadata & Document>();
      if (!collection) return;

      const update: Record<string, unknown> = { updatedAt: new Date() };
      for (const [key, value] of Object.entries(prefs)) {
        update[`preferences.${key}`] = value;
      }

      await collection.updateOne(
        { userId },
        { $set: update },
        { upsert: true }
      );
    });
  }

  /**
   * Đánh dấu bước onboarding hoàn thành (non-blocking)
   */
  public completeOnboardingStep(userId: string, step: string): void {
    this.runAsync(async () => {
      const collection = await this.getCollection<MongoUserMetadata & Document>();
      if (!collection) return;

      await collection.updateOne(
        { userId },
        {
          $addToSet: { 'onboarding.completedSteps': step } as any,
          $set: { updatedAt: new Date() },
        },
        { upsert: true }
      );
    });
  }

  /**
   * Tăng counter stats (non-blocking)
   */
  public incrementStat(
    userId: string,
    field: 'totalDonations' | 'campaignsFollowed' | 'commentsPosted',
    amount = 1
  ): void {
    this.runAsync(async () => {
      const collection = await this.getCollection<MongoUserMetadata & Document>();
      if (!collection) return;

      await collection.updateOne(
        { userId },
        {
          $inc: { [`stats.${field}`]: amount } as any,
          $set: { 'stats.lastActiveAt': new Date(), updatedAt: new Date() },
        },
        { upsert: true }
      );
    });
  }

  // ──────────────────────────────────────────────
  // Read Methods
  // ──────────────────────────────────────────────

  /** Lấy metadata của user */
  public async getByUserId(userId: string) {
    const collection = await this.getCollection<MongoUserMetadata & Document>();
    if (!collection) return null;

    return collection.findOne({ userId });
  }

  /** Lấy preferences của user */
  public async getPreferences(userId: string) {
    const meta = await this.getByUserId(userId);
    return meta?.preferences ?? null;
  }

  // ──────────────────────────────────────────────
  // Indexes
  // ──────────────────────────────────────────────

  public async ensureIndexes(): Promise<void> {
    const collection = await this.getCollection<MongoUserMetadata & Document>();
    if (!collection) return;

    // Lookup theo userId — unique vì 1 user = 1 metadata document
    await collection.createIndex({ userId: 1 }, { unique: true });
    // Query theo interest tags
    await collection.createIndex({ tags: 1 });
  }
}

export const userMetadataService = new UserMetadataService();
