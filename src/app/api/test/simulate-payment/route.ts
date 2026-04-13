import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

/**
 * API TEST - Giả lập thanh toán thành công
 * CHỈ DÙNG CHO DEVELOPMENT/TESTING
 * 
 * Usage:
 * POST /api/test/simulate-payment
 * Body: { "pledgeId": "...", "status": "SUCCESS" }
 */
export async function POST(request: NextRequest) {
  // Chỉ cho phép trong development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { pledgeId, status = "SUCCESS" } = body;

    if (!pledgeId) {
      return NextResponse.json(
        { error: "pledgeId is required" },
        { status: 400 }
      );
    }

    // 1. Tìm pledge
    const pledge = await prisma.pledge.findUnique({
      where: { id: pledgeId },
      include: { campaign: true },
    });

    if (!pledge) {
      return NextResponse.json(
        { error: "Pledge not found" },
        { status: 404 }
      );
    }

    // 2. Kiểm tra đã xử lý chưa
    if (pledge.status === "SUCCESS") {
      return NextResponse.json({
        success: true,
        message: "Pledge already processed",
        pledge: {
          id: pledge.id,
          status: pledge.status,
          amount: Number(pledge.amount),
        },
      });
    }

    // 3. Cập nhật pledge
    const updatedPledge = await prisma.pledge.update({
      where: { id: pledgeId },
      data: {
        status: status as any,
        transactionId: `TEST-${Date.now()}`,
        updatedAt: new Date(),
      },
    });

    // 4. Nếu SUCCESS, cộng tiền vào campaign
    if (status === "SUCCESS") {
      await prisma.campaign.update({
        where: { id: pledge.campaignId },
        data: {
          currentAmount: {
            increment: pledge.amount,
          },
        },
      });

      // 5. Kiểm tra campaign đạt mục tiêu
      const updatedCampaign = await prisma.campaign.findUnique({
        where: { id: pledge.campaignId },
      });

      if (
        updatedCampaign &&
        Number(updatedCampaign.currentAmount) >= Number(updatedCampaign.goalAmount) &&
        updatedCampaign.status === "ACTIVE"
      ) {
        await prisma.campaign.update({
          where: { id: pledge.campaignId },
          data: { status: "SUCCESS" },
        });
      }

      // 6. Tạo audit log
      await createAuditLog({
        userId: pledge.userId,
        action: "UPDATE",
        entityType: "PLEDGE",
        entityId: pledge.id,
        oldValue: { status: "PENDING" },
        newValue: { status: "SUCCESS" },
        reason: "Test payment simulation",
      });
    }

    return NextResponse.json({
      success: true,
      message: `Payment simulated: ${status}`,
      pledge: {
        id: updatedPledge.id,
        status: updatedPledge.status,
        amount: Number(updatedPledge.amount),
        transactionId: updatedPledge.transactionId,
      },
      campaign: {
        id: pledge.campaign.id,
        title: pledge.campaign.title,
        currentAmount: Number(pledge.campaign.currentAmount) + (status === "SUCCESS" ? Number(pledge.amount) : 0),
      },
    });
  } catch (error: any) {
    console.error("[SIMULATE PAYMENT ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to simulate payment" },
      { status: 500 }
    );
  }
}

/**
 * GET - Lấy danh sách pledges PENDING để test
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 403 }
    );
  }

  try {
    const pendingPledges = await prisma.pledge.findMany({
      where: { status: "PENDING" },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      count: pendingPledges.length,
      pledges: pendingPledges.map((p) => ({
        id: p.id,
        campaignTitle: p.campaign.title,
        amount: Number(p.amount),
        displayName: p.displayName,
        paymentProvider: p.paymentProvider,
        createdAt: p.createdAt,
        simulateUrl: `/api/test/simulate-payment`,
        curlCommand: `curl -X POST http://localhost:3000/api/test/simulate-payment -H "Content-Type: application/json" -d '{"pledgeId":"${p.id}","status":"SUCCESS"}'`,
      })),
    });
  } catch (error: any) {
    console.error("[GET PENDING PLEDGES ERROR]", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
