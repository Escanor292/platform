import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { recalculateCampaignAmount } from "@/lib/order-fulfillment";
import { onPledgeSuccess } from "@/lib/tax/on-pledge-success";
import { activateMembershipFromPledge } from "@/lib/membership";

export async function settlePledgeAsPaid(pledgeId: string, meta?: { transactionId?: string; reason?: string; userId?: string | null }) {
  const pledge = await prisma.pledges.findUnique({
    where: { id: pledgeId },
  });

  if (!pledge) return { ok: false as const, reason: "not-found" as const };
  if (pledge.status === "REFUNDED" || pledge.status === "FAILED") {
    return { ok: false as const, reason: "not-settlable" as const };
  }

  if (pledge.status === "SUCCESS") {
    await activateMembershipFromPledge(pledge.id);
    const docs = await onPledgeSuccess(pledge.id);
    return { ok: true as const, docs };
  }

  const paid = Number(pledge.chargeAmount || pledge.totalAmount);
  const claimed = await prisma.$transaction(async (tx) => {
    const updated = await tx.pledges.updateMany({
      where: { id: pledge.id, status: "PENDING" },
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
    if (updated.count !== 1) return false;
    if (pledge.campaignId) await recalculateCampaignAmount(tx, pledge.campaignId);
    return true;
  });

  if (!claimed) {
    const current = await prisma.pledges.findUnique({
      where: { id: pledge.id },
      select: { status: true },
    });
    if (current?.status === "SUCCESS") {
      await activateMembershipFromPledge(pledge.id);
      return { ok: true as const, docs: { ok: true as const, skipped: "already-settled" as const } };
    }
    return { ok: false as const, reason: "not-settlable" as const };
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

  await activateMembershipFromPledge(pledge.id);
  const docs = await onPledgeSuccess(pledge.id);
  return { ok: true as const, docs };
}
