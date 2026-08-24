import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Vui lòng đăng nhập để xem Kho đã mua" }, { status: 401 });

  const pledges = await prisma.pledges.findMany({
    where: {
      userId,
      status: "SUCCESS",
      rewards: { fulfillmentType: { not: "PHYSICAL" } },
    },
    orderBy: { createdAt: "desc" },
    include: {
      rewards: { select: { id: true, title: true, fulfillmentType: true, productImages: true } },
      digitalAsset: { select: { id: true, assetType: true, assetUrl: true, deliveryEmail: true, status: true, deliveredAt: true, claimedAt: true } },
    },
  });

  return NextResponse.json({
    items: pledges.map((pledge) => ({
      pledgeId: pledge.id,
      purchasedAt: pledge.createdAt,
      quantity: pledge.quantity,
      reward: pledge.rewards,
      deliveryMethod: pledge.shippingMethod,
      asset: pledge.digitalAsset,
      availability: pledge.digitalAsset ? "READY" : "WAITING_CREATOR_DELIVERY",
    })),
  });
}
