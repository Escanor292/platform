/**
 * POST /api/chat/conversations/[conversationId]/report
 * Report a conversation or message
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { reportConversation } from '@/services/mongodb/chat.service';
import { ReportConversationRequest } from '@/types/chat.types';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ conversationId: string} }>
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
    const { conversationId } = await params;

    // Parse request body
    const body: ReportConversationRequest = await request.json();
    const { messageId, reason, description } = body;

    // Validate input
    if (!reason) {
      return NextResponse.json(
        { error: 'Reason is required' },
        { status: 400 }
      );
    }

    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    // Report conversation
    const report = await reportConversation(
      conversationId,
      userId,
      reason,
      description,
      messageId
    );

    return NextResponse.json({
      report,
    });
  } catch (error: any) {
    console.error('[API] Report conversation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to report conversation' },
      { status: 500 }
    );
  }
}
