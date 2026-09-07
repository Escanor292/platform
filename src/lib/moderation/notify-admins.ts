import { prisma } from '@/lib/prisma';
import { notificationService } from '@/services/mongodb/notification.service';
import type { NotificationType } from '@/types/mongodb.types';

export async function notifyAdmins(params: {
  exceptUserId?: string;
  type: NotificationType;
  title: string;
  message: string;
  href: string;
}): Promise<void> {
  const admins = await prisma.users.findMany({
    where: {
      OR: [{ isAdmin: true }, { role: 'ADMIN' }],
      ...(params.exceptUserId ? { NOT: { id: params.exceptUserId } } : {}),
    },
    select: { id: true },
  });
  notificationService.sendBulk(
    admins.map((admin) => admin.id),
    {
      type: params.type,
      title: params.title,
      message: params.message,
      payload: { href: params.href },
    }
  );
}

export async function notifyOwner(params: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  href: string;
}): Promise<void> {
  notificationService.send({
    userId: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    payload: { href: params.href },
  });
}
