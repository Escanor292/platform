import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { applyBlogReview, MAX_BULK_REVIEW, normalizeRejectReason } from '@/lib/blog/blog-review';
import { notificationService } from '@/services/mongodb/notification.service';
import { createAuditLog } from '@/lib/audit';

export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const ids = Array.isArray(body.ids) ? body.ids.filter((id: unknown) => typeof id === 'string') : [];
    const status = body.status as string;
    const reason = body.reason as string | undefined;

    if (ids.length === 0) {
      return NextResponse.json({ error: 'Chọn ít nhất một bài viết' }, { status: 400 });
    }
    if (ids.length > MAX_BULK_REVIEW) {
      return NextResponse.json({ error: `Tối đa ${MAX_BULK_REVIEW} bài mỗi lần` }, { status: 400 });
    }
    if (!['PUBLISHED', 'REJECTED', 'ARCHIVED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    if (status === 'REJECTED' && !normalizeRejectReason(reason)) {
      return NextResponse.json({ error: 'Cần nhập lý do từ chối để tác giả sửa bài' }, { status: 400 });
    }

    const posts = await prisma.blog_posts.findMany({
      where: { id: { in: ids }, deletedAt: null },
      select: { id: true, slug: true, title: true, authorId: true, status: true },
    });

    for (const post of posts) {
      await applyBlogReview({
        postId: post.id,
        status: status as 'PUBLISHED' | 'REJECTED' | 'ARCHIVED',
        reason: reason || null,
        reviewerId: session.user.id,
      });
      await createAuditLog({
        userId: session.user.id,
        action: status === 'PUBLISHED' ? 'APPROVE' : status === 'REJECTED' ? 'REJECT' : 'UPDATE',
        entityType: 'blog_posts',
        entityId: post.id,
        oldValue: { status: post.status },
        newValue: { status, bulk: true },
        reason: reason || 'Duyệt hàng loạt',
      });
      if (status === 'PUBLISHED' || status === 'REJECTED') {
        const trimmedReason = normalizeRejectReason(reason);
        notificationService.send({
          userId: post.authorId,
          type: status === 'PUBLISHED' ? 'BLOG_APPROVED' : 'BLOG_REJECTED',
          title: status === 'PUBLISHED' ? 'Bài viết đã được duyệt' : 'Bài viết chưa được duyệt',
          message:
            status === 'PUBLISHED'
              ? `Bài viết “${post.title}” đã được Admin duyệt và có thể hiển thị công khai.`
              : `Bài viết “${post.title}” bị từ chối.${trimmedReason ? ` Lý do: ${trimmedReason}` : ''} Hãy sửa và gửi duyệt lại.`,
          payload: {
            href: status === 'PUBLISHED' ? `/blog/${post.slug}` : `/blog/editor?slug=${post.slug}`,
          },
        });
      }
    }

    return NextResponse.json({ success: true, updated: posts.length });
  } catch (error: any) {
    console.error('[API] PATCH /api/admin/blog/posts/bulk error:', error);
    return NextResponse.json({ error: 'Failed to bulk review' }, { status: 500 });
  }
}
