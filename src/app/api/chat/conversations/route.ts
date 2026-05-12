/**
 * GET /api/chat/conversations
 * Get user's conversations
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserConversations } from '@/services/mongodb/chat.service';

export async function GET(request: NextRequest) {
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

    // Get conversations
    const conversations = await getUserConversations(userId);

    return NextResponse.json({
      conversations,
    });
  } catch (error: any) {
    console.error('[API] Get conversations error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get conversations' },
      { status: 500 }
    );
  }
}
