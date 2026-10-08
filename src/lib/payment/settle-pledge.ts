import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { recalculateCampaignAmount } from "@/lib/order-fulfillment";
import { onPledgeSuccess } from "@/lib/tax/on-pledge-success";
import { activateMembershipFromPledge } from "@/lib/membership";
import { deliverDigitalForInspection, isDigitalReward, isPhysicalReward } from "@/lib/payment/release-reward";

export async function settlePledgeAsPaid(pledgeId: string, meta?: { transactionId?: string; reason?: string; userId?: string | null }) {
  const pledge = await prisma.pledges.findUnique({
    where: { id: pledgeId },
  });

  if (!pledge) return { ok: false as const, reason: "not-found" as const };
  if (pledge.status === "REFUNDED" || pledge.status === "FAILED") {
    return { ok: false as const, reason: "not-settlable" as const };
  }

  if (pledge.status === "SUCCESS") {
    if (pledge.rewardId && (isPhysicalReward(pledge.fulfillmentType) || isDigitalReward(pledge.fulfillmentType)) && Number(pledge.accountingAmount) <= 0) {
      return { ok: true as const, docs: { ok: true as const, skipped: "reward-held" as const } };
    }
    await activateMembershipFromPledge(pledge.id);
    const docs = await onPledgeSuccess(pledge.id);
    return { ok: true as const, docs };
  }

  const paid = Number(pledge.chargeAmount || pledge.totalAmount);
  const holdsPhysical = Boolean(pledge.rewardId && isPhysicalReward(pledge.fulfillmentType));
  const holdsDigital = Boolean(pledge.rewardId && isDigitalReward(pledge.fulfillmentType));
  const holdsReward = holdsPhysical || holdsDigital;
  const claimed = await prisma.$transaction(async (tx) => {
    const updated = await tx.pledges.updateMany({
      where: { id: pledge.id, status: "PENDING" },
      data: {
        status: "SUCCESS",
        fulfillmentStatus: pledge.rewardId ? "PROCESSING" : "NOT_APPLICABLE",
        transactionId: meta?.transactionId || pledge.transactionId,
        paidAmount: holdsPhysical ? 0 : paid,
        remainingAmount: holdsPhysical ? paid : Math.max(0, Number(pledge.orderTotalAmount || pledge.totalAmount) - paid),
        accountingAmount: holdsReward ? 0 : (pledge.isCashOnDelivery ? pledge.depositAmount : pledge.amount),
        webhookProcessedAt: new Date(),
        receivedAt: holdsPhysical ? null : new Date(),
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
    reason: meta?.reason || (holdsDigital
      ? "Đã giao quà số. Giữ tiền 2 ngày để người mua kiểm tra."
      : holdsPhysical
        ? "Đã nhận tiền đơn có quà. Giữ đến khi giao xong hoặc hết hạn khiếu nại."
        : "Đối soát tiền vào tài khoản trung gian"),
  });

  if (holdsDigital) await deliverDigitalForInspection(pledge.id);
  if (holdsReward) return { ok: true as const, docs: { ok: true as const, skipped: "reward-held" as const } };
  await activateMembershipFromPledge(pledge.id);
  const docs = await onPledgeSuccess(pledge.id);
  return { ok: true as const, docs };
}
