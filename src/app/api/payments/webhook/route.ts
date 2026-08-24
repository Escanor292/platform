import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyVNPayReturn } from "@/lib/payment/vnpay";
import { releaseEscrow } from "@/lib/payment/escrow";

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
      // 1. Cập nhật trạng thái Pledge
      const existingPledge = await prisma.pledges.findUnique({ where: { id: pledgeId }, select: { rewardId: true } });
      const pledge = await prisma.pledges.update({
        where: { id: pledgeId },
        data: { status: "SUCCESS", fulfillmentStatus: existingPledge?.rewardId ? "PROCESSING" : "NOT_APPLICABLE" },
      });

      // 2. Cập nhật số tiền dự án (Escrow), chỉ áp dụng khi pledge gắn campaign.
      if (pledge.campaignId) await releaseEscrow(pledge.campaignId);

      return NextResponse.redirect(
        new URL(`/payment-success?status=success&ref=${pledgeId}`, req.url)
      );
    } else {
      // Thanh toán thất bại
      await prisma.pledges.update({
        where: { id: pledgeId },
        data: { status: "FAILED" },
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
          await prisma.pledges.update({
            where: { id: pledge.id },
            data: { status: "SUCCESS", fulfillmentStatus: pledge.rewardId ? "PROCESSING" : "NOT_APPLICABLE" }
          });
          if (pledge.campaignId) await releaseEscrow(pledge.campaignId);
       }
       return NextResponse.json({ success: true });
    }

    return NextResponse.json({ message: "ignored" });
  } catch (error) {
    console.error("[POST /api/payments/webhook]", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
