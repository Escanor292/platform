import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function isAdmin(user: any) {
  return user?.role === 'ADMIN' || user?.isAdmin === true;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const q = (req.nextUrl.searchParams.get('q') || '').trim();
  if (q.length < 2) {
    return NextResponse.json({ q, users: [], campaigns: [], projects: [], products: [] });
  }

  const [users, campaigns, projects, products] = await Promise.all([
    prisma.users.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, name: true, email: true, role: true, status: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.campaigns.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { campaignCode: { contains: q, mode: 'insensitive' } },
          { slug: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, title: true, slug: true, status: true, campaignCode: true },
      take: 8,
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.projects.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { slug: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, title: true, slug: true, isLocked: true },
      take: 8,
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.rewards.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, title: true, isActive: true, campaignId: true, projectId: true },
      take: 8,
      orderBy: { updatedAt: 'desc' },
    }),
  ]);

  return NextResponse.json({ q, users, campaigns, projects, products });
}
