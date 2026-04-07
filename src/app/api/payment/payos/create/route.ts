import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import PayOS from "@payos/node";
import { getUser } from "@/lib/auth";

const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID!,
  process.env.PAYOS_API_KEY!,
  process.env.PAYOS_CHECKSUM_KEY!
);

export async function POST(request: Request) {
  try {
    const user = await getUser();
    const data = await request.json();
    const { 
      amount, campaignId, rewardId, 
      tipAmount = 0, vatAmount = 0,
      guestEmail = null, displayName = null, 
      isAnonymous = false, ipAddress = null,
      isInvoiceRequired = false, 
      invoiceName = null, invoiceTaxId = null, invoiceAddress = null
    } = data;

    // 1. Tạo bản ghi Pledge
    const pledge = await prisma.pledge.create({
      data: {
        userId: user?.id || null, // Guest support
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

        isInvoiceRequired,
        invoiceName,
        invoiceTaxId,
        invoiceAddress,
      }
    });

    // 2. Tạo bản ghi Payment
    const orderCode = Number(Date.now());
    const payment = await prisma.payment.create({
      data: {
        pledgeId: pledge.id,
        userId: user?.id || null,
        amount,
        method: "PAYOS",
        orderCode: BigInt(orderCode),
      }
    });

    // 3. Tạo link thanh toán PayOS
    const body = {
      orderCode,
      amount,
      description: `CFVN-PLEDGE-${pledge.id.slice(0, 8)}`,
      cancelUrl: `${process.env.NEXTAUTH_URL}/campaigns`,
      returnUrl: `${process.env.NEXTAUTH_URL}/payment-success?code=${payment.id}`,
    };

    const paymentLinkRes = await payos.createPaymentLink(body);

    return NextResponse.json({ 
      checkoutUrl: paymentLinkRes.checkoutUrl,
      paymentId: payment.id 
    });

  } catch (error: any) {
    console.error("PayOS Create Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
