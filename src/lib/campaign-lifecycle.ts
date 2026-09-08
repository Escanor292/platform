import prisma from "@/lib/prisma";
import { processCampaignRefund } from "@/lib/payment/refund";
import { shouldRefundOnDeadline, type FundingModel } from "@/lib/funding-model";

export async function closeExpiredCampaigns(now = new Date()) {
  const expiredCampaigns = await prisma.campaigns.findMany({
    where: {
      status: "ACTIVE",
      endDate: { lt: now },
    },
    select: {
      id: true,
      currentAmount: true,
      goalAmount: true,
      fundingModel: true,
    },
  });

  let closedCount = 0;
  let refundedCampaigns = 0;
  let refundedPledges = 0;

  for (const campaign of expiredCampaigns) {
    const reachedGoal = Number(campaign.currentAmount) >= Number(campaign.goalAmount);
    const refund = shouldRefundOnDeadline({
      fundingModel: campaign.fundingModel as FundingModel,
      reachedGoal,
    });
    const nextStatus = refund ? "FAILED" : "SUCCESS";

    await prisma.campaigns.update({
      where: { id: campaign.id },
      data: {
        status: nextStatus,
        closedAmount: campaign.currentAmount,
        closedAt: now,
        updatedAt: now,
      },
    });
    closedCount++;

    if (refund) {
      const result = await processCampaignRefund(campaign.id);
      refundedCampaigns++;
      refundedPledges += result.refundedCount || 0;
    }
  }

  return { closedCount, refundedCampaigns, refundedPledges };
}
