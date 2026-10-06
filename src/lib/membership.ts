import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { buildTransferContent, getEscrowBankAccount } from "@/lib/payment/escrow-account";
import { MIN_DONATION_AMOUNT } from "@/lib/payment/pledge-charge";

export const MAX_ACTIVE_TIERS = 4;

export function addOneMonth(from: Date) {
  const next = new Date(from.getTime());
  const day = next.getDate();
  next.setMonth(next.getMonth() + 1);
  if (next.getDate() < day) next.setDate(0);
  return next;
}

export function canPublishTiers(user: { role?: string | null; isAdmin?: boolean | null }) {
  return user.role === "CREATOR" || user.role === "ADMIN" || user.isAdmin === true;
}

function transferView(pledge: { id: string; amount: unknown; transactionId: string }, transferContent: string) {
  const escrow = getEscrowBankAccount();
  return {
    pledgeId: pledge.id,
    amount: Number(pledge.amount),
    transactionId: pledge.transactionId,
    transferContent,
    bankName: escrow.bankName,
    accountNumber: escrow.accountNumber,
    accountHolder: escrow.accountHolder,
    confirmationUrl: `/payment-success?ref=${encodeURIComponent(pledge.transactionId)}`,
  };
}

export async function createMembershipPledge(params: {
  userId: string;
  email: string;
  name: string;
  tierId: string;
  isAnonymous: boolean;
  ipAddress: string;
}) {
  const tier = await prisma.support_tiers.findUnique({
    where: { id: params.tierId },
    include: { users: { select: { id: true, name: true, displayName: true } } },
  });
  if (!tier || !tier.isActive) {
    return { ok: false as const, status: 404, error: "Mức ủng hộ không còn mở" };
  }
  if (tier.creatorId === params.userId) {
    return { ok: false as const, status: 400, error: "Không ủng hộ dài lâu cho chính mình" };
  }
  const amount = Number(tier.amount);
  if (!Number.isFinite(amount) || amount < MIN_DONATION_AMOUNT) {
    return { ok: false as const, status: 400, error: "Mức ủng hộ không hợp lệ" };
  }

  const open = await prisma.pledges.findFirst({
    where: {
      userId: params.userId,
      status: "PENDING",
      pledgeKind: "MEMBERSHIP",
      support_tiers: { creatorId: tier.creatorId },
    },
    select: { id: true, amount: true, transactionId: true, payosOrderCode: true },
  });
  if (open) {
    return {
      ok: true as const,
      reused: true,
      creatorName: tier.users.displayName || tier.users.name,
      ...transferView(open, open.payosOrderCode || buildTransferContent(open.id)),
    };
  }

  const current = await prisma.memberships.findUnique({
    where: { supporterId_creatorId: { supporterId: params.userId, creatorId: tier.creatorId } },
    select: { status: true, currentPeriodEnd: true },
  });
  const stillCovered = current?.status === "ACTIVE"
    && current.currentPeriodEnd
    && current.currentPeriodEnd.getTime() > Date.now() + 7 * 24 * 60 * 60 * 1000;
  if (stillCovered) {
    return { ok: false as const, status: 409, error: "Kỳ hiện tại còn hơn 7 ngày. Hãy gia hạn khi gần hết hạn." };
  }

  const now = new Date();
  const pledge = await prisma.pledges.create({
    data: {
      id: crypto.randomUUID(),
      userId: params.userId,
      campaignId: null,
      rewardId: null,
      amount: new Decimal(amount),
      tipAmount: new Decimal(0),
      vatAmount: new Decimal(0),
      platformFee: new Decimal(0),
      totalAmount: new Decimal(amount),
      depositAmount: new Decimal(0),
      chargeAmount: new Decimal(amount),
      orderTotalAmount: new Decimal(amount),
      remainingAmount: new Decimal(0),
      paidAmount: new Decimal(0),
      accountingAmount: new Decimal(0),
      email: params.email,
      displayName: params.isAnonymous ? "Người ủng hộ ẩn danh" : params.name.slice(0, 120),
      isAnonymous: params.isAnonymous,
      quantity: 1,
      fulfillmentStatus: "NOT_APPLICABLE",
      ipAddress: params.ipAddress,
      paymentProvider: "BANK_ESCROW",
      transactionId: `ESCROW-${crypto.randomUUID()}`,
      status: "PENDING",
      pledgeKind: "MEMBERSHIP",
      tierId: tier.id,
      updatedAt: now,
    },
    select: { id: true, amount: true, transactionId: true },
  });
  const transferContent = buildTransferContent(pledge.id);
  await prisma.pledges.update({
    where: { id: pledge.id },
    data: { payosOrderCode: transferContent.replace(/\s/g, ""), updatedAt: new Date() },
  });
  return {
    ok: true as const,
    reused: false,
    creatorName: tier.users.displayName || tier.users.name,
    tierTitle: tier.title,
    ...transferView(pledge, transferContent),
  };
}

export async function activateMembershipFromPledge(pledgeId: string) {
  const pledge = await prisma.pledges.findUnique({
    where: { id: pledgeId },
    select: {
      id: true,
      userId: true,
      status: true,
      pledgeKind: true,
      tierId: true,
      isAnonymous: true,
      periodEnd: true,
      support_tiers: { select: { id: true, creatorId: true, title: true } },
    },
  });
  if (!pledge || pledge.status !== "SUCCESS" || pledge.pledgeKind !== "MEMBERSHIP" || !pledge.userId || !pledge.support_tiers) {
    return false;
  }
  if (pledge.periodEnd) return true;

  const now = new Date();
  const creatorId = pledge.support_tiers.creatorId;
  const supporterId = pledge.userId;
  await prisma.$transaction(async (tx) => {
    const existing = await tx.memberships.findUnique({
      where: { supporterId_creatorId: { supporterId, creatorId } },
    });
    const base = existing?.status === "ACTIVE" && existing.currentPeriodEnd && existing.currentPeriodEnd > now
      ? existing.currentPeriodEnd
      : now;
    const periodEnd = addOneMonth(base);
    const membershipId = existing?.id || crypto.randomUUID();
    const claimed = await tx.pledges.updateMany({
      where: { id: pledge.id, pledgeKind: "MEMBERSHIP", periodEnd: null },
      data: { membershipId, periodStart: base, periodEnd, updatedAt: now },
    });
    if (claimed.count !== 1) return;
    if (existing) {
      await tx.memberships.update({
        where: { id: existing.id },
        data: {
          tierId: pledge.support_tiers!.id,
          status: "ACTIVE",
          currentPeriodEnd: periodEnd,
          canceledAt: null,
          lastReminderAt: null,
          isAnonymous: pledge.isAnonymous,
          updatedAt: now,
        },
      });
    } else {
      await tx.memberships.create({
        data: {
          id: membershipId,
          supporterId,
          creatorId,
          tierId: pledge.support_tiers!.id,
          status: "ACTIVE",
          currentPeriodEnd: periodEnd,
          isAnonymous: pledge.isAnonymous,
          updatedAt: now,
        },
      });
    }
  });
  return true;
}
