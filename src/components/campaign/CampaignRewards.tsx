'use client';

import { formatVND } from "@/lib/utils";
import { Gift, Users, Clock } from "lucide-react";
import { useCampaignContext } from "@/contexts/CampaignContext";

interface Reward {
    id: string;
    title: string;
    description?: string | null;
    minAmount: number;
    estimatedDelivery?: string | null;
    limitQuantity?: number | null;
    claimedCount?: number;
}

interface CampaignRewardsProps {
    rewards: Reward[];
    selectedRewardId?: string;
}

export default function CampaignRewards({
    rewards,
    selectedRewardId
}: CampaignRewardsProps) {
    const { openRewardDonation } = useCampaignContext();
    if (!rewards || rewards.length === 0) {
        return (
            <div className="glass rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pgreen/10 text-pgreen">
                        <Gift className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-display text-2xl font-bold text-dblue">Phần quà</h3>
                        <p className="text-sm text-gray-500">Chọn mức ủng hộ phù hợp để đồng hành cùng dự án</p>
                    </div>
                </div>
                <div className="text-center py-8">
                    <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Chưa có phần quà</p>
                    <p className="text-gray-400 text-xs mt-1">
                        Bạn vẫn có thể ủng hộ dự án bằng mức đóng góp tự chọn.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-3xl border border-pgreen/10 bg-white p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pgreen/10 text-pgreen">
                        <Gift className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="font-display text-2xl font-bold text-dblue">
                            Phần quà
                        </h2>
                        <p className="text-sm text-gray-500">
                            Chọn mức ủng hộ phù hợp để đồng hành cùng dự án
                        </p>
                    </div>
                </div>
                <span className="rounded-full bg-cream px-3 py-1 text-xs font-bold text-pgreen">
                    {rewards.length} gói
                </span>
            </div>

            <div className="space-y-4">
                {rewards.map((reward, index) => {
                    const isSelected = selectedRewardId === reward.id;
                    const remainingQuantity = reward.limitQuantity
                        ? reward.limitQuantity - (reward.claimedCount || 0)
                        : null;
                    const isAvailable = !reward.limitQuantity || (remainingQuantity && remainingQuantity > 0);

                    // Simple badge logic based on index
                    let badge = null;
                    if (rewards.length > 1) {
                        if (index === 0) {
                            badge = <span className="rounded-full bg-pgreen/10 px-3 py-1 text-xs font-bold text-pgreen">Mức khởi đầu</span>;
                        } else if (index === rewards.length - 1) {
                            badge = <span className="rounded-full bg-ebrown/10 px-3 py-1 text-xs font-bold text-ebrown">VIP</span>;
                        } else if (reward.claimedCount && reward.claimedCount > 0) {
                            badge = <span className="rounded-full bg-pgreen/10 px-3 py-1 text-xs font-bold text-pgreen">Được chọn nhiều</span>;
                        }
                    }

                    return (
                        <div
                            key={reward.id}
                            className={`
                group rounded-3xl border bg-gradient-to-br from-white to-cream/40 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer
                ${isSelected
                                    ? 'border-pgreen/50 shadow-md'
                                    : 'border-gray-100 hover:border-pgreen/30'
                                }
                ${!isAvailable ? 'opacity-60 cursor-not-allowed' : ''}
              `}
                            onClick={() => {
                                if (isAvailable) {
                                    openRewardDonation(reward);
                                }
                            }}
                        >
                            {/* Reward Header */}
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <div className="font-display text-2xl font-bold text-pgreen mb-1">
                                        {formatVND(reward.minAmount)}
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-bold text-dblue text-lg">
                                            {reward.title}
                                        </h4>
                                        {badge}
                                    </div>
                                </div>

                                {/* CTA Button for Reward */}
                                <button
                                    className={`
                                        rounded-2xl px-5 py-3 text-sm font-bold transition-all shadow-sm hover:shadow-lg hover:shadow-green-200
                                        ${!isAvailable
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'gradient-green text-white'
                                        }
                                    `}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (isAvailable) {
                                            openRewardDonation(reward);
                                        }
                                    }}
                                    disabled={!isAvailable}
                                >
                                    {!isAvailable ? 'Hết suất' : 'Ủng hộ nhận quà'}
                                </button>
                            </div>

                            {/* Reward Description */}
                            {reward.description && (
                                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                                    {reward.description}
                                </p>
                            )}

                            {/* Reward Meta Info */}
                            <div className="mt-4 grid gap-2 text-xs text-gray-500">
                                {reward.estimatedDelivery && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        <span>Dự kiến nhận: {reward.estimatedDelivery}</span>
                                    </div>
                                )}

                                {reward.limitQuantity && (
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        <span>
                                            Còn {remainingQuantity}/{reward.limitQuantity} phần
                                        </span>
                                    </div>
                                )}

                                {reward.claimedCount && reward.claimedCount > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        <span>
                                            {reward.claimedCount} người đã chọn
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Selection Indicator */}
                            {isSelected && (
                                <div className="mt-4 pt-4 border-t border-pgreen/20">
                                    <div className="flex items-center gap-2 text-pgreen">
                                        <div className="w-2 h-2 bg-pgreen rounded-full"></div>
                                        <span className="text-xs font-medium">
                                            Phần quà này sẽ được áp dụng khi bạn ủng hộ
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer Note */}
            <div className="mt-5 pt-5 border-t border-gray-100">
                <p className="text-xs text-gray-500 leading-relaxed">
                    💡 <strong>Lưu ý:</strong> Phần quà sẽ được gửi đến địa chỉ bạn cung cấp sau khi dự án thành công.
                </p>
            </div>
        </div>
    );
}