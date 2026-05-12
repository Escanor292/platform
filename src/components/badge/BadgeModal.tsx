'use client';

import React from 'react';
import { X } from 'lucide-react';
import { BadgePill } from './BadgePill';
import type { UserBadge } from '@/types/badge.types';
import { format } from 'date-fns';

interface BadgeModalProps {
  userBadge: UserBadge;
  isOpen: boolean;
  onClose: () => void;
}

export function BadgeModal({ userBadge, isOpen, onClose }: BadgeModalProps) {
  if (!isOpen || !userBadge.badge) return null;

  const { badge } = userBadge;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge display */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-4">
            <BadgePill badge={badge} size="lg" showLabel={false} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {badge.name}
          </h2>
          {badge.description && (
            <p className="text-gray-600">{badge.description}</p>
          )}
        </div>

        {/* Badge details */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Loại:</span>
            <span className="font-medium text-gray-900">
              {badge.type === 'custom' ? 'Tùy chỉnh' : 'Thành tựu'}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Độ hiếm:</span>
            <span className="font-medium text-gray-900 capitalize">
              {badge.rarity === 'common' && 'Phổ thông'}
              {badge.rarity === 'rare' && 'Hiếm'}
              {badge.rarity === 'epic' && 'Sử thi'}
              {badge.rarity === 'legendary' && 'Huyền thoại'}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Nhận được:</span>
            <span className="font-medium text-gray-900">
              {format(new Date(userBadge.assignedAt), 'dd/MM/yyyy')}
            </span>
          </div>

          {userBadge.reason && (
            <div className="text-sm">
              <span className="text-gray-500 block mb-1">Lý do:</span>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">
                {userBadge.reason}
              </p>
            </div>
          )}

          {userBadge.expiresAt && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Hết hạn:</span>
              <span className="font-medium text-gray-900">
                {format(new Date(userBadge.expiresAt), 'dd/MM/yyyy')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
