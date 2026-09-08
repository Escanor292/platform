import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { recalculateCampaignAmount } from "@/lib/order-fulfillment";
import { onPledgeSuccess } from "@/lib/tax/on-pledge-success";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      partnerCode, orderId, requestId, amount, orderInfo, orderType, transId,
      resultCode, message, payType, responseTime, extraData, signature,
    } = body;

    const secretKey = process.env.MOMO_SECRET_KEY || "";
    const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
    const expectedSignature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");
    if (signature !== expectedSignature) {
      return NextResponse.json({ resultCode: 97, message: "Invalid signature" }, { status: 400 });
    }

    const pledgeId = String(orderId || "").replace("MOMO-", "");
    const pledge = await prisma.pledges.findUnique({ where: { id: pledgeId }, include: { campaigns: true } });
    if (!pledge) return NextResponse.json({ resultCode: 1, message: "Pledge not found" }, { status: 404 });
    if (pledge.status === "SUCCESS" || pledge.status === "REFUNDED") {
      if (pledge.status === "SUCCESS") await onPledgeSuccess(pledge.id);
      return NextResponse.json({ resultCode: 0, message: "Already processed" });
    }

    const expectedChargeAmount = Number(pledge.chargeAmount || pledge.totalAmount);
    if (Math.abs(expectedChargeAmount - Number(amount)) > 100) {
      return NextResponse.json({ resultCode: 1, message: "Amount mismatch" }, { status: 400 });
    }

    if (resultCode === 0) {
      const updatedCampaign = await prisma.$transaction(async (tx) => {
        await tx.pledges.update({
          where: { id: pledgeId },
          data: {
            status: "SUCCESS",
            fulfillmentStatus: pledge.rewardId ? "PROCESSING" : "NOT_APPLICABLE",
            transactionId: transId || pledge.transactionId,
            paidAmount: expectedChargeAmount,
            remainingAmount: Math.max(0, Number(pledge.orderTotalAmount || pledge.totalAmount) - expectedChargeAmount),
            accountingAmount: pledge.isCashOnDelivery ? pledge.depositAmount : pledge.amount,
            webhookProcessedAt: new Date(),
            updatedAt: new Date(),
          },
        });
        if (pledge.campaignId) {
          await recalculateCampaignAmount(tx, pledge.campaignId);
          return tx.campaigns.findUnique({ where: { id: pledge.campaignId! } });
        }
        return null;
      });

      if (updatedCampaign && Number(updatedCampaign.currentAmount) >= Number(updatedCampaign.goalAmount) && updatedCampaign.status === "ACTIVE") {
        await prisma.campaigns.update({ where: { id: pledge.campaignId! }, data: { status: "SUCCESS" } });
      }

      await createAuditLog({
        userId: pledge.userId,
        action: "UPDATE",
        entityType: "PLEDGE",
        entityId: pledge.id,
        oldValue: { status: "PENDING" },
        newValue: { status: "SUCCESS", transactionId: transId },
        reason: "MoMo payment successful",
      });
      await onPledgeSuccess(pledge.id);
      return NextResponse.json({ resultCode: 0, message: "Success" });
    }

    await prisma.$transaction(async (tx) => {
      const current = await tx.pledges.findUnique({ where: { id: pledgeId }, select: { stockReserved: true, rewardId: true, quantity: true } });
      if (current?.stockReserved && current.rewardId) {
        await tx.rewards.update({ where: { id: current.rewardId }, data: { stock: { increment: current.quantity }, updatedAt: new Date() } });
      }
      await tx.pledges.update({
        where: { id: pledgeId },
        data: {
          status: "FAILED",
          stockReserved: false,
          fulfillmentStatus: pledge.rewardId ? "CANCELED" : "NOT_APPLICABLE",
          cancellationReason: "Thanh toán không thành công",
          webhookProcessedAt: new Date(),
          updatedAt: new Date(),
        },
      });
    });
    return NextResponse.json({ resultCode: 0, message: "Confirmed" });
  } catch (error: any) {
    return NextResponse.json({ resultCode: 99, message: "System error" }, { status: 500 });
  }
}
