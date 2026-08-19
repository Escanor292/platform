'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ChatWindow } from './ChatWindow';
import { ChatSidebar } from './ChatSidebar';
import { ChatInfoPanel } from './ChatInfoPanel';
import { MongoConversation, MongoMessage } from '@/types/chat.types';

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

interface ChatConversationClientProps {
    conversationId: string;
}

export function ChatConversationClient({ conversationId }: ChatConversationClientProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const currentUserId = session?.user?.id || '';

    const [conversation, setConversation] = useState<MongoConversation | null>(null);
    const [messages, setMessages] = useState<MongoMessage[]>([]);
    const [allConversations, setAllConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showInfoPanel, setShowInfoPanel] = useState(false);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);

    useEffect(() => {
        if (conversationId && currentUserId) {
            loadConversation();
            loadMessages();
            loadAllConversations();
        }
    }, [conversationId, currentUserId]);

    const loadConversation = async () => {
        try {
            const response = await fetch('/api/chat/conversations');
            if (!response.ok) throw new Error('Không thể tải thông tin cuộc trò chuyện');
            const data = await response.json();
            const conv = data.conversations.find(
                (c: MongoConversation) => c._id?.toString() === conversationId
            );
            if (conv) setConversation(conv);
        } catch (err: any) {
            console.error('Load conversation error:', err);
        }
    };

    const loadMessages = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/chat/conversations/${conversationId}/messages?limit=50`);
            if (!response.ok) throw new Error('Không thể tải tin nhắn');
            const data = await response.json();
            setMessages(data.messages.reverse());
        } catch (err: any) {
            console.error('Load messages error:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadAllConversations = async () => {
        try {
            const response = await fetch('/api/chat/conversations');
            if (!response.ok) return;
            const data = await response.json();

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

            setAllConversations(mappedConversations);
        } catch (err) {
            console.error('Load conversations error:', err);
        }
    };

    const handleSendMessage = async (content: string, attachments?: File[], sensitive?: boolean) => {
        if (!content.trim() || sending) return;

        try {
            setSending(true);
            const response = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: content, attachments: [], sensitive }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to send message');
            }

            const data = await response.json();
            setMessages((prev) => [...prev, data.message]);
        } catch (err: any) {
            console.error('Send message error:', err);
            alert(err.message || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleSelectConversation = (convId: string) => {
        router.push(`/chat/${convId}`);
    };

    const handleDeleteConversation = (convId: string) => {
        setAllConversations((prev) => prev.filter((c) => c.id !== convId));
        if (convId === conversationId) {
            router.push('/chat');
        }
    };

    const otherParticipant = conversation?.participants.find((p: any) => p.userId !== currentUserId);

    if (loading) {
        return (
            <div className="flex h-[600px] items-center justify-center">
                <div className="text-gray-500">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 pt-24 pb-8 max-w-7xl h-[calc(100vh-8rem)]">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 h-full rounded-lg border border-gray-200 overflow-hidden bg-white">
                {/* Left: Chat Sidebar */}
                <div className="hidden lg:flex lg:col-span-1 h-full border-r border-gray-200">
                    <ChatSidebar
                        conversations={allConversations}
                        activeConversationId={conversationId}
                        onSelectConversation={handleSelectConversation}
                        onDeleteConversation={handleDeleteConversation}
                    />
                </div>

                {/* Middle: Chat Window */}
                <div className="col-span-1 lg:col-span-2 h-full">
                    <ChatWindow
                        conversationId={conversationId}
                        recipientName={otherParticipant?.name || 'Người dùng'}
                        recipientAvatar={otherParticipant?.avatarUrl}
                        messages={messages}
                        currentUserId={currentUserId}
                        onSendMessage={handleSendMessage}
                        isOnline={false}
                        onToggleInfoPanel={() => setShowInfoPanel(!showInfoPanel)}
                        showInfoPanel={showInfoPanel}
                        typingUsers={typingUsers}
                    />
                </div>

                {/* Right: Info Panel */}
                {showInfoPanel && (
                    <div className="hidden lg:flex lg:col-span-1 h-full border-l border-gray-200">
                        <ChatInfoPanel
                            conversationId={conversationId}
                            otherUserId={otherParticipant?.userId}
                            otherUserName={otherParticipant?.name}
                            otherUserAvatar={otherParticipant?.avatarUrl}
                            otherUserRole={otherParticipant?.role}
                            campaign={conversation?.campaign}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
