import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { getSePay } from "@/lib/payment/sepay";

/**
 * SePay IPN (Instant Payment Notification)
 * SePay gọi webhook này sau khi thanh toán thành công/thất bại
 * 
 * Docs: https://docs.sepay.vn
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("[SEPAY WEBHOOK] Received:", JSON.stringify(body, null, 2));

    // 1. Verify signature (nếu SePay gửi signature trong header hoặc body)
    const signature = request.headers.get("x-sepay-signature") || body.signature;

    if (signature) {
      const sepay = getSePay();
      const isValid = sepay.verifyIPNSignature(body, signature);

      if (!isValid) {
        console.error("[SEPAY WEBHOOK] Invalid signature");
        return NextResponse.json(
          { success: false, message: "Invalid signature" },
          { status: 400 }
        );
      }
    }

    // 2. Parse data từ IPN
    const {
      timestamp,
      notification_type,
      order,
      transaction,
      customer,
    } = body;

    // Kiểm tra notification type
    if (notification_type !== "ORDER_PAID") {
      console.log("[SEPAY WEBHOOK] Skipping notification type:", notification_type);
      return NextResponse.json({
        success: true,
        message: "Notification received but not processed",
      });
    }

    // 3. Tìm pledge bằng order_invoice_number
    // Format: INV-{pledgeId}-{timestamp}
    const invoiceNumber = order.order_invoice_number;
    const pledgeIdMatch = invoiceNumber.match(/INV-([a-z0-9]+)-/i);

    if (!pledgeIdMatch) {
      console.error("[SEPAY WEBHOOK] Cannot extract pledge ID from invoice:", invoiceNumber);
      return NextResponse.json(
        { success: false, message: "Invalid invoice number format" },
        { status: 400 }
      );
    }

    const pledgeIdPrefix = pledgeIdMatch[1];

    // Tìm pledge có ID bắt đầu với prefix
    const pledge = await prisma.pledges.findFirst({
      where: {
        id: {
          startsWith: pledgeIdPrefix,
        },
        paymentProvider: "SEPAY",
      },
      include: { campaigns: true },
    });

    if (!pledge) {
      console.error("[SEPAY WEBHOOK] Pledge not found for invoice:", invoiceNumber);
      return NextResponse.json(
        { success: false, message: "Pledge not found" },
        { status: 404 }
      );
    }

    // 4. Kiểm tra đã xử lý chưa
    if (pledge.status === "SUCCESS") {
      console.log("[SEPAY WEBHOOK] Already processed:", pledge.id);
      return NextResponse.json({
        success: true,
        message: "Already processed",
      });
    }

    // 5. Kiểm tra số tiền
    const orderAmount = parseFloat(order.order_amount);
    const pledgeAmount = Number(pledge.totalAmount);

    if (Math.abs(pledgeAmount - orderAmount) > 1) {
      console.error("[SEPAY WEBHOOK] Amount mismatch:", {
        expected: pledgeAmount,
        received: orderAmount,
      });
      return NextResponse.json(
        { success: false, message: "Amount mismatch" },
        { status: 400 }
      );
    }

    // 6. Xử lý theo order status
    const orderStatus = order.order_status;
    const transactionStatus = transaction.transaction_status;

    if (orderStatus === "CAPTURED" && transactionStatus === "APPROVED") {
      // Thanh toán thành công
      await prisma.pledges.update({
        where: { id: pledge.id },
        data: {
          status: "SUCCESS",
          transactionId: transaction.transaction_id || pledge.transactionId,
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
        newValue: {
          status: "SUCCESS",
          transactionId: transaction.transaction_id,
        },
        reason: "SePay payment successful",
        metadata: {
          order_id: order.id,
          transaction_id: transaction.transaction_id,
          payment_method: transaction.payment_method,
        },
      });

      console.log("[SEPAY WEBHOOK] Payment successful:", pledge.id);

      return NextResponse.json({
        success: true,
        message: "Payment processed successfully",
      });
    } else if (
      orderStatus === "DECLINED" ||
      orderStatus === "CANCELLED" ||
      transactionStatus === "DECLINED"
    ) {
      // Thanh toán thất bại hoặc bị hủy
      await prisma.pledges.update({
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
        reason: `SePay payment failed: ${orderStatus} - ${transactionStatus}`,
        metadata: {
          order_id: order.id,
          order_status: orderStatus,
          transaction_status: transactionStatus,
        },
      });

      console.log("[SEPAY WEBHOOK] Payment failed:", pledge.id, orderStatus);

      return NextResponse.json({
        success: true,
        message: "Payment status updated",
      });
    } else {
      // Trạng thái khác (PENDING, PROCESSING, etc.)
      console.log("[SEPAY WEBHOOK] Unhandled status:", orderStatus, transactionStatus);

      return NextResponse.json({
        success: true,
        message: "Status noted but not processed",
      });
    }
  } catch (error: any) {
    console.error("[SEPAY WEBHOOK ERROR]", error);
    return NextResponse.json(
      { success: false, message: error.message || "System error" },
      { status: 500 }
    );
  }
}

// GET endpoint để test webhook
export async function GET() {
  return NextResponse.json({
    message: "SePay Webhook Endpoint",
    url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/sepay/webhook`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-sepay-signature": "optional_signature",
    },
    documentation: "https://docs.sepay.vn",
  });
}
