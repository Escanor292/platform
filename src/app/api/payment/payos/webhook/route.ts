import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { recalculateCampaignAmount } from "@/lib/order-fulfillment";
import { onPledgeSuccess } from "@/lib/tax/on-pledge-success";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  try {
    const body = await request.json();
    const { orderCode, amount, code, desc, reference, transactionDateTime } = body;

    console.log(`[PAYOS WEBHOOK ${requestId}] Received:`, { orderCode, amount, code });

    const signature = request.headers.get("x-payos-signature");
    if (process.env.PAYOS_CHECKSUM_KEY) {
      if (!signature) {
        return NextResponse.json({ error: "Missing signature" }, { status: 400 });
      }

      const dataString = JSON.stringify(body);
      const hmac = crypto.createHmac("sha256", process.env.PAYOS_CHECKSUM_KEY);
      const expectedSignature = hmac.update(dataString).digest("hex");

      if (signature !== expectedSignature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    if (!orderCode || !amount) {
      return NextResponse.json({ error: "Missing orderCode or amount" }, { status: 400 });
    }

    const pledge = await prisma.pledges.findFirst({
      where: {
        payosOrderCode: orderCode.toString(),
        paymentProvider: { in: ["PAYOS", "PAYOS_COD_DEPOSIT"] },
      },
      include: { campaigns: true, users: true },
    });

    if (!pledge) {
      return NextResponse.json({ success: false, message: "Pledge not found" });
    }

    if (pledge.status === "SUCCESS" && pledge.webhookProcessedAt) {
      await onPledgeSuccess(pledge.id);
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    const pledgeChargeAmount = Number(pledge.chargeAmount || pledge.totalAmount);
    if (Math.abs(pledgeChargeAmount - amount) > 100) {
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    const isSuccess = code === "00" || code === "000" || code === 0;

    if (isSuccess) {
      const updatedCampaign = pledge.campaignId ? await prisma.$transaction(async (tx) => {
        await tx.pledges.update({
          where: { id: pledge.id },
          data: {
            status: "SUCCESS",
            fulfillmentStatus: pledge.rewardId ? "PROCESSING" : "NOT_APPLICABLE",
            transactionId: reference || pledge.transactionId,
            paidAmount: pledgeChargeAmount,
            remainingAmount: Math.max(0, Number(pledge.orderTotalAmount || pledge.totalAmount) - pledgeChargeAmount),
            accountingAmount: pledge.isCashOnDelivery ? pledge.depositAmount : pledge.amount,
            webhookProcessedAt: new Date(),
            updatedAt: new Date(),
          },
        });
        await recalculateCampaignAmount(tx, pledge.campaignId!);
        return tx.campaigns.findUnique({ where: { id: pledge.campaignId! }, select: { currentAmount: true, goalAmount: true, status: true } });
      }) : await prisma.pledges.update({
        where: { id: pledge.id },
        data: {
          status: "SUCCESS",
          fulfillmentStatus: pledge.rewardId ? "PROCESSING" : "NOT_APPLICABLE",
          transactionId: reference || pledge.transactionId,
          paidAmount: pledgeChargeAmount,
          remainingAmount: Math.max(0, Number(pledge.orderTotalAmount || pledge.totalAmount) - pledgeChargeAmount),
          accountingAmount: pledge.isCashOnDelivery ? pledge.depositAmount : pledge.amount,
          webhookProcessedAt: new Date(),
          updatedAt: new Date(),
        },
      }).then(() => null);

      if (
        updatedCampaign &&
        Number(updatedCampaign.currentAmount) >= Number(pledge.campaigns?.goalAmount || 0) &&
        updatedCampaign.status === "ACTIVE"
      ) {
        await prisma.campaigns.update({
          where: { id: pledge.campaignId! },
          data: { status: "SUCCESS" },
        });
      }

      await createAuditLog({
        userId: pledge.userId,
        action: "UPDATE",
        entityType: "PLEDGE",
        entityId: pledge.id,
        oldValue: { status: "PENDING" },
        newValue: { status: "SUCCESS", transactionId: reference },
        reason: "PayOS payment successful",
        metadata: { orderCode, reference, transactionDateTime, webhookRequestId: requestId },
      });

      await onPledgeSuccess(pledge.id);

      return NextResponse.json({
        success: true,
        message: "Payment processed successfully",
        pledgeId: pledge.id,
      });
    }

    await prisma.$transaction(async (tx) => {
      const current = await tx.pledges.findUnique({ where: { id: pledge.id }, select: { stockReserved: true, rewardId: true, quantity: true } });
      if (current?.stockReserved && current.rewardId) {
        await tx.rewards.update({ where: { id: current.rewardId }, data: { stock: { increment: current.quantity }, updatedAt: new Date() } });
      }
      await tx.pledges.update({
        where: { id: pledge.id },
        data: {
          status: "FAILED",
          stockReserved: false,
          fulfillmentStatus: pledge.rewardId ? "CANCELED" : "NOT_APPLICABLE",
          cancellationReason: "Thanh toán cọc không thành công",
          webhookProcessedAt: new Date(),
          updatedAt: new Date(),
        },
      });
    });

    await createAuditLog({
      userId: pledge.userId,
      action: "UPDATE",
      entityType: "PLEDGE",
      entityId: pledge.id,
      oldValue: { status: "PENDING" },
      newValue: { status: "FAILED" },
      reason: `PayOS payment failed: ${code} - ${desc}`,
      metadata: { orderCode, errorCode: code, errorDesc: desc, webhookRequestId: requestId },
    });

    return NextResponse.json({
      success: true,
      message: "Payment status updated",
      pledgeId: pledge.id,
    });
  } catch (error: any) {
    console.error(`[PAYOS WEBHOOK ${requestId}] ERROR:`, error);
    return NextResponse.json({ error: error.message || "System error", requestId }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "PayOS Webhook Endpoint",
    url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/payos/webhook`,
    method: "POST",
  });
}
