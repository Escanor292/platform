import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { withdrawBlogPost } from '@/lib/blog/blog.service';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await context.params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const post = await prisma.blog_posts.findUnique({
      where: { slug: params.slug },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await withdrawBlogPost(post.id, session.user.id);
    return NextResponse.json({ success: true, status: 'DRAFT' });
  } catch (error: any) {
    console.error('[API] PATCH /api/blog/posts/[slug]/withdraw error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to withdraw post' },
      { status: error.message?.includes('permission') || error.message?.includes('rút') ? 403 : 500 }
    );
  }
}
