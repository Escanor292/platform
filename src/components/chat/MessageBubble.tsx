"use client";

import { MongoMessage } from "@/types/chat.types";
import { UserAvatar } from "./UserAvatar";
import { formatTime } from "@/lib/utils";
import Link from "next/link";

interface MessageBubbleProps {
  message: MongoMessage;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  if (message.isDeleted) {
    return (
      <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
        <div className="max-w-[70%] rounded-lg bg-gray-100 px-4 py-2">
          <p className="text-sm italic text-gray-400">Tin nhắn đã bị xóa</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      {!isOwn && (
        <UserAvatar
          src={message.senderAvatar}
          name={message.senderName}
          size="sm"
          userId={message.senderId}
          clickable={true}
        />
      )}

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Sender Name (only for other's messages) - clickable */}
        {!isOwn && (
          <Link
            href={`/profile/${message.senderId}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-gray-500 mb-1 block hover:text-primary hover:underline transition-colors w-fit"
          >
            {message.senderName}
          </Link>
        )}

        {/* Message Bubble */}
        <div
          className={`w-fit max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${isOwn
              ? "bg-primary text-white rounded-tr-none ml-auto"
              : "bg-white border border-gray-100 text-gray-900 rounded-tl-none mr-auto"
            }`}
        >
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
        </div>

        {/* Timestamp */}
        <span className={`text-[10px] text-gray-400 mt-1 block ${isOwn ? "text-right" : "text-left"}`}>
          {formatTime(new Date(message.createdAt))}
        </span>
      </div>
    </div>
  );
}
