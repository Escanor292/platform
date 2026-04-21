'use client';

import { Users, Star, Clock, TrendingUp } from 'lucide-react';

interface CampaignStatsProps {
    totalBackers: number;
    totalFollowers: number;
    daysRemaining?: number;
    progressPercent: number;
    currentAmount: number;
    goalAmount: number;
    className?: string;
}

export default function CampaignStats({
    totalBackers,
    totalFollowers,
    daysRemaining,
    progressPercent,
    currentAmount,
    goalAmount,
    className = ""
}: CampaignStatsProps) {
    const formatAmount = (amount: number) => {
        if (amount >= 1_000_000_000) {
            return `${(amount / 1_000_000_000).toFixed(1)} tỷ`;
        } else if (amount >= 1_000_000) {
            return `${(amount / 1_000_000).toFixed(1)} triệu`;
        } else {
            return amount.toLocaleString('vi-VN');
        }
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Progress Bar */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-900">
                        {formatAmount(currentAmount)} đ
                    </span>
                    <span className="text-lg font-semibold text-green-600">
                        {progressPercent.toFixed(1)}%
                    </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${Math.min(progressPercent, 100)}%` }}
                    />
                </div>

                <div className="flex justify-between text-sm text-gray-600">
                    <span>Đã huy động</span>
                    <span>Mục tiêu: {formatAmount(goalAmount)} đ</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                {/* Backers */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-blue-800">Người ủng hộ</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                        {totalBackers.toLocaleString('vi-VN')}
                    </div>
                </div>

                {/* Followers */}
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Star className="w-4 h-4 text-yellow-600" />
                        </div>
                        <span className="text-sm font-medium text-yellow-800">Người quan tâm</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-900">
                        {totalFollowers.toLocaleString('vi-VN')}
                    </div>
                </div>

                {/* Days Remaining */}
                {daysRemaining !== undefined && (
                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-4 h-4 text-purple-600" />
                            </div>
                            <span className="text-sm font-medium text-purple-800">Ngày còn lại</span>
                        </div>
                        <div className="text-2xl font-bold text-purple-900">
                            {daysRemaining > 0 ? daysRemaining : 'Hết hạn'}
                        </div>
                    </div>
                )}

                {/* Progress */}
                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-green-800">Sắp đạt mục tiêu</span>
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                        {progressPercent.toFixed(1)}%
                    </div>
                </div>
            </div>
        </div>
    );
}