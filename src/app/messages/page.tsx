'use client';

import { useState } from 'react';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { MessageSquare } from 'lucide-react';

// Mock data - Replace with real data from API
const mockConversations = [
    {
        id: '1',
        userId: 'user1',
        userName: 'Nguyễn Văn A',
        userAvatar: 'https://i.pravatar.cc/150?img=1',
        lastMessage: {
            id: 'msg1',
            content: 'Xin chào! Tôi muốn hỏi về dự án của bạn',
            createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
            isRead: false,
        },
        unreadCount: 3,
        isOnline: true,
    },
    {
        id: '2',
        userId: 'user2',
        userName: 'Trần Thị B',
        userAvatar: 'https://i.pravatar.cc/150?img=2',
        lastMessage: {
            id: 'msg2',
            content: 'Cảm ơn bạn đã ủng hộ dự án!',
            createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            isRead: true,
        },
        unreadCount: 0,
        isOnline: false,
    },
    {
        id: '3',
        userId: 'user3',
        userName: 'Lê Văn C',
        userAvatar: 'https://i.pravatar.cc/150?img=3',
        lastMessage: {
            id: 'msg3',
            content: 'Khi nào dự án sẽ hoàn thành?',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            isRead: false,
        },
        unreadCount: 1,
        isOnline: true,
    },
    {
        id: '4',
        userId: 'user4',
        userName: 'Phạm Thị D',
        userAvatar: 'https://i.pravatar.cc/150?img=4',
        lastMessage: {
            id: 'msg4',
            content: 'Tôi rất thích ý tưởng của bạn',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            isRead: true,
        },
        unreadCount: 0,
        isOnline: false,
    },
    {
        id: '5',
        userId: 'user5',
        userName: 'Hoàng Văn E',
        userAvatar: 'https://i.pravatar.cc/150?img=5',
        lastMessage: {
            id: 'msg5',
            content: 'Bạn có thể gửi thêm thông tin không?',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
            isRead: true,
        },
        unreadCount: 0,
        isOnline: false,
    },
];

const mockMessages = [
    {
        id: 'msg1',
        content: 'Xin chào! Tôi rất quan tâm đến dự án của bạn',
        senderId: 'user1',
        createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        isRead: true,
    },
    {
        id: 'msg2',
        content: 'Chào bạn! Cảm ơn bạn đã quan tâm. Bạn muốn biết thêm thông tin gì?',
        senderId: 'currentUser',
        createdAt: new Date(Date.now() - 1000 * 60 * 55), // 55 minutes ago
        isRead: true,
    },
    {
        id: 'msg3',
        content: 'Tôi muốn biết thêm về tiến độ thực hiện dự án',
        senderId: 'user1',
        createdAt: new Date(Date.now() - 1000 * 60 * 50), // 50 minutes ago
        isRead: true,
    },
    {
        id: 'msg4',
        content:
            'Hiện tại dự án đang trong giai đoạn phát triển. Chúng tôi dự kiến hoàn thành trong 3 tháng tới.',
        senderId: 'currentUser',
        createdAt: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
        isRead: true,
    },
    {
        id: 'msg5',
        content: 'Tuyệt vời! Tôi sẽ tiếp tục theo dõi',
        senderId: 'user1',
        createdAt: new Date(Date.now() - 1000 * 60 * 40), // 40 minutes ago
        isRead: true,
    },
    {
        id: 'msg6',
        content: 'Cảm ơn bạn! Nếu có thắc mắc gì, đừng ngại liên hệ nhé',
        senderId: 'currentUser',
        createdAt: new Date(Date.now() - 1000 * 60 * 35), // 35 minutes ago
        isRead: true,
    },
    {
        id: 'msg7',
        content: 'Xin chào! Tôi muốn hỏi về dự án của bạn',
        senderId: 'user1',
        createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        isRead: false,
    },
];

export default function MessagesPage() {
    const [activeConversationId, setActiveConversationId] = useState<string | undefined>(
        mockConversations[0]?.id
    );

    const activeConversation = mockConversations.find(
        (conv) => conv.id === activeConversationId
    );

    const handleSendMessage = (content: string, attachments?: File[]) => {
        console.log('Sending message:', content, attachments);
        // TODO: Implement send message logic
    };

    const handleNewChat = () => {
        console.log('Creating new chat');
        // TODO: Implement new chat logic
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <ChatSidebar
                conversations={mockConversations}
                activeConversationId={activeConversationId}
                onSelectConversation={setActiveConversationId}
                onNewChat={handleNewChat}
            />

            {/* Main Chat Area */}
            <div className="flex-1">
                {activeConversation ? (
                    <ChatWindow
                        conversationId={activeConversation.id}
                        recipientName={activeConversation.userName}
                        recipientAvatar={activeConversation.userAvatar}
                        messages={mockMessages}
                        currentUserId="currentUser"
                        onSendMessage={handleSendMessage}
                        isOnline={activeConversation.isOnline}
                    />
                ) : (
                    <div className="flex h-full items-center justify-center bg-white">
                        <div className="text-center">
                            <MessageSquare className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Chọn một cuộc trò chuyện
                            </h3>
                            <p className="text-sm text-gray-500">
                                Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
