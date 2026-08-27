import prisma from "@/lib/prisma";
import { notificationService } from "@/services/mongodb/notification.service";
import type { RewardFulfillmentType } from "../../prisma/generated/client";

export const DIGITAL_FULFILLMENT_TYPES = ["EMAIL", "DOWNLOAD", "LICENSE_KEY", "DIGITAL_COMIC"] as const;
export type DigitalFulfillmentType = (typeof DIGITAL_FULFILLMENT_TYPES)[number];
export type WarehouseCategory = "all" | "game" | "comic" | "image" | "video" | "ebook" | "key" | "other";

export function isDigitalFulfillment(type?: string | null): type is DigitalFulfillmentType {
  return DIGITAL_FULFILLMENT_TYPES.includes(type as DigitalFulfillmentType);
}

export function warehouseCategory(type?: string | null, title?: string | null): Exclude<WarehouseCategory, "all"> {
  const haystack = `${type || ""} ${title || ""}`.toLowerCase();
  if (type === "LICENSE_KEY" || /\bgame\b|steam|key|bản quyền/.test(haystack)) return "game";
  if (type === "DIGITAL_COMIC" || /truyện|comic|manga|webtoon/.test(haystack)) return "comic";
  if (/ảnh|image|art pack|wallpaper|poster/.test(haystack)) return "image";
  if (/video|phim|clip/.test(haystack)) return "video";
  if (/ebook|pdf|sách|epub/.test(haystack)) return "ebook";
  if (type === "LICENSE_KEY") return "key";
  return "other";
}

export function warehouseCategoryLabel(category: WarehouseCategory) {
  const labels: Record<WarehouseCategory, string> = {
    all: "Tất cả",
    game: "Game",
    comic: "Truyện tranh",
    image: "Ảnh / pack",
    video: "Video",
    ebook: "Ebook",
    key: "Mã bản quyền",
    other: "Khác",
  };
  return labels[category];
}

/**
 * Ghi sản phẩm số vào kho đồ của tài khoản sau khi thanh toán thành công.
 * Dùng bảng reward_digital_assets hiện có làm entitlement — không cần migration.
 */
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
      type: "WAREHOUSE_ITEM_ADDED",
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
