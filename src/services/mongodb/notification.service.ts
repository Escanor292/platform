import { BaseMongoService } from './base-mongo.service';
import { Document, ObjectId } from 'mongodb';
import { prisma } from '@/lib/prisma';
import { normalizeNotificationSettings, notificationPreferenceKey } from '@/lib/profile-settings';
import type { MongoNotification, NotificationType, NotificationPayload } from '@/types/mongodb.types';

class NotificationService extends BaseMongoService {
  protected collectionName = 'notifications';
  protected featureFlag = 'ENABLE_MONGO_NOTIFICATIONS';

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

      const recipient = await prisma.users.findUnique({
        where: { id: data.userId },
        select: { notificationSettings: true },
      });
      const settings = normalizeNotificationSettings(recipient?.notificationSettings);
      if (!settings[notificationPreferenceKey(data.type)]) return;

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

  public sendBulk(
    userIds: string[],
    data: Omit<Parameters<NotificationService['send']>[0], 'userId'>
  ): void {
    if (userIds.length === 0) return;
    this.runAsync(async () => {
      const collection = await this.getCollection<MongoNotification & Document>();
      if (!collection) return;

      const recipients = await prisma.users.findMany({
        where: { id: { in: userIds } },
        select: { id: true, notificationSettings: true },
      });
      const preference = notificationPreferenceKey(data.type);
      const allowedIds = recipients
        .filter((recipient) => normalizeNotificationSettings(recipient.notificationSettings)[preference])
        .map((recipient) => recipient.id);
      if (allowedIds.length === 0) return;

      const now = new Date();
      const docs = allowedIds.map(userId => ({
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

  public async markAsRead(notificationId: string, userId: string) {
    const collection = await this.getCollection<MongoNotification & Document>();
    if (!collection) return;

    await collection.updateOne(
      { _id: new ObjectId(notificationId), userId },
      { $set: { isRead: true, readAt: new Date(), updatedAt: new Date() } }
    );
  }

  public async markAllAsRead(userId: string) {
    const collection = await this.getCollection<MongoNotification & Document>();
    if (!collection) return;

    const now = new Date();
    await collection.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true, readAt: now, updatedAt: now } }
    );
  }

  public async delete(notificationId: string, userId: string) {
    const collection = await this.getCollection<MongoNotification & Document>();
    if (!collection) return;
    await collection.deleteOne({ _id: new ObjectId(notificationId), userId });
  }

  public async getForUser(userId: string, limit = 20, skip = 0) {
    const collection = await this.getCollection<MongoNotification & Document>();
    if (!collection) return [];

    return collection.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray();
  }

  public async countUnread(userId: string): Promise<number> {
    const collection = await this.getCollection<MongoNotification & Document>();
    if (!collection) return 0;
    return collection.countDocuments({ userId, isRead: false });
  }

  public async ensureIndexes(): Promise<void> {
    const collection = await this.getCollection<MongoNotification & Document>();
    if (!collection) return;
    await collection.createIndex({ userId: 1, createdAt: -1 });
    await collection.createIndex({ userId: 1, isRead: 1 });
    await collection.createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 90 * 24 * 60 * 60, name: 'ttl_90_days' }
    );
  }
}

export const notificationService = new NotificationService();
