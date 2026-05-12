'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter, Edit, Trash2, Award } from 'lucide-react';
import { adminGetBadges, adminDeleteBadge } from '@/services/badgeApi';
import type { BadgeWithStats, BadgeType } from '@/types/badge.types';
import { BadgePill } from '@/components/badge/BadgePill';
import { toast } from 'sonner';

export default function AdminBadgesPage() {
  const router = useRouter();
  const [badges, setBadges] = useState<BadgeWithStats[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<BadgeType | ''>('');
  const [activeFilter, setActiveFilter] = useState<boolean | ''>('');
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    fetchBadges();
  }, [page, search, typeFilter, activeFilter]);

  async function fetchBadges() {
    try {
      setLoading(true);
      const data = await adminGetBadges({
        page,
        limit,
        search: search || undefined,
        type: typeFilter || undefined,
        isActive: activeFilter === '' ? undefined : activeFilter,
      });
      setBadges(data.badges);
      setTotal(data.total);
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải danh sách huy hiệu');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(badgeId: string) {
    if (!confirm('Bạn có chắc muốn xóa huy hiệu này?')) return;

    try {
      await adminDeleteBadge(badgeId);
      toast.success('Đã xóa huy hiệu');
      fetchBadges();
    } catch (error: any) {
      toast.error(error.message || 'Không thể xóa huy hiệu');
    }
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-8 h-8" />
            Quản lý Huy hiệu
          </h1>
          <p className="text-gray-600 mt-1">
            Tạo và quản lý huy hiệu cho thành viên
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/admin/badges/create')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Tạo huy hiệu
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as BadgeType | '');
              setPage(1);
            }}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả loại</option>
            <option value="custom">Tùy chỉnh</option>
            <option value="achievement">Thành tựu</option>
          </select>

          {/* Active filter */}
          <select
            value={activeFilter === '' ? '' : activeFilter ? 'true' : 'false'}
            onChange={(e) => {
              setActiveFilter(
                e.target.value === '' ? '' : e.target.value === 'true'
              );
              setPage(1);
            }}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="true">Đang hoạt động</option>
            <option value="false">Không hoạt động</option>
          </select>

          {/* Stats */}
          <div className="flex items-center justify-end text-sm text-gray-600">
            Tổng: <span className="font-semibold ml-1">{total}</span> huy hiệu
          </div>
        </div>
      </div>

      {/* Badge list */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow p-6 animate-pulse"
            >
              <div className="h-8 bg-gray-200 rounded mb-4" />
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : badges.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Chưa có huy hiệu nào</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
              >
                {/* Badge preview */}
                <div className="flex items-start justify-between mb-4">
                  <BadgePill badge={badge} size="lg" />
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        router.push(`/dashboard/admin/badges/${badge.id}/edit`)
                      }
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Sửa"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(badge.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Badge info */}
                <h3 className="font-semibold text-gray-900 mb-2">
                  {badge.name}
                </h3>
                {badge.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {badge.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-sm border-t pt-4">
                  <div>
                    <span className="text-gray-500">Loại: </span>
                    <span className="font-medium">
                      {badge.type === 'custom' ? 'Tùy chỉnh' : 'Thành tựu'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Người dùng: </span>
                    <span className="font-semibold text-blue-600">
                      {badge.userCount || 0}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="mt-3">
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${
                      badge.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {badge.isActive ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </div>

                {/* Actions */}
                <button
                  onClick={() =>
                    router.push(`/dashboard/admin/badges/${badge.id}/assign`)
                  }
                  className="w-full mt-4 bg-blue-50 text-blue-600 px-4 py-2 rounded hover:bg-blue-100 transition text-sm font-medium"
                >
                  Gắn huy hiệu
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Trước
              </button>
              <span className="px-4 py-2">
                Trang {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
