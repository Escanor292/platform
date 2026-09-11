/**
 * Chat service — PostgreSQL/Prisma implementation.
 * Giữ nguyên tên hàm public để không phá caller hiện tại.
 */

import { prisma } from '@/lib/prisma';
import { normalizePrivacySettings } from '@/lib/profile-settings';
import { listFollowingIds } from '@/lib/user-follows';
import type {
    ConversationParticipant,
    ConversationCampaign,
    ChatReportReason,
    MessageReaction,
} from '@/types/chat.types';

export const DELETED_USER_LABEL = 'Người dùng đã xóa';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function generateConversationKey(
    userId1: string,
    userId2: string,
    _campaignId?: string
): string {
    const sorted = [userId1, userId2].sort();
    return `direct_${sorted[0]}_${sorted[1]}`;
}

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
        return {
            userId,
            name: DELETED_USER_LABEL,
            email: '',
            role: 'deleted',
            deleted: true,
        } as unknown as ConversationParticipant;
    }
    const priv = normalizePrivacySettings(user.role, user.privacySettings);
    return {
        userId: user.id,
        name: user.displayName || user.name,
        email: priv.email ? user.email : '',
        avatarUrl: user.avatar ?? undefined,
        role: user.role,
        deleted: false,
    };
}

async function getCampaignInfo(campaignId: string): Promise<ConversationCampaign | null> {
    const c = await prisma.campaigns.findUnique({
        where: { id: campaignId },
        select: {
            id: true,
            title: true,
            imageUrl: true,
            currentAmount: true,
            goalAmount: true,
            creatorId: true,
        },
    });
    if (!c) return null;
    return {
        campaignId: c.id,
        title: c.title,
        coverImage: c.imageUrl ?? undefined,
        currentAmount: Number(c.currentAmount),
        goalAmount: Number(c.goalAmount),
        ownerId: c.creatorId,
    };
}

/** Chuyển Prisma row → shape tương thích MongoDB (có _id.toString()) */
function serializeConv(conv: any) {
    return {
        ...conv,
        _id: { toString: () => conv.id },
        participants: Array.isArray(conv.participants) ? conv.participants : [],
        participantIds: Array.isArray(conv.participantIds) ? conv.participantIds : [],
        unreadCount: typeof conv.unreadCount === 'object' ? conv.unreadCount : {},
        blockedBy: Array.isArray(conv.blockedBy) ? conv.blockedBy : [],
        hiddenBy: Array.isArray(conv.hiddenBy) ? conv.hiddenBy : [],
        typingBy: typeof conv.typingBy === 'object' ? conv.typingBy : {},
        campaign: (conv.campaignData as ConversationCampaign | null) ?? undefined,
    };
}

