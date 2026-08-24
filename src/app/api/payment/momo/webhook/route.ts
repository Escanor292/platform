import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { recalculateCampaignAmount } from "@/lib/order-fulfillment";
import crypto from "crypto";

/**
 * MoMo IPN (Instant Payment Notification)
 * MoMo gọi webhook này sau khi thanh toán thành công
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("[MOMO WEBHOOK] Received:", body);

    // 1. Verify signature
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = body;

    const secretKey = process.env.MOMO_SECRET_KEY || "";
    const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

    const hmac = crypto.createHmac("sha256", secretKey);
    const expectedSignature = hmac.update(rawSignature).digest("hex");

    if (signature !== expectedSignature) {
      console.error("[MOMO WEBHOOK] Invalid signature");
      return NextResponse.json(
        { resultCode: 97, message: "Invalid signature" },
        { status: 400 }
      );
    }

    // 2. Parse pledge ID từ orderId
    // orderId format: MOMO-{pledgeId}
    const pledgeId = orderId.replace("MOMO-", "");

    if (!pledgeId) {
      console.error("[MOMO WEBHOOK] Missing pledge ID");
      return NextResponse.json(
        { resultCode: 1, message: "Missing pledge ID" },
        { status: 400 }
      );
    }

    // 3. Tìm pledge
    const pledge = await prisma.pledges.findUnique({
      where: { id: pledgeId },
      include: { campaigns: true },
    });

    if (!pledge) {
      console.error("[MOMO WEBHOOK] Pledge not found:", pledgeId);
      return NextResponse.json(
        { resultCode: 1, message: "Pledge not found" },
        { status: 404 }
      );
    }

    // 4. Kiểm tra đã xử lý chưa
    if (pledge.status === "SUCCESS" || pledge.status === "REFUNDED") {
      console.log("[MOMO WEBHOOK] Already processed:", pledgeId);
      return NextResponse.json({
        resultCode: 0,
        message: "Already processed",
      });
    }

    // 5. Kiểm tra số tiền đã thu thực tế (pre-order COD chỉ thu depositAmount).
    const expectedChargeAmount = Number(pledge.chargeAmount || pledge.totalAmount);
    if (Math.abs(expectedChargeAmount - Number(amount)) > 100) {
      console.error("[MOMO WEBHOOK] Amount mismatch:", {
        expected: expectedChargeAmount,
        received: Number(amount),
      });
      return NextResponse.json(
        { resultCode: 1, message: "Amount mismatch" },
        { status: 400 }
      );
    }

    // 6. Xử lý theo result code
    if (resultCode === 0) {
      // Thanh toán thành công
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

      if (
        updatedCampaign &&
        Number(updatedCampaign.currentAmount) >= Number(updatedCampaign.goalAmount) &&
        updatedCampaign.status === "ACTIVE"
      ) {
        await prisma.campaigns.update({
          where: { id: pledge.campaignId! },
          data: { status: "SUCCESS" },
        });
      }

      // Audit log
      await createAuditLog({
        userId: pledge.userId,
        action: "UPDATE",
        entityType: "PLEDGE",
        entityId: pledge.id,
        oldValue: { status: "PENDING" },
        newValue: { status: "SUCCESS", transactionId: transId },
        reason: "MoMo payment successful",
      });

      console.log("[MOMO WEBHOOK] Payment successful:", pledgeId);

      return NextResponse.json({
        resultCode: 0,
        message: "Success",
      });
    } else {
      // Thanh toán thất bại
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

      // Audit log
      await createAuditLog({
        userId: pledge.userId,
        action: "UPDATE",
        entityType: "PLEDGE",
        entityId: pledge.id,
        oldValue: { status: "PENDING" },
        newValue: { status: "FAILED" },
        reason: `MoMo payment failed: ${resultCode} - ${message}`,
      });

      console.log("[MOMO WEBHOOK] Payment failed:", pledgeId, resultCode);

      return NextResponse.json({
        resultCode: 0,
        message: "Confirmed",
      });
    }
  } catch (error: any) {
    console.error("[MOMO WEBHOOK ERROR]", error);
    return NextResponse.json(
      { resultCode: 99, message: "System error" },
      { status: 500 }
    );
  }
}
