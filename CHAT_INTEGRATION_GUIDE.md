# 🚀 Chat Integration Guide

Hướng dẫn tích hợp hệ thống chat vào dự án crowdfunding.

## Bước 1: Khởi tạo MongoDB Indexes

```bash
npm run chat:init
```

Hoặc:

```bash
npx tsx scripts/init-chat-indexes.ts
```

Output mong đợi:
```
🔧 Initializing chat indexes...
📝 Creating indexes for conversations collection...
✅ Created unique index on conversationKey
✅ Created index on participantIds
✅ Created index on updatedAt
✅ Created compound index on participantIds + updatedAt
📝 Creating indexes for messages collection...
✅ Created compound index on conversationId + createdAt
✅ Created index on senderId
✅ Created index on isDeleted
📝 Creating indexes for chat_reports collection...
✅ Created compound index on status + createdAt
✅ Created index on conversationId
✅ Created index on reporterId

✨ All chat indexes created successfully!
```

## Bước 2: Thêm Chat Button vào Campaign Detail

Mở file: `src/app/campaigns/[slug]/page.tsx`

Thêm import:
```tsx
import { StartChatButton } from "@/components/chat/StartChatButton";
```

Thêm button vào UI (ví dụ trong phần actions):
```tsx
{/* Existing buttons */}
<PledgeButton campaignId={campaign.id} />

{/* Add Chat Button */}
{!isCreator && campaign.status === 'ACTIVE' && (
  <StartChatButton
    campaignId={campaign.id}
    campaignOwnerId={campaign.creatorId}
    campaignOwnerName={campaign.creator.name}
    variant="outline"
  />
)}
```

## Bước 3: Thêm Chat Link vào Navbar

Mở file: `src/components/layout/NavbarNew.tsx`

### 3.1. Thêm imports

```tsx
import { MessageCircle } from "lucide-react";
import { ChatNotificationBadge } from "@/components/chat/ChatNotificationBadge";
```

### 3.2. Thêm link trong navigation

Tìm phần navigation links và thêm:

```tsx
{/* Desktop Navigation */}
<nav className="hidden md:flex items-center gap-6">
  <Link href="/" className="text-gray-700 hover:text-primary">
    Trang chủ
  </Link>
  <Link href="/projects" className="text-gray-700 hover:text-primary">
    Dự án
  </Link>
  
  {/* Add Chat Link */}
  {session?.user && (
    <Link href="/chat" className="relative text-gray-700 hover:text-primary">
      <MessageCircle className="h-5 w-5" />
      <ChatNotificationBadge />
    </Link>
  )}
  
  {/* Other links */}
</nav>
```

### 3.3. Thêm vào mobile menu

```tsx
{/* Mobile Menu */}
{isMenuOpen && (
  <div className="md:hidden">
    {/* Existing links */}
    
    {/* Add Chat Link */}
    {session?.user && (
      <Link
        href="/chat"
        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
        onClick={() => setIsMenuOpen(false)}
      >
        <MessageCircle className="h-5 w-5" />
        <span>Tin nhắn</span>
        <ChatNotificationBadge />
      </Link>
    )}
  </div>
)}
```

### 3.4. Thêm vào dropdown menu (nếu có)

```tsx
{/* User Dropdown Menu */}
<div className="dropdown-menu">
  {/* Existing items */}
  
  {/* Add Chat Item */}
  <Link
    href="/chat"
    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50"
  >
    <MessageCircle className="h-5 w-5" />
    <span>Tin nhắn</span>
    <ChatNotificationBadge />
  </Link>
</div>
```

## Bước 4: Cập nhật Environment Variables

Thêm vào file `.env`:

```env
# MongoDB Chat
ENABLE_MONGO_CHAT=true
```

## Bước 5: Test Hệ Thống

### 5.1. Start Development Server

```bash
npm run dev
```

### 5.2. Test Flow

1. **Đăng nhập** với 2 tài khoản khác nhau (User A và User B)
2. **User B tạo campaign** và publish
3. **User A truy cập campaign** của User B
4. **User A click** "Nhắn tin với [User B]"
5. **Gửi tin nhắn** từ User A
6. **Đăng nhập User B** và check `/chat`
7. **Verify**:
   - Conversation xuất hiện trong list
   - Unread count hiển thị đúng
   - Message hiển thị đúng
   - Campaign info hiển thị trong header
   - Mark as read hoạt động

