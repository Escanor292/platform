'use client';

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Send,
    Paperclip,
    Image as ImageIcon,
    Smile,
    MoreVertical,
    Phone,
    Video,
    Info,
    Mic,
    Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { MongoMessage } from '@/types/chat.types';

interface ChatWindowProps {
    conversationId: string;
    recipientName: string;
    recipientAvatar?: string;
    messages: MongoMessage[];
    currentUserId: string;
    onSendMessage: (content: string, attachments?: File[], sensitive?: boolean) => void;
    isOnline?: boolean;
    onToggleInfoPanel?: () => void;
    showInfoPanel?: boolean;
    typingUsers?: string[];
    onLoadMore?: () => void;
    hasMore?: boolean;
}

export function ChatWindow({
    conversationId,
    recipientName,
    recipientAvatar,
    messages,
    currentUserId,
    onSendMessage,
    isOnline,
    onToggleInfoPanel,
    showInfoPanel,
    typingUsers = [],
    onLoadMore,
    hasMore = false,
}: ChatWindowProps) {
    const [messageText, setMessageText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showSearchDialog, setShowSearchDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<MongoMessage[]>([]);
    const [searching, setSearching] = useState(false);
    const [isSensitive, setIsSensitive] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    // Get initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Format message time
    const formatMessageTime = (date: Date) => {
        return format(new Date(date), 'HH:mm', { locale: vi });
    };

    // Handle send message
    const handleSend = () => {
        if (messageText.trim()) {
            onSendMessage(messageText.trim(), undefined, isSensitive);
            setMessageText('');
            setIsSensitive(false);
            textareaRef.current?.focus();
        }
    };

    // Handle key press
    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Search messages
    const handleSearchMessages = async (query: string) => {
        if (query.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        try {
            const response = await fetch(`/api/chat/conversations/${conversationId}/messages/search?query=${encodeURIComponent(query)}`);
            if (response.ok) {
                const data = await response.json();
                setSearchResults(data.messages || []);
            }
        } catch (error) {
            console.error('Failed to search messages:', error);
        } finally {
            setSearching(false);
        }
    };

    // Group messages by date
    const groupMessagesByDate = (messages: MongoMessage[]) => {
        const groups: { [key: string]: MongoMessage[] } = {};
        messages.forEach((message) => {
            const date = format(new Date(message.createdAt), 'dd/MM/yyyy', { locale: vi });
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(message);
        });
        return groups;
    };

    const messageGroups = groupMessagesByDate(messages);

    return (
        <>
            <div className="flex h-full flex-col min-h-0 bg-white">
                {/* Header */}
                <div className="flex items-center justify-between border-b p-4 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={recipientAvatar} alt={recipientName} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                                    {getInitials(recipientName)}
                                </AvatarFallback>
                            </Avatar>
                            {isOnline && (
                                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">{recipientName}</h3>
                            <p className="text-xs text-gray-500">
                                {isOnline ? 'Đang hoạt động' : 'Không hoạt động'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                            onClick={() => setShowSearchDialog(true)}
                            title="Tìm kiếm tin nhắn"
                        >
                            <Search className="h-5 w-5 text-gray-600" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <Phone className="h-5 w-5 text-gray-600" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <Video className="h-5 w-5 text-gray-600" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                            onClick={onToggleInfoPanel}
                        >
                            <Info className={cn(
                                "h-5 w-5",
                                showInfoPanel ? "text-primary" : "text-gray-600"
                            )} />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <MoreVertical className="h-5 w-5 text-gray-600" />
                        </Button>
                    </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4 min-h-0" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        {/* Load more button */}
                        {hasMore && onLoadMore && (
                            <div className="flex justify-center py-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onLoadMore}
                                    className="text-xs"
                                >
                                    Tải thêm tin nhắn
                                </Button>
                            </div>
                        )}
                        {Object.entries(messageGroups).map(([date, msgs]) => (
                            <div key={date}>
                                {/* Date separator */}
                                <div className="flex items-center justify-center my-4">
                                    <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                                        {date}
                                    </span>
                                </div>

                                {/* Messages for this date */}
                                {msgs.map((message, index) => {
                                    const isCurrentUser = message.senderId === currentUserId;
                                    const showAvatar =
                                        index === msgs.length - 1 ||
                                        msgs[index + 1]?.senderId !== message.senderId;
                                    const isRevealed = !message.sensitive || message.revealedBy?.includes(currentUserId);

                                    return (
                                        <div
                                            key={message._id?.toString()}
                                            className={cn(
                                                'flex gap-2 mb-2',
                                                isCurrentUser ? 'justify-end' : 'justify-start'
                                            )}
                                        >
                                            {!isCurrentUser && (
                                                <Avatar className="h-8 w-8 flex-shrink-0">
                                                    {showAvatar ? (
                                                        <>
                                                            <AvatarImage src={recipientAvatar} alt={recipientName} />
                                                            <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-xs">
                                                                {getInitials(recipientName)}
                                                            </AvatarFallback>
                                                        </>
                                                    ) : (
                                                        <div className="w-full h-full" />
                                                    )}
                                                </Avatar>
                                            )}

                                            <div
                                                className={cn(
                                                    'max-w-[70%] rounded-2xl px-4 py-2',
                                                    isCurrentUser
                                                        ? 'bg-primary text-white'
                                                        : 'bg-gray-100 text-gray-900'
                                                )}
                                            >
                                                {/* Attachments */}
                                                {message.attachments && message.attachments.length > 0 && (
                                                    <div className="mb-2 space-y-2">
                                                        {message.attachments.map((attachment, idx) => (
                                                            <div key={idx}>
                                                                {attachment.type === 'image' && (
                                                                    <img
                                                                        src={attachment.url}
                                                                        alt={attachment.filename || 'Image'}
                                                                        className="rounded-lg max-w-full h-auto max-h-48 object-cover"
                                                                    />
                                                                )}
                                                                {attachment.type === 'file' && (
                                                                    <div className="flex items-center gap-2 bg-black/10 rounded-lg p-2">
                                                                        <Paperclip className="h-4 w-4" />
                                                                        <span className="text-sm">{attachment.filename}</span>
                                                                    </div>
                                                                )}
                                                                {attachment.type === 'voice' && (
                                                                    <div className="flex items-center gap-2 bg-black/10 rounded-lg p-2">
                                                                        <Mic className="h-4 w-4" />
                                                                        <span className="text-sm">
                                                                            {attachment.duration ? `${Math.floor(attachment.duration / 60)}:${(attachment.duration % 60).toString().padStart(2, '0')}` : 'Voice'}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Text content */}
                                                {message.text && (
                                                    <p className="text-sm whitespace-pre-wrap break-words">
                                                        {isRevealed ? message.text : '🔒 Tin nhắn nhạy cảm'}
                                                    </p>
                                                )}

                                                {/* Timestamp and seen status */}
                                                <div className="flex items-center justify-end gap-1 mt-1">
                                                    <p
                                                        className={cn(
                                                            'text-xs',
                                                            isCurrentUser ? 'text-white/70' : 'text-gray-500'
                                                        )}
                                                    >
                                                        {formatMessageTime(message.createdAt)}
                                                    </p>
                                                    {isCurrentUser && message.readBy?.includes(currentUserId) && (
                                                        <span className="text-xs text-white/70">Đã xem</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {typingUsers.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={recipientAvatar} alt={recipientName} />
                                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-xs">
                                        {getInitials(recipientName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                        <span
                                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                            style={{ animationDelay: '0.1s' }}
                                        />
                                        <span
                                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                            style={{ animationDelay: '0.2s' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Input */}
                <div className="border-t p-4 flex-shrink-0">
                    <div className="flex items-end gap-2">
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="rounded-full flex-shrink-0" title="Đính kèm tệp">
                                <Paperclip className="h-5 w-5 text-gray-600" />
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-full flex-shrink-0" title="Đính kèm ảnh">
                                <ImageIcon className="h-5 w-5 text-gray-600" />
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-full flex-shrink-0" title="Ghi âm">
                                <Mic className="h-5 w-5 text-gray-600" />
                            </Button>
                        </div>

                        <div className="flex-1 relative">
                            <Textarea
                                ref={textareaRef}
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Nhập tin nhắn..."
                                className="min-h-[44px] max-h-32 resize-none pr-10"
                                rows={1}
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 bottom-2 rounded-full"
                                title="Emoji"
                            >
                                <Smile className="h-5 w-5 text-gray-600" />
                            </Button>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full flex-shrink-0"
                            onClick={() => setIsSensitive(!isSensitive)}
                            title={isSensitive ? "Bỏ đánh dấu nhạy cảm" : "Đánh dấu nhạy cảm"}
                        >
                            <span className={isSensitive ? "text-red-500" : "text-gray-400"}>🔒</span>
                        </Button>

                        <Button
                            onClick={handleSend}
                            disabled={!messageText.trim()}
                            className="rounded-full h-11 w-11 p-0 flex-shrink-0 bg-primary hover:bg-primary/90"
                        >
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Search Messages Dialog */}
                <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Tìm kiếm tin nhắn</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <Input
                                placeholder="Nhập từ khóa tìm kiếm..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    handleSearchMessages(e.target.value);
                                }}
                            />
                            <ScrollArea className="h-[300px]">
                                {searching ? (
                                    <div className="flex items-center justify-center py-8">
                                        <span className="text-gray-400 text-sm">Đang tìm kiếm...</span>
                                    </div>
                                ) : searchQuery.length < 2 ? (
                                    <p className="text-center text-gray-500 text-sm py-8">
                                        Nhập ít nhất 2 ký tự để tìm kiếm
                                    </p>
                                ) : searchResults.length === 0 ? (
                                    <p className="text-center text-gray-500 text-sm py-8">
                                        Không tìm thấy tin nhắn nào
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {searchResults.map((msg) => (
                                            <div
                                                key={msg._id?.toString()}
                                                className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                                                onClick={() => {
                                                    setShowSearchDialog(false);
                                                    // Scroll to message (implementation depends on parent)
                                                }}
                                            >
                                                <p className="text-sm text-gray-900 line-clamp-2">
                                                    {msg.text}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formatMessageTime(msg.createdAt)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
} 
