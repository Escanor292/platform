"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import Modal from "@/components/ui/Modal";
import PledgeFormContent from "@/components/campaign/PledgeFormContent";

interface Reward {
  id: string;
  title: string;
  description?: string | null;
  minAmount: number;
  estimatedDelivery?: string | null;
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
            showHeader={false}
          />
        </div>
      </Modal>
    </>
  );
}
