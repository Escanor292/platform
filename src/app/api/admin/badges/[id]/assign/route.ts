import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requireAdmin } from '@/lib/badge/badge.policy';
import { assignBadge } from '@/lib/badge/badge.service';
import { assignBadgeSchema } from '@/lib/badge/badge.validation';

/**
 * POST /api/admin/badges/:id/assign
 * Assign badge to user
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    requireAdmin(session?.user as any);

    const body = await request.json();
    const validated = assignBadgeSchema.parse(body);

    const params = await context.params;
    const userBadge = await assignBadge(session!.user!.id!, params.id, validated);

    return NextResponse.json(userBadge, { status: 201 });
  } catch (error: any) {
    console.error('Error assigning badge:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to assign badge' },
      {
        status:
          error.message === 'Admin access required'
            ? 403
            : error.message === 'User not found' ||
              error.message === 'Badge not found'
              ? 404
              : error.message === 'User already has this active badge'
                ? 409
                : 500,
      }
    );
  }
}
