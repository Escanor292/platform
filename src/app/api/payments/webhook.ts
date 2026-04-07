import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyVNPayReturn } from "@/lib/payment/vnpay";
import { releaseEscrow } from "@/lib/payment/escrow";

/**
 * GET /api/payments/webhook
 * VNPAY Return URL callback (redirect sau khi thanh toán)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const result = verifyVNPayReturn(queryParams);

    const paymentId = queryParams["vnp_TxnRef"];
    const responseCode = queryParams["vnp_ResponseCode"];

    if (!paymentId) {
      return NextResponse.redirect(new URL("/payment-success?status=error", req.url));
    }

    if (responseCode === "00" && result.isVerified) {
      // Thanh toán thành công
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: "SUCCESS" },
      });

      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { pledge: true },
      });

      if (payment?.pledge) {
        await releaseEscrow(payment.pledge.campaignId);
      }

      return NextResponse.redirect(
        new URL(`/payment-success?status=success&ref=${paymentId}`, req.url)
      );
    } else {
      // Thanh toán thất bại
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: "FAILED" },
      });

      return NextResponse.redirect(
        new URL(`/payment-success?status=failed&ref=${paymentId}`, req.url)
      );
    }
  } catch (error) {
    console.error("[GET /api/payments/webhook]", error);
    return NextResponse.redirect(new URL("/payment-success?status=error", req.url));
  }
}

/**
 * POST /api/payments/webhook
 * IPN (Instant Payment Notification) từ VNPAY / MoMo
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Xử lý MoMo IPN
    if (body.partnerCode) {
      const { orderId, resultCode, amount } = body;

      if (resultCode === 0) {
        await prisma.payment.update({
          where: { id: orderId },
          data: { status: "SUCCESS", amount },
        });
      } else {
        await prisma.payment.update({
          where: { id: orderId },
          data: { status: "FAILED" },
        });
      }

      return NextResponse.json({ message: "ok" });
    }

    return NextResponse.json({ message: "unknown provider" }, { status: 400 });
  } catch (error) {
    console.error("[POST /api/payments/webhook]", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
