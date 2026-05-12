# 🚀 Chat System - Quick Start

## ⚡ Bắt Đầu Nhanh (3 Bước)

### Bước 1: Khởi tạo MongoDB Indexes
```bash
npm run chat:init
```

### Bước 2: Cập nhật .env
```env
ENABLE_MONGO_CHAT=true
```

### Bước 3: Start Server
```bash
npm run dev
```

## ✅ Xong! Hệ thống chat đã sẵn sàng!

---

## 🎯 Cách Sử Dụng

### Từ Campaign Detail
1. Truy cập bất kỳ campaign nào
2. Click nút **"Nhắn tin với [Creator]"**
3. Gửi tin nhắn

### Từ Navbar
1. Click icon **💬 Tin nhắn** trên navbar
2. Xem danh sách conversations
3. Click vào conversation để chat

---

## 📦 Đã Tạo Gì?

### Backend
- ✅ 9 API endpoints
- ✅ MongoDB service
- ✅ TypeScript types
- ✅ 3 collections với indexes

### Frontend
- ✅ 10 components
- ✅ 2 pages (/chat, /chat/[id])
- ✅ Integration vào Campaign & Navbar

### Documentation
- ✅ CHAT_SYSTEM.md - Technical docs
- ✅ CHAT_INTEGRATION_GUIDE.md - Integration guide
- ✅ CHAT_IMPLEMENTATION_CHECKLIST.md - Checklist
- ✅ CHAT_SYSTEM_COMPLETE.md - Summary
- ✅ CHAT_QUICK_START.md - This file

---

## 🔍 Test Nhanh

```bash
# 1. Khởi tạo indexes
npm run chat:init

# 2. Start server
npm run dev

# 3. Mở browser
# - Đăng nhập User A
# - Tạo campaign
# - Đăng nhập User B (tab khác)
# - Truy cập campaign của User A
# - Click "Nhắn tin"
# - Gửi message
# - Quay lại User A, check /chat
```

---

## 📊 Tính Năng

- ✅ Chat 1-1 với campaign owner
- ✅ Unread count realtime
- ✅ Message pagination
- ✅ Mark as read
- ✅ Delete messages
- ✅ Block conversations
- ✅ Report abuse
- ✅ Responsive design

---

## 🆘 Troubleshooting

### Lỗi: Cannot find module '@/components/chat/...'
**Fix:** Restart dev server
```bash
npm run dev
```

### Lỗi: MongoDB connection failed
**Fix:** Check MONGODB_URI trong .env

### Lỗi: Indexes not created
**Fix:** Run init script
```bash
npm run chat:init
```

---

## 📚 Docs Đầy Đủ

- **Technical:** `docs/CHAT_SYSTEM.md`
- **Integration:** `CHAT_INTEGRATION_GUIDE.md`
- **Checklist:** `CHAT_IMPLEMENTATION_CHECKLIST.md`
- **Summary:** `CHAT_SYSTEM_COMPLETE.md`

---

## ✨ Hoàn Thành!

Hệ thống chat đã sẵn sàng sử dụng ngay! 🎉
