# 🎖️ HỆ THỐNG HUY HIỆU - CROWDFUNDING PLATFORM

## 📋 MỤC LỤC
1. [Tổng quan](#tổng-quan)
2. [Cài đặt](#cài-đặt)
3. [Cấu trúc](#cấu-trúc)
4. [API Documentation](#api-documentation)
5. [Sử dụng](#sử-dụng)
6. [Tích hợp](#tích-hợp)
7. [Testing](#testing)

---

## 🎯 TỔNG QUAN

Hệ thống huy hiệu cho phép admin tạo và gắn huy hiệu cho thành viên để:
- Ghi nhận thành tích (Achievement Badges)
- Vinh danh đóng góp (Custom Badges)
- Tăng tính tương tác và gamification

### Loại Huy hiệu

#### 1. Custom Badge
- Admin tự tạo tùy ý
- Ví dụ: "Người truyền cảm hứng", "Đối tác cộng đồng"
- Gắn thủ công bởi admin

#### 2. Achievement Badge
- Ghi nhận thành tựu
- Ví dụ: "Top Donor", "100 Donations"
- Hiện tại gắn thủ công, có thể tự động hóa sau

### Độ hiếm (Rarity)
- **Common** (Phổ thông): Xám
- **Rare** (Hiếm): Xanh
- **Epic** (Sử thi): Tím
- **Legendary** (Huyền thoại): Vàng

---

## 🚀 CÀI ĐẶT

### 1. Database Migration
```bash
# Chạy migration
npx prisma migrate dev --name add_badge_system

# Generate Prisma client
npx prisma generate
```

### 2. Seed Badges (Optional)
```bash
# Tạo badges mẫu
npx tsx scripts/seed-badges.ts
```

### 3. Restart Server
```bash
npm run dev
```

---

## 📁 CẤU TRÚC

### Database Schema
```
badges/
├── id (UUID)
├── name (VARCHAR 100)
├── slug (VARCHAR 120, unique)
├── description (TEXT)
├── icon_url (TEXT)
├── icon_name (VARCHAR 100)
├── color (VARCHAR 30)
├── background_color (VARCHAR 30)
├── type (ENUM: custom, achievement)
├── rarity (ENUM: common, rare, epic, legendary)
├── is_active (BOOLEAN)
├── created_by (UUID → users)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── deleted_at (TIMESTAMP)

user_badges/
├── id (UUID)
├── user_id (UUID → users)
├── badge_id (UUID → badges)
├── assigned_by (UUID → users)
├── reason (TEXT)
├── note (TEXT)
├── assigned_at (TIMESTAMP)
├── expires_at (TIMESTAMP)
├── revoked_at (TIMESTAMP)
├── revoked_by (UUID → users)
├── revoke_reason (TEXT)
└── is_visible (BOOLEAN)
```

### Backend Files
```
src/
├── types/
│   └── badge.types.ts              # TypeScript types
├── lib/
│   └── badge/
│       ├── badge.service.ts        # Business logic
│       ├── badge.validation.ts     # Zod schemas
│       └── badge.policy.ts         # Permission checks
├── services/
│   └── badgeApi.ts                 # API client
└── app/
    └── api/
        ├── admin/
        │   ├── badges/
        │   │   ├── route.ts        # List & Create
        │   │   └── [id]/
        │   │       ├── route.ts    # Get, Update, Delete
        │   │       └── assign/
        │   │           └── route.ts # Assign badge
        │   └── user-badges/
        │       └── [id]/
        │           └── revoke/
        │               └── route.ts # Revoke badge
        ├── badges/
        │   └── route.ts            # Public list
        ├── users/
        │   └── [id]/
        │       └── badges/
        │           └── route.ts    # User badges
        └── me/
            └── badges/
                └── route.ts        # My badges
```

### Frontend Files
```
src/
├── components/
│   └── badge/
│       ├── BadgePill.tsx           # Badge display
│       ├── UserBadgeList.tsx       # Badge list
│       └── BadgeModal.tsx          # Badge detail modal
└── app/
    └── dashboard/
        └── admin/
            └── badges/
                ├── page.tsx        # List page
                ├── create/
                │   └── page.tsx    # Create page
                └── [id]/
                    ├── edit/
                    │   └── page.tsx # Edit page
                    └── assign/
                        └── page.tsx # Assign page
```

---

## 📡 API DOCUMENTATION

### Admin Endpoints

#### 1. List Badges
```http
GET /api/admin/badges?page=1&limit=20&search=top&type=achievement&isActive=true
```

**Response:**
```json
{
  "badges": [
    {
      "id": "badge_id",
      "name": "Top Donor",
      "slug": "top-donor",
      "description": "Người ủng hộ xuất sắc",
      "type": "achievement",
      "rarity": "legendary",
      "isActive": true,
      "userCount": 5,
      ...
    }
  ],
  "total": 10
}
```

#### 2. Create Badge
```http
POST /api/admin/badges
Content-Type: application/json

{
  "name": "Top Donor",
  "description": "Người ủng hộ xuất sắc",
  "type": "achievement",
  "rarity": "legendary",
  "iconName": "🏆",
  "color": "#f59e0b",
  "backgroundColor": "#fef3c7",
  "isActive": true
}
```

#### 3. Get Badge
```http
GET /api/admin/badges/:id
```

#### 4. Update Badge
```http
PATCH /api/admin/badges/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "isActive": false
}
```

#### 5. Delete Badge (Soft)
```http
DELETE /api/admin/badges/:id
```

#### 6. Assign Badge
```http
POST /api/admin/badges/:badgeId/assign
Content-Type: application/json

{
  "userId": "user_id",
  "reason": "Đóng góp tích cực",
  "note": "Admin note",
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

#### 7. Revoke Badge
```http
POST /api/admin/user-badges/:userBadgeId/revoke
Content-Type: application/json

{
  "reason": "Không còn đủ điều kiện"
}
```

#### 8. Get User Badges (Admin)
```http
GET /api/admin/users/:userId/badges
```

### Public Endpoints

#### 1. List Public Badges
```http
GET /api/badges
```

#### 2. Get User Badges
```http
GET /api/users/:userId/badges
```

#### 3. Get My Badges
```http
GET /api/me/badges
```

---

## 💻 SỬ DỤNG

### Admin: Tạo Badge

```typescript
import { adminCreateBadge } from '@/services/badgeApi';

const badge = await adminCreateBadge({
  name: 'Top Donor',
  description: 'Người ủng hộ xuất sắc',
  type: 'achievement',
  rarity: 'legendary',
  iconName: '🏆',
  color: '#f59e0b',
  backgroundColor: '#fef3c7',
  isActive: true,
});
```

### Admin: Gắn Badge

```typescript
import { adminAssignBadge } from '@/services/badgeApi';

const userBadge = await adminAssignBadge('badge_id', {
  userId: 'user_id',
  reason: 'Đóng góp tích cực cho cộng đồng',
  note: 'Gắn thủ công bởi admin',
});
```

### User: Hiển thị Badges

```tsx
import { UserBadgeList } from '@/components/badge/UserBadgeList';

<UserBadgeList 
  userId={user.id}
  maxDisplay={5}
  compact={false}
  onBadgeClick={(badge) => console.log(badge)}
/>
```

---

## 🔗 TÍCH HỢP

### 1. User Profile

```tsx
// src/app/profile/[id]/page.tsx
import { UserBadgeList } from '@/components/badge/UserBadgeList';
import { BadgeModal } from '@/components/badge/BadgeModal';

export default function UserProfile({ params }) {
  const [selectedBadge, setSelectedBadge] = useState(null);

  return (
    <div>
      <h2>Huy hiệu</h2>
      <UserBadgeList 
        userId={params.id}
        onBadgeClick={setSelectedBadge}
      />
      
      <BadgeModal
        userBadge={selectedBadge}
        isOpen={!!selectedBadge}
        onClose={() => setSelectedBadge(null)}
      />
    </div>
  );
}
```

### 2. Campaign Owner

```tsx
// src/app/campaigns/[slug]/page.tsx
import { UserBadgeList } from '@/components/badge/UserBadgeList';

<div className="creator-info">
  <img src={creator.avatar} />
  <div>
    <h4>{creator.name}</h4>
    <UserBadgeList userId={creator.id} compact maxDisplay={3} />
  </div>
</div>
```

### 3. Blog Author

```tsx
// src/components/blog/BlogPostCard.tsx
import { UserBadgeList } from '@/components/badge/UserBadgeList';

<div className="author">
  <span>Bởi {author.name}</span>
  <UserBadgeList userId={author.id} compact maxDisplay={2} />
</div>
```

### 4. Chat User

```tsx
// src/components/chat/ChatMessage.tsx
import { UserBadgeList } from '@/components/badge/UserBadgeList';

<div className="user-info">
  <h4>{user.name}</h4>
  <UserBadgeList userId={user.id} compact maxDisplay={3} />
</div>
```

### 5. Admin Navigation

```tsx
// src/app/dashboard/admin/layout.tsx
import { Award } from 'lucide-react';

<Link href="/dashboard/admin/badges">
  <Award className="w-5 h-5" />
  Huy hiệu
</Link>
```

---

## 🧪 TESTING

### Unit Tests

```typescript
// __tests__/badge/badge.service.test.ts
import { createBadge, assignBadge } from '@/lib/badge/badge.service';

describe('Badge Service', () => {
  test('should create badge', async () => {
    const badge = await createBadge(adminId, {
      name: 'Test Badge',
      type: 'custom',
      rarity: 'common',
    });
    expect(badge.name).toBe('Test Badge');
  });

  test('should not allow invalid type', async () => {
    await expect(
      createBadge(adminId, {
        name: 'Test',
        type: 'invalid' as any,
      })
    ).rejects.toThrow('Invalid badge type');
  });

  test('should not allow duplicate active badge', async () => {
    await assignBadge(adminId, badgeId, { userId });
    await expect(
      assignBadge(adminId, badgeId, { userId })
    ).rejects.toThrow('User already has this active badge');
  });
});
```

### API Tests

```typescript
// __tests__/api/badges.test.ts
import { POST, GET } from '@/app/api/admin/badges/route';

describe('Badge API', () => {
  test('POST /api/admin/badges - should create badge', async () => {
    const request = new Request('http://localhost/api/admin/badges', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Badge',
        type: 'custom',
      }),
    });
    
    const response = await POST(request);
    expect(response.status).toBe(201);
  });
});
```

---

## 🔒 SECURITY

### Permissions
- ✅ Chỉ admin được tạo/sửa/xóa/gắn/thu hồi badge
- ✅ Validation nghiêm ngặt cho badge type
- ✅ Không cho duplicate active badge
- ✅ Soft delete - giữ lịch sử

### Validation
- ✅ Badge type: chỉ "custom" hoặc "achievement"
- ✅ Badge rarity: common, rare, epic, legendary
- ✅ Hex color format
- ✅ UUID validation
- ✅ Max length cho text fields

---

## 📊 DATABASE QUERIES

### Get Active Badges for User
```sql
SELECT b.*, ub.assigned_at, ub.reason
FROM user_badges ub
JOIN badges b ON ub.badge_id = b.id
WHERE ub.user_id = $1
  AND ub.revoked_at IS NULL
  AND ub.is_visible = true
  AND b.is_active = true
  AND b.deleted_at IS NULL
  AND (ub.expires_at IS NULL OR ub.expires_at > NOW())
ORDER BY ub.assigned_at DESC;
```

### Get Badge Stats
```sql
SELECT 
  b.*,
  COUNT(ub.id) FILTER (WHERE ub.revoked_at IS NULL) as active_users
FROM badges b
LEFT JOIN user_badges ub ON b.id = ub.badge_id
WHERE b.deleted_at IS NULL
GROUP BY b.id
ORDER BY active_users DESC;
```

---

## 🎨 CUSTOMIZATION

### Custom Badge Colors

```typescript
// Override default rarity colors
const customBadge = {
  name: 'VIP Member',
  type: 'custom',
  rarity: 'legendary',
  color: '#dc2626',           // Custom red
  backgroundColor: '#fee2e2', // Custom light red
};
```

### Custom Icons

```typescript
// Use emoji
iconName: '🏆'

// Use URL
iconUrl: 'https://example.com/trophy.png'

// Use text
iconName: 'VIP'
```

---

## 🐛 TROUBLESHOOTING

### Issue: Badge không hiển thị
**Kiểm tra:**
- `isActive = true`
- `deletedAt = null`
- `revokedAt = null`
- `expiresAt` chưa quá hạn
- `isVisible = true`

### Issue: Không thể gắn badge
**Kiểm tra:**
- User tồn tại
- Badge active
- Chưa có duplicate active badge
- Admin có quyền

### Issue: Prisma generate lỗi
**Giải pháp:**
```bash
# Xóa node_modules/.prisma
rm -rf node_modules/.prisma

# Generate lại
npx prisma generate
```

---

## 📚 RESOURCES

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Zod Validation](https://zod.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

## 📝 CHANGELOG

### v1.0.0 (2026-05-13)
- ✅ Initial release
- ✅ Badge CRUD operations
- ✅ Assign/Revoke badges
- ✅ Admin UI
- ✅ Public API
- ✅ Badge components

---

## 🤝 CONTRIBUTING

Để đóng góp:
1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

---

## 📄 LICENSE

MIT License - See LICENSE file for details

---

## 👥 AUTHORS

- Development Team
- Crowdfunding Platform

---

**🎉 Hệ thống huy hiệu đã sẵn sàng sử dụng!**
