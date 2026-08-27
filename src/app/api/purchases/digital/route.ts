import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { isDigitalFulfillment, warehouseCategory } from "@/lib/warehouse-ui";

export async function GET() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Vui lòng đăng nhập để xem Kho đồ" }, { status: 401 });

  const pledges = await prisma.pledges.findMany({
    where: {
      userId,
      status: "SUCCESS",
      OR: [
        { fulfillmentType: { in: ["EMAIL", "DOWNLOAD", "LICENSE_KEY", "DIGITAL_COMIC"] } },
        { rewards: { fulfillmentType: { in: ["EMAIL", "DOWNLOAD", "LICENSE_KEY", "DIGITAL_COMIC"] } } },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      rewards: { select: { id: true, title: true, fulfillmentType: true, productImages: true } },
      digitalAsset: { select: { id: true, assetType: true, assetUrl: true, encryptedValue: true, deliveryEmail: true, status: true, deliveredAt: true } },
    },
  });

  return NextResponse.json({
    items: pledges
      .filter((pledge) => isDigitalFulfillment(pledge.fulfillmentType || pledge.rewards?.fulfillmentType))
      .map((pledge) => {
        const type = pledge.fulfillmentType || pledge.rewards?.fulfillmentType;
        return {
          pledgeId: pledge.id,
          purchasedAt: pledge.createdAt,
          quantity: pledge.quantity,
          reward: pledge.rewards,
          category: warehouseCategory(type, pledge.rewards?.title),
          asset: pledge.digitalAsset
            ? {
                ...pledge.digitalAsset,
                encryptedValue: pledge.digitalAsset.assetType === "LICENSE_KEY" ? pledge.digitalAsset.encryptedValue : undefined,
              }
            : null,
          href: `/purchases?item=${pledge.id}`,
          availability: pledge.digitalAsset?.assetUrl || pledge.digitalAsset?.encryptedValue ? "READY" : "IN_LIBRARY",
        };
      }),
  });
}
