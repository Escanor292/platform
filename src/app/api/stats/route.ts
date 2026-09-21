import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cacheGet, cacheSet, STATS_CACHE_KEY } from "@/lib/redis-cache";
import { LIVE_PLEDGE } from "@/lib/money-buckets";
import { NOT_TEST_FIXTURE } from "@/lib/moderation/policy";

function formatFunds(totalFunds: number) {
  if (totalFunds >= 1_000_000_000) return `${(totalFunds / 1_000_000_000).toFixed(1)} tỷ`;
  if (totalFunds >= 1_000_000) return `${(totalFunds / 1_000_000).toFixed(1)} triệu`;
  return totalFunds.toLocaleString("vi-VN");
}

export async function GET() {
  try {
    const cachedStats = await cacheGet(STATS_CACHE_KEY);
    if (cachedStats) {
      return NextResponse.json(cachedStats, {
        headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
      });
    }

    const [campaigns, livePledges] = await Promise.all([
      prisma.campaigns.findMany({
        where: {
          status: { in: ["ACTIVE", "SUCCESS"] },
          ...NOT_TEST_FIXTURE,
        },
        select: { status: true, currentAmount: true, goalAmount: true },
      }),
      prisma.pledges.findMany({
        where: {
          ...LIVE_PLEDGE,
          AND: [
            { paymentProvider: { notIn: ["TEST", "DEMO"] } },
            { NOT: { transactionId: { startsWith: "FIXTURE" } } },
            { campaigns: NOT_TEST_FIXTURE },
          ],
        },
        select: { userId: true, email: true, accountingAmount: true },
      }),
    ]);

    const totalFunds = livePledges.reduce(
      (sum, pledge) => sum + Number(pledge.accountingAmount || 0),
      0,
    );
    const activeCampaigns = campaigns.filter((campaign) => campaign.status === "ACTIVE").length;
    const successfulCampaigns = campaigns.filter((campaign) => campaign.status === "SUCCESS").length;
    const goalReachedCampaigns = campaigns.filter((campaign) => {
      const goal = Number(campaign.goalAmount || 0);
      return goal > 0 && Number(campaign.currentAmount || 0) >= goal;
    }).length;

    const uniqueBackers = new Set<string>();
    for (const pledge of livePledges) {
      if (pledge.userId) uniqueBackers.add(`u:${pledge.userId}`);
      else if (pledge.email) uniqueBackers.add(`e:${pledge.email.toLowerCase()}`);
    }

    const statsData = {
      totalFunds: formatFunds(totalFunds),
      totalFundsRaw: totalFunds,
      successfulCampaigns,
      goalReachedCampaigns,
      activeCampaigns,
      totalBackers: uniqueBackers.size,
    };

    await cacheSet(STATS_CACHE_KEY, statsData, 300);

    return NextResponse.json(statsData, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (error) {
    console.error("[GET /api/stats]", error);
    return NextResponse.json({ error: "Lỗi server khi lấy thống kê" }, { status: 500 });
  }
}