### 5.3. Test Cases

- [ ] Tạo conversation mới
- [ ] Gửi message thành công
- [ ] Nhận message
- [ ] Unread count cập nhật
- [ ] Mark as read
- [ ] Delete message
- [ ] Block conversation
- [ ] Report conversation
- [ ] Pagination hoạt động
- [ ] Không thể chat với chính mình
- [ ] Không thể gửi message rỗng
- [ ] Responsive trên mobile

## Bước 6: Deployment

### 6.1. Production MongoDB

Đảm bảo MongoDB production đã được setup:

```env
MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/db?retryWrites=true&w=majority"
MONGODB_DB_NAME="crowdfunding_vn"
ENABLE_MONGO_CHAT=true
```

### 6.2. Run Indexes Script

Trên production server:

```bash
npm run chat:init
```

### 6.3. Verify Deployment

1. Check MongoDB indexes đã tạo
2. Test chat functionality
3. Monitor error logs
4. Check performance metrics

## Troubleshooting

### Issue: Indexes không tạo được

**Solution:**
```bash
# Check MongoDB connection
node -e "require('./src/lib/mongodb').getDb().then(() => console.log('Connected')).catch(console.error)"

# Manually create indexes
npx tsx scripts/init-chat-indexes.ts
```

### Issue: Unread count không hiển thị

**Solution:**
1. Check session authentication
2. Check API endpoint `/api/chat/unread-count`
3. Check ChatNotificationBadge component mounted
4. Check polling interval (30s)

### Issue: Messages không load

**Solution:**
1. Check MongoDB connection
2. Check conversation exists
3. Check user is participant
4. Check browser console for errors
5. Check network tab for API calls

### Issue: Cannot send message

**Solution:**
1. Check text không rỗng
2. Check conversation không bị block
3. Check user authentication
4. Check API endpoint response

## Advanced Configuration

### Custom Polling Interval

Mở `src/components/chat/ChatNotificationBadge.tsx`:

```tsx
// Change from 30s to 60s
const interval = setInterval(loadUnreadCount, 60000);
```

### Custom Message Limit

Mở `src/components/chat/ChatScreen.tsx`:

```tsx
// Change from 50 to 100
const response = await fetch(
  `/api/chat/conversations/${conversationId}/messages?limit=100`
);
```

### Custom Text Length

Mở `src/services/mongodb/chat.service.ts`:

```tsx
// Change from 2000 to 5000
if (trimmedText.length > 5000) {
  throw new Error('Message text is too long (max 5000 characters)');
}
```

## Performance Optimization

### 1. Enable MongoDB Connection Pooling

Already configured in `src/lib/mongodb.ts`:
```typescript
maxPoolSize: 10
```

### 2. Add Rate Limiting

Recommended: Add rate limiting middleware to prevent spam.

### 3. Optimize Polling

Consider using WebSocket/Socket.IO for real-time updates instead of polling.

## Next Steps

### Phase 2 Features (Optional)

1. **Socket.IO Integration**
   - Real-time messaging
   - Typing indicators
   - Online status

2. **Rich Media**
   - Image attachments
   - File uploads
   - Voice messages

3. **Advanced Features**
   - Message search
   - Message reactions
   - Read receipts
   - Group chat

4. **Admin Features**
   - Report management dashboard
   - User moderation
   - Chat analytics

## Support

Nếu gặp vấn đề:

1. Check documentation: `docs/CHAT_SYSTEM.md`
2. Check checklist: `CHAT_IMPLEMENTATION_CHECKLIST.md`
3. Check MongoDB connection
4. Check console logs
5. Check network requests

## Summary

✅ **Completed:**
- MongoDB collections and indexes
- API endpoints (9 endpoints)
- Frontend components (10 components)
- Pages (/chat, /chat/[id])
- Documentation
- Integration guide

🎉 **Ready to use!**

Hệ thống chat đã sẵn sàng. Chỉ cần thêm button vào campaign detail và link vào navbar là có thể sử dụng ngay!
