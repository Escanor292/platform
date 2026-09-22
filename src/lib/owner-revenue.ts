import { prisma } from "@/lib/prisma";
import { LIVE_PLEDGE, findProjectRewardIds } from "@/lib/money-buckets";
import { REVERSING_FULFILLMENT_STATUSES } from "@/lib/order-fulfillment";

export type DonutSlice = {
  key: string;
  label: string;
  amount: number;
};

export type OrderSuccessStats = {
  successCount: number;
  totalCount: number;
  successRate: number;
};

export type ProjectOwnerStats = {
  noGiftAmount: number;
  giftAmount: number;
  campaignAmount: number;
  productAmount: number;
  slices: DonutSlice[];
  orders: OrderSuccessStats;
};

export type CampaignOwnerStats = {
  noGiftAmount: number;
  giftAmount: number;
  slices: DonutSlice[];
};

export type ProductOwnerStats = {
  revenue: number;
  orders: OrderSuccessStats;
};

const COUNTED_ORDER_STATUSES = ["SUCCESS", "FAILED", "REFUNDED"] as const;

function toNum(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") return Number(value) || 0;
  if (typeof value === "object" && typeof (value as { toNumber?: () => number }).toNumber === "function") {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value) || 0;
}

function isLiveSuccess(pledge: {
  status: string;
  accountingReversedAt: Date | null;
  fulfillmentStatus: string | null;
}): boolean {
  if (pledge.status !== "SUCCESS") return false;
  if (pledge.accountingReversedAt) return false;
  if (pledge.fulfillmentStatus && REVERSING_FULFILLMENT_STATUSES.includes(pledge.fulfillmentStatus as (typeof REVERSING_FULFILLMENT_STATUSES)[number])) {
    return false;
  }
  return true;
}

export function computeOrderSuccessStats(
  pledges: Array<{ status: string; accountingReversedAt: Date | null; fulfillmentStatus: string | null }>,
): OrderSuccessStats {
  const counted = pledges.filter((pledge) => pledge.status !== "PENDING");
  const successCount = counted.filter(isLiveSuccess).length;
  const totalCount = counted.length;
  return {
    successCount,
    totalCount,
    successRate: totalCount > 0 ? successCount / totalCount : 0,
  };
}

async function orderStatsForRewards(rewardIds: string[]): Promise<OrderSuccessStats> {
  if (rewardIds.length === 0) {
    return { successCount: 0, totalCount: 0, successRate: 0 };
  }
  const pledges = await prisma.pledges.findMany({
    where: {
      rewardId: { in: rewardIds },
      status: { in: [...COUNTED_ORDER_STATUSES] },
    },
    select: { status: true, accountingReversedAt: true, fulfillmentStatus: true },
  });
  return computeOrderSuccessStats(pledges);
}

export async function getProjectOwnerStats(projectId: string): Promise<ProjectOwnerStats> {
  const [campaigns, rewardIds] = await Promise.all([
    prisma.campaigns.findMany({ where: { projectId }, select: { id: true } }),
    findProjectRewardIds(projectId),
  ]);
  const campaignIds = campaigns.map((campaign) => campaign.id);

  const [campaignPledges, productAgg, orders] = await Promise.all([
    campaignIds.length
      ? prisma.pledges.findMany({
          where: { ...LIVE_PLEDGE, campaignId: { in: campaignIds } },
          select: { rewardId: true, accountingAmount: true },
        })
      : Promise.resolve([]),
    rewardIds.length
      ? prisma.pledges.aggregate({
          where: { ...LIVE_PLEDGE, campaignId: null, rewardId: { in: rewardIds } },
          _sum: { accountingAmount: true },
        })
      : Promise.resolve({ _sum: { accountingAmount: null } }),
    orderStatsForRewards(rewardIds),
  ]);

  let noGiftAmount = 0;
  let giftAmount = 0;
  for (const pledge of campaignPledges) {
    const amount = toNum(pledge.accountingAmount);
    if (pledge.rewardId) giftAmount += amount;
    else noGiftAmount += amount;
  }
  const productAmount = toNum(productAgg._sum.accountingAmount);
  const campaignAmount = noGiftAmount + giftAmount;

  return {
    noGiftAmount,
    giftAmount,
    campaignAmount,
    productAmount,
    slices: [
      { key: "noGift", label: "Ủng hộ không quà", amount: noGiftAmount },
      { key: "gift", label: "Ủng hộ có quà", amount: giftAmount },
      { key: "product", label: "Sản phẩm trong dự án", amount: productAmount },
    ],
    orders,
  };
}

export async function getCampaignOwnerStats(campaignId: string): Promise<CampaignOwnerStats> {
  const pledges = await prisma.pledges.findMany({
    where: { ...LIVE_PLEDGE, campaignId },
    select: { rewardId: true, accountingAmount: true },
  });
  let noGiftAmount = 0;
  let giftAmount = 0;
  for (const pledge of pledges) {
    const amount = toNum(pledge.accountingAmount);
    if (pledge.rewardId) giftAmount += amount;
    else noGiftAmount += amount;
  }
  return {
    noGiftAmount,
    giftAmount,
    slices: [
      { key: "noGift", label: "Ủng hộ không quà", amount: noGiftAmount },
      { key: "gift", label: "Ủng hộ có quà", amount: giftAmount },
    ],
  };
}

export async function getProductOwnerStats(rewardId: string): Promise<ProductOwnerStats> {
  const [agg, orders] = await Promise.all([
    prisma.pledges.aggregate({
      where: { ...LIVE_PLEDGE, rewardId },
      _sum: { accountingAmount: true },
    }),
    orderStatsForRewards([rewardId]),
  ]);
  return {
    revenue: toNum(agg._sum.accountingAmount),
    orders,
  };
}
