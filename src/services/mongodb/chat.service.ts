/**
 * Chat Service - MongoDB Operations
 * Handles conversations and messages
 */

import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { prisma } from '@/lib/prisma';
import { normalizePrivacySettings } from '@/lib/profile-settings';
import {
  MongoConversation,
  MongoMessage,
  MongoChatReport,
  ConversationParticipant,
  ConversationCampaign,
  ChatReportReason,
  MessageType,
  MessageReaction,
} from '@/types/chat.types';

// ─────────────────────────────────────────────────────────────────────────────
// Collection Names
// ─────────────────────────────────────────────────────────────────────────────

const CONVERSATIONS_COLLECTION = 'conversations';
const MESSAGES_COLLECTION = 'messages';
const CHAT_REPORTS_COLLECTION = 'chat_reports';
const USER_NOTES_COLLECTION = 'user_notes';

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate unique conversation key
 * Ensures same conversation regardless of who initiates
 */
export function generateConversationKey(
  userId1: string,
  userId2: string,
  campaignId?: string
): string {
  // Sort user IDs alphabetically to ensure consistency
  const sortedUserIds = [userId1, userId2].sort();

  // All chats between two users are merged into a single "direct" thread
  return `direct_${sortedUserIds[0]}_${sortedUserIds[1]}`;
}

/**
 * Get user info from PostgreSQL
 */
async function getUserInfo(userId: string): Promise<ConversationParticipant | null> {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      displayName: true,
      email: true,
      avatar: true,
      role: true,
      privacySettings: true,
    },
  });

  if (!user) {
    // Người dùng đã bị xóa khỏi PostgreSQL nhưng vẫn có thể tham gia chat (MongoDB)
    return {
      userId,
      name: DELETED_USER_LABEL,
      email: '',
      role: 'deleted',
      deleted: true,
    } as unknown as ConversationParticipant;
  }

  return {
    userId: user.id,
    name: user.displayName || user.name,
    email: normalizePrivacySettings(user.role, user.privacySettings).email ? user.email : '',
    avatarUrl: user.avatar || undefined,
    role: user.role,
    deleted: false,
  } as ConversationParticipant;
}

export const DELETED_USER_LABEL = 'Người dùng đã xóa';

/**
 * Kiểm tra và đánh dấu người tham gia đã bị xóa tài khoản (không còn trong PostgreSQL).
 * Dữ liệu chat MongoDB vẫn giữ nguyên, chỉ bổ sung flag `deleted`.
 */
export async function enrichDeletedUsers<T extends { participants: ConversationParticipant[]; participantIds: string[] }>(
  items: T[]
): Promise<T[]> {
  const userIds = [...new Set(items.flatMap((c) => c.participantIds))];
  if (userIds.length === 0) return items;

  const existing = await prisma.users.findMany({
    where: { id: { in: userIds } },
    select: { id: true, avatar: true, displayName: true, name: true, email: true, role: true, privacySettings: true },
  });
  const existingIds = new Set(existing.map((u) => u.id));

  return items.map((item) => ({
    ...item,
    participants: item.participants.map((p) => {
      const isDeleted = !existingIds.has(p.userId);
      const fresh = existing.find((u) => u.id === p.userId);
      // Nếu user vẫn còn thì làm mới thông tin (avatar/role) từ PostgreSQL
      if (!isDeleted && fresh) {
        return {
          ...p,
          name: fresh.displayName || fresh.name,
          email: normalizePrivacySettings(fresh.role, fresh.privacySettings).email ? fresh.email : '',
          avatarUrl: fresh.avatar || p.avatarUrl,
          role: fresh.role,
          deleted: false,
        } as ConversationParticipant;
      }
      return {
        ...p,
        name: isDeleted ? DELETED_USER_LABEL : p.name,
        role: isDeleted ? 'deleted' : p.role,
        deleted: isDeleted,
      } as ConversationParticipant;
    }),
  }));
}

/**
 * Get campaign info from PostgreSQL
 */
