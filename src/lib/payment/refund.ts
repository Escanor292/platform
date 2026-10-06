import prisma from "@/lib/prisma";
import { revokeDigitalWarehouseItem } from "@/lib/digital-warehouse";
import { recalculateCampaignAmount } from "@/lib/order-fulfillment";

export async function refundPledgeLedger(pledgeId: string, reason: string) {
  const now = new Date();
  const claimed = await prisma.$transaction(async (tx) => {
    const pledge = await tx.pledges.findUnique({
      where: { id: pledgeId },
      select: {
        id: true,
        campaignId: true,
        rewardId: true,
        quantity: true,
        status: true,
        refundStatus: true,
        stockReserved: true,
        cancellationReason: true,
      },
    });
    if (!pledge || pledge.status !== "SUCCESS" || pledge.refundStatus === "COMPLETED") return null;
    const updated = await tx.pledges.updateMany({
      where: {
        id: pledge.id,
        status: "SUCCESS",
        refundStatus: { not: "COMPLETED" },
        stockReserved: pledge.stockReserved,
      },
      data: {
        refundStatus: "COMPLETED",
        refundedAt: now,
        status: "REFUNDED",
        stockReserved: false,
        accountingReversedAt: now,
        fulfillmentStatus: pledge.rewardId ? "CANCELED" : "NOT_APPLICABLE",
        cancellationReason: pledge.cancellationReason || reason,
        updatedAt: now,
      },
    });
    if (updated.count !== 1) return null;
    if (pledge.stockReserved && pledge.rewardId) {
      await tx.rewards.update({
        where: { id: pledge.rewardId },
        data: { stock: { increment: pledge.quantity }, updatedAt: now },
      });
    }
    if (pledge.campaignId) await recalculateCampaignAmount(tx, pledge.campaignId);
    return pledge;
  });
  if (!claimed) return false;
  await revokeDigitalWarehouseItem(claimed.id);
  return true;
}

async function closePendingPledges(campaignId: string, reason: string) {
  const now = new Date();
  const pending = await prisma.pledges.findMany({
    where: { campaignId, status: "PENDING" },
    select: { id: true, rewardId: true, quantity: true, stockReserved: true },
  });
  for (const pledge of pending) {
    await prisma.$transaction(async (tx) => {
      const updated = await tx.pledges.updateMany({
        where: { id: pledge.id, status: "PENDING" },
        data: {
          status: "FAILED",
          stockReserved: false,
          fulfillmentStatus: pledge.rewardId ? "CANCELED" : "NOT_APPLICABLE",
          cancellationReason: reason,
          updatedAt: now,
        },
      });
      if (updated.count !== 1) return;
      if (pledge.stockReserved && pledge.rewardId) {
        await tx.rewards.update({
          where: { id: pledge.rewardId },
          data: { stock: { increment: pledge.quantity }, updatedAt: now },
        });
      }
    });
  }
}

export async function processCampaignRefund(campaignId: string) {
  try {
    const campaign = await prisma.campaigns.findUnique({ where: { id: campaignId } });
    if (!campaign) throw new Error("Campaign không tồn tại");
    if (campaign.status !== "FAILED" && campaign.status !== "CANCELED") {
      throw new Error("Dự án chưa ở trạng thái có thể hoàn tiền (phải là FAILED hoặc CANCELED)");
    }

    await closePendingPledges(campaignId, "Chiến dịch đã hủy, phiên chờ thanh toán được đóng");

    const pledges = await prisma.pledges.findMany({
      where: { campaignId, status: "SUCCESS", refundStatus: "NO_REFUND" },
    });

    if (pledges.length === 0) {
      await prisma.$transaction((tx) => recalculateCampaignAmount(tx, campaignId));
      return {
        success: true,
        refundedCount: 0,
        total: 0,
        note: "Sổ sách. Chi hoàn ngân hàng làm tay vì chưa có NH trung gian.",
      };
    }

    let refundedCount = 0;
    for (const pledge of pledges) {
      try {
        const ok = await refundPledgeLedger(pledge.id, "Hoàn sổ khi chiến dịch thất bại/hủy");
        if (ok) refundedCount++;
      } catch (err) {
        console.error(`[REFUND_ERROR] Lỗi khi hoàn tiền giao dịch ${pledge.transactionId}`, err);
        await prisma.pledges.update({ where: { id: pledge.id }, data: { refundStatus: "FAILED" } });
      }
    }

    await prisma.$transaction((tx) => recalculateCampaignAmount(tx, campaignId));

    return {
      success: true,
      refundedCount,
      total: pledges.length,
      note: "Sổ sách. Chi hoàn ngân hàng làm tay vì chưa có NH trung gian.",
    };
  } catch (error) {
    console.error("[REFUND_PROCESS_ERROR]", error);
    throw error;
  }
}

export const processRefund = processCampaignRefund;
