import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { processCampaignRefund } from "@/lib/payment/refund";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const actor = session?.user as { role?: string; isAdmin?: boolean } | undefined;
    if (!actor || (actor.role !== "ADMIN" && !actor.isAdmin)) {
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
      return NextResponse.json({
        error: "Chỉ hoàn sổ khi chiến dịch đã FAILED hoặc CANCELED. Hủy chiến dịch trước, route này không tự đóng chiến dịch đang chạy.",
      }, { status: 400 });
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
