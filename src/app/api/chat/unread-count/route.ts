/**
 * GET /api/chat/unread-count
 * Get total unread message count for current user
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getTotalUnreadCount } from '@/services/mongodb/chat.service';

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

    // Get total unread count
    const unreadCount = await getTotalUnreadCount(userId);

    return NextResponse.json({
      unreadCount,
    });
  } catch (error: any) {
    console.error('[API] Get unread count error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get unread count' },
      { status: 500 }
    );
  }
}
