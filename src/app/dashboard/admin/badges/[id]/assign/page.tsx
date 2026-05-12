'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Search } from 'lucide-react';
import {
  adminGetBadgeById,
  adminAssignBadge,
  adminGetUserBadges,
} from '@/services/badgeApi';
import { prisma } from '@/lib/prisma';
import type { BadgeWithStats, AssignBadgeInput } from '@/types/badge.types';
import { BadgePill } from '@/components/badge/BadgePill';
import { toast } from 'sonner';

export default function AssignBadgePage() {
  const router = useRouter();
  const params = useParams();
  const badgeId = params.id as string;

  const [badge, setBadge] = useState<BadgeWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [formData, setFormData] = useState<Omit<AssignBadgeInput, 'userId'>>({
    reason: '',
    note: '',
    expiresAt: '',
  });

  useEffect(() => {
    fetchBadge();
  }, [badgeId]);

  async function fetchBadge() {
    try {
      setLoading(true);
      const data = await adminGetBadgeById(badgeId);
      setBadge(data);
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải huy hiệu');
      router.back();
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedUserId) {
      toast.error('Vui lòng chọn người dùng');
      return;
    }

    try {
      setSubmitting(true);
      await adminAssignBadge(badgeId, {
        userId: selectedUserId,
        ...formData,
      });
      toast.success('Đã gắn huy hiệu thành công');
      router.push('/dashboard/admin/badges');
    } catch (error: any) {
      toast.error(error.message || 'Không thể gắn huy hiệu');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !badge) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Quay lại
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Gắn huy hiệu cho thành viên
      </h1>

      {/* Badge info */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center gap-4">
          <BadgePill badge={badge} size="lg" />
          <div>
            <h3 className="font-semibold text-gray-900">{badge.name}</h3>
            {badge.description && (
              <p className="text-sm text-gray-600">{badge.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* User selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn người dùng <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              required
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập User ID"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Nhập ID của người dùng cần gắn huy hiệu
          </p>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lý do
          </label>
          <textarea
            rows={3}
            maxLength={500}
            value={formData.reason}
            onChange={(e) =>
              setFormData({ ...formData, reason: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Lý do gắn huy hiệu này..."
          />
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ghi chú (nội bộ)
          </label>
          <textarea
            rows={2}
            maxLength={500}
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Ghi chú cho admin..."
          />
        </div>

        {/* Expires at */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ngày hết hạn (tùy chọn)
          </label>
          <input
            type="datetime-local"
            value={formData.expiresAt}
            onChange={(e) =>
              setFormData({ ...formData, expiresAt: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            Để trống nếu huy hiệu không có thời hạn
          </p>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {submitting ? 'Đang gắn...' : 'Gắn huy hiệu'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border rounded-lg hover:bg-gray-50"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
