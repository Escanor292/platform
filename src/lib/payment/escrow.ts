import prisma from "@/lib/prisma";
import { recalculateCampaignAmount } from "@/lib/order-fulfillment";

/**
 * Cap nhat so da gop cua chien dich theo so pledges con hieu luc.
 * Khong dong chien dich khi du goal — dong theo endDate.
 */
export async function releaseEscrow(campaignId: string) {
  try {
    const totalRaised = await prisma.$transaction(async (tx) => {
      return recalculateCampaignAmount(tx, campaignId);
    });

    return { success: true, totalRaised: Number(totalRaised) };
  } catch (error) {
    console.error("[ESCROW_ERROR]", error);
    return { success: false, error };
  }
}
