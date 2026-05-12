import type { User } from '@prisma/client';

/**
 * Check if user is admin
 */
export function isAdmin(user: User | null | undefined): boolean {
  return user?.isAdmin === true;
}

/**
 * Require admin role
 */
export function requireAdmin(user: User | null | undefined): void {
  if (!isAdmin(user)) {
    throw new Error('Admin access required');
  }
}

/**
 * Check if user can manage badges
 */
export function canManageBadges(user: User | null | undefined): boolean {
  return isAdmin(user);
}

/**
 * Check if user can assign badges
 */
export function canAssignBadges(user: User | null | undefined): boolean {
  return isAdmin(user);
}

/**
 * Check if user can revoke badges
 */
export function canRevokeBadges(user: User | null | undefined): boolean {
  return isAdmin(user);
}

/**
 * Check if user can view badge details
 */
export function canViewBadgeDetails(user: User | null | undefined): boolean {
  // Anyone can view public badge details
  return true;
}

/**
 * Check if user can view user's badges
 */
export function canViewUserBadges(
  viewer: User | null | undefined,
  targetUserId: string
): boolean {
  // Anyone can view public badges
  // Admin can view all badges
  return true;
}
