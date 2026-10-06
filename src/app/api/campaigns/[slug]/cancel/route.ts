import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { processCampaignRefund } from "@/lib/payment/refund";

/**
 * POST /api/campaigns/[slug]/cancel
 * Creator hoac Admin huy du an -> hoan so (chua chi NH).
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Chua dang nhap" }, { status: 401 });

    const { slug: campaignId } = await context.params;
    const { reason } = await request.json().catch(() => ({ reason: "Creator huy du an" }));

    const campaign = await prisma.campaigns.findUnique({
      where: { id: campaignId },
      include: { users: true },
    });

    if (!campaign) return NextResponse.json({ error: "Du an khong ton tai" }, { status: 404 });

    const isOwner = campaign.creatorId === user.id;
    const isAdmin = user.role === "ADMIN" || user.isAdmin === true;
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Khong co quyen huy du an nay" }, { status: 403 });
    }

    if (campaign.status === "FAILED" || campaign.status === "CANCELED") {
      return NextResponse.json({ error: "Du an da bi huy truoc do" }, { status: 400 });
    }

    const now = new Date();
    await prisma.campaigns.update({
      where: { id: campaignId },
      data: {
        status: "FAILED",
        closedAmount: campaign.currentAmount,
        closedAt: now,
        updatedAt: now,
      },
    });

    if (typeof reason === "string" && reason.trim()) {
      await prisma.pledges.updateMany({
        where: { campaignId, status: "SUCCESS" },
        data: { cancellationReason: reason.trim().slice(0, 500), updatedAt: now },
      });
    }

    const result = await processCampaignRefund(campaignId);

    return NextResponse.json({
      success: true,
      message: `Du an da duoc huy. Da xu ly hoan so cho ${result.refundedCount}/${result.total ?? 0} giao dich.`,
      refundedCount: result.refundedCount,
      note: result.note,
    });
  } catch (error: any) {
    console.error("Cancel campaign error:", error);
    return NextResponse.json({ error: error.message || "Loi he thong" }, { status: 500 });
  }
}
