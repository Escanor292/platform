/**
 * Chat System TypeScript Types
 * MongoDB-based chat for 1-1 conversations
 */

import { ObjectId } from 'mongodb';

// ─────────────────────────────────────────────────────────────────────────────
// Base Types
// ─────────────────────────────────────────────────────────────────────────────

export interface MongoBase {
  _id?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// Conversation Types
// ─────────────────────────────────────────────────────────────────────────────

export type ConversationType = 'direct' | 'campaign' | 'admin_support';

export interface ConversationParticipant {
  userId: string; // PostgreSQL user.id
  name: string;
  email: string;
  avatarUrl?: string;
  role: string; // backer, creator, admin
}

export interface ConversationCampaign {
  campaignId: string; // PostgreSQL campaign.id
  title: string;
  coverImage?: string;
  currentAmount: number;
  goalAmount: number;
  ownerId: string;
}

export interface ConversationLastMessage {
  text: string;
  senderId: string;
  createdAt: Date;
}

export interface MongoConversation extends MongoBase {
  conversationKey: string; // Unique key: "campaign_{campaignId}_{userId1}_{userId2}" or "direct_{userId1}_{userId2}"
  type: ConversationType;
  participants: ConversationParticipant[];
  participantIds: string[]; // Array of PostgreSQL user IDs for quick lookup
  campaign?: ConversationCampaign; // Optional campaign info
  lastMessage?: ConversationLastMessage;
  unreadCount: Record<string, number>; // { userId: count }
  isActive: boolean;
  isReported: boolean;
  blockedBy: string[]; // Array of user IDs who blocked this conversation
}

// ─────────────────────────────────────────────────────────────────────────────
// Message Types
// ─────────────────────────────────────────────────────────────────────────────

export type MessageType = 'text' | 'image' | 'file';

export interface MessageAttachment {
  url: string;
  type: 'image' | 'file';
  filename?: string;
  size?: number;
}

export interface MongoMessage extends MongoBase {
  conversationId: ObjectId;
  senderId: string; // PostgreSQL user.id
  senderName: string;
  senderAvatar?: string;
  text: string;
  type: MessageType;
  attachments: MessageAttachment[];
  readBy: string[]; // Array of user IDs who read this message
  isDeleted: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Chat Report Types
// ─────────────────────────────────────────────────────────────────────────────

export type ChatReportReason = 'spam' | 'scam' | 'abuse' | 'other';
export type ChatReportStatus = 'pending' | 'reviewed' | 'rejected' | 'resolved';

export interface MongoChatReport extends MongoBase {
  conversationId: ObjectId;
  messageId?: ObjectId | null;
  reporterId: string; // PostgreSQL user.id
  reason: ChatReportReason;
  description: string;
  status: ChatReportStatus;
  reviewedAt?: Date | null;
  reviewedBy?: string | null; // Admin user ID
}

// ─────────────────────────────────────────────────────────────────────────────
// API Request/Response Types
// ─────────────────────────────────────────────────────────────────────────────

export interface StartConversationRequest {
  targetUserId: string;
  campaignId?: string;
}

export interface StartConversationResponse {
  conversation: MongoConversation;
  isNew: boolean;
}

export interface SendMessageRequest {
  text: string;
}

export interface SendMessageResponse {
  message: MongoMessage;
}

export interface GetMessagesQuery {
  limit?: number;
  before?: string; // ISO date string or message ID
}

export interface GetMessagesResponse {
  messages: MongoMessage[];
  hasMore: boolean;
}

export interface GetConversationsResponse {
  conversations: MongoConversation[];
}

export interface ReportConversationRequest {
  messageId?: string;
  reason: ChatReportReason;
  description: string;
}

export interface MarkAsReadResponse {
  success: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Socket.IO Event Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SocketJoinConversationPayload {
  conversationId: string;
}

export interface SocketLeaveConversationPayload {
  conversationId: string;
}

export interface SocketSendMessagePayload {
  conversationId: string;
  text: string;
}

export interface SocketTypingPayload {
  conversationId: string;
  isTyping: boolean;
}

export interface SocketNewMessagePayload {
  conversationId: string;
  message: MongoMessage;
}

export interface SocketConversationUpdatedPayload {
  conversation: MongoConversation;
}

export interface SocketMessagesReadPayload {
  conversationId: string;
  userId: string;
}

export interface SocketTypingEventPayload {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}
