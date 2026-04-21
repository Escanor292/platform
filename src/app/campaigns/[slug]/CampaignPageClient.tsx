"use client";

import { Heart, Gift } from "lucide-react";
import PledgeFormContent from "@/components/campaign/PledgeFormContent";
import Modal from "@/components/ui/Modal";
import { useCampaignContext } from "@/contexts/CampaignContext";

interface Reward {
    id: string;
    title: string;
    description?: string | null;
    minAmount: number;
    estimatedDelivery?: string | null;
}

interface CampaignPageClientProps {
    campaignId: string;
    campaignSlug: string;
    rewards: Reward[];
}

export default function CampaignPageClient({ campaignId, campaignSlug, rewards }: CampaignPageClientProps) {
    const {
        showPaymentModal,
        donationType,
        selectedReward,
        openGeneralDonation,
        closeModal
    } = useCampaignContext();

    const hasRewards = rewards && rewards.length > 0;

    return (
        <>
            {/* Support Buttons */}
            <div className="space-y-3">
                {/* General Support Button */}
                <button
                    onClick={openGeneralDonation}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 group relative overflow-hidden"
                >
                    {/* Background animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                    <Heart
                        size={20}
                        className="group-hover:scale-110 transition-transform duration-200 relative z-10"
                        fill="currentColor"
                    />
                    <span className="relative z-10">
                        {hasRewards ? 'Ủng hộ không quà' : 'Ủng hộ'}
                    </span>
                </button>

                {/* Reward Support Info */}
                {hasRewards && (
                    <div className="text-center">
                        <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
                            <Gift size={14} />
                            Hoặc chọn phần quà bên dưới để ủng hộ nhận quà
                        </p>
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            <Modal
                isOpen={showPaymentModal}
                onClose={closeModal}
                title={donationType === 'reward' ? '🎁 Ủng hộ nhận quà' : '💝 Ủng hộ dự án'}
                description={
                    donationType === 'reward'
                        ? `Bạn đã chọn: ${selectedReward?.title}`
                        : 'Ủng hộ dự án với số tiền tùy chọn'
                }
                maxWidth="2xl"
                showCloseButton={true}
                closeOnBackdropClick={true}
                closeOnEscape={true}
            >
                <div className="p-6">
                    <PledgeFormContent
                        campaignId={campaignId}
                        campaignSlug={campaignSlug}
                        rewards={rewards}
                        donationType={donationType}
                        preselectedReward={selectedReward}
                        showHeader={false}
                    />
                </div>
            </Modal>
        </>
    );
}