import { BaseMongoService } from './base-mongo.service';
import { Document, ObjectId } from 'mongodb';
import type { MongoComment, CommentReaction } from '@/types/mongodb.types';

class CommentService extends BaseMongoService {
  protected collectionName = 'campaign_comments';
  protected featureFlag = 'ENABLE_MONGO_COMMENTS';

  // ──────────────────────────────────────────────
  // Write Methods
  // ──────────────────────────────────────────────

  /** Tạo comment mới hoặc reply */
  public async post(
    data: Pick<MongoComment, 'campaignId' | 'userId' | 'userName' | 'userAvatar' | 'content' | 'parentId' | 'depth'>
  ): Promise<MongoComment | null> {
    const collection = await this.getCollection<MongoComment & Document>();
    if (!collection) return null;

    const now = new Date();
    const doc: Omit<MongoComment, '_id'> = {
      ...data,
      parentId: data.parentId || null,
      reactions: [],
      editHistory: [],
      isEdited: false,
      isDeleted: false,
      status: 'APPROVED',
      replyCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(doc as MongoComment & Document);

    // Nếu là reply, tăng replyCount của comment cha (non-blocking)
    if (data.parentId) {
      this.runAsync(async () => {
        await collection.updateOne(
          { _id: new ObjectId(data.parentId!) },
          { $inc: { replyCount: 1 } as any }
        );
      });
    }

    return { ...doc, _id: result.insertedId };
  }

  /** Chỉnh sửa comment — lưu lịch sử chỉnh sửa */
  public async edit(commentId: string, userId: string, newContent: string) {
    const collection = await this.getCollection<MongoComment & Document>();
    if (!collection) return null;

    const comment = await collection.findOne({
      _id: new ObjectId(commentId),
      userId,
      isDeleted: false,
    });
    if (!comment) return null;

    return collection.findOneAndUpdate(
      { _id: new ObjectId(commentId), userId },
      {
        $set: { content: newContent, isEdited: true, updatedAt: new Date() },
        $push: {
          editHistory: {
            content: comment.content,
            editedAt: new Date(),
          },
        } as any,
      },
      { returnDocument: 'after' }
    );
  }

  /** Soft delete — không xóa document, chỉ ẩn content */
  public async softDelete(commentId: string, userId: string) {
    const collection = await this.getCollection<MongoComment & Document>();
    if (!collection) return null;

    return collection.findOneAndUpdate(
      { _id: new ObjectId(commentId), userId },
      {
        $set: {
          isDeleted: true,
          content: '[Bình luận đã bị xóa]',
          status: 'DELETED',
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );
  }

  /** Admin ẩn comment */
  public async hide(commentId: string) {
    const collection = await this.getCollection<MongoComment & Document>();
    if (!collection) return null;

    return collection.updateOne(
      { _id: new ObjectId(commentId) },
      { $set: { status: 'HIDDEN', updatedAt: new Date() } }
    );
  }

  /** Toggle reaction (LIKE/LOVE/...) */
  public async toggleReaction(
    commentId: string,
    userId: string,
    reactionType: CommentReaction['type']
  ) {
    const collection = await this.getCollection<MongoComment & Document>();
    if (!collection) return;

    const comment = await collection.findOne({ _id: new ObjectId(commentId) });
    if (!comment) return;

    const existingReaction = comment.reactions?.find(r => r.type === reactionType);

    if (existingReaction) {
      const hasReacted = existingReaction.userIds.includes(userId);
      if (hasReacted) {
        // Bỏ reaction
        await collection.updateOne(
          { _id: new ObjectId(commentId), 'reactions.type': reactionType },
          { $pull: { 'reactions.$.userIds': userId } as any }
        );
      } else {
        // Thêm vào reaction đã có
        await collection.updateOne(
          { _id: new ObjectId(commentId), 'reactions.type': reactionType },
          { $addToSet: { 'reactions.$.userIds': userId } as any }
        );
      }
    } else {
      // Tạo reaction mới
      await collection.updateOne(
        { _id: new ObjectId(commentId) },
        { $push: { reactions: { type: reactionType, userIds: [userId] } } as any }
      );
    }
  }

  // ──────────────────────────────────────────────
  // Read Methods
  // ──────────────────────────────────────────────

  /** Lấy root comments của campaign (không lấy replies) */
  public async getCampaignComments(
    campaignId: string,
    options: { limit?: number; skip?: number; sort?: 'newest' | 'oldest' } = {}
  ) {
    const collection = await this.getCollection<MongoComment & Document>();
    if (!collection) return [];

    const { limit = 20, skip = 0, sort = 'newest' } = options;

    return collection
      .find({
        campaignId,
        parentId: null,
        isDeleted: false,
        status: 'APPROVED',
      })
      .sort({ createdAt: sort === 'newest' ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  /** Lấy replies của 1 comment */
  public async getReplies(parentId: string, limit = 10) {
    const collection = await this.getCollection<MongoComment & Document>();
    if (!collection) return [];

    return collection
      .find({ parentId, isDeleted: false, status: 'APPROVED' })
      .sort({ createdAt: 1 })
      .limit(limit)
      .toArray();
  }

  /** Đếm số root comment của campaign */
  public async countByCampaign(campaignId: string) {
    const collection = await this.getCollection<MongoComment & Document>();
    if (!collection) return 0;

    return collection.countDocuments({
      campaignId,
      parentId: null,
      isDeleted: false,
    });
  }

  /** Lấy comment theo ID */
  public async getById(commentId: string) {
    const collection = await this.getCollection<MongoComment & Document>();
    if (!collection) return null;

    return collection.findOne({ _id: new ObjectId(commentId) });
  }

  // ──────────────────────────────────────────────
  // Indexes
  // ──────────────────────────────────────────────

  public async ensureIndexes(): Promise<void> {
    const collection = await this.getCollection<MongoComment & Document>();
    if (!collection) return;

    // Root comments của campaign, mới nhất trước
    await collection.createIndex({ campaignId: 1, createdAt: -1 });
    // Filter root vs replies nhanh
    await collection.createIndex({ campaignId: 1, parentId: 1, createdAt: 1 });
    // Lấy replies của comment cha
    await collection.createIndex({ parentId: 1, createdAt: 1 });
    // Lấy comments của user
    await collection.createIndex({ userId: 1, createdAt: -1 });
    // Filter theo status (PENDING, HIDDEN)
    await collection.createIndex({ status: 1 });
  }
}

export const commentService = new CommentService();
