import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserBadges } from '@/lib/badge/badge.service';

/**
 * GET /api/me/badges
 * Get current user's active badges
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const badges = await getUserBadges(session.user.id as string);

    return NextResponse.json(badges);
  } catch (error: any) {
    console.error('Error fetching my badges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    );
  }
}
