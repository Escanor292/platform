// Badge Types
export type BadgeType = 'custom' | 'achievement';
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Badge {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  iconUrl?: string | null;
  iconName?: string | null;
  color?: string | null;
  backgroundColor?: string | null;
  type: BadgeType;
  rarity: BadgeRarity;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  assignedBy: string;
  reason?: string | null;
  note?: string | null;
  assignedAt: Date;
  expiresAt?: Date | null;
  revokedAt?: Date | null;
  revokedBy?: string | null;
  revokeReason?: string | null;
  isVisible: boolean;
  badge?: Badge;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  assigner?: {
    id: string;
    name: string;
  };
}

export interface BadgeWithStats extends Badge {
  userCount?: number;
}

export interface CreateBadgeInput {
  name: string;
  description?: string;
  iconUrl?: string;
  iconName?: string;
  color?: string;
  backgroundColor?: string;
  type: BadgeType;
  rarity?: BadgeRarity;
  isActive?: boolean;
}

export interface UpdateBadgeInput {
  name?: string;
  description?: string;
  iconUrl?: string;
  iconName?: string;
  color?: string;
  backgroundColor?: string;
  type?: BadgeType;
  rarity?: BadgeRarity;
  isActive?: boolean;
}

export interface AssignBadgeInput {
  userId: string;
  reason?: string;
  note?: string;
  expiresAt?: string;
}

export interface RevokeBadgeInput {
  reason: string;
}

export interface BadgeListQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: BadgeType;
  isActive?: boolean;
}
