import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { recalculateCampaignAmount } from "@/lib/order-fulfillment";
import { onPledgeSuccess } from "@/lib/tax/on-pledge-success";
import { notificationService } from "@/services/mongodb/notification.service";
import crypto from "crypto";

/**
 * VNPay IPN (Instant Payment Notification)
 * VNPay gọi webhook này sau khi thanh toán thành công
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    console.log("[VNPAY WEBHOOK] Received:", params);

    // 1. Verify signature
    const vnpSecureHash = params["vnp_SecureHash"];
    delete params["vnp_SecureHash"];
    delete params["vnp_SecureHashType"];

    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join("&");

    const secretKey = process.env.VNP_HASH_SECRET || "";
    const signData = sortedParams;
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    if (vnpSecureHash !== signed) {
      console.error("[VNPAY WEBHOOK] Invalid signature");
      return NextResponse.json(
        { RspCode: "97", Message: "Invalid signature" },
        { status: 400 }
      );
    }

    // 2. Parse data
    const pledgeId = params["vnp_TxnRef"];
    const responseCode = params["vnp_ResponseCode"];
    const transactionNo = params["vnp_TransactionNo"];
    const amount = parseInt(params["vnp_Amount"]) / 100; // VNPay gửi amount * 100

    if (!pledgeId) {
      console.error("[VNPAY WEBHOOK] Missing pledge ID");
      return NextResponse.json(
        { RspCode: "01", Message: "Missing pledge ID" },
        { status: 400 }
      );
    }

    // 3. Tìm pledge
    const pledge = await prisma.pledges.findUnique({
      where: { id: pledgeId },
      include: { campaigns: true },
    });

    if (!pledge) {
      console.error("[VNPAY WEBHOOK] Pledge not found:", pledgeId);
      return NextResponse.json(
        { RspCode: "01", Message: "Pledge not found" },
        { status: 404 }
      );
    }

    // 4. Kiểm tra đã xử lý chưa
    if (pledge.status === "SUCCESS" || pledge.status === "REFUNDED") {
      console.log("[VNPAY WEBHOOK] Already processed:", pledgeId);
      return NextResponse.json({
        RspCode: "00",
        Message: "Already processed",
      });
    }

    // 5. Xử lý theo response code
    if (responseCode === "00") {
      // Thanh toán thành công. VNPay gửi số tiền theo đơn vị đồng sau khi chia 100.
      const expectedChargeAmount = Number(pledge.chargeAmount || pledge.totalAmount);
      if (Math.abs(expectedChargeAmount - amount) > 100) {
        console.error("[VNPAY WEBHOOK] Amount mismatch", { pledgeId, expected: expectedChargeAmount, received: amount });
        return NextResponse.json({ RspCode: "04", Message: "Invalid amount" }, { status: 400 });
      }

      const updateSuccess = async (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => {
        await tx.pledges.update({
          where: { id: pledgeId },
          data: {
            status: "SUCCESS",
            transactionId: transactionNo || pledge.transactionId,
            fulfillmentStatus: pledge.rewardId ? "PROCESSING" : "NOT_APPLICABLE",
            paidAmount: expectedChargeAmount,
            remainingAmount: Math.max(0, Number(pledge.orderTotalAmount || pledge.totalAmount) - expectedChargeAmount),
            accountingAmount: pledge.isCashOnDelivery ? pledge.depositAmount : pledge.amount,
            webhookProcessedAt: new Date(),
            updatedAt: new Date(),
          },
        });
        if (pledge.campaignId) {
          await recalculateCampaignAmount(tx, pledge.campaignId);
        }
      };
      await prisma.$transaction(updateSuccess);
      const updatedCampaign = pledge.campaignId ? await prisma.campaigns.findUnique({ where: { id: pledge.campaignId } }) : null;

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
        newValue: { status: "SUCCESS", transactionId: transactionNo },
        reason: "VNPay payment successful",
      });
      await onPledgeSuccess(pledge.id);

      // Send campaign notifications only when this pledge is attributed to a campaign.
      if (pledge.campaigns && pledge.campaignId) {
        notificationService.send({
          userId: pledge.campaigns.creatorId,
          type: "PLEDGE_RECEIVED",
          title: "Bạn có lượt ủng hộ mới!",
          message: `Chiến dịch "${pledge.campaigns.title}" vừa nhận được ${Number(pledge.amount).toLocaleString('vi-VN')} VNĐ từ ${pledge.displayName}.`,
          payload: { campaignId: pledge.campaignId, pledgeId: pledge.id, amount: Number(pledge.amount) }
        });

        if (pledge.userId) {
          notificationService.send({
            userId: pledge.userId,
            type: "PAYMENT_SUCCESS",
            title: "Ủng hộ thành công!",
            message: `Bạn đã ủng hộ thành công ${Number(pledge.amount).toLocaleString('vi-VN')} VNĐ cho chiến dịch "${pledge.campaigns.title}".`,
            payload: { campaignId: pledge.campaignId, pledgeId: pledge.id }
          });
        }
      }

      console.log("[VNPAY WEBHOOK] Payment successful:", pledgeId);

      return NextResponse.json({
        RspCode: "00",
        Message: "Success",
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
        reason: `VNPay payment failed: ${responseCode}`,
      });

      console.log("[VNPAY WEBHOOK] Payment failed:", pledgeId, responseCode);

      return NextResponse.json({
        RspCode: "00",
        Message: "Confirmed",
      });
    }
  } catch (error: any) {
    console.error("[VNPAY WEBHOOK ERROR]", error);
    return NextResponse.json(
      { RspCode: "99", Message: "System error" },
      { status: 500 }
    );
  }
}
