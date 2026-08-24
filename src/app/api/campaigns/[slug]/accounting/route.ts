import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { reversalReason } from "@/lib/order-fulfillment";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await auth();
    const { slug } = await context.params;
    const campaign = await prisma.campaigns.findFirst({
      where: { OR: [{ id: slug }, { slug }] },
      include: {
        pledges: {
          orderBy: { createdAt: "desc" },
          include: {
            users: { select: { name: true, email: true } },
            rewards: { select: { title: true, fulfillmentType: true } },
          },
        },
      },
    });
    if (!campaign) return NextResponse.json({ error: "Không tìm thấy chiến dịch" }, { status: 404 });

    const isOwner = session?.user && ((session.user as { id?: string }).id === campaign.creatorId || (session.user as { role?: string }).role === "ADMIN");
    if (!isOwner) return NextResponse.json({ error: "Bạn không có quyền xem sao kê chiến dịch" }, { status: 403 });

    const gross = campaign.pledges
      .filter((pledge) => pledge.status === "SUCCESS" || pledge.status === "REFUNDED")
      .reduce((sum, pledge) => sum + Number(pledge.amount), 0);
    const actual = campaign.pledges
      .filter((pledge) => pledge.status === "SUCCESS" && !pledge.accountingReversedAt)
      .reduce((sum, pledge) => sum + Number(pledge.amount), 0);
    const reversed = gross - actual;
    const historicalClosedTotal = campaign.closedAmount == null ? gross : Number(campaign.closedAmount);

    return NextResponse.json({
      campaign: {
        id: campaign.id,
        title: campaign.title,
        campaignCode: campaign.campaignCode,
        status: campaign.status,
        goalAmount: Number(campaign.goalAmount),
        currentAmount: Number(campaign.currentAmount),
        historicalClosedTotal,
        closedAt: campaign.closedAt,
      },
      summary: { gross, actual, reversed, transactionCount: campaign.pledges.length },
      pledges: campaign.pledges.map((pledge) => ({
        id: pledge.id,
        amount: Number(pledge.amount),
        totalAmount: Number(pledge.totalAmount),
        displayName: pledge.isAnonymous ? "Người dùng ẩn danh" : (pledge.displayName || pledge.users?.name || "Người ủng hộ"),
        isAnonymous: pledge.isAnonymous,
        createdAt: pledge.createdAt,
        transactionId: pledge.transactionId,
        paymentProvider: pledge.paymentProvider,
        status: pledge.status,
        refundStatus: pledge.refundStatus,
        fulfillmentStatus: pledge.fulfillmentStatus,
        deliveryFailureReason: pledge.deliveryFailureReason,
        cancellationReason: pledge.cancellationReason,
        returnReason: pledge.returnReason,
        reversalReason: reversalReason(pledge),
        accountingReversedAt: pledge.accountingReversedAt,
        rewardTitle: pledge.rewards?.title || null,
      })),
    });
  } catch (error) {
    console.error("[CAMPAIGN_ACCOUNTING_GET]", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "Không thể tải sao kê chiến dịch" }, { status: 500 });
  }
}
