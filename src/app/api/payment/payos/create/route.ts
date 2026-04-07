import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import PayOS from "@payos/node";
import { auth } from "@/lib/auth";

let payosInstance: any = null;

function getPayos() {
  if (payosInstance) return payosInstance;
  
  const PayOSClass = (PayOS as any).default || PayOS;
  if (!PayOSClass) {
    throw new Error("PayOS module not found or failed to load");
  }
  
  payosInstance = new PayOSClass(
    process.env.PAYOS_CLIENT_ID!,
    process.env.PAYOS_API_KEY!,
    process.env.PAYOS_CHECKSUM_KEY!
  );
  return payosInstance;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const data = await request.json();
    const { 
      amount, campaignId, 
      tipAmount = 0, vatAmount = 0,
      guestEmail = null, displayName = null, 
      isAnonymous = false, ipAddress = null
    } = data;

    const transactionId = `PAYOS-${Date.now()}`;

    // 1. Tạo bản ghi Pledge (Trạng thái PENDING)
    const pledge = await prisma.pledge.create({
      data: {
        userId: session?.user?.id || null,
        campaignId,
        amount: amount,
        tipAmount,
        vatAmount,
        totalAmount: amount + tipAmount + vatAmount,
        
        email: guestEmail,
        displayName: isAnonymous ? "Người dùng ẩn danh" : (displayName || session?.user?.name || "Người ủng hộ"),
        isAnonymous,
        ipAddress,

        paymentProvider: "PAYOS",
        transactionId: transactionId,
        status: "PENDING",
      }
    });

    // 2. Tạo link thanh toán PayOS
    const orderCode = Number(Date.now());
    const body = {
      orderCode,
      amount: Number(amount + tipAmount + vatAmount),
      description: `Ủng hộ dự án ${campaignId.slice(0, 8)}`,
      cancelUrl: `${process.env.NEXTAUTH_URL}/campaigns`,
      returnUrl: `${process.env.NEXTAUTH_URL}/payment-success?status=success&ref=${pledge.id}`,
    };

    const paymentLinkRes = await getPayos().createPaymentLink(body);

    return NextResponse.json({ 
      checkoutUrl: paymentLinkRes.checkoutUrl,
      pledgeId: pledge.id 
    });

  } catch (error: any) {
    console.error("PayOS Create Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
