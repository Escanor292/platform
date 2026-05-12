# 🚀 HUY HIỆU - QUICK START GUIDE

## ✅ ĐÃ HOÀN THÀNH

### 1. Database ✅
- Migration đã chạy thành công
- Tables `badges` và `user_badges` đã được tạo

### 2. Backend API ✅
- 8 API endpoints hoàn chỉnh
- Service, validation, policy layers

### 3. Frontend ✅
- Badge components (BadgePill, UserBadgeList, BadgeModal)
- Admin UI (List, Create, Edit, Assign pages)
- Tích hợp vào Profile, Campaign, Blog

### 4. Admin Navigation ✅
- Link "Huy hiệu" đã được thêm vào admin menu

## 🎯 CÁCH SỬ DỤNG

### Bước 1: Khởi động Server

```bash
# Generate Prisma client (nếu chưa)
npx prisma generate

# Khởi động dev server
npm run dev
```

### Bước 2: Đăng nhập Admin

1. Mở browser: `http://localhost:3000`
2. Đăng nhập với tài khoản admin
3. Vào Admin Panel

### Bước 3: Tạo Badge Đầu Tiên

#### Cách 1: Qua UI (Khuyến nghị)

1. Vào `/dashboard/admin/badges`
2. Click "Tạo huy hiệu"
3. Điền thông tin:
   - **Tên**: Top Donor
   - **Mô tả**: Người ủng hộ xuất sắc nhất
   - **Loại**: Achievement
   - **Độ hiếm**: Legendary
   - **Icon**: 🏆
   - **Màu chữ**: #f59e0b (vàng)
   - **Màu nền**: #fef3c7 (vàng nhạt)
4. Click "Tạo huy hiệu"

#### Cách 2: Seed Script (Tạo nhiều badges)

```bash
# Chạy seed script (cần có admin user)
npx tsx scripts/seed-badges.ts
```

Script sẽ tạo 10 badges mẫu:
- 5 Achievement badges (Top Donor, Early Supporter, etc.)
- 5 Custom badges (Người truyền cảm hứng, etc.)

### Bước 4: Gắn Badge Cho User

1. Trong danh sách badges, click "Gắn huy hiệu"
2. Nhập User ID (lấy từ profile URL hoặc database)
3. Nhập lý do: "Đóng góp tích cực cho cộng đồng"
4. Click "Gắn huy hiệu"

### Bước 5: Xem Badge Trên Profile

1. Vào profile của user: `/profile/{userId}`
2. Badge sẽ hiển thị ngay dưới phần Social Links
3. Click vào badge để xem chi tiết

## 📍 CÁC TRANG QUAN TRỌNG

### Admin Pages
- **Badge List**: `/dashboard/admin/badges`
- **Create Badge**: `/dashboard/admin/badges/create`
- **Edit Badge**: `/dashboard/admin/badges/{id}/edit`
- **Assign Badge**: `/dashboard/admin/badges/{id}/assign`

### Public Pages
- **User Profile**: `/profile/{userId}` - Hiển thị badges
- **Campaign Detail**: `/campaigns/{slug}` - Badges của creator
- **Blog**: `/blog` - Badges của author

## 🎨 BADGE EXAMPLES

### Achievement Badges

```typescript
// Top Donor
{
  name: "Top Donor",
  type: "achievement",
  rarity: "legendary",
  iconName: "🏆",
  color: "#f59e0b",
  backgroundColor: "#fef3c7"
}

// Early Supporter
{
  name: "Early Supporter",
  type: "achievement",
  rarity: "rare",
  iconName: "⭐",
  color: "#3b82f6",
  backgroundColor: "#dbeafe"
}
```

### Custom Badges

```typescript
// Người truyền cảm hứng
{
  name: "Người truyền cảm hứng",
  type: "custom",
  rarity: "rare",
  iconName: "✨",
  color: "#ec4899",
  backgroundColor: "#fce7f3"
}

// Verified Creator
{
  name: "Verified Creator",
  type: "custom",
  rarity: "common",
  iconName: "✓",
  color: "#059669",
  backgroundColor: "#d1fae5"
}
```

