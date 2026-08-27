import prisma from "@/lib/prisma";
import { notificationService } from "@/services/mongodb/notification.service";
import type { RewardFulfillmentType } from "../../prisma/generated/client";
import { isDigitalFulfillment } from "@/lib/warehouse-ui";

export {
  DIGITAL_FULFILLMENT_TYPES,
  isDigitalFulfillment,
  warehouseCategory,
  warehouseCategoryLabel,
} from "@/lib/warehouse-ui";
export type { DigitalFulfillmentType, WarehouseCategory } from "@/lib/warehouse-ui";

export async function grantDigitalWarehouseItem(pledgeId: string) {
  const pledge = await prisma.pledges.findUnique({
    where: { id: pledgeId },
    include: {
      rewards: { select: { id: true, title: true, fulfillmentType: true } },
      digitalAsset: true,
    },
  });

  if (!pledge || pledge.status !== "SUCCESS" || !pledge.rewardId) {
    return { granted: false as const, reason: "invalid-pledge" };
  }

  const fulfillmentType = (pledge.fulfillmentType || pledge.rewards?.fulfillmentType || null) as RewardFulfillmentType | null;
  if (!isDigitalFulfillment(fulfillmentType)) {
    return { granted: false as const, reason: "physical-or-donation" };
  }

  const template = await prisma.reward_digital_assets.findFirst({
    where: {
      rewardId: pledge.rewardId,
      pledgeId: null,
      status: { in: ["AVAILABLE", "DELIVERED"] },
    },
    orderBy: { createdAt: "desc" },
  });

  const assetUrl = pledge.digitalAsset?.assetUrl || template?.assetUrl || null;
  const encryptedValue = pledge.digitalAsset?.encryptedValue || template?.encryptedValue || null;

  const asset = await prisma.reward_digital_assets.upsert({
    where: { pledgeId: pledge.id },
    update: {
      assetType: fulfillmentType,
      assetUrl,
      encryptedValue,
      deliveryEmail: pledge.digitalAsset?.deliveryEmail || pledge.email || template?.deliveryEmail,
      status: "DELIVERED",
      deliveredAt: pledge.digitalAsset?.deliveredAt || new Date(),
      updatedAt: new Date(),
    },
    create: {
      rewardId: pledge.rewardId,
      campaignId: pledge.campaignId,
      pledgeId: pledge.id,
      assetType: fulfillmentType,
      assetUrl,
      encryptedValue,
      deliveryEmail: pledge.email || template?.deliveryEmail || null,
      status: "DELIVERED",
      deliveredAt: new Date(),
    },
  });

  await prisma.pledges.update({
    where: { id: pledge.id },
    data: { fulfillmentStatus: "DELIVERED", updatedAt: new Date() },
  });

  const itemTitle = pledge.rewards?.title?.trim() || "Sản phẩm số";
  if (pledge.userId) {
    notificationService.send({
      userId: pledge.userId,
      type: "PAYMENT_SUCCESS",
      title: "Đã vào kho đồ",
      message: `${itemTitle} đã vào kho đồ của bạn`,
      payload: {
        href: `/purchases?item=${encodeURIComponent(pledge.id)}`,
        pledgeId: pledge.id,
        extra: { rewardId: pledge.rewardId, rewardTitle: itemTitle },
      },
    });
  }

  return { granted: true as const, assetId: asset.id, itemTitle };
}

export async function revokeDigitalWarehouseItem(pledgeId: string) {
  await prisma.reward_digital_assets.updateMany({
    where: { pledgeId },
    data: { status: "REVOKED", updatedAt: new Date() },
  });
}
