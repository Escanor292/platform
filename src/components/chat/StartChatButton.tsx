"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MessageCircle, Loader2 } from "lucide-react";

interface StartChatButtonProps {
  campaignId: string;
  campaignOwnerId: string;
  campaignOwnerName: string;
  variant?: "default" | "outline";
  className?: string;
}

export function StartChatButton({
  campaignId,
  campaignOwnerId,
  campaignOwnerName,
  variant = "default",
  className = "",
}: StartChatButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleStartChat = async () => {
    // Check if user is logged in
    if (!session?.user) {
      router.push(`/auth/login?callbackUrl=/campaigns/${campaignId}`);
      return;
    }

    // Check if user is the campaign owner
    if (session.user.id === campaignOwnerId) {
      alert("Bạn không thể nhắn tin với chính mình");
      return;
    }

    try {
      setLoading(true);

      // Start or get conversation
      const response = await fetch("/api/chat/conversations/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: campaignOwnerId,
          campaignId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to start conversation");
      }

      const data = await response.json();
      const conversationId = data.conversation._id;

      // Navigate to chat screen
      router.push(`/chat/${conversationId}`);
    } catch (err: any) {
      console.error("Start chat error:", err);
      alert(err.message || "Không thể bắt đầu cuộc trò chuyện");
    } finally {
      setLoading(false);
    }
  };

  const baseClasses = "flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors";
  const variantClasses = {
    default: "bg-primary text-white hover:bg-primary/90",
    outline: "border border-primary text-primary hover:bg-primary/5",
  };

  return (
    <button
      onClick={handleStartChat}
      disabled={loading}
      className={`${baseClasses} ${variantClasses[variant]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <MessageCircle className="h-5 w-5" />
      )}
      <span>Nhắn tin với {campaignOwnerName}</span>
    </button>
  );
}
