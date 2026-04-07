import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * CRON API: Cập nhật trạng thái chiến dịch tự động khi hết hạn
 * Chạy định kỳ (ví dụ: mỗi giờ một lần)
 */
export async function GET(request: Request) {
  try {
    const now = new Date();

    // 1. Tìm các chiến dịch ACTIVE đã quá ngày endDate
    const expiredCampaigns = await prisma.campaign.findMany({
      where: {
        status: "ACTIVE",
        endDate: { lt: now }
      }
    });

    let updatedCount = 0;

    for (const campaign of expiredCampaigns) {
       // Nếu đạt mục tiêu -> SUCCESSFUL
       // Nếu không đạt -> FAILED (Sẽ kích hoạt hoàn tiền)
       const isSuccess = campaign.currentAmount >= campaign.goalAmount;
       
       await prisma.campaign.update({
          where: { id: campaign.id },
          data: {
             status: isSuccess ? "SUCCESSFUL" : "FAILED"
          }
       });
       updatedCount++;
    }

    return NextResponse.json({ 
        success: true, 
        message: `Đã cập nhật trạng thái cho ${updatedCount} chiến dịch hết hạn.` 
    });

  } catch (error: any) {
    console.error("Cron Error (update status):", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
