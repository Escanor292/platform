/**
 * Project Filtering and Sorting Logic
 */

import { ProjectFilters, ProjectListItem, SortOption } from "@/types/project";
import { looksLikeCampaignCode, matchesCampaignCode } from "./project-helpers";

/**
 * Apply all filters to project list
 */
export function applyProjectFilters(
  projects: ProjectListItem[],
  filters: ProjectFilters
): ProjectListItem[] {
  let filtered = [...projects];

  // Search filter
  if (filters.q) {
    const query = filters.q.trim().toLowerCase();
    const isCodeSearch = looksLikeCampaignCode(query);

    filtered = filtered.filter((project) => {
      // Prioritize campaign code match
      if (isCodeSearch && matchesCampaignCode(project.campaignCode, query)) {
        return true;
      }

      // Search in title
      if (project.title.toLowerCase().includes(query)) {
        return true;
      }

      // Search in description
      if (project.description.toLowerCase().includes(query)) {
        return true;
      }

      // Fallback: also check campaign code for non-code-like queries
      if (matchesCampaignCode(project.campaignCode, query)) {
        return true;
      }

      return false;
    });
  }

  // Category filter
  if (filters.category) {
    filtered = filtered.filter((p) => p.category === filters.category);
  }

  // Campaign type filter
  if (filters.campaignType) {
    filtered = filtered.filter((p) => p.campaignType === filters.campaignType);
  }

  // Status filter
  if (filters.status) {
    filtered = filtered.filter((p) => p.status === filters.status);
  }

  // Completion state filter
  if (filters.completionState) {
    filtered = filtered.filter((p) => p.completionState === filters.completionState);
  }

  // Rating filter
  if (filters.ratingMin) {
    filtered = filtered.filter((p) => p.ratingAverage >= filters.ratingMin!);
  }

  // Created within filter
  if (filters.createdWithin) {
    const cutoffDate = getDateFromTimeRange(filters.createdWithin);
    if (cutoffDate) {
      filtered = filtered.filter((p) => {
        const createdAt = typeof p.createdAt === 'string' ? new Date(p.createdAt) : p.createdAt;
        return createdAt >= cutoffDate;
      });
    }
  }

  // Progress range filter
  if (filters.progressMin !== undefined) {
    filtered = filtered.filter((p) => p.progressPercent >= filters.progressMin!);
  }
  if (filters.progressMax !== undefined) {
    filtered = filtered.filter((p) => p.progressPercent <= filters.progressMax!);
  }

  // Featured filter
  if (filters.isFeatured) {
    filtered = filtered.filter((p) => p.isFeatured);
  }

  // Apply sorting
  if (filters.sort) {
    filtered = sortProjects(filtered, filters.sort);
  } else {
    // Default sort: newest
    filtered = sortProjects(filtered, "newest");
  }

  return filtered;
}

/**
 * Sort projects based on sort option
 */
