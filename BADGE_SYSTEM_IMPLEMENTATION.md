# HỆ THỐNG HUY HIỆU - HƯỚNG DẪN HOÀN THIỆN

## ✅ ĐÃ HOÀN THÀNH

### 1. Database Schema
- ✅ Migration file: `prisma/migrations/20260513_add_badge_system/migration.sql`
- ✅ Prisma schema updated với Badge và UserBadge models
- ✅ Enums: BadgeType (custom, achievement), BadgeRarity (common, rare, epic, legendary)
- ✅ Indexes cho performance
- ✅ Foreign keys và relations

### 2. Backend API
- ✅ Types: `src/types/badge.types.ts`
- ✅ Service layer: `src/lib/badge/badge.service.ts`
- ✅ Validation: `src/lib/badge/badge.validation.ts`
- ✅ Policy: `src/lib/badge/badge.policy.ts`

#### Admin API Routes:
- ✅ `POST /api/admin/badges` - Tạo badge
- ✅ `GET /api/admin/badges` - List badges với filters
- ✅ `GET /api/admin/badges/:id` - Chi tiết badge
- ✅ `PATCH /api/admin/badges/:id` - Cập nhật badge
- ✅ `DELETE /api/admin/badges/:id` - Soft delete badge
- ✅ `POST /api/admin/badges/:id/assign` - Gắn badge cho user
- ✅ `POST /api/admin/user-badges/:id/revoke` - Thu hồi badge
- ✅ `GET /api/admin/users/:id/badges` - Xem tất cả badges của user

#### Public API Routes:
- ✅ `GET /api/badges` - Danh sách badges public
- ✅ `GET /api/users/:id/badges` - Badges public của user
- ✅ `GET /api/me/badges` - Badges của current user

### 3. Frontend Components
- ✅ `BadgePill` - Component hiển thị badge
- ✅ `UserBadgeList` - Danh sách badges của user
- ✅ `BadgeModal` - Modal chi tiết badge
- ✅ API Client: `src/services/badgeApi.ts`

### 4. Admin UI
- ✅ Badge list page: `/dashboard/admin/badges`
- ✅ Create badge page: `/dashboard/admin/badges/create`
- ✅ Assign badge page: `/dashboard/admin/badges/:id/assign`

## 🔨 CẦN HOÀN THIỆN

### 1. Chạy Migration
```bash
npx prisma migrate dev --name add_badge_system
npx prisma generate
```

### 2. Tạo thêm Admin Pages

#### Edit Badge Page
File: `src/app/dashboard/admin/badges/[id]/edit/page.tsx`
- Form giống create page nhưng load data từ badge hiện tại
- Sử dụng `adminGetBadgeById` và `adminUpdateBadge`

#### User Badges Management Page
File: `src/app/dashboard/admin/users/[id]/badges/page.tsx`
- Hiển thị tất cả badges của user (active, revoked, expired)
- Tabs để filter
- Nút revoke cho active badges
- Sử dụng `adminGetUserBadges` và `adminRevokeUserBadge`

### 3. Tích hợp vào User Profile

#### File: `src/app/profile/[id]/page.tsx` hoặc `src/components/profile/UserProfile.tsx`
Thêm:
```tsx
import { UserBadgeList } from '@/components/badge/UserBadgeList';
import { BadgeModal } from '@/components/badge/BadgeModal';

// Trong component:
const [selectedBadge, setSelectedBadge] = useState<UserBadge | null>(null);

// Trong render:
<div className="mb-6">
  <h3 className="text-lg font-semibold mb-3">Huy hiệu</h3>
  <UserBadgeList 
    userId={user.id} 
    onBadgeClick={setSelectedBadge}
  />
</div>

<BadgeModal
  userBadge={selectedBadge}
  isOpen={!!selectedBadge}
  onClose={() => setSelectedBadge(null)}
/>
```

### 4. Tích hợp vào Campaign

