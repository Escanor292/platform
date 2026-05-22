import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requireAdmin } from '@/lib/badge/badge.policy';
import { revokeUserBadge } from '@/lib/badge/badge.service';
import { revokeBadgeSchema } from '@/lib/badge/badge.validation';

/**
 * POST /api/admin/user-badges/:id/revoke
 * Revoke user badge
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    requireAdmin(session?.user as any);

    const body = await request.json();
    const validated = revokeBadgeSchema.parse(body);

    const params = await context.params;
    const userBadge = await revokeUserBadge(
      session!.user!.id as string,
      params.id,
      validated.reason
    );

    return NextResponse.json(userBadge);
  } catch (error: any) {
    console.error('Error revoking badge:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to revoke badge' },
      { status: error.message === 'Admin access required' ? 403 : 500 }
    );
  }
}
