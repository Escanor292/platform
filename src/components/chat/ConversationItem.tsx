"use client";

import { useSession } from "next-auth/react";
import { MongoConversation } from "@/types/chat.types";
import { UserAvatar } from "./UserAvatar";
import { UnreadBadge } from "./UnreadBadge";
import { formatDistanceToNow } from "@/lib/utils";
import Link from "next/link";

// Mô tả tin tín hiệu cuộc gọi cho preview (thay vì hiện JSON thô)
const describeCallSignal = (text: string): string => {
  try {
    const sig = JSON.parse(text);
    if (sig?.type === 'call') return sig.mode === 'video' ? '📹 Cuộc gọi video đến...' : '📞 Cuộc gọi thoại đến...';
    if (sig?.type === 'accept') return sig.mode === 'video' ? '📹 Cuộc gọi video được chấp nhận' : '📞 Cuộc gọi thoại được chấp nhận';
    if (sig?.type === 'end' || sig?.type === 'bye') return '📵 Cuộc gọi đã kết thúc';
    if (sig?.type === 'reject') return '❌ Cuộc gọi bị từ chối';
    return '📞 Tín hiệu cuộc gọi';
  } catch {
    return text;
  }
};

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

  // Thống nhất giao diện "Người dùng đã xóa": coi là đã xóa dù DB thiếu flag (tên được gán nhãn khi user bị xóa)
  const isDeleted = !!otherParticipant.deleted || otherParticipant.name === 'Người dùng đã xóa';
  const displayName = isDeleted ? 'Người dùng đã xóa' : otherParticipant.name;

  const unreadCount = currentUserId ? conversation.unreadCount[currentUserId] || 0 : 0;
  const hasUnread = unreadCount > 0;

  return (
    <div
      onClick={onClick}
      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${isActive
          ? "border-primary/40 bg-blue-50/50 hover:bg-blue-50"
          : "border-gray-200 bg-white hover:bg-gray-50"
        }`}
    >
      {/* Avatar - clickable (không link khi user đã bị xóa) */}
      <UserAvatar
        src={otherParticipant.avatarUrl}
        name={displayName}
        size="md"
        userId={otherParticipant.userId}
        clickable={true}
        deleted={isDeleted}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Name and Role - name is clickable (user đã xóa không có link profile) */}
        <div className="flex items-center gap-2">
          {isDeleted ? (
            <span className={`font-medium truncate text-gray-400 italic ${hasUnread ? "font-semibold" : ""}`}>
              {displayName}
            </span>
          ) : (
            <Link
              href={`/profile/${otherParticipant.userId}`}
              onClick={(e) => e.stopPropagation()}
              className={`font-medium truncate hover:text-primary hover:underline transition-colors ${hasUnread ? "font-semibold" : ""}`}
            >
              {displayName}
            </Link>
          )}
          {!isDeleted && (
            <span className="text-xs text-gray-500 capitalize">
              {otherParticipant.role}
            </span>
          )}
          {isDeleted && (
            <span className="text-xs text-gray-400">Tài khoản đã xóa</span>
          )}
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
            {conversation.lastMessage.type === 'call-signal'
              ? describeCallSignal(conversation.lastMessage.text)
              : conversation.lastMessage.text}
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
