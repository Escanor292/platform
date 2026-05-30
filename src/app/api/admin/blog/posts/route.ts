// ============================================================
// API: GET /api/admin/blog/posts - Admin get all posts
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    const [posts, total] = await Promise.all([
      prisma.blog_posts.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
    ]);

    return NextResponse.json({
      posts,
      total,
      page,
      limit,
    });
  } catch (error: any) {
    console.error('[API] GET /api/admin/blog/posts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
