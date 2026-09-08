import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { recalculateCampaignAmount } from "@/lib/order-fulfillment";
import { onPledgeSuccess } from "@/lib/tax/on-pledge-success";

export async function settlePledgeAsPaid(pledgeId: string, meta?: { transactionId?: string; reason?: string; userId?: string | null }) {
  const pledge = await prisma.pledges.findUnique({
    where: { id: pledgeId },
    include: { campaigns: { select: { goalAmount: true, status: true } } },
  });

  if (!pledge) return { ok: false as const, reason: "not-found" as const };
  if (pledge.status === "REFUNDED" || pledge.status === "FAILED") {
    return { ok: false as const, reason: "not-settlable" as const };
  }

  if (pledge.status !== "SUCCESS") {
    const paid = Number(pledge.chargeAmount || pledge.totalAmount);
    await prisma.$transaction(async (tx) => {
      await tx.pledges.update({
        where: { id: pledge.id },
        data: {
          status: "SUCCESS",
          fulfillmentStatus: pledge.rewardId ? "PROCESSING" : "NOT_APPLICABLE",
          transactionId: meta?.transactionId || pledge.transactionId,
          paidAmount: paid,
          remainingAmount: Math.max(0, Number(pledge.orderTotalAmount || pledge.totalAmount) - paid),
          accountingAmount: pledge.isCashOnDelivery ? pledge.depositAmount : pledge.amount,
          webhookProcessedAt: new Date(),
          receivedAt: new Date(),
          updatedAt: new Date(),
        },
      });
      if (pledge.campaignId) await recalculateCampaignAmount(tx, pledge.campaignId);
    });

    if (pledge.campaignId && pledge.campaigns) {
      const campaign = await prisma.campaigns.findUnique({
        where: { id: pledge.campaignId },
        select: { currentAmount: true, goalAmount: true, status: true },
      });
      if (
        campaign &&
        campaign.status === "ACTIVE" &&
        Number(campaign.currentAmount) >= Number(campaign.goalAmount)
      ) {
        await prisma.campaigns.update({
          where: { id: pledge.campaignId },
          data: { status: "SUCCESS", updatedAt: new Date() },
        });
      }
    }

    await createAuditLog({
      userId: meta?.userId || pledge.userId,
      action: "UPDATE",
      entityType: "PLEDGE",
      entityId: pledge.id,
      oldValue: { status: pledge.status },
      newValue: { status: "SUCCESS" },
      reason: meta?.reason || "Đối soát tiền vào tài khoản trung gian",
    });
  }

  const docs = await onPledgeSuccess(pledge.id);
  return { ok: true as const, docs };
}
