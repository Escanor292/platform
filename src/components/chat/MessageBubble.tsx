"use client";

import { MongoMessage } from "@/types/chat.types";
import { UserAvatar } from "./UserAvatar";
import { formatTime } from "@/lib/utils";

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
        />
      )}

      {/* Message Content */}
      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
        {/* Sender Name (only for other's messages) */}
        {!isOwn && (
          <span className="text-xs text-gray-500 mb-1">{message.senderName}</span>
        )}

        {/* Message Bubble */}
        <div
          className={`max-w-[70%] rounded-lg px-4 py-2 ${
            isOwn
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-900"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
        </div>

        {/* Timestamp */}
        <span className="text-xs text-gray-400 mt-1">
          {formatTime(new Date(message.createdAt))}
        </span>
      </div>
    </div>
  );
}
