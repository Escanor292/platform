import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requireAdmin } from '@/lib/badge/badge.policy';
import {
  getBadgeById,
  updateBadge,
  deleteBadge,
} from '@/lib/badge/badge.service';
import { updateBadgeSchema } from '@/lib/badge/badge.validation';

/**
 * GET /api/admin/badges/:id
 * Get badge details
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    requireAdmin(session?.user as any);

    const params = await context.params;
    const badge = await getBadgeById(params.id);

    if (!badge) {
      return NextResponse.json({ error: 'Badge not found' }, { status: 404 });
    }

    return NextResponse.json(badge);
  } catch (error: any) {
    console.error('Error fetching badge:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch badge' },
      { status: error.message === 'Admin access required' ? 403 : 500 }
    );
  }
}

/**
 * PATCH /api/admin/badges/:id
 * Update badge
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    requireAdmin(session?.user as any);

    const body = await request.json();
    const validated = updateBadgeSchema.parse(body);

    const params = await context.params;
    const badge = await updateBadge(params.id, validated);

    return NextResponse.json(badge);
  } catch (error: any) {
    console.error('Error updating badge:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update badge' },
      { status: error.message === 'Admin access required' ? 403 : 500 }
    );
  }
}

/**
 * DELETE /api/admin/badges/:id
 * Soft delete badge
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    requireAdmin(session?.user as any);

    const params = await context.params;
    await deleteBadge(params.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting badge:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete badge' },
      { status: error.message === 'Admin access required' ? 403 : 500 }
    );
  }
}
