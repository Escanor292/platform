import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatWithUser } from "@/components/chat/ChatWithUser";

export const metadata: Metadata = {
  title: "Tin nhắn | TửTế Fund",
  description: "Quản lý tin nhắn của bạn",
};

interface ChatPageProps {
  searchParams: Promise<{ userId?: string }>;
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/chat");
  }

  const params = await searchParams;
  const targetUserId = params.userId;

  // Nếu có userId trong URL, hiển thị giao diện chat với user đó
  if (targetUserId) {
    return <ChatWithUser targetUserId={targetUserId} />;
  }

  // Nếu không có userId, hiển thị danh sách cuộc trò chuyện
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tin nhắn</h1>
        <p className="text-gray-600 mt-1">
          Quản lý cuộc trò chuyện với các chủ chiến dịch
        </p>
      </div>

      <ConversationList />
    </div>
  );
}
