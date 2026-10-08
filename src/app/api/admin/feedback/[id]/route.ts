import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const user = session?.user as { role?: string; isAdmin?: boolean } | undefined;
  if (!user || (user.role !== "ADMIN" && !user.isAdmin)) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  if (body?.status !== "READ" && body?.status !== "NEW") {
    return NextResponse.json({ error: "Trạng thái không hợp lệ" }, { status: 400 });
  }
  const updated = await prisma.platform_feedback.updateMany({
    where: { id },
    data: { status: body.status, updatedAt: new Date() },
  });
  if (updated.count !== 1) return NextResponse.json({ error: "Không tìm thấy góp ý" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
