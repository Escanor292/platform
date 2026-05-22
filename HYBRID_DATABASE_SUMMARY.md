# 🔄 HYBRID DATABASE ARCHITECTURE - TÓM TẮT

## 📊 TỔNG QUAN

Dự án sử dụng **Hybrid Database Architecture** kết hợp:
- **PostgreSQL** (qua Prisma ORM) - Dữ liệu quan hệ
- **MongoDB** (qua Native Driver) - Dữ liệu phi cấu trúc

---

## 🗄️ POSTGRESQL (12 TABLES)

### Vai trò: **Source of Truth** - Dữ liệu chính

| # | Table | Mô tả | Số Records (ước tính) |
|---|-------|-------|----------------------|
| 1 | **users** | Người dùng | 10,000+ |
| 2 | **campaigns** | Chiến dịch gây quỹ | 1,000+ |
| 3 | **pledges** | Ủng hộ/Giao dịch | 50,000+ |
| 4 | **rewards** | Phần thưởng | 5,000+ |
| 5 | **campaign_updates** | Cập nhật cơ bản | 10,000+ |
| 6 | **reviews** | Đánh giá | 20,000+ |
| 7 | **campaign_reports** | Báo cáo vi phạm | 500+ |
| 8 | **campaign_followers** | Theo dõi chiến dịch | 30,000+ |
| 9 | **kyc_info** | Xác minh danh tính | 5,000+ |
| 10 | **backer_invoices** | Hóa đơn người ủng hộ | 50,000+ |
| 11 | **platform_invoices** | Hóa đơn nền tảng | 1,000+ |
| 12 | **audit_logs** | Lịch sử thay đổi | 100,000+ |
| 13 | **blacklist** | Danh sách đen | 100+ |
| 14 | **transaction_limits** | Giới hạn giao dịch | 100+ |
| 15 | **daily_tip_invoices** | Hóa đơn tip hàng ngày | 365+ |

### Đặc điểm:
- ✅ **ACID Compliance** - Đảm bảo tính toàn vẹn
- ✅ **Foreign Keys** - Ràng buộc quan hệ
- ✅ **Transactions** - Rollback khi lỗi
- ✅ **Complex Queries** - JOIN, GROUP BY, Aggregations
- ✅ **Data Integrity** - Constraints, Unique, Not Null

### Khi nào dùng PostgreSQL?
- ✅ Dữ liệu tài chính (amount, payment)
- ✅ Quan hệ phức tạp (users ↔ campaigns ↔ pledges)
- ✅ Cần ACID (transactions, invoices)
- ✅ Cần rollback (payment failures)
- ✅ Dữ liệu cố định schema

---

## 🍃 MONGODB (9 COLLECTIONS)

### Vai trò: **Performance & Flexibility** - Tối ưu hiệu năng

| # | Collection | Mô tả | Số Documents (ước tính) | TTL |
|---|------------|-------|------------------------|-----|
| 1 | **campaign_updates** | Cập nhật chi tiết (rich content) | 20,000+ | ∞ |
| 2 | **comments** | Bình luận (nested) | 100,000+ | ∞ |
| 3 | **notifications** | Thông báo người dùng | 500,000+ | 90 days |
| 4 | **activity_logs** | Hoạt động người dùng | 1,000,000+ | 90 days |
| 5 | **audit_logs** | Lịch sử (song song PG) | 200,000+ | 365 days |
| 6 | **analytics_events** | Tracking & Analytics | 5,000,000+ | 180 days |
| 7 | **campaign_content** | Nội dung phong phú | 1,000+ | ∞ |
| 8 | **user_metadata** | Metadata người dùng | 10,000+ | ∞ |
| 9 | **report_metadata** | Metadata báo cáo | 500+ | ∞ |

### Đặc điểm:
- ✅ **Flexible Schema** - Không cần migration
- ✅ **High Write Speed** - Logs, analytics
- ✅ **Nested Documents** - Comments, content blocks
- ✅ **TTL Indexes** - Tự động xóa dữ liệu cũ
- ✅ **Aggregation Pipeline** - Analytics mạnh mẽ

### Khi nào dùng MongoDB?
- ✅ Logs (không cần rollback)
- ✅ Analytics (query nhanh, aggregation)
- ✅ Rich content (blog, campaign updates)
- ✅ Real-time data (notifications, chat)
- ✅ Flexible schema (user preferences, metadata)
- ✅ High write volume (tracking events)

---

## 🔗 QUAN HỆ GIỮA 2 DATABASES

### PostgreSQL → MongoDB (References)

