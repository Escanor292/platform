/**
 * Campaign Helper Functions
 */

import { CampaignStatus, CompletionState, CampaignType } from "@/types/campaign";

/**
 * Calculate completion state based on campaign data
 */
export function calculateCompletionState(
  status: CampaignStatus,
  startDate: Date | string | null,
  endDate: Date | string | null,
  progressPercent: number
): CompletionState {
  const now = new Date();

  if (status === "PAUSED") return "PAUSED";
  if (status === "DRAFT" || status === "PENDING_REVIEW") return "NOT_STARTED";

  // Check if not started yet
  if (startDate) {
    const startDateObj = typeof startDate === 'string' ? new Date(startDate) : startDate;
    if (startDateObj > now) return "NOT_STARTED";
  }

  // Check if ended
  if (endDate) {
    const endDateObj = typeof endDate === 'string' ? new Date(endDate) : endDate;
    if (endDateObj < now) {
      if (progressPercent >= 100) return "COMPLETED";
      return "FAILED";
    }
  }

  // Check if goal reached
  if (progressPercent >= 100) return "GOAL_REACHED";

  // Otherwise ongoing
  if (status === "ACTIVE") return "ONGOING";

  return "NOT_STARTED";
}

/**
 * Get human-readable completion state label
 */
export function getCompletionStateLabel(state: CompletionState): string {
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

/**
 * Get human-readable campaign type label
 */
export function getCampaignTypeLabel(type: CampaignType): string {
  const labels: Record<CampaignType, string> = {
    REWARD: "Reward-based",
    DONATION: "Donation-based",
    EQUITY: "Equity-based",
    SUBSCRIPTION: "Subscription",
    PREORDER: "Pre-order",
  };
  return labels[type];
}

/**
 * Get human-readable status label
 */
export function getStatusLabel(status: CampaignStatus): string {
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

/**
 * Get completion state color classes
 */
export function getCompletionStateColor(state: CompletionState): string {
  const colors: Record<CompletionState, string> = {
    NOT_STARTED: "bg-gray-100 text-gray-700",
    ONGOING: "bg-blue-100 text-blue-700",
    GOAL_REACHED: "bg-green-100 text-green-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    FAILED: "bg-red-100 text-red-700",
    PAUSED: "bg-yellow-100 text-yellow-700",
  };
  return colors[state];
}

/**
 * Check if campaign code matches query
 */
export function matchesCampaignCode(code: string, query: string): boolean {
  const normalizedCode = code.toLowerCase().replace(/[-\s]/g, "");
  const normalizedQuery = query.toLowerCase().replace(/[-\s]/g, "");
  return normalizedCode.includes(normalizedQuery);
}

/**
 * Check if query looks like a campaign code
 */
export function looksLikeCampaignCode(query: string): boolean {
  // CF-20260416-ABC12 or variations
  const pattern = /^cf[-\s]?\d{0,8}[-\s]?[a-z0-9]{0,5}$/i;
  return pattern.test(query.trim());
}

/**
 * Calculate days remaining
 */
export function getDaysRemaining(endDate: Date | string | null): number | null {
  if (!endDate) return null;
  const now = new Date();
  const endDateObj = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const diff = endDateObj.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Format days remaining text
 */
export function formatDaysRemaining(endDate: Date | string | null): string {
  const days = getDaysRemaining(endDate);
  if (days === null) return "Vô thời hạn";
  if (days < 0) return "Đã kết thúc";
  if (days === 0) return "Kết thúc hôm nay";
  if (days === 1) return "Còn 1 ngày";
  return `Còn ${days} ngày`;
}

/**
 * Format date to Vietnamese format (dd/mm/yyyy)
 */
export function formatDateVN(date: Date | string | null): string {
  if (!date) return "";
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check if valid date
  if (isNaN(dateObj.getTime())) return "";

  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Format date to Vietnamese long format (Ngày dd tháng mm năm yyyy)
 */
export function formatDateVNLong(date: Date | string | null): string {
  if (!date) return "";
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check if valid date
  if (isNaN(dateObj.getTime())) return "";

  const day = dateObj.getDate();
  const month = dateObj.getMonth() + 1;
  const year = dateObj.getFullYear();

  return `Ngày ${day} tháng ${month} năm ${year}`;
}

/**
 * Format date with time (dd/mm/yyyy HH:mm)
 */
export function formatDateTimeVN(date: Date | string | null): string {
  if (!date) return "";
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check if valid date
  if (isNaN(dateObj.getTime())) return "";

  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}
