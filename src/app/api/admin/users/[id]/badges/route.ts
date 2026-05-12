import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requireAdmin } from '@/lib/badge/badge.policy';
import { getUserBadges } from '@/lib/badge/badge.service';

/**
 * GET /api/admin/users/:id/badges
 * Get all badges for a user (including revoked and expired)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    requireAdmin(session?.user);

    const badges = await getUserBadges(params.id, {
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
