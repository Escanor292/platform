"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MessageCircle, Loader2 } from "lucide-react";

interface StartChatButtonProps {
  campaignId?: string;
  campaignOwnerId: string;
  campaignOwnerName: string;
  campaignTitle?: string;
  campaignSlug?: string;
  variant?: "default" | "outline" | "none";
  className?: string;
  label?: string;
}

export function StartChatButton({
  campaignId,
  campaignOwnerId,
  campaignOwnerName,
  campaignTitle,
  campaignSlug,
  variant = "default",
  className = "",
  label,
}: StartChatButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleStartChat = async () => {
    // Check if user is logged in
    if (!session?.user) {
      const callbackUrl = campaignSlug 
        ? `/campaigns/${campaignSlug}` 
        : campaignId 
          ? `/campaigns/${campaignId}` 
          : `/profile/${campaignOwnerId}`;
      router.push(`/auth/login?callbackUrl=${callbackUrl}`);
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
      const conversationId = data.conversation._id?.toString() || data.conversation._id;

      // Nếu có thông tin dự án, gửi tin nhắn giới thiệu tự động
      if (campaignTitle) {
        const campaignUrl = campaignSlug
          ? `${window.location.origin}/campaigns/${campaignSlug}`
          : `${window.location.origin}/campaigns/${campaignId}`;

        const introMessage =
          `👋 Xin chào ${campaignOwnerName}!\n\n` +
          `Tôi muốn thảo luận về dự án của bạn:\n` +
          `📋 ${campaignTitle}\n` +
          `🔗 ${campaignUrl}\n\n` +
          `Bạn có thể giúp tôi tìm hiểu thêm về dự án này không?`;

        // Gửi tin nhắn giới thiệu (bỏ qua lỗi nếu có, vẫn chuyển trang)
        try {
          await fetch(`/api/chat/conversations/${conversationId}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: introMessage }),
          });
        } catch {
          // Không block user nếu gửi tin nhắn tự động thất bại
          console.warn("Could not send intro message, continuing to chat...");
        }
      }

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
    none: "",
  };

  return (
    <button
      onClick={handleStartChat}
      disabled={loading}
      className={`${baseClasses} ${variantClasses[variant as keyof typeof variantClasses]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <MessageCircle className="h-5 w-5" />
      )}
      <span>{label || `Nhắn tin với ${campaignOwnerName}`}</span>
    </button>
  );
}
