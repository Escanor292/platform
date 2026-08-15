'use client';

import React, { useEffect, useState } from 'react';
import { BadgePill } from './BadgePill';
import { getUserBadges } from '@/services/badgeApi';
import type { UserBadge } from '@/types/badge.types';
import { cn } from '@/lib/utils';

interface UserBadgeListProps {
  userId: string;
  maxDisplay?: number;
  compact?: boolean;
  className?: string;
  onBadgeClick?: (badge: UserBadge) => void;
}

export function UserBadgeList({
  userId,
  maxDisplay = 5,
  compact = false,
  className,
  onBadgeClick,
}: UserBadgeListProps) {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBadges() {
      try {
        setLoading(true);
        const data = await getUserBadges(userId);
        setBadges(data);
        setError(null);
      } catch (err: any) {
        // Silent fail - don't log to console, just set error state
        setError(err.message);
        setBadges([]);
      } finally {
        setLoading(false);
      }
    }

    fetchBadges();
  }, [userId]);

  if (loading) {
    return (
      <div className={cn('flex gap-2', className)}>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-8 w-20 bg-gray-200 rounded-full animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error || badges.length === 0) {
    return null;
  }

  const displayBadges = badges.slice(0, maxDisplay);
  const remainingCount = badges.length - maxDisplay;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {displayBadges.map((userBadge) =>
        userBadge.badge ? (
          <BadgePill
            key={userBadge.id}
            badge={userBadge.badge}
            size={compact ? 'sm' : 'md'}
            showLabel={!compact}
            onClick={onBadgeClick ? () => onBadgeClick(userBadge) : undefined}
          />
        ) : null
      )}

      {remainingCount > 0 && (
        <span className="text-sm text-gray-500 font-medium">
          +{remainingCount}
        </span>
      )}
    </div>
  );
}
