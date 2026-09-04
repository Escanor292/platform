import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseCampaignFilters } from "@/lib/campaign-query-params";
import { CampaignListResponse, CampaignListItem } from "@/types/campaign";
import { calculateCompletionState } from "@/lib/campaign-helpers";
import { generateUniqueCampaignCode, generateUniqueCampaignSlug } from "@/lib/campaign-utils";
import { auth } from "@/lib/auth";
import { projectIdSchema } from "@/lib/project/project.validation";
import {
  checkAuthentication,
  handleServiceError,
  validationErrorResponse,
  forbiddenResponse
} from "@/lib/project/project.response-handlers";
import { z } from "zod";
import {
  cacheGet,
  cacheSet,
  buildCampaignsCacheKey,
  CAMPAIGNS_CACHE_PREFIX,
  cacheInvalidatePrefix,
} from "@/lib/redis-cache";
import { persistRichText, RichTextValidationError, isRichTextEmpty } from "@/lib/editor/persist";
import { assertCleanContent } from "@/lib/moderation";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryString = searchParams.toString();
    const cacheKey = buildCampaignsCacheKey(queryString);

    const cachedResponse = await cacheGet<CampaignListResponse>(cacheKey);
    if (cachedResponse) {
      return NextResponse.json(cachedResponse);
    }

    const filters = parseCampaignFilters(searchParams);
    const where: any = {};

    if (filters.q) {
      const query = filters.q.trim().toLowerCase();
      where.OR = [
        { campaignCode: { contains: query, mode: 'insensitive' } },
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (filters.category) where.category = filters.category;
    if (filters.campaignType) where.type = filters.campaignType;
    if (filters.status) where.status = filters.status;

    const projectIdFilter = searchParams.get('projectId');
    if (projectIdFilter) {
      if (projectIdFilter === 'null' || projectIdFilter === 'standalone') {
        where.projectId = null;
      } else {
        where.projectId = projectIdFilter;
      }
    }

    if (filters.createdWithin) {
      const now = new Date();
      let daysAgo = 30;
      switch (filters.createdWithin) {
        case '7d': daysAgo = 7; break;
        case '30d': daysAgo = 30; break;
        case '90d': daysAgo = 90; break;
        case '365d': daysAgo = 365; break;
      }
      const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      where.createdAt = { gte: cutoffDate };
    }

    const campaigns = await prisma.campaigns.findMany({
      where,
      include: {
        users: { select: { id: true, name: true, avatar: true, status: true } },
        _count: {
          select: {
            pledges: { where: { status: 'SUCCESS' } },
            campaign_followers: true
          }
        }
      },
      orderBy: getSortOrder(filters.sort || 'newest'),
    });

    const items: CampaignListItem[] = campaigns.map((campaign) => {
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
        creatorName: campaign.users.name,
        creatorAvatar: campaign.users.avatar,
        creatorIsPro: campaign.users.status === "PRO",
        category: campaign.category,
        tags: campaign.tags,
        campaignType: campaign.type as any,
        goalAmount: Number(campaign.goalAmount),
        currentAmount: Number(campaign.currentAmount),
        progressPercent,
        totalBackers: campaign._count.pledges,
        totalFollowers: campaign._count.campaign_followers,
        totalViews: 0,
        ratingAverage: 0,
        ratingCount: 0,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        status: campaign.status as any,
        completionState,
        isFeatured: false,
      };
    });

    let filteredItems = items;
    if (filters.ratingMin) filteredItems = filteredItems.filter(item => item.ratingAverage >= filters.ratingMin!);
    if (filters.progressMin !== undefined) filteredItems = filteredItems.filter(item => item.progressPercent >= filters.progressMin!);
    if (filters.progressMax !== undefined) filteredItems = filteredItems.filter(item => item.progressPercent <= filters.progressMax!);
    if (filters.completionState) filteredItems = filteredItems.filter(item => item.completionState === filters.completionState);
    if (filters.isFeatured) filteredItems = filteredItems.filter(item => item.isFeatured);

    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const total = filteredItems.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedItems = filteredItems.slice(start, start + limit);

    const response: CampaignListResponse = {
      items: paginatedItems,
      total,
      page,
      limit,
      totalPages,
      appliedFilters: filters,
    };

    await cacheSet(cacheKey, response, 300);
    return NextResponse.json(response);
  } catch (error) {
    console.error("[GET /api/campaigns]", error);
    return NextResponse.json({ error: "Lỗi server khi tìm kiếm chiến dịch" }, { status: 500 });
  }
}

