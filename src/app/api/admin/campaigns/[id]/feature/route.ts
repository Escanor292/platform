import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { cacheInvalidatePrefix, CAMPAIGNS_CACHE_PREFIX } from "@/lib/redis-cache";
import { createAuditLog } from "@/lib/audit";

function isAdmin(user: any) {
  return user?.role === "ADMIN" || user?.isAdmin === true;
}

/** PATCH /api/admin/campaigns/[id]/feature — chỉ admin được gắn nổi bật hệ thống */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user || !isAdmin(session.user)) {
      return NextResponse.json({ error: "Bạn không có quyền thực hiện thao tác này" }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    if (typeof body.isFeatured !== "boolean") {
      return NextResponse.json({ error: "isFeatured phải là boolean" }, { status: 400 });
    }

    const campaign = await prisma.campaigns.findUnique({
      where: { id },
      select: { id: true, title: true, isFeatured: true },
    });
    if (!campaign) {
      return NextResponse.json({ error: "Không tìm thấy chiến dịch" }, { status: 404 });
    }

    const updated = await prisma.campaigns.update({
      where: { id },
      data: { isFeatured: body.isFeatured, updatedAt: new Date() },
      select: { id: true, title: true, isFeatured: true, updatedAt: true },
    });

    await createAuditLog({
      userId: (session.user as any).id,
      action: "UPDATE",
      entityType: "campaigns",
      entityId: id,
      metadata: { isFeatured: body.isFeatured, previous: campaign.isFeatured },
    }).catch(() => undefined);

    await cacheInvalidatePrefix(CAMPAIGNS_CACHE_PREFIX).catch(() => undefined);

    return NextResponse.json({
      campaign: updated,
      message: body.isFeatured ? "Đã gắn nổi bật trên hệ thống" : "Đã bỏ nổi bật",
    });
  } catch (error) {
    console.error("[PATCH /api/admin/campaigns/[id]/feature]", error);
    return NextResponse.json({ error: "Không thể cập nhật nổi bật" }, { status: 500 });
  }
}
