import { prisma } from '@/lib/prisma';
import type {
  Badge,
  BadgeType,
  BadgeRarity,
  CreateBadgeInput,
  UpdateBadgeInput,
  AssignBadgeInput,
  BadgeListQuery,
  BadgeWithStats,
  UserBadge,
} from '@/types/badge.types';

/**
 * Generate unique slug from badge name
 */
export async function generateUniqueBadgeSlug(name: string): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  let slug = baseSlug;
  let counter = 1;

  while (await prisma.badges.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Validate badge type
 */
export function validateBadgeType(type: string): type is BadgeType {
  return type === 'custom' || type === 'achievement';
}

/**
 * Validate badge rarity
 */
export function validateBadgeRarity(rarity: string): rarity is BadgeRarity {
  return ['common', 'rare', 'epic', 'legendary'].includes(rarity);
}

/**
 * Validate hex color
 */
export function validateHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Create a new badge (Admin only)
 */
export async function createBadge(
  adminUserId: string,
  data: CreateBadgeInput
): Promise<Badge> {
  // Validate type
  if (!validateBadgeType(data.type)) {
    throw new Error('Invalid badge type. Must be "custom" or "achievement"');
  }

  // Validate rarity if provided
  if (data.rarity && !validateBadgeRarity(data.rarity)) {
    throw new Error('Invalid badge rarity');
  }

  // Validate colors if provided
  if (data.color && !validateHexColor(data.color)) {
    throw new Error('Invalid color format. Must be hex color');
  }
  if (data.backgroundColor && !validateHexColor(data.backgroundColor)) {
    throw new Error('Invalid background color format. Must be hex color');
  }

  // Generate unique slug
  const slug = await generateUniqueBadgeSlug(data.name);

  const badge = await prisma.badges.create({
    data: {
      id: crypto.randomUUID(),
      name: data.name,
      slug,
      description: data.description,
      icon_url: data.iconUrl,
      icon_name: data.iconName,
      color: data.color,
      background_color: data.backgroundColor,
      type: data.type,
      rarity: data.rarity || 'common',
      is_active: data.isActive !== undefined ? data.isActive : true,
      updated_at: new Date(),
      created_by: adminUserId,
    },
  });

  return {
    id: badge.id,
    name: badge.name,
    slug: badge.slug,
    description: badge.description,
    iconUrl: badge.icon_url,
    iconName: badge.icon_name,
    color: badge.color,
    backgroundColor: badge.background_color,
    type: badge.type,
    rarity: badge.rarity,
    isActive: badge.is_active,
    createdBy: badge.created_by,
    createdAt: badge.created_at,
    updatedAt: badge.updated_at,
    deletedAt: badge.deleted_at,
  } as Badge;
}

/**
 * Get badges list with filters
 */
export async function getBadges(
  query: BadgeListQuery
): Promise<{ badges: BadgeWithStats[]; total: number }> {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {
    deletedAt: null,
  };

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  if (query.type) {
    where.type = query.type;
  }

  if (query.isActive !== undefined) {
    where.isActive = query.isActive;
  }

  const [badges, total] = await Promise.all([
    prisma.badges.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        _count: {
          select: {
            user_badges: {
              where: {
                revoked_at: null,
                OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
              },
            },
          },
        },
      },
    }),
    prisma.badges.count({ where }),
  ]);

  const badgesWithStats = badges.map((badge) => ({
    id: badge.id,
    name: badge.name,
    slug: badge.slug,
    description: badge.description,
    iconUrl: badge.icon_url,
    iconName: badge.icon_name,
    color: badge.color,
    backgroundColor: badge.background_color,
    type: badge.type,
    rarity: badge.rarity,
    isActive: badge.is_active,
    createdBy: badge.created_by,
    createdAt: badge.created_at,
    updatedAt: badge.updated_at,
    deletedAt: badge.deleted_at,
    userCount: badge._count.user_badges,
  } as BadgeWithStats));

  return { badges: badgesWithStats as BadgeWithStats[], total };
}

/**
 * Get badge by ID
 */
