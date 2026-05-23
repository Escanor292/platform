"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MongoConversation } from "@/types/chat.types";
import { ConversationItem } from "./ConversationItem";
import { Loader2 } from "lucide-react";

interface ConversationListProps {
  activeConversationId?: string;
}

export function ConversationList({ activeConversationId }: ConversationListProps) {
  const router = useRouter();
  const [conversations, setConversations] = useState<MongoConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/chat/conversations");
      
      if (!response.ok) {
        throw new Error("Failed to load conversations");
      }

      const data = await response.json();
      setConversations(data.conversations);
    } catch (err: any) {
      console.error("Load conversations error:", err);
      setError(err.message || "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = (conversationId: string) => {
    router.push(`/chat/${conversationId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={loadConversations}
          className="mt-2 text-sm font-medium text-red-700 hover:text-red-800"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-gray-600">Chưa có cuộc trò chuyện nào</p>
        <p className="mt-2 text-sm text-gray-500">
          Bắt đầu trò chuyện bằng cách nhắn tin với chủ chiến dịch
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation._id?.toString()}
          conversation={conversation}
          isActive={conversation._id?.toString() === activeConversationId}
          onClick={() => handleConversationClick(conversation._id!.toString())}
        />
      ))}
    </div>
  );
}
