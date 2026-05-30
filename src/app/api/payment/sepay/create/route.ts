import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getSePay } from "@/lib/payment/sepay";

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
      ipAddress = null,
    } = body;

    const totalAmount = amount + tipAmount + vatAmount;
    const transactionId = `SEPAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 1. Tạo bản ghi Pledge (Trạng thái PENDING)
    const pledge = await prisma.pledges.create({
      data: {
        id: crypto.randomUUID(),
        userId: user?.id || null,
        campaignId,
        amount,
        tipAmount,
        vatAmount,
        totalAmount,
        email: guestEmail,
        displayName: isAnonymous
          ? "Người dùng ẩn danh"
          : displayName || user?.name || "Người ủng hộ",
        isAnonymous,
        ipAddress,
        paymentProvider: "SEPAY",
        transactionId: transactionId,
        status: "PENDING",
        updatedAt: new Date(),
      },
    });

    // 2. Khởi tạo SePay client
    const sepay = getSePay();

    // 3. Tạo checkout fields với callback URLs
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
    const checkoutFields = sepay.createCheckoutFields({
      orderInvoiceNumber: `INV-${pledge.id.slice(0, 8)}-${Date.now()}`,
      orderAmount: totalAmount,
      orderDescription: `Ủng hộ chiến dịch ${campaignId.slice(0, 8)}`,
      customerId: user?.id || pledge.id,
      successUrl: `${baseUrl}/payment-success?status=success&ref=${pledge.id}`,
      errorUrl: `${baseUrl}/payment-success?status=error&ref=${pledge.id}`,
      cancelUrl: `${baseUrl}/campaigns`,
      paymentMethod: "BANK_TRANSFER", // Mặc định dùng QR chuyển khoản
    });

    // 4. Trả về checkout URL và fields
    return NextResponse.json({
      checkoutUrl: sepay.getCheckoutUrl(),
      checkoutFields,
      pledgeId: pledge.id,
      transactionId: transactionId,
    });
  } catch (error: any) {
    console.error("[SEPAY CREATE ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to create SePay payment" },
      { status: 500 }
    );
  }
}
