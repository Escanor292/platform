# 💬 Chat System Components

Hệ thống chat với sidebar hiển thị danh sách cuộc trò chuyện và cửa sổ chat chính.

## 📁 Components

### 1. ChatSidebar
Sidebar trái hiển thị danh sách các cuộc trò chuyện.

**Features:**
- ✅ Hiển thị avatar người dùng
- ✅ Tên người dùng
- ✅ Tin nhắn cuối cùng (truncated)
- ✅ Thời gian tin nhắn (relative time)
- ✅ Badge số tin chưa đọc
- ✅ Trạng thái online/offline
- ✅ Tìm kiếm cuộc trò chuyện
- ✅ Nút tạo cuộc trò chuyện mới
- ✅ Highlight cuộc trò chuyện đang active

**Props:**
```typescript
interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  onNewChat?: () => void;
}
```

### 2. ChatWindow
Cửa sổ chat chính để hiển thị và gửi tin nhắn.

**Features:**
- ✅ Header với thông tin người nhận
- ✅ Hiển thị tin nhắn theo thời gian
- ✅ Group tin nhắn theo ngày
- ✅ Avatar cho tin nhắn
- ✅ Phân biệt tin nhắn gửi/nhận
- ✅ Typing indicator
- ✅ Input với emoji, attachment
- ✅ Gửi tin nhắn bằng Enter
- ✅ Auto scroll to bottom

**Props:**
```typescript
interface ChatWindowProps {
  conversationId: string;
  recipientName: string;
  recipientAvatar?: string;
  messages: Message[];
  currentUserId: string;
  onSendMessage: (content: string, attachments?: File[]) => void;
  isOnline?: boolean;
}
```

## 🚀 Usage

### Basic Example

```tsx
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatWindow } from '@/components/chat/ChatWindow';

export default function MessagesPage() {
  const [activeConversationId, setActiveConversationId] = useState<string>();

  return (
    <div className="flex h-screen">
      <ChatSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
        onNewChat={() => console.log('New chat')}
      />
      
      <ChatWindow
        conversationId={activeConversationId}
        recipientName="Nguyễn Văn A"
        messages={messages}
        currentUserId="currentUser"
        onSendMessage={(content) => console.log(content)}
      />
    </div>
  );
}
```

## 📊 Data Types

```typescript
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

interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage: Message;
  unreadCount: number;
  isOnline?: boolean;
}
```

## 🎨 Styling

Components sử dụng Tailwind CSS và shadcn/ui components:
- `Avatar` - Hiển thị avatar người dùng
- `Badge` - Badge số tin chưa đọc
- `Input` - Tìm kiếm
- `Textarea` - Input tin nhắn
- `ScrollArea` - Scroll area cho danh sách
- `Button` - Các nút action

## 🔧 Customization

### Thay đổi màu sắc tin nhắn

```tsx
// Trong ChatWindow.tsx
<div
  className={cn(
    'max-w-[70%] rounded-2xl px-4 py-2',
    isCurrentUser
      ? 'bg-green-600 text-white' // Thay đổi màu ở đây
      : 'bg-gray-100 text-gray-900'
  )}
>
```

### Thay đổi kích thước sidebar

```tsx
// Trong ChatSidebar.tsx
<div className="flex h-full w-96 flex-col"> {/* Thay w-80 thành w-96 */}
```

## 🔌 Integration với Backend

### 1. Fetch Conversations

```typescript
// app/messages/page.tsx
const { data: conversations } = await fetch('/api/conversations');
```

### 2. Fetch Messages

```typescript
const { data: messages } = await fetch(`/api/conversations/${conversationId}/messages`);
```

### 3. Send Message

```typescript
const handleSendMessage = async (content: string) => {
  await fetch(`/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
};
```

### 4. Real-time Updates (WebSocket/Pusher)

```typescript
// Sử dụng Pusher hoặc Socket.io
useEffect(() => {
  const channel = pusher.subscribe(`conversation-${conversationId}`);
  
  channel.bind('new-message', (message: Message) => {
    setMessages(prev => [...prev, message]);
  });
  
  return () => {
    channel.unbind_all();
    channel.unsubscribe();
  };
}, [conversationId]);
```

## 📱 Responsive Design

Components đã được thiết kế responsive:
- Desktop: Sidebar + Chat window
- Tablet: Sidebar có thể collapse
- Mobile: Full screen chat, sidebar overlay

## ✨ Features Roadmap

- [ ] Voice messages
- [ ] Video messages
- [ ] File attachments
- [ ] Message reactions
- [ ] Message forwarding
- [ ] Message deletion
- [ ] Read receipts
- [ ] Typing indicators (real-time)
- [ ] Message search
- [ ] Archive conversations
- [ ] Pin conversations
- [ ] Mute notifications

## 🐛 Known Issues

- Auto-scroll cần cải thiện khi có tin nhắn mới
- Textarea auto-resize chưa hoàn hảo
- Cần thêm loading states

## 📝 Notes

- Mock data hiện tại, cần thay thế bằng API calls
- Cần implement WebSocket cho real-time messaging
- Cần thêm error handling
- Cần thêm loading states
- Cần implement pagination cho messages

## 🔗 Related Files

- `/app/messages/page.tsx` - Messages page
- `/components/chat/ChatSidebar.tsx` - Sidebar component
- `/components/chat/ChatWindow.tsx` - Chat window component
- `/components/ui/textarea.tsx` - Textarea component
- `/components/ui/scroll-area.tsx` - Scroll area component
