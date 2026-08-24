import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { recalculateCampaignAmount } from "@/lib/order-fulfillment";
import crypto from "crypto";

/**
 * PayOS Webhook Handler
 * PayOS gọi webhook này sau khi thanh toán thành công/thất bại
 * 
 * Webhook payload:
 * {
 *   orderCode: number,
 *   amount: number,
 *   description: string,
 *   accountNumber: string,
 *   reference: string,
 *   transactionDateTime: string,
 *   code: string ("00" = success),
 *   desc: string
 * }
 */
export async function POST(request: NextRequest) {
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  try {
    const body = await request.json();
    const { orderCode, amount, code, desc, reference, transactionDateTime } = body;

    console.log(`[PAYOS WEBHOOK ${requestId}] Received:`, { orderCode, amount, code });

    // ============================================================
    // 1. VERIFY SIGNATURE
    // ============================================================
    const signature = request.headers.get("x-payos-signature");
    if (process.env.PAYOS_CHECKSUM_KEY) {
      if (!signature) {
        console.error(`[PAYOS WEBHOOK ${requestId}] Missing signature header`);
        return NextResponse.json(
          { error: "Missing signature" },
          { status: 400 }
        );
      }

      const dataString = JSON.stringify(body);
      const hmac = crypto.createHmac("sha256", process.env.PAYOS_CHECKSUM_KEY);
      const expectedSignature = hmac.update(dataString).digest("hex");

      if (signature !== expectedSignature) {
        console.error(`[PAYOS WEBHOOK ${requestId}] Invalid signature`, {
          received: signature,
          expected: expectedSignature
        });
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
      console.log(`[PAYOS WEBHOOK ${requestId}] Signature verified ✓`);
    }

    // ============================================================
    // 2. VALIDATE INPUT
    // ============================================================
    if (!orderCode || !amount) {
      console.error(`[PAYOS WEBHOOK ${requestId}] Missing required fields`);
      return NextResponse.json(
        { error: "Missing orderCode or amount" },
        { status: 400 }
      );
    }

    // ============================================================
    // 3. FIND PLEDGE BY ORDER CODE
    // ============================================================
    const pledge = await prisma.pledges.findFirst({
      where: {
        payosOrderCode: orderCode.toString(),
        paymentProvider: { in: ["PAYOS", "PAYOS_COD_DEPOSIT"] },
      },
      include: { campaigns: true, users: true },
    });

    if (!pledge) {
      console.error(`[PAYOS WEBHOOK ${requestId}] Pledge not found for orderCode: ${orderCode}`);
      // Vẫn return 200 để PayOS không retry
      return NextResponse.json({
        success: false,
        message: "Pledge not found",
      });
    }

    console.log(`[PAYOS WEBHOOK ${requestId}] Found pledge: ${pledge.id}`);

    // ============================================================
    // 4. IDEMPOTENCY CHECK - Tránh xử lý 2 lần
    // ============================================================
    if (pledge.status === "SUCCESS" && pledge.webhookProcessedAt) {
      console.log(`[PAYOS WEBHOOK ${requestId}] Already processed at ${pledge.webhookProcessedAt}`);
      return NextResponse.json({
        success: true,
        message: "Already processed",
      });
    }

    // ============================================================
    // 5. VERIFY AMOUNT
    // ============================================================
    const pledgeChargeAmount = Number(pledge.chargeAmount || pledge.totalAmount);
    if (Math.abs(pledgeChargeAmount - amount) > 100) { // Cho phép sai lệch 100 VND
      console.error(`[PAYOS WEBHOOK ${requestId}] Amount mismatch`, {
        expected: pledgeChargeAmount,
        received: amount,
          difference: Math.abs(pledgeChargeAmount - amount)
      });
      return NextResponse.json(
        { error: "Amount mismatch" },
        { status: 400 }
      );
    }

    console.log(`[PAYOS WEBHOOK ${requestId}] Amount verified ✓`);

    // ============================================================
    // 6. PROCESS PAYMENT STATUS
    // ============================================================
    const isSuccess = code === "00" || code === "000" || code === 0;

    if (isSuccess) {
      // ========== PAYMENT SUCCESS ==========
      console.log(`[PAYOS WEBHOOK ${requestId}] Processing successful payment`);

      // Update pledge
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
        Number(updatedCampaign) >= Number(pledge.campaigns?.goalAmount || 0) &&
        updatedCampaign.status === "ACTIVE"
      ) {
        await prisma.campaigns.update({
          where: { id: pledge.campaignId! },
          data: { status: "SUCCESS" },
        });
        console.log(`[PAYOS WEBHOOK ${requestId}] Campaign ${pledge.campaignId} reached goal!`);
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
        metadata: {
          orderCode,
          reference,
          transactionDateTime,
          webhookRequestId: requestId,
        }
      });

      console.log(`[PAYOS WEBHOOK ${requestId}] ✓ Payment successful for pledge ${pledge.id}`);

      return NextResponse.json({
        success: true,
        message: "Payment processed successfully",
        pledgeId: pledge.id,
      });

    } else {
      // ========== PAYMENT FAILED ==========
      console.log(`[PAYOS WEBHOOK ${requestId}] Processing failed payment: ${code} - ${desc}`);

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

      // Audit log
      await createAuditLog({
        userId: pledge.userId,
        action: "UPDATE",
        entityType: "PLEDGE",
        entityId: pledge.id,
        oldValue: { status: "PENDING" },
        newValue: { status: "FAILED" },
        reason: `PayOS payment failed: ${code} - ${desc}`,
        metadata: {
          orderCode,
          errorCode: code,
          errorDesc: desc,
          webhookRequestId: requestId,
        }
      });

      console.log(`[PAYOS WEBHOOK ${requestId}] ✗ Payment failed for pledge ${pledge.id}`);

      return NextResponse.json({
        success: true,
        message: "Payment status updated",
        pledgeId: pledge.id,
      });
    }

  } catch (error: any) {
    console.error(`[PAYOS WEBHOOK ${requestId}] ERROR:`, error);
    return NextResponse.json(
      {
        error: error.message || "System error",
        requestId: requestId
      },
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
      "x-payos-signature": "required_for_production",
    },
    testPayload: {
      orderCode: 1234567890,
      amount: 100000,
      description: "Test payment",
      accountNumber: "1234567890",
      reference: "TEST-REF-001",
      transactionDateTime: new Date().toISOString(),
      code: "00",
      desc: "Success"
    }
  });
}
