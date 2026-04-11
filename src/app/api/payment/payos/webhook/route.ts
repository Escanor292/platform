import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import crypto from "crypto";

/**
 * PayOS Webhook
 * PayOS gọi webhook này sau khi thanh toán thành công
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("[PAYOS WEBHOOK] Received:", body);

    // 1. Verify signature (nếu PayOS có)
    const signature = request.headers.get("x-payos-signature");
    if (signature && process.env.PAYOS_CHECKSUM_KEY) {
      const dataString = JSON.stringify(body);
      const hmac = crypto.createHmac("sha256", process.env.PAYOS_CHECKSUM_KEY);
      const expectedSignature = hmac.update(dataString).digest("hex");

      if (signature !== expectedSignature) {
        console.error("[PAYOS WEBHOOK] Invalid signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 400 }
        );
      }
    }

    // 2. Parse data
    const {
      orderCode,
      amount,
      description,
      accountNumber,
      reference,
      transactionDateTime,
      code, // PayOS status code
      desc, // PayOS status description
    } = body;

    // 3. Tìm pledge bằng orderCode
    // orderCode là số, cần tìm pledge có transactionId chứa orderCode
    const pledge = await prisma.pledge.findFirst({
      where: {
        OR: [
          { transactionId: { contains: orderCode.toString() } },
          { id: orderCode.toString() },
        ],
      },
      include: { campaign: true },
    });

    if (!pledge) {
      console.error("[PAYOS WEBHOOK] Pledge not found for orderCode:", orderCode);
      return NextResponse.json(
        { error: "Pledge not found" },
        { status: 404 }
      );
    }

    // 4. Kiểm tra đã xử lý chưa
    if (pledge.status === "SUCCESS") {
      console.log("[PAYOS WEBHOOK] Already processed:", pledge.id);
      return NextResponse.json({
        success: true,
        message: "Already processed",
      });
    }

    // 5. Kiểm tra số tiền
    if (Math.abs(Number(pledge.totalAmount) - amount) > 1) {
      console.error("[PAYOS WEBHOOK] Amount mismatch:", {
        expected: Number(pledge.totalAmount),
        received: amount,
      });
      return NextResponse.json(
        { error: "Amount mismatch" },
        { status: 400 }
      );
    }

    // 6. Xử lý theo status code
    // PayOS: code = "00" hoặc "000" = success
    if (code === "00" || code === "000" || code === 0) {
      // Thanh toán thành công
      await prisma.pledge.update({
        where: { id: pledge.id },
        data: {
          status: "SUCCESS",
          transactionId: reference || pledge.transactionId,
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
        newValue: { status: "SUCCESS", transactionId: reference },
        reason: "PayOS payment successful",
      });

      console.log("[PAYOS WEBHOOK] Payment successful:", pledge.id);

      return NextResponse.json({
        success: true,
        message: "Payment processed successfully",
      });
    } else {
      // Thanh toán thất bại
      await prisma.pledge.update({
        where: { id: pledge.id },
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
        reason: `PayOS payment failed: ${code} - ${desc}`,
      });

      console.log("[PAYOS WEBHOOK] Payment failed:", pledge.id, code);

      return NextResponse.json({
        success: true,
        message: "Payment status updated",
      });
    }
  } catch (error: any) {
    console.error("[PAYOS WEBHOOK ERROR]", error);
    return NextResponse.json(
      { error: error.message || "System error" },
      { status: 500 }
    );
  }
}

// GET endpoint để test webhook
export async function GET() {
  return NextResponse.json({
    message: "PayOS Webhook Endpoint",
    url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/payos/webhook`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-payos-signature": "optional_signature",
    },
  });
}