function getSortOrder(sort: string): any {
  switch (sort) {
    case 'newest': return { createdAt: 'desc' };
    case 'oldest': return { createdAt: 'asc' };
    case 'recently_updated': return { updatedAt: 'desc' };
    case 'ending_soon': return { endDate: 'asc' };
    default: return { createdAt: 'desc' };
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const authError = checkAuthentication(session);
    if (authError) return authError;

    const userId = session!.user!.id;
    const body = await req.json();
    const { projectId } = body;

    if (projectId !== undefined && projectId !== null) {
      try {
        projectIdSchema.parse(projectId);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return validationErrorResponse('Invalid project ID');
        }
        throw error;
      }

      const project = await prisma.projects.findUnique({
        where: { id: projectId },
        select: { creatorId: true },
      });

      if (!project) return validationErrorResponse('Invalid project ID');
      if (project.creatorId !== userId) {
        return forbiddenResponse('Not authorized to add campaigns to this project');
      }
    }

    const title = String(body.title || '').trim();
    const tagline = String(body.tagline || '').trim();
    const category = body.mainCategory || body.category;
    const goalAmount = Number(body.goalAmount);

    if (!title) return validationErrorResponse('Tên chiến dịch là bắt buộc');
    if (!tagline) return validationErrorResponse('Mô tả ngắn là bắt buộc');
    if (!category) return validationErrorResponse('Danh mục là bắt buộc');
    if (!goalAmount || goalAmount <= 0) return validationErrorResponse('Số vốn mục tiêu không hợp lệ');

    try {
      await assertCleanContent([title, tagline, body.description, body.richDescription]);
    } catch (error: any) {
      return validationErrorResponse(error.message || 'Nội dung chứa từ bị cấm');
    }

    let longDescription = '';
    try {
      longDescription = persistRichText(body.description || body.longDescription || '');
    } catch (error) {
      if (error instanceof RichTextValidationError) {
        return validationErrorResponse(error.message);
      }
      throw error;
    }

    if (isRichTextEmpty(longDescription)) {
      return validationErrorResponse('Nội dung chi tiết là bắt buộc');
    }

    const [campaignCode, slug] = await Promise.all([
      generateUniqueCampaignCode(),
      generateUniqueCampaignSlug(title),
    ]);

    const campaign = await prisma.campaigns.create({
      data: {
        id: crypto.randomUUID(),
        campaignCode,
        slug,
        title,
        description: tagline,
        longDescription,
        goalAmount,
        category,
        tags: body.starterTags || body.tags || [],
        imageUrl: body.imageUrl || null,
        images: body.images || [],
        videoUrl: body.videoUrl || null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        creatorId: userId,
        projectId: projectId || null,
        updatedAt: new Date(),
      },
    });

    if (Array.isArray(body.linkedBlogIds) && body.linkedBlogIds.length > 0) {
      await prisma.campaign_blog_links.createMany({
        data: body.linkedBlogIds.map((blogId: string, index: number) => ({
          id: crypto.randomUUID(),
          campaignId: campaign.id,
          blogPostId: blogId,
          order: index,
        })),
      });
    }

    await cacheInvalidatePrefix(CAMPAIGNS_CACHE_PREFIX);
    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error("[POST /api/campaigns]", error);
    return handleServiceError(error);
  }
}
