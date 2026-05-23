'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, MessageSquarePlus, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

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

interface ChatSidebarProps {
    conversations: Conversation[];
    activeConversationId?: string;
    onSelectConversation: (conversationId: string) => void;
    onNewChat?: () => void;
}

export function ChatSidebar({
    conversations,
    activeConversationId,
    onSelectConversation,
    onNewChat,
}: ChatSidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');

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

    return (
        <div className="flex h-full w-80 flex-col border-r bg-white">
            {/* Header */}
            <div className="border-b p-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Tin nhắn</h2>
                    <button
                        onClick={onNewChat}
                        className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                        title="Tạo cuộc trò chuyện mới"
                    >
                        <MessageSquarePlus className="h-5 w-5 text-gray-600" />
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Tìm kiếm cuộc trò chuyện..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
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
                            <button
                                key={conversation.id}
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
                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
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

                                    {/* More options */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Handle more options
                                        }}
                                        className="flex-shrink-0 p-1 rounded hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <MoreVertical className="h-4 w-4 text-gray-500" />
                                    </button>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