```
PostgreSQL                    MongoDB
─────────────────────────────────────────────
users.id          ──────►    notifications.userId
users.id          ──────►    user_metadata.userId
users.id          ──────►    activity_logs.userId
users.id          ──────►    comments.userId

campaigns.id      ──────►    campaign_updates.campaignId
campaigns.id      ──────►    campaign_content.campaignId
campaigns.id      ──────►    comments.campaignId
campaigns.id      ──────►    analytics_events.campaignId

campaign_reports.id ─────►   report_metadata.pgReportId
audit_logs.id     ──────►    audit_logs.pgAuditLogId (MongoDB)
```

### Cách Tham Chiếu:
- MongoDB lưu **PostgreSQL IDs dạng string** (cuid)
- **KHÔNG có Foreign Key constraints** giữa 2 databases
- Application layer đảm bảo tính nhất quán

---

## 📈 SO SÁNH HIỆU NĂNG

| Tiêu chí | PostgreSQL | MongoDB | Winner |
|----------|-----------|---------|--------|
| **Read Speed** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | MongoDB |
| **Write Speed** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | MongoDB |
| **Complex Queries** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | PostgreSQL |
| **Transactions** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | PostgreSQL |
| **Data Integrity** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | PostgreSQL |
| **Flexibility** | ⭐⭐ | ⭐⭐⭐⭐⭐ | MongoDB |
| **Aggregation** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | MongoDB |
| **Scalability** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | MongoDB |

---

## 🎯 USE CASES CỤ THỂ

### PostgreSQL Examples:

**1. Tạo Pledge (Ủng hộ)**
```typescript
// PostgreSQL - ACID transaction
await prisma.$transaction([
  prisma.pledge.create({ data: pledgeData }),
  prisma.campaign.update({ 
    where: { id: campaignId },
    data: { currentAmount: { increment: amount } }
  }),
  prisma.backerInvoice.create({ data: invoiceData })
]);
```

**2. Chuyển tiền cho Creator**
```typescript
// PostgreSQL - Financial transaction
await prisma.$transaction([
  prisma.pledge.update({ 
    where: { id },
    data: { status: 'SUCCESS' }
  }),
  prisma.platformInvoice.create({ data: invoiceData })
]);
```

### MongoDB Examples:

**1. Ghi Activity Log**
```typescript
// MongoDB - High write speed
await activityLogService.log({
  userId,
  action: 'CAMPAIGN_VIEW',
  entityType: 'CAMPAIGN',
  entityId: campaignId,
  metadata: { ipAddress, userAgent }
});
```

**2. Tạo Notification**
```typescript
// MongoDB - Flexible schema
await notificationService.create({
  userId,
  type: 'PLEDGE_RECEIVED',
  title: 'Bạn nhận được ủng hộ mới!',
  message: `${backerName} đã ủng hộ ${amount} VND`,
  payload: { campaignId, pledgeId, amount }
});
```

**3. Lưu Rich Content**
```typescript
// MongoDB - Nested documents
await campaignContentService.save({
  campaignId,
  sections: [
    { type: 'TEXT', content: '...', order: 1 },
    { type: 'IMAGE_GALLERY', content: [...], order: 2 },
    { type: 'VIDEO', content: { url: '...' }, order: 3 }
  ]
});
```

---

## 🔄 DATA FLOW EXAMPLES

### Flow 1: User Ủng Hộ Chiến Dịch

```
1. User click "Ủng hộ"
   ↓
2. PostgreSQL: Create Pledge (PENDING)
   ↓
3. MongoDB: Log activity (DONATION_MODAL_OPEN)
   ↓
4. Redirect to PayOS
   ↓
5. PayOS webhook callback
   ↓
6. PostgreSQL: Update Pledge (SUCCESS)
   PostgreSQL: Update Campaign.currentAmount
   PostgreSQL: Create BackerInvoice
   ↓
7. MongoDB: Create Notification (PAYMENT_SUCCESS)
   MongoDB: Log activity (PAYMENT_SUCCESS)
   MongoDB: Log analytics event
```

### Flow 2: Creator Đăng Cập Nhật

```
1. Creator viết bài update (rich text)
   ↓
2. MongoDB: Save campaign_updates (draft)
   ↓
3. Creator click "Publish"
   ↓
4. MongoDB: Update status = PUBLISHED
   ↓
5. PostgreSQL: Get all followers
   ↓
6. MongoDB: Create notifications (bulk insert)
   ↓
7. MongoDB: Log activity (UPDATE_PUBLISHED)
```

### Flow 3: Admin Xem Báo Cáo

```
1. Admin mở dashboard
   ↓
2. PostgreSQL: Get basic stats (campaigns, users, pledges)
   ↓
3. MongoDB: Aggregate analytics_events
   MongoDB: Get activity_logs
   ↓
4. Combine data → Display charts
```

