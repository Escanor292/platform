import { prisma } from "@/lib/prisma";
import { DEFAULT_PLATFORM_FEE_RATE } from "@/lib/funding-model";
import { isCampaignClosed, isCampaignOpenForPledges } from "@/lib/money-buckets";

export type CheckoutBucket = "CAMPAIGN" | "PRODUCT";

export type CheckoutTarget =
  | { ok: true; bucket: CheckoutBucket; pledgeCampaignId: string | null; campaign: { id: string; title: string | null; feeRate: number | null } | null; reward: {
      id: string;
      campaignId: string | null;
      title: string;
      minAmount: unknown;
      maxAmount: unknown;
      maxQuantity: number | null;
      stock: number | null;
      availability: string;
      isPreorder: boolean;
      onlineDepositPercent: number | null;
      codDepositPercent: number | null;
      fulfillmentType: string;
    } | null; feeRate: number }
  | { ok: false; status: number; error: string };

export function decideCheckoutBucket(
  hasReward: boolean,
  campaignStatus: string | null | undefined,
): { ok: true; bucket: CheckoutBucket } | { ok: false; status: number; error: string } {
  const open = isCampaignOpenForPledges(campaignStatus);
  if (!hasReward) {
    if (!open) {
      return { ok: false, status: 404, error: "Chien dich khong ton tai hoac chua mo nhan ung ho" };
    }
    return { ok: true, bucket: "CAMPAIGN" };
  }
  if (open) return { ok: true, bucket: "CAMPAIGN" };
  if (!campaignStatus || isCampaignClosed(campaignStatus)) {
    return { ok: true, bucket: "PRODUCT" };
  }
  return { ok: false, status: 404, error: "Chien dich chua mo nhan ung ho" };
}

export async function resolveCheckoutTarget(params: {
  campaignId: string;
  rewardId: string | null;
}): Promise<CheckoutTarget> {
  const reward = params.rewardId
    ? await prisma.rewards.findFirst({
        where: { id: params.rewardId, isActive: true },
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

  if (params.rewardId && !reward) {
    return { ok: false, status: 404, error: "Phan qua khong ton tai, da tat hoac khong thuoc chien dich nay" };
  }

  if (params.campaignId && reward?.campaignId && reward.campaignId !== params.campaignId) {
    return { ok: false, status: 404, error: "Phan qua khong ton tai, da tat hoac khong thuoc chien dich nay" };
  }

  const campaignLookupId = params.campaignId || reward?.campaignId || "";
  const campaign = campaignLookupId
    ? await prisma.campaigns.findFirst({
        where: { id: campaignLookupId },
        select: { id: true, title: true, feeRate: true, status: true },
      })
    : null;

  if (params.campaignId && !campaign) {
    return { ok: false, status: 404, error: "Chien dich khong ton tai" };
  }

  const decision = decideCheckoutBucket(Boolean(reward), campaign?.status);
  if (!decision.ok) return decision;

  const feeRate = Number(campaign?.feeRate ?? DEFAULT_PLATFORM_FEE_RATE);
  const campaignPayload = campaign
    ? { id: campaign.id, title: campaign.title, feeRate: campaign.feeRate }
    : null;

  if (decision.bucket === "CAMPAIGN") {
    if (!campaign) {
      return { ok: false, status: 404, error: "Chien dich khong ton tai hoac chua mo nhan ung ho" };
    }
    return {
      ok: true,
      bucket: "CAMPAIGN",
      pledgeCampaignId: campaign.id,
      campaign: campaignPayload,
      reward,
      feeRate,
    };
  }

  return {
    ok: true,
    bucket: "PRODUCT",
    pledgeCampaignId: null,
    campaign: null,
    reward,
    feeRate,
  };
}
