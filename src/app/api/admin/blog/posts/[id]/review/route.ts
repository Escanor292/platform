// ============================================================
// API: PATCH /api/admin/blog/posts/[id]/review - Review post
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notificationService } from '@/services/mongodb/notification.service';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const params = await context.params;
    const { id } = params;
    const body = await request.json();

    const { status, reason } = body;

    if (!['PUBLISHED', 'REJECTED', 'ARCHIVED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const existingPost = await prisma.blog_posts.findUnique({
      where: { id },
      select: { id: true, slug: true, title: true, authorId: true },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const post = await prisma.blog_posts.update({
      where: { id },
      data: {
        status,
        publishedAt: status === 'PUBLISHED' ? new Date() : undefined,
      },
    });

    if (status === 'PUBLISHED' || status === 'REJECTED') {
      notificationService.send({
        userId: existingPost.authorId,
        type: status === 'PUBLISHED' ? 'BLOG_APPROVED' : 'BLOG_REJECTED',
        title: status === 'PUBLISHED' ? 'Bài viết đã được duyệt' : 'Bài viết chưa được duyệt',
        message: status === 'PUBLISHED'
          ? `Bài viết “${existingPost.title}” đã được Admin duyệt và có thể hiển thị công khai.`
          : `Bài viết “${existingPost.title}” chưa được Admin duyệt. Vui lòng kiểm tra và cập nhật lại nội dung.`,
        payload: { href: `/blog/${existingPost.slug}` },
      });
    }

    return NextResponse.json(post);
  } catch (error: any) {
    console.error('[API] PATCH /api/admin/blog/posts/[id]/review error:', error);
    return NextResponse.json(
      { error: 'Failed to review post' },
      { status: 500 }
    );
  }
}