---

## 🛠️ CÔNG CỤ QUẢN LÝ

### PostgreSQL:
- **Prisma Studio**: `npx prisma studio`
- **pgAdmin**: GUI tool
- **psql**: CLI tool

### MongoDB:
- **MongoDB Compass**: GUI tool
- **mongo shell**: CLI tool
- **Custom admin panel**: `/dashboard/admin/mongodb`

---

## 📊 INDEXES & OPTIMIZATION

### PostgreSQL Indexes:
```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Campaigns
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_creator ON campaigns(creatorId);

-- Pledges
CREATE INDEX idx_pledges_campaign ON pledges(campaignId);
CREATE INDEX idx_pledges_user ON pledges(userId);
CREATE INDEX idx_pledges_status ON pledges(status);
```

### MongoDB Indexes:
```javascript
// Notifications
db.notifications.createIndex({ userId: 1, createdAt: -1 });
db.notifications.createIndex({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL

// Activity Logs
db.activity_logs.createIndex({ userId: 1, createdAt: -1 });
db.activity_logs.createIndex({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL

// Comments
db.comments.createIndex({ campaignId: 1, createdAt: -1 });
db.comments.createIndex({ parentId: 1 });

// Analytics
db.analytics_events.createIndex({ eventName: 1, createdAt: -1 });
db.analytics_events.createIndex({ campaignId: 1, eventName: 1 });
```

---

## 🔐 BACKUP & RECOVERY

### PostgreSQL:
```bash
# Backup
pg_dump -U postgres crowdfunding_vn > backup.sql

# Restore
psql -U postgres crowdfunding_vn < backup.sql
```

### MongoDB:
```bash
# Backup
mongodump --uri="mongodb://..." --out=./backup

# Restore
mongorestore --uri="mongodb://..." ./backup
```

---

## 📈 SCALING STRATEGY

### PostgreSQL:
- **Vertical Scaling**: Tăng RAM, CPU
- **Read Replicas**: Cho read-heavy queries
- **Connection Pooling**: PgBouncer
- **Partitioning**: Theo date (pledges, invoices)

### MongoDB:
- **Horizontal Scaling**: Sharding
- **Replica Sets**: High availability
- **Capped Collections**: Logs với size limit
- **TTL Indexes**: Tự động xóa dữ liệu cũ

---

## ✅ LỢI ÍCH CỦA HYBRID

1. **Best of Both Worlds**
   - PostgreSQL: Tính nhất quán cho tài chính
   - MongoDB: Hiệu năng cao cho logs & analytics

2. **Separation of Concerns**
   - Critical data → PostgreSQL
   - Non-critical data → MongoDB

3. **Performance Optimization**
   - Giảm tải cho PostgreSQL
   - MongoDB xử lý high-write workloads

4. **Flexibility**
   - PostgreSQL: Fixed schema
   - MongoDB: Dynamic schema

5. **Cost Effective**
   - MongoDB TTL tự động xóa dữ liệu cũ
   - Tiết kiệm storage

---

## ⚠️ CHALLENGES & SOLUTIONS

### Challenge 1: Data Consistency
**Problem:** Không có foreign keys giữa 2 databases

**Solution:**
- Application layer validation
- Soft deletes thay vì hard deletes
- Periodic sync jobs

### Challenge 2: Complex Queries
**Problem:** Không thể JOIN giữa 2 databases

**Solution:**
- Denormalization (lưu thông tin cần thiết)
- Application-level joins
- Caching layer (Redis)

### Challenge 3: Transactions
**Problem:** Không có distributed transactions

**Solution:**
- Saga pattern
- Eventual consistency
- Compensating transactions

---

## 🎓 KẾT LUẬN

**Hybrid Database Architecture** là lựa chọn tối ưu cho dự án crowdfunding vì:

✅ **PostgreSQL** đảm bảo tính toàn vẹn cho dữ liệu tài chính  
✅ **MongoDB** tối ưu hiệu năng cho logs, analytics, rich content  
✅ **Tách biệt rõ ràng** giữa critical và non-critical data  
✅ **Scalable** - Dễ dàng mở rộng theo chiều ngang  
✅ **Cost-effective** - TTL tự động quản lý storage  

---

**Tổng số:**
- **PostgreSQL**: 15 tables
- **MongoDB**: 9 collections
- **Total**: 24 data structures

**Tổng dung lượng ước tính:**
- **PostgreSQL**: ~10 GB (production)
- **MongoDB**: ~50 GB (với logs & analytics)
- **Total**: ~60 GB

---

**Cập nhật:** 22/05/2026  
**Version:** 1.0.0
