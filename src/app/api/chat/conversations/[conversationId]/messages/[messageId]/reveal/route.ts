/**
 * POST /api/chat/conversations/[conversationId]/messages/[messageId]/reveal
 * Reveal sensitive message
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { revealMessage } from '@/services/mongodb/chat.service';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ conversationId: string; messageId: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { conversationId, messageId } = await context.params;

    // Reveal message
    await revealMessage(messageId, userId);

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error('[API] Reveal message error:', error);

    if (error.message === 'Message not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to reveal message' },
      { status: 500 }
    );
  }
}
