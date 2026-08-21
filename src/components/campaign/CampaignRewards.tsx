'use client';

import { formatVND } from "@/lib/utils";
import { Gift, Users, Clock, PlayCircle } from "lucide-react";
import { useCampaignContext } from "@/contexts/CampaignContext";
import { useRouter } from "next/navigation";

interface Reward {
    id: string;
    title: string;
    description?: string | null;
    minAmount: number;
    estimatedDelivery?: string | null;
    limitQuantity?: number | null;
    claimedCount?: number;
    productImages?: string[] | null;
    productVideo?: string | null;
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
    const router = useRouter();
    if (!rewards || rewards.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Gift className="w-5 h-5 text-gray-400" />
                    <h3 className="font-bold text-gray-900">Phần quà</h3>
                </div>
                <div className="text-center py-8">
                    <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Dự án này hiện chưa có phần quà</p>
                    <p className="text-gray-400 text-xs mt-1">
                        Bạn vẫn có thể ủng hộ dự án mà không cần chọn phần quà
                    </p>
                </div>
            </div>
        );
    }

    const openRewardDetails = (rewardId: string) => {
        router.push(`/products/${rewardId}`);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
                <Gift className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-gray-900">Phần quà</h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {rewards.length} gói
                </span>
            </div>

            <div className="space-y-3">
                {rewards.map((reward) => {
                    const isSelected = selectedRewardId === reward.id;
                    const remainingQuantity = reward.limitQuantity
                        ? reward.limitQuantity - (reward.claimedCount || 0)
                        : null;
                    const isAvailable = !reward.limitQuantity || (remainingQuantity !== null && remainingQuantity > 0);
                    const previewImage = reward.productImages?.[0];
                    const hasVideo = Boolean(reward.productVideo);
                    const hasMedia = Boolean(previewImage || hasVideo);

                    return (
                        <div
                            key={reward.id}
                            className={`
                border rounded-lg overflow-hidden transition-all duration-200 cursor-pointer
                ${isSelected
                                    ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                                    : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 hover:shadow-sm'
                                }
              `}
                            role="link"
                            tabIndex={0}
                            aria-label={`Xem chi tiết phần quà ${reward.title}`}
                            onClick={() => openRewardDetails(reward.id)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    openRewardDetails(reward.id);
                                }
                            }}
                        >
                            {/* Product image/video preview */}
                            {hasMedia && (
                                <div className="relative aspect-[16/6] w-full overflow-hidden bg-gray-100">
                                    {hasVideo ? (
                                        <video
                                            className="h-full w-full object-cover"
                                            src={reward.productVideo || undefined}
                                            poster={previewImage || undefined}
                                            muted
                                            loop
                                            playsInline
                                            preload="metadata"
                                            aria-label={`Video giới thiệu ${reward.title}`}
                                        />
                                    ) : (
                                        <img
                                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                                            src={previewImage || undefined}
                                            alt={reward.title}
                                            loading="lazy"
                                        />
                                    )}
                                    {hasVideo && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                                                <PlayCircle className="h-4 w-4" />
                                                Video sản phẩm
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="p-4">
                                {/* Reward Header */}
                                <div className="flex justify-between items-start gap-4 mb-3">
                                <div className="flex-1 min-w-0">
                                    <div className="text-lg font-bold text-emerald-600 mb-1">
                                        {formatVND(reward.minAmount)}
                                    </div>
                                    <h4 className="font-semibold text-gray-900 mb-2">
                                        {reward.title}
                                    </h4>
                                </div>

                                {/* CTA Button for Reward */}
                                <button
                                    type="button"
                                    className={`
                                        shrink-0
                                        inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold shadow-sm transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-pgreen focus-visible:ring-offset-2
                                        ${!isAvailable
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                            : 'gradient-green text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-200'
                                        }
                                    `}
                                    onClick={(e) => {
                                        // The card opens details; only this button opens the payment modal.
                                        e.stopPropagation();
                                        if (isAvailable) {
                                            openRewardDonation(reward);
                                        }
                                    }}
                                    disabled={!isAvailable}
                                >
                                    {isAvailable && <Gift className="h-4 w-4" />}
                                    {!isAvailable ? 'Hết suất' : 'Ủng hộ nhận quà'}
                                </button>
                            </div>

                            {/* Reward Description */}
                            {reward.description && (
                                <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                                    {reward.description}
                                </p>
                            )}

                            {/* Reward Meta Info */}
                            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                                {reward.estimatedDelivery && (
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        <span>Giao hàng: {reward.estimatedDelivery}</span>
                                    </div>
                                )}

                                {reward.limitQuantity && (
                                    <div className="flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        <span>
                                            Còn lại: {remainingQuantity}/{reward.limitQuantity}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Selection Indicator */}
                            {isSelected && (
                                <div className="mt-3 pt-3 border-t border-emerald-200">
                                    <div className="flex items-center gap-2 text-emerald-700">
                                        <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                                        <span className="text-xs font-medium">
                                            Phần quà này sẽ được áp dụng khi bạn ủng hộ
                                        </span>
                                    </div>
                                </div>
                            )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer Note */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 leading-relaxed">
                    💡 <strong>Lưu ý:</strong> Phần quà sẽ được gửi đến địa chỉ bạn cung cấp sau khi dự án thành công.
                </p>
            </div>
        </div>
    );
}