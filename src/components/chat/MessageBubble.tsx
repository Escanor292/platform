"use client";

import { MongoMessage } from "@/types/chat.types";
import { UserAvatar } from "./UserAvatar";
import { formatTime } from "@/lib/utils";
import Link from "next/link";
import {
  parseProductSegments,
  ProductMessageCard,
} from "./ProductMessageCard";

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
      {/* Avatar - icon xám khi người gửi đã bị xóa */}
      {!isOwn && (
        <UserAvatar
          src={message.senderAvatar}
          name={message.senderName}
          size="sm"
          userId={message.senderId}
          clickable={true}
          deleted={message.senderDeleted}
        />
      )}

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Sender Name (only for other's messages) - không link khi user đã xóa */}
        {!isOwn &&
          (message.senderDeleted ? (
            <span className="text-xs text-gray-400 italic mb-1 block w-fit">{message.senderName}</span>
          ) : (
            <Link
              href={`/profile/${message.senderId}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-gray-500 mb-1 block hover:text-primary hover:underline transition-colors w-fit"
            >
              {message.senderName}
            </Link>
          ))}

        {/* Message Bubble */}
        <div
          className={`w-fit max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${isOwn
              ? "bg-primary text-white rounded-tr-none ml-auto"
              : "bg-white border border-gray-100 text-gray-900 rounded-tl-none mr-auto"
            }`}
        >
          <div className="text-[15px] leading-relaxed whitespace-pre-wrap break-words space-y-2">
            {parseProductSegments(message.text).map((seg, i) =>
              seg.type === "product" ? (
                <ProductMessageCard
                  key={`product-${i}`}
                  data={seg.data}
                  className="my-1"
                />
              ) : (
                <p key={`text-${i}`} className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                  {linkify(seg.content)}
                </p>
              )
            )}
          </div>
        </div>

        {/* Timestamp */}
        <span className={`text-[10px] text-gray-400 mt-1 block ${isOwn ? "text-right" : "text-left"}`}>
          {formatTime(new Date(message.createdAt))}
        </span>
      </div>
    </div>
  );
}

/** Đổi URL trần trong text thành link bấm được */
function linkify(text: string) {
  const urlRegex = /\b(https?:\/\/[^\s<>"']+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) =>
    urlRegex.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="underline break-all"
      >
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}
