import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cacheReadThrough, STATS_CACHE_KEY } from "@/lib/redis-cache";

/**
 * GET /api/stats
 * Get platform statistics with Redis caching (5 minutes TTL)
 */
export async function GET() {
    try {
        const statsData = await cacheReadThrough(STATS_CACHE_KEY, 300, async () => {
        const totalFundsResult = await prisma.pledges.aggregate({
            where: {
                status: 'SUCCESS'
            },
            _sum: {
                amount: true
            }
        });

        const successfulCampaigns = await prisma.campaigns.count({
            where: {
                status: 'SUCCESS'
            }
        });

        const backerRows = await prisma.$queryRaw<Array<{ count: number }>>`
            SELECT COUNT(*)::int AS count FROM (
                SELECT COALESCE("userId", "email") AS who
                FROM pledges
                WHERE status::text = 'SUCCESS'
                  AND COALESCE("userId", "email") IS NOT NULL
                GROUP BY 1
            ) backers
        `;
        const totalBackers = Number(backerRows[0]?.count ?? 0);

        const activeCampaigns = await prisma.campaigns.count({
            where: {
                status: 'ACTIVE'
            }
        });

        const totalFunds = Number(totalFundsResult._sum.amount || 0);

        let totalFundsFormatted = '0';
        if (totalFunds >= 1_000_000_000) {
            totalFundsFormatted = `${(totalFunds / 1_000_000_000).toFixed(1)} tỷ`;
        } else if (totalFunds >= 1_000_000) {
            totalFundsFormatted = `${(totalFunds / 1_000_000).toFixed(1)} triệu`;
        } else {
            totalFundsFormatted = totalFunds.toLocaleString('vi-VN');
        }

        return {
            totalFunds: totalFundsFormatted,
            totalFundsRaw: totalFunds,
            successfulCampaigns,
            activeCampaigns,
            totalBackers
        };
        });

        return NextResponse.json(statsData, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
            }
        });
    } catch (error) {
        console.error("[GET /api/stats]", error);
        return NextResponse.json(
            { error: "Lỗi server khi lấy thống kê" },
            { status: 500 }
        );
    }
}