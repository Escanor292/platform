'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ChatWindow } from './ChatWindow';
import { ChatSidebar } from './ChatSidebar';
import { ChatInfoPanel } from './ChatInfoPanel';
import { CallModal } from './CallModal';
import { useCall } from '@/hooks/useCall';
import { MongoConversation, MongoMessage } from '@/types/chat.types';
import { getCallEventView, isVisibleCallEvent, previewConversationLastMessage } from '@/lib/chat-call-preview';

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
    userDeleted?: boolean;
}

interface ChatConversationClientProps {
    conversationId: string;
}

function toDisplayMessages(list: MongoMessage[]): MongoMessage[] {
    return list.flatMap((m) => {
        if (m.type !== 'call-signal') return [m];
        if (!isVisibleCallEvent(m.text, m.type)) return [];
        const view = getCallEventView(m.text);
        const text = view ? `☎ ${view.title}\n${view.subtitle}` : 'Cuộc gọi thoại';
        return [{
            ...m,
            type: 'text',
            text,
            attachments: [],
        }];
    });
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
    const [currentUserName, setCurrentUserName] = useState('Bạn');
    const [currentUserAvatar, setCurrentUserAvatar] = useState<string | undefined>(undefined);

    const otherParticipant = conversation?.participants.find((p: any) => p.userId !== currentUserId);
    const messagesRef = useRef<MongoMessage[]>([]);
    const setMessagesState = (updater: React.SetStateAction<MongoMessage[]>) => {
        setMessages((prev) => {
            const next = typeof updater === 'function' ? (updater as (p: MongoMessage[]) => MongoMessage[])(prev) : updater;
            messagesRef.current = next;
            return next;
        });
    };

    useEffect(() => {
        setCurrentUserName((session?.user as any)?.name || 'Bạn');
        setCurrentUserAvatar((session?.user as any)?.image || undefined);
    }, [session]);

    const fetchLatestMessages = useCallback(async () => {
        try {
            const response = await fetch(`/api/chat/conversations/${conversationId}/messages?limit=50`);
            if (!response.ok) return [];
            const data = await response.json();
            const list: MongoMessage[] = data.messages.reverse();
            setMessagesState(list);
            return list;
        } catch {
            return [];
        }
    }, [conversationId]);

    const call = useCall({
        conversationId,
        currentUserId,
        currentUserName,
        currentAvatar: currentUserAvatar,
        recipientUserId: otherParticipant?.userId,
        recipientName: otherParticipant?.name || 'Người dùng',
        recipientAvatar: otherParticipant?.avatarUrl,
        onFetchMessages: fetchLatestMessages,
    });

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
                setAllConversations((prev) =>
                    prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
                );
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
                        content: previewConversationLastMessage(
                            conv.lastMessage?.text || '',
                            conv.lastMessage?.type
                        ),
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

    const displayMessages = useMemo(() => toDisplayMessages(messages), [messages]);

    if (loading) {
        return (
            <div className="container mx-auto flex h-[calc(100dvh-9rem)] max-w-7xl items-center justify-center px-3 pt-4 pb-3 md:h-[calc(100dvh-10.5rem)] md:px-4 md:pt-16">
                <div className="text-gray-500">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-3 pt-4 pb-3 max-w-7xl h-[calc(100dvh-9rem)] md:px-4 md:pt-16 md:h-[calc(100dvh-10.5rem)]">
            <div className="flex h-full w-full rounded-lg border border-gray-200 overflow-hidden bg-white">
                <div className="hidden lg:flex w-[300px] shrink-0 min-w-0 overflow-hidden border-r border-gray-200 h-full">
                    <ChatSidebar
                        conversations={allConversations}
                        activeConversationId={conversationId}
                        onSelectConversation={handleSelectConversation}
                        onDeleteConversation={handleDeleteConversation}
                    />
                </div>

                <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                    <ChatWindow
                        conversationId={conversationId}
                        recipientName={otherParticipant?.name || 'Người dùng'}
                        recipientAvatar={otherParticipant?.avatarUrl}
                        recipientUserId={otherParticipant?.userId}
                        recipientDeleted={!!otherParticipant?.deleted}
                        messages={displayMessages}
                        loading={loading}
                        currentUserId={currentUserId}
                        currentUserName={currentUserName}
                        currentAvatar={currentUserAvatar}
                        onSendMessage={handleSendMessage}
                        onStartCall={(callType) => call.startCall(callType)}
                        isOnline={false}
                        onToggleInfoPanel={() => setShowInfoPanel(!showInfoPanel)}
                        showInfoPanel={showInfoPanel}
                        typingUsers={typingUsers}
                        onMessagesUpdate={setMessages}
                    />
                </div>

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

            <CallModal
                visible={call.phase !== 'idle' || !!call.error}
                onClose={() => call.endCall(true)}
                phase={call.phase}
                mode={call.mode}
                isRemoteVideo={call.isRemoteVideo}
                muted={call.muted}
                cameraOff={call.cameraOff}
                callDuration={call.callDuration}
                recipientName={otherParticipant?.name || 'Người dùng'}
                recipientAvatar={otherParticipant?.avatarUrl}
                currentUserName={currentUserName}
                currentAvatar={currentUserAvatar}
                error={call.error}
                localVideoRef={call.localVideoRef}
                remoteVideoRef={call.remoteVideoRef}
                onAccept={() => call.acceptIncoming()}
                onReject={() => call.rejectIncoming()}
                onEnd={() => call.endCall(true)}
                onToggleMute={() => call.toggleMute()}
                onToggleCamera={() => call.toggleCamera()}
                onDismissError={() => call.setError(null)}
            />
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
