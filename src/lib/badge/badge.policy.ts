import type { users } from '@prisma/client';

/**
 * Check if user is admin
 */
export function isAdmin(user: users | null | undefined): boolean {
  return user?.isAdmin === true;
}

/**
 * Require admin role
 */
export function requireAdmin(user: users | null | undefined): void {
  if (!isAdmin(user)) {
    throw new Error('Admin access required');
  }
}

/**
 * Check if user can manage badges
 */
export function canManageBadges(user: users | null | undefined): boolean {
  return isAdmin(user);
}

/**
 * Check if user can assign badges
 */
export function canAssignBadges(user: users | null | undefined): boolean {
  return isAdmin(user);
}

/**
 * Check if user can revoke badges
 */
export function canRevokeBadges(user: users | null | undefined): boolean {
  return isAdmin(user);
}

/**
 * Check if user can view badge details
 */
export function canViewBadgeDetails(user: users | null | undefined): boolean {
  // Anyone can view public badge details
  return true;
}

/**
 * Check if user can view user's badges
 */
export function canViewUserBadges(
  viewer: users | null | undefined,
  targetUserId: string
): boolean {
  // Anyone can view public badges
  // Admin can view all badges
  return true;
}
