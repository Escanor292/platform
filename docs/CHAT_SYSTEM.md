# 💬 Hệ Thống Chat 1-1

## Tổng Quan

Hệ thống chat 1-1 cho phép người dùng nhắn tin trực tiếp với chủ chiến dịch. Chat được lưu trữ trong MongoDB để tối ưu hiệu năng và linh hoạt.

## Kiến Trúc

### Database

- **PostgreSQL**: Xác thực users, campaigns (validation only)
- **MongoDB**: Lưu trữ conversations, messages, reports

### Collections

#### 1. `conversations`
```typescript
{
  _id: ObjectId,
  conversationKey: string, // Unique: "campaign_{campaignId}_{userId1}_{userId2}"
  type: "direct" | "campaign" | "admin_support",
  participants: [
    {
      userId: string, // PostgreSQL user.id
      name: string,
      email: string,
      avatarUrl?: string,
      role: string
    }
  ],
  participantIds: string[], // For quick lookup
  campaign?: {
    campaignId: string,
    title: string,
    coverImage?: string,
    currentAmount: number,
    goalAmount: number,
    ownerId: string
  },
  lastMessage?: {
    text: string,
    senderId: string,
    createdAt: Date
  },
  unreadCount: { [userId: string]: number },
  isActive: boolean,
  isReported: boolean,
  blockedBy: string[],
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `conversationKey` (unique)
- `participantIds`
- `updatedAt` (desc)
- `participantIds + updatedAt` (compound)

#### 2. `messages`
```typescript
{
  _id: ObjectId,
  conversationId: ObjectId,
  senderId: string, // PostgreSQL user.id
  senderName: string,
  senderAvatar?: string,
  text: string,
  type: "text" | "image" | "file",
  attachments: [],
  readBy: string[],
  isDeleted: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `conversationId + createdAt` (compound, desc)
- `senderId`
- `isDeleted`

#### 3. `chat_reports`
```typescript
{
  _id: ObjectId,
  conversationId: ObjectId,
  messageId?: ObjectId,
  reporterId: string,
  reason: "spam" | "scam" | "abuse" | "other",
  description: string,
  status: "pending" | "reviewed" | "rejected" | "resolved",
  createdAt: Date,
  updatedAt: Date,
  reviewedAt?: Date,
  reviewedBy?: string
}
```

**Indexes:**
- `status + createdAt` (compound)
- `conversationId`
- `reporterId`

## API Endpoints

### 1. Start Conversation
```
POST /api/chat/conversations/start
Body: {
  targetUserId: string,
  campaignId?: string
}
Response: {
  conversation: MongoConversation,
  isNew: boolean
}
```

### 2. Get Conversations
```
GET /api/chat/conversations
Response: {
  conversations: MongoConversation[]
}
```

### 3. Get Messages
```
GET /api/chat/conversations/[conversationId]/messages?limit=30&before=messageId
Response: {
  messages: MongoMessage[],
  hasMore: boolean
}
```

### 4. Send Message
```
POST /api/chat/conversations/[conversationId]/messages
Body: {
  text: string
}
Response: {
  message: MongoMessage
}
```

### 5. Mark as Read
```
PATCH /api/chat/conversations/[conversationId]/read
Response: {
  success: boolean
}
```

### 6. Delete Message
```
DELETE /api/chat/messages/[messageId]
Response: {
  success: boolean
}
```

### 7. Report Conversation
```
POST /api/chat/conversations/[conversationId]/report
Body: {
  messageId?: string,
  reason: ChatReportReason,
  description: string
}
Response: {
  report: MongoChatReport
}
```

### 8. Block/Unblock Conversation
```
POST /api/chat/conversations/[conversationId]/block
DELETE /api/chat/conversations/[conversationId]/block
Response: {
  success: boolean
}
```

### 9. Get Unread Count
```
GET /api/chat/unread-count
Response: {
  unreadCount: number
}
```

## Components

### Frontend Components

1. **ConversationList** - Danh sách cuộc trò chuyện
2. **ConversationItem** - Item trong danh sách
3. **ChatScreen** - Màn hình chat chính
4. **MessageBubble** - Bubble tin nhắn
5. **ChatInput** - Input gửi tin nhắn
6. **UserAvatar** - Avatar người dùng
7. **UnreadBadge** - Badge số tin nhắn chưa đọc
8. **CampaignChatHeader** - Header với thông tin campaign
9. **StartChatButton** - Nút bắt đầu chat từ campaign detail
10. **ChatNotificationBadge** - Badge thông báo trên navbar

## Usage

### 1. Thêm nút chat vào Campaign Detail

```tsx
import { StartChatButton } from "@/components/chat/StartChatButton";

<StartChatButton
  campaignId={campaign.id}
  campaignOwnerId={campaign.creatorId}
  campaignOwnerName={campaign.creator.name}
  variant="default"
/>
```

### 2. Thêm link Chat vào Navbar

```tsx
import { MessageCircle } from "lucide-react";
import { ChatNotificationBadge } from "@/components/chat/ChatNotificationBadge";

<Link href="/chat" className="relative">
  <MessageCircle className="h-5 w-5" />
  <ChatNotificationBadge />
</Link>
```

### 3. Trang Chat

- `/chat` - Danh sách conversations
- `/chat/[conversationId]` - Màn hình chat

## Security

### Validation Rules

1. **User Authentication**: Tất cả endpoints yêu cầu đăng nhập
2. **Participant Check**: User chỉ truy cập conversations mà họ tham gia
3. **Campaign Validation**: Validate campaign tồn tại và active
4. **Owner Validation**: Chỉ chat với campaign owner
5. **Text Validation**: 
   - Không rỗng
   - Max 2000 ký tự
   - Trim whitespace
6. **Block Check**: Không gửi message nếu conversation bị block
7. **Delete Permission**: Chỉ sender xóa message của mình

### Rate Limiting

Khuyến nghị thêm rate limiting:
- 20 messages/phút/user
- 100 conversations/ngày/user

## Setup

### 1. Cài đặt MongoDB Indexes

```bash
npx tsx scripts/init-chat-indexes.ts
```

### 2. Environment Variables

```env
MONGODB_URI="mongodb+srv://..."
MONGODB_DB_NAME="crowdfunding_vn"
ENABLE_MONGO_CHAT=true
```

### 3. Test Chat System

```bash
# Start development server
npm run dev

# Navigate to campaign detail
# Click "Nhắn tin với [Creator Name]"
# Send messages
# Check /chat for conversation list
```

## Features

### ✅ Implemented

- [x] 1-1 chat giữa backer và creator
- [x] Chat gắn với campaign cụ thể
- [x] Conversation list với unread count
- [x] Message pagination
- [x] Mark as read
- [x] Soft delete messages
- [x] Block/unblock conversations
- [x] Report conversations
- [x] Real-time unread count (polling)
- [x] Campaign info trong chat header
- [x] Responsive design
- [x] MongoDB indexes

### 🚧 Future Enhancements

- [ ] Socket.IO for real-time messaging
- [ ] Typing indicators
- [ ] Image/file attachments
- [ ] Message reactions
- [ ] Search messages
- [ ] Admin dashboard for reports
- [ ] Push notifications
- [ ] Message read receipts
- [ ] Group chat support

## Troubleshooting

### Messages không load

1. Check MongoDB connection
2. Check indexes đã tạo chưa
3. Check user authentication
4. Check console logs

### Unread count không cập nhật

1. Check polling interval (30s)
2. Check API endpoint `/api/chat/unread-count`
3. Check session authentication

### Không gửi được message

1. Check text không rỗng
2. Check conversation không bị block
3. Check user là participant
4. Check network requests

## Performance

### Optimization Tips

1. **Pagination**: Load 30-50 messages mỗi lần
2. **Polling**: 30s interval cho unread count
3. **Indexes**: Đảm bảo tất cả indexes đã tạo
4. **Caching**: Cache conversation list
5. **Lazy Loading**: Load messages khi scroll

### Monitoring

Monitor các metrics:
- Average message send time
- Conversation load time
- Unread count query time
- MongoDB connection pool usage

## Testing

### Manual Testing Checklist

- [ ] Tạo conversation mới
- [ ] Gửi message
- [ ] Nhận message
- [ ] Mark as read
- [ ] Unread count cập nhật
- [ ] Delete message
- [ ] Block conversation
- [ ] Report conversation
- [ ] Pagination hoạt động
- [ ] Responsive trên mobile

### API Testing

```bash
# Test start conversation
curl -X POST http://localhost:3000/api/chat/conversations/start \
  -H "Content-Type: application/json" \
  -d '{"targetUserId":"user-id","campaignId":"campaign-id"}'

# Test send message
curl -X POST http://localhost:3000/api/chat/conversations/[id]/messages \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello!"}'
```

## Support

Nếu gặp vấn đề, check:
1. MongoDB connection string
2. Indexes đã tạo
3. Environment variables
4. Console logs
5. Network tab trong DevTools
