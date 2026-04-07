/**
 * Campaign Types
 */

export type CampaignStatus =
  | "DRAFT"
  | "PENDING"
  | "ACTIVE"
  | "SUCCESS"
  | "FAILED"
  | "PAUSED";

export interface Campaign {
  id: string;
  slug: string;
  title: string;
  tagline?: string | null;
  description?: string | null;
  goalAmount: number;
  currentAmount: number;
  imageUrl?: string | null;
  category?: string | null;
  status: CampaignStatus;
  endDate?: Date | null;
  creatorId: string;
  createdAt: Date;
}

export interface Reward {
  id: string;
  campaignId: string;
  title: string;
  description?: string | null;
  amount: number;
  stock?: number | null;
  isUnlimited: boolean;
  estimatedDelivery?: string | null;
}

/** Campaign với creator & rewards (dùng trong detail page) */
export interface CampaignDetail extends Campaign {
  creator: {
    id: string;
    name?: string | null;
    image?: string | null;
  };
  rewards: Reward[];
  _count: { pledges: number };
}

/** Campaign card (dùng trong listing) */
export interface CampaignCard extends Campaign {
  creator: { id: string; name?: string | null; image?: string | null };
  _count: { pledges: number };
}

/** Input tạo campaign */
export interface CreateCampaignInput {
  title: string;
  tagline?: string;
  description?: string;
  goalAmount: number;
  category?: string;
  imageUrl?: string;
  endDate?: string;
  creatorId: string;
  rewards?: RewardInput[];
}

export interface RewardInput {
  title: string;
  description?: string;
  amount: number;
  stock?: number | null;
  isUnlimited?: boolean;
  estimatedDelivery?: string;
}

/** Tham số filter khi tìm campaigns */
export interface CampaignFilterParams {
  page?: number;
  limit?: number;
  category?: string;
  status?: CampaignStatus;
  search?: string;
}
