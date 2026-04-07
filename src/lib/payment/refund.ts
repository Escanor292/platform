import { prisma } from "@/lib/prisma";

/**
 * Xử lý hoàn tiền cho tất cả các giao dịch của một dự án bị thất bại/hủy
 * Flow: System detect project cancel -> Lấy toàn bộ transaction -> Gọi API refund qua cổng thanh toán -> Update trạng thái
 */
export async function processCampaignRefund(campaignId: string) {
  try {
    // 1. Kiểm tra campaign và trạng thái
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) throw new Error("Campaign không tồn tại");
    if (campaign.status !== "FAILED" && campaign.status !== "CANCELED") {
      throw new Error("Dự án chưa ở trạng thái có thể hoàn tiền (phải là FAILED hoặc CANCELED)");
    }

    // 2. Lấy danh sách các giao dịch đã SUCCESS
    const pledges = await prisma.pledge.findMany({
      where: {
        campaignId,
        status: "SUCCESS", // Chỉ hoàn tiền cho các giao dịch đã thanh toán thành công
        refundStatus: "NO_REFUND",
      },
    });

    if (pledges.length === 0) {
      console.log(`[REFUND] Không có giao dịch nào cần hoàn tiền cho dự án ${campaign.campaignCode}`);
      return { success: true, refundedCount: 0 };
    }

    let refundedCount = 0;

    // 3. Xử lý hoàn tiền từng giao dịch (nên xử lý qua queue/background job thực tế)
    for (const pledge of pledges) {
      try {
        // Cập nhật trạng thái đang xử lý để tránh double refund
        await prisma.pledge.update({
          where: { id: pledge.id },
          data: { refundStatus: "PROCESSING" },
        });

        // 4. Gọi API bên thứ 3 tương ứng
        let refundSuccess = false;
        switch (pledge.paymentProvider) {
          case "MOMO":
            // TODO: Call MoMo Refund API
            // refundSuccess = await momoRefund(pledge.transactionId, pledge.amount);
            refundSuccess = true; // STUB
            break;
          case "VNPAY":
            // TODO: Call VNPay Refund API
            // refundSuccess = await vnpayRefund(pledge.transactionId, pledge.amount);
            refundSuccess = true; // STUB
            break;
          case "PAYOS":
            // TODO: Call PayOS Refund API (nếu có hỗ trợ)
            refundSuccess = true; // STUB
            break;
          case "BANK":
            // Refund manual qua ngân hàng
            refundSuccess = true; // STUB phụ thuộc admin operator
            break;
        }

        // 5. Cập nhật kết quả hoàn tiền
        if (refundSuccess) {
          await prisma.pledge.update({
            where: { id: pledge.id },
            data: {
              refundStatus: "COMPLETED",
              refundedAt: new Date(),
              status: "REFUNDED",
            },
          });
          refundedCount++;
        } else {
          await prisma.pledge.update({
            where: { id: pledge.id },
            data: { refundStatus: "FAILED" },
          });
        }
      } catch (err) {
        console.error(`[REFUND_ERROR] Lỗi khi hoàn tiền giao dịch ${pledge.transactionId}`, err);
        // Đánh dấu giao dịch bị lỗi hoàn tiền để tra soát sau
        await prisma.pledge.update({
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