function serializeMsg(msg: any) {
    return {
        ...msg,
        _id: { toString: () => msg.id },
        conversationId: msg.conversationId,
        reactions: (msg.message_reactions ?? []).map((r: any) => ({
            emoji: r.emoji,
            userIds: r.userIds,
        })) as MessageReaction[],
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Conversations
// ─────────────────────────────────────────────────────────────────────────────

export async function startConversation(
    currentUserId: string,
    targetUserId: string,
    campaignId?: string
): Promise<{ conversation: any; isNew: boolean }> {
    const [currentUser, targetUser] = await Promise.all([
        getUserInfo(currentUserId),
        getUserInfo(targetUserId),
    ]);
    if (!currentUser) throw new Error('Current user not found');
    if (!targetUser) throw new Error('Target user not found');

    let campaignInfo: ConversationCampaign | undefined;
    if (campaignId) {
        const c = await getCampaignInfo(campaignId);
        if (!c) throw new Error('Campaign not found');
        if (c.ownerId !== targetUserId) throw new Error('Target user is not the campaign owner');
        campaignInfo = c;
    }

    const conversationKey = generateConversationKey(currentUserId, targetUserId);
    const existing = await prisma.conversations.findUnique({ where: { conversationKey } });

    if (existing) {
        if (campaignId && (existing.campaignData as any)?.campaignId !== campaignId) {
            const ci = await getCampaignInfo(campaignId);
            if (ci) {
                await prisma.conversations.update({
                    where: { id: existing.id },
                    data: { campaignData: ci as any, type: 'campaign' },
                });
            }
        }
        return { conversation: serializeConv(existing), isNew: false };
    }

    const conv = await prisma.conversations.create({
        data: {
            conversationKey,
            type: campaignId ? 'campaign' : 'direct',
            participants: [currentUser, targetUser] as any,
            participantIds: [currentUserId, targetUserId],
            campaignData: campaignInfo ? (campaignInfo as any) : undefined,
            unreadCount: { [currentUserId]: 0, [targetUserId]: 0 } as any,
        },
    });
    return { conversation: serializeConv(conv), isNew: true };
}

export async function getUserConversations(userId: string) {
    const convs = await prisma.conversations.findMany({
        where: {
            participantIds: { has: userId },
            NOT: { hiddenBy: { has: userId } },
        },
        orderBy: { updatedAt: 'desc' },
    });
    return convs.map(serializeConv);
}

export async function getConversationById(conversationId: string, userId: string) {
    const conv = await prisma.conversations.findFirst({
        where: { id: conversationId, participantIds: { has: userId } },
    });
    return conv ? serializeConv(conv) : null;
}

/** Bổ sung flag deleted cho participants — no-op vì participants đã denorm ở JSON */
export async function enrichDeletedUsers<
    T extends { participants: ConversationParticipant[]; participantIds: string[] },
>(items: T[]): Promise<T[]> {
    return items;
}

// ─────────────────────────────────────────────────────────────────────────────
// Messages
// ─────────────────────────────────────────────────────────────────────────────

export async function sendMessage(
    conversationId: string,
    senderId: string,
    text: string,
    attachments: any[] = [],
    sensitive = false,
    type: string = 'text'
): Promise<any> {
    const conv = await prisma.conversations.findFirst({
        where: { id: conversationId, participantIds: { has: senderId } },
    });
    if (!conv) throw new Error('Conversation not found');

    const blockedBy = (conv.blockedBy as string[]) ?? [];
    if (blockedBy.includes(senderId)) throw new Error('You have blocked this conversation');

    const trimmed = text.trim();
    if (!trimmed && attachments.length === 0)
        throw new Error('Message text or attachments are required');
    if (trimmed.length > 2000) throw new Error('Message text is too long (max 2000 characters)');

    const senderInfo = await getUserInfo(senderId);
    if (!senderInfo) throw new Error('Sender not found');

    let msgType = type !== 'text' ? type : 'text';
    if (msgType === 'text' && attachments.length > 0) {
        const ft = attachments[0]?.type;
        msgType = ft === 'image' ? 'image' : ft === 'voice' ? 'voice' : 'file';
    }

    const now = new Date();
    const msg = await prisma.messages.create({
        data: {
            conversationId,
            senderId,
            senderName: senderInfo.name,
            senderAvatar: senderInfo.avatarUrl ?? null,
            text: trimmed,
            type: msgType,
            attachments: (attachments || []) as any,
            readBy: [senderId],
            sensitive,
            revealedBy: sensitive ? [senderId] : [],
        },
    });

    const unreadCount = { ...((conv.unreadCount as any) ?? {}) };
    for (const pid of (conv.participantIds as string[]) ?? []) {
        unreadCount[pid] = pid === senderId ? 0 : (unreadCount[pid] || 0) + 1;
    }

    await prisma.conversations.update({
        where: { id: conversationId },
        data: {
            lastMessage: { text: trimmed, senderId, type: msgType, createdAt: now } as any,
            unreadCount: unreadCount as any,
        },
    });

    return serializeMsg({ ...msg, message_reactions: [] });
}

export async function getMessages(
    conversationId: string,
    userId: string,
    limit = 30,
    before?: string
): Promise<{ messages: any[]; hasMore: boolean }> {
    const conv = await prisma.conversations.findFirst({
        where: { id: conversationId, participantIds: { has: userId } },
    });
    if (!conv) throw new Error('Conversation not found');

    const where: any = { conversationId, isDeleted: false };
    if (before) where.createdAt = { lt: new Date(before) };

    const msgs = await prisma.messages.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit + 1,
        include: { message_reactions: true },
    });

    const hasMore = msgs.length > limit;
    return { messages: msgs.slice(0, limit).map(serializeMsg), hasMore };
}

export async function markAsRead(conversationId: string, userId: string): Promise<void> {
    const conv = await prisma.conversations.findFirst({
        where: { id: conversationId, participantIds: { has: userId } },
    });
    if (!conv) throw new Error('Conversation not found');

    const unreadCount = { ...((conv.unreadCount as any) ?? {}), [userId]: 0 };
    await prisma.conversations.update({
        where: { id: conversationId },
        data: { unreadCount: unreadCount as any },
    });
}

export async function deleteMessage(messageId: string, userId: string): Promise<void> {
    const msg = await prisma.messages.findUnique({ where: { id: messageId } });
    if (!msg) throw new Error('Message not found');
    if (msg.senderId !== userId) throw new Error('You can only delete your own messages');
    await prisma.messages.update({
        where: { id: messageId },
        data: { isDeleted: true, text: '' },
    });
}