export async function getBadgeById(badge_id: string): Promise<BadgeWithStats | null> {
  const badge = await prisma.badges.findUnique({
    where: { id: badge_id },
    include: {
      _count: {
        select: {
          user_badges: {
            where: {
              revoked_at: null,
              OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
            },
          },
        },
      },
    },
  });

  if (!badge) return null;

  return {
    id: badge.id,
    name: badge.name,
    slug: badge.slug,
    description: badge.description,
    iconUrl: badge.icon_url,
    iconName: badge.icon_name,
    color: badge.color,
    backgroundColor: badge.background_color,
    type: badge.type,
    rarity: badge.rarity,
    isActive: badge.is_active,
    createdBy: badge.created_by,
    createdAt: badge.created_at,
    updatedAt: badge.updated_at,
    deletedAt: badge.deleted_at,
    userCount: badge._count.user_badges,
  } as BadgeWithStats;
}

/**
 * Update badge (Admin only)
 */
export async function updateBadge(
  badge_id: string,
  data: UpdateBadgeInput
): Promise<Badge> {
  // Validate type if provided
  if (data.type && !validateBadgeType(data.type)) {
    throw new Error('Invalid badge type. Must be "custom" or "achievement"');
  }

  // Validate rarity if provided
  if (data.rarity && !validateBadgeRarity(data.rarity)) {
    throw new Error('Invalid badge rarity');
  }

  // Validate colors if provided
  if (data.color && !validateHexColor(data.color)) {
    throw new Error('Invalid color format. Must be hex color');
  }
  if (data.backgroundColor && !validateHexColor(data.backgroundColor)) {
    throw new Error('Invalid background color format. Must be hex color');
  }

  const updateData: any = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
    updateData.slug = await generateUniqueBadgeSlug(data.name);
  }
  if (data.description !== undefined) updateData.description = data.description;
  if (data.iconUrl !== undefined) updateData.iconUrl = data.iconUrl;
  if (data.iconName !== undefined) updateData.iconName = data.iconName;
  if (data.color !== undefined) updateData.color = data.color;
  if (data.backgroundColor !== undefined)
    updateData.backgroundColor = data.backgroundColor;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.rarity !== undefined) updateData.rarity = data.rarity;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  const badge = await prisma.badges.update({
    where: { id: badge_id },
    data: updateData,
  });

  return {
    id: badge.id,
    name: badge.name,
    slug: badge.slug,
    description: badge.description,
    iconUrl: badge.icon_url,
    iconName: badge.icon_name,
    color: badge.color,
    backgroundColor: badge.background_color,
    type: badge.type,
    rarity: badge.rarity,
    isActive: badge.is_active,
    createdBy: badge.created_by,
    createdAt: badge.created_at,
    updatedAt: badge.updated_at,
    deletedAt: badge.deleted_at,
  } as Badge;
}

/**
 * Soft delete badge (Admin only)
 */
export async function deleteBadge(badge_id: string): Promise<void> {
  await prisma.badges.update({
    where: { id: badge_id },
    data: { deleted_at: new Date() },
  });
}

/**
 * Ensure badge is assignable
 */
export async function ensureBadgeAssignable(badge_id: string): Promise<void> {
  const badge = await prisma.badges.findUnique({
    where: { id: badge_id },
  });

  if (!badge) {
    throw new Error('Badge not found');
  }

  if (badge.deleted_at) {
    throw new Error('Cannot assign deleted badge');
  }

  if (!badge.is_active) {
    throw new Error('Cannot assign inactive badge');
  }
}

/**
 * Ensure no duplicate active badge for user
 */
export async function ensureNoDuplicateActiveBadge(
  user_id: string,
  badge_id: string
): Promise<void> {
  const existingBadge = await prisma.user_badges.findFirst({
    where: {
      user_id,
      badge_id,
      revoked_at: null,
      OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
    },
  });

  if (existingBadge) {
    throw new Error('User already has this active badge');
  }
}

/**
 * Assign badge to user (Admin only)
 */
