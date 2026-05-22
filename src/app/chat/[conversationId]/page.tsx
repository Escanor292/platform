import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChatScreen } from "@/components/chat/ChatScreen";

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
    <div className="container mx-auto px-4 pt-24 pb-8 max-w-4xl">
      <ChatScreen conversationId={conversationId} />
    </div>
  );
}