async function getCampaignInfo(campaignId: string): Promise<ConversationCampaign | null> {
  const campaign = await prisma.campaigns.findUnique({
    where: { id: campaignId },
    select: {
      id: true,
      title: true,
      imageUrl: true,
      currentAmount: true,
      goalAmount: true,
      creatorId: true,
      status: true,
    },
  });

  if (!campaign) return null;

  return {
    campaignId: campaign.id,
    title: campaign.title,
    coverImage: campaign.imageUrl || undefined,
    currentAmount: Number(campaign.currentAmount),
    goalAmount: Number(campaign.goalAmount),
    ownerId: campaign.creatorId,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Conversation Operations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Start or get existing conversation
 */
export async function startConversation(
  currentUserId: string,
  targetUserId: string,
  campaignId?: string
): Promise<{ conversation: MongoConversation; isNew: boolean }> {
  const db = await getDb();
  const conversationsCollection = db.collection<MongoConversation>(CONVERSATIONS_COLLECTION);

  // Validate users exist in PostgreSQL
  const [currentUser, targetUser] = await Promise.all([
    getUserInfo(currentUserId),
    getUserInfo(targetUserId),
  ]);

  if (!currentUser) {
    throw new Error('Current user not found');
  }

  if (!targetUser) {
    throw new Error('Target user not found');
  }

  // Validate campaign if provided
  let campaignInfo: ConversationCampaign | undefined;
  if (campaignId) {
    const campaign = await getCampaignInfo(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Ensure target user is campaign owner
    if (campaign.ownerId !== targetUserId) {
      throw new Error('Target user is not the campaign owner');
    }

    campaignInfo = campaign;
  }

  // Generate conversation key
  const conversationKey = generateConversationKey(currentUserId, targetUserId, campaignId);

  // Check if conversation already exists
  const existingConversation = await conversationsCollection.findOne({ conversationKey });

  if (existingConversation) {
    // If a campaign context is provided, update the conversation's campaign info
    // This allows the shared thread to show the context of the project being discussed
    if (campaignId && existingConversation.campaign?.campaignId !== campaignId) {
      const campaignInfo = await getCampaignInfo(campaignId);
      if (campaignInfo) {
        await conversationsCollection.updateOne(
          { _id: existingConversation._id },
          {
            $set: {
              campaign: campaignInfo,
              type: 'campaign'
            }
          }
        );
        existingConversation.campaign = campaignInfo;
        existingConversation.type = 'campaign';
      }
    }
    return { conversation: existingConversation, isNew: false };
  }

  // Create new conversation
  const now = new Date();
  const newConversation: MongoConversation = {
    conversationKey,
    type: campaignId ? 'campaign' : 'direct',
    participants: [currentUser, targetUser],
    participantIds: [currentUserId, targetUserId],
    campaign: campaignInfo,
    unreadCount: {
      [currentUserId]: 0,
      [targetUserId]: 0,
    },
    isActive: true,
    isReported: false,
    blockedBy: [],
    hiddenBy: [],
    typingBy: {},
    createdAt: now,
    updatedAt: now,
  };

  const result = await conversationsCollection.insertOne(newConversation as any);
  newConversation._id = result.insertedId;

  return { conversation: newConversation, isNew: true };
}

/**
 * Get user's conversations
 */
export async function getUserConversations(userId: string): Promise<MongoConversation[]> {
  const db = await getDb();
  const conversationsCollection = db.collection<MongoConversation>(CONVERSATIONS_COLLECTION);

  const conversations = await conversationsCollection
    .find({
      participantIds: userId,
      hiddenBy: { $ne: userId }, // Exclude conversations hidden by user
    })
    .sort({ updatedAt: -1 })
    .toArray();

  // Đánh dấu người tham gia đã bị xóa tài khoản (không sửa MongoDB, chỉ bổ sung flag)
  return (await enrichDeletedUsers(conversations)) as unknown as MongoConversation[];
}

/**
 * Get conversation by ID
 */
export async function getConversationById(
  conversationId: string,
  userId: string
): Promise<MongoConversation | null> {
  if (!ObjectId.isValid(conversationId)) {
    throw new Error('Invalid conversation ID');
  }

  const db = await getDb();
  const conversationsCollection = db.collection<MongoConversation>(CONVERSATIONS_COLLECTION);

  const conversation = await conversationsCollection.findOne({
    _id: new ObjectId(conversationId),
    participantIds: userId, // Ensure user is participant
  });

  if (!conversation) return null;

  const enriched = await enrichDeletedUsers([conversation as any]);
  return enriched[0] as unknown as MongoConversation;
}

// ─────────────────────────────────────────────────────────────────────────────
// Message Operations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send message
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  text: string,
  attachments: any[] = [],
  sensitive: boolean = false,
  type: MessageType | 'call-signal' = 'text'
): Promise<MongoMessage> {
  if (!ObjectId.isValid(conversationId)) {
    throw new Error('Invalid conversation ID');
  }

  const db = await getDb();
  const conversationsCollection = db.collection<MongoConversation>(CONVERSATIONS_COLLECTION);
  const messagesCollection = db.collection<MongoMessage>(MESSAGES_COLLECTION);

  // Validate conversation and user is participant
  const conversation = await conversationsCollection.findOne({
    _id: new ObjectId(conversationId),
    participantIds: senderId,
  });

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  // Check if conversation is blocked
  if (conversation.blockedBy.includes(senderId)) {
    throw new Error('You have blocked this conversation');
  }

  const otherParticipantId = conversation.participantIds.find((id) => id !== senderId);
  if (otherParticipantId && conversation.blockedBy.includes(otherParticipantId)) {
    throw new Error('This conversation has been blocked');
  }

  // Validate text
  const trimmedText = text.trim();
  if (!trimmedText && attachments.length === 0) {
    throw new Error('Message text or attachments are required');
  }

  if (trimmedText.length > 2000) {
    throw new Error('Message text is too long (max 2000 characters)');
  }

  // Get sender info
  const senderInfo = await getUserInfo(senderId);
  if (!senderInfo) {
    throw new Error('Sender not found');
  }

  // Determine message type based on attachments (overridable for system signals like 'call-signal')
  let messageType: MessageType | 'call-signal' = type !== 'text' ? type : 'text';
  if (messageType === 'text' && attachments.length > 0) {
    const firstAttachmentType = attachments[0]?.type;
    if (firstAttachmentType === 'image') {
      messageType = 'image';
    } else if (firstAttachmentType === 'voice') {
      messageType = 'voice';
    } else {
      messageType = 'file';
    }
  }

  // Create message
  const now = new Date();
  const newMessage: MongoMessage = {
    conversationId: new ObjectId(conversationId),
    senderId,
    senderName: senderInfo.name,
    senderAvatar: senderInfo.avatarUrl,
    text: trimmedText,
    type: messageType,
    attachments: attachments || [],
    readBy: [senderId], // Sender has read their own message
    isDeleted: false,
    sensitive,
    revealedBy: sensitive ? [senderId] : [], // Only track revealedBy if sensitive
    createdAt: now,
    updatedAt: now,
  };

  const result = await messagesCollection.insertOne(newMessage as any);
  newMessage._id = result.insertedId;

  // Update conversation
  const updateData: any = {
    lastMessage: {
      text: trimmedText,
      senderId,
      type: messageType,
      createdAt: now,
    },
    updatedAt: now,
  };

  // Increment unread count for other participants
  conversation.participantIds.forEach((participantId) => {
    if (participantId !== senderId) {
      updateData[`unreadCount.${participantId}`] = (conversation.unreadCount[participantId] || 0) + 1;
    } else {
      updateData[`unreadCount.${participantId}`] = 0; // Reset sender's unread count
    }
  });

  await conversationsCollection.updateOne(
    { _id: new ObjectId(conversationId) },
    { $set: updateData }
  );

  return newMessage;
}

/**
 * Get messages with pagination
 */
export async function getMessages(
  conversationId: string,
  userId: string,
  limit: number = 30,
  before?: string
): Promise<{ messages: MongoMessage[]; hasMore: boolean }> {
  if (!ObjectId.isValid(conversationId)) {
    throw new Error('Invalid conversation ID');
  }

  const db = await getDb();
  const conversationsCollection = db.collection<MongoConversation>(CONVERSATIONS_COLLECTION);
  const messagesCollection = db.collection<MongoMessage>(MESSAGES_COLLECTION);

  // Validate user is participant
  const conversation = await conversationsCollection.findOne({
    _id: new ObjectId(conversationId),
    participantIds: userId,
  });

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  // Build query
  const query: any = {
    conversationId: new ObjectId(conversationId),
    isDeleted: false,
  };

  // Add pagination
  if (before) {
    try {
      // Try as ObjectId first
      query._id = { $lt: new ObjectId(before) };
    } catch {
      // Try as ISO date
      query.createdAt = { $lt: new Date(before) };
    }
  }

  // Get messages
  const messages = await messagesCollection
    .find(query)
    .sort({ createdAt: -1 })
    .limit(limit + 1) // Get one extra to check if there are more
    .toArray();

  const hasMore = messages.length > limit;
  const resultMessages = hasMore ? messages.slice(0, limit) : messages;

  // Đánh dấu tin nhắn của người gửi đã bị xóa tài khoản
  const senderIds = [...new Set(resultMessages.map((m) => m.senderId))];
  const existing = await prisma.users.findMany({
    where: { id: { in: senderIds } },
    select: { id: true },
  });
  const existingIds = new Set(existing.map((u) => u.id));
  const enriched = resultMessages.map((m) => ({
    ...m,
    senderName: existingIds.has(m.senderId) ? m.senderName : DELETED_USER_LABEL,
    senderDeleted: !existingIds.has(m.senderId),
  })) as MongoMessage[];

  return { messages: enriched, hasMore };
}

/**
 * Mark conversation as read
 */
export async function markAsRead(conversationId: string, userId: string): Promise<void> {
  if (!ObjectId.isValid(conversationId)) {
    throw new Error('Invalid conversation ID');
  }

  const db = await getDb();
  const conversationsCollection = db.collection<MongoConversation>(CONVERSATIONS_COLLECTION);
  const messagesCollection = db.collection<MongoMessage>(MESSAGES_COLLECTION);

  // Validate user is participant
  const conversation = await conversationsCollection.findOne({
    _id: new ObjectId(conversationId),
    participantIds: userId,
  });

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  // Reset unread count
  await conversationsCollection.updateOne(
    { _id: new ObjectId(conversationId) },
    {
      $set: {
        [`unreadCount.${userId}`]: 0,
        updatedAt: new Date(),
      },
    }
  );

  // Add user to readBy for recent unread messages
  await messagesCollection.updateMany(
    {
      conversationId: new ObjectId(conversationId),
      senderId: { $ne: userId },
      readBy: { $ne: userId },
    },
    {
      $addToSet: { readBy: userId },
      $set: { updatedAt: new Date() },
    }
  );
}

/**
 * Delete message (soft delete)
 */
export async function deleteMessage(messageId: string, userId: string): Promise<void> {
  const db = await getDb();
  const messagesCollection = db.collection<MongoMessage>(MESSAGES_COLLECTION);

  const message = await messagesCollection.findOne({ _id: new ObjectId(messageId) });

  if (!message) {
    throw new Error('Message not found');
  }

  // Only sender can delete their own message
  if (message.senderId !== userId) {
    throw new Error('You can only delete your own messages');
  }

  await messagesCollection.updateOne(
    { _id: new ObjectId(messageId) },
    {
      $set: {
        isDeleted: true,
        text: '',
        updatedAt: new Date(),
      },
    }
  );
}

/**
 * Toggle a reaction (emoji) on a message.
 * - Nếu user đã react emoji này → xóa user khỏi danh sách; nếu danh sách rỗng → xóa entry.
 * - Nếu user chưa react → thêm user vào entry (tạo mới nếu chưa có emoji này).
 */
export async function toggleMessageReaction(
  messageId: string,
  userId: string,
  emoji: string
): Promise<MessageReaction[] | null> {
  if (!ObjectId.isValid(messageId)) {
    throw new Error('Invalid message ID');
  }
  const trimmed = emoji.trim();
  if (!trimmed) {
    throw new Error('Invalid emoji');
  }

  const db = await getDb();
  const messagesCollection = db.collection<MongoMessage>(MESSAGES_COLLECTION);

  // Bỏ phản ứng nếu user đã react emoji này trước đó
  await messagesCollection.updateOne(
    { _id: new ObjectId(messageId), 'reactions.emoji': trimmed, 'reactions.userIds': userId },
    {
      $pull: { 'reactions.$.userIds': userId },
      $set: { updatedAt: new Date() },
    }
  );
  // Xóa entry rỗng
  await messagesCollection.updateOne(
    { _id: new ObjectId(messageId), 'reactions.userIds': { $size: 0 } },
    { $pull: { reactions: { userIds: { $size: 0 } } }, $set: { updatedAt: new Date() } }
  );

  const message = await messagesCollection.findOne({ _id: new ObjectId(messageId) });
  if (!message) {
    return null;
  }

  const existing = message.reactions?.find((r) => r.emoji === trimmed);
  if (existing) {
    // Đã có entry nhưng chưa có user này → thêm user
    if (!existing.userIds.includes(userId)) {
      await messagesCollection.updateOne(
        { _id: new ObjectId(messageId), 'reactions.emoji': trimmed },
        { $push: { 'reactions.$.userIds': userId }, $set: { updatedAt: new Date() } }
      );
    }
  } else {
    // Chưa có emoji này → tạo entry mới
    await messagesCollection.updateOne(
      { _id: new ObjectId(messageId) },
      {
        $push: { reactions: { emoji: trimmed, userIds: [userId] } },
        $set: { updatedAt: new Date() },
      }
    );
  }

  const updated = await messagesCollection.findOne({ _id: new ObjectId(messageId) });
  return updated?.reactions ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Report & Block Operations
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Report conversation or message
 */
export async function reportConversation(
  conversationId: string,
  reporterId: string,
  reason: ChatReportReason,
  description: string,
  messageId?: string,
  extras?: { imageUrls?: string[]; occurredAt?: Date | null }
): Promise<MongoChatReport> {
  if (!ObjectId.isValid(conversationId)) {
    throw new Error('Invalid conversation ID');
  }

  const db = await getDb();
  const conversationsCollection = db.collection<MongoConversation>(CONVERSATIONS_COLLECTION);
  const chatReportsCollection = db.collection<MongoChatReport>(CHAT_REPORTS_COLLECTION);

  // Validate user is participant
  const conversation = await conversationsCollection.findOne({
    _id: new ObjectId(conversationId),
    participantIds: reporterId,
  });

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  // Create report
  const now = new Date();
  const report: MongoChatReport = {
    conversationId: new ObjectId(conversationId),
    messageId: messageId ? new ObjectId(messageId) : null,
    reporterId,
    reason,
    description: description.trim(),
    imageUrls: extras?.imageUrls?.slice(0, 5) || [],
    occurredAt: extras?.occurredAt || null,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  const result = await chatReportsCollection.insertOne(report as any);
  report._id = result.insertedId;

  // Mark conversation as reported
  await conversationsCollection.updateOne(
    { _id: new ObjectId(conversationId) },
    {
      $set: {
        isReported: true,
        updatedAt: now,
      },
    }
  );

  return report;
}

/**
 * Block conversation
 */
export async function blockConversation(conversationId: string, userId: string): Promise<void> {
  const db = await getDb();
  const conversationsCollection = db.collection<MongoConversation>(CONVERSATIONS_COLLECTION);

  // Validate user is participant
  const conversation = await conversationsCollection.findOne({
    _id: new ObjectId(conversationId),
    participantIds: userId,
  });

  if (!conversation) {
    throw new Error('Conversation not found or user is not a participant');
  }

  // Add user to blockedBy array
  await conversationsCollection.updateOne(
    { _id: new ObjectId(conversationId) },
    {
      $addToSet: { blockedBy: userId },
      $set: { updatedAt: new Date() },
    }
  );
}

/**
 * Unblock conversation
 */
export async function unblockConversation(conversationId: string, userId: string): Promise<void> {
  const db = await getDb();
  const conversationsCollection = db.collection<MongoConversation>(CONVERSATIONS_COLLECTION);

  await conversationsCollection.updateOne(
    { _id: new ObjectId(conversationId) },
    {
      $pull: { blockedBy: userId },
      $set: { updatedAt: new Date() },
    }
  );
}

/**
 * Get total unread count for user
 */
export async function getTotalUnreadCount(userId: string): Promise<number> {
  const db = await getDb();
  const conversationsCollection = db.collection<MongoConversation>(CONVERSATIONS_COLLECTION);

  const conversations = await conversationsCollection
    .find({ participantIds: userId })
    .toArray();

  let totalUnread = 0;
  conversations.forEach((conv) => {
    totalUnread += conv.unreadCount[userId] || 0;
  });

  return totalUnread;
}

// ─────────────────────────────────────────────────────────────────────────────
// User Search Operations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Search users by name or email
 */
export async function searchUsers(query: string, currentUserId: string): Promise<any[]> {
  if (!query || query.trim().length < 2) return [];

  const users = await prisma.users.findMany({
    where: {
      AND: [
        {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { displayName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
        { id: { not: currentUserId } },
      ],
    },
    select: {
      id: true,
      name: true,
      displayName: true,
      email: true,
      avatar: true,
      role: true,
      privacySettings: true,
    },
    take: 20,
  });

  return users
    .filter((user) => {
      const emailVisible = normalizePrivacySettings(user.role, user.privacySettings).email;
      const nameMatches = (user.displayName || user.name).toLocaleLowerCase().includes(query.toLocaleLowerCase());
      return nameMatches || (emailVisible && user.email.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
    })
    .slice(0, 10)
    .map((user) => ({
      id: user.id,
      name: user.displayName || user.name,
      displayName: user.displayName,
      email: normalizePrivacySettings(user.role, user.privacySettings).email ? user.email : null,
      avatar: user.avatar || undefined,
      role: user.role,
    }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Typing Indicator Operations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Set typing indicator for conversation
 */
export async function setTypingIndicator(
  conversationId: string,
  userId: string,
  isTyping: boolean
): Promise<void> {
  if (!ObjectId.isValid(conversationId)) {
    throw new Error('Invalid conversation ID');
  }

  const db = await getDb();
  const conversationsCollection = db.collection<MongoConversation>(CONVERSATIONS_COLLECTION);

  if (isTyping) {
    // Set typing indicator with current timestamp
    await conversationsCollection.updateOne(
      { _id: new ObjectId(conversationId), participantIds: userId },
      {
        $set: {
          [`typingBy.${userId}`]: Date.now(),
          updatedAt: new Date(),
        },
      }
    );
  } else {
    // Remove typing indicator
    await conversationsCollection.updateOne(
      { _id: new ObjectId(conversationId) },
      {
        $unset: { [`typingBy.${userId}`]: '' },
        $set: { updatedAt: new Date() },
      }
    );
  }
}

/**
 * Get typing users for conversation (excluding expired indicators)
 */
export async function getTypingUsers(
  conversationId: string,
  currentUserId: string
): Promise<string[]> {
  if (!ObjectId.isValid(conversationId)) {
    throw new Error('Invalid conversation ID');
  }

  const db = await getDb();
  const conversationsCollection = db.collection<MongoConversation>(CONVERSATIONS_COLLECTION);

  const conversation = await conversationsCollection.findOne({
    _id: new ObjectId(conversationId),
  });

  if (!conversation || !conversation.typingBy) {
    return [];
  }

  const now = Date.now();
  const typingUsers: string[] = [];
  const expiredTyping: string[] = [];

  // Check each typing indicator (expire after 5 seconds)
  Object.entries(conversation.typingBy).forEach(([userId, timestamp]) => {
    if (userId === currentUserId) return; // Don't show current user's typing

    if (now - timestamp < 5000) {
      typingUsers.push(userId);
    } else {
      expiredTyping.push(userId);
    }
  });

  // Clean up expired typing indicators
  if (expiredTyping.length > 0) {
    const updateData: any = {};
    expiredTyping.forEach((userId) => {
      updateData[`typingBy.${userId}`] = '';
    });

    await conversationsCollection.updateOne(
      { _id: new ObjectId(conversationId) },
      {
        $unset: updateData,
        $set: { updatedAt: new Date() },
      }
    );
  }

  return typingUsers;
}

// ─────────────────────────────────────────────────────────────────────────────
// Soft Delete Conversation Operations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Soft delete conversation (hide for user)
 */
export async function deleteConversation(conversationId: string, userId: string): Promise<void> {
  if (!ObjectId.isValid(conversationId)) {
    throw new Error('Invalid conversation ID');
  }

  const db = await getDb();
  const conversationsCollection = db.collection<MongoConversation>(CONVERSATIONS_COLLECTION);

  // Validate user is participant
  const conversation = await conversationsCollection.findOne({
    _id: new ObjectId(conversationId),
    participantIds: userId,
  });

  if (!conversation) {
    throw new Error('Conversation not found or user is not a participant');
  }

  // Add user to hiddenBy array
  await conversationsCollection.updateOne(
    { _id: new ObjectId(conversationId) },
    {
      $addToSet: { hiddenBy: userId },
      $set: { updatedAt: new Date() },
    }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// User Note Operations (24h notes)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create user note (expires after 24 hours)
 */
export async function createUserNote(
  userId: string,
  targetUserId: string,
  note: string
): Promise<any> {
  const db = await getDb();
  const userNotesCollection = db.collection(USER_NOTES_COLLECTION);

  // Validate users exist
  const [currentUser, targetUser] = await Promise.all([
    getUserInfo(userId),
    getUserInfo(targetUserId),
  ]);

  if (!currentUser) {
    throw new Error('Current user not found');
  }

  if (!targetUser) {
    throw new Error('Target user not found');
  }

  // Create note
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

  const newNote = {
    userId,
    targetUserId,
    note: note.trim(),
    expiresAt,
    createdAt: now,
    updatedAt: now,
  };

  const result = await userNotesCollection.insertOne(newNote as any);
  (newNote as any)._id = result.insertedId;

  return newNote;
}

/**
 * Get user's notes (only active, not expired)
 */
export async function getUserNotes(userId: string): Promise<any[]> {
  const db = await getDb();
  const userNotesCollection = db.collection(USER_NOTES_COLLECTION);

  const notes = await userNotesCollection
    .find({
      userId,
      expiresAt: { $gt: new Date() }, // Only active notes
    })
    .sort({ createdAt: -1 })
    .toArray();

  return notes;
}

/**
 * Update user note
 */
export async function updateUserNote(noteId: string, userId: string, note: string): Promise<void> {
  const db = await getDb();
  const userNotesCollection = db.collection(USER_NOTES_COLLECTION);

  await userNotesCollection.updateOne(
    { _id: new ObjectId(noteId), userId },
    {
      $set: {
        note: note.trim(),
        updatedAt: new Date(),
      },
    }
  );
}

/**
 * Delete user note
 */
export async function deleteUserNote(noteId: string, userId: string): Promise<void> {
  const db = await getDb();
  const userNotesCollection = db.collection(USER_NOTES_COLLECTION);

  await userNotesCollection.deleteOne({
    _id: new ObjectId(noteId),
    userId,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Message Search Operations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Search messages in conversation
 */
export async function searchMessages(
  conversationId: string,
  userId: string,
  query: string
): Promise<{ messages: any[]; count: number }> {
  if (!ObjectId.isValid(conversationId)) {
    throw new Error('Invalid conversation ID');
  }

  const db = await getDb();
  const conversationsCollection = db.collection<MongoConversation>(CONVERSATIONS_COLLECTION);
  const messagesCollection = db.collection<MongoMessage>(MESSAGES_COLLECTION);

  // Validate user is participant
  const conversation = await conversationsCollection.findOne({
    _id: new ObjectId(conversationId),
    participantIds: userId,
  });

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  // Search in text and attachments filename
  const searchRegex = new RegExp(query, 'i');

  const messages = await messagesCollection
    .find({
      conversationId: new ObjectId(conversationId),
      isDeleted: false,
      $or: [
        { text: searchRegex },
        { 'attachments.filename': searchRegex },
      ],
    })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  return { messages, count: messages.length };
}

// ─────────────────────────────────────────────────────────────────────────────
// Sensitive Message Operations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reveal sensitive message
 */
export async function revealMessage(messageId: string, userId: string): Promise<void> {
  const db = await getDb();
  const messagesCollection = db.collection<MongoMessage>(MESSAGES_COLLECTION);

  const message = await messagesCollection.findOne({ _id: new ObjectId(messageId) });

  if (!message) {
    throw new Error('Message not found');
  }

  await messagesCollection.updateOne(
    { _id: new ObjectId(messageId) },
    {
      $addToSet: { revealedBy: userId },
      $set: { updatedAt: new Date() },
    }
  );
}
