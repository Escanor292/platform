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

  while (await prisma.badge.findUnique({ where: { slug } })) {
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

  const badge = await prisma.badge.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      iconUrl: data.iconUrl,
      iconName: data.iconName,
      color: data.color,
      backgroundColor: data.backgroundColor,
      type: data.type,
      rarity: data.rarity || 'common',
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdBy: adminUserId,
    },
  });

  return badge as Badge;
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
    prisma.badge.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            userBadges: {
              where: {
                revokedAt: null,
                OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
              },
            },
          },
        },
      },
    }),
    prisma.badge.count({ where }),
  ]);

  const badgesWithStats = badges.map((badge) => ({
    ...badge,
    userCount: badge._count.userBadges,
  }));

  return { badges: badgesWithStats as BadgeWithStats[], total };
}

/**
 * Get badge by ID
 */
export async function getBadgeById(badgeId: string): Promise<BadgeWithStats | null> {
  const badge = await prisma.badge.findUnique({
    where: { id: badgeId },
    include: {
      _count: {
        select: {
          userBadges: {
            where: {
              revokedAt: null,
              OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            },
          },
        },
      },
    },
  });

  if (!badge) return null;

  return {
    ...badge,
    userCount: badge._count.userBadges,
  } as BadgeWithStats;
}

/**
 * Update badge (Admin only)
 */
export async function updateBadge(
  badgeId: string,
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

  const badge = await prisma.badge.update({
    where: { id: badgeId },
    data: updateData,
  });

  return badge as Badge;
}

/**
 * Soft delete badge (Admin only)
 */
export async function deleteBadge(badgeId: string): Promise<void> {
  await prisma.badge.update({
    where: { id: badgeId },
    data: { deletedAt: new Date() },
  });
}

/**
 * Ensure badge is assignable
 */
export async function ensureBadgeAssignable(badgeId: string): Promise<void> {
  const badge = await prisma.badge.findUnique({
    where: { id: badgeId },
  });

  if (!badge) {
    throw new Error('Badge not found');
  }

  if (badge.deletedAt) {
    throw new Error('Cannot assign deleted badge');
  }

  if (!badge.isActive) {
    throw new Error('Cannot assign inactive badge');
  }
}

/**
 * Ensure no duplicate active badge for user
 */
export async function ensureNoDuplicateActiveBadge(
  userId: string,
  badgeId: string
): Promise<void> {
  const existingBadge = await prisma.userBadge.findFirst({
    where: {
      userId,
      badgeId,
      revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
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
  badgeId: string,
  data: AssignBadgeInput
): Promise<UserBadge> {
  // Validate user exists
  const user = await prisma.user.findUnique({
    where: { id: data.userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Ensure badge is assignable
  await ensureBadgeAssignable(badgeId);

  // Ensure no duplicate active badge
  await ensureNoDuplicateActiveBadge(data.userId, badgeId);

  const userBadge = await prisma.userBadge.create({
    data: {
      userId: data.userId,
      badgeId,
      assignedBy: adminUserId,
      reason: data.reason,
      note: data.note,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
    include: {
      badge: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      assigner: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return userBadge as UserBadge;
}

/**
 * Revoke user badge (Admin only)
 */
export async function revokeUserBadge(
  adminUserId: string,
  userBadgeId: string,
  reason: string
): Promise<UserBadge> {
  const userBadge = await prisma.userBadge.update({
    where: { id: userBadgeId },
    data: {
      revokedAt: new Date(),
      revokedBy: adminUserId,
      revokeReason: reason,
    },
    include: {
      badge: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return userBadge as UserBadge;
}

/**
 * Get user badges (with filters)
 */
export async function getUserBadges(
  userId: string,
  options?: {
    includeRevoked?: boolean;
    includeExpired?: boolean;
    includeInactive?: boolean;
  }
): Promise<UserBadge[]> {
  const where: any = {
    userId,
  };

  if (!options?.includeRevoked) {
    where.revokedAt = null;
  }

  if (!options?.includeExpired) {
    where.OR = [{ expiresAt: null }, { expiresAt: { gt: new Date() } }];
  }

  const userBadges = await prisma.userBadge.findMany({
    where,
    include: {
      badge: true,
      assigner: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { assignedAt: 'desc' },
  });

  // Filter out inactive badges if needed
  let filteredBadges = userBadges;
  if (!options?.includeInactive) {
    filteredBadges = userBadges.filter(
      (ub) => ub.badge.isActive && !ub.badge.deletedAt
    );
  }

  return filteredBadges as UserBadge[];
}

/**
 * Get public active badges for a user
 */
export async function getPublicUserBadges(userId: string): Promise<UserBadge[]> {
  const userBadges = await prisma.userBadge.findMany({
    where: {
      userId,
      isVisible: true,
      revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      badge: {
        isActive: true,
        deletedAt: null,
      },
    },
    include: {
      badge: true,
    },
    orderBy: { assignedAt: 'desc' },
  });

  return userBadges as UserBadge[];
}

/**
 * Get all active badges (public)
 */
export async function getPublicBadges(): Promise<Badge[]> {
  const badges = await prisma.badge.findMany({
    where: {
      isActive: true,
      deletedAt: null,
    },
    orderBy: { createdAt: 'desc' },
  });

  return badges as Badge[];
}
