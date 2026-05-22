/**
 * POST /api/chat/conversations/[conversationId]/block
 * Block a conversation
 * 
 * DELETE /api/chat/conversations/[conversationId]/block
 * Unblock a conversation
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { blockConversation, unblockConversation } from '@/services/mongodb/chat.service';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ conversationId: string }> }
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
    const { conversationId } = await context.params;

    // Block conversation
    await blockConversation(conversationId, userId);

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error('[API] Block conversation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to block conversation' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ conversationId: string }> }
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
    const { conversationId } = await context.params;

    // Unblock conversation
    await unblockConversation(conversationId, userId);

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error('[API] Unblock conversation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to unblock conversation' },
      { status: 500 }
    );
  }
}
