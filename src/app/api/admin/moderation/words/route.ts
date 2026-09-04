import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ensureDefaultBannedWords } from '@/lib/moderation';

function isAdmin(user: any) {
  return user?.role === 'ADMIN' || user?.isAdmin === true;
}

export async function GET() {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await ensureDefaultBannedWords((session.user as any).id);

  const words = await prisma.blacklist.findMany({
    where: { type: 'WORD' as any },
    orderBy: { createdAt: 'desc' },
    select: { id: true, value: true, reason: true, isActive: true, createdAt: true },
  });
  return NextResponse.json({ words });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const value = String(body.value || '').trim().toLowerCase();
  const reason = String(body.reason || 'Từ ngữ không phù hợp').trim();
  if (value.length < 2) {
    return NextResponse.json({ error: 'Từ cấm phải có ít nhất 2 ký tự' }, { status: 400 });
  }

  const word = await prisma.blacklist.upsert({
    where: { type_value: { type: 'WORD' as any, value } },
    create: {
      id: crypto.randomUUID(),
      type: 'WORD' as any,
      value,
      reason,
      addedBy: (session.user as any).id,
      isActive: true,
      updatedAt: new Date(),
    },
    update: { reason, isActive: true, updatedAt: new Date() },
  });
  return NextResponse.json({ word }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Thiếu id' }, { status: 400 });
  await prisma.blacklist.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
