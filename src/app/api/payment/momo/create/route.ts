import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

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
    
    // 1. Tạo bản ghi Pledge (Trạng thái PENDING)
    const pledge = await prisma.pledge.create({
      data: {
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
        paymentProvider: "MOMO",
        transactionId: `MOMO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: "PENDING",
      }
    });

    // 2. Tạo orderId cho MoMo (format: MOMO-{pledgeId})
    const orderId = `MOMO-${pledge.id}`;
    
    // 3. Giả lập tích hợp MoMo (Tạo link redirect)
    // Trong môi trường DEMO, chúng ta chuyển về trang thành công với ref=pledgeId
    // Trong production, cần gọi MoMo API để tạo payment link thật
    const redirectUrl = `${process.env.NEXTAUTH_URL}/payment-success?status=success&ref=${pledge.id}`;
    
    return NextResponse.json({ 
        checkoutUrl: redirectUrl,
        pledgeId: pledge.id,
        orderId: orderId, // Để test webhook
    });

  } catch (error: any) {
    console.error("MoMo Create Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
