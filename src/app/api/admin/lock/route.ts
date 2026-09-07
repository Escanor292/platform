import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';
import { normalizeRejectReason } from '@/lib/moderation/policy';
import { notifyOwner } from '@/lib/moderation/notify-admins';
import { takedownCampaign, takedownProduct, takedownProject } from '@/lib/moderation/takedown';

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
  const reason = typeof body.reason === 'string' ? body.reason : '';
  const adminId = (session.user as any).id;

  if (!id || !['user', 'campaign', 'project', 'product'].includes(type)) {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }
  if (locked && !normalizeRejectReason(reason)) {
    return NextResponse.json({ error: 'Cần nhập lý do khi khóa hoặc ẩn nội dung' }, { status: 400 });
  }

  try {
    if (type === 'user') {
      const user = await prisma.users.findUnique({ where: { id }, select: { id: true, role: true, status: true, name: true } });
      if (!user) return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 });
      if (user.role === 'ADMIN') return NextResponse.json({ error: 'Không thể khóa tài khoản admin' }, { status: 400 });
      const updated = await prisma.users.update({
        where: { id },
        data: { status: locked ? 'BANNED' : 'NORMAL' },
        select: { id: true, status: true },
      });
      await createAuditLog({
        userId: adminId,
        action: locked ? 'REJECT' : 'APPROVE',
        entityType: 'users',
        entityId: id,
        oldValue: { status: user.status },
        newValue: { status: updated.status },
        reason: normalizeRejectReason(reason) || null,
      });
      await notifyOwner({
        userId: id,
        type: 'CONTENT_HIDDEN',
        title: locked ? 'Tài khoản đã bị khóa' : 'Tài khoản đã được mở lại',
        message: locked
          ? `Tài khoản của bạn đã bị khóa. Lý do: ${normalizeRejectReason(reason)}`
          : 'Tài khoản của bạn đã được mở lại.',
        href: '/profile',
      });
      return NextResponse.json({ type, locked, item: updated });
    }

    if (type === 'campaign') {
      const item = await takedownCampaign({ id, locked, reason, adminId });
      return NextResponse.json({ type, locked, item });
    }

    if (type === 'project') {
      const item = await takedownProject({ id, locked, reason, adminId });
      return NextResponse.json({ type, locked, item });
    }

    const item = await takedownProduct({ id, locked, reason, adminId });
    return NextResponse.json({ type, locked, item });
  } catch (error: any) {
    console.error('[POST /api/admin/lock]', error);
    const message = error.message || 'Không thể cập nhật';
    const status = message.includes('Cần') || message.includes('Chỉ') || message.includes('Không') ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
