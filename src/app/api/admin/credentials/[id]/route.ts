import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notificationService } from "@/services/pg/notification.service";

function isAdmin(user: { role?: string; isAdmin?: boolean; id?: string } | undefined) {
  return !!user && (user.role === "ADMIN" || user.isAdmin === true);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const actor = session?.user as { id?: string; role?: string; isAdmin?: boolean } | undefined;
  if (!isAdmin(actor) || !actor?.id) return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const decision = body?.status === "VERIFIED" || body?.status === "REJECTED" ? body.status : null;
  if (!decision) return NextResponse.json({ error: "Chọn duyệt hoặc từ chối" }, { status: 400 });
  const reason = typeof body?.reason === "string" ? body.reason.trim().slice(0, 400) : "";
  if (decision === "REJECTED" && !reason) {
    return NextResponse.json({ error: "Cần lý do từ chối" }, { status: 400 });
  }
  const current = await prisma.credentials.findUnique({ where: { id }, select: { userId: true, title: true, status: true } });
  if (!current || current.status !== "PENDING") {
    return NextResponse.json({ error: "Hồ sơ không còn chờ duyệt" }, { status: 409 });
  }
  const updated = await prisma.credentials.updateMany({
    where: { id, status: "PENDING" },
    data: {
      status: decision,
      reviewedAt: new Date(),
      reviewedBy: actor.id,
      rejectedReason: decision === "REJECTED" ? reason : null,
      updatedAt: new Date(),
    },
  });
  if (updated.count !== 1) return NextResponse.json({ error: "Hồ sơ vừa được xử lý" }, { status: 409 });
  notificationService.send({
    userId: current.userId,
    type: decision === "VERIFIED" ? "KYC_APPROVED" : "KYC_REJECTED",
    title: decision === "VERIFIED" ? "Bằng cấp đã được đối chiếu" : "Bằng cấp chưa được duyệt",
    message: decision === "VERIFIED" ? `${current.title} đã hiện trên trang cá nhân.` : reason,
    payload: { href: "/dashboard/bang-cap" },
  });
  return NextResponse.json({ ok: true });
}
