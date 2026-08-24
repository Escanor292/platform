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
      await prisma.$transaction(async (tx) => {
        const current = await tx.pledges.findUnique({
          where: { id: pledge.id },
          select: { status: true, stockReserved: true, rewardId: true, quantity: true },
        });
        if (!current || current.status !== "PENDING") return;
        if (current.stockReserved && current.rewardId) {
          await tx.rewards.update({
            where: { id: current.rewardId },
            data: { stock: { increment: current.quantity }, updatedAt: new Date() },
          });
        }
        await tx.pledges.update({
          where: { id: pledge.id },
          data: {
            status: "FAILED",
            stockReserved: false,
            fulfillmentStatus: pledge.rewardId ? "CANCELED" : "NOT_APPLICABLE",
            cancellationReason: "Phiên thanh toán đã hết hạn",
            updatedAt: new Date(),
          },
        });
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
