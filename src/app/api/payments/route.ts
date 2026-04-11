import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      campaignId,
      amount,
      platformTipPercent,
      isAnonymous,
      displayName,
      guestEmail,
      paymentMethod,
    } = body;

    // 1. Validate đầu vào cơ bản
    if (!campaignId || !amount || amount < 50000 || !paymentMethod) {
      return NextResponse.json({ error: "Thiếu thông tin hoặc số tiền không hợp lệ" }, { status: 400 });
    }

    // 2. Thu thập metadata
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";
    
    // 3. Tính toán số tiền
    const tipAmount = Math.round((amount * (platformTipPercent || 0)) / 100);
    const vatAmount = Math.round(tipAmount * 0.1); 
    const totalAmount = amount + tipAmount + vatAmount;

    const userId = null; // Mock cho đến khi ổn định Auth

    // 4. Sinh mã giao dịch duy nhất
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
    const transactionId = `CF${dateStr}-${randomHex}`;

    // 5. Tính toán Tên hiển thị public
    const finalDisplayName = isAnonymous ? "Người dùng ẩn danh" : (displayName || "Khách");

    // 6. Lưu vào DB (Pledge model)
    const pledge = await prisma.pledge.create({
      data: {
        campaignId,
        userId: userId,
        displayName: finalDisplayName,
        isAnonymous: isAnonymous || false,
        email: guestEmail || null,
        amount: amount,
        tipAmount: tipAmount,
        vatAmount: vatAmount,
        totalAmount: totalAmount,
        paymentProvider: paymentMethod,
        transactionId: transactionId,
        ipAddress: ipAddress,
        deviceInfo: { userAgent },
        status: "PENDING",
      },
    });

    // 7. Sinh URL qua bên thứ 3 (Mock cho demo)
    let paymentUrl = "";
    if (paymentMethod === "PAYOS") {
      paymentUrl = `${process.env.NEXTAUTH_URL}/api/payment/payos/create?pledgeId=${pledge.id}`;
    } else if (paymentMethod === "VNPAY") {
      paymentUrl = `${process.env.NEXTAUTH_URL}/api/payment/vnpay/create?pledgeId=${pledge.id}`;
    } else if (paymentMethod === "SEPAY") {
      // SePay sẽ trả về QR code thay vì redirect URL
      const sepayResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/payment/sepay/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          campaignId,
          tipAmount,
          vatAmount,
          guestEmail,
          displayName: finalDisplayName,
          isAnonymous,
          ipAddress,
        }),
      });
      
      const sepayData = await sepayResponse.json();
      if (!sepayResponse.ok) {
        throw new Error(sepayData.error || "SePay payment failed");
      }
      
      return NextResponse.json({
        message: "SePay QR generated",
        pledgeId: sepayData.pledgeId,
        paymentMethod: "SEPAY",
        qrCode: sepayData.qrCode,
        bankInfo: sepayData.bankInfo,
        returnUrl: sepayData.returnUrl,
      });
    } else if (paymentMethod === "BANK") {
      return NextResponse.json({
        message: "Pledge created",
        pledgeId: pledge.id,
        transactionId: pledge.transactionId,
      });
    }

    return NextResponse.json({
      message: "Processing payment",
      pledgeId: pledge.id,
      transactionId: pledge.transactionId,
      paymentUrl: paymentUrl,
    });

  } catch (error: any) {
    console.error("[PAYMENTS_API]", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tạo giao dịch" }, { status: 500 });
  }
}
