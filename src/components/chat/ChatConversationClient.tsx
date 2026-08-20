'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ChatWindow } from './ChatWindow';
import { ChatSidebar } from './ChatSidebar';
import { ChatInfoPanel } from './ChatInfoPanel';
import { MongoConversation, MongoMessage } from '@/types/chat.types';
import { cn } from '@/lib/utils';

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

interface ChatConversationClientProps {
    conversationId: string;
}

export function ChatConversationClient({ conversationId }: ChatConversationClientProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const currentUserId = session?.user?.id as string || '';

    const [conversation, setConversation] = useState<MongoConversation | null>(null);
    const [messages, setMessages] = useState<MongoMessage[]>([]);
    const [allConversations, setAllConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showInfoPanel, setShowInfoPanel] = useState(false);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);

    useEffect(() => {
        if (conversationId) {
            loadConversation();
            loadMessages();
            loadAllConversations();
            markAsRead();
        }
    }, [conversationId]);

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

    const markAsRead = async () => {
        try {
            const response = await fetch(`/api/chat/conversations/${conversationId}/read`, {
                method: 'PATCH',
            });
            if (response.ok) {
                // Cập nhật ngay số chưa đọc của cuộc trò chuyện này trên sidebar
                setAllConversations((prev) =>
                    prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
                );
                // Báo cho navbar badge cập nhật số tổng ngay lập tức
                window.dispatchEvent(new Event("chat:read"));
            }
        } catch (err) {
            console.error('Mark as read error:', err);
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
                    userDeleted: !!otherParticipant?.deleted,
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

    const handleSendMessage = async (content: string, files?: File[], sensitive?: boolean) => {
        if ((!content.trim() && (!files || files.length === 0)) || sending) return;

        try {
            setSending(true);

            // Upload files to Cloudinary first
            const attachmentUrls: { url: string; type: 'image' | 'file' | 'voice'; filename?: string; size?: number; mimeType?: string }[] = [];
            if (files && files.length > 0) {
                for (const file of files) {
                    const formData = new FormData();
                    formData.append('file', file);
                    const uploadResponse = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData,
                    });
                    if (!uploadResponse.ok) {
                        const errData = await uploadResponse.json().catch(() => ({ error: 'Upload failed' }));
                        throw new Error(errData.error || `Không thể tải lên file "${file.name}"`);
                    }
                    const uploadData = await uploadResponse.json();
                    attachmentUrls.push({
                        url: uploadData.url,
                        type: file.type.startsWith('audio/') ? 'voice' : file.type.startsWith('image/') ? 'image' : 'file',
                        filename: file.name,
                        size: file.size,
                        mimeType: file.type,
                    });
                }
            }

            const response = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: content, attachments: attachmentUrls, sensitive }),
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
            <div className="flex h-full w-full rounded-lg border border-gray-200 overflow-hidden bg-white">
                {/* Left: Chat Sidebar */}
                <div className="hidden lg:flex w-[300px] shrink-0 min-w-0 overflow-hidden border-r border-gray-200 h-full">
                    <ChatSidebar
                        conversations={allConversations}
                        activeConversationId={conversationId}
                        onSelectConversation={handleSelectConversation}
                        onDeleteConversation={handleDeleteConversation}
                    />
                </div>

                {/* Middle: Chat Window */}
                <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                    <ChatWindow
                        conversationId={conversationId}
                        recipientName={otherParticipant?.name || 'Người dùng'}
                        recipientAvatar={otherParticipant?.avatarUrl}
                        recipientUserId={otherParticipant?.userId}
                        recipientDeleted={!!otherParticipant?.deleted}
                        messages={messages}
                        currentUserId={currentUserId}
                        onSendMessage={handleSendMessage}
                        isOnline={false}
                        onToggleInfoPanel={() => setShowInfoPanel(!showInfoPanel)}
                        showInfoPanel={showInfoPanel}
                        typingUsers={typingUsers}
                        onMessagesUpdate={setMessages}
                    />
                </div>

                {/* Right: Info Panel (Desktop) */}
                {showInfoPanel && (
                    <div className="hidden lg:flex w-[280px] shrink-0 min-w-0 border-l border-gray-200 h-full overflow-hidden bg-white transition-all duration-200 animate-in slide-in-from-right">
                        <ChatInfoPanel
                            conversationId={conversationId}
                            otherUserId={otherParticipant?.userId}
                            otherUserName={otherParticipant?.name}
                            otherUserAvatar={otherParticipant?.avatarUrl}
                            otherUserRole={otherParticipant?.role}
                            otherUserDeleted={!!otherParticipant?.deleted}
                            campaign={conversation?.campaign}
                            onClose={() => setShowInfoPanel(false)}
                        />
                    </div>
                )}
            </div>

            {/* Mobile Info Panel Drawer */}
            {showInfoPanel && (
                <div className="fixed inset-0 z-50 bg-black/50 lg:hidden flex justify-end animate-in fade-in duration-200">
                    <div className="w-full max-w-xs h-full bg-white shadow-xl animate-in slide-in-from-right duration-200">
                        <ChatInfoPanel
                            conversationId={conversationId}
                            otherUserId={otherParticipant?.userId}
                            otherUserName={otherParticipant?.name}
                            otherUserAvatar={otherParticipant?.avatarUrl}
                            otherUserRole={otherParticipant?.role}
                            otherUserDeleted={!!otherParticipant?.deleted}
                            campaign={conversation?.campaign}
                            onClose={() => setShowInfoPanel(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
