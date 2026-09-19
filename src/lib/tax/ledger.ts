import { prisma } from "@/lib/prisma";
import {
  buildLedgerRows,
  classifyMoneyFlow,
  creatorNetEstimate,
  yearlyThresholdWarning,
  type MoneyFlow,
} from "@/lib/tax/money-flow";

function toNumber(value: unknown) {
  return Number(value || 0);
}

export async function creatorTaxReport(creatorId: string, year = new Date().getFullYear()) {
  const from = new Date(`${year}-01-01T00:00:00+07:00`);
  const to = new Date(`${year + 1}-01-01T00:00:00+07:00`);

  const pledges = await prisma.pledges.findMany({
    where: {
      status: "SUCCESS",
      createdAt: { gte: from, lt: to },
      campaigns: { creatorId },
    },
    include: {
      campaigns: { select: { id: true, title: true, slug: true, feeRate: true } },
      rewards: { select: { title: true, isPreorder: true, fulfillmentType: true } },
      donation_certificate: { select: { code: true, documentKind: true } },
      backer_invoices: { select: { invoiceNumber: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = pledges.map((pledge) => {
    const flow = classifyMoneyFlow({ rewardId: pledge.rewardId, isPreorder: pledge.rewards?.isPreorder });
    const gross = toNumber(pledge.amount);
    const fee = toNumber(pledge.platformFee) || Math.round(gross * (pledge.campaigns?.feeRate ?? 0.08));
    return {
      pledgeId: pledge.id,
      createdAt: pledge.createdAt.toISOString(),
      campaignTitle: pledge.campaigns?.title || "",
      campaignSlug: pledge.campaigns?.slug || "",
      rewardTitle: pledge.rewards?.title || "Ủng hộ không nhận quà",
      fulfillmentType: pledge.fulfillmentType || pledge.rewards?.fulfillmentType || null,
      flow,
      gross,
      platformFee: fee,
      netEstimate: creatorNetEstimate(gross, fee),
      certificateCode: pledge.donation_certificate?.code || null,
      documentKind: pledge.donation_certificate?.documentKind || null,
      invoiceNumber: pledge.backer_invoices?.invoiceNumber || null,
    };
  });

  const byFlow = rows.reduce<Record<MoneyFlow, { count: number; gross: number; fee: number; net: number }>>((acc, row) => {
    const bucket = acc[row.flow] || { count: 0, gross: 0, fee: 0, net: 0 };
    bucket.count += 1;
    bucket.gross += row.gross;
    bucket.fee += row.platformFee;
    bucket.net += row.netEstimate;
    acc[row.flow] = bucket;
    return acc;
  }, {} as Record<MoneyFlow, { count: number; gross: number; fee: number; net: number }>);

  const yearGross = rows.reduce((sum, row) => sum + row.gross, 0);
  return {
    year,
    rows,
    byFlow,
    totals: {
      count: rows.length,
      gross: yearGross,
      fee: rows.reduce((sum, row) => sum + row.platformFee, 0),
      net: rows.reduce((sum, row) => sum + row.netEstimate, 0),
    },
    threshold: yearlyThresholdWarning(yearGross),
  };
}

export async function platformTaxLedgers(limit = 50) {
  const pledges = await prisma.pledges.findMany({
    where: { status: "SUCCESS" },
    include: {
      campaigns: { select: { title: true, feeRate: true, users: { select: { name: true } } } },
      rewards: { select: { isPreorder: true } },
      donation_certificate: { select: { code: true, documentKind: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const aggregates = await prisma.pledges.aggregate({
    where: { status: "SUCCESS" },
    _sum: { amount: true, tipAmount: true, platformFee: true, vatAmount: true },
    _count: true,
  });

  return {
    totals: {
      count: aggregates._count,
      backerGross: toNumber(aggregates._sum.amount),
      tip: toNumber(aggregates._sum.tipAmount),
      platformFee: toNumber(aggregates._sum.platformFee),
      vatOnTip: toNumber(aggregates._sum.vatAmount),
    },
    entries: pledges.map((pledge) => {
      const flow = classifyMoneyFlow({ rewardId: pledge.rewardId, isPreorder: pledge.rewards?.isPreorder });
      return {
        ...buildLedgerRows({
          flow,
          grossAmount: toNumber(pledge.amount),
          tipAmount: toNumber(pledge.tipAmount),
          platformFeeRate: pledge.campaigns?.feeRate ?? 0.08,
        }),
        pledgeId: pledge.id,
        createdAt: pledge.createdAt.toISOString(),
        campaignTitle: pledge.campaigns?.title || "",
        creatorName: pledge.campaigns?.users?.name || "",
        certificateCode: pledge.donation_certificate?.code || null,
      };
    }),
  };
}

export async function backerTaxDocuments(userId: string, email?: string | null) {
  await import("@/lib/tax/certificate").then(({ claimCertificatesForUser }) =>
    claimCertificatesForUser({ id: userId, email })
  );

  return prisma.donation_certificates.findMany({
    where: {
      status: { not: "REVOKED" },
      OR: [
        { backerUserId: userId },
        { claimedByUserId: userId },
        email ? { guestEmail: email.trim().toLowerCase() } : undefined,
      ].filter(Boolean) as object[],
    },
    include: {
      campaigns: { select: { title: true, slug: true } },
      pledges: { select: { transactionId: true, status: true } },
    },
    orderBy: { issuedAt: "desc" },
  });
}

export function toCsv(rows: Array<Record<string, string | number | null>>) {
  if (rows.length === 0) return "empty\n";
  const headers = Object.keys(rows[0]);
  const escape = (value: string | number | null) => {
    const text = value == null ? "" : String(value);
    if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
    return text;
  };
  return [headers.join(","), ...rows.map((row) => headers.map((key) => escape(row[key])).join(","))].join("\n");
}
