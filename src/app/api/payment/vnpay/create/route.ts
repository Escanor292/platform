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
      amount, campaignId, rewardId, 
      tipAmount = 0, vatAmount = 0,
      guestEmail = null, displayName = null, 
      isAnonymous = false, ipAddress = null
    } = body;

    // 1. Tạo bản ghi Pledge
    const pledge = await prisma.pledge.create({
      data: {
        userId: user?.id || null,
        campaignId,
        rewardId,
        amount,
        projectAmount: amount - tipAmount - vatAmount,
        platformTipAmount: tipAmount,
        vatAmount: vatAmount,
        guestEmail,
        displayName: isAnonymous ? "Người dùng ẩn danh" : (displayName || user?.name || "Người ủng hộ"),
        isAnonymous,
        ipAddress,
      }
    });

    // 2. Tạo bản ghi Payment
    const payment = await prisma.payment.create({
      data: {
        pledgeId: pledge.id,
        userId: user?.id || null,
        amount,
        method: "VNPAY",
      }
    });

    // 3. Tạo Link VNPay
    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: amount,
      vnp_IpAddr: ipAddress || "127.0.0.1",
      vnp_OrderInfo: `CFVN-PLEDGE-${pledge.id.slice(0, 8)}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: `${process.env.NEXTAUTH_URL}/payment-success?code=${payment.id}`,
      vnp_TxnRef: payment.id,
    });


    return NextResponse.json({ 
        checkoutUrl: paymentUrl,
        paymentId: payment.id 
    });


  } catch (error: any) {
    console.error("VNPay Create Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
