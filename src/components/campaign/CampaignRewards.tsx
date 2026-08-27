'use client';

import { formatVND } from "@/lib/utils";
import { Gift, Users, Clock, PlayCircle } from "lucide-react";
import { useCampaignContext } from "@/contexts/CampaignContext";
import QuickAddToCartButton from "@/components/products/QuickAddToCartButton";
import { useRouter } from "next/navigation";

interface Reward {
    id: string;
    title: string;
    description?: string | null;
    minAmount: number;
    estimatedDelivery?: string | null;
    deliveryDate?: string | null;
    isPreorder?: boolean;
    onlineDepositPercent?: number;
    codDepositPercent?: number;
    limitQuantity?: number | null;
    claimedCount?: number;
    productImages?: string[] | null;
    productVideo?: string | null;
}

interface CampaignRewardsProps {
    campaignId: string;
    rewards: Reward[];
    selectedRewardId?: string;
}

export default function CampaignRewards({
    campaignId,
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
                    const expectedDelivery = reward.deliveryDate || reward.estimatedDelivery;
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
                                <div className="flex items-center justify-between gap-3 mb-2">
                                    <div className="text-lg font-bold text-emerald-600 leading-none">
                                        {formatVND(reward.minAmount)}
                                    </div>
                                    <button
                                        type="button"
                                        className={`
                                            inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold shadow-sm transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-pgreen focus-visible:ring-offset-2
                                            ${!isAvailable
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                                : 'gradient-green text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-200'
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
                                        {isAvailable && <Gift className="h-4 w-4" />}
                                        {!isAvailable ? 'Hết suất' : 'Ủng hộ nhận quà'}
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 mb-3">
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-semibold text-gray-900 leading-snug">
                                            {reward.title}
                                        </h4>
                                        {reward.isPreorder && (
                                            <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800">
                                                Đặt hàng trước{expectedDelivery ? ` · giao dự kiến ${new Date(expectedDelivery).toLocaleDateString('vi-VN')}` : ''}
                                            </span>
                                        )}
                                    </div>
                                    {isAvailable && (
                                        <QuickAddToCartButton
                                            rewardId={reward.id}
                                            title={reward.title}
                                            image={previewImage || ''}
                                            price={reward.minAmount}
                                            campaignId={campaignId}
                                            isPreorder={reward.isPreorder}
                                            deliveryDate={reward.deliveryDate || null}
                                            className="h-10 w-10 shrink-0 rounded-xl"
                                        />
                                    )}
                                </div>

                            {reward.description && (
                                <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                                    {reward.description}
                                </p>
                            )}

                            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                                {reward.isPreorder && expectedDelivery && (
                                    <div className="flex items-center gap-1 font-semibold text-amber-700">
                                        <Clock className="w-3 h-3" />
                                        <span>Dự kiến giao hàng: {new Date(expectedDelivery).toLocaleDateString('vi-VN')}</span>
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

            <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 leading-relaxed">
                    💡 <strong>Lưu ý:</strong> Phần quà sẽ được gửi đến địa chỉ bạn cung cấp sau khi dự án thành công.
                </p>
            </div>
        </div>
    );
}
