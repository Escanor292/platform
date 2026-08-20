"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MessageCircle, Loader2 } from "lucide-react";
import {
  encodeProductMarker,
  type ProductCardData,
} from "@/components/chat/ProductMessageCard";

interface StartChatButtonProps {
  campaignId?: string;
  campaignOwnerId: string;
  campaignOwnerName: string;
  campaignTitle?: string;
  campaignSlug?: string;
  /** Id sản phẩm để kèm vào cuộc trò chuyện/tin nhắn giới thiệu */
  rewardId?: string;
  /** Tên sản phẩm (kèm giá) cho tin nhắn giới thiệu khi trao đổi về sản phẩm */
  rewardTitle?: string;
  /** Giá bán sản phẩm hiển thị trong tin nhắn giới thiệu */
  rewardPrice?: string;
  /** Ảnh sản phẩm (URL) để hiển thị trong thẻ sản phẩm trên tin nhắn */
  rewardImage?: string;
  /** Giá gốc bị gạch (nếu có khuyến mãi) */
  rewardOriginalPrice?: string;
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
  rewardId,
  rewardTitle,
  rewardPrice,
  rewardImage,
  rewardOriginalPrice,
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
      const callbackUrl = rewardId
        ? `/products/${rewardId}`
        : campaignSlug
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

      // Tin nhắn giới thiệu: ưu tiên thông tin sản phẩm (khi bấm từ trang sản phẩm),
      // nếu không có sản phẩm thì dùng thông tin chiến dịch/dự án
      let introMessage: string | null = null;
      if (rewardId && rewardTitle) {
        const rewardUrl = `${window.location.origin}/products/${rewardId}`;
        const productCard = encodeProductMarker({
          id: rewardId,
          title: rewardTitle,
          price: rewardPrice || "",
          image: rewardImage,
          originalPrice: rewardOriginalPrice,
        } as ProductCardData);
        introMessage =
          `👋 Xin chào ${campaignOwnerName}!\n\n` +
          `Tôi muốn trao đổi về sản phẩm của bạn:\n\n` +
          `${productCard}\n\n` +
          `Bạn có thể tư vấn thêm cho tôi về sản phẩm này không?\n` +
          `🔗 ${rewardUrl}`;
      } else if (campaignTitle) {
        const campaignUrl = campaignSlug
          ? `${window.location.origin}/campaigns/${campaignSlug}`
          : `${window.location.origin}/campaigns/${campaignId}`;

        introMessage =
          `👋 Xin chào ${campaignOwnerName}!\n\n` +
          `Tôi muốn thảo luận về dự án của bạn:\n` +
          `📋 ${campaignTitle}\n` +
          `🔗 ${campaignUrl}\n\n` +
          `Bạn có thể giúp tôi tìm hiểu thêm về dự án này không?`;
      }

      // Gửi tin nhắn giới thiệu (bỏ qua lỗi nếu có, vẫn chuyển trang)
      if (introMessage) {
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
