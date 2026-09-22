import { prisma } from "@/lib/prisma";
import type { LivePeriod, PresentationLiveStats } from "@/lib/admin-presentation-types";

export type { LivePeriod, PresentationLiveStats };

type PledgeRow = {
  id: string;
  userId: string | null;
  email: string | null;
  amount: unknown;
  tipAmount: unknown;
  platformFee: unknown;
  createdAt: Date;
  campaignId: string | null;
  campaigns: { type: "REWARD" | "DONATION" } | null;
};

function vnYmd(d = new Date()) {
  const s = d.toLocaleString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
  const [date] = s.split(" ");
  const [y, m, day] = date.split("-").map(Number);
  return { y, m: m - 1, day };
}

function vnStart(y: number, m: number, day = 1) {
  return new Date(Date.UTC(y, m, day) - 7 * 60 * 60 * 1000);
}

function uniqueBackers(rows: Array<{ id: string; userId: string | null; email: string | null }>) {
  const keys = new Set<string>();
  for (const row of rows) keys.add(row.userId || row.email || row.id);
  return keys.size;
}

function slicePeriod(
  label: string,
  from: Date | null,
  pledges: PledgeRow[],
  campaigns: Array<{ type: "REWARD" | "DONATION"; createdAt: Date; id: string }>,
  projectsCreated: Date[],
  usersCreated: Date[],
  certDates: Date[],
): LivePeriod {
  const inRange = (d: Date) => !from || d >= from;
  const pledgesIn = pledges.filter((p) => inRange(p.createdAt));
  const donation = pledgesIn.filter((p) => p.campaigns?.type === "DONATION");
  const reward = pledgesIn.filter((p) => p.campaigns?.type === "REWARD");
  const camps = campaigns.filter((c) => inRange(c.createdAt));
  const txIds = new Set(pledgesIn.map((p) => p.campaignId).filter(Boolean) as string[]);
  const sum = (rows: PledgeRow[], key: "amount" | "tipAmount" | "platformFee") =>
    rows.reduce((acc, row) => acc + Number(row[key] || 0), 0);

  return {
    label,
    fromIso: from ? from.toISOString() : "",
    projects: projectsCreated.filter(inRange).length,
    campaigns: camps.length,
    campaignsReward: camps.filter((c) => c.type === "REWARD").length,
    campaignsDonation: camps.filter((c) => c.type === "DONATION").length,
    campaignsWithTx: txIds.size,
    donationPledges: donation.length,
    donationBackers: uniqueBackers(donation),
    donationAmount: sum(donation, "amount"),
    donationTip: sum(donation, "tipAmount"),
    rewardPledges: reward.length,
    rewardBackers: uniqueBackers(reward),
    rewardAmount: sum(reward, "amount"),
    platformFee: sum(pledgesIn, "platformFee"),
    certificates: certDates.filter(inRange).length,
    usersNew: usersCreated.filter(inRange).length,
  };
}

export async function getPresentationLiveStats(): Promise<PresentationLiveStats> {
  const { y, m } = vnYmd();
  const q = Math.floor(m / 3);
  const qStart = vnStart(y, q * 3);
  const yStart = vnStart(y, 0);
  const quarterLabel = `Quý ${q + 1}/${y}`;

  const [pledges, campaigns, projectDates, userDates, certDates, snapshot] = await Promise.all([
    prisma.pledges.findMany({
      where: { status: "SUCCESS" },
      select: {
        id: true,
        userId: true,
        email: true,
        amount: true,
        tipAmount: true,
        platformFee: true,
        createdAt: true,
        campaignId: true,
        campaigns: { select: { type: true } },
      },
    }),
    prisma.campaigns.findMany({
      select: { id: true, type: true, status: true, createdAt: true },
    }),
    prisma.projects.findMany({ select: { createdAt: true } }).then((rows) => rows.map((r) => r.createdAt)),
    prisma.users.findMany({ select: { createdAt: true } }).then((rows) => rows.map((r) => r.createdAt)),
    prisma.donation_certificates.findMany({ select: { issuedAt: true } }).then((rows) => rows.map((r) => r.issuedAt)),
    Promise.all([
      prisma.users.count(),
      prisma.projects.count(),
      prisma.campaigns.count({ where: { status: "ACTIVE" } }),
      prisma.campaigns.count({ where: { status: "ACTIVE", type: "REWARD" } }),
      prisma.campaigns.count({ where: { status: "ACTIVE", type: "DONATION" } }),
    ]),
  ]);

  const [users, projects, campaignsActive, campaignsRewardActive, campaignsDonationActive] = snapshot;

  return {
    generatedAt: new Date().toISOString(),
    quarterLabel,
    snapshot: {
      users,
      projects,
      campaignsActive,
      campaignsRewardActive,
      campaignsDonationActive,
    },
    quarter: slicePeriod(quarterLabel, qStart, pledges, campaigns, projectDates, userDates, certDates),
    year: slicePeriod(`Năm ${y}`, yStart, pledges, campaigns, projectDates, userDates, certDates),
    all: slicePeriod("Từ đầu", null, pledges, campaigns, projectDates, userDates, certDates),
  };
}
