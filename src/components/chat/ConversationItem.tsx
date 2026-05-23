"use client";

import { useSession } from "next-auth/react";
import { MongoConversation } from "@/types/chat.types";
import { UserAvatar } from "./UserAvatar";
import { UnreadBadge } from "./UnreadBadge";
import { formatDistanceToNow } from "@/lib/utils";

interface ConversationItemProps {
  conversation: MongoConversation;
  isActive?: boolean;
  onClick: () => void;
}

export function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  // Get the other participant
  const otherParticipant = conversation.participants.find(
    (p) => p.userId !== currentUserId
  );

  if (!otherParticipant) return null;

  const unreadCount = currentUserId ? conversation.unreadCount[currentUserId] || 0 : 0;
  const hasUnread = unreadCount > 0;

  return (
    <div
      onClick={onClick}
      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
        isActive
          ? "border-primary/40 bg-blue-50/50 hover:bg-blue-50"
          : "border-gray-200 bg-white hover:bg-gray-50"
      }`}
    >
      {/* Avatar */}
      <UserAvatar
        src={otherParticipant.avatarUrl}
        name={otherParticipant.name}
        size="md"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Name and Role */}
        <div className="flex items-center gap-2">
          <h3 className={`font-medium truncate ${hasUnread ? "font-semibold" : ""}`}>
            {otherParticipant.name}
          </h3>
          <span className="text-xs text-gray-500 capitalize">
            {otherParticipant.role}
          </span>
        </div>

        {/* Campaign Info */}
        {conversation.campaign && (
          <p className="text-xs text-gray-500 truncate mt-0.5">
            📋 {conversation.campaign.title}
          </p>
        )}

        {/* Last Message */}
        {conversation.lastMessage && (
          <p className={`text-sm truncate mt-1 ${hasUnread ? "font-medium text-gray-900" : "text-gray-600"}`}>
            {conversation.lastMessage.senderId === currentUserId && "Bạn: "}
            {conversation.lastMessage.text}
          </p>
        )}

        {/* Timestamp */}
        {conversation.lastMessage && (
          <p className="text-xs text-gray-400 mt-1">
            {formatDistanceToNow(new Date(conversation.lastMessage.createdAt))}
          </p>
        )}
      </div>

      {/* Unread Badge */}
      {hasUnread && <UnreadBadge count={unreadCount} />}
    </div>
  );
}
