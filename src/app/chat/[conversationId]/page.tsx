import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChatScreen } from "@/components/chat/ChatScreen";
import { ConversationList } from "@/components/chat/ConversationList";

export const metadata: Metadata = {
  title: "Trò chuyện | TửTế Fund",
  description: "Trò chuyện với chủ chiến dịch",
};

interface ChatConversationPageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

export default async function ChatConversationPage({ params }: ChatConversationPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/chat");
  }

  const { conversationId } = await params;

  return (
    <div className="container mx-auto px-4 pt-24 pb-8 max-w-6xl">
      {/* Grid 3 cột: sidebar + vùng chat — ĐẶC BIỆT LƯU Ý chiều cao cố định */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
        {/* Cột 1: Danh sách cuộc trò chuyện */}
        <div className="hidden lg:flex flex-col h-full rounded-lg border border-gray-200 overflow-hidden bg-white">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-lg font-bold text-gray-900">Tin nhắn</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Hộp thư trò chuyện của bạn
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <ConversationList activeConversationId={conversationId} />
          </div>
        </div>

        {/* Cột 2-3: Màn hình chat — chiếm 2/3, dùng flex-col khóa chiều cao */}
        <div className="lg:col-span-2 flex flex-col h-full rounded-lg border border-gray-200 overflow-hidden bg-white">
          <ChatScreen conversationId={conversationId} />
        </div>
      </div>
    </div>
  );
}
