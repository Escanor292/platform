// API: GET /api/blog/posts/[slug]/comments - Get comments
// API: POST /api/blog/posts/[slug]/comments - Create comment
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPostComments, createComment } from '@/lib/blog/comment.service';
import { prisma } from '@/lib/prisma';
import { notificationService } from '@/services/mongodb/notification.service';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const post = await prisma.blog_posts.findUnique({ where: { slug }, select: { id: true } });
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    return NextResponse.json(await getPostComments(post.id));
  } catch (error: any) {
    console.error('[API] GET /api/blog/posts/[slug]/comments error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    if (!body.content || body.content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }
    if (body.content.length > 1000) {
      return NextResponse.json({ error: 'Comment is too long (max 1000 characters)' }, { status: 400 });
    }

    const post = await prisma.blog_posts.findUnique({
      where: { slug },
      select: { id: true, title: true, authorId: true },
    });
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    const parentComment = body.parentId
      ? await prisma.blog_comments.findUnique({ where: { id: body.parentId }, select: { userId: true } })
      : null;

    const comment = await createComment(post.id, session.user.id, body.content.trim(), body.parentId);
    const recipientId = parentComment?.userId && parentComment.userId !== session.user.id
      ? parentComment.userId
      : post.authorId !== session.user.id
        ? post.authorId
        : null;

    if (recipientId) {
      const isReply = Boolean(parentComment?.userId && parentComment.userId !== session.user.id);
      notificationService.send({
        userId: recipientId,
        type: isReply ? 'COMMENT_REPLY' : 'COMMENT_RECEIVED',
        title: isReply ? 'Có phản hồi bình luận mới' : 'Bài viết có bình luận mới',
        message: `${session.user.name || 'Một người dùng'} đã ${isReply ? 'phản hồi bình luận' : 'bình luận'} trong bài viết “${post.title}”.`,
        payload: { href: `/blog/${slug}`, commentId: comment.id },
      });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error: any) {
    console.error('[API] POST /api/blog/posts/[slug]/comments error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create comment' }, { status: 500 });
  }
}
