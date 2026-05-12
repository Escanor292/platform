// ============================================================
// API: PATCH /api/blog/posts/[slug]/publish - Publish post
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { publishBlogPost } from '@/lib/blog/blog.service';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
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

    await publishBlogPost(post.id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API] PATCH /api/blog/posts/[slug]/publish error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to publish post' },
      { status: error.message.includes('permission') ? 403 : 500 }
    );
  }
}
