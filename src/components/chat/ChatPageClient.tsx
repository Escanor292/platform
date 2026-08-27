'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ChatSidebar } from './ChatSidebar';
import { MongoConversation } from '@/types/chat.types';
import { previewConversationLastMessage } from '@/lib/chat-call-preview';

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
    /** Tài khoản đối phương đã bị xóa khỏi hệ thống */
    userDeleted?: boolean;
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

            const mappedConversations: Conversation[] = data.conversations.map((conv: MongoConversation) => {
                const otherParticipant = conv.participants.find((p: any) => p.userId !== currentUserId);

                return {
                    id: conv._id?.toString() || '',
                    userId: otherParticipant?.userId || '',
                    userName:
                        otherParticipant?.deleted || otherParticipant?.name === 'Người dùng đã xóa'
                            ? 'Người dùng đã xóa'
                            : otherParticipant?.name || 'Người dùng',
                    userAvatar: otherParticipant?.avatarUrl,
                    lastMessage: {
                        id: conv.lastMessage?.senderId || '',
                        content: previewConversationLastMessage(
                            conv.lastMessage?.text || '',
                            conv.lastMessage?.type
                        ),
                        createdAt: conv.lastMessage?.createdAt || new Date(),
                        isRead: false,
                    },
                    unreadCount: conv.unreadCount[currentUserId] || 0,
                    isOnline: false,
                    userDeleted: !!otherParticipant?.deleted || otherParticipant?.name === 'Người dùng đã xóa',
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
        console.log('New chat');
    };

    const handleDeleteConversation = (conversationId: string) => {
        setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 pt-16 pb-3 max-w-7xl h-[calc(100dvh-10.5rem)] flex items-center justify-center">
                <div className="text-gray-500">Đang tải...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 pt-16 pb-3 max-w-7xl h-[calc(100dvh-10.5rem)] flex items-center justify-center">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 pt-16 pb-3 max-w-7xl h-[calc(100dvh-10.5rem)]">
            <div className="flex h-full w-full rounded-lg border border-gray-200 overflow-hidden bg-white">
                <div className="hidden lg:flex w-[300px] shrink-0 min-w-0 overflow-hidden border-r border-gray-200 h-full">
                    <ChatSidebar
                        conversations={conversations}
                        onSelectConversation={handleSelectConversation}
                        onNewChat={handleNewChat}
                        onDeleteConversation={handleDeleteConversation}
                    />
                </div>

                <div className="flex lg:hidden h-full flex-col items-center justify-center p-8 text-center text-gray-500">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Tin nhắn</h3>
                    <p className="text-sm text-gray-500">Chọn một cuộc trò chuyện để xem.</p>
                </div>
                <div className="hidden lg:flex flex-1 items-center justify-center p-8 text-center text-gray-500">
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
