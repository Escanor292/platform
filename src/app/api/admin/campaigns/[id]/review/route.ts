import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { cacheInvalidatePrefix, CAMPAIGNS_CACHE_PREFIX } from "@/lib/redis-cache";
import { applyCampaignReview } from "@/lib/moderation/campaign-review";
import { normalizeRejectReason } from "@/lib/moderation/policy";
import { notifyOwner } from "@/lib/moderation/notify-admins";

const ALLOWED_STATUSES = new Set(["ACTIVE", "CANCELED"]);

function isAdmin(user: any) {
  return user?.role === "ADMIN" || user?.isAdmin === true;
}

/** PATCH /api/admin/campaigns/[id]/review */
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
    const status = typeof body.status === "string" ? body.status : "";
    const reason = typeof body.reason === "string" ? body.reason : "";
    const reviewerNote = typeof body.reviewerNote === "string" ? body.reviewerNote : "";

    if (!ALLOWED_STATUSES.has(status)) {
      return NextResponse.json({ error: "Trạng thái duyệt không hợp lệ" }, { status: 400 });
    }
    if (status === "CANCELED" && !normalizeRejectReason(reason)) {
      return NextResponse.json({ error: "Cần nhập lý do từ chối để creator sửa và gửi lại" }, { status: 400 });
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

    await applyCampaignReview({
      campaignId: id,
      status: status as "ACTIVE" | "CANCELED",
      reason,
      reviewerId: (session.user as any).id,
      reviewerNote,
      action: status === "ACTIVE" ? "APPROVE" : "REJECT",
    });

    const updated = await prisma.campaigns.findUnique({
      where: { id },
      select: { id: true, title: true, status: true, updatedAt: true },
    });

    const trimmed = normalizeRejectReason(reason);
    await notifyOwner({
      userId: campaign.creatorId,
      type: status === "ACTIVE" ? "CAMPAIGN_APPROVED" : "CAMPAIGN_REJECTED",
      title: status === "ACTIVE" ? "Chiến dịch đã được duyệt" : "Chiến dịch chưa được duyệt",
      message:
        status === "ACTIVE"
          ? `Chiến dịch “${campaign.title}” đã được Admin phê duyệt và đang hoạt động.`
          : `Chiến dịch “${campaign.title}” bị từ chối.${trimmed ? ` Lý do: ${trimmed}` : ""} Hãy sửa rồi gửi duyệt lại.`,
      href: `/dashboard/creator/edit/${campaign.slug}`,
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
