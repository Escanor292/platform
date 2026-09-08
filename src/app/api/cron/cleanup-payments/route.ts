import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * CRON: Don phien chuyen khoan PENDING qua 48h.
 * Khong dung COD (don cho giao) va khong dung SUCCESS.
 */
export async function GET() {
  try {
    const threshold = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const stalePledges = await prisma.pledges.findMany({
      where: {
        status: "PENDING",
        createdAt: { lt: threshold },
        paymentProvider: { not: "COD" },
      },
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
            cancellationReason: "Phien chuyen khoan da het han (chua doi soat)",
            updatedAt: new Date(),
          },
        });
      });
    }

    return NextResponse.json({
      success: true,
      message: `Da danh dau that bai cho ${stalePledges.length} giao dich het han.`,
    });
  } catch (error: any) {
    console.error("Cron Error (cleanup):", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
