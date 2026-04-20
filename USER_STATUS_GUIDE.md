# Hướng dẫn User Status System

## Tổng quan

Hệ thống đã được refactor để thay thế `isPro` (boolean) bằng `status` (enum) với 3 trạng thái:

### User Status Enum

```typescript
enum UserStatus {
  NORMAL  // Tài khoản thường
  PRO     // Tài khoản Pro (nâng cao)
  BANNED  // Tài khoản bị cấm
}
```

### User Role Enum (đã loại bỏ CREATOR_PRO)

```typescript
enum UserRole {
  ADMIN           // Quản trị viên
  BACKER          // Người ủng hộ
  CREATOR_PENDING // Creator chờ duyệt
  CREATOR         // Creator đã được duyệt
}
```

## Thay đổi chính

### 1. Database Schema
- ✅ Xóa field `isPro: Boolean`
- ✅ Thêm field `status: UserStatus` (default: NORMAL)
- ✅ Xóa role `CREATOR_PRO` khỏi UserRole enum
- ✅ Migration tự động chuyển đổi dữ liệu cũ:
  - `role = CREATOR_PRO` → `role = CREATOR, status = PRO`
  - `isPro = true` → `status = PRO`

### 2. Admin Features
- ✅ Trang quản lý user: `/dashboard/admin/users`
- ✅ Component `UserStatusToggle` với 3 nút: Thường, Pro, Cấm
- ✅ API endpoint: `POST /api/admin/users/[userId]/update-status`
- ✅ Thống kê số lượng Creator Pro

### 3. User Experience
- ✅ Trang thông báo cho user bị cấm: `/banned`
- ✅ Badge "Pro" hiển thị cho Creator có status = PRO
- ✅ Session tracking status trong JWT token

### 4. Middleware & Helpers
- ✅ `checkUserStatus()` - Kiểm tra và chặn user bị BANNED
- ✅ `canCreateCampaign()` - Kiểm tra quyền tạo campaign
- ✅ `canPledge()` - Kiểm tra quyền pledge

## Cách sử dụng

### Admin quản lý user status

1. Truy cập `/dashboard/admin/users`
2. Tìm user cần thay đổi (chỉ CREATOR)
3. Click vào nút trạng thái mong muốn:
   - **Thường**: Tài khoản Creator bình thường
   - **Pro**: Nâng cấp lên Creator Pro (có badge đặc biệt)
   - **Cấm**: Khóa tài khoản, không cho truy cập

### Kiểm tra status trong code

```typescript
// Trong Server Component
const session = await auth();
const userStatus = (session?.user as any).status;

if (userStatus === "PRO") {
  // Hiển thị tính năng Pro
}

if (userStatus === "BANNED") {
  // Chặn truy cập
  redirect("/banned");
}
```

### API Response

```json
{
  "success": true,
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "role": "CREATOR",
    "status": "PRO"
  },
  "message": "Đã đổi trạng thái User sang Pro"
}
```

## Scripts hữu ích

```bash
# Kiểm tra status của user
npx tsx scripts/check-user-status.ts

# Tìm tất cả Creator thường (không phải Pro)
npx tsx scripts/check-regular-creators.ts
```

## Migration đã chạy

```
20260419151713_change_ispro_to_status
```

Migration này:
1. Tạo enum `UserStatus`
2. Thêm column `status` với default NORMAL
3. Migrate dữ liệu cũ (CREATOR_PRO → CREATOR + PRO)
4. Xóa role CREATOR_PRO khỏi enum
5. Xóa column `isPro`

## Files đã thay đổi

### Schema & Migration
- `prisma/schema.prisma`
- `prisma/migrations/20260419151713_change_ispro_to_status/`

### Components
- `src/components/admin/UserStatusToggle.tsx` (mới)
- `src/app/dashboard/admin/users/page.tsx`

### API Routes
- `src/app/api/admin/users/[userId]/update-status/route.ts` (mới)
- Đã xóa: `toggle-pro/route.ts`

### Pages
- `src/app/banned/page.tsx` (mới)
- `src/app/campaigns/[slug]/page.tsx`
- `src/app/profile/[userId]/page.tsx`
- `src/app/page.tsx`
- `src/app/campaigns/page.tsx`
- `src/app/(marketing)/page.tsx`

### Utilities
- `src/lib/auth.ts` (thêm status vào session)
- `src/middleware/checkUserStatus.ts` (mới)

### Data
- `src/data/seed.ts`

## Lưu ý quan trọng

1. **Backward Compatibility**: Migration tự động chuyển đổi dữ liệu cũ
2. **Session**: Cần logout/login lại để session cập nhật status mới
3. **BANNED Status**: User bị cấm sẽ bị redirect về `/banned` khi truy cập
4. **Pro Badge**: Chỉ hiển thị khi `status === "PRO"`, không còn check role
5. **Admin Only**: Chỉ ADMIN mới có quyền thay đổi status

## Tương lai

Có thể mở rộng thêm status:
- `SUSPENDED` - Tạm ngưng
- `VERIFIED` - Đã xác minh
- `VIP` - Khách hàng VIP
- v.v.
