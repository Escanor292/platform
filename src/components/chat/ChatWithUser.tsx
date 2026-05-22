"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface ChatWithUserProps {
  targetUserId: string;
}

export function ChatWithUser({ targetUserId }: ChatWithUserProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [targetUser, setTargetUser] = useState<any>(null);

  useEffect(() => {
    const initChat = async () => {
      try {
        setLoading(true);

        // Lấy thông tin user đích
        const userRes = await fetch(`/api/users/${targetUserId}`);
        if (!userRes.ok) {
          throw new Error("Không tìm thấy người dùng");
        }
        const userData = await userRes.json();
        setTargetUser(userData);

        // Tìm hoặc tạo conversation với user này (dùng API chuẩn)
        const convRes = await fetch("/api/chat/conversations/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetUserId: targetUserId,
          }),
        });

        if (!convRes.ok) {
          const errorData = await convRes.json();
          throw new Error(errorData.error || "Không thể tạo cuộc trò chuyện");
        }

        const data = await convRes.json();
        // _id từ MongoDB có thể là ObjectId object, cần convert sang string
        const conversationId = data.conversation._id?.toString() || data.conversation._id;

        // Chuyển đến trang chat với conversation đó
        router.push(`/chat/${conversationId}`);
      } catch (error: any) {
        console.error("Error initializing chat:", error);
        toast.error(error.message || "Có lỗi xảy ra");
        // Quay lại trang chat chính
        setTimeout(() => router.push("/chat"), 2000);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user && targetUserId) {
      initChat();
    }
  }, [session, targetUserId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-pgreen mx-auto mb-4" />
          <p className="text-gray-600 font-medium">
            {targetUser ? `Đang mở cuộc trò chuyện với ${targetUser.name}...` : "Đang khởi tạo cuộc trò chuyện..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 mb-4">Đang chuyển hướng...</p>
        <button
          onClick={() => router.push("/chat")}
          className="text-pgreen hover:text-fgreen font-medium flex items-center gap-2 mx-auto"
        >
          <ArrowLeft size={16} />
          Quay lại danh sách tin nhắn
        </button>
      </div>
    </div>
  );
}
