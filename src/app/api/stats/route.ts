import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cacheGet, cacheSet, STATS_CACHE_KEY } from "@/lib/redis-cache";

/**
 * GET /api/stats
 * Get platform statistics with Redis caching (5 minutes TTL)
 */
export async function GET() {
    try {
        // Check if we have valid cached data in Redis
        const cachedStats = await cacheGet(STATS_CACHE_KEY);
        if (cachedStats) {
            return NextResponse.json(cachedStats, {
                headers: {
                    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
                }
            });
        }

        // Get total funds raised (sum of successful pledges)
        const totalFundsResult = await prisma.pledges.aggregate({
            where: {
                status: 'SUCCESS'
            },
            _sum: {
                amount: true
            }
        });

        // Get successful campaigns count
        const successfulCampaigns = await prisma.campaigns.count({
            where: {
                status: 'SUCCESS'
            }
        });

        // Get total unique backers (count distinct users who made successful pledges)
        const totalBackers = await prisma.pledges.findMany({
            where: {
                status: 'SUCCESS'
            },
            select: {
                userId: true,
                email: true
            },
            distinct: ['userId', 'email']
        });

        // Count unique backers (by userId or email for anonymous)
        const uniqueBackersSet = new Set<string>();
        totalBackers.forEach(pledge => {
            if (pledge.userId) {
                uniqueBackersSet.add(pledge.userId);
            } else if (pledge.email) {
                uniqueBackersSet.add(pledge.email);
            }
        });

        // Get active campaigns count
        const activeCampaigns = await prisma.campaigns.count({
            where: {
                status: 'ACTIVE'
            }
        });

        // Calculate total funds in VND
        const totalFunds = Number(totalFundsResult._sum.amount || 0);

        // Format total funds (convert to billions if > 1B)
        let totalFundsFormatted = '0';
        if (totalFunds >= 1_000_000_000) {
            totalFundsFormatted = `${(totalFunds / 1_000_000_000).toFixed(1)} tỷ`;
        } else if (totalFunds >= 1_000_000) {
            totalFundsFormatted = `${(totalFunds / 1_000_000).toFixed(1)} triệu`;
        } else {
            totalFundsFormatted = totalFunds.toLocaleString('vi-VN');
        }

        // Calculate transparency rate (successful campaigns / total campaigns)
        const totalCampaigns = await prisma.campaigns.count();
        const transparencyRate = totalCampaigns > 0
            ? ((successfulCampaigns / totalCampaigns) * 100).toFixed(1)
            : '0.0';

        const statsData = {
            totalFunds: totalFundsFormatted,
            totalFundsRaw: totalFunds,
            successfulCampaigns,
            activeCampaigns,
            totalBackers: uniqueBackersSet.size,
            transparencyRate: `${transparencyRate}%`,
            transparencyRateRaw: parseFloat(transparencyRate)
        };

        // Update Redis cache with 300s TTL (5 minutes)
        await cacheSet(STATS_CACHE_KEY, statsData, 300);

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