export async function toggleMessageReaction(
    messageId: string,
    userId: string,
    emoji: string
): Promise<MessageReaction[] | null> {
    const trimmed = emoji.trim();
    if (!trimmed) throw new Error('Invalid emoji');

    const existing = await prisma.message_reactions.findUnique({
        where: { messageId_emoji: { messageId, emoji: trimmed } },
    });

    if (existing) {
        const hasUser = (existing.userIds as string[]).includes(userId);
        if (hasUser) {
            const newIds = (existing.userIds as string[]).filter((id) => id !== userId);
            if (newIds.length === 0) {
                await prisma.message_reactions.delete({
                    where: { messageId_emoji: { messageId, emoji: trimmed } },
                });
            } else {
                await prisma.message_reactions.update({
                    where: { messageId_emoji: { messageId, emoji: trimmed } },
                    data: { userIds: newIds },
                });
            }
        } else {
            await prisma.message_reactions.update({
                where: { messageId_emoji: { messageId, emoji: trimmed } },
                data: { userIds: { push: userId } },
            });
        }
    } else {
        await prisma.message_reactions.create({
            data: { messageId, emoji: trimmed, userIds: [userId] },
        });
    }

    const reactions = await prisma.message_reactions.findMany({ where: { messageId } });
    return reactions.map((r) => ({ emoji: r.emoji, userIds: r.userIds as string[] }));
}

export async function revealMessage(messageId: string, userId: string): Promise<void> {
    const msg = await prisma.messages.findUnique({ where: { id: messageId } });
    if (!msg) throw new Error('Message not found');
    const revealed = (msg.revealedBy as string[]) ?? [];
    if (!revealed.includes(userId)) {
        await prisma.messages.update({
            where: { id: messageId },
            data: { revealedBy: [...revealed, userId] },
        });
    }
}

