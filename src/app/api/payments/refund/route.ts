import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { processCampaignRefund } from "@/lib/payment/refund";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await req.json();
    const { campaignId } = body;

    if (!campaignId) {
      return NextResponse.json({ error: "Thieu campaignId" }, { status: 400 });
    }

    const campaign = await prisma.campaigns.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Khong tim thay du an" }, { status: 404 });
    }

    if (campaign.status !== "FAILED" && campaign.status !== "CANCELED") {
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
    }

    const result = await processCampaignRefund(campaignId);

    return NextResponse.json({
      message: "Da hoan so. Chi hoan ngan hang lam tay vi chua co NH trung gian.",
      succeeded: result.refundedCount,
      total: result.total,
      note: result.note,
    });
  } catch (error: any) {
    console.error("[POST /api/payments/refund]", error);
    return NextResponse.json({ error: error.message || "Loi server" }, { status: 500 });
  }
}
