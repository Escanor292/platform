"use server";

import prisma from "@/lib/prisma";
import { generateTxRef } from "@/lib/utils";

interface PledgeInput {
  campaignId: string;
  rewardId?: string;
  amount: number;
  platformTipPercent?: number;
  isAnonymous?: boolean;
  displayName?: string;
  guestEmail?: string;
  userId?: string;
}

/**
 * Server Action: Tạo pledge mới (ủng hộ campaign)
 * Có thể dùng từ Client Component hoặc Server Component
 */
export async function createPledgeAction(input: PledgeInput) {
  const {
    campaignId,
    rewardId,
    amount,
    platformTipPercent = 5,
    isAnonymous = false,
    displayName,
    guestEmail,
    userId,
  } = input;

  // Validate campaign
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) throw new Error("Không tìm thấy campaign");
  if (campaign.status !== "ACTIVE") throw new Error("Campaign không còn nhận ủng hộ");

  const tipAmount = Math.round((amount * platformTipPercent) / 100);
  const totalAmount = amount + tipAmount;

  // Tạo pledge
  const pledge = await prisma.pledge.create({
    data: {
      campaignId,
      rewardId: rewardId || undefined,
      userId: userId || undefined,
      amount: totalAmount,
      projectAmount: amount,
      platformTipAmount: tipAmount,
      vatAmount: 0,
      isAnonymous,
      displayName: isAnonymous ? null : (displayName || null),
      guestEmail: guestEmail || null,
      isReleased: false,
    },
  });

  // Tạo transaction record
  await prisma.transaction.create({
    data: {
      amount: totalAmount,
      type: "PLEDGE",
      status: "PENDING",
      referenceCode: generateTxRef("PLG"),
      campaignId,
      userId: userId || null,
      pledgeId: pledge.id,
    },
  });

  return { pledgeId: pledge.id };
}

/**
 * Server Action: Hủy pledge (trong vòng 24h)
 */
export async function cancelPledgeAction(pledgeId: string, userId: string) {
  const pledge = await prisma.pledge.findUnique({
    where: { id: pledgeId },
    include: { payment: true },
  });

  if (!pledge) throw new Error("Không tìm thấy pledge");
  if (pledge.userId !== userId) throw new Error("Không có quyền hủy pledge này");

  const hoursSinceCreated =
    (Date.now() - new Date(pledge.createdAt).getTime()) / (1000 * 60 * 60);

  if (hoursSinceCreated > 24) {
    throw new Error("Chỉ có thể hủy trong vòng 24 giờ sau khi ủng hộ");
  }

  if (pledge.isReleased) {
    throw new Error("Tiền đã được giải ngân, không thể hủy");
  }

  // Soft delete pledge
  await prisma.pledge.update({
    where: { id: pledgeId },
    data: { isReleased: false },
  });

  // Cập nhật currentAmount campaign
  await prisma.campaign.update({
    where: { id: pledge.campaignId },
    data: { currentAmount: { decrement: pledge.amount } },
  });

  return { success: true };
}