export async function searchMessages(
    conversationId: string,
    userId: string,
    query: string
): Promise<{ messages: any[]; count: number }> {
    const conv = await prisma.conversations.findFirst({
        where: { id: conversationId, participantIds: { has: userId } },
    });
    if (!conv) throw new Error('Conversation not found');

    const messages = await prisma.messages.findMany({
        where: {
            conversationId,
            isDeleted: false,
            text: { contains: query, mode: 'insensitive' },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { message_reactions: true },
    });
    return { messages: messages.map(serializeMsg), count: messages.length };
}

// ─────────────────────────────────────────────────────────────────────────────
// Block / Report / Delete conversation
// ─────────────────────────────────────────────────────────────────────────────

export async function blockConversation(
    conversationId: string,
    userId: string
): Promise<void> {
    const conv = await prisma.conversations.findFirst({
        where: { id: conversationId, participantIds: { has: userId } },
    });
    if (!conv) throw new Error('Conversation not found or user is not a participant');
    const blocked = (conv.blockedBy as string[]) ?? [];
    if (!blocked.includes(userId)) {
        await prisma.conversations.update({
            where: { id: conversationId },
            data: { blockedBy: [...blocked, userId] },
        });
    }
}

export async function unblockConversation(
    conversationId: string,
    userId: string
): Promise<void> {
    const conv = await prisma.conversations.findUnique({ where: { id: conversationId } });
    if (!conv) return;
    const blocked = ((conv.blockedBy as string[]) ?? []).filter((id) => id !== userId);
    await prisma.conversations.update({
        where: { id: conversationId },
        data: { blockedBy: blocked },
    });
}

export async function deleteConversation(
    conversationId: string,
    userId: string
): Promise<void> {
    const conv = await prisma.conversations.findFirst({
        where: { id: conversationId, participantIds: { has: userId } },
    });
    if (!conv) throw new Error('Conversation not found or user is not a participant');
    const hidden = (conv.hiddenBy as string[]) ?? [];
    if (!hidden.includes(userId)) {
        await prisma.conversations.update({
            where: { id: conversationId },
            data: { hiddenBy: [...hidden, userId] },
        });
    }
}

export async function reportConversation(
    conversationId: string,
    reporterId: string,
    reason: ChatReportReason,
    description: string,
    messageId?: string,
    extras?: { imageUrls?: string[]; occurredAt?: Date | null }
): Promise<any> {
    const conv = await prisma.conversations.findFirst({
        where: { id: conversationId, participantIds: { has: reporterId } },
    });
    if (!conv) throw new Error('Conversation not found');

    const report = await prisma.chat_reports.create({
        data: {
            conversationId,
            messageId: messageId ?? null,
            reporterId,
            reason,
            description: description.trim(),
            imageUrls: extras?.imageUrls?.slice(0, 5) ?? [],
            occurredAt: extras?.occurredAt ?? null,
        },
    });
    await prisma.conversations.update({
        where: { id: conversationId },
        data: { isReported: true },
    });
    return report;
}

// ─────────────────────────────────────────────────────────────────────────────
// Unread count
// ─────────────────────────────────────────────────────────────────────────────

export async function getTotalUnreadCount(userId: string): Promise<number> {
    const convs = await prisma.conversations.findMany({
        where: { participantIds: { has: userId } },
        select: { unreadCount: true },
    });
    return convs.reduce(
        (sum, c) => sum + (((c.unreadCount as any)?.[userId]) || 0),
        0
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// User search
// ─────────────────────────────────────────────────────────────────────────────

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
        take: 10,
    });
    return users.map((u) => ({
        id: u.id,
        name: u.displayName || u.name,
        email: normalizePrivacySettings(u.role, u.privacySettings).email ? u.email : null,
        avatar: u.avatar,
        role: u.role,
    }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Typing indicator
// ─────────────────────────────────────────────────────────────────────────────

export async function setTypingIndicator(
    conversationId: string,
    userId: string,
    isTyping: boolean
): Promise<void> {
    const conv = await prisma.conversations.findUnique({ where: { id: conversationId } });
    if (!conv) return;
    const typingBy: any = { ...((conv.typingBy as any) ?? {}) };
    if (isTyping) {
        typingBy[userId] = Date.now();
    } else {
        delete typingBy[userId];
    }
    await prisma.conversations.update({
        where: { id: conversationId },
        data: { typingBy: typingBy as any },
    });
}

export async function getTypingUsers(
    conversationId: string,
    currentUserId: string
): Promise<string[]> {
    const conv = await prisma.conversations.findUnique({ where: { id: conversationId } });
    if (!conv?.typingBy) return [];
    const now = Date.now();
    return Object.entries((conv.typingBy as Record<string, number>) ?? {})
        .filter(([uid, ts]) => uid !== currentUserId && now - ts < 5000)
        .map(([uid]) => uid);
}

// ─────────────────────────────────────────────────────────────────────────────
// User Notes (24h)
// ─────────────────────────────────────────────────────────────────────────────

export async function createUserNote(
    userId: string,
    targetUserId: string,
    note: string
): Promise<any> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const existing = await prisma.user_notes.findFirst({
        where: { userId, targetUserId, expiresAt: { gt: now } },
        orderBy: { updatedAt: 'desc' },
    });
    if (existing) {
        return prisma.user_notes.update({
            where: { id: existing.id },
            data: { note: note.trim(), expiresAt },
        });
    }
    return prisma.user_notes.create({
        data: { userId, targetUserId, note: note.trim(), expiresAt },
    });
}

export async function getUserNotes(userId: string): Promise<any[]> {
    return prisma.user_notes.findMany({
        where: { userId, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: 'desc' },
    });
}

export async function getActiveSelfNote(userId: string): Promise<string | null> {
    try {
        const row = await prisma.user_notes.findFirst({
            where: { userId, targetUserId: userId, expiresAt: { gt: new Date() } },
            orderBy: { updatedAt: 'desc' },
        });
        return row?.note.trim() || null;
    } catch {
        return null;
    }
}

export async function getInboxNotes(userId: string): Promise<any[]> {
    const followingIds = await listFollowingIds(userId);
    const authorIds = [userId, ...followingIds];

    const [notes, users] = await Promise.all([
        prisma.user_notes.findMany({
            where: { userId: { in: authorIds }, expiresAt: { gt: new Date() } },
            orderBy: { updatedAt: 'desc' },
        }),
        prisma.users.findMany({
            where: { id: { in: authorIds } },
            select: { id: true, name: true, displayName: true, avatar: true },
        }),
    ]);

    const byId = new Map(users.map((u) => [u.id, u]));
    const latestByUser = new Map<string, any>();
    for (const row of notes) {
        if (!latestByUser.has(row.userId)) latestByUser.set(row.userId, row);
    }

    return authorIds
        .map((ownerId) => {
            const row = latestByUser.get(ownerId);
            const user = byId.get(ownerId);
            if (!user && ownerId !== userId) return null;
            return {
                id: row?.id || ownerId,
                userId: ownerId,
                note: row?.note || '',
                expiresAt: row?.expiresAt || null,
                isOwn: ownerId === userId,
                name: user?.displayName || user?.name || 'Người dùng',
                avatar: user?.avatar || undefined,
            };
        })
        .filter(Boolean);
}

export async function updateUserNote(
    noteId: string,
    userId: string,
    note: string
): Promise<void> {
    await prisma.user_notes.updateMany({
        where: { id: noteId, userId },
        data: { note: note.trim() },
    });
}

export async function deleteUserNote(noteId: string, userId: string): Promise<void> {
    await prisma.user_notes.deleteMany({ where: { id: noteId, userId } });
}
