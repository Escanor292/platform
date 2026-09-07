import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notificationService } from '@/services/mongodb/notification.service';
import { applyBlogReview, normalizeRejectReason, saveReviewerNote } from '@/lib/blog/blog-review';
import { createAuditLog } from '@/lib/audit';

async function requireAdmin(userId?: string) {
  if (!userId) return null;
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { id: true, isAdmin: true, role: true },
  });
  if (!user?.isAdmin && user?.role !== 'ADMIN') return null;
  return user;
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const admin = await requireAdmin(session?.user?.id);

    if (!admin) {
      return NextResponse.json({ error: session?.user?.id ? 'Forbidden' : 'Unauthorized' }, { status: session?.user?.id ? 403 : 401 });
    }

    const params = await context.params;
    const { id } = params;
    const body = await request.json();
    const { status, reason, reviewerNote, scheduledAt, isFeatured } = body as {
      status?: string;
      reason?: string;
      reviewerNote?: string;
      scheduledAt?: string | null;
      isFeatured?: boolean;
    };

    const existingPost = await prisma.blog_posts.findUnique({
      where: { id },
      select: { id: true, slug: true, title: true, authorId: true, status: true, isFeatured: true },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (typeof reviewerNote === 'string' && !status) {
      await saveReviewerNote(id, reviewerNote, admin.id);
    }

    if (typeof isFeatured === 'boolean') {
      await prisma.blog_posts.update({ where: { id }, data: { isFeatured } });
    }

    if (status) {
      if (!['PUBLISHED', 'REJECTED', 'ARCHIVED'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }

      if (status === 'REJECTED' && !normalizeRejectReason(reason)) {
        return NextResponse.json(
          { error: 'Cần nhập lý do từ chối để tác giả sửa bài' },
          { status: 400 }
        );
      }

      await applyBlogReview({
        postId: id,
        status: status as 'PUBLISHED' | 'REJECTED' | 'ARCHIVED',
        reason: reason || null,
        reviewerId: admin.id,
        reviewerNote: reviewerNote || null,
        scheduledAt: scheduledAt || null,
      });

      await createAuditLog({
        userId: admin.id,
        action: status === 'PUBLISHED' ? 'APPROVE' : status === 'REJECTED' ? 'REJECT' : 'UPDATE',
        entityType: 'blog_posts',
        entityId: id,
        oldValue: { status: existingPost.status },
        newValue: { status, scheduledAt: scheduledAt || null },
        reason: reason || null,
      });

      if (status === 'PUBLISHED' || status === 'REJECTED' || status === 'ARCHIVED') {
        const trimmedReason = normalizeRejectReason(reason);
        const scheduled = status === 'PUBLISHED' && scheduledAt && new Date(scheduledAt).getTime() > Date.now();
        notificationService.send({
          userId: existingPost.authorId,
          type: status === 'PUBLISHED' ? 'BLOG_APPROVED' : status === 'REJECTED' ? 'BLOG_REJECTED' : 'SYSTEM',
          title:
            status === 'PUBLISHED'
              ? scheduled
                ? 'Bài viết đã được duyệt, sẽ đăng theo lịch'
                : 'Bài viết đã được duyệt'
              : status === 'REJECTED'
                ? 'Bài viết chưa được duyệt'
                : 'Bài viết đã được gỡ / lưu trữ',
          message:
            status === 'PUBLISHED'
              ? scheduled
                ? `Bài viết “${existingPost.title}” đã được Admin duyệt và sẽ hiển thị từ ${new Date(scheduledAt).toLocaleString('vi-VN')}.`
                : `Bài viết “${existingPost.title}” đã được Admin duyệt và có thể hiển thị công khai.`
              : status === 'REJECTED'
                ? `Bài viết “${existingPost.title}” bị từ chối.${trimmedReason ? ` Lý do: ${trimmedReason}` : ''} Hãy sửa và gửi duyệt lại.`
                : `Bài viết “${existingPost.title}” đã được gỡ khỏi trang công khai.${trimmedReason ? ` Lý do: ${trimmedReason}` : ''}`,
          payload: {
            href: status === 'PUBLISHED' ? `/blog/${existingPost.slug}` : `/blog/editor?slug=${existingPost.slug}`,
            extra: { reason: trimmedReason || undefined },
          },
        });
      }
    }

    const post = await prisma.blog_posts.findUnique({ where: { id } });
    return NextResponse.json(post);
  } catch (error: any) {
    console.error('[API] PATCH /api/admin/blog/posts/[id]/review error:', error);
    return NextResponse.json(
      { error: 'Failed to review post' },
      { status: 500 }
    );
  }
}
