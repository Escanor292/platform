import { randomUUID } from "crypto";
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

export const DEMO_WAREHOUSE_USER_ID = "cmphnhw8e0002so1uh16dwpvn";

const DEMO_ITEMS: Array<{
  slug: string;
  title: string;
  description: string;
  fulfillmentType: RewardFulfillmentType;
  amount: number;
  assetUrl?: string;
  licenseKey?: string;
  cover: string;
}> = [
  {
    slug: "game",
    title: "Pixel Grove — Game offline",
    description: "Demo game digital cho kho đồ.",
    fulfillmentType: "LICENSE_KEY",
    amount: 99000,
    licenseKey: "TUTE-GROVE-8821-DEMO",
    cover: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80",
  },
  {
    slug: "comic",
    title: "Truyện tranh Tử Tế — Tập 1",
    description: "Bộ truyện tranh số đọc ngay trong kho đồ.",
    fulfillmentType: "DIGITAL_COMIC",
    amount: 45000,
    assetUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    cover: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&w=400&q=80",
  },
  {
    slug: "image",
    title: "Pack ảnh minh họa 20 tấm",
    description: "Tải pack ảnh digital.",
    fulfillmentType: "DOWNLOAD",
    amount: 29000,
    assetUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1200&q=80",
    cover: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=400&q=80",
  },
  {
    slug: "video",
    title: "Video hậu trường dự án",
    description: "Clip digital xem online.",
    fulfillmentType: "DOWNLOAD",
    amount: 39000,
    assetUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    cover: "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=400&q=80",
  },
  {
    slug: "ebook",
    title: "Ebook hướng dẫn góp vốn",
    description: "Sách điện tử PDF.",
    fulfillmentType: "DOWNLOAD",
    amount: 59000,
    assetUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80",
  },
];

export async function seedDemoWarehouseItems(userId = DEMO_WAREHOUSE_USER_ID) {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, displayName: true },
  });
  if (!user) return { seeded: false as const, reason: "user-not-found", count: 0 };

  const campaign = await prisma.campaigns.findFirst({
    where: { OR: [{ creatorId: userId }, { status: "ACTIVE" }] },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  let created = 0;
  for (const item of DEMO_ITEMS) {
    const transactionId = `demo-wh-${userId}-${item.slug}`;
    const existing = await prisma.pledges.findUnique({ where: { transactionId }, select: { id: true } });
    if (existing) continue;

    const reward = await prisma.rewards.create({
      data: {
        id: randomUUID(),
        campaignId: campaign?.id || null,
        title: item.title,
        description: item.description,
        minAmount: item.amount,
        fulfillmentType: item.fulfillmentType,
        productImages: [item.cover],
        isActive: true,
        updatedAt: new Date(),
      },
    });

    const pledge = await prisma.pledges.create({
      data: {
        id: randomUUID(),
        campaignId: campaign?.id || null,
        userId,
        displayName: user.displayName || user.name || "Backer demo",
        email: user.email,
        quantity: 1,
        amount: item.amount,
        totalAmount: item.amount,
        paidAmount: item.amount,
        chargeAmount: item.amount,
        orderTotalAmount: item.amount,
        accountingAmount: item.amount,
        paymentProvider: "DEMO",
        transactionId,
        status: "SUCCESS",
        rewardId: reward.id,
        fulfillmentType: item.fulfillmentType,
        fulfillmentStatus: "DELIVERED",
        updatedAt: new Date(),
      },
    });

    await prisma.reward_digital_assets.create({
      data: {
        rewardId: reward.id,
        campaignId: campaign?.id || null,
        pledgeId: pledge.id,
        assetType: item.fulfillmentType,
        assetUrl: item.assetUrl || null,
        encryptedValue: item.licenseKey || null,
        deliveryEmail: user.email,
        status: "DELIVERED",
        deliveredAt: new Date(),
      },
    });

    notificationService.send({
      userId,
      type: "PAYMENT_SUCCESS",
      title: "Đã vào kho đồ",
      message: `${item.title} đã vào kho đồ của bạn`,
      payload: {
        href: `/purchases?item=${encodeURIComponent(pledge.id)}`,
        pledgeId: pledge.id,
        extra: { rewardId: reward.id, rewardTitle: item.title },
      },
    });
    created += 1;
  }

  return { seeded: true as const, count: created };
}

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
