'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { adminCreateBadge } from '@/services/badgeApi';
import type { CreateBadgeInput, BadgeType, BadgeRarity } from '@/types/badge.types';
import { BadgePill } from '@/components/badge/BadgePill';
import { toast } from 'sonner';

export default function CreateBadgePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateBadgeInput>({
    name: '',
    description: '',
    iconUrl: '',
    iconName: '',
    color: '#3b82f6',
    backgroundColor: '#dbeafe',
    type: 'custom',
    rarity: 'common',
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await adminCreateBadge(formData);
      toast.success('Đã tạo huy hiệu thành công');
      router.push('/dashboard/admin/badges');
    } catch (error: any) {
      toast.error(error.message || 'Không thể tạo huy hiệu');
    } finally {
      setLoading(false);
    }
  };

  // Preview badge
  const previewBadge = {
    id: 'preview',
    slug: 'preview',
    ...formData,
    createdBy: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Quay lại
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Tạo huy hiệu mới
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
              placeholder="Ví dụ: Top Donor"
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
              placeholder="Mô tả về huy hiệu này..."
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
            <p className="text-sm text-gray-500 mt-1">
              {formData.type === 'custom'
                ? 'Huy hiệu tùy chỉnh do admin tạo'
                : 'Huy hiệu thành tựu để ghi nhận thành tích'}
            </p>
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
              placeholder="https://example.com/icon.png"
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
              placeholder="🏆"
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
              Kích hoạt ngay
            </label>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Đang tạo...' : 'Tạo huy hiệu'}
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
              <BadgePill badge={previewBadge} size="lg" className="mb-4" />
              <h4 className="font-bold text-lg text-gray-900 mb-2">
                {formData.name || 'Tên huy hiệu'}
              </h4>
              <p className="text-sm text-gray-600">
                {formData.description || 'Mô tả huy hiệu'}
              </p>
              <div className="mt-4 text-xs text-gray-500">
                <div>
                  Loại:{' '}
                  {formData.type === 'custom' ? 'Tùy chỉnh' : 'Thành tựu'}
                </div>
                <div className="capitalize">Độ hiếm: {formData.rarity}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
