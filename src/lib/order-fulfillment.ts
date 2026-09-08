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
    NOT_APPLICABLE: "Khong ap dung",
    AWAITING_PAYMENT: "Cho thanh toan",
    PROCESSING: "Dang chuan bi",
    SHIPPED: "Dang giao",
    DELIVERED: "Da giao",
    DELIVERY_FAILED: "Giao khong thanh cong",
    CANCELED: "Da huy",
    RETURN_REQUESTED: "Yeu cau tra hang",
    RETURNED: "Da tra hang",
  };
  return labels[status] ?? status;
}

export function reversalReason(pledge: { fulfillmentStatus: string; deliveryFailureReason: string | null; cancellationReason: string | null; returnReason: string | null }) {
  if (pledge.fulfillmentStatus === "DELIVERY_FAILED") return pledge.deliveryFailureReason || "Giao hang khong thanh cong";
  if (pledge.fulfillmentStatus === "CANCELED") return pledge.cancellationReason || "Huy don hang";
  if (pledge.fulfillmentStatus === "RETURNED") return pledge.returnReason || "Tra hang";
  return null;
}
