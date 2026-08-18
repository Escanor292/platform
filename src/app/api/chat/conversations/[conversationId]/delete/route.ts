/**
 * DELETE /api/chat/conversations/[conversationId]/delete
 * Soft delete conversation (hide for user)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { deleteConversation } from '@/services/mongodb/chat.service';

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

    // Delete conversation (soft delete)
    await deleteConversation(conversationId, userId);

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error('[API] Delete conversation error:', error);

    if (error.message === 'Invalid conversation ID') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error.message === 'Conversation not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to delete conversation' },
      { status: 500 }
    );
  }
}
