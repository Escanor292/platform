import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      campaignId,
      rewardId,
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

    // 2. Thu thập metadata System & Compliance
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";
    
    // 3. Tính toán số tiền (VAT & Fee)
    const tipAmount = Math.round((amount * (platformTipPercent || 0)) / 100);
    const vatAmount = Math.round(tipAmount * 0.1); // Giả sử 10% VAT cho Tip
    const totalAmount = amount + tipAmount;

    // TODO: Tích hợp middleware auth để lấy userId thực tế nếu có
    // const session = await auth();
    // const userId = session?.user?.id || null;
    const userId = null;

    // 4. Sinh mã giao dịch duy nhất
    // Format: CF[Năm Tháng Ngày]-[Random 6 kí tự]
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
    const transactionId = `CF${dateStr}-${randomHex}`;

    // 5. Tính toán Tên hiển thị public
    const finalDisplayName = isAnonymous ? "Người dùng ẩn danh" : (displayName || "Khách");

    // 6. Lưu vào DB theo đúng nguyên tắc: Ẩn danh public ≠ Ẩn danh system
    const pledge = await prisma.pledge.create({
      data: {
        campaignId,
        userId: userId, // Bám vào tài khoản thật nếu có
        displayName: finalDisplayName,
        isAnonymous: isAnonymous || false,
        email: guestEmail || null, // Lưu mail nội bộ phục vụ refund
        amount,
        tipAmount,
        vatAmount,
        totalAmount,
        paymentProvider: paymentMethod,
        transactionId: transactionId,
        ipAddress: ipAddress,
        deviceInfo: { userAgent },
        status: "PENDING", // Chờ thanh toán trả webhook
      },
    });

    // 7. Sinh URL qua bên thứ 3 (Mock Stub cho MoMo / VNPay / PayOS)
    let paymentUrl = "";
    if (paymentMethod === "PAYOS") {
      // TODO: Call PayOS SDK
      paymentUrl = `https://pay.payos.vn/mock-checkout?tx=${transactionId}`;
    } else if (paymentMethod === "VNPAY") {
      // TODO: Call VNPay Logic
      paymentUrl = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?tx=${transactionId}`;
    } else if (paymentMethod === "MOMO") {
      paymentUrl = `https://test-payment.momo.vn/v2/gateway/pay?tx=${transactionId}`;
    } else if (paymentMethod === "BANK") {
      // Return direct pledgeId để hiển thị màn hình hướng dẫn
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
