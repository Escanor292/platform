import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { createPayOSPaymentLink } from "@/lib/payment/payos";

export async function POST(request: NextRequest) {
  console.log("[PAYMENTS_API] Request received");

  try {
    // Import auth dynamically để tránh lỗi
    const { auth } = await import("@/lib/auth");
    const session = await auth();

    console.log("[PAYMENTS_API] Session:", session?.user?.id || "guest");

    const body = await request.json();
    console.log("[PAYMENTS_API] Body:", JSON.stringify(body, null, 2));
    const {
      campaignId,
      rewardId,
      amount,
      platformTipPercent,
      isAnonymous,
      displayName,
      guestEmail,
      shippingAddress,
      paymentMethod,
    } = body;

    // 1. Validate đầu vào cơ bản
    if (!campaignId || !amount || amount < 50000 || !paymentMethod) {
      return NextResponse.json({ error: "Thiếu thông tin hoặc số tiền không hợp lệ" }, { status: 400 });
    }

    // 2. Thu thập metadata
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

    // 3. Tính toán số tiền
    const tipAmount = Math.round((amount * (platformTipPercent || 0)) / 100);
    const vatAmount = Math.round(tipAmount * 0.1);
    const totalAmount = amount + tipAmount + vatAmount;

    // 4. Tên hiển thị
    const finalDisplayName = isAnonymous ? "Người dùng ẩn danh" : (displayName || "Khách");

    // 5. Xử lý payment methods
    if (paymentMethod === "PAYOS") {
      // Tạo transaction ID
      const transactionId = `PAYOS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Tạo pledge
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
          displayName: finalDisplayName,
          shippingAddress: shippingAddress,
          isAnonymous,
          ipAddress,
          paymentProvider: "PAYOS",
          transactionId: transactionId,
          status: "PENDING",
        }
      });

      // Tạo orderCode
      const orderCode = Number(Date.now());

      console.log("[PAYOS CREATE] Creating payment link:", {
        orderCode,
        pledgeId: pledge.id,
        amount: totalAmount
      });

      // Gọi PayOS API
      let paymentLinkRes;
      try {
        paymentLinkRes = await createPayOSPaymentLink({
          orderCode,
          amount: Math.round(totalAmount),
          description: `Ủng hộ dự án ${campaignId.slice(0, 8)}`,
          cancelUrl: `${process.env.NEXTAUTH_URL}/campaigns`,
          returnUrl: `${process.env.NEXTAUTH_URL}/payment-success?status=success&ref=${pledge.id}`,
          metadata: {
            pledgeId: pledge.id,
            campaignId: campaignId,
          }
        });
      } catch (payosError: any) {
        console.error("[PAYOS CREATE] PayOS API Error:", payosError);
        throw new Error(`PayOS API failed: ${payosError.message}`);
      }

      // Cập nhật pledge với orderCode
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
        message: "PayOS payment link created",
        pledgeId: pledge.id,
        paymentUrl: paymentLinkRes.checkoutUrl,
        orderCode: orderCode,
      });
    } else if (paymentMethod === "VNPAY") {
      // TODO: Implement VNPay
      return NextResponse.json({ error: "VNPay chưa được triển khai" }, { status: 501 });
    } else if (paymentMethod === "SEPAY") {
      // Tạo transaction ID
      const transactionId = `SEPAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Tạo pledge
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
          displayName: finalDisplayName,
          shippingAddress: shippingAddress,
          isAnonymous,
          ipAddress,
          paymentProvider: "SEPAY",
          transactionId: transactionId,
          status: "PENDING",
        },
      });

      // Import SePay helper
      const { getSePay } = await import("@/lib/payment/sepay");
      const sepay = getSePay();

      // Tạo checkout fields
      const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
      const checkoutFields = sepay.createCheckoutFields({
        orderInvoiceNumber: `INV-${pledge.id.slice(0, 8)}-${Date.now()}`,
        orderAmount: totalAmount,
        orderDescription: `Ủng hộ chiến dịch ${campaignId.slice(0, 8)}`,
        customerId: session?.user?.id || pledge.id,
        successUrl: `${baseUrl}/payment-success?status=success&ref=${pledge.id}`,
        errorUrl: `${baseUrl}/payment-success?status=error&ref=${pledge.id}`,
        cancelUrl: `${baseUrl}/campaigns`,
        paymentMethod: "BANK_TRANSFER",
      });

      return NextResponse.json({
        message: "SePay checkout created",
        pledgeId: pledge.id,
        paymentMethod: "SEPAY",
        checkoutUrl: sepay.getCheckoutUrl(),
        checkoutFields,
      });
    } else if (paymentMethod === "MOMO") {
      // TODO: Implement MoMo
      return NextResponse.json({ error: "MoMo chưa được triển khai" }, { status: 501 });
    } else {
      return NextResponse.json({ error: "Phương thức thanh toán không hợp lệ" }, { status: 400 });
    }

  } catch (error: any) {
    console.error("[PAYMENTS_API] ERROR:", error);
    console.error("[PAYMENTS_API] Stack:", error.stack);
    console.error("[PAYMENTS_API] Message:", error.message);

    return NextResponse.json({
      error: error.message || "Lỗi hệ thống khi tạo giao dịch",
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
