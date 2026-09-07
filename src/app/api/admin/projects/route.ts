import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ensureProjectLockColumns } from '@/lib/moderation/takedown';
import { getExtraFields } from '@/lib/moderation/review-columns';

function isAdmin(user: any) {
  return user?.role === 'ADMIN' || user?.isAdmin === true;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !isAdmin(session.user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await ensureProjectLockColumns();
    const locked = request.nextUrl.searchParams.get('locked');
    const q = (request.nextUrl.searchParams.get('q') || '').trim();
    const where: any = {};
    if (locked === 'true') where.isLocked = true;
    if (locked === 'false') where.isLocked = false;
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
      ];
    }
    const [projects, lockedCount, total] = await Promise.all([
      prisma.projects.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take: 80,
        include: {
          users: { select: { id: true, name: true, email: true } },
          _count: { select: { campaigns: true, rewards: true } },
        },
      }),
      prisma.projects.count({ where: { isLocked: true } }),
      prisma.projects.count(),
    ]);
    const extra = await getExtraFields<{ lockReason: string | null }>(
      'projects',
      projects.map((item) => item.id),
      ['lockReason']
    );
    return NextResponse.json({
      total,
      lockedCount,
      projects: projects.map((project) => ({
        ...project,
        lockReason: extra[project.id]?.lockReason ?? null,
        creator: project.users,
      })),
    });
  } catch (error) {
    console.error('[API] GET /api/admin/projects', error);
    return NextResponse.json({ error: 'Không tải được dự án' }, { status: 500 });
  }
}
