import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { notificationService } from '@/services/mongodb/notification.service';

function unauthorized() {
  return NextResponse.json({ error: 'Bạn cần đăng nhập' }, { status: 401 });
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const limitParam = Number(new URL(request.url).searchParams.get('limit') || 30);
  const limit = Math.min(Math.max(limitParam, 1), 50);
  const [rows, unreadCount] = await Promise.all([
    notificationService.getForUser(session.user.id, limit),
    notificationService.countUnread(session.user.id),
  ]);

  const notifications = rows.map((row: any) => {
    const { _id, ...notification } = row;
    return { id: String(_id), ...notification };
  });

  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const body = await request.json().catch(() => ({}));
  if (body.all === true) {
    await notificationService.markAllAsRead(session.user.id);
  } else if (typeof body.id === 'string' && body.id) {
    await notificationService.markAsRead(body.id, session.user.id);
  } else {
    return NextResponse.json({ error: 'Thiếu id hoặc all=true' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
