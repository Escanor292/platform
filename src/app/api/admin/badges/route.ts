import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requireAdmin } from '@/lib/badge/badge.policy';
import { createBadge, getBadges } from '@/lib/badge/badge.service';
import {
  createBadgeSchema,
  badgeListQuerySchema,
} from '@/lib/badge/badge.validation';

/**
 * GET /api/admin/badges
 * Get badges list with filters
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    requireAdmin(session?.user as any);

    const { searchParams } = new URL(request.url);
    const query = {
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
      search: searchParams.get('search') || undefined,
      type: searchParams.get('type') || undefined,
      isActive: searchParams.get('isActive') || undefined,
    };

    const validated = badgeListQuerySchema.parse(query);
    const result = await getBadges(validated);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching badges:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch badges' },
      { status: error.message === 'Admin access required' ? 403 : 500 }
    );
  }
}

/**
 * POST /api/admin/badges
 * Create a new badge
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    requireAdmin(session?.user as any);

    const body = await request.json();
    const validated = createBadgeSchema.parse(body);

    const badge = await createBadge(session!.user!.id as string, validated);

    return NextResponse.json(badge, { status: 201 });
  } catch (error: any) {
    console.error('Error creating badge:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create badge' },
      { status: error.message === 'Admin access required' ? 403 : 500 }
    );
  }
}
