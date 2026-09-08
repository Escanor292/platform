import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { recalculateCampaignAmount } from "@/lib/order-fulfillment";
import { onPledgeSuccess } from "@/lib/tax/on-pledge-success";
import { getSePay } from "@/lib/payment/sepay";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get("x-sepay-signature") || body.signature;
    if (signature) {
      const sepay = getSePay();
      if (!sepay.verifyIPNSignature(body, signature)) {
        return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 });
      }
    }

    const { notification_type, order, transaction } = body;
    if (notification_type !== "ORDER_PAID") {
      return NextResponse.json({ success: true, message: "Notification received but not processed" });
    }

    const invoiceNumber = order.order_invoice_number;
    const pledgeIdMatch = invoiceNumber.match(/INV-([a-z0-9]+)-/i);
    if (!pledgeIdMatch) {
      return NextResponse.json({ success: false, message: "Invalid invoice number format" }, { status: 400 });
    }

    const pledge = await prisma.pledges.findFirst({
      where: { id: { startsWith: pledgeIdMatch[1] }, paymentProvider: "SEPAY" },
      include: { campaigns: true },
    });
    if (!pledge) {
      return NextResponse.json({ success: false, message: "Pledge not found" }, { status: 404 });
    }
    if (pledge.status === "SUCCESS" || pledge.status === "REFUNDED") {
      if (pledge.status === "SUCCESS") await onPledgeSuccess(pledge.id);
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    const orderAmount = parseFloat(order.order_amount);
    const pledgeAmount = Number(pledge.chargeAmount || pledge.totalAmount);
    if (Math.abs(pledgeAmount - orderAmount) > 100) {
      return NextResponse.json({ success: false, message: "Amount mismatch" }, { status: 400 });
    }

    const orderStatus = order.order_status;
    const transactionStatus = transaction.transaction_status;

    if (orderStatus === "CAPTURED" && transactionStatus === "APPROVED") {
      const updatedCampaign = await prisma.$transaction(async (tx) => {
        await tx.pledges.update({
          where: { id: pledge.id },
          data: {
            status: "SUCCESS",
            fulfillmentStatus: pledge.rewardId ? "PROCESSING" : "NOT_APPLICABLE",
            transactionId: transaction.transaction_id || pledge.transactionId,
            paidAmount: pledgeAmount,
            remainingAmount: Math.max(0, Number(pledge.orderTotalAmount || pledge.totalAmount) - pledgeAmount),
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
        newValue: { status: "SUCCESS", transactionId: transaction.transaction_id },
        reason: "SePay payment successful",
      });
      await onPledgeSuccess(pledge.id);
      return NextResponse.json({ success: true, message: "Payment processed successfully" });
    }

    if (orderStatus === "DECLINED" || orderStatus === "CANCELLED" || transactionStatus === "DECLINED") {
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
            cancellationReason: "Thanh toán không thành công hoặc bị hủy",
            webhookProcessedAt: new Date(),
            updatedAt: new Date(),
          },
        });
      });
      return NextResponse.json({ success: true, message: "Payment status updated" });
    }

    return NextResponse.json({ success: true, message: "Status noted but not processed" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "System error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "SePay Webhook Endpoint" });
}
