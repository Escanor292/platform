import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChatWithUser } from "@/components/chat/ChatWithUser";
import { ChatPageClient } from "@/components/chat/ChatPageClient";

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

  // Nếu không có userId, hiển thị giao diện chat mới với ChatSidebar
  return <ChatPageClient />;
}
