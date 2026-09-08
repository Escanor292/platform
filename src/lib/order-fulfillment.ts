import { Decimal } from "@prisma/client/runtime/library";
import type { Prisma } from "../../prisma/generated/client";

export const REVERSING_FULFILLMENT_STATUSES = ["DELIVERY_FAILED", "CANCELED", "RETURNED"] as const;
export type ReversingFulfillmentStatus = (typeof REVERSING_FULFILLMENT_STATUSES)[number];

export function isReversingFulfillmentStatus(value: string): value is ReversingFulfillmentStatus {
  return REVERSING_FULFILLMENT_STATUSES.includes(value as ReversingFulfillmentStatus);
}

export function isContributionReversed(pledge: { accountingReversedAt: Date | null; status: string; fulfillmentStatus: string }) {
  return Boolean(pledge.accountingReversedAt) || pledge.status === "REFUNDED" || isReversingFulfillmentStatus(pledge.fulfillmentStatus);
}

export async function recalculateCampaignAmount(
  tx: Prisma.TransactionClient,
  campaignId: string,
) {
  const pledges = await tx.pledges.findMany({
    where: {
      campaignId,
      status: "SUCCESS",
      accountingAmount: { gt: 0 },
      accountingReversedAt: null,
      NOT: {
        fulfillmentStatus: { in: [...REVERSING_FULFILLMENT_STATUSES] },
      },
    },
    select: { accountingAmount: true },
  });
  const currentAmount = pledges.reduce((sum, pledge) => sum.plus(pledge.accountingAmount), new Decimal(0));
  await tx.campaigns.update({
    where: { id: campaignId },
    data: { currentAmount, updatedAt: new Date() },
  });
  return currentAmount;
}

export function fulfillmentLabel(status: string) {
  const labels: Record<string, string> = {
    NOT_APPLICABLE: "Không áp dụng",
    AWAITING_PAYMENT: "Chờ thanh toán",
    PROCESSING: "Đang chuẩn bị",
    SHIPPED: "Đang giao",
    DELIVERED: "Đã giao",
    DELIVERY_FAILED: "Giao không thành công",
    CANCELED: "Đã hủy",
    RETURN_REQUESTED: "Yêu cầu trả hàng",
    RETURNED: "Đã trả hàng",
  };
  return labels[status] ?? status;
}

export function reversalReason(pledge: { fulfillmentStatus: string; deliveryFailureReason: string | null; cancellationReason: string | null; returnReason: string | null }) {
  if (pledge.fulfillmentStatus === "DELIVERY_FAILED") return pledge.deliveryFailureReason || "Giao hàng không thành công";
  if (pledge.fulfillmentStatus === "CANCELED") return pledge.cancellationReason || "Hủy đơn hàng";
  if (pledge.fulfillmentStatus === "RETURNED") return pledge.returnReason || "Trả hàng";
  return null;
}
