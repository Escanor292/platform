import { prisma } from "@/lib/prisma";
import { REVERSING_FULFILLMENT_STATUSES } from "@/lib/order-fulfillment";

export const LIVE_PLEDGE = {
  status: "SUCCESS" as const,
  accountingAmount: { gt: 0 },
  accountingReversedAt: null as null,
  NOT: { fulfillmentStatus: { in: [...REVERSING_FULFILLMENT_STATUSES] } },
};
