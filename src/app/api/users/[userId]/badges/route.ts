import { NextRequest, NextResponse } from 'next/server';
import { getPublicUserBadges } from '@/lib/badge/badge.service';

/**
 * GET /api/users/:userId/badges
 * Get public active badges for a user
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<Promise<{ userId: string> }> }
) {
  try {
    const { userId } = await params;
    const badges = await getPublicUserBadges(userId);
    return NextResponse.json(badges);
  } catch (error: any) {
    console.error('Error fetching user badges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user badges' },
      { status: 500 }
    );
  }
}
