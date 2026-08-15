import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseCampaignFilters } from "@/lib/campaign-query-params";
import { CampaignListResponse, CampaignListItem } from "@/types/campaign";
import { calculateCompletionState } from "@/lib/campaign-helpers";
import { auth } from "@/lib/auth";
import { projectIdSchema } from "@/lib/project/project.validation";
import {
  checkAuthentication,
  handleServiceError,
  validationErrorResponse,
  forbiddenResponse
} from "@/lib/project/project.response-handlers";
import { z } from "zod";

/**
 * GET /api/campaigns
 * Search and filter campaigns from database
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Parse filters from query params
    const filters = parseCampaignFilters(searchParams);

    // Build Prisma where clause
    const where: any = {};

    // Search filter
    if (filters.q) {
      const query = filters.q.trim().toLowerCase();
      where.OR = [
        { campaignCode: { contains: query, mode: 'insensitive' } },
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    // Category filter
    if (filters.category) {
      where.category = filters.category;
    }

    // Campaign type filter
    if (filters.campaignType) {
      where.type = filters.campaignType;
    }

    // Status filter
    if (filters.status) {
      where.status = filters.status;
    }

    // Project filter - Validates Requirements 11.1, 11.2, 11.5
    const projectIdFilter = searchParams.get('projectId');
    if (projectIdFilter) {
      if (projectIdFilter === 'null' || projectIdFilter === 'standalone') {
        // Filter for campaigns with NULL projectId (standalone campaigns)
        where.projectId = null;
      } else {
        // Filter for campaigns with specific projectId
        where.projectId = projectIdFilter;
      }
    }

    // Created within filter
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

    // Fetch campaigns from database
    const campaigns = await prisma.campaigns.findMany({
      where,
      include: {
        users: {
          select: {
            id: true,
            name: true,
            avatar: true,
            status: true,
          }
        },
        _count: {
          select: {
            pledges: {
              where: { status: 'SUCCESS' }
            },
            campaign_followers: true
          }
        }
      },
      orderBy: getSortOrder(filters.sort || 'newest'),
    });

    // Transform to CampaignListItem format
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
        totalViews: 0, // TODO: Implement view tracking
        ratingAverage: 0, // TODO: Calculate from reviews
        ratingCount: 0, // TODO: Count reviews

        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
        startDate: campaign.startDate,
        endDate: campaign.endDate,

        status: campaign.status as any,
        completionState,
        isFeatured: false, // TODO: Add featured flag to schema
      };
    });

    // Apply client-side filters that can't be done in Prisma
    let filteredItems = items;

    // Rating filter
    if (filters.ratingMin) {
      filteredItems = filteredItems.filter(item => item.ratingAverage >= filters.ratingMin!);
    }

    // Progress filter
    if (filters.progressMin !== undefined) {
      filteredItems = filteredItems.filter(item => item.progressPercent >= filters.progressMin!);
    }
    if (filters.progressMax !== undefined) {
      filteredItems = filteredItems.filter(item => item.progressPercent <= filters.progressMax!);
    }

    // Completion state filter
    if (filters.completionState) {
      filteredItems = filteredItems.filter(item => item.completionState === filters.completionState);
    }

    // Featured filter
    if (filters.isFeatured) {
      filteredItems = filteredItems.filter(item => item.isFeatured);
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const total = filteredItems.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedItems = filteredItems.slice(start, end);

    // Build response
    const response: CampaignListResponse = {
      items: paginatedItems,
      total,
      page,
      limit,
      totalPages,
      appliedFilters: filters,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[GET /api/campaigns]", error);
    return NextResponse.json(
      { error: "Lỗi server khi tìm kiếm chiến dịch" },
      { status: 500 }
    );
  }
}

function getSortOrder(sort: string): any {
  switch (sort) {
    case 'newest':
      return { createdAt: 'desc' };
    case 'oldest':
      return { createdAt: 'asc' };
    case 'recently_updated':
      return { updatedAt: 'desc' };
    case 'ending_soon':
      return { endDate: 'asc' };
    default:
      return { createdAt: 'desc' };
  }
}

/**
 * POST /api/campaigns
 * Create a new campaign with optional project association
 * Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    const authError = checkAuthentication(session);
    if (authError) return authError;

    const userId = session!.user!.id;

    // Parse request body
    const body = await req.json();
    const { projectId, ...campaignData } = body;

    // Validate projectId if provided
    if (projectId !== undefined && projectId !== null) {
      // Validate projectId format (CUID)
      try {
        projectIdSchema.parse(projectId);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return validationErrorResponse('Invalid project ID');
        }
        throw error;
      }

      // Validate project exists and is owned by authenticated user
      const project = await prisma.projects.findUnique({
        where: { id: projectId },
        select: { creatorId: true },
      });

      if (!project) {
        return validationErrorResponse('Invalid project ID');
      }

      if (project.creatorId !== userId) {
        return forbiddenResponse('Not authorized to add campaigns to this project');
      }
    }

    // Create campaign with optional projectId
    const campaign = await prisma.campaigns.create({
      data: {
        ...campaignData,
        creatorId: userId,
        projectId: projectId || null, // Set to NULL if not provided
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error("[POST /api/campaigns]", error);
    return handleServiceError(error);
  }
}
