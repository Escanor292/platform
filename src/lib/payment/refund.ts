import prisma from "@/lib/prisma";

/**
 * Xử lý hoàn tiền cho tất cả các giao dịch của một dự án bị thất bại/hủy
 * Flow: System detect project cancel -> Lấy toàn bộ giao dịch thành công -> Cập nhật trạng thái hoàn tiền
 */
export async function processCampaignRefund(campaignId: string) {
  try {
    // 1. Kiểm tra campaign và trạng thái
    const campaign = await prisma.campaigns.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) throw new Error("Campaign không tồn tại");
    if (campaign.status !== "FAILED" && campaign.status !== "CANCELED") {
      throw new Error("Dự án chưa ở trạng thái có thể hoàn tiền (phải là FAILED hoặc CANCELED)");
    }

    // 2. Lấy danh sách các giao dịch đã SUCCESS
    const pledges = await prisma.pledges.findMany({
      where: {
        campaignId,
        status: "SUCCESS", 
        refundStatus: "NO_REFUND",
      },
    });

    if (pledges.length === 0) {
      console.log(`[REFUND] Không có giao dịch nào cần hoàn tiền cho dự án ${campaign.campaignCode}`);
      return { success: true, refundedCount: 0 };
    }

    let refundedCount = 0;

    // 3. Xử lý hoàn tiền từng giao dịch
    for (const pledge of pledges) {
      try {
        // Cập nhật trạng thái đang xử lý
        await prisma.pledges.update({
          where: { id: pledge.id },
          data: { refundStatus: "PROCESSING" },
        });

        // 4. Giả lập gọi API hoàn tiền (STUB)
        const refundSuccess = true; 

        // 5. Cập nhật kết quả hoàn tiền
        if (refundSuccess) {
          await prisma.pledges.update({
            where: { id: pledge.id },
            data: {
              refundStatus: "COMPLETED",
              refundedAt: new Date(),
              status: "REFUNDED",
            },
          });
          refundedCount++;
        } else {
          await prisma.pledges.update({
            where: { id: pledge.id },
            data: { refundStatus: "FAILED" },
          });
        }
      } catch (err) {
        console.error(`[REFUND_ERROR] Lỗi khi hoàn tiền giao dịch ${pledge.transactionId}`, err);
        await prisma.pledges.update({
          where: { id: pledge.id },
          data: { refundStatus: "FAILED" },
        });
      }
    }

    console.log(`[REFUND_SUCCESS] Đã hoàn thành hoàn tiền cho ${refundedCount}/${pledges.length} giao dịch.`);
    return { success: true, refundedCount, total: pledges.length };

  } catch (error) {
    console.error("[REFUND_PROCESS_ERROR]", error);
    throw error;
  }
}

/**
 * Thêm export named để tương thích với các route cũ
 */
export const processRefund = processCampaignRefund;
