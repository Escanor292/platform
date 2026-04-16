/**
 * Project/Campaign Types for Discovery Page
 */

export type CampaignStatus = 
  | "DRAFT" 
  | "PENDING_REVIEW" 
  | "ACTIVE" 
  | "PAUSED" 
  | "COMPLETED" 
  | "FAILED" 
  | "CANCELED";

export type CampaignType = 
  | "REWARD" 
  | "DONATION" 
  | "EQUITY" 
  | "SUBSCRIPTION" 
  | "PREORDER";

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

export interface ProjectListItem {
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
  
  // Funding
  goalAmount: number;
  currentAmount: number;
  progressPercent: number;
  
  // Engagement
  totalBackers: number;
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

export interface ProjectFilters {
  q?: string;                   // Search query
  sort?: SortOption;
  category?: string;
  campaignType?: CampaignType;
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

export interface ProjectListResponse {
  items: ProjectListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  appliedFilters: ProjectFilters;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

// Helper type for active filter chips
export interface ActiveFilter {
  key: keyof ProjectFilters;
  value: string | number | boolean;
  label: string;
}
