'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar, Target, Users } from 'lucide-react';

interface CampaignSearchProps {
    onSearch: (query: string) => void;
    onFilter: (filters: CampaignFilters) => void;
    totalCount: number;
}

export interface CampaignFilters {
    status?: string;
    dateRange?: string;
    amountRange?: string;
}

export default function CampaignSearch({ onSearch, onFilter, totalCount }: CampaignSearchProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<CampaignFilters>({});

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            onSearch(searchQuery);
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery, onSearch]);

    const handleFilterChange = (key: keyof CampaignFilters, value: string) => {
        const newFilters = { ...filters, [key]: value || undefined };
        setFilters(newFilters);
        onFilter(newFilters);
    };

    const clearFilters = () => {
        setFilters({});
        onFilter({});
    };

    const hasActiveFilters = Object.values(filters).some(value => value);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            {/* Search Bar */}
            <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm dự án theo tên, mã dự án..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${showFilters || hasActiveFilters
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <Filter size={16} />
                    Bộ lọc
                    {hasActiveFilters && (
                        <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full">
                            {Object.values(filters).filter(Boolean).length}
                        </span>
                    )}
                </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="border-t border-gray-100 pt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Trạng thái
                            </label>
                            <select
                                value={filters.status || ''}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="DRAFT">Bản nháp</option>
                                <option value="ACTIVE">Đang chạy</option>
                                <option value="COMPLETED">Hoàn thành</option>
                                <option value="CANCELLED">Đã hủy</option>
                            </select>
                        </div>

                        {/* Date Range Filter */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Thời gian tạo
                            </label>
                            <select
                                value={filters.dateRange || ''}
                                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">Tất cả thời gian</option>
                                <option value="today">Hôm nay</option>
                                <option value="week">7 ngày qua</option>
                                <option value="month">30 ngày qua</option>
                                <option value="quarter">3 tháng qua</option>
                                <option value="year">Năm nay</option>
                            </select>
                        </div>

                        {/* Amount Range Filter */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Mức huy động
                            </label>
                            <select
                                value={filters.amountRange || ''}
                                onChange={(e) => handleFilterChange('amountRange', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">Tất cả mức</option>
                                <option value="0-1000000">Dưới 1 triệu</option>
                                <option value="1000000-10000000">1 - 10 triệu</option>
                                <option value="10000000-100000000">10 - 100 triệu</option>
                                <option value="100000000-1000000000">100 triệu - 1 tỷ</option>
                                <option value="1000000000+">Trên 1 tỷ</option>
                            </select>
                        </div>
                    </div>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                        <div className="flex justify-end">
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                <X size={14} />
                                Xóa bộ lọc
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Results Count */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-600">
                    Hiển thị <span className="font-semibold">{totalCount}</span> dự án
                    {searchQuery && (
                        <span> cho "<span className="font-semibold">{searchQuery}</span>"</span>
                    )}
                </div>

                {(searchQuery || hasActiveFilters) && (
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            clearFilters();
                        }}
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                        Xóa tất cả
                    </button>
                )}
            </div>
        </div>
    );
}