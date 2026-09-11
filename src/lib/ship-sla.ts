import prisma from "@/lib/prisma";
import { isPastCarrierHandoffSla } from "@/lib/funding-model";
import { refundPledgeLedger } from "@/lib/payment/refund";

const OPEN_FULFILLMENT = ["NOT_APPLICABLE", "AWAITING_PAYMENT", "PROCESSING"];

export async function refundLateCarrierHandoffs(now = new Date()) {
  const pledges = await prisma.pledges.findMany({
    where: {
      status: "SUCCESS",
      rewardId: { not: null },
      refundStatus: "NO_REFUND",
      fulfillmentStatus: { in: OPEN_FULFILLMENT },
      handedToCarrierAt: null,
    },
    select: {
      id: true,
      fulfillmentStatus: true,
      handedToCarrierAt: true,
      rewards: { select: { deliveryDate: true, isPreorder: true, fulfillmentType: true } },
      campaigns: { select: { endDate: true, status: true } },
    },
  });

  let refundedCount = 0;
  for (const pledge of pledges) {
    const late = isPastCarrierHandoffSla({
      deliveryDate: pledge.rewards?.deliveryDate,
      campaignEndDate: pledge.campaigns?.endDate,
      handedToCarrierAt: pledge.handedToCarrierAt,
      fulfillmentStatus: pledge.fulfillmentStatus,
      now,
    });
    if (!late) continue;
    const ok = await refundPledgeLedger(
      pledge.id,
      "Hủy và hoàn vì trễ quá 2 ngày không giao cho bên vận chuyển",
    );
    if (ok) refundedCount++;
  }
  return { scanned: pledges.length, refundedCount };
}
