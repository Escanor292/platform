import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const rewardSelect = {
    id: true,
    campaignId: true,
    projectId: true,
    title: true,
    description: true,
    minAmount: true,
    maxAmount: true,
    productImages: true,
    deliveryDate: true,
    isPreorder: true,
    onlineDepositPercent: true,
    codDepositPercent: true,
    availability: true,
    fulfillmentType: true,
    isActive: true,
    createdAt: true,
    product_reviews: { select: { rating: true } },
    _count: {
        select: {
            pledges: { where: { status: "SUCCESS" } },
            product_reviews: true,
        },
    },
} as const;

/** GET /api/rewards/my - Danh sách sản phẩm thật của creator để chèn vào bài viết. */
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const creatorId = (session.user as any).id;
        const [campaigns, projects] = await Promise.all([
            prisma.campaigns.findMany({
                where: {
                    creatorId,
                },
                select: {
                    id: true,
                    slug: true,
                    title: true,
                    type: true,
                    status: true,
                    projectId: true,
                    rewards: {
                        select: rewardSelect,
                        where: { isActive: true },
                        orderBy: { createdAt: "asc" },
                    },
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.projects.findMany({
                where: { creatorId },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    createdAt: true,
                    rewards: {
                        select: rewardSelect,
                        where: { isActive: true },
                        orderBy: { createdAt: "asc" },
                    },
                    project_reward_links: {
                        select: {
                            rewards: { select: rewardSelect },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            }),
        ]);

        const serializeRewards = (rewards: any[]) => rewards.map((reward) => ({
            ...reward,
            averageRating: reward.product_reviews?.length ? Number(reward.product_reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0) / reward.product_reviews.length) : null,
            reviewCount: reward._count?.product_reviews ?? 0,
            soldCount: reward._count?.pledges ?? 0,
            minAmount: Number(reward.minAmount),
            maxAmount: reward.maxAmount == null ? null : Number(reward.maxAmount),
            imageUrl: Array.isArray(reward.productImages) && reward.productImages.length > 0 ? reward.productImages[0] : null,
            _count: reward._count,
        }));

        return NextResponse.json({
            campaigns: campaigns.map((campaign) => ({
                ...campaign,
                rewards: serializeRewards(campaign.rewards),
            })),
            projectsWithRewards: projects.map((project) => {
                const { project_reward_links, rewards, ...rest } = project;
                const linked = project_reward_links
                    .map((link) => link.rewards)
                    .filter((item): item is NonNullable<typeof item> => Boolean(item));
                const byId = new Map<string, any>();
                for (const item of [...rewards, ...linked]) {
                    if (item?.isActive === false) continue;
                    byId.set(item.id, item);
                }
                return {
                    ...rest,
                    rewards: serializeRewards([...byId.values()]),
                };
            }),
        });
    } catch (error) {
        console.error("[GET /api/rewards/my]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
