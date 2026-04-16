import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseProjectFilters } from "@/lib/project-query-params";
import { ProjectListResponse, ProjectListItem } from "@/types/project";
import { calculateCompletionState } from "@/lib/project-helpers";

/**
 * GET /api/projects
 * Search and filter projects from database
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Parse filters from query params
    const filters = parseProjectFilters(searchParams);
    
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
    const campaigns = await prisma.campaign.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
            isPro: true,
          }
        },
        _count: {
          select: {
            pledges: {
              where: { status: 'SUCCESS' }
            }
          }
        }
      },
      orderBy: getSortOrder(filters.sort || 'newest'),
    });
    
    // Transform to ProjectListItem format
    const items: ProjectListItem[] = campaigns.map((campaign) => {
      const progressPercent = campaign.goalAmount > 0 
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
        creatorName: campaign.creator.name,
        creatorAvatar: campaign.creator.avatar,
        creatorIsPro: campaign.creator.isPro,
        
        category: campaign.category,
        tags: campaign.tags,
        campaignType: campaign.type as any,
        
        goalAmount: Number(campaign.goalAmount),
        currentAmount: Number(campaign.currentAmount),
        progressPercent,
        
        totalBackers: campaign._count.pledges,
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
    const response: ProjectListResponse = {
      items: paginatedItems,
      total,
      page,
      limit,
      totalPages,
      appliedFilters: filters,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("[GET /api/projects]", error);
    return NextResponse.json(
      { error: "Lỗi server khi tìm kiếm dự án" },
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
