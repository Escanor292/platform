import { NextResponse } from "next/server";
import { unauthorizedCron } from "@/lib/cron-auth";
import { prisma } from "@/lib/prisma";
import { notificationService } from "@/services/pg/notification.service";

export async function GET(request: Request) {
  const denied = unauthorizedCron(request);
  if (denied) return denied;

  const now = new Date();
  const soon = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const grace = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const due = await prisma.memberships.findMany({
    where: { status: "ACTIVE", canceledAt: null, currentPeriodEnd: { lte: soon } },
    select: { id: true, supporterId: true, creatorId: true, currentPeriodEnd: true, lastReminderAt: true, creator: { select: { name: true, displayName: true } } },
    take: 200,
  });
  let reminded = 0;
  for (const row of due) {
    if (!row.currentPeriodEnd) continue;
    const already = row.lastReminderAt && row.lastReminderAt.getTime() > row.currentPeriodEnd.getTime() - 4 * 24 * 60 * 60 * 1000;
    if (already) continue;
    const name = row.creator.displayName || row.creator.name;
    notificationService.send({
      userId: row.supporterId,
      type: "SYSTEM",
      title: "Kỳ ủng hộ sắp hết",
      message: `Kỳ ủng hộ ${name} hết hạn ${row.currentPeriodEnd.toLocaleDateString("vi-VN")}. Gia hạn bằng chuyển khoản, hệ thống không tự trừ tiền.`,
      payload: { href: `/profile/${row.creatorId}` },
    });
    await prisma.memberships.update({ where: { id: row.id }, data: { lastReminderAt: now, updatedAt: now } });
    reminded += 1;
  }

  const stopped = await prisma.memberships.updateMany({
    where: { status: "ACTIVE", canceledAt: { not: null }, currentPeriodEnd: { lt: now } },
    data: { status: "CANCELED", updatedAt: now },
  });
  const expired = await prisma.memberships.findMany({
    where: { status: "ACTIVE", canceledAt: null, currentPeriodEnd: { lt: grace } },
    select: { id: true, supporterId: true, creatorId: true },
    take: 200,
  });
  if (expired.length) {
    await prisma.memberships.updateMany({
      where: { id: { in: expired.map((row) => row.id) }, status: "ACTIVE" },
      data: { status: "PAST_DUE", updatedAt: now },
    });
    for (const row of expired) {
      notificationService.send({
        userId: row.supporterId,
        type: "SYSTEM",
        title: "Đã ngừng quyền hội viên",
        message: "Đã quá 7 ngày sau hạn mà chưa có kỳ mới được đối soát.",
        payload: { href: `/profile/${row.creatorId}` },
      });
    }
  }

  return NextResponse.json({ reminded, expired: expired.length, stopped: stopped.count });
}
