'use client';

import { useState, useMemo } from 'react';
import { formatVND } from "@/lib/utils";
import Link from "next/link";
import { Plus, Rocket, Users, Target, Activity, Zap, Grid, List } from "lucide-react";
import { CreatorCampaignCard } from "@/components/dashboard/CreatorCampaignCard";
import CampaignSearch, { CampaignFilters } from "@/components/dashboard/CampaignSearch";
import CampaignListView from "@/components/dashboard/CampaignListView";

interface Campaign {
    id: string;
    slug: string;
    title: string;
    description: string;
    campaignCode: string;
    imageUrl: string | null;
    category: string;
    type: string;
    status: string;
    currentAmount: number;
    goalAmount: number;
    endDate: Date | null;
    createdAt: Date;
    _count: {
        pledges: number;
    };
}

interface CreatorDashboardClientProps {
    campaigns: Campaign[];
    totalRaised: number;
    totalBackers: number;
}

export default function CreatorDashboardClient({
    campaigns = [], // Default value để tránh undefined
    totalRaised = 0,
    totalBackers = 0
}: CreatorDashboardClientProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<CampaignFilters>({});
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

    // Filter campaigns based on search and filters
    const filteredCampaigns = useMemo(() => {
        // Kiểm tra an toàn cho campaigns
        if (!campaigns || !Array.isArray(campaigns)) {
            return [];
        }

        let filtered = campaigns;

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(campaign =>
                campaign.title.toLowerCase().includes(query) ||
                campaign.description.toLowerCase().includes(query) ||
                campaign.campaignCode.toLowerCase().includes(query)
            );
        }

        // Status filter
        if (filters.status) {
            filtered = filtered.filter(campaign => campaign.status === filters.status);
        }

        // Date range filter
        if (filters.dateRange) {
            const now = new Date();
            const filterDate = new Date();

            switch (filters.dateRange) {
                case 'today':
                    filterDate.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    filterDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    filterDate.setDate(now.getDate() - 30);
                    break;
                case 'quarter':
                    filterDate.setMonth(now.getMonth() - 3);
                    break;
                case 'year':
                    filterDate.setFullYear(now.getFullYear() - 1);
                    break;
            }

            filtered = filtered.filter(campaign =>
                new Date(campaign.createdAt) >= filterDate
            );
        }

        // Amount range filter
        if (filters.amountRange) {
            filtered = filtered.filter(campaign => {
                const amount = campaign.currentAmount;
                switch (filters.amountRange) {
                    case '0-1000000':
                        return amount < 1000000;
                    case '1000000-10000000':
                        return amount >= 1000000 && amount < 10000000;
                    case '10000000-100000000':
                        return amount >= 10000000 && amount < 100000000;
                    case '100000000-1000000000':
                        return amount >= 100000000 && amount < 1000000000;
                    case '1000000000+':
                        return amount >= 1000000000;
                    default:
                        return true;
                }
            });
        }

        return filtered;
    }, [campaigns, searchQuery, filters]);

    return (
        <div className="min-h-screen bg-slate-50/50 pt-32 pb-24 px-6">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-8 animate-fade-in-up">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                            <Zap size={12} fill="currentColor" /> Chế độ Creator Pro
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none">Dự án của tôi</h1>
                        <p className="text-lg text-gray-400 font-medium">Theo dõi và quản lý hành trình sáng tạo của bạn.</p>
                    </div>

                    <Link href="/campaigns/create" className="h-20 px-10 bg-blue-600 text-white font-black rounded-3xl hover:bg-black transition flex items-center gap-3 shadow-xl active:scale-95">
                        <Plus size={24} />
                        Bắt đầu dự án mới
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-soft flex items-center gap-6 group hover:translate-y-[-4px] transition-all">
                        <div className="w-16 h-16 bg-blue-50 rounded-[1.8rem] flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                            <Target size={32} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tổng huy động</div>
                            <div className="text-2xl font-black text-gray-900">{formatVND(totalRaised)}</div>
                        </div>
                    </div>

                    <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-soft flex items-center gap-6 group hover:translate-y-[-4px] transition-all">
                        <div className="w-16 h-16 bg-emerald-50 rounded-[1.8rem] flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-500">
                            <Users size={32} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Người ủng hộ</div>
                            <div className="text-2xl font-black text-gray-900">{totalBackers} Backers</div>
                        </div>
                    </div>

                    <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-soft flex items-center gap-6 group hover:translate-y-[-4px] transition-all">
                        <div className="w-16 h-16 bg-orange-50 rounded-[1.8rem] flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-500">
                            <Activity size={32} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Dự án đang chạy</div>
                            <div className="text-2xl font-black text-gray-900">{(campaigns || []).filter(c => c.status === "ACTIVE").length} / {(campaigns || []).length}</div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <CampaignSearch
                    onSearch={setSearchQuery}
                    onFilter={setFilters}
                    totalCount={filteredCampaigns.length}
                />

                {/* View Mode Toggle & Campaign List */}
                <div className="space-y-6">
                    {/* View Mode Toggle */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">
                            Danh sách dự án ({filteredCampaigns.length})
                        </h2>

                        <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'list'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <List size={16} />
                                Danh sách
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'grid'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Grid size={16} />
                                Lưới
                            </button>
                        </div>
                    </div>

                    {/* Campaign Display */}
                    {filteredCampaigns.length > 0 ? (
                        viewMode === 'list' ? (
                            <CampaignListView campaigns={filteredCampaigns} />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {filteredCampaigns.map((campaign) => (
                                    <CreatorCampaignCard
                                        key={campaign.id}
                                        campaign={campaign}
                                    />
                                ))}
                            </div>
                        )
                    ) : (
                        <div className="py-32 text-center glass-morphism rounded-[3rem]">
                            <Rocket className="mx-auto text-gray-200 mb-6" size={64} />
                            <h3 className="text-2xl font-black text-gray-900 mb-2">
                                {(campaigns || []).length === 0
                                    ? "Thế giới đang chờ đợi ý tưởng của bạn"
                                    : "Không tìm thấy dự án phù hợp"
                                }
                            </h3>
                            <p className="text-gray-400 font-medium mb-10 max-w-sm mx-auto">
                                {(campaigns || []).length === 0
                                    ? "Chưa có dự án nào được khởi tạo. Hãy cùng nhau bắt đầu hành trình thay đổi thế giới ngay!"
                                    : "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để tìm thấy dự án bạn cần."
                                }
                            </p>
                            {(campaigns || []).length === 0 && (
                                <Link href="/campaigns/create" className="h-16 px-12 bg-blue-600 text-white font-black rounded-2xl hover:bg-black transition inline-flex items-center gap-2 shadow-xl active:scale-95">
                                    <Plus size={20} />
                                    Bắt đầu ngay
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}