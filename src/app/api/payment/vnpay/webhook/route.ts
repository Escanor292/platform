import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
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
    const pledge = await prisma.pledge.findUnique({
      where: { id: pledgeId },
      include: { campaign: true },
    });

    if (!pledge) {
      console.error("[VNPAY WEBHOOK] Pledge not found:", pledgeId);
      return NextResponse.json(
        { RspCode: "01", Message: "Pledge not found" },
        { status: 404 }
      );
    }

    // 4. Kiểm tra đã xử lý chưa
    if (pledge.status === "SUCCESS") {
      console.log("[VNPAY WEBHOOK] Already processed:", pledgeId);
      return NextResponse.json({
        RspCode: "00",
        Message: "Already processed",
      });
    }

    // 5. Xử lý theo response code
    if (responseCode === "00") {
      // Thanh toán thành công
      await prisma.pledge.update({
        where: { id: pledgeId },
        data: {
          status: "SUCCESS",
          transactionId: transactionNo || pledge.transactionId,
          updatedAt: new Date(),
        },
      });

      // Cộng tiền vào campaign
      await prisma.campaign.update({
        where: { id: pledge.campaignId },
        data: {
          currentAmount: {
            increment: pledge.amount,
          },
        },
      });

      // Kiểm tra campaign đạt mục tiêu
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

      // Send notifications (non-blocking)
      // 1. Notify Creator
      notificationService.send({
        userId: pledge.campaign.creatorId,
        type: "PLEDGE_RECEIVED",
        title: "Bạn có lượt ủng hộ mới!",
        message: `Chiến dịch "${pledge.campaign.title}" vừa nhận được ${Number(pledge.amount).toLocaleString('vi-VN')} VNĐ từ ${pledge.displayName}.`,
        payload: {
          campaignId: pledge.campaignId,
          pledgeId: pledge.id,
          amount: Number(pledge.amount)
        }
      });

      // 2. Notify Backer (if logged in)
      if (pledge.userId) {
        notificationService.send({
          userId: pledge.userId,
          type: "PAYMENT_SUCCESS",
          title: "Ủng hộ thành công!",
          message: `Bạn đã ủng hộ thành công ${Number(pledge.amount).toLocaleString('vi-VN')} VNĐ cho chiến dịch "${pledge.campaign.title}".`,
          payload: {
            campaignId: pledge.campaignId,
            pledgeId: pledge.id
          }
        });
      }

      console.log("[VNPAY WEBHOOK] Payment successful:", pledgeId);

      return NextResponse.json({
        RspCode: "00",
        Message: "Success",
      });
    } else {
      // Thanh toán thất bại
      await prisma.pledge.update({
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
