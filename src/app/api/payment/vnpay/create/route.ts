import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { vnpay } from "@/lib/payment/vnpay";
import { ProductCode } from "vnpay";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const user = session?.user;
    const body = await request.json();
    const {
      amount, campaignId,
      tipAmount = 0, vatAmount = 0,
      guestEmail = null, displayName = null,
      isAnonymous = false, ipAddress = null
    } = body;

    const totalAmount = amount + tipAmount + vatAmount;
    const transactionId = `VNPAY-${Date.now()}`;

    // 1. Tạo bản ghi Pledge (Trạng thái PENDING)
    const pledge = await prisma.pledges.create({
      data: {
        id: crypto.randomUUID(),
        userId: user?.id || null,
        campaignId,
        amount,
        tipAmount,
        vatAmount,
        totalAmount,
        email: guestEmail,
        displayName: isAnonymous ? "Người dùng ẩn danh" : (displayName || user?.name || "Người ủng hộ"),
        isAnonymous,
        ipAddress,
        paymentProvider: "VNPAY",
        transactionId: transactionId,
        status: "PENDING",
        updatedAt: new Date(),
      }
    });

    // 2. Tạo Link VNPay
    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: totalAmount,
      vnp_IpAddr: ipAddress || "127.0.0.1",
      vnp_OrderInfo: `CFVN-PLEDGE-${pledge.id.slice(0, 8)}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: `${process.env.NEXTAUTH_URL}/payment-success?status=success&ref=${pledge.id}`,
      vnp_TxnRef: pledge.id,
    });

    return NextResponse.json({
      checkoutUrl: paymentUrl,
      pledgeId: pledge.id
    });

  } catch (error: any) {
    console.error("VNPay Create Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
