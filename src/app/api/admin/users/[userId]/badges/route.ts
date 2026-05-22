import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requireAdmin } from '@/lib/badge/badge.policy';
import { getUserBadges } from '@/lib/badge/badge.service';

/**
 * GET /api/admin/users/:userId/badges
 * Get all badges for a user (including revoked and expired)
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    requireAdmin(session?.user as any);

    const params = await context.params;
    const badges = await getUserBadges(params.userId, {
      includeRevoked: true,
      includeExpired: true,
      includeInactive: true,
    });

    return NextResponse.json(badges);
  } catch (error: any) {
    console.error('Error fetching user badges:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user badges' },
      { status: error.message === 'Admin access required' ? 403 : 500 }
    );
  }
}
