// ============================================================
// API: GET /api/blog/posts/[slug]/comments - Get comments
// API: POST /api/blog/posts/[slug]/comments - Create comment
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPostComments, createComment } from '@/lib/blog/comment.service';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/blog/posts/[slug]/comments
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Get post ID from slug
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const comments = await getPostComments(post.id);

    return NextResponse.json(comments);
  } catch (error: any) {
    console.error('[API] GET /api/blog/posts/[slug]/comments error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/blog/posts/[slug]/comments
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = params;
    const body = await request.json();

    // Validate
    if (!body.content || body.content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    if (body.content.length > 1000) {
      return NextResponse.json(
        { error: 'Comment is too long (max 1000 characters)' },
        { status: 400 }
      );
    }

    // Get post ID from slug
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const comment = await createComment(
      post.id,
      session.user.id,
      body.content.trim(),
      body.parentId
    );

    return NextResponse.json(comment, { status: 201 });
  } catch (error: any) {
    console.error('[API] POST /api/blog/posts/[slug]/comments error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create comment' },
      { status: 500 }
    );
  }
}
