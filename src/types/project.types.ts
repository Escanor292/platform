/**
 * Project Types - TypeScript Definitions
 * 
 * Type definitions for Project Hierarchy Management API
 * Projects are top-level portfolio entities that group Campaigns and Blog Posts
 */

// ============================================================
// API Request Types
// ============================================================

/**
 * Request payload for creating a new project
 */
export interface CreateProjectRequest {
    title: string;
    description?: string;
}

/**
 * Request payload for updating an existing project
 */
export interface UpdateProjectRequest {
    title?: string;
    description?: string;
}

// ============================================================
// API Response Types
// ============================================================

/**
 * Standard project response with counts
 */
export interface ProjectResponse {
    id: string;
    creatorId: string;
    title: string;
    description: string | null;
    createdAt: string; // ISO 8601 format
    updatedAt: string; // ISO 8601 format
    campaignCount: number;
    blogPostCount: number;
}

/**
 * Campaign summary for project detail response
 */
export interface ProjectCampaignSummary {
    id: string;
    title: string;
    slug: string;
    status: string;
    goalAmount: number;
    currentAmount: number;
    imageUrl: string | null;
}

/**
 * Blog post summary for project detail response
 */
export interface ProjectBlogPostSummary {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    coverImage: string | null;
    publishedAt: string | null; // ISO 8601 format
}

/**
 * Detailed project response with associated campaigns and blog posts
 */
export interface ProjectDetailResponse extends ProjectResponse {
    campaigns: ProjectCampaignSummary[];
    blogPosts: ProjectBlogPostSummary[];
}

/**
 * Paginated list of projects
 */
export interface ProjectListResponse {
    data: ProjectResponse[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// ============================================================
// Error Response Types
// ============================================================

/**
 * Standard error response structure
 */
export interface ErrorResponse {
    error: {
        message: string;
        code?: string;
        details?: any;
    };
}
