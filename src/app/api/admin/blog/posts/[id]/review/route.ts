// ============================================================
// API: PATCH /api/admin/blog/posts/[id]/review - Review post
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notificationService } from '@/services/mongodb/notification.service';
import { applyBlogReview } from '@/lib/blog/blog-review';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true, role: true },
    });

    if (!user?.isAdmin && user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const params = await context.params;
    const { id } = params;
    const body = await request.json();

    const { status, reason } = body as { status?: string; reason?: string };

    if (!['PUBLISHED', 'REJECTED', 'ARCHIVED'].includes(status || '')) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    if (status === 'REJECTED' && !String(reason || '').trim()) {
      return NextResponse.json(
        { error: 'Cần nhập lý do từ chối để tác giả sửa bài' },
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

    await applyBlogReview({
      postId: id,
      status: status as 'PUBLISHED' | 'REJECTED' | 'ARCHIVED',
      reason: reason || null,
      reviewerId: session.user.id,
    });

    const post = await prisma.blog_posts.findUnique({ where: { id } });

    if (status === 'PUBLISHED' || status === 'REJECTED') {
      const trimmedReason = String(reason || '').trim();
      notificationService.send({
        userId: existingPost.authorId,
        type: status === 'PUBLISHED' ? 'BLOG_APPROVED' : 'BLOG_REJECTED',
        title: status === 'PUBLISHED' ? 'Bài viết đã được duyệt' : 'Bài viết chưa được duyệt',
        message:
          status === 'PUBLISHED'
            ? `Бài viết “${existingPost.title}” đã được Admin duyệt và có thể hiển thị công khai.`
            : `Bài viết “${existingPost.title}” bị từ chối.${trimmedReason ? ` Lý do: ${trimmedReason}` : ''} Hãy sửa và gửi duyệt lại.`,
        payload: {
          href: `/blog/editor?slug=${existingPost.slug}`,
          reason: trimmedReason || undefined,
        },
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
