import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
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
    if (pledge.status === "SUCCESS") {
      console.log("[MOMO WEBHOOK] Already processed:", pledgeId);
      return NextResponse.json({
        resultCode: 0,
        message: "Already processed",
      });
    }

    // 5. Kiểm tra số tiền
    if (Math.abs(Number(pledge.totalAmount) - amount) > 1) {
      console.error("[MOMO WEBHOOK] Amount mismatch:", {
        expected: Number(pledge.totalAmount),
        received: amount,
      });
      return NextResponse.json(
        { resultCode: 1, message: "Amount mismatch" },
        { status: 400 }
      );
    }

    // 6. Xử lý theo result code
    if (resultCode === 0) {
      // Thanh toán thành công
      await prisma.pledges.update({
        where: { id: pledgeId },
        data: {
          status: "SUCCESS",
          transactionId: transId || pledge.transactionId,
          updatedAt: new Date(),
        },
      });

      // Cộng tiền vào campaign
      await prisma.campaigns.update({
        where: { id: pledge.campaignId },
        data: {
          currentAmount: {
            increment: pledge.amount,
          },
        },
      });

      // Kiểm tra campaign đạt mục tiêu
      const updatedCampaign = await prisma.campaigns.findUnique({
        where: { id: pledge.campaignId },
      });

      if (
        updatedCampaign &&
        Number(updatedCampaign.currentAmount) >= Number(updatedCampaign.goalAmount) &&
        updatedCampaign.status === "ACTIVE"
      ) {
        await prisma.campaigns.update({
          where: { id: pledge.campaignId },
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
      await prisma.pledges.update({
        where: { id: pledgeId },
        data: {
          status: "FAILED",
          updatedAt: new Date(),
        },
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
