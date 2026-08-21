import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { normalizeNotificationSettings, normalizePrivacySettings } from '@/lib/profile-settings';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.users.findUnique({
    where: { id: session.user.id },
    select: { role: true, privacySettings: true, notificationSettings: true },
  });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json({
    role: user.role,
    privacySettings: normalizePrivacySettings(user.role, user.privacySettings),
    notificationSettings: normalizeNotificationSettings(user.notificationSettings),
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const user = await prisma.users.findUnique({ where: { id: session.user.id }, select: { role: true, privacySettings: true, notificationSettings: true } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const privacySettings = normalizePrivacySettings(user.role, body.privacySettings ?? user.privacySettings);
  const notificationSettings = normalizeNotificationSettings(body.notificationSettings ?? user.notificationSettings);
  const updated = await prisma.users.update({
    where: { id: session.user.id },
    data: { privacySettings: privacySettings as any, notificationSettings: notificationSettings as any },
    select: { role: true, privacySettings: true, notificationSettings: true },
  });

  return NextResponse.json({
    role: updated.role,
    privacySettings: normalizePrivacySettings(updated.role, updated.privacySettings),
    notificationSettings: normalizeNotificationSettings(updated.notificationSettings),
  });
}
