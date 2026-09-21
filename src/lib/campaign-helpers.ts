/**
 * Campaign Helper Functions
 */

import { CampaignStatus, CompletionState, CampaignType, FundingModel, CampaignListItem } from "@/types/campaign";

export function calculateCompletionState(
  status: CampaignStatus | string,
  startDate: Date | string | null,
  endDate: Date | string | null,
  progressPercent: number
): CompletionState {
  const now = new Date();

  if (status === "PAUSED") return "PAUSED";
  if (status === "DRAFT" || status === "PENDING_REVIEW") return "NOT_STARTED";
  if (status === "CANCELED") return "FAILED";
  if (status === "FAILED") return "FAILED";

  if (startDate) {
    const startDateObj = typeof startDate === "string" ? new Date(startDate) : startDate;
    if (startDateObj > now) return "NOT_STARTED";
  }

  const ended = (() => {
    if (!endDate) return false;
    const endDateObj = typeof endDate === "string" ? new Date(endDate) : endDate;
    return endDateObj < now;
  })();

  if (status === "SUCCESS" || status === "COMPLETED") {
    if (!ended) return progressPercent >= 100 ? "GOAL_REACHED" : "ONGOING";
    return "COMPLETED";
  }

  if (ended) {
    if (progressPercent >= 100) return "COMPLETED";
    return "FAILED";
  }

  if (progressPercent >= 100) return "GOAL_REACHED";
  if (status === "ACTIVE") return "ONGOING";

  return "NOT_STARTED";
}

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

export function getCampaignTypeLabel(type: CampaignType | string): string {
  const labels: Record<string, string> = {
    REWARD: "Nhận quà",
    DONATION: "Ủng hộ",
  };
  return labels[type] || type;
}

export function getFundingModelLabel(model: FundingModel | string | null | undefined): string {
  if (model === "KEEP_IT_ALL") return "Keep-It-All";
  return "All-or-Nothing";
}

export function getStatusLabel(status: CampaignStatus): string {
  const labels: Record<CampaignStatus, string> = {
    DRAFT: "Nháp",
    PENDING_REVIEW: "Chờ duyệt",
    ACTIVE: "Đang hoạt động",
    PAUSED: "Tạm dừng",
    SUCCESS: "Thành công",
    COMPLETED: "Hoàn thành",
    FAILED: "Thất bại",
    CANCELED: "Đã hủy",
  };
  return labels[status];
}

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

export function matchesCampaignCode(code: string, query: string): boolean {
  const normalizedCode = code.toLowerCase().replace(/[-\s]/g, "");
  const normalizedQuery = query.toLowerCase().replace(/[-\s]/g, "");
  return normalizedCode.includes(normalizedQuery);
}

export function looksLikeCampaignCode(query: string): boolean {
  const pattern = /^cf[-\s]?\d{0,8}[-\s]?[a-z0-9]{0,5}$/i;
  return pattern.test(query.trim());
}

export function getDaysRemaining(endDate: Date | string | null): number | null {
  if (!endDate) return null;
  const now = new Date();
  const endDateObj = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const diff = endDateObj.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function formatDaysRemaining(endDate: Date | string | null): string {
  const days = getDaysRemaining(endDate);
  if (days === null) return "Vô thời hạn";
  if (days < 0) return "Đã kết thúc";
  if (days === 0) return "Kết thúc hôm nay";
  if (days === 1) return "Còn 1 ngày";
  return `Còn ${days} ngày`;
}

export function formatDateVN(date: Date | string | null): string {
  if (!date) return "";
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return "";
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatDateVNLong(date: Date | string | null): string {
  if (!date) return "";
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return "";
  const day = dateObj.getDate();
  const month = dateObj.getMonth() + 1;
  const year = dateObj.getFullYear();
  return `Ngày ${day} tháng ${month} năm ${year}`;
}

export function formatDateTimeVN(date: Date | string | null): string {
  if (!date) return "";
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return "";
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function toCampaignListItem(campaign: {
  id: string;
  campaignCode: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string | null;
  creatorId: string;
  category: string;
  tags: string[];
  type: string;
  fundingModel: string;
  goalAmount: unknown;
  currentAmount: unknown;
  createdAt: Date | string;
  updatedAt: Date | string;
  startDate: Date | string | null;
  endDate: Date | string | null;
  status: string;
  isFeatured: boolean;
  users?: {
    name?: string | null;
    displayName?: string | null;
    avatar?: string | null;
    status?: string | null;
  } | null;
  _count?: { pledges?: number; campaign_followers?: number } | null;
}): CampaignListItem {
  const goalAmount = Number(campaign.goalAmount);
  const currentAmount = Number(campaign.currentAmount);
  const progressPercent = goalAmount > 0 ? Math.round((currentAmount / goalAmount) * 100) : 0;
  return {
    id: campaign.id,
    campaignCode: campaign.campaignCode,
    slug: campaign.slug,
    title: campaign.title,
    description: campaign.description,
    imageUrl: campaign.imageUrl,
    creatorId: campaign.creatorId,
    creatorName: campaign.users?.displayName || campaign.users?.name || "Creator",
    creatorAvatar: campaign.users?.avatar || null,
    creatorIsPro: campaign.users?.status === "PRO",
    category: campaign.category,
    tags: campaign.tags || [],
    campaignType: campaign.type as CampaignType,
    fundingModel: campaign.fundingModel as FundingModel,
    goalAmount,
    currentAmount,
    progressPercent,
    totalBackers: campaign._count?.pledges || 0,
    totalFollowers: campaign._count?.campaign_followers || 0,
    totalViews: 0,
    ratingAverage: 0,
    ratingCount: 0,
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt,
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    status: campaign.status as CampaignStatus,
    completionState: calculateCompletionState(
      campaign.status,
      campaign.startDate,
      campaign.endDate,
      progressPercent,
    ),
    isFeatured: campaign.isFeatured,
  };
}
