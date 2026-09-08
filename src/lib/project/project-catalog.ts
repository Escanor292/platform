import type { PublicReward } from "@/types/project-detail";

const PRODUCT_FULFILLMENT = new Set([
  "PHYSICAL",
  "EMAIL",
  "DOWNLOAD",
  "LICENSE_KEY",
  "DIGITAL_COMIC",
]);

export function isSellableProduct(reward: Pick<PublicReward, "minAmount" | "fulfillmentType" | "campaignType">): boolean {
  const priced = Number(reward.minAmount) > 0;
  const productFulfillment = Boolean(
    reward.fulfillmentType && PRODUCT_FULFILLMENT.has(reward.fulfillmentType),
  );
  if (priced && productFulfillment) return true;
  if (reward.campaignType === "DONATION" && !productFulfillment) return false;
  return priced;
}

export function classifyProjectRewards(rewards: PublicReward[]): {
  products: PublicReward[];
  gifts: PublicReward[];
} {
  const active = rewards.filter((reward) => reward.isActive !== false);
  return {
    products: active.filter((reward) => isSellableProduct(reward)),
    gifts: active.filter((reward) => !isSellableProduct(reward)),
  };
}

export function unionCatalogRewards(parts: Array<PublicReward[] | undefined | null>): PublicReward[] {
  const byId = new Map<string, PublicReward>();
  for (const list of parts) {
    if (!list) continue;
    for (const reward of list) {
      if (!reward?.id) continue;
      const previous = byId.get(reward.id);
      byId.set(reward.id, previous ? { ...previous, ...reward } : reward);
    }
  }
  return [...byId.values()];
}
