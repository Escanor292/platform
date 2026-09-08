import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export async function createCodPledge(params: {
  userId: string | null;
  pledgeCampaignId: string | null;
  reward: { id: string; stock: number | null; fulfillmentType: string };
  quantity: number;
  charge: { baseAmount: number; shippingFee: number; platformFee: number };
  email: string;
  displayName: string;
  shippingAddress: string | null;
  shippingMethod: string;
  isAnonymous: boolean;
  ipAddress: string;
  now: Date;
}) {
  const { reward, quantity, charge, now } = params;
  return prisma.$transaction(async (tx) => {
    if (reward.stock !== null) {
      const stockUpdate = await tx.rewards.updateMany({
        where: { id: reward.id, isActive: true, stock: { gte: quantity } },
        data: { stock: { decrement: quantity }, updatedAt: now },
      });
      if (stockUpdate.count !== 1) throw new Error("San pham vua het ton kho, vui long thu lai");
    }
    return tx.pledges.create({
      data: {
        id: crypto.randomUUID(),
        userId: params.userId,
        campaignId: params.pledgeCampaignId,
        rewardId: reward.id,
        amount: new Decimal(charge.baseAmount),
        tipAmount: new Decimal(0),
        vatAmount: new Decimal(0),
        platformFee: new Decimal(charge.platformFee),
        totalAmount: new Decimal(charge.baseAmount + charge.shippingFee),
        depositAmount: new Decimal(0),
        chargeAmount: new Decimal(charge.baseAmount + charge.shippingFee),
        orderTotalAmount: new Decimal(charge.baseAmount + charge.shippingFee),
        remainingAmount: new Decimal(0),
        paidAmount: new Decimal(0),
        accountingAmount: new Decimal(0),
        email: params.email,
        displayName: params.displayName,
        shippingAddress: params.shippingAddress,
        shippingMethod: params.shippingMethod,
        shippingFee: new Decimal(charge.shippingFee),
        isAnonymous: params.isAnonymous,
        quantity,
        isCashOnDelivery: true,
        stockReserved: reward.stock !== null,
        fulfillmentType: reward.fulfillmentType,
        fulfillmentStatus: "PROCESSING",
        ipAddress: params.ipAddress,
        paymentProvider: "COD",
        transactionId: `COD-${crypto.randomUUID()}`,
        status: "PENDING",
        updatedAt: now,
      },
    });
  });
}
