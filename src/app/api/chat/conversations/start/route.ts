/**
 * POST /api/chat/conversations/start
 * Start or get existing conversation
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { startConversation } from '@/services/mongodb/chat.service';
import { StartConversationRequest } from '@/types/chat.types';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const currentUserId = session.user.id;

    // Parse request body
    const body: StartConversationRequest = await request.json();
    const { targetUserId, campaignId } = body;

    // Validate input
    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Target user ID is required' },
        { status: 400 }
      );
    }

    // Cannot chat with yourself
    if (targetUserId === currentUserId) {
      return NextResponse.json(
        { error: 'Cannot start conversation with yourself' },
        { status: 400 }
      );
    }

    // Start or get conversation
    const result = await startConversation(currentUserId, targetUserId, campaignId);

    return NextResponse.json({
      conversation: result.conversation,
      isNew: result.isNew,
    });
  } catch (error: any) {
    console.error('[API] Start conversation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start conversation' },
      { status: 500 }
    );
  }
}
