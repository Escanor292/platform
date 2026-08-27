import prisma from "@/lib/prisma";
import { revokeDigitalWarehouseItem } from "@/lib/digital-warehouse";

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
      return { success: true, refundedCount: 0 };
    }

    let refundedCount = 0;
    for (const pledge of pledges) {
      try {
        await prisma.pledges.update({ where: { id: pledge.id }, data: { refundStatus: "PROCESSING" } });
        const refundSuccess = true;
        if (refundSuccess) {
          await prisma.pledges.update({
            where: { id: pledge.id },
            data: { refundStatus: "COMPLETED", refundedAt: new Date(), status: "REFUNDED" },
          });
          await revokeDigitalWarehouseItem(pledge.id);
          refundedCount++;
        } else {
          await prisma.pledges.update({ where: { id: pledge.id }, data: { refundStatus: "FAILED" } });
        }
      } catch (err) {
        console.error(`[REFUND_ERROR] Lỗi khi hoàn tiền giao dịch ${pledge.transactionId}`, err);
        await prisma.pledges.update({ where: { id: pledge.id }, data: { refundStatus: "FAILED" } });
      }
    }

    return { success: true, refundedCount, total: pledges.length };
  } catch (error) {
    console.error("[REFUND_PROCESS_ERROR]", error);
    throw error;
  }
}

export const processRefund = processCampaignRefund;
