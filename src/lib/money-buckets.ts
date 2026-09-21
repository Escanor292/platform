import { prisma } from "@/lib/prisma";
import { REVERSING_FULFILLMENT_STATUSES } from "@/lib/order-fulfillment";

const LIVE_PLEDGE = {
  status: "SUCCESS" as const,
  accountingAmount: { gt: 0 },
  accountingReversedAt: null as null,
  NOT: { fulfillmentStatus: { in: [...REVERSING_FULFILLMENT_STATUSES] } },
};

const CLOSED_STATUSES = new Set(["SUCCESS", "COMPLETED", "FAILED", "CANCELED"]);

export function isCampaignOpenForPledges(status: string | null | undefined): boolean {
  return status === "ACTIVE";
}

export function isCampaignClosed(status: string | null | undefined): boolean {
  return status != null && CLOSED_STATUSES.has(status);
}

/**
 * Campaign fundraising total = live currentAmount (pledges with campaignId).
 * Post-close product sales set campaignId null so they never land here.
 * closedAmount is the freeze-at-deadline snapshot only.
 */
export function campaignRaisedAmount(campaign: {
  status: string;
  currentAmount: { toNumber?: () => number } | number | string | null;
  closedAmount?: { toNumber?: () => number } | number | string | null;
}): number {
  const toNum = (value: { toNumber?: () => number } | number | string | null | undefined) => {
    if (value == null) return 0;
    if (typeof value === "number") return value;
    if (typeof value === "string") return Number(value) || 0;
    if (typeof value.toNumber === "function") return value.toNumber();
    return Number(value) || 0;
  };
  return toNum(campaign.currentAmount);
}

export async function findProjectRewardIds(projectId: string): Promise<string[]> {
  const [fromCampaigns, fromProject, fromLinks] = await Promise.all([
    prisma.rewards.findMany({
      where: { campaigns: { projectId } },
      select: { id: true },
    }),
    prisma.rewards.findMany({
      where: { projectId },
      select: { id: true },
    }),
    prisma.project_reward_links.findMany({
      where: { projectId },
      select: { rewardId: true },
    }),
  ]);
  return [...new Set([
    ...fromCampaigns.map((row) => row.id),
    ...fromProject.map((row) => row.id),
    ...fromLinks.map((row) => row.rewardId),
  ])];
}

/** Shop / post-close sales: SUCCESS pledges with campaignId null. */
export async function sumProductBucket(rewardIds: string[]): Promise<number> {
  if (rewardIds.length === 0) return 0;
  const agg = await prisma.pledges.aggregate({
    where: {
      ...LIVE_PLEDGE,
      campaignId: null,
      rewardId: { in: rewardIds },
    },
    _sum: { accountingAmount: true },
  });
  return Number(agg._sum.accountingAmount || 0);
}

export async function sumRewardProductSales(rewardId: string): Promise<number> {
  return sumProductBucket([rewardId]);
}

/** projectTotal = sum of each campaign currentAmount + product-bucket sales. No double-count. */
export async function sumProjectMoney(projectId: string) {
  const [campaigns, rewardIds] = await Promise.all([
    prisma.campaigns.findMany({
      where: { projectId },
      select: { id: true, status: true, currentAmount: true, closedAmount: true },
    }),
    findProjectRewardIds(projectId),
  ]);
  const campaignTotal = campaigns.reduce((sum, campaign) => sum + campaignRaisedAmount(campaign), 0);
  const productTotal = await sumProductBucket(rewardIds);
  return {
    campaignTotal,
    productTotal,
    projectTotal: campaignTotal + productTotal,
  };
}
