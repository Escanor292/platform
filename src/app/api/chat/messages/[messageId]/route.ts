/**
 * DELETE /api/chat/messages/[messageId]
 * Delete a message (soft delete)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { deleteMessage } from '@/services/mongodb/chat.service';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ messageId: string }> }
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
    const { messageId } = await context.params;

    // Delete message
    await deleteMessage(messageId, userId);

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error('[API] Delete message error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete message' },
      { status: 500 }
    );
  }
}
