import { NextRequest, NextResponse } from 'next/server';
import { getPublicBadges } from '@/lib/badge/badge.service';

/**
 * GET /api/badges
 * Get all active public badges
 */
export async function GET(request: NextRequest) {
  try {
    const badges = await getPublicBadges();
    return NextResponse.json(badges);
  } catch (error: any) {
    console.error('Error fetching public badges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    );
  }
}
