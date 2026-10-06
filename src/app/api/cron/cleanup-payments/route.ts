import { NextResponse } from "next/server";
import { unauthorizedCron } from "@/lib/cron-auth";
import { prisma } from "@/lib/prisma";

/**
 * CRON: Don phien chuyen khoan PENDING qua 48h.
 * Giu 48h vi doi soat ngan hang la thu cong, khong phai checkout the 15 phut.
 * Khong dung COD va khong dung SUCCESS.
 * Chi khoa dong khi status van la PENDING, de khong nhả kho cua lenh vua doi soat.
 */
export async function GET(request: Request) {
  const denied = unauthorizedCron(request);
  if (denied) return denied;

  try {
    const threshold = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const stalePledges = await prisma.pledges.findMany({
      where: {
        status: "PENDING",
        createdAt: { lt: threshold },
        paymentProvider: { not: "COD" },
      },
      select: {
        id: true,
        rewardId: true,
        quantity: true,
        stockReserved: true,
      },
      orderBy: { createdAt: "asc" },
      take: 200,
    });

    let closed = 0;
    for (const pledge of stalePledges) {
      const didClose = await prisma.$transaction(async (tx) => {
        const updated = await tx.pledges.updateMany({
          where: { id: pledge.id, status: "PENDING" },
          data: {
            status: "FAILED",
            stockReserved: false,
            fulfillmentStatus: pledge.rewardId ? "CANCELED" : "NOT_APPLICABLE",
            cancellationReason: "Phien chuyen khoan da het han (chua doi soat)",
            updatedAt: new Date(),
          },
        });
        if (updated.count !== 1) return false;
        if (pledge.stockReserved && pledge.rewardId) {
          await tx.rewards.update({
            where: { id: pledge.rewardId },
            data: { stock: { increment: pledge.quantity }, updatedAt: new Date() },
          });
        }
        return true;
      });
      if (didClose) closed += 1;
    }

    return NextResponse.json({
      success: true,
      closed,
      message: `Da danh dau that bai cho ${closed} giao dich het han.`,
    });
  } catch (error: any) {
    console.error("Cron Error (cleanup):", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
