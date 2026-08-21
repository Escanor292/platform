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
    isActive: true,
    createdAt: true,
    _count: { select: { pledges: true } },
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
                    status: { in: ["ACTIVE", "SUCCESS", "DRAFT"] },
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
                },
                orderBy: { createdAt: "desc" },
            }),
        ]);

        const serializeRewards = (rewards: any[]) => rewards.map((reward) => ({
            ...reward,
            minAmount: Number(reward.minAmount),
            maxAmount: reward.maxAmount == null ? null : Number(reward.maxAmount),
            _count: reward._count,
        }));

        return NextResponse.json({
            campaigns: campaigns.map((campaign) => ({
                ...campaign,
                rewards: serializeRewards(campaign.rewards),
            })),
            projectsWithRewards: projects.map((project) => ({
                ...project,
                rewards: serializeRewards(project.rewards),
            })),
        });
    } catch (error) {
        console.error("[GET /api/rewards/my]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
