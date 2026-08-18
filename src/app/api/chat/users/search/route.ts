/**
 * GET /api/chat/users/search
 * Search users by name or email
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { searchUsers } from '@/services/mongodb/chat.service';

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

    // Get query parameter
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        users: [],
      });
    }

    // Search users
    const users = await searchUsers(query, userId);

    return NextResponse.json({
      users,
    });
  } catch (error: any) {
    console.error('[API] Search users error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search users' },
      { status: 500 }
    );
  }
}