export async function assignBadge(
  adminUserId: string,
  badge_id: string,
  data: AssignBadgeInput
): Promise<UserBadge> {
  // Validate user exists
  const user = await prisma.users.findUnique({
    where: { id: data.userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Ensure badge is assignable
  await ensureBadgeAssignable(badge_id);

  // Ensure no duplicate active badge
  await ensureNoDuplicateActiveBadge(data.userId, badge_id);

  const userBadge = await prisma.user_badges.create({
    data: {
      id: crypto.randomUUID(),
      user_id: data.userId,
      badge_id,
      assigned_by: adminUserId,
      reason: data.reason,
      note: data.note,
      expires_at: data.expiresAt ? new Date(data.expiresAt) : null,
    },
    include: {
      badges: true,
      users_user_badges_user_idTousers: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      users_user_badges_assigned_byTousers: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return {
    id: userBadge.id,
    userId: userBadge.user_id,
    badgeId: userBadge.badge_id,
    assignedBy: userBadge.assigned_by,
    reason: userBadge.reason,
    note: userBadge.note,
    assignedAt: userBadge.assigned_at,
    expiresAt: userBadge.expires_at,
    revokedAt: userBadge.revoked_at,
    revokedBy: userBadge.revoked_by,
    revokeReason: userBadge.revoke_reason,
    isVisible: userBadge.is_visible,
    badge: {
      id: userBadge.badges.id,
      name: userBadge.badges.name,
      slug: userBadge.badges.slug,
      description: userBadge.badges.description,
      iconUrl: userBadge.badges.icon_url,
      iconName: userBadge.badges.icon_name,
      color: userBadge.badges.color,
      backgroundColor: userBadge.badges.background_color,
      type: userBadge.badges.type,
      rarity: userBadge.badges.rarity,
      isActive: userBadge.badges.is_active,
      createdBy: userBadge.badges.created_by,
      createdAt: userBadge.badges.created_at,
      updatedAt: userBadge.badges.updated_at,
      deletedAt: userBadge.badges.deleted_at,
    },
    user: userBadge.users_user_badges_user_idTousers,
    assigner: userBadge.users_user_badges_assigned_byTousers,
  } as UserBadge;
}

/**
 * Revoke user badge (Admin only)
 */
export async function revokeUserBadge(
  adminUserId: string,
  userBadgeId: string,
  reason: string
): Promise<UserBadge> {
  const userBadge = await prisma.user_badges.update({
    where: { id: userBadgeId },
    data: {
      revoked_at: new Date(),
      revoked_by: adminUserId,
      revoke_reason: reason,
    },
    include: {
      badges: true,
      users_user_badges_user_idTousers: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return {
    id: userBadge.id,
    userId: userBadge.user_id,
    badgeId: userBadge.badge_id,
    assignedBy: userBadge.assigned_by,
    reason: userBadge.reason,
    note: userBadge.note,
    assignedAt: userBadge.assigned_at,
    expiresAt: userBadge.expires_at,
    revokedAt: userBadge.revoked_at,
    revokedBy: userBadge.revoked_by,
    revokeReason: userBadge.revoke_reason,
    isVisible: userBadge.is_visible,
    badge: {
      id: userBadge.badges.id,
      name: userBadge.badges.name,
      slug: userBadge.badges.slug,
      description: userBadge.badges.description,
      iconUrl: userBadge.badges.icon_url,
      iconName: userBadge.badges.icon_name,
      color: userBadge.badges.color,
      backgroundColor: userBadge.badges.background_color,
      type: userBadge.badges.type,
      rarity: userBadge.badges.rarity,
      isActive: userBadge.badges.is_active,
      createdBy: userBadge.badges.created_by,
      createdAt: userBadge.badges.created_at,
      updatedAt: userBadge.badges.updated_at,
      deletedAt: userBadge.badges.deleted_at,
    },
    user: userBadge.users_user_badges_user_idTousers,
  } as UserBadge;
}

/**
 * Get user badges (with filters)
 */
export async function getUserBadges(
  user_id: string,
  options?: {
    includeRevoked?: boolean;
    includeExpired?: boolean;
    includeInactive?: boolean;
  }
): Promise<UserBadge[]> {
  const where: any = {
    user_id,
  };

  if (!options?.includeRevoked) {
    where.revoked_at = null;
  }

  if (!options?.includeExpired) {
    where.OR = [{ expires_at: null }, { expires_at: { gt: new Date() } }];
  }

  const userBadges = await prisma.user_badges.findMany({
    where,
    include: {
      badges: true,
      users_user_badges_assigned_byTousers: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { assigned_at: 'desc' },
  });

  // Filter out inactive badges if needed
  let filteredBadges = userBadges;
  if (!options?.includeInactive) {
    filteredBadges = userBadges.filter(
      (ub) => ub.badges.is_active && !ub.badges.deleted_at
    );
  }

  return filteredBadges.map((ub) => ({
    id: ub.id,
    userId: ub.user_id,
    badgeId: ub.badge_id,
    assignedBy: ub.assigned_by,
    reason: ub.reason,
    note: ub.note,
    assignedAt: ub.assigned_at,
    expiresAt: ub.expires_at,
    revokedAt: ub.revoked_at,
    revokedBy: ub.revoked_by,
    revokeReason: ub.revoke_reason,
    isVisible: ub.is_visible,
    badge: {
      id: ub.badges.id,
      name: ub.badges.name,
      slug: ub.badges.slug,
      description: ub.badges.description,
      iconUrl: ub.badges.icon_url,
      iconName: ub.badges.icon_name,
      color: ub.badges.color,
      backgroundColor: ub.badges.background_color,
      type: ub.badges.type,
      rarity: ub.badges.rarity,
      isActive: ub.badges.is_active,
      createdBy: ub.badges.created_by,
      createdAt: ub.badges.created_at,
      updatedAt: ub.badges.updated_at,
      deletedAt: ub.badges.deleted_at,
    },
    assigner: ub.users_user_badges_assigned_byTousers,
  })) as UserBadge[];
}

/**
 * Get public active badges for a user
 */
export async function getPublicUserBadges(user_id: string): Promise<UserBadge[]> {
  const userBadges = await prisma.user_badges.findMany({
    where: {
      user_id,
      is_visible: true,
      revoked_at: null,
      OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
      badges: {
        is_active: true,
        deleted_at: null,
      },
    },
    include: {
      badges: true,
    },
    orderBy: { assigned_at: 'desc' },
  });

  return userBadges.map((ub) => ({
    id: ub.id,
    userId: ub.user_id,
    badgeId: ub.badge_id,
    assignedBy: ub.assigned_by,
    reason: ub.reason,
    note: ub.note,
    assignedAt: ub.assigned_at,
    expiresAt: ub.expires_at,
    revokedAt: ub.revoked_at,
    revokedBy: ub.revoked_by,
    revokeReason: ub.revoke_reason,
    isVisible: ub.is_visible,
    badge: {
      id: ub.badges.id,
      name: ub.badges.name,
      slug: ub.badges.slug,
      description: ub.badges.description,
      iconUrl: ub.badges.icon_url,
      iconName: ub.badges.icon_name,
      color: ub.badges.color,
      backgroundColor: ub.badges.background_color,
      type: ub.badges.type,
      rarity: ub.badges.rarity,
      isActive: ub.badges.is_active,
      createdBy: ub.badges.created_by,
      createdAt: ub.badges.created_at,
      updatedAt: ub.badges.updated_at,
      deletedAt: ub.badges.deleted_at,
    },
  })) as UserBadge[];
}

/**
 * Get all active badges (public)
 */
export async function getPublicBadges(): Promise<Badge[]> {
  const badges = await prisma.badges.findMany({
    where: {
      is_active: true,
      deleted_at: null,
    },
    orderBy: { created_at: 'desc' },
  });

  return badges.map((badge) => ({
    id: badge.id,
    name: badge.name,
    slug: badge.slug,
    description: badge.description,
    iconUrl: badge.icon_url,
    iconName: badge.icon_name,
    color: badge.color,
    backgroundColor: badge.background_color,
    type: badge.type,
    rarity: badge.rarity,
    isActive: badge.is_active,
    createdBy: badge.created_by,
    createdAt: badge.created_at,
    updatedAt: badge.updated_at,
    deletedAt: badge.deleted_at,
  })) as Badge[];
}
