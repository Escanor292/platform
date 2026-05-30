import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * CRON API: Dọn dẹp thanh toán bị treo hoặc thất bại lâu ngày
 */
export async function GET(request: Request) {
  try {
    const threshold = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48 giờ trước

    // 1. Tìm các Pledge PENDING quá 48h
    const stalePledges = await prisma.pledges.findMany({
      where: {
        status: "PENDING",
        createdAt: { lt: threshold }
      }
    });

    for (const pledge of stalePledges) {
      await prisma.pledges.update({
        where: { id: pledge.id },
        data: { status: "FAILED" }
      });
    }

    return NextResponse.json({ 
        success: true, 
        message: `Đã đánh dấu thất bại cho ${stalePledges.length} giao dịch hết hạn.` 
    });

  } catch (error: any) {
    console.error("Cron Error (cleanup):", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
