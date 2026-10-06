import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseCampaignFilters } from "@/lib/campaign-query-params";
import { CampaignListResponse, CampaignListItem } from "@/types/campaign";
import { calculateCompletionState } from "@/lib/campaign-helpers";
import {
  cacheReadThrough,
  buildCampaignsCacheKey,
} from "@/lib/redis-cache";
import { isPublicCampaignStatus, PUBLIC_CAMPAIGN_STATUSES } from "@/lib/moderation/policy";

export { POST } from "@/lib/campaign/create-campaign";

const userSelect = { id: true, name: true, avatar: true, status: true } as const;

type CampaignRow = {
  id: string;
  campaignCode: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string | null;
  creatorId: string;
  category: string;
  tags: string[];
  type: string;
  fundingModel: string;
  goalAmount: unknown;
  currentAmount: unknown;
  createdAt: Date;
  updatedAt: Date;
  startDate: Date | null;
  endDate: Date | null;
  status: string;
  isFeatured: boolean;
  users: { id: string; name: string | null; avatar: string | null; status: string | null };
  _count?: { pledges: number; campaign_followers: number };
};

function toListItem(campaign: CampaignRow): CampaignListItem {
  const progressPercent = Number(campaign.goalAmount) > 0
    ? Math.round((Number(campaign.currentAmount) / Number(campaign.goalAmount)) * 100)
    : 0;
  const completionState = calculateCompletionState(
    campaign.status as any,
    campaign.startDate,
    campaign.endDate,
    progressPercent
  );
  return {
    id: campaign.id,
    campaignCode: campaign.campaignCode,
    slug: campaign.slug,
    title: campaign.title,
    description: campaign.description,
    imageUrl: campaign.imageUrl,
    creatorId: campaign.creatorId,
    creatorName: campaign.users.name || "",
    creatorAvatar: campaign.users.avatar,
    creatorIsPro: campaign.users.status === "PRO",
    category: campaign.category,
    tags: campaign.tags,
    campaignType: campaign.type as any,
    fundingModel: campaign.fundingModel as any,
    goalAmount: Number(campaign.goalAmount),
    currentAmount: Number(campaign.currentAmount),
    progressPercent,
    totalBackers: campaign._count?.pledges ?? 0,
    totalFollowers: campaign._count?.campaign_followers ?? 0,
    totalViews: 0,
    ratingAverage: 0,
    ratingCount: 0,
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt,
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    status: campaign.status as any,
    completionState,
    isFeatured: campaign.isFeatured,
  };
}

async function attachPageCounts(items: CampaignListItem[]): Promise<CampaignListItem[]> {
  if (items.length === 0) return items;
  const ids = items.map((item) => item.id);
  const [pledges, followers] = await Promise.all([
    prisma.pledges.groupBy({
      by: ["campaignId"],
      where: { campaignId: { in: ids }, status: "SUCCESS" },
      _count: { id: true },
    }),
    prisma.campaign_followers.groupBy({
      by: ["campaignId"],
      where: { campaignId: { in: ids } },
      _count: { id: true },
    }),
  ]);
  const backers = new Map(pledges.map((row) => [row.campaignId, row._count.id]));
  const fans = new Map(followers.map((row) => [row.campaignId, row._count.id]));
  return items.map((item) => ({
    ...item,
    totalBackers: backers.get(item.id) ?? 0,
    totalFollowers: fans.get(item.id) ?? 0,
  }));
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryString = searchParams.toString();
    const cacheKey = buildCampaignsCacheKey(queryString);

    const response = await cacheReadThrough(cacheKey, 300, () => loadCampaignPage(searchParams));
    return NextResponse.json(response);
  } catch (error) {
    console.error("[GET /api/campaigns]", error);
    return NextResponse.json({ error: "Loi server khi tim kiem chien dich" }, { status: 500 });
  }
}

