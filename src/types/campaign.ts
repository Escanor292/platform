/**
 * Campaign Types for Discovery Page
 * 
 * ✅ REFACTORED: File đã được đổi tên từ 'project.ts' thành 'campaign.ts'
 * ✅ Type names đã đồng bộ với database entity 'campaigns'
 */

export type CampaignStatus =
    | "DRAFT"
    | "PENDING_REVIEW"
    | "ACTIVE"
    | "SUCCESS"
    | "FAILED"
    | "CANCELED"
    | "PAUSED"
    | "COMPLETED";

export type CampaignType =
    | "REWARD"
    | "DONATION";

export type FundingModel =
    | "ALL_OR_NOTHING"
    | "KEEP_IT_ALL";

export type CompletionState =
    | "NOT_STARTED"      // Chưa bắt đầu
    | "ONGOING"          // Đang gây quỹ
    | "GOAL_REACHED"     // Đã đạt mục tiêu
    | "COMPLETED"        // Đã hoàn thành
    | "FAILED"           // Kết thúc không đạt mục tiêu
    | "PAUSED";          // Tạm dừng

export type SortOption =
    | "newest"           // Mới nhất
    | "oldest"           // Cũ nhất
    | "most_viewed"      // Nhiều lượt xem nhất
    | "top_rated"        // Đánh giá cao nhất
    | "most_backed"      // Nhiều người ủng hộ nhất
    | "highest_progress" // Tiến độ cao nhất
    | "ending_soon"      // Sắp kết thúc
    | "recently_updated"; // Mới cập nhật

export type MainCategory =
    | "Giáo dục"
    | "Y tế"
    | "Cộng đồng"
    | "Công nghệ"
    | "Nghệ thuật"
    | "Môi trường"
    | "Nông nghiệp"
    | "Giải trí"
    | "Kinh doanh"
    | "Khẩn cấp & Từ thiện";

export interface CampaignListItem {
    id: string;
    campaignCode: string;        // CF-20260416-ABC12
    slug: string;
    title: string;
    description: string;          // Short description
    imageUrl: string | null;

    // Creator info
    creatorId: string;
    creatorName: string;
    creatorAvatar: string | null;
    creatorIsPro: boolean;

    // Taxonomy
    category: string;             // Main category
    tags: string[];               // Starter tags
    campaignType: CampaignType;
    fundingModel: FundingModel;

    // Funding
    goalAmount: number;
    currentAmount: number;
    progressPercent: number;

    // Engagement
    totalBackers: number;
    totalFollowers: number;
    totalViews: number;
    ratingAverage: number;
    ratingCount: number;

    // Dates - can be Date or string (from API)
    createdAt: Date | string;
    updatedAt: Date | string;
    startDate: Date | string | null;
    endDate: Date | string | null;

    // Status
    status: CampaignStatus;
    completionState: CompletionState;
    isFeatured: boolean;
}

export interface CampaignFilters {
    q?: string;                   // Search query
    sort?: SortOption;
    category?: string;
    campaignType?: CampaignType;
    fundingModel?: FundingModel;
    tags?: string[];
    status?: CampaignStatus;
    completionState?: CompletionState;
    ratingMin?: number;           // 3, 4, 5
    createdWithin?: string;       // 7d, 30d, 90d, 365d
    progressMin?: number;         // 0, 25, 50, 75, 100
    progressMax?: number;
    isFeatured?: boolean;
    page?: number;
    limit?: number;
}

export interface CampaignListResponse {
    items: CampaignListItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    appliedFilters: CampaignFilters;
}

export interface FilterOption {
    value: string;
    label: string;
    count?: number;
}

// Helper type for active filter chips
export interface ActiveFilter {
    key: keyof CampaignFilters;
    value: string | number | boolean;
    label: string;
}

// ============================================
// BACKWARD COMPATIBILITY EXPORTS
// ============================================
// TODO: Remove these after all imports are updated

/**
 * @deprecated Use CampaignListItem instead
 */
export type ProjectListItem = CampaignListItem;

/**
 * @deprecated Use CampaignFilters instead
 */
export type ProjectFilters = CampaignFilters;

/**
 * @deprecated Use CampaignListResponse instead
 */
export type ProjectListResponse = CampaignListResponse;

