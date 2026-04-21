import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Decimal } from "@prisma/client/runtime/library";
import { createPayOSPaymentLink } from "@/lib/payment/payos";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const data = await request.json();
    const {
      amount, campaignId,
      rewardId = null,
      tipAmount = 0, vatAmount = 0,
      guestEmail = null, displayName = null,
      shippingAddress = null,
      isAnonymous = false, ipAddress = null
    } = data;

    // Validate input
    if (!campaignId || !amount || amount < 50000) {
      return NextResponse.json(
        { error: "Invalid campaign or amount" },
        { status: 400 }
      );
    }

    const totalAmount = amount + tipAmount + vatAmount;
    const transactionId = `PAYOS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 1. Tạo bản ghi Pledge (Trạng thái PENDING)
    const pledge = await prisma.pledge.create({
      data: {
        userId: session?.user?.id || null,
        campaignId,
        rewardId: rewardId || null,
        amount: new Decimal(amount),
        tipAmount: new Decimal(tipAmount),
        vatAmount: new Decimal(vatAmount),
        totalAmount: new Decimal(totalAmount),

        email: guestEmail,
        displayName: isAnonymous ? "Người dùng ẩn danh" : (displayName || session?.user?.name || "Người ủng hộ"),
        shippingAddress: shippingAddress,
        isAnonymous,
        ipAddress,

        paymentProvider: "PAYOS",
        transactionId: transactionId,
        status: "PENDING",
      }
    });

    // 2. Tạo link thanh toán PayOS
    const orderCode = Number(Date.now());

    console.log("[PAYOS CREATE] Creating payment link:", {
      orderCode,
      pledgeId: pledge.id,
      amount: totalAmount
    });

    let paymentLinkRes;
    
    if (process.env.NODE_ENV === 'development') {
        console.log("[PAYOS CREATE] Development mode: Using local mock checkout.");
        paymentLinkRes = {
            checkoutUrl: `${process.env.NEXTAUTH_URL}/api/payment/payos/mock-checkout?orderCode=${orderCode}&amount=${totalAmount}&pledgeId=${pledge.id}`
        };
    } else {
        paymentLinkRes = await createPayOSPaymentLink({
          orderCode,
          amount: Math.round(totalAmount),
          description: `Ung ho du an ${campaignId.slice(0, 8)}`,
          cancelUrl: `${process.env.NEXTAUTH_URL}/campaigns`,
          returnUrl: `${process.env.NEXTAUTH_URL}/payment-success?status=success&ref=${pledge.id}`,
        });
    }

    // 3. Cập nhật pledge với orderCode từ PayOS
    await prisma.pledge.update({
      where: { id: pledge.id },
      data: {
        payosOrderCode: orderCode.toString(),
      }
    });

    console.log("[PAYOS CREATE] ✓ Payment link created:", {
      pledgeId: pledge.id,
      orderCode,
      checkoutUrl: paymentLinkRes.checkoutUrl
    });

    return NextResponse.json({
      checkoutUrl: paymentLinkRes.checkoutUrl,
      pledgeId: pledge.id,
      orderCode: orderCode
    });

  } catch (error: any) {
    console.error("[PAYOS CREATE ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment link" },
      { status: 500 }
    );
  }
}
