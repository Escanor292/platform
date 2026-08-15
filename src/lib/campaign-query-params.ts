/**
 * Query Params Helpers for Campaign Filters
 */

import { CampaignFilters, SortOption, CampaignStatus, CampaignType, CompletionState } from "@/types/campaign";

/**
 * Parse query params from URL to CampaignFilters
 */
export function parseCampaignFilters(searchParams: URLSearchParams): CampaignFilters {
  const filters: CampaignFilters = {};

  // Search query
  const q = searchParams.get("q");
  if (q) filters.q = q.trim();

  // Sort
  const sort = searchParams.get("sort") as SortOption;
  if (sort && isValidSortOption(sort)) filters.sort = sort;

  // Category
  const category = searchParams.get("category");
  if (category) filters.category = category;

  // Campaign type
  const campaignType = searchParams.get("campaignType") as CampaignType;
  if (campaignType && isValidCampaignType(campaignType)) {
    filters.campaignType = campaignType;
  }

  // Status
  const status = searchParams.get("status") as CampaignStatus;
  if (status && isValidStatus(status)) filters.status = status;

  // Completion state
  const completionState = searchParams.get("completionState") as CompletionState;
  if (completionState && isValidCompletionState(completionState)) {
    filters.completionState = completionState;
  }

  // Rating min
  const ratingMin = searchParams.get("ratingMin");
  if (ratingMin) {
    const rating = parseInt(ratingMin, 10);
    if (!isNaN(rating) && rating >= 1 && rating <= 5) {
      filters.ratingMin = rating;
    }
  }

  // Created within
  const createdWithin = searchParams.get("createdWithin");
  if (createdWithin && isValidTimeRange(createdWithin)) {
    filters.createdWithin = createdWithin;
  }

  // Progress range
  const progressMin = searchParams.get("progressMin");
  if (progressMin) {
    const progress = parseInt(progressMin, 10);
    if (!isNaN(progress) && progress >= 0 && progress <= 100) {
      filters.progressMin = progress;
    }
  }

  const progressMax = searchParams.get("progressMax");
  if (progressMax) {
    const progress = parseInt(progressMax, 10);
    if (!isNaN(progress) && progress >= 0 && progress <= 100) {
      filters.progressMax = progress;
    }
  }

  // Featured
  const isFeatured = searchParams.get("isFeatured");
  if (isFeatured === "true") filters.isFeatured = true;

  // Pagination
  const page = searchParams.get("page");
  if (page) {
    const pageNum = parseInt(page, 10);
    if (!isNaN(pageNum) && pageNum > 0) filters.page = pageNum;
  }

  const limit = searchParams.get("limit");
  if (limit) {
    const limitNum = parseInt(limit, 10);
    if (!isNaN(limitNum) && limitNum > 0 && limitNum <= 100) {
      filters.limit = limitNum;
    }
  }

  return filters;
}

/**
 * Convert CampaignFilters to URL search params
 */
export function filtersToSearchParams(filters: CampaignFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.q) params.set("q", filters.q);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.category) params.set("category", filters.category);
  if (filters.campaignType) params.set("campaignType", filters.campaignType);
  if (filters.status) params.set("status", filters.status);
  if (filters.completionState) params.set("completionState", filters.completionState);
  if (filters.ratingMin) params.set("ratingMin", filters.ratingMin.toString());
  if (filters.createdWithin) params.set("createdWithin", filters.createdWithin);
  if (filters.progressMin !== undefined) params.set("progressMin", filters.progressMin.toString());
  if (filters.progressMax !== undefined) params.set("progressMax", filters.progressMax.toString());
  if (filters.isFeatured) params.set("isFeatured", "true");
  if (filters.page && filters.page > 1) params.set("page", filters.page.toString());
  if (filters.limit) params.set("limit", filters.limit.toString());

  return params;
}

/**
 * Validation helpers
 */
