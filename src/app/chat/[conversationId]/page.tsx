import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChatConversationClient } from "@/components/chat/ChatConversationClient";

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

  return <ChatConversationClient conversationId={conversationId} />;
}
