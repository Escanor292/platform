import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const user = await getUser();
    const data = await request.json();
    const { 
      amount, campaignId, rewardId, 
      tipAmount = 0, vatAmount = 0,
      guestEmail = null, displayName = null, 
      isAnonymous = false, ipAddress = null
    } = data;

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
        method: "MOMO",
      }
    });

    // 3. Giả lập tích hợp MoMo (Tạo link redirect)
    // Thực tế sẽ dùng MoMo SDK gửi request tới Partner API
    const requestId = payment.id;
    const orderId = payment.id;
    const redirectUrl = `${process.env.NEXTAUTH_URL}/payment-success?code=${payment.id}`;
    
    // TRONG DEMO: Giả lập chuyển hướng tới trang thành công
    return NextResponse.json({ 
        checkoutUrl: redirectUrl,
        paymentId: payment.id 
    });

  } catch (error: any) {
    console.error("MoMo Create Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
