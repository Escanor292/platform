import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getBlogReviewFields, hoursWaiting, isSlaOverdue } from '@/lib/blog/blog-review';

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const q = (searchParams.get('q') || '').trim();
    const sort = searchParams.get('sort') || (status === 'PENDING_REVIEW' ? 'oldest' : 'newest');
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (status && status !== 'all') {
      where.status = status;
    }
    if (type && type !== 'all') {
      where.type = type;
    }
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
        { excerpt: { contains: q, mode: 'insensitive' } },
        { users: { name: { contains: q, mode: 'insensitive' } } },
        { users: { email: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const orderBy = sort === 'oldest' ? { createdAt: 'asc' as const } : { createdAt: 'desc' as const };

    const [posts, total, pendingCount, publishedCount, rejectedCount, draftCount, overduePending] =
      await Promise.all([
        prisma.blog_posts.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            users: {
              select: { id: true, name: true, email: true, avatar: true },
            },
            campaigns: {
              select: { id: true, title: true, slug: true },
            },
            _count: {
              select: {
                blog_likes: true,
                blog_bookmarks: true,
                blog_comments: true,
              },
            },
          },
        }),
        prisma.blog_posts.count({ where }),
        prisma.blog_posts.count({ where: { deletedAt: null, status: 'PENDING_REVIEW' } }),
        prisma.blog_posts.count({ where: { deletedAt: null, status: 'PUBLISHED' } }),
        prisma.blog_posts.count({ where: { deletedAt: null, status: 'REJECTED' } }),
        prisma.blog_posts.count({ where: { deletedAt: null, status: 'DRAFT' } }),
        prisma.blog_posts.count({
          where: {
            deletedAt: null,
            status: 'PENDING_REVIEW',
            createdAt: { lte: new Date(Date.now() - 24 * 36e5) },
          },
        }),
      ]);

    const reviewFields = await getBlogReviewFields(posts.map((post) => post.id));
    const now = new Date();

    return NextResponse.json({
      posts: posts.map((post) => ({
        ...post,
        author: post.users,
        rejectionReason: reviewFields[post.id]?.rejectionReason ?? null,
        reviewedAt: reviewFields[post.id]?.reviewedAt ?? null,
        reviewedBy: reviewFields[post.id]?.reviewedBy ?? null,
        reviewerNote: reviewFields[post.id]?.reviewerNote ?? null,
        scheduledAt: reviewFields[post.id]?.scheduledAt ?? null,
        slaHours: Math.round(hoursWaiting(post.createdAt, now) * 10) / 10,
        slaOverdue: post.status === 'PENDING_REVIEW' && isSlaOverdue(post.createdAt, 24, now),
        _count: {
          likes: post._count.blog_likes,
          comments: post._count.blog_comments,
          bookmarks: post._count.blog_bookmarks,
        },
      })),
      total,
      page,
      limit,
      counts: {
        PENDING_REVIEW: pendingCount,
        PUBLISHED: publishedCount,
        REJECTED: rejectedCount,
        DRAFT: draftCount,
        SLA_OVERDUE: overduePending,
      },
    });
  } catch (error: any) {
    console.error('[API] GET /api/admin/blog/posts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
