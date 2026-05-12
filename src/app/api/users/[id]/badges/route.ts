import { NextRequest, NextResponse } from 'next/server';
import { getPublicUserBadges } from '@/lib/badge/badge.service';

/**
 * GET /api/users/:id/badges
 * Get public active badges for a user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const badges = await getPublicUserBadges(params.id);
    return NextResponse.json(badges);
  } catch (error: any) {
    console.error('Error fetching user badges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user badges' },
      { status: 500 }
    );
  }
}
