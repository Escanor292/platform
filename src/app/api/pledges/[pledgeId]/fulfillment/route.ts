import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recalculateCampaignAmount } from "@/lib/order-fulfillment";
import { calculateCancellationSettlement } from "@/lib/preorder-deposit";
import { Decimal } from "@prisma/client/runtime/library";

const FULFILLMENT_STATUSES = [
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "DELIVERY_FAILED",
  "CANCELED",
  "RETURN_REQUESTED",
  "RETURNED",
] as const;
type FulfillmentStatus = (typeof FULFILLMENT_STATUSES)[number];

interface Context {
  params: Promise<{ pledgeId: string }>;
}

function isAdmin(session: { user?: unknown } | null) {
  const user = session?.user as { role?: string; isAdmin?: boolean } | undefined;
  return user?.role === "ADMIN" || user?.isAdmin === true;
}

function reasonFor(status: FulfillmentStatus, body: Record<string, unknown>) {
  const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 500) : "";
  if (reason) return reason;
  if (status === "DELIVERY_FAILED") return "Giao hàng không thành công";
  if (status === "CANCELED") return "Hủy đơn hàng";
  if (status === "RETURNED") return "Trả hàng";
  return null;
}

export async function PATCH(request: NextRequest, { params }: Context) {
  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    const actorId = session?.user?.id;
    if (!actorId) return NextResponse.json({ error: "Bạn cần đăng nhập" }, { status: 401 });

    const { pledgeId } = await params;
    const body = await request.json() as Record<string, unknown>;
    const nextStatus = typeof body.fulfillmentStatus === "string" ? body.fulfillmentStatus as FulfillmentStatus : null;
    if (!nextStatus || !FULFILLMENT_STATUSES.includes(nextStatus)) {
      return NextResponse.json({ error: "Trạng thái fulfillment không hợp lệ" }, { status: 400 });
    }

    const pledge = await prisma.pledges.findUnique({
      where: { id: pledgeId },
      select: {
        id: true,
        userId: true,
        campaignId: true,
        status: true,
        isCashOnDelivery: true,
        quantity: true,
        stockReserved: true,
        rewardId: true,
        fulfillmentStatus: true,
        receivedAt: true,
        accountingReversedAt: true,
        amount: true,
        paidAmount: true,
        orderTotalAmount: true,
        accountingAmount: true,
        depositAmount: true,
        campaigns: { select: { creatorId: true, status: true } },
        rewards: { select: { onlineDepositPercent: true, codDepositPercent: true, projects: { select: { creatorId: true } }, campaigns: { select: { creatorId: true } } } },
      },
    });
    if (!pledge) return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });

    const admin = isAdmin(session);
    const creator = pledge.campaigns?.creatorId === actorId
      || pledge.rewards?.projects?.creatorId === actorId
      || pledge.rewards?.campaigns?.creatorId === actorId;
    const buyer = pledge.userId === actorId;
    if (!admin && !creator && !buyer) return NextResponse.json({ error: "Bạn không có quyền cập nhật đơn hàng này" }, { status: 403 });

    const buyerAllowed = buyer && !admin && !creator && (nextStatus === "CANCELED" || nextStatus === "RETURN_REQUESTED");
    if (!admin && !creator && !buyerAllowed) return NextResponse.json({ error: "Người mua chỉ được hủy đơn hoặc yêu cầu trả hàng" }, { status: 403 });
    if (nextStatus === "RETURNED" && pledge.fulfillmentStatus !== "RETURN_REQUESTED" && !admin && !creator) {
      return NextResponse.json({ error: "Đơn hàng cần có yêu cầu trả hàng trước" }, { status: 400 });
    }

    const reason = reasonFor(nextStatus, body);
    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.pledges.findUnique({
        where: { id: pledgeId },
        select: {
          id: true,
          campaignId: true,
          rewardId: true,
          quantity: true,
          status: true,
          isCashOnDelivery: true,
          stockReserved: true,
          fulfillmentStatus: true,
          accountingReversedAt: true,
          amount: true,
          paidAmount: true,
          orderTotalAmount: true,
          accountingAmount: true,
          depositAmount: true,
          rewards: { select: { onlineDepositPercent: true, codDepositPercent: true } },
        },
      });
      if (!current) throw new Error("NOT_FOUND");

      const reversing = ["DELIVERY_FAILED", "CANCELED", "RETURNED"].includes(nextStatus);
      const alreadyReversed = Boolean(current.accountingReversedAt);
      const shouldReverseAccounting = reversing && Number(current.accountingAmount) > 0 && !alreadyReversed;
      const shouldReleaseStock = Boolean(current.stockReserved && current.rewardId && reversing);
      const isBuyerCancellation = nextStatus === "CANCELED" && buyer;
      const configuredForfeiturePercent = current.isCashOnDelivery
        ? (current.rewards?.codDepositPercent ?? 50)
        : (current.rewards?.onlineDepositPercent ?? 30);
      const cancellationSettlement = isBuyerCancellation
        ? calculateCancellationSettlement(Number(current.paidAmount), Number(current.amount), configuredForfeiturePercent)
        : { cancellationFeeAmount: 0, refundAmount: reversing ? Number(current.paidAmount) : 0 };
      const deliveredPaidAmount = nextStatus === "DELIVERED" && current.isCashOnDelivery
        ? Number(current.orderTotalAmount || current.amount)
        : Number(current.paidAmount);

      const pledgeStatus = reversing
        ? (Number(current.paidAmount) > 0 ? "REFUNDED" : "FAILED")
        : (nextStatus === "DELIVERED" ? "SUCCESS" : current.status);
      const refundStatus = cancellationSettlement.refundAmount > 0 ? "REQUESTED" : undefined;
      const nextAccountingAmount = nextStatus === "DELIVERED"
        ? Number(current.amount)
        : (isBuyerCancellation ? cancellationSettlement.cancellationFeeAmount : (reversing ? 0 : Number(current.accountingAmount)));

      const claimed = await tx.pledges.updateMany({
        where: {
          id: pledgeId,
          fulfillmentStatus: current.fulfillmentStatus,
          ...(shouldReleaseStock ? { stockReserved: true } : {}),
        },
        data: {
          fulfillmentStatus: nextStatus,
          stockReserved: shouldReleaseStock ? false : current.stockReserved,
          status: pledgeStatus,
          ...(refundStatus ? { refundStatus } : {}),
          ...(nextStatus === "DELIVERY_FAILED" ? { deliveryFailureReason: reason } : {}),
          ...(nextStatus === "CANCELED" ? { cancellationReason: reason } : {}),
          ...(nextStatus === "RETURNED" ? { returnReason: reason } : {}),
          ...(nextStatus === "DELIVERED" ? {
            receivedAt: new Date(),
            paidAmount: new Decimal(deliveredPaidAmount),
            remainingAmount: 0,
            accountingAmount: new Decimal(nextAccountingAmount),
          } : {}),
          ...(nextStatus === "SHIPPED" ? { handedToCarrierAt: new Date() } : {}),
          ...(reversing ? {
            accountingAmount: new Decimal(nextAccountingAmount),
            refundAmount: new Decimal(cancellationSettlement.refundAmount),
            cancellationFeeAmount: new Decimal(cancellationSettlement.cancellationFeeAmount),
          } : {}),
          ...(shouldReverseAccounting ? { accountingReversedAt: new Date() } : {}),
          updatedAt: new Date(),
        },
      });
      if (claimed.count !== 1) throw new Error("CONFLICT");

      if (shouldReleaseStock && current.rewardId) {
        await tx.rewards.update({
          where: { id: current.rewardId },
          data: { stock: { increment: current.quantity }, updatedAt: new Date() },
        });
      }

      const updated = await tx.pledges.findUnique({ where: { id: pledgeId } });
      if (!updated) throw new Error("NOT_FOUND");

      const currentAmount = current.campaignId && (shouldReverseAccounting || nextStatus === "DELIVERED")
        ? await recalculateCampaignAmount(tx, current.campaignId)
        : null;
      return { updated, currentAmount };
    });

    return NextResponse.json({
      pledge: {
        id: result.updated.id,
        status: result.updated.status,
        fulfillmentStatus: result.updated.fulfillmentStatus,
        refundStatus: result.updated.refundStatus,
        receivedAt: result.updated.receivedAt,
        accountingReversedAt: result.updated.accountingReversedAt,
      },
      currentAmount: result.currentAmount,
      message: nextStatus === "RETURN_REQUESTED" ? "Đã ghi nhận yêu cầu trả hàng" : "Đã cập nhật trạng thái đơn hàng",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });
    }
    if (error instanceof Error && error.message === "CONFLICT") {
      return NextResponse.json({ error: "Đơn hàng vừa được cập nhật, hãy tải lại" }, { status: 409 });
    }
    console.error("[FULFILLMENT_PATCH]", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "Không thể cập nhật trạng thái đơn hàng" }, { status: 500 });
  }
}
