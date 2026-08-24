import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyVNPayReturn } from "@/lib/payment/vnpay";
import { recalculateCampaignAmount } from "@/lib/order-fulfillment";

/**
 * GET /api/payments/webhook
 * VNPAY Return URL callback
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const result = verifyVNPayReturn(queryParams);

    const pledgeId = queryParams["vnp_TxnRef"];
    const responseCode = queryParams["vnp_ResponseCode"];

    if (!pledgeId) {
      return NextResponse.redirect(new URL("/payment-success?status=error", req.url));
    }

    if (responseCode === "00" && result.isVerified) {
      // 1. Ghi nhận payment và accounting trong cùng transaction.
      await prisma.$transaction(async (tx) => {
        const existingPledge = await tx.pledges.findUnique({ where: { id: pledgeId } });
        if (!existingPledge || existingPledge.status === "SUCCESS" || existingPledge.status === "REFUNDED") return;
        const paidAmount = Number(existingPledge.chargeAmount || existingPledge.totalAmount);
        await tx.pledges.update({
          where: { id: pledgeId },
          data: {
            status: "SUCCESS",
            fulfillmentStatus: existingPledge.rewardId ? "PROCESSING" : "NOT_APPLICABLE",
            paidAmount,
            remainingAmount: Math.max(0, Number(existingPledge.orderTotalAmount || existingPledge.totalAmount) - paidAmount),
            accountingAmount: existingPledge.isCashOnDelivery ? existingPledge.depositAmount : existingPledge.amount,
            webhookProcessedAt: new Date(),
            updatedAt: new Date(),
          },
        });
        if (existingPledge.campaignId) await recalculateCampaignAmount(tx, existingPledge.campaignId);
      });

      return NextResponse.redirect(
        new URL(`/payment-success?status=success&ref=${pledgeId}`, req.url)
      );
    } else {
      // Thanh toán thất bại và giải phóng tồn kho đã giữ.
      await prisma.$transaction(async (tx) => {
        const existingPledge = await tx.pledges.findUnique({ where: { id: pledgeId }, select: { stockReserved: true, rewardId: true, quantity: true } });
        if (existingPledge?.stockReserved && existingPledge.rewardId) {
          await tx.rewards.update({ where: { id: existingPledge.rewardId }, data: { stock: { increment: existingPledge.quantity }, updatedAt: new Date() } });
        }
        await tx.pledges.update({ where: { id: pledgeId }, data: { status: "FAILED", stockReserved: false, fulfillmentStatus: "CANCELED", cancellationReason: "Thanh toán không thành công", webhookProcessedAt: new Date(), updatedAt: new Date() } });
      });

      return NextResponse.redirect(
        new URL(`/payment-success?status=failed&ref=${pledgeId}`, req.url)
      );
    }
  } catch (error) {
    console.error("[GET /api/payments/webhook]", error);
    return NextResponse.redirect(new URL("/payment-success?status=error", req.url));
  }
}

/**
 * POST /api/payments/webhook
 * IPN from PayOS or others
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Ví dụ xử lý PayOS Webhook
    if (body.orderCode && body.status === "PAID") {
       // PayOS thường gửi orderCode là Number, chúng ta lưu transactionId hoặc pledgeId tương ứng
       const pledge = await prisma.pledges.findFirst({
         where: { transactionId: `PAYOS-${body.orderCode}` } 
       });

          if (pledge) {
            await prisma.$transaction(async (tx) => {
              const paidAmount = Number(pledge.chargeAmount || pledge.totalAmount);
              await tx.pledges.update({
                where: { id: pledge.id },
                data: {
                  status: "SUCCESS",
                  fulfillmentStatus: pledge.rewardId ? "PROCESSING" : "NOT_APPLICABLE",
                  paidAmount,
                  remainingAmount: Math.max(0, Number(pledge.orderTotalAmount || pledge.totalAmount) - paidAmount),
                  accountingAmount: pledge.isCashOnDelivery ? pledge.depositAmount : pledge.amount,
                  webhookProcessedAt: new Date(),
                  updatedAt: new Date(),
                },
              });
              if (pledge.campaignId) await recalculateCampaignAmount(tx, pledge.campaignId);
            });
          }
       return NextResponse.json({ success: true });
    }

    return NextResponse.json({ message: "ignored" });
  } catch (error) {
    console.error("[POST /api/payments/webhook]", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
