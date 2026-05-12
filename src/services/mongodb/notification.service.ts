import { BaseMongoService } from './base-mongo.service';
import { Document, ObjectId } from 'mongodb';
import type { MongoNotification, NotificationType, NotificationPayload } from '@/types/mongodb.types';

class NotificationService extends BaseMongoService {
  protected collectionName = 'notifications';
  protected featureFlag = 'ENABLE_MONGO_NOTIFICATIONS';

  // ──────────────────────────────────────────────
  // Write Methods
  // ──────────────────────────────────────────────

  /** Gửi notification (non-blocking) */
  public send(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    payload?: NotificationPayload;
  }): void {
    this.runAsync(async () => {
      const collection = await this.getCollection<MongoNotification & Document>();
      if (!collection) return;

      const now = new Date();
      await collection.insertOne({
        ...data,
        payload: data.payload ?? {},
        isRead: false,
        createdAt: now,
        updatedAt: now,
      } as MongoNotification & Document);
    });
  }

  /** Gửi bulk notifications cho nhiều user cùng lúc (non-blocking) */
  public sendBulk(
    userIds: string[],
    data: Omit<Parameters<NotificationService['send']>[0], 'userId'>
  ): void {
    if (userIds.length === 0) return;
    this.runAsync(async () => {
      const collection = await this.getCollection<MongoNotification & Document>();
      if (!collection) return;

      const now = new Date();
      const docs = userIds.map(userId => ({
        ...data,
        userId,
        payload: data.payload ?? {},
        isRead: false,
        createdAt: now,
        updatedAt: now,
      })) as (MongoNotification & Document)[];

      await collection.insertMany(docs);
    });
  }

  /** Đánh dấu 1 notification đã đọc */
  public async markAsRead(notificationId: string, userId: string) {
    const collection = await this.getCollection<MongoNotification & Document>();
    if (!collection) return;

    await collection.updateOne(
      { _id: new ObjectId(notificationId), userId },
      { $set: { isRead: true, readAt: new Date(), updatedAt: new Date() } }
    );
  }

  /** Đánh dấu toàn bộ notifications của user đã đọc */
  public async markAllAsRead(userId: string) {
    const collection = await this.getCollection<MongoNotification & Document>();
    if (!collection) return;

    const now = new Date();
    await collection.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true, readAt: now, updatedAt: now } }
    );
  }

  /** Xóa 1 notification */
  public async delete(notificationId: string, userId: string) {
    const collection = await this.getCollection<MongoNotification & Document>();
    if (!collection) return;

    await collection.deleteOne({ _id: new ObjectId(notificationId), userId });
  }

  // ──────────────────────────────────────────────
  // Read Methods
  // ──────────────────────────────────────────────

  /** Lấy notifications của user, mới nhất trước */
  public async getForUser(userId: string, limit = 20, skip = 0) {
    const collection = await this.getCollection<MongoNotification & Document>();
    if (!collection) return [];

    return collection
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  /** Đếm số notification chưa đọc của user */
  public async countUnread(userId: string): Promise<number> {
    const collection = await this.getCollection<MongoNotification & Document>();
    if (!collection) return 0;

    return collection.countDocuments({ userId, isRead: false });
  }

  // ──────────────────────────────────────────────
  // Indexes — TTL 90 ngày
  // ──────────────────────────────────────────────

  public async ensureIndexes(): Promise<void> {
    const collection = await this.getCollection<MongoNotification & Document>();
    if (!collection) return;

    // Lấy notifications của user, sort mới nhất
    await collection.createIndex({ userId: 1, createdAt: -1 });
    // Filter unread nhanh
    await collection.createIndex({ userId: 1, isRead: 1 });
    // TTL: tự động xóa sau 90 ngày
    await collection.createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 90 * 24 * 60 * 60, name: 'ttl_90_days' }
    );
  }
}

export const notificationService = new NotificationService();
