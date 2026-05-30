# 💬 Hướng Dẫn Hệ Thống Chat

## 🎯 Tổng quan

Hệ thống chat với đầy đủ tính năng:
- ✅ Sidebar danh sách cuộc trò chuyện
- ✅ Badge số tin chưa đọc
- ✅ Trạng thái online/offline
- ✅ Tìm kiếm cuộc trò chuyện
- ✅ Cửa sổ chat với tin nhắn theo thời gian
- ✅ Typing indicator
- ✅ Gửi tin nhắn, emoji, file

## 📁 Cấu trúc Files

```
src/
├── app/
│   └── messages/
│       └── page.tsx              # Trang chat chính
├── components/
│   ├── chat/
│   │   ├── ChatSidebar.tsx       # Sidebar trái
│   │   ├── ChatWindow.tsx        # Cửa sổ chat
│   │   └── README.md             # Hướng dẫn chi tiết
│   └── ui/
│       ├── textarea.tsx          # Textarea component
│       └── scroll-area.tsx       # Scroll area component
```

## 🚀 Cách sử dụng

### 1. Truy cập trang Messages

```
http://localhost:3000/messages
```

### 2. Features chính

#### Sidebar (Bên trái)
- **Danh sách cuộc trò chuyện**: Hiển thị tất cả conversations
- **Avatar**: Ảnh đại diện người dùng với initials fallback
- **Tên người dùng**: Tên đầy đủ
- **Tin nhắn cuối**: Preview tin nhắn cuối cùng (truncated)
- **Thời gian**: Relative time (5 phút trước, 1 giờ trước, etc.)
- **Badge đỏ**: Số tin chưa đọc
- **Chấm xanh**: Trạng thái online
- **Tìm kiếm**: Search box ở đầu sidebar
- **Nút +**: Tạo cuộc trò chuyện mới

#### Chat Window (Bên phải)
- **Header**: 
  - Avatar + tên người nhận
  - Trạng thái online/offline
  - Nút gọi điện, video call, more options
- **Messages**:
  - Group theo ngày
  - Tin nhắn gửi (màu xanh, bên phải)
  - Tin nhắn nhận (màu xám, bên trái)
  - Avatar cho tin nhắn nhận
  - Thời gian mỗi tin nhắn
- **Input**:
  - Nút đính kèm file
  - Nút đính kèm ảnh
  - Textarea với auto-resize
  - Nút emoji
  - Nút gửi (Enter hoặc click)

## 🎨 UI/UX Features

### 1. Sidebar
```typescript
// Highlight conversation đang active
activeConversationId === conversation.id && 'bg-blue-50'

// Badge số tin chưa đọc
{conversation.unreadCount > 0 && (
  <Badge>{conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}</Badge>
)}

// Trạng thái online
{conversation.isOnline && (
  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500" />
)}
```

### 2. Chat Window
```typescript
// Phân biệt tin nhắn gửi/nhận
isCurrentUser ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'

// Group messages theo ngày
const messageGroups = groupMessagesByDate(messages);

// Typing indicator
{isTyping && (
  <div className="flex gap-1">
    <span className="animate-bounce">•</span>
    <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>•</span>
    <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>•</span>
  </div>
)}
```

## 🔌 Integration với Backend

### API Endpoints cần tạo

#### 1. Get Conversations
```typescript
// GET /api/conversations
// Response:
{
  conversations: [
    {
      id: string;
      userId: string;
      userName: string;
      userAvatar?: string;
      lastMessage: {
        id: string;
        content: string;
        createdAt: Date;
        isRead: boolean;
      };
      unreadCount: number;
      isOnline?: boolean;
    }
  ]
}
```

#### 2. Get Messages
```typescript
// GET /api/conversations/:conversationId/messages
// Response:
{
  messages: [
    {
      id: string;
      content: string;
      senderId: string;
      createdAt: Date;
      isRead: boolean;
    }
  ]
}
```

#### 3. Send Message
```typescript
// POST /api/conversations/:conversationId/messages
// Body:
{
  content: string;
  attachments?: File[];
}
```

#### 4. Mark as Read
```typescript
// PUT /api/conversations/:conversationId/read
```

### Database Schema

