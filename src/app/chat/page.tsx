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
    <div className="container mx-auto px-4 pt-24 pb-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Conversation List */}
        <div className="lg:col-span-1 flex flex-col h-[600px] rounded-lg border border-gray-200 bg-white">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-lg font-bold text-gray-900">Tin nhắn</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Hộp thư trò chuyện của bạn
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <ConversationList />
          </div>
        </div>

        {/* Right: Message Area Placeholder */}
        <div className="hidden lg:flex lg:col-span-2 h-[600px] flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          <div className="max-w-md">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Chưa chọn cuộc trò chuyện</h3>
            <p className="text-sm text-gray-500">
              Chọn một cuộc trò chuyện từ danh sách bên trái hoặc nhắn tin từ trang dự án để bắt đầu trò chuyện.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
