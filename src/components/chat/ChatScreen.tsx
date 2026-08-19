"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { MongoConversation, MongoMessage } from "@/types/chat.types";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { CampaignChatHeader } from "./CampaignChatHeader";
import { Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface ChatScreenProps {
  conversationId: string;
}

export function ChatScreen({ conversationId }: ChatScreenProps) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const currentUserId = session?.user?.id;

  const [conversation, setConversation] = useState<MongoConversation | null>(null);
  const [messages, setMessages] = useState<MongoMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId && currentUserId) {
      loadConversation();
      loadMessages();
      markAsRead();
    }
  }, [conversationId, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversation = async () => {
    try {
      const response = await fetch("/api/chat/conversations");
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Vui lòng đăng nhập");
        }
        throw new Error("Không thể tải thông tin cuộc trò chuyện");
      }

      const data = await response.json();
      const conv = data.conversations.find(
        (c: MongoConversation) => c._id?.toString() === conversationId
      );

      if (conv) {
        setConversation(conv);
      }
    } catch (err: any) {
      console.error("Load conversation error:", err);
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/chat/conversations/${conversationId}/messages?limit=50`
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Vui lòng đăng nhập để xem tin nhắn");
        } else if (response.status === 404) {
          throw new Error("Cuộc trò chuyện không tồn tại");
        } else if (response.status === 403) {
          throw new Error("Bạn không có quyền truy cập cuộc trò chuyện này");
        } else if (response.status === 400) {
          throw new Error("ID cuộc trò chuyện không hợp lệ");
        } else {
          throw new Error("Không thể tải tin nhắn");
        }
      }

      const data = await response.json();
      setMessages(data.messages.reverse()); // Reverse to show oldest first
      setHasMore(data.hasMore);
    } catch (err: any) {
      console.error("Load messages error:", err);
      setError(err.message || "Không thể tải tin nhắn");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await fetch(`/api/chat/conversations/${conversationId}/read`, {
        method: "PATCH",
      });
    } catch (err) {
      console.error("Mark as read error:", err);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || sending) return;

    try {
      setSending(true);

      const response = await fetch(
        `/api/chat/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, data.message]);
      markAsRead();
    } catch (err: any) {
      console.error("Send message error:", err);
      alert(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const otherParticipant = conversation?.participants.find(
    (p) => p.userId !== currentUserId
  );

  if (sessionStatus === "loading") {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Đang tải phiên đăng nhập...</span>
      </div>
    );
  }

  if (sessionStatus === "unauthenticated") {
    return (
      <div className="flex h-[600px] flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">Chưa đăng nhập</h3>
          <p className="mt-2 text-sm text-gray-600">
            Vui lòng đăng nhập để sử dụng tính năng chat
          </p>
          <button
            onClick={() => router.push("/auth/login")}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Đang tải tin nhắn...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col min-h-0 rounded-lg border border-gray-200 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/chat")}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          {conversation && otherParticipant && (
            <CampaignChatHeader
              participant={otherParticipant}
              campaign={conversation.campaign}
            />
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-500">
            <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message._id?.toString()}
                message={message}
                isOwn={message.senderId === currentUserId}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 flex-shrink-0">
        <ChatInput onSend={handleSendMessage} disabled={sending} />
      </div>
    </div>
  );
}
