import prisma from "@/lib/prisma";
import { revokeDigitalWarehouseItem } from "@/lib/digital-warehouse";
import { recalculateCampaignAmount } from "@/lib/order-fulfillment";

export async function processCampaignRefund(campaignId: string) {
  try {
    const campaign = await prisma.campaigns.findUnique({ where: { id: campaignId } });
    if (!campaign) throw new Error("Campaign không tồn tại");
    if (campaign.status !== "FAILED" && campaign.status !== "CANCELED") {
      throw new Error("Dự án chưa ở trạng thái có thể hoàn tiền (phải là FAILED hoặc CANCELED)");
    }

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
    const now = new Date();
    for (const pledge of pledges) {
      try {
        await prisma.pledges.update({
          where: { id: pledge.id },
          data: {
            refundStatus: "COMPLETED",
            refundedAt: now,
            status: "REFUNDED",
            accountingReversedAt: now,
            fulfillmentStatus: pledge.rewardId ? "CANCELED" : "NOT_APPLICABLE",
            cancellationReason: pledge.cancellationReason || "Hoàn sổ khi chiến dịch thất bại/hủy",
            updatedAt: now,
          },
        });
        await revokeDigitalWarehouseItem(pledge.id);
        refundedCount++;
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