## 🔍 KIỂM TRA BADGES

### Qua UI
1. Vào `/dashboard/admin/badges`
2. Xem danh sách badges đã tạo
3. Click vào badge để xem chi tiết

### Qua API
```bash
# Get all badges
curl http://localhost:3000/api/badges

# Get user badges
curl http://localhost:3000/api/users/{userId}/badges

# Get my badges (cần auth)
curl http://localhost:3000/api/me/badges
```

### Qua Database
```sql
-- Xem tất cả badges
SELECT * FROM badges;

-- Xem user badges
SELECT ub.*, b.name, u.name as user_name
FROM user_badges ub
JOIN badges b ON ub.badge_id = b.id
JOIN users u ON ub.user_id = u.id
WHERE ub.revoked_at IS NULL;
```

## 🎯 USE CASES

### 1. Ghi nhận Top Donor
```
1. Tạo badge "Top Donor" (achievement, legendary)
2. Gắn cho user có tổng donation cao nhất
3. Badge hiển thị trên profile và campaign
```

### 2. Vinh danh Early Supporter
```
1. Tạo badge "Early Supporter" (achievement, rare)
2. Gắn cho users ủng hộ trong 24h đầu
3. Có thể set expires_at nếu cần
```

### 3. Verified Creator
```
1. Tạo badge "Verified Creator" (custom, common)
2. Gắn cho creators đã xác minh KYC
3. Badge hiển thị tin cậy
```

### 4. Community Partner
```
1. Tạo badge "Đối tác cộng đồng" (custom, epic)
2. Gắn cho đối tác chiến lược
3. Thể hiện mối quan hệ đặc biệt
```

## 🐛 TROUBLESHOOTING

### Issue: Không thấy badges trên profile
**Giải pháp:**
1. Kiểm tra badge đã được gắn: `/dashboard/admin/users/{userId}/badges`
2. Kiểm tra badge `isActive = true`
3. Kiểm tra `revokedAt = null`
4. Clear cache và reload page

### Issue: Không thể tạo badge
**Giải pháp:**
1. Kiểm tra đã login với admin account
2. Kiểm tra `isAdmin = true` trong database
3. Xem console log để biết lỗi cụ thể

### Issue: Badge không hiển thị đúng màu
**Giải pháp:**
1. Kiểm tra hex color format (#RRGGBB)
2. Thử với màu mặc định theo rarity
3. Clear browser cache

### Issue: Seed script báo "No admin user"
**Giải pháp:**
```sql
-- Tạo admin user hoặc update user hiện tại
UPDATE users 
SET "isAdmin" = true, role = 'ADMIN'
WHERE email = 'your-email@example.com';
```

## 📊 STATISTICS

### Xem thống kê badges
```sql
-- Top badges được gắn nhiều nhất
SELECT b.name, COUNT(ub.id) as user_count
FROM badges b
LEFT JOIN user_badges ub ON b.id = ub.badge_id 
  AND ub.revoked_at IS NULL
GROUP BY b.id, b.name
ORDER BY user_count DESC;

-- Users có nhiều badges nhất
SELECT u.name, u.email, COUNT(ub.id) as badge_count
FROM users u
JOIN user_badges ub ON u.id = ub.user_id
WHERE ub.revoked_at IS NULL
GROUP BY u.id, u.name, u.email
ORDER BY badge_count DESC
LIMIT 10;
```

## 🎉 HOÀN TẤT!

Hệ thống huy hiệu đã sẵn sàng sử dụng!

**Checklist:**
- ✅ Database migration
- ✅ Backend API
- ✅ Frontend components
- ✅ Admin UI
- ✅ Tích hợp vào Profile
- ✅ Tích hợp vào Campaign
- ✅ Tích hợp vào Blog
- ✅ Admin navigation

**Next Steps:**
1. Tạo badges đầu tiên
2. Gắn badges cho users
3. Test hiển thị trên các trang
4. Thu thập feedback
5. Tối ưu hóa

**Enjoy! 🎊**
