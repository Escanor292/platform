'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { Badge, BadgeRarity, BadgeType } from '@/types/badge.types';
import { Award, Trophy, Star, Crown } from 'lucide-react';

interface BadgePillProps {
  badge: Badge;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  onClick?: () => void;
}

const rarityColors: Record<BadgeRarity, string> = {
  common: 'bg-gray-100 text-gray-700 border-gray-300',
  rare: 'bg-blue-100 text-blue-700 border-blue-300',
  epic: 'bg-purple-100 text-purple-700 border-purple-300',
  legendary: 'bg-amber-100 text-amber-700 border-amber-300',
};

const rarityIcons: Record<BadgeRarity, React.ReactNode> = {
  common: <Award className="w-4 h-4" />,
  rare: <Star className="w-4 h-4" />,
  epic: <Trophy className="w-4 h-4" />,
  legendary: <Crown className="w-4 h-4" />,
};

const sizeClasses = {
  sm: 'text-xs px-2 py-1 gap-1',
  md: 'text-sm px-3 py-1.5 gap-1.5',
  lg: 'text-base px-4 py-2 gap-2',
};

const iconSizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export function BadgePill({
  badge,
  size = 'md',
  showLabel = true,
  className,
  onClick,
}: BadgePillProps) {
  const customStyle = badge.backgroundColor && badge.color
    ? {
        backgroundColor: badge.backgroundColor,
        color: badge.color,
        borderColor: badge.color,
      }
    : undefined;

  const defaultColorClass = !customStyle ? rarityColors[badge.rarity] : '';

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border font-medium transition-all',
        sizeClasses[size],
        defaultColorClass,
        onClick && 'cursor-pointer hover:shadow-md',
        className
      )}
      style={customStyle}
      onClick={onClick}
      title={badge.description || badge.name}
    >
      {/* Icon */}
      {badge.iconUrl ? (
        <img
          src={badge.iconUrl}
          alt={badge.name}
          className={cn('rounded-full object-cover', iconSizeClasses[size])}
        />
      ) : badge.iconName ? (
        <span className={iconSizeClasses[size]}>{badge.iconName}</span>
      ) : (
        <span className={iconSizeClasses[size]}>
          {rarityIcons[badge.rarity]}
        </span>
      )}

      {/* Label */}
      {showLabel && <span className="font-semibold">{badge.name}</span>}

      {/* Type indicator for achievement badges */}
      {badge.type === 'achievement' && (
        <span className="text-xs opacity-75">🏆</span>
      )}
    </div>
  );
}
