// ============================================================
// API: GET /api/blog/posts - List blog posts
// API: POST /api/blog/posts - Create blog post
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createBlogPost, getBlogPostList } from '@/lib/blog/blog.service';
import { CreateBlogPostRequest } from '@/types/blog.types';

/**
 * GET /api/blog/posts
 * Public endpoint - list published blog posts
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const searchParams = request.nextUrl.searchParams;

    const query = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      tag: searchParams.get('tag') || undefined,
      type: searchParams.get('type') || undefined,
      campaignId: searchParams.get('campaignId') || undefined,
      featured: searchParams.get('featured') === 'true' || undefined,
      sort: (searchParams.get('sort') as any) || 'latest',
    };

    const result = await getBlogPostList(query, session?.user?.id);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API] GET /api/blog/posts error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/blog/posts
 * Auth required - create new blog post
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateBlogPostRequest = await request.json();

    // Validate required fields
    if (!body.title || !body.type || !body.visibility) {
      return NextResponse.json(
        { error: 'Missing required fields: title, type, visibility' },
        { status: 400 }
      );
    }

    // Validate campaign_update requires campaignId
    if (body.type === 'CAMPAIGN_UPDATE' && !body.campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required for campaign updates' },
        { status: 400 }
      );
    }

    const post = await createBlogPost(session.user.id, body);

    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    console.error('[API] POST /api/blog/posts error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create blog post' },
      { status: 500 }
    );
  }
}
