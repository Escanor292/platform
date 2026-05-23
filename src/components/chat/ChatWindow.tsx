'use client';

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Send,
    Paperclip,
    Image as ImageIcon,
    Smile,
    MoreVertical,
    Phone,
    Video,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: Date;
    isRead: boolean;
    attachments?: {
        type: 'image' | 'file';
        url: string;
        name?: string;
    }[];
}

interface ChatWindowProps {
    conversationId: string;
    recipientName: string;
    recipientAvatar?: string;
    messages: Message[];
    currentUserId: string;
    onSendMessage: (content: string, attachments?: File[]) => void;
    isOnline?: boolean;
}

export function ChatWindow({
    conversationId,
    recipientName,
    recipientAvatar,
    messages,
    currentUserId,
    onSendMessage,
    isOnline,
}: ChatWindowProps) {
    const [messageText, setMessageText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
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
            onSendMessage(messageText.trim());
            setMessageText('');
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

    // Group messages by date
    const groupMessagesByDate = (messages: Message[]) => {
        const groups: { [key: string]: Message[] } = {};
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
        <div className="flex h-full flex-col bg-white">
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4">
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
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Phone className="h-5 w-5 text-gray-600" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Video className="h-5 w-5 text-gray-600" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <MoreVertical className="h-5 w-5 text-gray-600" />
                    </Button>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
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

                                return (
                                    <div
                                        key={message.id}
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
                                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
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
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 text-gray-900'
                                            )}
                                        >
                                            <p className="text-sm whitespace-pre-wrap break-words">
                                                {message.content}
                                            </p>
                                            <p
                                                className={cn(
                                                    'text-xs mt-1',
                                                    isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                                                )}
                                            >
                                                {formatMessageTime(message.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {isTyping && (
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={recipientAvatar} alt={recipientName} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
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
            <div className="border-t p-4">
                <div className="flex items-end gap-2">
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="rounded-full flex-shrink-0">
                            <Paperclip className="h-5 w-5 text-gray-600" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full flex-shrink-0">
                            <ImageIcon className="h-5 w-5 text-gray-600" />
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
                        >
                            <Smile className="h-5 w-5 text-gray-600" />
                        </Button>
                    </div>

                    <Button
                        onClick={handleSend}
                        disabled={!messageText.trim()}
                        className="rounded-full h-11 w-11 p-0 flex-shrink-0"
                    >
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
