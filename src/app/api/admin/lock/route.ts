import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function isAdmin(user: any) {
  return user?.role === 'ADMIN' || user?.isAdmin === true;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const type = body.type as string;
  const id = typeof body.id === 'string' ? body.id : '';
  const locked = body.locked === true;
  if (!id || !['user', 'campaign', 'project', 'product'].includes(type)) {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  try {
    if (type === 'user') {
      const user = await prisma.users.findUnique({ where: { id }, select: { id: true, role: true, status: true } });
      if (!user) return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 });
      if (user.role === 'ADMIN') return NextResponse.json({ error: 'Không thể khóa tài khoản admin' }, { status: 400 });
      const updated = await prisma.users.update({
        where: { id },
        data: { status: locked ? 'BANNED' : 'NORMAL' },
        select: { id: true, status: true },
      });
      return NextResponse.json({ type, locked, item: updated });
    }

    if (type === 'campaign') {
      const campaign = await prisma.campaigns.findUnique({ where: { id }, select: { id: true, status: true } });
      if (!campaign) return NextResponse.json({ error: 'Không tìm thấy chiến dịch' }, { status: 404 });
      if (locked && campaign.status !== 'ACTIVE' && campaign.status !== 'PENDING_REVIEW') {
        return NextResponse.json({ error: 'Chỉ khóa được chiến dịch đang hoạt động hoặc chờ duyệt' }, { status: 409 });
      }
      const updated = await prisma.campaigns.update({
        where: { id },
        data: { status: locked ? 'CANCELED' : 'ACTIVE' },
        select: { id: true, status: true },
      });
      return NextResponse.json({ type, locked, item: updated });
    }

    if (type === 'project') {
      const updated = await prisma.projects.update({
        where: { id },
        data: { isLocked: locked },
        select: { id: true, isLocked: true },
      });
      return NextResponse.json({ type, locked, item: updated });
    }

    const updated = await prisma.rewards.update({
      where: { id },
      data: { isActive: !locked },
      select: { id: true, isActive: true },
    });
    return NextResponse.json({ type, locked, item: updated });
  } catch (error: any) {
    console.error('[POST /api/admin/lock]', error);
    return NextResponse.json({ error: error.message || 'Không thể cập nhật' }, { status: 500 });
  }
}
