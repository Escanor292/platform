import prisma from "@/lib/prisma";

/**
 * Cập nhật số tiền đã quyên góp được cho một chiến dịch
 * Được gọi sau khi mỗi khoản thanh toán thành công
 */
export async function releaseEscrow(campaignId: string) {
  try {
    // 1. Tính tổng số tiền từ các pledge thành công
    const result = await prisma.pledge.aggregate({
      where: {
        campaignId,
        status: "SUCCESS",
      },
      _sum: {
        amount: true,
      },
    });

    const totalRaised = Number(result._sum.amount || 0);

    // 2. Cập nhật vào bản ghi Campaign
    const campaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: { currentAmount: totalRaised },
    });

    // 3. Kiểm tra nếu dự án đã đạt mục tiêu hoặc hết hạn (xử lý thêm logic nếu cần)
    console.log(`[ESCROW] Campaign ${campaign.campaignCode} updated. Raised: ${totalRaised}`);
    
    return { success: true, totalRaised };
  } catch (error) {
    console.error("[ESCROW_ERROR]", error);
    return { success: false, error };
  }
}
