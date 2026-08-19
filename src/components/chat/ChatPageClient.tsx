'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ChatSidebar } from './ChatSidebar';
import { MongoConversation } from '@/types/chat.types';

interface Message {
    id: string;
    content: string;
    createdAt: Date;
    isRead: boolean;
}

interface Conversation {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    lastMessage: Message;
    unreadCount: number;
    isOnline?: boolean;
}

export function ChatPageClient() {
    const router = useRouter();
    const { data: session } = useSession();
    const currentUserId = session?.user?.id as string || '';
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/chat/conversations');
            if (!response.ok) {
                throw new Error('Không thể tải danh sách cuộc trò chuyện');
            }
            const data = await response.json();

            // Map MongoConversation to Conversation interface
            const mappedConversations: Conversation[] = data.conversations.map((conv: MongoConversation) => {
                const otherParticipant = conv.participants.find((p: any) => p.userId !== currentUserId);

                return {
                    id: conv._id?.toString() || '',
                    userId: otherParticipant?.userId || '',
                    userName: otherParticipant?.name || 'Người dùng',
                    userAvatar: otherParticipant?.avatarUrl,
                    lastMessage: {
                        id: conv.lastMessage?.senderId || '',
                        content: conv.lastMessage?.text || '',
                        createdAt: conv.lastMessage?.createdAt || new Date(),
                        isRead: false,
                    },
                    unreadCount: conv.unreadCount[currentUserId] || 0,
                    isOnline: false,
                };
            });

            setConversations(mappedConversations);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectConversation = (conversationId: string) => {
        router.push(`/chat/${conversationId}`);
    };

    const handleNewChat = () => {
        // TODO: Open NewMessageDialog
        console.log('New chat');
    };

    const handleDeleteConversation = (conversationId: string) => {
        setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    };

    if (loading) {
        return (
            <div className="flex h-[600px] items-center justify-center">
                <div className="text-gray-500">Đang tải...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[600px] items-center justify-center">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 pt-24 pb-8 max-w-7xl h-[calc(100vh-8rem)]">
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-0 h-full rounded-lg border border-gray-200 overflow-hidden bg-white">
                {/* Left: Chat Sidebar */}
                <div className="min-w-0 overflow-hidden">
                    <ChatSidebar
                        conversations={conversations}
                        onSelectConversation={handleSelectConversation}
                        onNewChat={handleNewChat}
                        onDeleteConversation={handleDeleteConversation}
                    />
                </div>

                {/* Right: Placeholder */}
                <div className="hidden lg:flex h-full flex-col items-center justify-center p-8 text-center text-gray-500">
                    <div className="max-w-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Chọn cuộc trò chuyện</h3>
                        <p className="text-sm text-gray-500">
                            Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu trò chuyện.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
