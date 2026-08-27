/**
 * GET /api/chat/conversations/[conversationId]/messages
 * POST /api/chat/conversations/[conversationId]/messages
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getMessages, sendMessage } from '@/services/mongodb/chat.service';
import { SendMessageRequest } from '@/types/chat.types';

async function enrichCallEndDuration(
  conversationId: string,
  userId: string,
  text: string
): Promise<string> {
  try {
    const sig = JSON.parse(text);
    if (!sig || (sig.type !== 'end' && sig.type !== 'bye')) return text;
    if (typeof sig.duration === 'number' && sig.duration >= 0) return text;

    const result = await getMessages(conversationId, userId, 80);
    let startAt: Date | null = null;
    for (const m of result.messages) {
      if (m.type !== 'call-signal') continue;
      try {
        const s = JSON.parse(m.text);
        if (s?.type === 'accept') {
          startAt = new Date(m.createdAt);
          break;
        }
      } catch {
        /* ignore */
      }
    }
    if (!startAt) return text;
    sig.duration = Math.max(0, Math.floor((Date.now() - startAt.getTime()) / 1000));
    return JSON.stringify(sig);
  } catch {
    return text;
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { conversationId } = await context.params;

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '30');
    const before = searchParams.get('before') || undefined;

    const result = await getMessages(conversationId, userId, limit, before);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API] Get messages error:', error);

    if (error.message === 'Invalid conversation ID') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error.message === 'Conversation not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to get messages' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { conversationId } = await context.params;

    const body: SendMessageRequest & { type?: string } = await request.json();
    const { attachments, sensitive, type } = body;
    let text = body.text;

    const isCallSignal = type === 'call-signal';
    if (!text || (!text.trim() && !isCallSignal)) {
      return NextResponse.json(
        { error: 'Message text is required' },
        { status: 400 }
      );
    }
    if (isCallSignal) {
      try {
        JSON.parse(text);
      } catch {
        return NextResponse.json(
          { error: 'Invalid call signal payload' },
          { status: 400 }
        );
      }
      text = await enrichCallEndDuration(conversationId, userId, text);
    }

    const message = await sendMessage(conversationId, userId, text, attachments || [], sensitive || false, isCallSignal ? 'call-signal' : 'text');

    return NextResponse.json({
      message,
    });
  } catch (error: any) {
    console.error('[API] Send message error:', error);

    if (error.message === 'Invalid conversation ID') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error.message === 'Conversation not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error.message.includes('blocked')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}
