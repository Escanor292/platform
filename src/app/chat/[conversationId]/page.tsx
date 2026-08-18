import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChatScreen } from "@/components/chat/ChatScreen";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatInfoPanel } from "@/components/chat/ChatInfoPanel";

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
    <div className="container mx-auto px-4 pt-24 pb-8 max-w-7xl h-[calc(100vh-8rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 h-full rounded-lg border border-gray-200 overflow-hidden bg-white">
        {/* Left: Conversation List (hidden on mobile when inside a conversation) */}
        <div className="hidden lg:flex lg:col-span-1 flex-col h-full border-r border-gray-200">
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

        {/* Middle: Active Chat Screen */}
        <div className="col-span-1 lg:col-span-2 h-full">
          <ChatScreen conversationId={conversationId} />
        </div>

        {/* Right: Info Panel */}
        <div className="hidden lg:flex lg:col-span-1 h-full">
          <ChatInfoPanel conversationId={conversationId} />
        </div>
      </div>
    </div>
  );
}
