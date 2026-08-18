/**
 * POST /api/chat/conversations/[conversationId]/typing
 * Set typing indicator for conversation
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { setTypingIndicator, getTypingUsers } from '@/services/mongodb/chat.service';
import { TypingIndicatorRequest } from '@/types/chat.types';

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

    // Parse request body
    const body: TypingIndicatorRequest = await request.json();
    const { isTyping } = body;

    // Validate input
    if (typeof isTyping !== 'boolean') {
      return NextResponse.json(
        { error: 'isTyping must be a boolean' },
        { status: 400 }
      );
    }

    // Set typing indicator
    await setTypingIndicator(conversationId, userId, isTyping);

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error('[API] Set typing indicator error:', error);

    if (error.message === 'Invalid conversation ID') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to set typing indicator' },
      { status: 500 }
    );
  }
}

export async function GET(
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

    // Get typing users
    const typingUsers = await getTypingUsers(conversationId, userId);

    return NextResponse.json({
      typingUsers,
    });
  } catch (error: any) {
    console.error('[API] Get typing users error:', error);

    if (error.message === 'Invalid conversation ID') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to get typing users' },
      { status: 500 }
    );
  }
}
