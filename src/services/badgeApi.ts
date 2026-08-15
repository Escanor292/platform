import type {
  Badge,
  BadgeWithStats,
  UserBadge,
  CreateBadgeInput,
  UpdateBadgeInput,
  AssignBadgeInput,
  RevokeBadgeInput,
  BadgeListQuery,
} from '@/types/badge.types';

const API_BASE = '/api';

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Get all public active badges
 */
export async function getPublicBadges(): Promise<Badge[]> {
  const response = await fetch(`${API_BASE}/badges`);
  if (!response.ok) {
    throw new Error('Failed to fetch badges');
  }
  return response.json();
}

/**
 * Get public badges for a user
 */
export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  const response = await fetch(`${API_BASE}/users/${userId}/badges`);
  if (!response.ok) {
    // Return empty array instead of throwing for 404s (user has no badges)
    if (response.status === 404) {
      return [];
    }
    throw new Error('Failed to fetch user badges');
  }
  return response.json();
}

/**
 * Get current user's badges
 */
export async function getMyBadges(): Promise<UserBadge[]> {
  const response = await fetch(`${API_BASE}/me/badges`);
  if (!response.ok) {
    throw new Error('Failed to fetch my badges');
  }
  return response.json();
}

// ============================================================
// ADMIN API
// ============================================================

/**
 * Get badges list (Admin)
 */
export async function adminGetBadges(
  params?: BadgeListQuery
): Promise<{ badges: BadgeWithStats[]; total: number }> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.search) searchParams.set('search', params.search);
  if (params?.type) searchParams.set('type', params.type);
  if (params?.isActive !== undefined)
    searchParams.set('isActive', params.isActive.toString());

  const response = await fetch(
    `${API_BASE}/admin/badges?${searchParams.toString()}`
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch badges');
  }
  return response.json();
}

/**
 * Get badge by ID (Admin)
 */
export async function adminGetBadgeById(id: string): Promise<BadgeWithStats> {
  const response = await fetch(`${API_BASE}/admin/badges/${id}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch badge');
  }
  return response.json();
}

/**
 * Create badge (Admin)
 */
export async function adminCreateBadge(data: CreateBadgeInput): Promise<Badge> {
  const response = await fetch(`${API_BASE}/admin/badges`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create badge');
  }
  return response.json();
}

/**
 * Update badge (Admin)
 */
export async function adminUpdateBadge(
  id: string,
  data: UpdateBadgeInput
): Promise<Badge> {
  const response = await fetch(`${API_BASE}/admin/badges/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update badge');
  }
  return response.json();
}

/**
 * Delete badge (Admin)
 */
export async function adminDeleteBadge(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/admin/badges/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete badge');
  }
}

/**
 * Assign badge to user (Admin)
 */
export async function adminAssignBadge(
  badgeId: string,
  data: AssignBadgeInput
): Promise<UserBadge> {
  const response = await fetch(`${API_BASE}/admin/badges/${badgeId}/assign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to assign badge');
  }
  return response.json();
}

/**
 * Revoke user badge (Admin)
 */
export async function adminRevokeUserBadge(
  userBadgeId: string,
  data: RevokeBadgeInput
): Promise<UserBadge> {
  const response = await fetch(
    `${API_BASE}/admin/user-badges/${userBadgeId}/revoke`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to revoke badge');
  }
  return response.json();
}

/**
 * Get all badges for a user (Admin)
 */
export async function adminGetUserBadges(userId: string): Promise<UserBadge[]> {
  const response = await fetch(`${API_BASE}/admin/users/${userId}/badges`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch user badges');
  }
  return response.json();
}
