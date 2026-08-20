/**
 * PATCH /api/chat/conversations/[conversationId]/messages/[messageId]/reaction
 * Toggle an emoji reaction on a message
 */

import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { toggleMessageReaction } from '@/services/mongodb/chat.service';

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{ conversationId: string; messageId: string }>;
  }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;
    const { conversationId, messageId } = await context.params;

    // Kiểm tra người dùng là thành viên của cuộc trò chuyện
    const db = await getDb();
    const conv = await db.collection('conversations').findOne({
      _id: new ObjectId(conversationId),
      participantIds: userId,
    });
    if (!conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const body = await request.json();
    const emoji = body?.emoji;
    if (!emoji || typeof emoji !== 'string' || !emoji.trim()) {
      return NextResponse.json({ error: 'Emoji is required' }, { status: 400 });
    }

    // Đảm bảo tin nhắn thuộc conversation này
    const message = await db.collection('messages').findOne({
      _id: new ObjectId(messageId),
      conversationId: new ObjectId(conversationId),
    });
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const reactions = await toggleMessageReaction(messageId, userId, emoji.trim());
    return NextResponse.json({ reactions });
  } catch (error: any) {
    console.error('[API] Toggle reaction error:', error);
    if (error.message === 'Message not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error.message === 'Conversation not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to toggle reaction' },
      { status: 500 }
    );
  }
}