```prisma
model Conversation {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  participants ConversationParticipant[]
  messages     Message[]
}

model ConversationParticipant {
  id             String   @id @default(cuid())
  conversationId String
  userId         String
  lastReadAt     DateTime?
  
  conversation Conversation @relation(fields: [conversationId], references: [id])
  user         User         @relation(fields: [userId], references: [id])
  
  @@unique([conversationId, userId])
}

model Message {
  id             String   @id @default(cuid())
  conversationId String
  senderId       String
  content        String   @db.Text
  attachments    Json?
  createdAt      DateTime @default(now())
  
  conversation Conversation @relation(fields: [conversationId], references: [id])
  sender       User         @relation(fields: [senderId], references: [id])
  
  @@index([conversationId])
  @@index([senderId])
}
```

## 🔄 Real-time Updates

### Sử dụng Pusher

```typescript
// Install
npm install pusher-js

// Setup
import Pusher from 'pusher-js';

const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
});

// Subscribe to conversation
useEffect(() => {
  const channel = pusher.subscribe(`conversation-${conversationId}`);
  
  channel.bind('new-message', (message: Message) => {
    setMessages(prev => [...prev, message]);
  });
  
  channel.bind('typing', (data: { userId: string; isTyping: boolean }) => {
    setIsTyping(data.isTyping);
  });
  
  return () => {
    channel.unbind_all();
    channel.unsubscribe();
  };
}, [conversationId]);
```

### Hoặc sử dụng Socket.io

```typescript
// Install
npm install socket.io-client

// Setup
import { io } from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!);

useEffect(() => {
  socket.emit('join-conversation', conversationId);
  
  socket.on('new-message', (message: Message) => {
    setMessages(prev => [...prev, message]);
  });
  
  socket.on('typing', (data: { userId: string; isTyping: boolean }) => {
    setIsTyping(data.isTyping);
  });
  
  return () => {
    socket.emit('leave-conversation', conversationId);
    socket.off('new-message');
    socket.off('typing');
  };
}, [conversationId]);
```

## 📱 Responsive Design

### Desktop (>1024px)
```
┌─────────────────────────────────────┐
│  Sidebar (320px)  │  Chat Window    │
│                   │                 │
│  - Conversations  │  - Header       │
│  - Search         │  - Messages     │
│  - List           │  - Input        │
└─────────────────────────────────────┘
```

### Tablet (768px - 1024px)
```
┌─────────────────────────────────────┐
│  Sidebar (280px)  │  Chat Window    │
│  (Collapsible)    │                 │
└─────────────────────────────────────┘
```

### Mobile (<768px)
```
┌─────────────────┐
│  Sidebar        │  (Full screen)
│  - List only    │
└─────────────────┘

Hoặc

┌─────────────────┐
│  Chat Window    │  (Full screen)
│  - Back button  │
└─────────────────┘
```

## 🎯 Next Steps

### 1. Tạo API Routes
```bash
# Tạo các file API
src/app/api/conversations/route.ts
src/app/api/conversations/[id]/messages/route.ts
src/app/api/conversations/[id]/read/route.ts
```

### 2. Thêm Database Schema
```bash
# Thêm vào prisma/schema.prisma
# Chạy migration
npx prisma migrate dev --name add_chat_system
```

### 3. Setup Real-time
```bash
# Chọn một trong hai:
npm install pusher-js
# hoặc
npm install socket.io-client
```

### 4. Test
```bash
# Chạy dev server
npm run dev

# Truy cập
http://localhost:3000/messages
```

## 🐛 Troubleshooting

### Lỗi: Module not found
```bash
# Cài đặt dependencies
npm install date-fns
npm install @radix-ui/react-scroll-area
```

### Lỗi: Textarea không auto-resize
```typescript
// Thêm vào Textarea component
const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
  e.currentTarget.style.height = 'auto';
  e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
};
```

### Lỗi: Messages không scroll to bottom
```typescript
// Thêm useEffect
useEffect(() => {
  if (scrollAreaRef.current) {
    scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
  }
}, [messages]);
```

## 📚 Resources

- [Radix UI ScrollArea](https://www.radix-ui.com/docs/primitives/components/scroll-area)
- [date-fns Documentation](https://date-fns.org/)
- [Pusher Documentation](https://pusher.com/docs)
- [Socket.io Documentation](https://socket.io/docs/v4/)

## ✅ Checklist

- [x] ChatSidebar component
- [x] ChatWindow component
- [x] Textarea component
- [x] ScrollArea component
- [x] Messages page
- [ ] API routes
- [ ] Database schema
- [ ] Real-time updates
- [ ] File upload
- [ ] Emoji picker
- [ ] Responsive design
- [ ] Testing

---

**Created**: 2026-05-23
**Status**: ✅ Components ready, needs backend integration
