import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { processCampaignRefund } from "@/lib/payment/refund";
import { auth } from "@/lib/auth";

/**
 * POST /api/payments/refund
 * Hoàn tiền cho tất cả backers khi campaign bị hủy (chỉ Admin)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await req.json();
    const { campaignId } = body;

    if (!campaignId) {
      return NextResponse.json(
        { error: "Thiếu campaignId" },
        { status: 400 }
      );
    }

    const campaign = await prisma.campaigns.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Không tìm thấy dự án" },
        { status: 404 }
      );
    }

    // Thực hiện quy trình hoàn tiền hàng loạt
    const result = await processCampaignRefund(campaignId);

    // Cập nhật trạng thái dự án thành CANCELED hoặc FAILED nếu chưa
    if (campaign.status !== "FAILED" && campaign.status !== "CANCELED") {
      await prisma.campaigns.update({
        where: { id: campaignId },
        data: { status: "FAILED" },
      });
    }

    return NextResponse.json({
      message: `Quy trình hoàn tiền hoàn tất`,
      succeeded: result.refundedCount,
      total: result.total,
    });
  } catch (error: any) {
    console.error("[POST /api/payments/refund]", error);
    return NextResponse.json({ error: error.message || "Lỗi server" }, { status: 500 });
  }
}
