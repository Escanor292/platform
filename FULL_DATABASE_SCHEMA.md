# 📊 FULL DATABASE SCHEMA - HYBRID ARCHITECTURE

## 🎯 TÓM TẮT

**Dự án sử dụng Hybrid Database:**
- **PostgreSQL**: 15 tables (Prisma ORM)
- **MongoDB**: 9 collections (Native Driver)
- **Total**: 24 data structures

---

## 📁 FILES ĐÃ TẠO

### 1. **DATABASE_SCHEMA_DBML.txt** ✅
**Nội dung:** PostgreSQL (15 tables) + MongoDB (9 collections)
**Dùng cho:** Tạo sơ đồ tổng hợp trên dbdiagram.io

### 2. **MONGODB_SCHEMA_DBML.txt** ✅
**Nội dung:** Chỉ MongoDB (9 collections) với chi tiết đầy đủ
**Dùng cho:** Tạo sơ đồ riêng MongoDB

---

## 🗄️ POSTGRESQL (15 TABLES)

| # | Table | Records | Purpose |
|---|-------|---------|---------|
| 1 | users | 10,000+ | Người dùng |
| 2 | campaigns | 1,000+ | Chiến dịch |
| 3 | pledges | 50,000+ | Ủng hộ/Giao dịch |
| 4 | rewards | 5,000+ | Phần thưởng |
| 5 | campaign_updates | 10,000+ | Cập nhật cơ bản |
| 6 | reviews | 20,000+ | Đánh giá |
| 7 | campaign_reports | 500+ | Báo cáo |
| 8 | campaign_followers | 30,000+ | Theo dõi |
| 9 | kyc_info | 5,000+ | KYC |
| 10 | backer_invoices | 50,000+ | Hóa đơn backer |
| 11 | platform_invoices | 1,000+ | Hóa đơn platform |
| 12 | audit_logs | 100,000+ | Audit logs |
| 13 | blacklist | 100+ | Danh sách đen |
| 14 | transaction_limits | 100+ | Giới hạn GD |
| 15 | daily_tip_invoices | 365+ | Hóa đơn tip |

**Đặc điểm:**
- ✅ ACID Compliance
- ✅ Foreign Keys
- ✅ Transactions
- ✅ Complex Queries

---

## 🍃 MONGODB (9 COLLECTIONS)

| # | Collection | Records | TTL | Purpose |
|---|------------|---------|-----|---------|
| 1 | campaign_updates | 20,000+ | ∞ | Rich content updates |
| 2 | comments | 100,000+ | ∞ | Nested comments |
| 3 | notifications | 500,000+ | 90d | User notifications |
| 4 | activity_logs | 1M+ | 90d | Activity tracking |
| 5 | audit_logs | 200,000+ | 365d | Audit logs (parallel) |
| 6 | analytics_events | 5M+ | 180d | Analytics |
| 7 | campaign_content | 1,000+ | ∞ | Rich campaign content |
| 8 | user_metadata | 10,000+ | ∞ | User preferences |
| 9 | report_metadata | 500+ | ∞ | Report evidence |

**Đặc điểm:**
- ✅ Flexible Schema
- ✅ High Write Speed
- ✅ TTL Auto-delete
- ✅ Aggregation Pipeline

---

## 🔗 RELATIONSHIPS

### PostgreSQL Internal:
```
users (1) ──► (n) campaigns
campaigns (1) ──► (n) pledges
campaigns (1) ──► (n) rewards
pledges (n) ──► (1) rewards
users (1) ──► (n) pledges
users (1) ──► (1) kyc_info
pledges (1) ──► (1) backer_invoices
```

### PostgreSQL → MongoDB:
```
users.id ──────► mongo_notifications.userId
users.id ──────► mongo_user_metadata.userId
users.id ──────► mongo_comments.userId
campaigns.id ───► mongo_campaign_updates.campaignId
campaigns.id ───► mongo_campaign_content.campaignId
campaigns.id ───► mongo_comments.campaignId
```

---

## 🎨 CÁCH TẠO SƠ ĐỒ

### **Phương pháp 1: Sơ đồ tổng hợp (PostgreSQL + MongoDB)**

1. Mở https://dbdiagram.io/
2. Copy nội dung file **`DATABASE_SCHEMA_DBML.txt`**
3. Paste vào editor
4. Export PNG/PDF

**Kết quả:** Sơ đồ có cả 2 databases (24 tables/collections)

---

### **Phương pháp 2: Sơ đồ riêng MongoDB**

1. Mở https://dbdiagram.io/
2. Copy nội dung file **`MONGODB_SCHEMA_DBML.txt`**
3. Paste vào editor
4. Export PNG/PDF

**Kết quả:** Sơ đồ chỉ có MongoDB (9 collections)

---

### **Phương pháp 3: Sơ đồ riêng PostgreSQL**

1. Mở https://dbdiagram.io/
2. Copy phần PostgreSQL từ **`DATABASE_SCHEMA_DBML.txt`**
3. Paste vào editor
4. Export PNG/PDF

**Kết quả:** Sơ đồ chỉ có PostgreSQL (15 tables)

---

## 📊 CÁC SƠ ĐỒ NÊN TẠO

### 1. **ERD PostgreSQL** (Bắt buộc)
- Hiển thị 15 tables
- Relationships rõ ràng
- Primary Keys & Foreign Keys

### 2. **MongoDB Collections** (Bắt buộc)
- Hiển thị 9 collections
- Document structure
- Indexes

### 3. **Hybrid Architecture** (Bắt buộc)
- Hiển thị cả 2 databases
- Mối quan hệ giữa PostgreSQL ↔ MongoDB
- Data flow

### 4. **Data Flow Diagram** (Khuyên dùng)
- User actions
- Database operations
- Integration points

---

## 🎯 CHECKLIST

**Files:**
- [x] DATABASE_SCHEMA_DBML.txt (PostgreSQL + MongoDB)
- [x] MONGODB_SCHEMA_DBML.txt (MongoDB only)
- [x] FULL_DATABASE_SCHEMA.md (This file)

**Diagrams to create:**
- [ ] ERD PostgreSQL (15 tables)
- [ ] MongoDB Collections (9 collections)
- [ ] Hybrid Architecture diagram
- [ ] Data Flow diagram

**Export formats:**
- [ ] PNG (1920x1080) - Cho slide
- [ ] PDF - Cho báo cáo
- [ ] SVG - Chất lượng cao

---

## 💡 TIPS

### Màu sắc đề xuất:
- **PostgreSQL tables**: Xanh dương (#3B82F6)
- **MongoDB collections**: Xanh lá (#10B981)
- **Relationships**: Xám (#6B7280)

### Layout:
- PostgreSQL ở bên trái
- MongoDB ở bên phải
- Relationships ngang giữa

### Font:
- Tiêu đề: Arial Bold 14pt
- Nội dung: Arial Regular 10pt

---

## 🚀 QUICK START

**Tạo sơ đồ trong 5 phút:**

1. Mở https://dbdiagram.io/
2. Copy file `DATABASE_SCHEMA_DBML.txt`
3. Paste vào editor
4. Click Export → PNG
5. Done! ✅

---

**Cập nhật:** 22/05/2026  
**Version:** 1.0.0  
**Status:** ✅ Complete
