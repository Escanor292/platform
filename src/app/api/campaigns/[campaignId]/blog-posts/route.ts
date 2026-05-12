// ============================================================
// API: GET /api/campaigns/[campaignId]/blog-posts
// Get blog posts for a specific campaign
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getBlogPostList } from '@/lib/blog/blog.service';

export async function GET(
  request: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const session = await auth();
    const { campaignId } = params;
    const searchParams = request.nextUrl.searchParams;

    const query = {
      campaignId,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      sort: (searchParams.get('sort') as any) || 'latest',
    };

    const result = await getBlogPostList(query, session?.user?.id);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API] GET /api/campaigns/[campaignId]/blog-posts error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch campaign blog posts' },
      { status: 500 }
    );
  }
}