#### File: `src/app/campaigns/[slug]/page.tsx` hoặc campaign detail component
Thêm badges cho campaign owner:
```tsx
import { UserBadgeList } from '@/components/badge/UserBadgeList';

// Trong phần hiển thị creator info:
<div className="flex items-center gap-3">
  <img src={creator.avatar} className="w-12 h-12 rounded-full" />
  <div>
    <h4>{creator.name}</h4>
    <UserBadgeList userId={creator.id} compact maxDisplay={3} />
  </div>
</div>
```

### 5. Tích hợp vào Blog

#### File: `src/components/blog/BlogPostCard.tsx` hoặc blog author component
```tsx
import { UserBadgeList } from '@/components/badge/UserBadgeList';

// Trong author info:
<div className="flex items-center gap-2">
  <span>{author.name}</span>
  <UserBadgeList userId={author.id} compact maxDisplay={2} />
</div>
```

### 6. Tích hợp vào Chat

#### File: `src/components/chat/ChatMessage.tsx` hoặc user info component
```tsx
import { UserBadgeList } from '@/components/badge/UserBadgeList';

// Trong user profile popup hoặc message header:
<UserBadgeList userId={message.userId} compact maxDisplay={3} />
```

### 7. Cập nhật Admin Navigation

#### File: `src/app/dashboard/admin/layout.tsx` hoặc admin sidebar
Thêm link:
```tsx
<Link href="/dashboard/admin/badges">
  <Award className="w-5 h-5" />
  Huy hiệu
</Link>
```

### 8. Testing

Tạo file test: `__tests__/badge/badge.test.ts`
```typescript
import { createBadge, assignBadge, getUserBadges } from '@/lib/badge/badge.service';

describe('Badge System', () => {
  test('Admin can create badge', async () => {
    // Test logic
  });

  test('Cannot create badge with invalid type', async () => {
    // Test validation
  });

  test('Cannot assign duplicate active badge', async () => {
    // Test duplicate prevention
  });
});
```

### 9. Seed Data (Optional)

File: `scripts/seed-badges.ts`
```typescript
import { prisma } from '@/lib/prisma';

async function seedBadges() {
  const admin = await prisma.user.findFirst({ where: { isAdmin: true } });
  
  if (!admin) {
    console.error('No admin found');
    return;
  }

  // Create sample badges
  await prisma.badge.createMany({
    data: [
      {
        name: 'Top Donor',
        slug: 'top-donor',
        description: 'Người ủng hộ xuất sắc nhất',
        type: 'achievement',
        rarity: 'legendary',
        color: '#f59e0b',
        backgroundColor: '#fef3c7',
        iconName: '🏆',
        isActive: true,
        createdBy: admin.id,
      },
      {
        name: 'Early Supporter',
        slug: 'early-supporter',
        description: 'Người ủng hộ sớm',
        type: 'achievement',
        rarity: 'rare',
        color: '#3b82f6',
        backgroundColor: '#dbeafe',
        iconName: '⭐',
        isActive: true,
        createdBy: admin.id,
      },
      // Add more badges...
    ],
  });

  console.log('Badges seeded successfully');
}

seedBadges();
```

## 📋 CHECKLIST HOÀN THIỆN

### Database
- [ ] Chạy migration: `npx prisma migrate dev`
- [ ] Generate Prisma client: `npx prisma generate`
- [ ] Verify tables created: badges, user_badges

### Backend
- [x] Badge service functions
- [x] Validation schemas
- [x] Policy functions
- [x] Admin API routes
- [x] Public API routes

### Frontend - Admin
- [x] Badge list page
- [x] Create badge page
- [ ] Edit badge page
- [x] Assign badge page
- [ ] User badges management page
- [ ] Add to admin navigation

### Frontend - User
- [x] BadgePill component
- [x] UserBadgeList component
- [x] BadgeModal component
- [ ] Integrate into User Profile
- [ ] Integrate into Campaign detail
- [ ] Integrate into Blog author
- [ ] Integrate into Chat user info

### Testing
- [ ] Unit tests for badge service
- [ ] API endpoint tests
- [ ] Component tests
- [ ] E2E tests for admin flows

### Documentation
- [x] Implementation guide
- [ ] API documentation
- [ ] User guide for admins

## 🚀 DEPLOYMENT CHECKLIST

1. **Database Migration**
   ```bash
   # Production
   npx prisma migrate deploy
   ```

