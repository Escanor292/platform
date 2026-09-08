import { prisma } from "@/lib/prisma";

/** Them phan qua / SKU thi tu doi AON -> Keep-It-All (an toan hon cho backer). */
export async function coerceCampaignToKeepItAll(campaignId: string): Promise<boolean> {
  const result = await prisma.campaigns.updateMany({
    where: { id: campaignId, fundingModel: "ALL_OR_NOTHING" },
    data: { fundingModel: "KEEP_IT_ALL", updatedAt: new Date() },
  });
  return result.count > 0;
}
