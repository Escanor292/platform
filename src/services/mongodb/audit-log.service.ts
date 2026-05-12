import { BaseMongoService } from './base-mongo.service';
import { Document, ObjectId } from 'mongodb';
import type { MongoAuditLog, AuditAction } from '@/types/mongodb.types';

/**
 * MongoDB Audit Log Service
 *
 * Chạy SONG SONG với PostgreSQL AuditLog (audit.ts).
 * - PostgreSQL AuditLog: nguồn chính xác (source of truth), dùng cho kế toán, pháp lý.
 * - MongoDB AuditLog: dùng để query nhanh, aggregation, dashboard admin.
 *
 * Không bao giờ chỉ dùng MongoDB audit log làm nguồn dữ liệu tài chính.
 */
class AuditLogMongoService extends BaseMongoService {
  protected collectionName = 'audit_logs';
  protected featureFlag = 'ENABLE_MONGO_LOGS';

  // ──────────────────────────────────────────────
  // Write Methods
  // ──────────────────────────────────────────────

  /**
   * Ghi audit log non-blocking (fire-and-forget)
   * Luôn gọi SONG SONG sau khi đã ghi PostgreSQL thành công.
   */
  public log(data: Omit<MongoAuditLog, '_id' | 'createdAt' | 'updatedAt'>): void {
    this.runAsync(async () => {
      const collection = await this.getCollection<MongoAuditLog & Document>();
      if (!collection) return;

      const now = new Date();
      await collection.insertOne({
        ...data,
        createdAt: now,
        updatedAt: now,
      } as MongoAuditLog & Document);
    });
  }

  // ──────────────────────────────────────────────
  // Read Methods
  // ──────────────────────────────────────────────

  /** Lấy audit logs của 1 entity (VD: lịch sử thay đổi campaign) */
  public async getEntityLogs(
    entityType: string,
    entityId: string,
    limit = 50
  ) {
    const collection = await this.getCollection<MongoAuditLog & Document>();
    if (!collection) return [];

    return collection
      .find({ entityType, entityId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }

  /** Lấy audit logs của 1 user */
  public async getUserLogs(userId: string, limit = 50) {
    const collection = await this.getCollection<MongoAuditLog & Document>();
    if (!collection) return [];

    return collection
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }

  /** Lấy audit logs theo action type (VD: toàn bộ REFUND trong tháng) */
  public async getLogsByAction(
    action: AuditAction,
    fromDate: Date,
    toDate: Date,
    limit = 500
  ) {
    const collection = await this.getCollection<MongoAuditLog & Document>();
    if (!collection) return [];

    return collection
      .find({ action, createdAt: { $gte: fromDate, $lte: toDate } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }

  /** Thống kê số lượng action theo loại trong khoảng thời gian */
  public async aggregateByAction(fromDate: Date, toDate: Date) {
    const collection = await this.getCollection<MongoAuditLog & Document>();
    if (!collection) return [];

    return collection.aggregate([
      { $match: { createdAt: { $gte: fromDate, $lte: toDate } } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
  }

  /** Lấy log theo pgAuditLogId để cross-reference */
  public async getByPgId(pgAuditLogId: string) {
    const collection = await this.getCollection<MongoAuditLog & Document>();
    if (!collection) return null;

    return collection.findOne({ pgAuditLogId });
  }

  // ──────────────────────────────────────────────
  // Indexes — TTL 365 ngày
  // ──────────────────────────────────────────────

  public async ensureIndexes(): Promise<void> {
    const collection = await this.getCollection<MongoAuditLog & Document>();
    if (!collection) return;

    // Query theo entity
    await collection.createIndex({ entityType: 1, entityId: 1, createdAt: -1 });
    // Query theo user
    await collection.createIndex({ userId: 1, createdAt: -1 });
    // Query theo action
    await collection.createIndex({ action: 1, createdAt: -1 });
    // Cross-reference với PostgreSQL
    await collection.createIndex({ pgAuditLogId: 1 }, { sparse: true });
    // TTL: tự động xóa sau 365 ngày
    await collection.createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 365 * 24 * 60 * 60, name: 'ttl_365_days' }
    );
  }
}

export const auditLogMongoService = new AuditLogMongoService();
