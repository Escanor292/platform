import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_METHODS = ["ONLINE", "COD"] as const;
type CheckoutMethod = (typeof ALLOWED_METHODS)[number];

function safeReturnPath(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }
  return value.slice(0, 500);
}

export async function POST(request: NextRequest) {
  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    const body = await request.json();
    const {
      campaignId,
      rewardId,
      amount,
      platformTipPercent = 0,
      isAnonymous = false,
      displayName,
      guestEmail,
      shippingAddress,
      paymentMethod = "ONLINE",
      paymentMethodId,
      savePaymentMethod = false,
      returnPath,
    } = body;

    const amountNumber = Number(amount);
    const tipPercentNumber = Number(platformTipPercent);

    if (!campaignId || !Number.isFinite(amountNumber) || amountNumber < 50_000) {
      return NextResponse.json({ error: "Thông tin checkout hoặc số tiền không hợp lệ" }, { status: 400 });
    }

    if (!ALLOWED_METHODS.includes(paymentMethod as CheckoutMethod)) {
      return NextResponse.json({ error: "Phương thức thanh toán không hợp lệ" }, { status: 400 });
    }

    const campaign = await prisma.campaigns.findUnique({
      where: { id: String(campaignId), status: "ACTIVE" },
      select: { id: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Không tìm thấy chiến dịch" }, { status: 404 });
    }

    let reward: { id: string; campaignId: string | null; availability: "AVAILABLE" | "DEVELOPMENT"; stock: number | null } | null = null;
    if (rewardId) {
      reward = await prisma.rewards.findUnique({
        where: { id: String(rewardId), isActive: true },
        select: { id: true, campaignId: true, availability: true, stock: true },
      });
      if (!reward || reward.campaignId !== campaign.id) {
        return NextResponse.json({ error: "Phần quà không thuộc chiến dịch này" }, { status: 400 });
      }
      if (reward.stock !== null && reward.stock <= 0) {
        return NextResponse.json({ error: "Phần quà đã hết hàng" }, { status: 409 });
      }
      if (paymentMethod === "COD" && reward.availability !== "AVAILABLE") {
        return NextResponse.json({ error: "Thanh toán khi nhận hàng chỉ áp dụng cho sản phẩm có sẵn" }, { status: 400 });
      }
    }

    const tipPercent = Number.isFinite(tipPercentNumber)
      ? Math.min(Math.max(tipPercentNumber, 0), 1000)
      : 0;
    const returnPathValue = safeReturnPath(returnPath);
    const payload = {
      amount: amountNumber,
      platformTipPercent: tipPercent,
      isAnonymous: Boolean(isAnonymous),
      displayName: typeof displayName === "string" ? displayName.slice(0, 120) : null,
      guestEmail: typeof guestEmail === "string" ? guestEmail.slice(0, 254) : null,
      shippingAddress: typeof shippingAddress === "string" ? shippingAddress.slice(0, 1000) : null,
      paymentMethod,
      paymentMethodId: typeof paymentMethodId === "string" ? paymentMethodId.slice(0, 100) : null,
      savePaymentMethod: Boolean(savePaymentMethod),
    };

    const checkoutSession = await prisma.checkout_sessions.create({
      data: {
        userId: session?.user?.id || null,
        campaignId: campaign.id,
        rewardId: reward?.id || null,
        payload,
        returnPath: returnPathValue,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        updatedAt: new Date(),
      },
      select: { id: true, expiresAt: true, returnPath: true },
    });

    const callbackUrl = `${checkoutSession.returnPath}${checkoutSession.returnPath.includes("?") ? "&" : "?"}checkoutSessionId=${encodeURIComponent(checkoutSession.id)}`;
    const loginUrl = session?.user?.id
      ? null
      : `/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;

    return NextResponse.json({
      checkoutSessionId: checkoutSession.id,
      expiresAt: checkoutSession.expiresAt,
      returnPath: checkoutSession.returnPath,
      requiresLogin: !session?.user?.id,
      loginUrl,
      message: session?.user?.id
        ? "Checkout session đã được tạo"
        : "Vui lòng đăng nhập để tiếp tục checkout và liên kết phương thức thanh toán",
    });
  } catch (error) {
    console.error("[CHECKOUT_SESSION] ERROR:", error);
    return NextResponse.json({ error: "Không thể tạo phiên thanh toán" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Vui lòng đăng nhập để khôi phục checkout" }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Thiếu mã checkout session" }, { status: 400 });
    }

    const checkoutSession = await prisma.checkout_sessions.findUnique({ where: { id } });
    if (!checkoutSession || checkoutSession.expiresAt < new Date()) {
      return NextResponse.json({ error: "Phiên thanh toán đã hết hạn hoặc không tồn tại" }, { status: 404 });
    }

    if (checkoutSession.userId && checkoutSession.userId !== userId) {
      return NextResponse.json({ error: "Không có quyền truy cập phiên thanh toán này" }, { status: 403 });
    }

    const claimedSession = checkoutSession.userId
      ? checkoutSession
      : await prisma.checkout_sessions.update({
          where: { id: checkoutSession.id },
          data: { userId, updatedAt: new Date() },
        });

    return NextResponse.json({
      checkoutSessionId: claimedSession.id,
      payload: claimedSession.payload,
      campaignId: claimedSession.campaignId,
      rewardId: claimedSession.rewardId,
      returnPath: claimedSession.returnPath,
      expiresAt: claimedSession.expiresAt,
    });
  } catch (error) {
    console.error("[CHECKOUT_SESSION_GET] ERROR:", error);
    return NextResponse.json({ error: "Không thể khôi phục phiên thanh toán" }, { status: 500 });
  }
}
