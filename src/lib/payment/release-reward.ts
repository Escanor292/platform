import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { recalculateCampaignAmount } from "@/lib/order-fulfillment";
import { onPledgeSuccess } from "@/lib/tax/on-pledge-success";
import { isDigitalFulfillment } from "@/lib/warehouse-ui";
import { grantDigitalWarehouseItem } from "@/lib/digital-warehouse";

export const REWARD_HOLD_DAYS = 7;
export const DIGITAL_HOLD_DAYS = 2;

const BLOCKED = ["DELIVERY_FAILED", "CANCELED", "RETURNED", "RETURN_REQUESTED"];

export function isPhysicalReward(fulfillmentType: string | null | undefined) {
  return fulfillmentType === "PHYSICAL";
}

export function isDigitalReward(fulfillmentType: string | null | undefined) {
  return isDigitalFulfillment(fulfillmentType);
}

export function shouldReleaseHeldDigital(pledge: {
  fulfillmentStatus: string;
  receivedAt: Date | null;
  hasOpenReport: boolean;
}, now = new Date()) {
  if (pledge.hasOpenReport) return false;
  if (BLOCKED.includes(pledge.fulfillmentStatus)) return false;
  if (!pledge.receivedAt) return false;
  const due = pledge.receivedAt.getTime() + DIGITAL_HOLD_DAYS * 24 * 60 * 60 * 1000;
  return now.getTime() >= due;
}

export function shouldReleaseHeldReward(pledge: {
  fulfillmentStatus: string;
  receivedAt: Date | null;
  handedToCarrierAt: Date | null;
  hasOpenReport: boolean;
}, now = new Date()) {
  if (pledge.hasOpenReport) return false;
  if (BLOCKED.includes(pledge.fulfillmentStatus)) return false;
  if (pledge.fulfillmentStatus === "DELIVERED" || pledge.receivedAt) return true;
  if (pledge.fulfillmentStatus !== "SHIPPED" || !pledge.handedToCarrierAt) return false;
  const due = pledge.handedToCarrierAt.getTime() + REWARD_HOLD_DAYS * 24 * 60 * 60 * 1000;
  return now.getTime() >= due;
}

export async function deliverDigitalForInspection(pledgeId: string) {
  return grantDigitalWarehouseItem(pledgeId);
}

export async function hasOpenRewardReport(pledgeId: string) {
  const report = await prisma.campaign_reports.findFirst({
    where: { targetId: pledgeId, status: { in: ["PENDING", "REVIEWING"] } },
    select: { id: true },
  });
  return Boolean(report);
}

export async function releaseHeldReward(pledgeId: string, now = new Date()) {
  const pledge = await prisma.pledges.findUnique({ where: { id: pledgeId } });
  if (!pledge?.rewardId || (!isPhysicalReward(pledge.fulfillmentType) && !isDigitalReward(pledge.fulfillmentType))) {
    return { ok: false as const, reason: "not-reward" as const };
  }
  if (pledge.status !== "SUCCESS" || pledge.refundStatus !== "NO_REFUND") {
    return { ok: false as const, reason: "not-held" as const };
  }
  if (Number(pledge.accountingAmount) > 0) {
    await onPledgeSuccess(pledge.id);
    return { ok: true as const, skipped: "already-released" as const };
  }
  const hasOpenReport = await hasOpenRewardReport(pledge.id);
  const ready = isDigitalReward(pledge.fulfillmentType)
    ? shouldReleaseHeldDigital({
      fulfillmentStatus: pledge.fulfillmentStatus,
      receivedAt: pledge.receivedAt,
      hasOpenReport,
    }, now)
    : shouldReleaseHeldReward({
      fulfillmentStatus: pledge.fulfillmentStatus,
      receivedAt: pledge.receivedAt,
      handedToCarrierAt: pledge.handedToCarrierAt,
      hasOpenReport,
    }, now);
  if (!ready) return { ok: false as const, reason: "still-held" as const };

  const accountingAmount = pledge.isCashOnDelivery
    ? Number(pledge.orderTotalAmount || pledge.amount)
    : Number(pledge.amount);
  await prisma.$transaction(async (tx) => {
    const updated = await tx.pledges.updateMany({
      where: { id: pledge.id, status: "SUCCESS", accountingAmount: { lte: 0 }, refundStatus: "NO_REFUND" },
      data: {
        fulfillmentStatus: "DELIVERED",
        receivedAt: pledge.receivedAt || now,
        accountingAmount: new Decimal(accountingAmount),
        paidAmount: new Decimal(accountingAmount),
        remainingAmount: 0,
        updatedAt: now,
      },
    });
    if (updated.count !== 1) return;
    if (pledge.campaignId) await recalculateCampaignAmount(tx, pledge.campaignId);
  });
  await onPledgeSuccess(pledge.id);
  return { ok: true as const };
}

export async function autoReleaseHeldRewards(now = new Date()) {
  const pledges = await prisma.pledges.findMany({
    where: {
      status: "SUCCESS",
      rewardId: { not: null },
      fulfillmentType: { in: ["PHYSICAL", "EMAIL", "DOWNLOAD", "LICENSE_KEY", "DIGITAL_COMIC"] },
      refundStatus: "NO_REFUND",
      accountingAmount: { lte: 0 },
      OR: [
        { fulfillmentType: "PHYSICAL", fulfillmentStatus: { in: ["SHIPPED", "DELIVERED"] } },
        { fulfillmentType: { in: ["EMAIL", "DOWNLOAD", "LICENSE_KEY", "DIGITAL_COMIC"] } },
      ],
    },
    select: { id: true },
  });
  let released = 0;
  for (const pledge of pledges) {
    const result = await releaseHeldReward(pledge.id, now);
    if (result.ok && !("skipped" in result)) released += 1;
  }
  return { scanned: pledges.length, released };
}
