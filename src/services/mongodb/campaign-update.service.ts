import { BaseMongoService } from './base-mongo.service';
import { Document, ObjectId } from 'mongodb';
import type { MongoCampaignUpdate } from '@/types/mongodb.types';

class CampaignUpdateService extends BaseMongoService {
  protected collectionName = 'campaign_updates';
  protected featureFlag = 'ENABLE_MONGO_CAMPAIGN_UPDATES';

  // ──────────────────────────────────────────────
  // Write Methods
  // ──────────────────────────────────────────────

  /** Tạo bài update mới cho campaign */
  public async createUpdate(
    data: Omit<MongoCampaignUpdate, '_id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'legacyId'>
  ): Promise<MongoCampaignUpdate | null> {
    const collection = await this.getCollection<MongoCampaignUpdate & Document>();
    if (!collection) return null;

    const now = new Date();
    const doc: Omit<MongoCampaignUpdate, '_id'> = {
      ...data,
      viewCount: 0,
      status: data.status ?? 'PUBLISHED',
      isPinned: data.isPinned ?? false,
      tags: data.tags ?? [],
      media: data.media ?? [],
      publishedAt: data.status === 'PUBLISHED' ? now : undefined,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(doc as MongoCampaignUpdate & Document);
    return { ...doc, _id: result.insertedId };
  }

  /** Cập nhật nội dung bài update */
  public async updateById(
    updateId: string,
    data: Partial<Pick<MongoCampaignUpdate, 'title' | 'content' | 'status' | 'isPinned' | 'tags' | 'media'>>
  ) {
    const collection = await this.getCollection<MongoCampaignUpdate & Document>();
    if (!collection) return null;

    const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() };
    if (data.status === 'PUBLISHED') {
      updateData.publishedAt = new Date();
    }

    return collection.findOneAndUpdate(
      { _id: new ObjectId(updateId) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
  }

  /** Tăng view count (non-blocking) */
  public incrementViewCount(updateId: string): void {
    this.runAsync(async () => {
      const collection = await this.getCollection<MongoCampaignUpdate & Document>();
      if (!collection) return;
      await collection.updateOne(
        { _id: new ObjectId(updateId) },
        { $inc: { viewCount: 1 } }
      );
    });
  }

  /** Xóa bài update */
  public async deleteById(updateId: string, creatorId: string) {
    const collection = await this.getCollection<MongoCampaignUpdate & Document>();
    if (!collection) return null;

    return collection.deleteOne({ _id: new ObjectId(updateId), creatorId });
  }

  // ──────────────────────────────────────────────
  // Read Methods
  // ──────────────────────────────────────────────

  /** Lấy tất cả bài update PUBLISHED của campaign, mới nhất trước */
  public async getPublishedUpdates(campaignId: string, limit = 20, skip = 0) {
    const collection = await this.getCollection<MongoCampaignUpdate & Document>();
    if (!collection) return [];

    return collection
      .find({ campaignId, status: 'PUBLISHED' })
      .sort({ isPinned: -1, publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  /** Lấy 1 bài update theo ID */
  public async getById(updateId: string) {
    const collection = await this.getCollection<MongoCampaignUpdate & Document>();
    if (!collection) return null;

    return collection.findOne({ _id: new ObjectId(updateId) });
  }

  /** Đếm số bài update của campaign */
  public async countByCampaign(campaignId: string) {
    const collection = await this.getCollection<MongoCampaignUpdate & Document>();
    if (!collection) return 0;

    return collection.countDocuments({ campaignId, status: 'PUBLISHED' });
  }

  // ──────────────────────────────────────────────
  // Indexes
  // ──────────────────────────────────────────────

  public async ensureIndexes(): Promise<void> {
    const collection = await this.getCollection<MongoCampaignUpdate & Document>();
    if (!collection) return;

    // Lấy updates mới nhất của campaign
    await collection.createIndex({ campaignId: 1, status: 1, publishedAt: -1 });
    // Lọc theo creator
    await collection.createIndex({ creatorId: 1 });
    // Hỗ trợ pin + sort
    await collection.createIndex({ campaignId: 1, isPinned: -1, publishedAt: -1 });
    // Tìm theo tags
    await collection.createIndex({ tags: 1 });
  }
}

export const campaignUpdateService = new CampaignUpdateService();