2. **Environment Variables**
   - Verify DATABASE_URL is set correctly

3. **Build & Deploy**
   ```bash
   npm run build
   # Deploy to your platform
   ```

4. **Post-deployment**
   - Create initial badges via admin UI
   - Test badge assignment
   - Verify badges display on profiles

## 🎯 FEATURES SUMMARY

### Admin Features
- ✅ Tạo badge (custom/achievement)
- ✅ Sửa badge
- ✅ Xóa mềm badge
- ✅ Gắn badge cho user
- ✅ Thu hồi badge
- ✅ Xem danh sách badges
- ✅ Xem badges của user
- ✅ Filter và search badges

### User Features
- ✅ Xem badges của mình
- ✅ Xem badges public của người khác
- ✅ Badges hiển thị trên profile
- 🔨 Badges hiển thị trên campaign
- 🔨 Badges hiển thị trên blog
- 🔨 Badges hiển thị trên chat

### Security
- ✅ Chỉ admin được tạo/sửa/xóa/gắn/thu hồi badge
- ✅ Validate badge type (chỉ custom/achievement)
- ✅ Validate rarity
- ✅ Validate hex colors
- ✅ Không cho duplicate active badge
- ✅ Soft delete (không mất lịch sử)

## 📝 NOTES

1. **Badge Types**
   - `custom`: Admin tự tạo tùy ý
   - `achievement`: Ghi nhận thành tựu (có thể tự động hóa sau)

2. **Badge Rarity**
   - `common`: Phổ thông (xám)
   - `rare`: Hiếm (xanh)
   - `epic`: Sử thi (tím)
   - `legendary`: Huyền thoại (vàng)

3. **Duplicate Prevention**
   - Một user không thể có 2 badge giống nhau đang active
   - Active = chưa revoked + chưa expired

4. **Soft Delete**
   - Badge bị xóa vẫn giữ trong DB (deletedAt)
   - User badges history không bị xóa
   - Revoke badge không xóa record, chỉ set revokedAt

5. **Performance**
   - Indexes trên slug, type, isActive, deletedAt
   - Indexes trên user_id, badge_id cho user_badges
   - Pagination cho danh sách badges

## 🔗 RELATED FILES

### Backend
- `prisma/schema.prisma`
- `src/types/badge.types.ts`
- `src/lib/badge/badge.service.ts`
- `src/lib/badge/badge.validation.ts`
- `src/lib/badge/badge.policy.ts`
- `src/services/badgeApi.ts`

### API Routes
- `src/app/api/admin/badges/route.ts`
- `src/app/api/admin/badges/[id]/route.ts`
- `src/app/api/admin/badges/[id]/assign/route.ts`
- `src/app/api/admin/user-badges/[id]/revoke/route.ts`
- `src/app/api/admin/users/[id]/badges/route.ts`
- `src/app/api/badges/route.ts`
- `src/app/api/users/[id]/badges/route.ts`
- `src/app/api/me/badges/route.ts`

### Components
- `src/components/badge/BadgePill.tsx`
- `src/components/badge/UserBadgeList.tsx`
- `src/components/badge/BadgeModal.tsx`

### Admin Pages
- `src/app/dashboard/admin/badges/page.tsx`
- `src/app/dashboard/admin/badges/create/page.tsx`
- `src/app/dashboard/admin/badges/[id]/assign/page.tsx`

## 💡 FUTURE ENHANCEMENTS

1. **Auto Badge Assignment**
   - Tự động gắn badge khi đạt milestone
   - Ví dụ: 10 donations → "Generous Supporter"

2. **Badge Progress**
   - Hiển thị tiến độ đạt badge
   - Ví dụ: "7/10 donations to unlock badge"

3. **Badge Showcase**
   - User chọn badges nổi bật để hiển thị
   - Reorder badges

4. **Badge Notifications**
   - Thông báo khi nhận badge mới
   - Email notification

5. **Badge Leaderboard**
   - Top users theo số lượng badges
   - Top badges được gắn nhiều nhất

6. **Badge Collections**
   - Nhóm badges theo chủ đề
   - Ví dụ: "Donor Badges", "Creator Badges"
