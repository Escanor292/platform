"use client";

import { memo } from "react";
import PledgeFormContent from "@/components/campaign/PledgeFormContent";

interface Reward {
  id: string;
  title: string;
  description?: string | null;
  amount: number;
  estimatedDelivery?: string | null;
  availability?: "AVAILABLE" | "DEVELOPMENT";
}

interface PledgeFormProps {
  campaignId: string;
  campaignSlug?: string;
  rewards?: Reward[];
  preselectedRewardId?: string;
}

const PledgeForm = memo(function PledgeForm({
  campaignId,
  campaignSlug,
  rewards = [],
  preselectedRewardId,
}: PledgeFormProps) {
  const normalizedRewards = rewards.map((reward) => ({
    id: reward.id,
    title: reward.title,
    description: reward.description,
    minAmount: reward.amount,
    estimatedDelivery: reward.estimatedDelivery,
    availability: reward.availability ?? "DEVELOPMENT",
  }));
  const preselectedReward = normalizedRewards.find((reward) => reward.id === preselectedRewardId) ?? null;

  return (
    <PledgeFormContent
      campaignId={campaignId}
      campaignSlug={campaignSlug}
      rewards={normalizedRewards}
      donationType={normalizedRewards.length > 0 ? "reward" : "general"}
      preselectedReward={preselectedReward}
      showHeader
    />
  );
});

export default PledgeForm;
