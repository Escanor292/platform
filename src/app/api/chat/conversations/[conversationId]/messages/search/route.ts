/**
 * GET /api/chat/conversations/[conversationId]/messages/search
 * Search messages in conversation
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { searchMessages } from '@/services/mongodb/chat.service';

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

    // Get query parameter
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        messages: [],
        count: 0,
      });
    }

    // Search messages
    const result = await searchMessages(conversationId, userId, query);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API] Search messages error:', error);

    if (error.message === 'Invalid conversation ID') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error.message === 'Conversation not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to search messages' },
      { status: 500 }
    );
  }
}
