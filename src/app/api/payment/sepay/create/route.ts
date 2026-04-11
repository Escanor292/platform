import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sepay } from "@/lib/payment/sepay";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const user = session?.user;
    const body = await request.json();
    
    const { 
      amount, 
      campaignId, 
      tipAmount = 0, 
      vatAmount = 0,
      guestEmail = null, 
      displayName = null, 
      isAnonymous = false, 
      ipAddress = null
    } = body;

    // Validate required fields
    if (!amount || !campaignId) {
      return NextResponse.json(
        { error: "Missing required fields: amount, campaignId" },
        { status: 400 }
      );
    }

    // Validate SePay configuration
    if (!process.env.SEPAY_ACCOUNT_NUMBER || !process.env.SEPAY_BANK_CODE) {
      return NextResponse.json(
        { error: "SePay is not configured. Please contact administrator." },
        { status: 500 }
      );
    }

    const totalAmount = amount + tipAmount + vatAmount;
    const transactionId = `SEPAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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
        displayName: isAnonymous 
          ? "Người dùng ẩn danh" 
          : (displayName || user?.name || "Người ủng hộ"),
        isAnonymous,
        ipAddress,
        paymentProvider: "SEPAY",
        transactionId: transactionId,
        status: "PENDING",
      }
    });

    // 2. Tạo QR Code thanh toán
    const paymentQR = sepay.createPaymentQR({
      amount: totalAmount,
      content: `Pledge ${pledge.id.slice(0, 8)}`,
      orderId: pledge.id,
    });

    // 3. Trả về thông tin QR code
    return NextResponse.json({ 
      success: true,
      pledgeId: pledge.id,
      paymentMethod: "SEPAY",
      qrCode: paymentQR.qrDataURL,
      qrContent: paymentQR.qrContent,
      bankInfo: {
        accountNumber: paymentQR.accountNumber,
        accountName: paymentQR.accountName,
        bankCode: paymentQR.bankCode,
        amount: paymentQR.amount,
        content: paymentQR.content,
      },
      // URL để check trạng thái thanh toán
      statusCheckUrl: `/api/payment/sepay/status/${pledge.id}`,
      // URL redirect sau khi hoàn tất
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?status=pending&ref=${pledge.id}&method=sepay`,
    });

  } catch (error: any) {
    console.error("SePay Create Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create SePay payment" }, 
      { status: 500 }
    );
  }
}
