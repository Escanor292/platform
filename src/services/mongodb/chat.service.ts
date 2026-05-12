/**
 * Chat Service - MongoDB Operations
 * Handles conversations and messages
 */

import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { prisma } from '@/lib/prisma';
import {
  MongoConversation,
  MongoMessage,
  MongoChatReport,
  ConversationParticipant,
  ConversationCampaign,
  ChatReportReason,
} from '@/types/chat.types';

// ─────────────────────────────────────────────────────────────────────────────
// Collection Names
// ─────────────────────────────────────────────────────────────────────────────

const CONVERSATIONS_COLLECTION = 'conversations';
const MESSAGES_COLLECTION = 'messages';
const CHAT_REPORTS_COLLECTION = 'chat_reports';

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
  
  if (campaignId) {
    return `campaign_${campaignId}_${sortedUserIds[0]}_${sortedUserIds[1]}`;
  }
  
  return `direct_${sortedUserIds[0]}_${sortedUserIds[1]}`;
}

/**
 * Get user info from PostgreSQL
 */
async function getUserInfo(userId: string): Promise<ConversationParticipant | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      displayName: true,
      email: true,
      avatar: true,
      role: true,
    },
  });

  if (!user) return null;

  return {
    userId: user.id,
    name: user.displayName || user.name,
    email: user.email,
    avatarUrl: user.avatar || undefined,
    role: user.role,
  };
}

/**
 * Get campaign info from PostgreSQL
 */
async function getCampaignInfo(campaignId: string): Promise<ConversationCampaign | null> {
  const campaign = await prisma.campaign.findUnique({
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
    .find({ participantIds: userId })
    .sort({ updatedAt: -1 })
    .toArray();

  return conversations;
}

/**
 * Get conversation by ID
 */
export async function getConversationById(
  conversationId: string,
  userId: string
): Promise<MongoConversation | null> {
  const db = await getDb();
  const conversationsCollection = db.collection<MongoConversation>(CONVERSATIONS_COLLECTION);

  const conversation = await conversationsCollection.findOne({
    _id: new ObjectId(conversationId),
    participantIds: userId, // Ensure user is participant
  });

  return conversation;
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
  text: string
): Promise<MongoMessage> {
  const db = await getDb();
  const conversationsCollection = db.collection<MongoConversation>(CONVERSATIONS_COLLECTION);
  const messagesCollection = db.collection<MongoMessage>(MESSAGES_COLLECTION);

  // Validate conversation and user is participant
  const conversation = await conversationsCollection.findOne({
    _id: new ObjectId(conversationId),
    participantIds: senderId,
  });

  if (!conversation) {
    throw new Error('Conversation not found or user is not a participant');
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
  if (!trimmedText) {
    throw new Error('Message text cannot be empty');
  }

  if (trimmedText.length > 2000) {
    throw new Error('Message text is too long (max 2000 characters)');
  }

  // Get sender info
  const senderInfo = await getUserInfo(senderId);
  if (!senderInfo) {
    throw new Error('Sender not found');
  }

  // Create message
  const now = new Date();
  const newMessage: MongoMessage = {
    conversationId: new ObjectId(conversationId),
    senderId,
    senderName: senderInfo.name,
    senderAvatar: senderInfo.avatarUrl,
    text: trimmedText,
    type: 'text',
    attachments: [],
    readBy: [senderId], // Sender has read their own message
    isDeleted: false,
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
  const db = await getDb();
  const conversationsCollection = db.collection<MongoConversation>(CONVERSATIONS_COLLECTION);
  const messagesCollection = db.collection<MongoMessage>(MESSAGES_COLLECTION);

  // Validate user is participant
  const conversation = await conversationsCollection.findOne({
    _id: new ObjectId(conversationId),
    participantIds: userId,
  });

  if (!conversation) {
    throw new Error('Conversation not found or user is not a participant');
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

  return { messages: resultMessages, hasMore };
}

/**
 * Mark conversation as read
 */
export async function markAsRead(conversationId: string, userId: string): Promise<void> {
  const db = await getDb();
  const conversationsCollection = db.collection<MongoConversation>(CONVERSATIONS_COLLECTION);
  const messagesCollection = db.collection<MongoMessage>(MESSAGES_COLLECTION);

  // Validate user is participant
  const conversation = await conversationsCollection.findOne({
    _id: new ObjectId(conversationId),
    participantIds: userId,
  });

  if (!conversation) {
    throw new Error('Conversation not found or user is not a participant');
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
  messageId?: string
): Promise<MongoChatReport> {
  const db = await getDb();
  const conversationsCollection = db.collection<MongoConversation>(CONVERSATIONS_COLLECTION);
  const chatReportsCollection = db.collection<MongoChatReport>(CHAT_REPORTS_COLLECTION);

  // Validate user is participant
  const conversation = await conversationsCollection.findOne({
    _id: new ObjectId(conversationId),
    participantIds: reporterId,
  });

  if (!conversation) {
    throw new Error('Conversation not found or user is not a participant');
  }

  // Create report
  const now = new Date();
  const report: MongoChatReport = {
    conversationId: new ObjectId(conversationId),
    messageId: messageId ? new ObjectId(messageId) : null,
    reporterId,
    reason,
    description: description.trim(),
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
