import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { buildTransferContent, getEscrowBankAccount } from "@/lib/payment/escrow-account";

export async function createEscrowPledge(params: {
  userId: string | null;
  pledgeCampaignId: string | null;
  reward: { id: string; stock: number | null; fulfillmentType: string } | null;
  quantity: number;
  charge: {
    baseAmount: number;
    tipAmount: number;
    vatAmount: number;
    platformFee: number;
    totalAmount: number;
    depositAmount: number;
    chargeAmount: number;
    remainingAmount: number;
    shippingFee: number;
  };
  email: string | null;
  displayName: string;
  shippingAddress: string | null;
  shippingMethod: string;
  isAnonymous: boolean;
  isCod: boolean;
  ipAddress: string;
  now: Date;
}) {
  const { reward, quantity, charge, now } = params;
  const pledge = await prisma.$transaction(async (tx) => {
    let stockReserved = false;
    if (reward && reward.stock !== null) {
      const stockUpdate = await tx.rewards.updateMany({
        where: { id: reward.id, isActive: true, stock: { gte: quantity } },
        data: { stock: { decrement: quantity }, updatedAt: now },
      });
      if (stockUpdate.count !== 1) throw new Error("San pham vua het ton kho, vui long thu lai");
      stockReserved = true;
    }
    return tx.pledges.create({
      data: {
        id: crypto.randomUUID(),
        userId: params.userId,
        campaignId: params.pledgeCampaignId,
        rewardId: reward?.id || null,
        amount: new Decimal(charge.baseAmount),
        tipAmount: new Decimal(charge.tipAmount),
        vatAmount: new Decimal(charge.vatAmount),
        platformFee: new Decimal(charge.platformFee),
        totalAmount: new Decimal(charge.totalAmount),
        depositAmount: new Decimal(charge.depositAmount),
        chargeAmount: new Decimal(charge.chargeAmount),
        orderTotalAmount: new Decimal(charge.totalAmount),
        remainingAmount: new Decimal(charge.remainingAmount),
        paidAmount: new Decimal(0),
        accountingAmount: new Decimal(0),
        email: params.email,
        displayName: params.displayName,
        shippingAddress: params.shippingAddress,
        shippingMethod: params.shippingMethod,
        shippingFee: new Decimal(charge.shippingFee),
        isAnonymous: params.isAnonymous,
        quantity,
        isCashOnDelivery: params.isCod,
        stockReserved,
        fulfillmentType: reward?.fulfillmentType ?? null,
        fulfillmentStatus: reward ? "AWAITING_PAYMENT" : "NOT_APPLICABLE",
        ipAddress: params.ipAddress,
        paymentProvider: params.isCod ? "BANK_ESCROW_DEPOSIT" : "BANK_ESCROW",
        transactionId: `ESCROW-${crypto.randomUUID()}`,
        status: "PENDING",
        updatedAt: now,
      },
    });
  });

  const transferContent = buildTransferContent(pledge.id);
  const escrow = getEscrowBankAccount();
  await prisma.pledges.update({
    where: { id: pledge.id },
    data: { payosOrderCode: transferContent.replace(/\s/g, ""), updatedAt: new Date() },
  });
  return { pledge, transferContent, escrow };
}
