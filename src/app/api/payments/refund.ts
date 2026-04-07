import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { processRefund } from "@/lib/payment/refund";

/**
 * POST /api/payments/refund
 * Hoàn tiền cho tất cả backers khi campaign bị hủy
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campaignId, adminId } = body;

    if (!campaignId) {
      return NextResponse.json(
        { error: "Thiếu campaignId" },
        { status: 400 }
      );
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        pledges: {
          where: { isReleased: false },
          include: { payment: true },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Không tìm thấy campaign" },
        { status: 404 }
      );
    }

    if (!["ACTIVE", "PAUSED"].includes(campaign.status)) {
      return NextResponse.json(
        { error: "Campaign không ở trạng thái có thể hoàn tiền" },
        { status: 400 }
      );
    }

    // Xử lý hoàn tiền từng pledge
    const refundResults = await Promise.allSettled(
      campaign.pledges.map((pledge) => processRefund(pledge))
    );

    const succeeded = refundResults.filter((r) => r.status === "fulfilled").length;
    const failed = refundResults.filter((r) => r.status === "rejected").length;

    // Cập nhật trạng thái campaign
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: "FAILED" },
    });

    return NextResponse.json({
      message: `Hoàn tiền hoàn tất: ${succeeded} thành công, ${failed} thất bại`,
      succeeded,
      failed,
    });
  } catch (error) {
    console.error("[POST /api/payments/refund]", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
