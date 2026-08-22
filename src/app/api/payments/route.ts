import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { getSePay } from "@/lib/payment/sepay";
import { createZaloPayOrder, createZaloPayTransactionId } from "@/lib/payment/zalopay";

type PublicPaymentMethod = "BANK" | "ZALOPAY";

function asPositiveInteger(value: unknown) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 50_000 ? number : null;
}

export async function POST(request: NextRequest) {
  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    const body = await request.json();
    const paymentMethod = body.paymentMethod as PublicPaymentMethod;
    const amount = asPositiveInteger(body.amount);

    if (!body.campaignId || !amount || !["BANK", "ZALOPAY"].includes(paymentMethod)) {
      return NextResponse.json({ error: "Thông tin ủng hộ hoặc phương thức thanh toán không hợp lệ" }, { status: 400 });
    }

    const tipPercent = Math.min(30, Math.max(0, Number(body.platformTipPercent || 0)));
    const tipAmount = Math.round((amount * tipPercent) / 100);
    const vatAmount = Math.round(tipAmount * 0.1);
    const totalAmount = amount + tipAmount + vatAmount;
    const pledgeId = crypto.randomUUID();
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const common = {
      id: pledgeId,
      userId: session?.user?.id || null,
      campaignId: body.campaignId,
      rewardId: body.rewardId || null,
      amount: new Decimal(amount),
      tipAmount: new Decimal(tipAmount),
      vatAmount: new Decimal(vatAmount),
      totalAmount: new Decimal(totalAmount),
      email: body.guestEmail || null,
      displayName: body.isAnonymous ? "Người dùng ẩn danh" : (body.displayName || session?.user?.name || "Khách"),
      shippingAddress: body.shippingAddress || null,
      isAnonymous: Boolean(body.isAnonymous),
      ipAddress,
      status: "PENDING" as const,
      updatedAt: new Date(),
    };

    if (paymentMethod === "BANK") {
      // SePay là implementation nội bộ; Backer chỉ nhìn thấy lựa chọn Ngân hàng.
      const transactionId = `BANK-${pledgeId}`;
      const pledge = await prisma.pledges.create({ data: { ...common, paymentProvider: "SEPAY", transactionId } });
      try {
        const sepay = getSePay();
        const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
        if (!baseUrl) throw new Error("Thiếu NEXTAUTH_URL hoặc NEXT_PUBLIC_APP_URL");
        const checkoutFields = sepay.createCheckoutFields({
          orderInvoiceNumber: transactionId,
          orderAmount: totalAmount,
          orderDescription: `Ủng hộ chiến dịch ${body.campaignId.slice(0, 8)}`,
          customerId: session?.user?.id || pledge.id,
          successUrl: `${baseUrl}/payment-success?status=pending&ref=${pledge.id}`,
          errorUrl: `${baseUrl}/payment-success?status=error&ref=${pledge.id}`,
          cancelUrl: `${baseUrl}/campaigns`,
          paymentMethod: "BANK_TRANSFER",
        });
        return NextResponse.json({ pledgeId: pledge.id, paymentMethod: "BANK", paymentProvider: "SEPAY", checkoutUrl: sepay.getCheckoutUrl(), checkoutFields });
      } catch (error) {
        await prisma.pledges.update({ where: { id: pledge.id }, data: { status: "FAILED", updatedAt: new Date() } });
        throw error;
      }
    }

    const transactionId = createZaloPayTransactionId(pledgeId);
    const pledge = await prisma.pledges.create({ data: { ...common, paymentProvider: "ZALOPAY", transactionId } });
    try {
      const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
      if (!baseUrl) throw new Error("Thiếu NEXTAUTH_URL hoặc NEXT_PUBLIC_APP_URL");
      const order = await createZaloPayOrder({
        appTransId: transactionId,
        amount: totalAmount,
        appUser: session?.user?.id || pledge.id,
        description: `Ủng hộ chiến dịch ${body.campaignId.slice(0, 8)}`,
        callbackUrl: `${baseUrl}/api/payment/zalopay/webhook`,
        redirectUrl: `${baseUrl}/payment-success?status=pending&ref=${pledge.id}`,
      });
      return NextResponse.json({ pledgeId: pledge.id, paymentMethod: "ZALOPAY", paymentProvider: "ZALOPAY", paymentUrl: order.order_url, orderToken: order.order_token, qrCode: order.qr_code });
    } catch (error) {
      await prisma.pledges.update({ where: { id: pledge.id }, data: { status: "FAILED", updatedAt: new Date() } });
      throw error;
    }
  } catch (error: any) {
    console.error("[PAYMENTS_API]", error);
    return NextResponse.json({ error: error.message || "Không thể tạo giao dịch thanh toán" }, { status: 500 });
  }
}
