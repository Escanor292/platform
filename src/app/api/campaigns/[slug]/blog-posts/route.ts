import { NextRequest, NextResponse } from 'next/server';
import { getBlogPostsByCampaign } from '@/lib/blog/blog.service';

// ============================================================
// API: GET /api/campaigns/[slug]/blog-posts
// Get blog posts for a specific campaign
// ============================================================

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await context.params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || undefined;

    const result = await getBlogPostsByCampaign(params.slug, {
      page,
      limit,
      status: status as any,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API] GET /api/campaigns/[slug]/blog-posts error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch campaign blog posts' },
      { status: 500 }
    );
  }
}
