"use client";

import { ConversationParticipant, ConversationCampaign } from "@/types/chat.types";
import { UserAvatar } from "./UserAvatar";
import Link from "next/link";

interface CampaignChatHeaderProps {
  participant: ConversationParticipant;
  campaign?: ConversationCampaign;
}

export function CampaignChatHeader({ participant, campaign }: CampaignChatHeaderProps) {
  return (
    <div className="flex-1">
      <div className="flex items-center gap-3">
        <UserAvatar
          src={participant.avatarUrl}
          name={participant.name}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-900 truncate">
            {participant.name}
          </h2>
          <p className="text-sm text-gray-500 capitalize">{participant.role}</p>
        </div>
      </div>

      {campaign && (
        <Link
          href={`/campaigns/${campaign.campaignId}`}
          className="mt-2 flex items-center gap-2 rounded-lg bg-gray-50 p-2 text-sm hover:bg-gray-100 transition-colors"
        >
          <span className="text-gray-600">📋</span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{campaign.title}</p>
            <p className="text-xs text-gray-500">
              {((campaign.currentAmount / campaign.goalAmount) * 100).toFixed(0)}% đạt được
            </p>
          </div>
        </Link>
      )}
    </div>
  );
}
