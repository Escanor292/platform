"use client";

import { useState } from "react";
import Link from "next/link";
import { formatVND, formatDate } from "@/lib/utils";
import {
    Edit,
    Trash2,
    Eye,
    EyeOff,
    Package,
    Calendar,
    Users,
    Gift,
    AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface Reward {
    id: string;
    title: string;
    description: string | null;
    minAmount: number;
    maxQuantity: number | null;
    deliveryDate: Date | null;
    isActive: boolean;
    createdAt: Date;
    _count: {
        pledges: number;
    };
}

interface Campaign {
    id: string;
    slug: string;
    title: string;
    campaignCode: string;
    status: string;
    rewards: Reward[];
}

interface RewardsManagementClientProps {
    campaign: Campaign;
}

export default function RewardsManagementClient({ campaign }: RewardsManagementClientProps) {
    const [rewards, setRewards] = useState(campaign.rewards);
    const [isLoading, setIsLoading] = useState(false);

    const toggleRewardStatus = async (rewardId: string, currentStatus: boolean) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/rewards/${rewardId}/toggle`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isActive: !currentStatus }),
            });

            if (!response.ok) throw new Error('Failed to update reward status');

            setRewards(prev => prev.map(reward =>
                reward.id === rewardId
                    ? { ...reward, isActive: !currentStatus }
                    : reward
            ));

            toast.success(
                !currentStatus ? 'Đã kích hoạt quà tặng' : 'Đã tạm dừng quà tặng'
            );
        } catch (error) {
            toast.error('Lỗi cập nhật trạng thái quà tặng');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteReward = async (rewardId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa quà tặng này?')) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/rewards/${rewardId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete reward');

            setRewards(prev => prev.filter(reward => reward.id !== rewardId));
            toast.success('Đã xóa quà tặng');
        } catch (error) {
            toast.error('Lỗi xóa quà tặng');
        } finally {
            setIsLoading(false);
        }
    };

    if (rewards.length === 0) {
        return (
            <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
                <div className="w-20 h-20 bg-pgreen/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Gift className="text-pgreen" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Chưa có quà tặng nào
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Tạo các gói quà tặng hấp dẫn để thu hút người ủng hộ cho chiến dịch của bạn
                </p>
                <Link
                    href={`/dashboard/creator/rewards/${campaign.slug}/create`}
                    className="inline-flex items-center gap-2 px-6 py-3 gradient-green text-white rounded-2xl font-semibold hover:shadow-lg hover:shadow-green-200 transition"
                >
                    <Gift size={20} />
                    Tạo quà tặng đầu tiên
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <div className="col-span-4">Quà tặng</div>
                    <div className="col-span-2">Giá trị tối thiểu</div>
                    <div className="col-span-2">Số lượng</div>
                    <div className="col-span-2">Trạng thái</div>
                    <div className="col-span-2">Thao tác</div>
                </div>
            </div>

            {/* Rewards List */}
            <div className="divide-y divide-gray-100">
                {rewards.map((reward) => (
                    <div key={reward.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                        <div className="grid grid-cols-12 gap-4 items-center">

                            {/* Reward Info */}
                            <div className="col-span-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-pgreen to-fgreen rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Gift className="text-white" size={20} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-semibold text-gray-900 line-clamp-1">
                                            {reward.title}
                                        </h4>
                                        {reward.description && (
                                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                                                {reward.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-xs text-gray-400">
                                                Tạo: {formatDate(reward.createdAt)}
                                            </span>
                                            {reward.deliveryDate && (
                                                <>
                                                    <span className="text-xs text-gray-300">•</span>
                                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                                        <Calendar size={12} />
                                                        Giao: {formatDate(reward.deliveryDate)}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Min Amount */}
                            <div className="col-span-2">
                                <div className="flex items-center gap-1">
                                    <span className="text-gray-400 font-bold text-sm">₫</span>
                                    <span className="font-semibold text-gray-900">
                                        {formatVND(reward.minAmount)}
                                    </span>
                                </div>
                            </div>

                            {/* Quantity */}
                            <div className="col-span-2">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1">
                                        <Package size={14} className="text-gray-400" />
                                        <span className="font-semibold text-gray-900">
                                            {reward.maxQuantity ? reward.maxQuantity.toLocaleString('vi-VN') : 'Không giới hạn'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Users size={12} />
                                        {reward._count.pledges} lượt chọn
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="col-span-2">
                                <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${reward.isActive
                                        ? 'bg-green-100 text-green-600'
                                        : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {reward.isActive ? (
                                            <>
                                                <Eye size={12} />
                                                Hoạt động
                                            </>
                                        ) : (
                                            <>
                                                <EyeOff size={12} />
                                                Tạm dừng
                                            </>
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="col-span-2">
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/dashboard/creator/rewards/${campaign.slug}/edit/${reward.id}`}
                                        className="p-2 text-gray-400 hover:text-pgreen hover:bg-pgreen/10 rounded-lg transition-colors"
                                        title="Chỉnh sửa"
                                    >
                                        <Edit size={16} />
                                    </Link>

                                    <button
                                        onClick={() => toggleRewardStatus(reward.id, reward.isActive)}
                                        disabled={isLoading}
                                        className={`p-2 rounded-lg transition-colors ${reward.isActive
                                            ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                                            : 'text-gray-400 hover:text-pgreen hover:bg-pgreen/10'
                                            }`}
                                        title={reward.isActive ? 'Tạm dừng' : 'Kích hoạt'}
                                    >
                                        {reward.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>

                                    <button
                                        onClick={() => deleteReward(reward.id)}
                                        disabled={isLoading || reward._count.pledges > 0}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={reward._count.pledges > 0 ? 'Không thể xóa (đã có người chọn)' : 'Xóa'}
                                    >
                                        {reward._count.pledges > 0 ? <AlertCircle size={16} /> : <Trash2 size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}