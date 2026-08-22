"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import Modal from "@/components/ui/Modal";
import PledgeFormContent from "@/components/campaign/PledgeFormContent";

interface Reward {
  id: string;
  title: string;
  description?: string | null;
  minAmount: number;
  estimatedDelivery?: string | null;
  availability?: "AVAILABLE" | "DEVELOPMENT";
}

interface CampaignRewardDonationButtonProps {
  campaignId: string;
  campaignSlug: string;
  reward: Reward;
}

export default function CampaignRewardDonationButton({
  campaignId,
  campaignSlug,
  reward,
}: CampaignRewardDonationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { status: sessionStatus } = useSession();
  const searchParams = useSearchParams();
  const checkoutSessionId = searchParams.get("checkoutSessionId");
  const [restoredSessionId, setRestoredSessionId] = useState<string | null>(null);
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
        if (data.campaignId !== campaignId || data.rewardId !== reward.id) {
          throw new Error("Phiên checkout không thuộc sản phẩm này");
        }
        setRestoredPayload(data.payload ?? null);
        setRestoredSessionId(checkoutSessionId);
        setIsOpen(true);
        window.history.replaceState({}, "", data.returnPath || window.location.pathname);
      })
      .catch((error) => {
        if (!cancelled) {
          setRestoredSessionId(checkoutSessionId);
          console.error("[PRODUCT_CHECKOUT_RESTORE]", error instanceof Error ? error.message : "unknown error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [campaignId, checkoutSessionId, reward.id, restoredSessionId, sessionStatus]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-pgreen text-white font-bold rounded-xl hover:bg-pgreen/90 transition-colors shadow-sm"
      >
        <Heart size={18} fill="currentColor" />
        Ủng hộ ngay
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="🎁 Ủng hộ nhận quà"
        description={`Bạn đã chọn: ${reward.title}`}
        maxWidth="2xl"
        showCloseButton={true}
        closeOnBackdropClick={true}
        closeOnEscape={true}
      >
        <div className="p-6">
          <PledgeFormContent
            campaignId={campaignId}
            campaignSlug={campaignSlug}
            rewards={[reward]}
            donationType="reward"
            preselectedReward={reward}
            restoredPayload={restoredPayload}
            showHeader={false}
          />
        </div>
      </Modal>
    </>
  );
}
