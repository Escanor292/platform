import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

/**
 * POST /api/campaigns/[slug]/cancel
 * Creator hoặc Admin hủy dự án → tự động đánh dấu hoàn tiền cho tất cả pledges
 */
export async function POST(
  request: Request,
  context: { params: Promise<Promise<{ slug: string> }> }
) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

    const { slug: campaignId } = await params;
    const { reason } = await request.json().catch(() => ({ reason: "Creator hủy dự án" }));

    // Tìm dự án theo ID (do dashboard ID)
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { creator: true }
    });

    if (!campaign) return NextResponse.json({ error: "Dự án không tồn tại" }, { status: 404 });

    // Chỉ Creator sở hữu hoặc Admin mới được hủy
    const isOwner = campaign.creatorId === user.id;
    const isAdmin = user.role === "ADMIN";
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Không có quyền hủy dự án này" }, { status: 403 });
    }

    if (campaign.status === "FAILED") {
      return NextResponse.json({ error: "Dự án đã bị hủy trước đó" }, { status: 400 });
    }

    // === Bắt đầu quá trình hủy & hoàn tiền ===
    const successPledges = await prisma.pledge.findMany({
      where: {
        campaignId,
        status: "SUCCESS",
      }
    });

    let refundedCount = 0;
    const refundErrors: string[] = [];

    for (const pledge of successPledges) {
      try {
        await prisma.pledge.update({
          where: { id: pledge.id },
          data: { refundStatus: "PROCESSING" }
        });

        refundedCount++;
      } catch (err: any) {
        refundErrors.push(`Pledge ${pledge.id}: ${err.message}`);
      }
    }

    const totalRefundAmount = successPledges.reduce((sum: number, p: any) => sum + Number(p.totalAmount), 0);

    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: "FAILED",
        currentAmount: 0,
      }
    });

    return NextResponse.json({
      success: true,
      message: `Dự án đã được hủy. Đã xử lý hoàn tiền cho ${refundedCount}/${successPledges.length} giao dịch.`,
      refundedCount,
      totalRefundAmount,
      errors: refundErrors.length > 0 ? refundErrors : undefined,
    });

  } catch (error: any) {
    console.error("Cancel campaign error:", error);
    return NextResponse.json({ error: error.message || "Lỗi hệ thống" }, { status: 500 });
  }
}
