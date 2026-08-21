import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { cacheInvalidatePrefix, CAMPAIGNS_CACHE_PREFIX } from "@/lib/redis-cache";
import { notificationService } from "@/services/mongodb/notification.service";

const ALLOWED_STATUSES = new Set(["ACTIVE", "CANCELED"]);

/** PATCH /api/admin/campaigns/[id]/review */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Bạn không có quyền thực hiện thao tác này" }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    const status = typeof body.status === "string" ? body.status : "";

    if (!ALLOWED_STATUSES.has(status)) {
      return NextResponse.json({ error: "Trạng thái duyệt không hợp lệ" }, { status: 400 });
    }

    const campaign = await prisma.campaigns.findUnique({
      where: { id },
      select: { id: true, status: true, title: true, slug: true, creatorId: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Không tìm thấy chiến dịch" }, { status: 404 });
    }

    if (campaign.status !== "PENDING_REVIEW") {
      return NextResponse.json(
        { error: "Chỉ chiến dịch đang chờ duyệt mới có thể được xử lý" },
        { status: 409 },
      );
    }

    const updated = await prisma.campaigns.update({
      where: { id },
      data: { status: status as "ACTIVE" | "CANCELED" },
      select: { id: true, title: true, status: true, updatedAt: true },
    });

    notificationService.send({
      userId: campaign.creatorId,
      type: status === "ACTIVE" ? "CAMPAIGN_APPROVED" : "CAMPAIGN_REJECTED",
      title: status === "ACTIVE" ? "Chiến dịch đã được duyệt" : "Chiến dịch chưa được duyệt",
      message: status === "ACTIVE"
        ? `Chiến dịch “${campaign.title}” đã được Admin phê duyệt và đang hoạt động.`
        : `Chiến dịch “${campaign.title}” chưa được phê duyệt. Vui lòng kiểm tra và cập nhật lại nội dung.`,
      payload: { href: `/campaigns/${campaign.slug}`, campaignId: campaign.id },
    });

    await cacheInvalidatePrefix(CAMPAIGNS_CACHE_PREFIX).catch((cacheError) => {
      console.warn("[ADMIN_CAMPAIGN_REVIEW_CACHE_INVALIDATION]", cacheError);
    });

    return NextResponse.json({ campaign: updated });
  } catch (error) {
    console.error("[PATCH /api/admin/campaigns/[id]/review]", error);
    return NextResponse.json({ error: "Không thể cập nhật trạng thái chiến dịch" }, { status: 500 });
  }
}
