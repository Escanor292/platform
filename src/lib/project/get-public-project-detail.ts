import { prisma } from "@/lib/prisma";
import { campaignRaisedAmount, sumProjectMoney } from "@/lib/money-buckets";
import { unionCatalogRewards } from "@/lib/project/project-catalog";
import type { PublicCampaign, PublicProjectDetail, PublicReward } from "@/types/project-detail";

const rewardSelect = {
    id: true,
    campaignId: true,
    projectId: true,
    title: true,
    description: true,
    minAmount: true,
    productImages: true,
    isIncludedInProject: true,
    maxQuantity: true,
    deliveryDate: true,
    isPreorder: true,
    onlineDepositPercent: true,
    codDepositPercent: true,
    isActive: true,
    createdAt: true,
    fulfillmentType: true,
} as const;

function toNumber(value: { toNumber?: () => number } | number | string | null | undefined): number {
    if (value == null) return 0;
    if (typeof value === "number") return value;
    if (typeof value === "string") return Number(value) || 0;
    if (typeof value.toNumber === "function") return value.toNumber();
    return Number(value) || 0;
}

function toIso(value: Date | string | null | undefined): string | null {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function firstImage(productImages: unknown): string | null {
    return Array.isArray(productImages) && typeof productImages[0] === "string" && productImages[0]
        ? productImages[0]
        : null;
}

function mapReward(
    reward: {
        id: string;
        campaignId: string | null;
        projectId: string | null;
        title: string;
        description: string | null;
        minAmount: { toNumber?: () => number } | number | string;
        productImages: unknown;
        isIncludedInProject: boolean;
        maxQuantity: number | null;
        deliveryDate: Date | null;
        isPreorder: boolean;
        isActive: boolean;
        createdAt: Date;
        fulfillmentType: string;
        onlineDepositPercent?: number | null;
        codDepositPercent?: number | null;
    },
    campaign?: {
        id: string;
        slug: string;
        title: string;
        status: string;
        type: string;
    } | null,
): PublicReward {
    return {
        id: reward.id,
        title: reward.title,
        description: reward.description,
        minAmount: toNumber(reward.minAmount),
        imageUrl: firstImage(reward.productImages),
        isIncludedInProject: reward.isIncludedInProject !== false,
        maxQuantity: reward.maxQuantity,
        deliveryDate: toIso(reward.deliveryDate),
        isPreorder: Boolean(reward.isPreorder),
        isActive: reward.isActive !== false,
        createdAt: toIso(reward.createdAt) || new Date(0).toISOString(),
        fulfillmentType: reward.fulfillmentType || null,
        campaignId: campaign?.id ?? reward.campaignId ?? null,
        campaignSlug: campaign?.slug ?? null,
        campaignTitle: campaign?.title ?? null,
        campaignStatus: campaign?.status ?? null,
        campaignType: campaign?.type ?? null,
        projectId: reward.projectId ?? null,
    };
}

export async function getPublicProjectDetail(projectId: string): Promise<PublicProjectDetail | null> {
    const project = await prisma.projects.findUnique({
        where: { id: projectId },
        include: {
            campaigns: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    status: true,
                    type: true,
                    goalAmount: true,
                    currentAmount: true,
                    closedAmount: true,
                    imageUrl: true,
                    createdAt: true,
                    startDate: true,
                    endDate: true,
                    rewards: {
                        select: rewardSelect,
                        orderBy: { createdAt: "asc" },
                    },
                },
                orderBy: { createdAt: "desc" },
            },
            blog_posts: {
                where: { status: "PUBLISHED", visibility: "PUBLIC" },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    excerpt: true,
                    coverImage: true,
                    publishedAt: true,
                },
                orderBy: { createdAt: "desc" },
            },
            project_reward_links: {
                select: { rewardId: true, order: true },
                orderBy: { order: "asc" },
            },
            project_blog_links: {
                include: {
                    blog_posts: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            excerpt: true,
                            coverImage: true,
                            publishedAt: true,
                            status: true,
                            visibility: true,
                        },
                    },
                },
                orderBy: { order: "asc" },
            },
            rewards: {
                select: rewardSelect,
                orderBy: { createdAt: "asc" },
            },
        },
    });

    if (!project) return null;

    const linkedRewardIds = project.project_reward_links.map((link) => link.rewardId);
    const campaignById = new Map(project.campaigns.map((campaign) => [campaign.id, campaign]));
    const campaignRewards = project.campaigns.flatMap((campaign) =>
        campaign.rewards.map((reward) => mapReward(reward, campaign)),
    );
    const ownedRewards = project.rewards.map((reward) =>
        mapReward(reward, reward.campaignId ? campaignById.get(reward.campaignId) ?? null : null),
    );

    const missingLinkedIds = linkedRewardIds.filter((id) =>
        !campaignRewards.some((reward) => reward.id === id) &&
        !ownedRewards.some((reward) => reward.id === id),
    );
    const linkedRewards = missingLinkedIds.length
        ? await prisma.rewards.findMany({
            where: { id: { in: missingLinkedIds } },
            select: {
                ...rewardSelect,
                campaigns: {
                    select: { id: true, slug: true, title: true, status: true, type: true },
                },
            },
        })
        : [];

    const catalogRewards = unionCatalogRewards([
        campaignRewards,
        ownedRewards,
        linkedRewards.map((reward) => mapReward(reward, reward.campaigns)),
    ]);

    const money = await sumProjectMoney(project.id);
    const campaigns: PublicCampaign[] = project.campaigns.map((campaign) => ({
        id: campaign.id,
        title: campaign.title,
        slug: campaign.slug,
        status: campaign.status,
        type: campaign.type,
        goalAmount: toNumber(campaign.goalAmount),
        currentAmount: toNumber(campaign.currentAmount),
        closedAmount: campaign.closedAmount != null ? toNumber(campaign.closedAmount) : null,
        raisedAmount: campaignRaisedAmount(campaign),
        imageUrl: campaign.imageUrl,
        createdAt: toIso(campaign.createdAt) || new Date(0).toISOString(),
        startDate: toIso(campaign.startDate),
        endDate: toIso(campaign.endDate),
        rewards: campaign.rewards.map((reward) => mapReward(reward, campaign)),
    }));

    const ownedBlogPosts = project.blog_posts.map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        publishedAt: toIso(post.publishedAt),
    }));
    const linkedBlogPosts = project.project_blog_links
        .map((link) => link.blog_posts)
        .filter((post): post is NonNullable<typeof post> => post !== null)
        .filter((post) => post.status === "PUBLISHED" && (post.visibility === "PUBLIC" || !post.visibility))
        .filter((post) => !ownedBlogPosts.some((owned) => owned.id === post.id))
        .map((post) => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            coverImage: post.coverImage,
            publishedAt: toIso(post.publishedAt),
        }));

    return {
        id: project.id,
        creatorId: project.creatorId,
        title: project.title,
        slug: project.slug,
        description: project.description,
        coverImage: project.coverImage,
        richDescription: project.richDescription,
        heroBackgroundType: project.heroBackgroundType,
        heroBackgroundConfig: project.heroBackgroundConfig,
        linkedBlogPostIds: project.project_blog_links.map((link) => link.blogPostId),
        linkedRewardIds,
        createdAt: toIso(project.createdAt) || new Date(0).toISOString(),
        updatedAt: toIso(project.updatedAt) || new Date(0).toISOString(),
        campaignCount: project.campaigns.length,
        blogPostCount: Math.max(ownedBlogPosts.length, project.project_blog_links.length),
        campaignTotal: money.campaignTotal,
        productTotal: money.productTotal,
        projectTotal: money.projectTotal,
        isLocked: project.isLocked,
        campaigns,
        blogPosts: [...ownedBlogPosts, ...linkedBlogPosts],
        catalogRewards,
    };
}
