'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { adminGetBadgeById, adminUpdateBadge } from '@/services/badgeApi';
import type { BadgeWithStats, UpdateBadgeInput, BadgeType, BadgeRarity } from '@/types/badge.types';
import { BadgePill } from '@/components/badge/BadgePill';
import { toast } from 'sonner';

export default function EditBadgePage() {
  const router = useRouter();
  const params = useParams();
  const badgeId = params.id as string;

  const [badge, setBadge] = useState<BadgeWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<UpdateBadgeInput>({});

  useEffect(() => {
    fetchBadge();
  }, [badgeId]);

  async function fetchBadge() {
    try {
      setLoading(true);
      const data = await adminGetBadgeById(badgeId);
      setBadge(data);
      setFormData({
        name: data.name,
        description: data.description || '',
        iconUrl: data.iconUrl || '',
        iconName: data.iconName || '',
        color: data.color || '#3b82f6',
        backgroundColor: data.backgroundColor || '#dbeafe',
        type: data.type,
        rarity: data.rarity,
        isActive: data.isActive,
      });
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải huy hiệu');
      router.back();
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSubmitting(true);
      await adminUpdateBadge(badgeId, formData);
      toast.success('Đã cập nhật huy hiệu thành công');
      router.push('/dashboard/admin/badges');
    } catch (error: any) {
      toast.error(error.message || 'Không thể cập nhật huy hiệu');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !badge) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8" />
          <div className="h-96 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  // Preview badge
  const previewBadge = {
    ...badge,
    ...formData,
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Quay lại
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Chỉnh sửa huy hiệu
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên huy hiệu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={100}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              rows={3}
              maxLength={1000}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại huy hiệu <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as BadgeType })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="custom">Tùy chỉnh</option>
              <option value="achievement">Thành tựu</option>
            </select>
          </div>

          {/* Rarity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Độ hiếm
            </label>
            <select
              value={formData.rarity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  rarity: e.target.value as BadgeRarity,
                })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="common">Phổ thông</option>
              <option value="rare">Hiếm</option>
              <option value="epic">Sử thi</option>
              <option value="legendary">Huyền thoại</option>
            </select>
          </div>

          {/* Icon URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Icon
            </label>
            <input
              type="url"
              value={formData.iconUrl}
              onChange={(e) =>
                setFormData({ ...formData, iconUrl: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Icon Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên Icon (emoji hoặc text)
            </label>
            <input
              type="text"
              maxLength={100}
              value={formData.iconName}
              onChange={(e) =>
                setFormData({ ...formData, iconName: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Màu chữ
              </label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                className="w-full h-10 border rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Màu nền
              </label>
              <input
                type="color"
                value={formData.backgroundColor}
                onChange={(e) =>
                  setFormData({ ...formData, backgroundColor: e.target.value })
                }
                className="w-full h-10 border rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Is Active */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Đang hoạt động
            </label>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
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

        {/* Preview */}
        <div className="lg:sticky lg:top-8 h-fit">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Xem trước</h3>
            <div className="bg-white rounded-lg p-8 flex flex-col items-center text-center">
              <BadgePill badge={previewBadge as any} size="lg" className="mb-4" />
              <h4 className="font-bold text-lg text-gray-900 mb-2">
                {formData.name || badge.name}
              </h4>
              <p className="text-sm text-gray-600">
                {formData.description || badge.description}
              </p>
              <div className="mt-4 text-xs text-gray-500">
                <div>
                  Loại:{' '}
                  {formData.type === 'custom' ? 'Tùy chỉnh' : 'Thành tựu'}
                </div>
                <div className="capitalize">Độ hiếm: {formData.rarity}</div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-500">
                  Người dùng hiện tại: <strong>{badge.userCount || 0}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
