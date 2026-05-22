import { NextRequest, NextResponse } from 'next/server';
import { getBlogPostList } from '@/lib/blog/blog.service';

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

    // Get campaign by slug first
    const { prisma } = await import('@/lib/prisma');
    const campaign = await prisma.campaign.findUnique({
      where: { slug: params.slug },
      select: { id: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const result = await getBlogPostList({
      page,
      limit,
      campaignId: campaign.id,
      type: 'CAMPAIGN_UPDATE',
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
