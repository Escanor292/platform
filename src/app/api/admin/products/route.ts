import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ensureRewardHideColumns } from '@/lib/moderation/takedown';
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
    await ensureRewardHideColumns();
    const hidden = request.nextUrl.searchParams.get('hidden');
    const q = (request.nextUrl.searchParams.get('q') || '').trim();
    const where: any = {};
    if (hidden === 'true') where.isActive = false;
    if (hidden === 'false') where.isActive = true;
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }
    const [products, hiddenCount, total] = await Promise.all([
      prisma.rewards.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take: 80,
        include: {
          campaigns: { select: { id: true, title: true, slug: true, creatorId: true } },
          projects: { select: { id: true, title: true, slug: true, creatorId: true } },
        },
      }),
      prisma.rewards.count({ where: { isActive: false } }),
      prisma.rewards.count(),
    ]);
    const extra = await getExtraFields<{ hideReason: string | null }>(
      'rewards',
      products.map((item) => item.id),
      ['hideReason']
    );
    return NextResponse.json({
      total,
      hiddenCount,
      products: products.map((product) => ({
        id: product.id,
        title: product.title,
        isActive: product.isActive,
        hideReason: extra[product.id]?.hideReason ?? null,
        campaign: product.campaigns,
        project: product.projects,
      })),
    });
  } catch (error) {
    console.error('[API] GET /api/admin/products', error);
    return NextResponse.json({ error: 'Không tải được sản phẩm' }, { status: 500 });
  }
}