function isValidSortOption(value: string): value is SortOption {
  const validOptions: SortOption[] = [
    "newest", "oldest", "most_viewed", "top_rated",
    "most_backed", "highest_progress", "ending_soon", "recently_updated"
  ];
  return validOptions.includes(value as SortOption);
}

function isValidCampaignType(value: string): value is CampaignType {
  const validTypes: CampaignType[] = ["REWARD", "DONATION", "EQUITY", "SUBSCRIPTION", "PREORDER"];
  return validTypes.includes(value as CampaignType);
}

function isValidStatus(value: string): value is CampaignStatus {
  const validStatuses: CampaignStatus[] = [
    "DRAFT", "PENDING_REVIEW", "ACTIVE", "PAUSED", "COMPLETED", "FAILED", "CANCELED"
  ];
  return validStatuses.includes(value as CampaignStatus);
}

function isValidCompletionState(value: string): value is CompletionState {
  const validStates: CompletionState[] = [
    "NOT_STARTED", "ONGOING", "GOAL_REACHED", "COMPLETED", "FAILED", "PAUSED"
  ];
  return validStates.includes(value as CompletionState);
}

function isValidTimeRange(value: string): boolean {
  return ["7d", "30d", "90d", "365d"].includes(value);
}

/**
 * Get human-readable filter labels
 */
export function getFilterLabel(key: keyof CampaignFilters, value: any): string {
  switch (key) {
    case "sort":
      return getSortLabel(value);
    case "category":
      return value;
    case "campaignType":
      return getCampaignTypeLabel(value);
    case "status":
      return getStatusLabel(value);
    case "completionState":
      return getCompletionStateLabel(value);
    case "ratingMin":
      return `${value}+ sao`;
    case "createdWithin":
      return getTimeRangeLabel(value);
    case "progressMin":
      return `Tiến độ ≥ ${value}%`;
    case "progressMax":
      return `Tiến độ ≤ ${value}%`;
    case "isFeatured":
      return "Nổi bật";
    default:
      return String(value);
  }
}

function getSortLabel(sort: SortOption): string {
  const labels: Record<SortOption, string> = {
    newest: "Mới nhất",
    oldest: "Cũ nhất",
    most_viewed: "Nhiều lượt xem",
    top_rated: "Đánh giá cao",
    most_backed: "Nhiều người ủng hộ",
    highest_progress: "Tiến độ cao",
    ending_soon: "Sắp kết thúc",
    recently_updated: "Mới cập nhật",
  };
  return labels[sort];
}

function getCampaignTypeLabel(type: CampaignType): string {
  const labels: Record<CampaignType, string> = {
    REWARD: "Reward-based",
    DONATION: "Donation-based",
    EQUITY: "Equity-based",
    SUBSCRIPTION: "Subscription",
    PREORDER: "Pre-order",
  };
  return labels[type];
}

function getStatusLabel(status: CampaignStatus): string {
  const labels: Record<CampaignStatus, string> = {
    DRAFT: "Nháp",
    PENDING_REVIEW: "Chờ duyệt",
    ACTIVE: "Đang hoạt động",
    PAUSED: "Tạm dừng",
    COMPLETED: "Hoàn thành",
    FAILED: "Thất bại",
    CANCELED: "Đã hủy",
  };
  return labels[status];
}

function getCompletionStateLabel(state: CompletionState): string {
  const labels: Record<CompletionState, string> = {
    NOT_STARTED: "Chưa bắt đầu",
    ONGOING: "Đang gây quỹ",
    GOAL_REACHED: "Đã đạt mục tiêu",
    COMPLETED: "Đã hoàn thành",
    FAILED: "Đã kết thúc",
    PAUSED: "Tạm dừng",
  };
  return labels[state];
}

function getTimeRangeLabel(range: string): string {
  const labels: Record<string, string> = {
    "7d": "7 ngày qua",
    "30d": "30 ngày qua",
    "90d": "3 tháng qua",
    "365d": "1 năm qua",
  };
  return labels[range] || range;
}
