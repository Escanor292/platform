"use client";

import { Heart, Gift } from "lucide-react";
import PledgeFormContent from "@/components/campaign/PledgeFormContent";
import Modal from "@/components/ui/Modal";
import { useCampaignContext } from "@/contexts/CampaignContext";
import { StartChatButton } from "@/components/chat/StartChatButton";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface Reward {
    id: string;
    title: string;
    description?: string | null;
    minAmount: number;
    estimatedDelivery?: string | null;
    availability?: "AVAILABLE" | "DEVELOPMENT";
}

interface CampaignPageClientProps {
    campaignId: string;
    campaignSlug: string;
    campaignTitle: string;
    rewards: Reward[];
    creatorId: string;
    creatorName: string;
    campaignStatus: string;
}

export default function CampaignPageClient({ 
    campaignId, 
    campaignSlug,
    campaignTitle,
    rewards,
    creatorId,
    creatorName,
    campaignStatus
}: CampaignPageClientProps) {
    const { data: session, status: sessionStatus } = useSession();
    const searchParams = useSearchParams();
    const checkoutSessionId = searchParams.get("checkoutSessionId");
    const [restoredPayload, setRestoredPayload] = useState<{
        amount?: number;
        platformTipPercent?: number;
        isAnonymous?: boolean;
        displayName?: string | null;
        guestEmail?: string | null;
        shippingAddress?: string | null;
        paymentMethod?: "ONLINE" | "COD";
        paymentMethodId?: string | null;
        savePaymentMethod?: boolean;
    } | null>(null);
    const [restoredSessionId, setRestoredSessionId] = useState<string | null>(null);
    const {
        showPaymentModal,
        donationType,
        selectedReward,
        openGeneralDonation,
        restoreDonation,
        closeModal
    } = useCampaignContext();

    const hasRewards = rewards && rewards.length > 0;
    const isCreator = session?.user?.id === creatorId;
    const canChat = !isCreator && campaignStatus === 'ACTIVE';

    useEffect(() => {
        if (!checkoutSessionId || sessionStatus !== "authenticated" || restoredSessionId === checkoutSessionId) return;
        let cancelled = false;

        fetch(`/api/checkout-sessions?id=${encodeURIComponent(checkoutSessionId)}`)
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Không thể khôi phục checkout");
                return data;
            })
            .then((data) => {
                if (cancelled) return;
                if (data.campaignId !== campaignId) throw new Error("Phiên checkout không thuộc chiến dịch này");
                const reward = data.rewardId ? rewards.find((item) => item.id === data.rewardId) : null;
                if (data.rewardId && !reward) throw new Error("Phần quà trong phiên checkout không còn khả dụng");
                setRestoredPayload(data.payload ?? null);
                setRestoredSessionId(checkoutSessionId);
                restoreDonation(data.rewardId ? "reward" : "general", reward ?? null);
                const cleanPath = data.returnPath || window.location.pathname;
                window.history.replaceState({}, "", cleanPath);
            })
            .catch((error) => {
                if (!cancelled) {
                    setRestoredSessionId(checkoutSessionId);
                    console.error("[CHECKOUT_RESTORE]", error instanceof Error ? error.message : "unknown error");
                }
            });

        return () => {
            cancelled = true;
        };
    }, [campaignId, checkoutSessionId, restoreDonation, rewards, restoredSessionId, sessionStatus]);

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

                {/* Chat Button */}
                {canChat && (
                    <StartChatButton
                        campaignId={campaignId}
                        campaignOwnerId={creatorId}
                        campaignOwnerName={creatorName}
                        campaignTitle={campaignTitle}
                        campaignSlug={campaignSlug}
                        variant="outline"
                        className="w-full"
                    />
                )}

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
                        restoredPayload={restoredPayload}
                        showHeader={false}
                    />
                </div>
            </Modal>
        </>
    );
}