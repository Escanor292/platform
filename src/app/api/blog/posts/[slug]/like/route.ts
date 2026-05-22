// ============================================================
// API: POST /api/blog/posts/[slug]/like - Toggle like
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { toggleLike } from '@/lib/blog/blog.service';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await context.params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = params;

    // Get post ID from slug
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const result = await toggleLike(post.id, session.user.id);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API] POST /api/blog/posts/[slug]/like error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to toggle like' },
      { status: 500 }
    );
  }
}
