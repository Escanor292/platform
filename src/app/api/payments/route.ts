import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { calculateDepositAmount, normalizeDepositPercent } from "@/lib/preorder-deposit";
import { buildTransferContent, getEscrowBankAccount } from "@/lib/payment/escrow-account";
import { calculatePlatformFee, DEFAULT_PLATFORM_FEE_RATE } from "@/lib/funding-model";

const MIN_DONATION_AMOUNT = 50_000;
const MAX_TIP_PERCENT = 20;

function getBaseUrl(request: NextRequest) {
  return process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
}

function isValidInternalEmail(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= 254 && /^\S+@\S+\.\S+$/.test(value.trim());
}

export async function POST(request: NextRequest) {
  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    const body = await request.json();

    const campaignId = typeof body.campaignId === "string" ? body.campaignId.trim() : "";
    const rewardId = typeof body.rewardId === "string" && body.rewardId.trim() ? body.rewardId.trim() : null;
    const amount = typeof body.amount === "number" ? body.amount : Number(body.amount);
    const platformTipPercent = typeof body.platformTipPercent === "number"
      ? body.platformTipPercent
      : Number(body.platformTipPercent || 0);
    const paymentMethod = body.paymentMethod;
    const paymentMethodId = typeof body.paymentMethodId === "string" && body.paymentMethodId.trim()
      ? body.paymentMethodId.trim()
      : null;
    const quantity = Number.isInteger(body.quantity) ? body.quantity : 1;
    const isAnonymous = body.isAnonymous === true;
    const displayName = typeof body.displayName === "string" ? body.displayName.trim().slice(0, 120) : "";
    const guestEmail = typeof body.guestEmail === "string" ? body.guestEmail.trim().slice(0, 254) : "";
    const shippingAddress = typeof body.shippingAddress === "string" ? body.shippingAddress.trim().slice(0, 1000) : "";
    const shippingMethod = typeof body.shippingMethod === "string" ? body.shippingMethod.trim().toUpperCase() : "STANDARD";
    const savePaymentMethod = body.savePaymentMethod === true;

    if ((!campaignId && !rewardId) || !Number.isFinite(amount) || amount < MIN_DONATION_AMOUNT || !Number.isInteger(amount)) {
      return NextResponse.json({ error: "Thiếu thông tin hoặc số tiền không hợp lệ" }, { status: 400 });
    }

    if (paymentMethod !== "ONLINE" && paymentMethod !== "COD") {
      return NextResponse.json({ error: "Phương thức thanh toán không hợp lệ" }, { status: 400 });
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return NextResponse.json({ error: "Số lượng sản phẩm không hợp lệ" }, { status: 400 });
    }

    const campaign = campaignId
      ? await prisma.campaigns.findFirst({
          where: { id: campaignId, status: "ACTIVE" },
          select: { id: true, title: true, feeRate: true },
        })
      : null;

    if (campaignId && !campaign) {
      return NextResponse.json({ error: "Chiến dịch không tồn tại hoặc chưa mở nhận ủng hộ" }, { status: 404 });
    }

    const reward = rewardId
      ? await prisma.rewards.findFirst({
          where: { id: rewardId, isActive: true, ...(campaignId ? { campaignId } : {}) },
          select: {
            id: true,
            campaignId: true,
            title: true,
            minAmount: true,
            maxAmount: true,
            maxQuantity: true,
            stock: true,
            availability: true,
            isPreorder: true,
            onlineDepositPercent: true,
            codDepositPercent: true,
            fulfillmentType: true,
          },
        })
      : null;

    if (rewardId && !reward) {
      return NextResponse.json({ error: "Phần quà không tồn tại, đã tắt hoặc không thuộc chiến dịch này" }, { status: 404 });
    }

    if (reward) {
      const minimumRewardAmount = Math.max(MIN_DONATION_AMOUNT, Number(reward.minAmount));
      if (amount < minimumRewardAmount) {
        return NextResponse.json({ error: `Số tiền tối thiểu cho phần quà này là ${minimumRewardAmount.toLocaleString("vi-VN")}đ` }, { status: 400 });
      }
      if (reward.maxAmount && amount > Number(reward.maxAmount)) {
        return NextResponse.json({ error: "Số tiền vượt quá mức tối đa của phần quà" }, { status: 400 });
      }
      if (reward.maxQuantity && quantity > reward.maxQuantity) {
        return NextResponse.json({ error: "Số lượng vượt quá giới hạn của phần quà" }, { status: 400 });
      }
      if (!["STANDARD", "EXPRESS", "EMAIL", "DOWNLOAD"].includes(shippingMethod)) {
        return NextResponse.json({ error: "Phương thức giao hàng không hợp lệ" }, { status: 400 });
      }
      if (reward.fulfillmentType === "PHYSICAL" && !["STANDARD", "EXPRESS"].includes(shippingMethod)) {
        return NextResponse.json({ error: "Sản phẩm vật lý cần chọn phương thức vận chuyển" }, { status: 400 });
      }
      if (reward.fulfillmentType !== "PHYSICAL" && !["EMAIL", "DOWNLOAD"].includes(shippingMethod)) {
        return NextResponse.json({ error: "Tài sản số cần chọn phương thức nhận qua email hoặc kho đã mua" }, { status: 400 });
      }
      if (paymentMethod === "COD" && reward.fulfillmentType !== "PHYSICAL") {
        return NextResponse.json({ error: "COD chỉ áp dụng cho sản phẩm vật lý" }, { status: 400 });
      }
      if (paymentMethod === "COD" && !reward.isPreorder && reward.availability !== "AVAILABLE") {
        return NextResponse.json({ error: "COD thường chỉ áp dụng cho sản phẩm vật lý có sẵn" }, { status: 400 });
      }
      if (reward.stock !== null && reward.stock < quantity) {
        return NextResponse.json({ error: "Sản phẩm không đủ tồn kho" }, { status: 409 });
      }
      if (reward.fulfillmentType === "PHYSICAL" && !shippingAddress && !((session?.user as { shippingAddress?: string } | undefined)?.shippingAddress)) {
        return NextResponse.json({ error: "Vui lòng nhập địa chỉ nhận hàng" }, { status: 400 });
      }
    }

    const authenticatedEmail = session?.user?.email?.trim() || "";
    const finalEmail = (authenticatedEmail || guestEmail).trim().toLowerCase();
    if (!isValidInternalEmail(finalEmail)) {
      return NextResponse.json({
        error: reward
          ? "Vui lòng cung cấp email hợp lệ để nhận xác nhận đơn hàng"
          : "Vui lòng nhập email để nhận chứng nhận ủng hộ",
      }, { status: 400 });
    }

    if (paymentMethodId) {
      return NextResponse.json({
        error: "Nền tảng không liên kết ví/thẻ. Hãy chuyển khoản vào tài khoản ngân hàng trung gian.",
        code: "ESCROW_BANK_ONLY",
      }, { status: 400 });
    }

    const isPreorder = Boolean(reward?.isPreorder);
    const isReadyProduct = reward?.availability === "AVAILABLE" && !isPreorder;
    const baseAmount = reward ? amount * quantity : amount;
    const depositPercent = isPreorder
      ? (paymentMethod === "COD"
        ? normalizeDepositPercent(reward?.codDepositPercent, 50)
        : normalizeDepositPercent(reward?.onlineDepositPercent, 30))
      : 0;
    const tipPercent = !isReadyProduct && paymentMethod === "ONLINE"
      ? Math.min(Math.max(Number.isFinite(platformTipPercent) ? platformTipPercent : 0, 0), MAX_TIP_PERCENT)
      : 0;
    const tipAmount = Math.round((baseAmount * tipPercent) / 100);
    const vatAmount = Math.round(tipAmount * 0.1);
    const shippingFee = reward?.fulfillmentType === "PHYSICAL" && shippingMethod === "EXPRESS" ? 30000 : 0;
    const totalAmount = baseAmount + tipAmount + vatAmount + shippingFee;
    const depositAmount = isPreorder ? calculateDepositAmount(baseAmount, depositPercent) : 0;
    const chargeAmount = isPreorder && paymentMethod === "COD" ? depositAmount : totalAmount;
    const remainingAmount = Math.max(0, totalAmount - chargeAmount);
    const finalDisplayName = isAnonymous ? "Người dùng ẩn danh" : (displayName || session?.user?.name || "Khách hàng");
    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown";
    const finalShippingAddress = reward?.fulfillmentType === "PHYSICAL"
      ? (shippingAddress || ((session?.user as { shippingAddress?: string } | undefined)?.shippingAddress ?? null))
      : null;
    const now = new Date();
    const feeRate = Number(campaign?.feeRate ?? DEFAULT_PLATFORM_FEE_RATE);
    const platformFee = calculatePlatformFee(baseAmount, feeRate);

    if (paymentMethod === "COD" && !isPreorder) {
      const transactionId = `COD-${crypto.randomUUID()}`;
      try {
        const pledge = await prisma.$transaction(async (tx) => {
          if (!reward) {
            throw new Error("COD chỉ áp dụng cho sản phẩm vật lý có sẵn, không áp dụng cho hàng đặt trước");
          }
          if (reward.stock !== null) {
            const stockUpdate = await tx.rewards.updateMany({
              where: { id: reward.id, isActive: true, stock: { gte: quantity } },
              data: { stock: { decrement: quantity }, updatedAt: now },
            });
            if (stockUpdate.count !== 1) {
              throw new Error("Sản phẩm vừa hết tồn kho, vui lòng thử lại");
            }
          }
          return tx.pledges.create({
            data: {
              id: crypto.randomUUID(),
              userId: session?.user?.id || null,
              campaignId: campaignId || reward.campaignId || null,
              rewardId: reward.id,
              amount: new Decimal(baseAmount),
              tipAmount: new Decimal(0),
              vatAmount: new Decimal(0),
              platformFee: new Decimal(platformFee),
              totalAmount: new Decimal(baseAmount + shippingFee),
              depositAmount: new Decimal(0),
              chargeAmount: new Decimal(baseAmount + shippingFee),
              orderTotalAmount: new Decimal(baseAmount + shippingFee),
              remainingAmount: new Decimal(0),
              paidAmount: new Decimal(0),
              accountingAmount: new Decimal(0),
              email: finalEmail,
              displayName: finalDisplayName,
              shippingAddress: finalShippingAddress,
              shippingMethod,
              shippingFee: new Decimal(shippingFee),
              isAnonymous,
              quantity,
              isCashOnDelivery: true,
              stockReserved: reward.stock !== null,
              fulfillmentType: reward.fulfillmentType,
              fulfillmentStatus: "PROCESSING",
              ipAddress,
              paymentProvider: "COD",
              transactionId,
              status: "PENDING",
              updatedAt: now,
            },
          });
        });

        const confirmationUrl = `/payment-success?status=cod&ref=${encodeURIComponent(pledge.transactionId)}`;
        return NextResponse.json({
          message: "Đã ghi nhận đơn hàng trả tiền khi nhận hàng",
          pledgeId: pledge.id,
          transactionId: pledge.transactionId,
          status: "PENDING",
          paymentProvider: "COD",
          confirmationUrl,
          isPreorder: false,
          chargeAmount: baseAmount + shippingFee,
          remainingAmount: 0,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Không thể tạo đơn COD";
        const status = message.includes("hết tồn kho") ? 409 : 400;
        return NextResponse.json({ error: message }, { status });
      }
    }

    const pledge = await prisma.$transaction(async (tx) => {
      let stockReserved = false;
      if (reward && reward.stock !== null) {
        const stockUpdate = await tx.rewards.updateMany({
          where: { id: reward.id, isActive: true, stock: { gte: quantity } },
          data: { stock: { decrement: quantity }, updatedAt: now },
        });
        if (stockUpdate.count !== 1) {
          throw new Error("Sản phẩm vừa hết tồn kho, vui lòng thử lại");
        }
        stockReserved = true;
      }

      return tx.pledges.create({
        data: {
          id: crypto.randomUUID(),
          userId: session?.user?.id || null,
          campaignId: campaignId || reward?.campaignId || null,
          rewardId: reward?.id || null,
          amount: new Decimal(baseAmount),
          tipAmount: new Decimal(tipAmount),
          vatAmount: new Decimal(vatAmount),
          platformFee: new Decimal(platformFee),
          totalAmount: new Decimal(totalAmount),
          depositAmount: new Decimal(depositAmount),
          chargeAmount: new Decimal(chargeAmount),
          orderTotalAmount: new Decimal(totalAmount),
          remainingAmount: new Decimal(remainingAmount),
          paidAmount: new Decimal(0),
          accountingAmount: new Decimal(0),
          email: finalEmail || null,
          displayName: finalDisplayName,
          shippingAddress: finalShippingAddress,
          shippingMethod,
          shippingFee: new Decimal(shippingFee),
          isAnonymous,
          quantity,
          isCashOnDelivery: paymentMethod === "COD",
          stockReserved,
          fulfillmentType: reward?.fulfillmentType ?? null,
          fulfillmentStatus: reward ? "AWAITING_PAYMENT" : "NOT_APPLICABLE",
          ipAddress,
          paymentProvider: paymentMethod === "COD" ? "BANK_ESCROW_DEPOSIT" : "BANK_ESCROW",
          transactionId: `ESCROW-${crypto.randomUUID()}`,
          status: "PENDING",
          updatedAt: now,
        },
      });
    });

    const transferContent = buildTransferContent(pledge.id);
    const escrow = getEscrowBankAccount();
    const baseUrl = getBaseUrl(request);
    const paymentUrl = `${baseUrl}/thanh-toan/chuyen-khoan?pledge=${encodeURIComponent(pledge.id)}`;

    await prisma.pledges.update({
      where: { id: pledge.id },
      data: { payosOrderCode: transferContent.replace(/\s/g, ""), updatedAt: new Date() },
    });

    return NextResponse.json({
      message: "Chuyển khoản vào tài khoản ngân hàng trung gian. Tiền được giữ đến khi chiến dịch kết thúc.",
      pledgeId: pledge.id,
      paymentUrl,
      paymentProvider: "BANK_ESCROW",
      transfer: {
        bankName: escrow.bankName,
        accountNumber: escrow.accountNumber,
        accountHolder: escrow.accountHolder,
        content: transferContent,
        amount: chargeAmount,
      },
      isPreorder,
      chargeAmount,
      depositAmount,
      remainingAmount,
    });
  } catch (error) {
    console.error("[PAYMENTS_API] Request failed", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "Lỗi hệ thống khi tạo giao dịch" }, { status: 500 });
  }
}
