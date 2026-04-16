import { NextRequest, NextResponse } from "next/server";
import { mockProjects } from "@/data/mock-projects";
import { parseProjectFilters } from "@/lib/project-query-params";
import { applyProjectFilters, paginateProjects } from "@/lib/project-filters";
import { ProjectListResponse } from "@/types/project";

/**
 * GET /api/projects
 * Search and filter projects
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Parse filters from query params
    const filters = parseProjectFilters(searchParams);
    
    // Apply filters
    const filteredProjects = applyProjectFilters(mockProjects, filters);
    
    // Paginate
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const { items, total, totalPages } = paginateProjects(filteredProjects, page, limit);
    
    // Build response
    const response: ProjectListResponse = {
      items,
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
