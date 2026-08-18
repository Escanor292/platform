'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, MessageSquarePlus, MoreVertical, Edit2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { UserAvatar } from './UserAvatar';
import { NewMessageDialog } from './NewMessageDialog';
import { EditNoteDialog } from './EditNoteDialog';

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

interface UserNote {
    _id: string;
    targetUserId: string;
    note: string;
    expiresAt: Date;
}

interface ChatSidebarProps {
    conversations: Conversation[];
    activeConversationId?: string;
    onSelectConversation: (conversationId: string) => void;
    onNewChat?: () => void;
    onDeleteConversation?: (conversationId: string) => void;
}

export function ChatSidebar({
    conversations,
    activeConversationId,
    onSelectConversation,
    onNewChat,
    onDeleteConversation,
}: ChatSidebarProps) {
    const { data: session } = useSession();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'messages' | 'requests'>('messages');
    const [notes, setNotes] = useState<UserNote[]>([]);
    const [showNotes, setShowNotes] = useState(false);
    const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
    const [showEditNoteDialog, setShowEditNoteDialog] = useState(false);
    const [selectedNoteUser, setSelectedNoteUser] = useState<{ id: string; name: string; note?: string } | null>(null);

    // Filter conversations based on search
    const filteredConversations = conversations.filter((conv) =>
        conv.userName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Get initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Format time
    const formatTime = (date: Date) => {
        return formatDistanceToNow(new Date(date), {
            addSuffix: true,
            locale: vi,
        });
    };

    // Truncate message
    const truncateMessage = (text: string, maxLength: number = 50) => {
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength) + '...';
    };

    // Load user notes
    const loadNotes = async () => {
        try {
            const response = await fetch('/api/chat/notes');
            if (response.ok) {
                const data = await response.json();
                setNotes(data.notes);
            }
        } catch (error) {
            console.error('Failed to load notes:', error);
        }
    };

    // Toggle notes section
    const toggleNotes = () => {
        if (!showNotes) {
            loadNotes();
        }
        setShowNotes(!showNotes);
    };

    // Delete conversation
    const handleDeleteConversation = async (conversationId: string) => {
        if (!confirm('Bạn có chắc muốn xóa cuộc trò chuyện này?')) {
            return;
        }

        try {
            const response = await fetch(`/api/chat/conversations/${conversationId}/delete`, {
                method: 'DELETE',
            });

            if (response.ok) {
                if (onDeleteConversation) {
                    onDeleteConversation(conversationId);
                }
            } else {
                const errorData = await response.json();
                alert(errorData.error || 'Không thể xóa cuộc trò chuyện');
            }
        } catch (error) {
            alert('Có lỗi xảy ra khi xóa cuộc trò chuyện');
        }
    };

    return (
        <div className="flex h-full w-80 flex-col border-r bg-white">
            {/* Header with user account */}
            <div className="border-b p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <UserAvatar
                            src={session?.user?.image || undefined}
                            name={session?.user?.name || 'Bạn'}
                            size="md"
                            userId={session?.user?.id}
                            clickable={true}
                        />
                        <div>
                            <h2 className="font-semibold text-gray-900">{session?.user?.name || 'Bạn'}</h2>
                            <p className="text-xs text-gray-500">TửTế Fund</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowNewMessageDialog(true)}
                        className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                        title="Tin nhắn mới"
                    >
                        <MessageSquarePlus className="h-5 w-5 text-gray-600" />
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b">
                <button
                    onClick={() => setActiveTab('messages')}
                    className={cn(
                        'flex-1 py-3 text-sm font-medium transition-colors',
                        activeTab === 'messages'
                            ? 'text-gray-900 border-b-2 border-gray-900'
                            : 'text-gray-500 hover:text-gray-700'
                    )}
                >
                    Tin nhắn
                </button>
                <button
                    onClick={() => setActiveTab('requests')}
                    className={cn(
                        'flex-1 py-3 text-sm font-medium transition-colors',
                        activeTab === 'requests'
                            ? 'text-gray-900 border-b-2 border-gray-900'
                            : 'text-gray-500 hover:text-gray-700'
                    )}
                >
                    Yêu cầu
                </button>
            </div>

            {/* 24h Notes Section */}
            <div className="border-b">
                <button
                    onClick={toggleNotes}
                    className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Ghi chú 24h</span>
                    </div>
                    <Edit2 className="h-4 w-4 text-gray-400" />
                </button>
                {showNotes && (
                    <div className="px-4 pb-3 space-y-2">
                        {notes.length === 0 ? (
                            <p className="text-xs text-gray-500">Chưa có ghi chú nào</p>
                        ) : (
                            notes.map((note) => (
                                <div
                                    key={note._id}
                                    className="bg-yellow-50 p-2 rounded-lg text-sm text-gray-700"
                                >
                                    {note.note}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Conversations List */}
            <ScrollArea className="flex-1">
                <div className="divide-y">
                    {filteredConversations.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            {searchQuery ? (
                                <>
                                    <p className="text-sm">Không tìm thấy cuộc trò chuyện</p>
                                    <p className="text-xs mt-1">Thử tìm kiếm với từ khóa khác</p>
                                </>
                            ) : (
                                <>
                                    <MessageSquarePlus className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                    <p className="text-sm">Chưa có cuộc trò chuyện nào</p>
                                    <p className="text-xs mt-1">Bắt đầu trò chuyện mới</p>
                                </>
                            )}
                        </div>
                    ) : (
                        filteredConversations.map((conversation) => (
                            <div
                                key={conversation.id}
                                className="group relative"
                            >
                                <button
                                    onClick={() => onSelectConversation(conversation.id)}
                                    className={cn(
                                        'w-full p-4 text-left transition-colors hover:bg-gray-50',
                                        activeConversationId === conversation.id && 'bg-blue-50 hover:bg-blue-50'
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Avatar with online status */}
                                        <div className="relative flex-shrink-0">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={conversation.userAvatar} alt={conversation.userName} />
                                                <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                                                    {getInitials(conversation.userName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            {conversation.isOnline && (
                                                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3
                                                    className={cn(
                                                        'font-medium text-sm truncate',
                                                        conversation.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'
                                                    )}
                                                >
                                                    {conversation.userName}
                                                </h3>
                                                <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                                    {formatTime(conversation.lastMessage.createdAt)}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between gap-2">
                                                <p
                                                    className={cn(
                                                        'text-sm truncate',
                                                        conversation.unreadCount > 0
                                                            ? 'text-gray-900 font-medium'
                                                            : 'text-gray-500'
                                                    )}
                                                >
                                                    {truncateMessage(conversation.lastMessage.content)}
                                                </p>

                                                {/* Unread badge */}
                                                {conversation.unreadCount > 0 && (
                                                    <Badge
                                                        variant="default"
                                                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center text-xs font-semibold flex-shrink-0"
                                                    >
                                                        {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </button>

                                {/* More options menu */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteConversation(conversation.id);
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Xóa cuộc trò chuyện"
                                >
                                    <MoreVertical className="h-4 w-4 text-gray-500" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>

            {/* New Message Dialog */}
            <NewMessageDialog
                open={showNewMessageDialog}
                onOpenChange={setShowNewMessageDialog}
            />

            {/* Edit Note Dialog */}
            {selectedNoteUser && (
                <EditNoteDialog
                    open={showEditNoteDialog}
                    onOpenChange={setShowEditNoteDialog}
                    targetUserId={selectedNoteUser.id}
                    targetUserName={selectedNoteUser.name}
                    existingNote={selectedNoteUser.note}
                />
            )}
        </div>
    );
}
