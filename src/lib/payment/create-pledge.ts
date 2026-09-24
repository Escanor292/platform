import { NextRequest, NextResponse } from "next/server";
import { resolveCheckoutTarget } from "@/lib/payment/resolve-checkout";
import { computePledgeCharge, isValidInternalEmail, MIN_DONATION_AMOUNT } from "@/lib/payment/pledge-charge";
import { validateRewardCheckout } from "@/lib/payment/validate-reward-checkout";
import { createCodPledge } from "@/lib/payment/create-cod-pledge";
import { createEscrowPledge } from "@/lib/payment/create-escrow-pledge";

function getBaseUrl(request: NextRequest) {
  return process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
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

    if ((!campaignId && !rewardId) || !Number.isFinite(amount) || amount < MIN_DONATION_AMOUNT || !Number.isInteger(amount)) {
      return NextResponse.json({ error: "Thieu thong tin hoac so tien khong hop le" }, { status: 400 });
    }
    if (paymentMethod !== "ONLINE" && paymentMethod !== "COD") {
      return NextResponse.json({ error: "Phuong thuc thanh toan khong hop le" }, { status: 400 });
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return NextResponse.json({ error: "So luong san pham khong hop le" }, { status: 400 });
    }

    const target = await resolveCheckoutTarget({ campaignId, rewardId });
    if (!target.ok) return NextResponse.json({ error: target.error }, { status: target.status });

    const { reward, bucket } = target;
    const pledgeCampaignId = target.pledgeCampaignId;

    if (reward && !session?.user?.id) {
      return NextResponse.json({
        error: "Dat qua can dang nhap de nhap dia chi hoac nhan Kho do",
        code: "REWARD_LOGIN_REQUIRED",
      }, { status: 401 });
    }

    if (reward) {
      const check = validateRewardCheckout({
        reward,
        amount,
        quantity,
        shippingMethod,
        paymentMethod,
        shippingAddress,
        sessionShippingAddress: (session?.user as { shippingAddress?: string } | undefined)?.shippingAddress,
      });
      if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const authenticatedEmail = session?.user?.email?.trim() || "";
    const finalEmail = (authenticatedEmail || guestEmail).trim().toLowerCase();
    if (!isValidInternalEmail(finalEmail)) {
      return NextResponse.json({
        error: reward ? "Vui long cung cap email hop le de nhan xac nhan don hang" : "Vui long nhap email de nhan chung nhan ung ho",
      }, { status: 400 });
    }

    if (paymentMethodId) {
      return NextResponse.json({
        error: "Nen tang khong lien ket vi/the. Hay chuyen khoan vao tai khoan ngan hang trung gian.",
        code: "ESCROW_BANK_ONLY",
      }, { status: 400 });
    }

    const charge = computePledgeCharge({
      amount,
      quantity,
      paymentMethod,
      platformTipPercent,
      reward,
      shippingMethod,
      feeRate: target.feeRate,
    });
    const finalDisplayName = isAnonymous ? "Nguoi dung an danh" : (displayName || session?.user?.name || "Khach hang");
    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown";
    const finalShippingAddress = reward?.fulfillmentType === "PHYSICAL"
      ? (shippingAddress || ((session?.user as { shippingAddress?: string } | undefined)?.shippingAddress ?? null))
      : null;
    const now = new Date();
    const userId = session?.user?.id || null;

    if (paymentMethod === "COD" && !charge.isPreorder) {
      if (!reward) {
        return NextResponse.json({ error: "COD chi ap dung cho san pham vat ly co san" }, { status: 400 });
      }
      try {
        const pledge = await createCodPledge({
          userId,
          pledgeCampaignId,
          reward,
          quantity,
          charge,
          email: finalEmail,
          displayName: finalDisplayName,
          shippingAddress: finalShippingAddress,
          shippingMethod,
          isAnonymous,
          ipAddress,
          now,
        });
        return NextResponse.json({
          message: bucket === "PRODUCT"
            ? "Da ghi nhan don COD. Tien tinh vao ban san pham, khong tinh vao so gay quy chien dich."
            : "Da ghi nhan don hang tra tien khi nhan hang",
          bucket,
          pledgeId: pledge.id,
          transactionId: pledge.transactionId,
          status: "PENDING",
          paymentProvider: "COD",
          confirmationUrl: `/payment-success?status=cod&ref=${encodeURIComponent(pledge.transactionId)}`,
          isPreorder: false,
          chargeAmount: charge.baseAmount + charge.shippingFee,
          remainingAmount: 0,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Khong the tao don COD";
        return NextResponse.json({ error: message }, { status: message.includes("het ton kho") ? 409 : 400 });
      }
    }

    const { pledge, transferContent, escrow } = await createEscrowPledge({
      userId,
      pledgeCampaignId,
      reward,
      quantity,
      charge,
      email: finalEmail || null,
      displayName: finalDisplayName,
      shippingAddress: finalShippingAddress,
      shippingMethod,
      isAnonymous,
      isCod: paymentMethod === "COD",
      ipAddress,
      now,
    });

    return NextResponse.json({
      message: bucket === "CAMPAIGN"
        ? "Chuyen khoan vao tai khoan ngan hang trung gian. San giu den ngay dong chien dich roi moi chi ho hoac hoan."
        : "Chuyen khoan vao tai khoan ngan hang trung gian. Don hang tinh vao ban san pham, khong tinh vao so gay quy chien dich.",
      bucket,
      pledgeId: pledge.id,
      paymentUrl: `${getBaseUrl(request)}/thanh-toan/chuyen-khoan?pledge=${encodeURIComponent(pledge.id)}`,
      paymentProvider: "BANK_ESCROW",
      transfer: {
        bankName: escrow.bankName,
        accountNumber: escrow.accountNumber,
        accountHolder: escrow.accountHolder,
        content: transferContent,
        amount: charge.chargeAmount,
      },
      isPreorder: charge.isPreorder,
      chargeAmount: charge.chargeAmount,
      depositAmount: charge.depositAmount,
      remainingAmount: charge.remainingAmount,
    });
  } catch (error) {
    console.error("[PAYMENTS_API] Request failed", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "Loi he thong khi tao giao dich" }, { status: 500 });
  }
}