export function sortProjects(
  projects: ProjectListItem[],
  sort: SortOption
): ProjectListItem[] {
  const sorted = [...projects];

  switch (sort) {
    case "newest":
      return sorted.sort((a, b) => {
        const aDate = typeof a.createdAt === 'string' ? new Date(a.createdAt) : a.createdAt;
        const bDate = typeof b.createdAt === 'string' ? new Date(b.createdAt) : b.createdAt;
        return bDate.getTime() - aDate.getTime();
      });

    case "oldest":
      return sorted.sort((a, b) => {
        const aDate = typeof a.createdAt === 'string' ? new Date(a.createdAt) : a.createdAt;
        const bDate = typeof b.createdAt === 'string' ? new Date(b.createdAt) : b.createdAt;
        return aDate.getTime() - bDate.getTime();
      });

    case "most_viewed":
      return sorted.sort((a, b) => b.totalViews - a.totalViews);

    case "top_rated":
      return sorted.sort((a, b) => {
        // Sort by rating average first
        if (b.ratingAverage !== a.ratingAverage) {
          return b.ratingAverage - a.ratingAverage;
        }
        // Tie-break by rating count
        return b.ratingCount - a.ratingCount;
      });

    case "most_backed":
      return sorted.sort((a, b) => b.totalBackers - a.totalBackers);

    case "highest_progress":
      return sorted.sort((a, b) => b.progressPercent - a.progressPercent);

    case "ending_soon":
      return sorted.sort((a, b) => {
        // Only consider active campaigns
        const aActive = a.status === "ACTIVE" && a.endDate;
        const bActive = b.status === "ACTIVE" && b.endDate;

        if (!aActive && !bActive) return 0;
        if (!aActive) return 1;
        if (!bActive) return -1;

        const aEndDate = typeof a.endDate === 'string' ? new Date(a.endDate) : a.endDate!;
        const bEndDate = typeof b.endDate === 'string' ? new Date(b.endDate) : b.endDate!;
        return aEndDate.getTime() - bEndDate.getTime();
      });

    case "recently_updated":
      return sorted.sort((a, b) => {
        const aDate = typeof a.updatedAt === 'string' ? new Date(a.updatedAt) : a.updatedAt;
        const bDate = typeof b.updatedAt === 'string' ? new Date(b.updatedAt) : b.updatedAt;
        return bDate.getTime() - aDate.getTime();
      });

    default:
      return sorted;
  }
}

/**
 * Paginate results
 */
export function paginateProjects(
  projects: ProjectListItem[],
  page: number = 1,
  limit: number = 12
): { items: ProjectListItem[]; total: number; totalPages: number } {
  const total = projects.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const end = start + limit;
  const items = projects.slice(start, end);

  return { items, total, totalPages };
}

/**
 * Helper: Get date from time range string
 */
function getDateFromTimeRange(range: string): Date | null {
  const now = new Date();
  
  switch (range) {
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "90d":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case "365d":
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}

/**
 * Get active filters for display
 */
export function getActiveFilters(filters: ProjectFilters): Array<{
  key: keyof ProjectFilters;
  value: any;
  label: string;
}> {
  const active: Array<{ key: keyof ProjectFilters; value: any; label: string }> = [];

  // Don't include q, page, limit, sort in active filters chips
  const excludeKeys: (keyof ProjectFilters)[] = ["q", "page", "limit", "sort"];

  (Object.keys(filters) as Array<keyof ProjectFilters>).forEach((key) => {
    if (excludeKeys.includes(key)) return;
    
    const value = filters[key];
    if (value !== undefined && value !== null) {
      active.push({
        key,
        value,
        label: getFilterDisplayLabel(key, value),
      });
    }
  });

  return active;
}

/**
 * Get display label for filter
 */
function getFilterDisplayLabel(key: keyof ProjectFilters, value: any): string {
  switch (key) {
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

function getCampaignTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    REWARD: "Reward-based",
    DONATION: "Donation-based",
    EQUITY: "Equity-based",
    SUBSCRIPTION: "Subscription",
    PREORDER: "Pre-order",
  };
  return labels[type] || type;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: "Nháp",
    PENDING_REVIEW: "Chờ duyệt",
    ACTIVE: "Đang hoạt động",
    PAUSED: "Tạm dừng",
    COMPLETED: "Hoàn thành",
    FAILED: "Thất bại",
    CANCELED: "Đã hủy",
  };
  return labels[status] || status;
}

function getCompletionStateLabel(state: string): string {
  const labels: Record<string, string> = {
    NOT_STARTED: "Chưa bắt đầu",
    ONGOING: "Đang gây quỹ",
    GOAL_REACHED: "Đã đạt mục tiêu",
    COMPLETED: "Đã hoàn thành",
    FAILED: "Đã kết thúc",
    PAUSED: "Tạm dừng",
  };
  return labels[state] || state;
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
