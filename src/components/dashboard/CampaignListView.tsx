'use client';

import Link from 'next/link';
import { formatVND, formatDate } from '@/lib/utils';
import {
    Calendar,
    Users,
    Target,
    Edit,
    BarChart3,
    Eye,
    Clock,
    CheckCircle,
    XCircle,
    FileText,
    TrendingUp,
    Gift
} from 'lucide-react';
import { CampaignGrowthProgress } from '@/components/campaign/CampaignGrowthProgress';

interface Campaign {
    id: string;
    slug: string;
    title: string;
    description: string;
    campaignCode: string;
    imageUrl: string | null;
    status: string;
    currentAmount: number;
    goalAmount: number;
    endDate: Date | null;
    createdAt: Date;
    _count: {
        pledges: number;
    };
}

interface CampaignListViewProps {
    campaigns: Campaign[];
}

export default function CampaignListView({ campaigns }: CampaignListViewProps) {
    const getStatusBadge = (status: string) => {
        const statusConfig = {
            DRAFT: {
                label: 'Bản nháp',
                color: 'bg-gray-100 text-gray-600',
                icon: FileText
            },
            ACTIVE: {
                label: 'Đang chạy',
                color: 'bg-emerald-100 text-emerald-600',
                icon: TrendingUp
            },
            COMPLETED: {
                label: 'Hoàn thành',
                color: 'bg-blue-100 text-blue-600',
                icon: CheckCircle
            },
            CANCELLED: {
                label: 'Đã hủy',
                color: 'bg-red-100 text-red-600',
                icon: XCircle
            }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
                <Icon size={12} />
                {config.label}
            </span>
        );
    };

    const getProgressPercentage = (current: number, goal: number) => {
        return Math.min((current / goal) * 100, 100);
    };

    const getDaysLeft = (endDate?: Date | null) => {
        if (!endDate) return null;
        const now = new Date();
        const end = new Date(endDate);
        const diffTime = end.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    if (campaigns.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <FileText className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy dự án</h3>
                <p className="text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <div className="col-span-4">Dự án</div>
                    <div className="col-span-2">Trạng thái</div>
                    <div className="col-span-2">Tiến độ</div>
                    <div className="col-span-2">Thống kê</div>
                    <div className="col-span-2">Thao tác</div>
                </div>
            </div>

            {/* Campaign List */}
            <div className="divide-y divide-gray-100">
                {campaigns.map((campaign) => {
                    const progress = getProgressPercentage(campaign.currentAmount, campaign.goalAmount);
                    const daysLeft = getDaysLeft(campaign.endDate);

                    return (
                        <div key={campaign.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                            <div className="grid grid-cols-12 gap-4 items-center">

                                {/* Campaign Info */}
                                <div className="col-span-4">
                                    <div className="flex items-center gap-4">
                                        {/* Campaign Image */}
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                            {campaign.imageUrl ? (
                                                <img
                                                    src={campaign.imageUrl}
                                                    alt={campaign.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                                                    <Target className="text-white" size={20} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Campaign Details */}
                                        <div className="min-w-0 flex-1">
                                            <Link
                                                href={`/campaigns/${campaign.slug}`}
                                                className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors line-clamp-1"
                                            >
                                                {campaign.title}
                                            </Link>
                                            <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                                                {campaign.description}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-xs text-gray-400 font-mono">
                                                    #{campaign.campaignCode}
                                                </span>
                                                <span className="text-xs text-gray-300">•</span>
                                                <span className="text-xs text-gray-400">
                                                    {formatDate(campaign.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="col-span-2">
                                    {getStatusBadge(campaign.status)}
                                    {daysLeft !== null && campaign.status === 'ACTIVE' && (
                                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                            <Clock size={12} />
                                            {daysLeft > 0 ? `${daysLeft} ngày` : 'Hết hạn'}
                                        </div>
                                    )}
                                </div>

                                {/* Progress */}
                                <div className="col-span-2">
                                    <CampaignGrowthProgress
                                        currentAmount={campaign.currentAmount}
                                        goalAmount={campaign.goalAmount}
                                        variant="compact"
                                        size="sm"
                                        showTree={false}
                                    />
                                    <div className="text-[10px] text-gray-500 mt-1 uppercase font-black tracking-widest">
                                        Mục tiêu: {formatVND(campaign.goalAmount)}
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="col-span-2">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1 text-sm">
                                            <Users size={14} className="text-gray-400" />
                                            <span className="font-semibold text-gray-900">
                                                {campaign._count.pledges}
                                            </span>
                                            <span className="text-gray-500 text-xs">người ủng hộ</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="col-span-2">
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/campaigns/${campaign.slug}`}
                                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                            title="Xem dự án"
                                        >
                                            <Eye size={16} />
                                        </Link>

                                        <Link
                                            href={`/dashboard/creator/edit/${campaign.slug}`}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Chỉnh sửa"
                                        >
                                            <Edit size={16} />
                                        </Link>

                                        <Link
                                            href={`/dashboard/creator/rewards/${campaign.slug}`}
                                            className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                            title="Quà tặng"
                                        >
                                            <Gift size={16} />
                                        </Link>

                                        <Link
                                            href={`/dashboard/creator/statement/${campaign.id}`}
                                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                            title="Báo cáo"
                                        >
                                            <BarChart3 size={16} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}