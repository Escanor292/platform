import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * CRON API: Dọn dẹp thanh toán bị treo hoặc thất bại lâu ngày
 */
export async function GET(request: Request) {
  try {
    const threshold = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48 giờ trước

    // 1. Tìm các Payment PENDING quá 48h
    const stalePayments = await prisma.payment.findMany({
      where: {
        status: "PENDING",
        createdAt: { lt: threshold }
      }
    });

    for (const payment of stalePayments) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" }
      });
    }

    return NextResponse.json({ 
        success: true, 
        message: `Đã đánh dấu thất bại cho ${stalePayments.length} thanh toán hết hạn.` 
    });

  } catch (error: any) {
    console.error("Cron Error (cleanup):", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