async function loadCampaignPage(searchParams: URLSearchParams): Promise<CampaignListResponse> {
  const filters = parseCampaignFilters(searchParams);
  const where: any = {};

  if (filters.q) {
    const query = filters.q.trim();
    where.OR = [
      { campaignCode: { contains: query, mode: "insensitive" } },
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ];
  }

  if (filters.category) where.category = filters.category;
  if (filters.campaignType) where.type = filters.campaignType;
  if (filters.fundingModel) where.fundingModel = filters.fundingModel;
  if (filters.isFeatured) where.isFeatured = true;
  if (filters.tags?.length) where.tags = { hasSome: filters.tags };
  if (filters.status && isPublicCampaignStatus(filters.status)) {
    where.status = filters.status;
  } else {
    where.status = { in: [...PUBLIC_CAMPAIGN_STATUSES] };
  }

  const projectIdFilter = searchParams.get("projectId");
  if (projectIdFilter) {
    if (projectIdFilter === "null" || projectIdFilter === "standalone") {
      where.projectId = null;
    } else {
      where.projectId = projectIdFilter;
    }
  }

  if (filters.createdWithin) {
    const now = new Date();
    let daysAgo = 30;
    switch (filters.createdWithin) {
      case "7d": daysAgo = 7; break;
      case "30d": daysAgo = 30; break;
      case "90d": daysAgo = 90; break;
      case "365d": daysAgo = 365; break;
    }
    where.createdAt = { gte: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000) };
  }

  const page = filters.page || 1;
  const limit = filters.limit || 12;
  const orderBy = getSortOrder(filters.sort || "newest");
  const needsMemoryFilter = filters.ratingMin != null
    || filters.progressMin !== undefined
    || filters.progressMax !== undefined
    || Boolean(filters.completionState);

  if (!needsMemoryFilter) {
    const [total, campaigns] = await prisma.$transaction([
      prisma.campaigns.count({ where }),
      prisma.campaigns.findMany({
        where,
        include: {
          users: { select: userSelect },
          _count: {
            select: {
              pledges: { where: { status: "SUCCESS" } },
              campaign_followers: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    const items = campaigns.map((campaign) => toListItem(campaign as CampaignRow));
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      appliedFilters: filters,
    };
  }

  const campaigns = await prisma.campaigns.findMany({
    where,
    select: {
      id: true,
      campaignCode: true,
      slug: true,
      title: true,
      description: true,
      imageUrl: true,
      creatorId: true,
      category: true,
      tags: true,
      type: true,
      fundingModel: true,
      goalAmount: true,
      currentAmount: true,
      createdAt: true,
      updatedAt: true,
      startDate: true,
      endDate: true,
      status: true,
      isFeatured: true,
      users: { select: userSelect },
    },
    orderBy,
  });

  let filteredItems = campaigns.map((campaign) => toListItem(campaign as CampaignRow));
  if (filters.ratingMin) filteredItems = filteredItems.filter((item) => item.ratingAverage >= filters.ratingMin!);
  if (filters.progressMin !== undefined) filteredItems = filteredItems.filter((item) => item.progressPercent >= filters.progressMin!);
  if (filters.progressMax !== undefined) filteredItems = filteredItems.filter((item) => item.progressPercent <= filters.progressMax!);
  if (filters.completionState) filteredItems = filteredItems.filter((item) => item.completionState === filters.completionState);

  const total = filteredItems.length;
  const start = (page - 1) * limit;
  const pageItems = await attachPageCounts(filteredItems.slice(start, start + limit));

  return {
    items: pageItems,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    appliedFilters: filters,
  };
}

function getSortOrder(sort: string): any {
  switch (sort) {
    case "newest": return { createdAt: "desc" };
    case "oldest": return { createdAt: "asc" };
    case "recently_updated": return { updatedAt: "desc" };
    case "ending_soon": return { endDate: "asc" };
    default: return { createdAt: "desc" };
  }
}
