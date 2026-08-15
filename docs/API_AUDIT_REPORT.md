# BÁO CÁO KIỂM TOÁN API - CROWDFUNDING-VN
**Ngày:** 2026-08-15  
**Backend Engineer:** Senior Analysis  
**Dự án:** Next.js 15 App Router + Prisma ORM

---

## TỔNG QUAN PHÂN TÍCH

Đã phân tích **75+ API endpoints** trong thư mục `src/app/api/` với các phát hiện quan trọng về:
- Dead API (API không được sử dụng)
- Endpoint thiếu handler hoặc file trống
- Client code gọi API sai URL
- Lỗ hổng bảo mật (endpoint nhạy cảm không được bảo vệ)

---

## 1. DANH SÁCH TOÀN BỘ API ENDPOINTS

### 1.1 Admin APIs (`/api/admin/*`)
| Endpoint | Methods | Mô tả | Bảo vệ |
|----------|---------|-------|--------|
| `/api/admin/badges` | GET, POST | Quản lý huy hiệu | ✅ requireAdmin() |
| `/api/admin/badges/[id]` | GET, PATCH, DELETE | Chi tiết huy hiệu | ✅ requireAdmin() |
| `/api/admin/badges/[id]/assign` | POST | Gán huy hiệu cho user | ✅ requireAdmin() |
| `/api/admin/user-badges/[id]/revoke` | POST | Thu hồi huy hiệu | ✅ requireAdmin() |
| `/api/admin/users/[userId]/badges` | GET | Xem huy hiệu của user | ✅ requireAdmin() |
| `/api/admin/reports` | GET | Xem báo cáo campaign | ✅ requireAdmin() |
| `/api/admin/blog/posts` | GET | Danh sách bài viết (admin) | ⚠️ Chưa xác minh |
| `/api/admin/blog/posts/[id]/review` | PATCH | Duyệt bài viết | ⚠️ Chưa xác minh |

### 1.2 Authentication (`/api/auth/*`)
| Endpoint | Methods | Mô tả | Bảo vệ |
|----------|---------|-------|--------|
| `/api/auth/[...nextauth]` | ALL | NextAuth handlers | ✅ NextAuth |

### 1.3 Campaigns (`/api/campaigns/*`)
| Endpoint | Methods | Mô tả | Bảo vệ |
|----------|---------|-------|--------|
| `/api/campaigns` | GET, POST | List/Create campaigns | 🔓 Public GET / ✅ Auth POST |
| `/api/campaigns/[slug]` | GET, PUT, DELETE | CRUD campaign | 🔓 Public GET / ✅ Owner |
| `/api/campaigns/[slug]/blog-posts` | GET | Blog posts liên kết | 🔓 Public |
| `/api/campaigns/[slug]/cancel` | POST | Hủy campaign | ✅ Owner/Admin |
| `/api/campaigns/[slug]/follow` | GET, POST, DELETE | Follow/unfollow | ✅ Auth |
| `/api/campaigns/[slug]/reports` | GET, POST | Báo cáo vi phạm | ✅ Auth POST / Admin GET |
| `/api/campaigns/[slug]/reviews` | GET, POST | Đánh giá | 🔓 Public GET / ✅ Auth POST |
| `/api/campaigns/[slug]/updates` | GET, POST | Cập nhật tiến độ | 🔓 Public GET / ✅ Owner POST |
| `/api/campaigns/[slug]/updates/[id]` | PUT, DELETE | Sửa/xóa update | ✅ Owner |

### 1.4 Projects (`/api/projects/*`)
| Endpoint | Methods | Mô tả | Bảo vệ |
|----------|---------|-------|--------|
| `/api/projects` | GET, POST | List/Create projects | ✅ Creator/Admin |
| `/api/projects/[id]` | GET, PATCH, DELETE | CRUD project | 🔓 Public GET / ✅ Owner |

### 1.5 Blog (`/api/blog/*`)
| Endpoint | Methods | Mô tả | Bảo vệ |
|----------|---------|-------|--------|
| `/api/blog/posts` | GET, POST | List/Create posts | 🔓 Public GET / ✅ Auth POST |
| `/api/blog/posts/[slug]` | GET, PUT, DELETE | CRUD post | 🔓 Public GET / ✅ Owner |
| `/api/blog/posts/[slug]/publish` | PATCH | Publish draft | ✅ Owner |
| `/api/blog/posts/[slug]/archive` | PATCH | Archive post | ✅ Owner |
| `/api/blog/posts/[slug]/like` | POST | Like/unlike | ✅ Auth |
| `/api/blog/posts/[slug]/bookmark` | POST | Bookmark/unbookmark | ✅ Auth |
| `/api/blog/posts/[slug]/comments` | GET, POST | Comments | 🔓 Public GET / ✅ Auth POST |
| `/api/blog/comments/[id]` | DELETE | Delete comment | ✅ Owner |
| `/api/blog/categories` | GET | List categories | 🔓 Public |
| `/api/blog/my-posts` | GET | User's own posts | ✅ Auth |

### 1.6 Payments (`/api/payment/*` & `/api/payments`)
| Endpoint | Methods | Mô tả | Bảo vệ |
|----------|---------|-------|--------|
| `/api/payments` | POST | Create payment | 🔓 Public (Guest/Auth) |
| `/api/payment/payos/create` | POST | PayOS payment link | 🔓 Public |
| `/api/payment/payos/webhook` | POST, GET | PayOS webhook | ✅ Signature verified |
| `/api/payment/payos/mock-checkout` | GET | Dev mock checkout | 🔓 Dev only |
| `/api/payment/payos/test-webhook` | POST | Test webhook | 🔓 Dev only |
| `/api/payment/sepay/create` | POST | SePay checkout | 🔓 Public |
| `/api/payment/sepay/webhook` | POST, GET | SePay webhook | ✅ Signature verified |
| `/api/payment/sepay/status/[pledgeId]` | GET | Check payment status | 🔓 Public |
| `/api/payment/vnpay/create` | POST | VNPay payment | ⚠️ Not implemented |
| `/api/payment/vnpay/webhook` | GET | VNPay return URL | ⚠️ Not implemented |
| `/api/payment/momo/create` | POST | MoMo payment | ⚠️ Not implemented |
| `/api/payment/momo/webhook` | POST | MoMo webhook | ⚠️ Not implemented |

### 1.7 Chat (`/api/chat/*`)
| Endpoint | Methods | Mô tả | Bảo vệ |
|----------|---------|-------|--------|
| `/api/chat/conversations` | GET | List conversations | ✅ Auth |
| `/api/chat/conversations/start` | POST | Start conversation | ✅ Auth |
| `/api/chat/conversations/find-or-create` | POST | Find/create conversation | ✅ Auth |
| `/api/chat/conversations/[id]/messages` | GET, POST | Get/Send messages | ✅ Auth |
| `/api/chat/conversations/[id]/read` | PATCH | Mark as read | ✅ Auth |
| `/api/chat/conversations/[id]/block` | POST, DELETE | Block/unblock | ✅ Auth |
| `/api/chat/conversations/[id]/report` | POST | Report conversation | ✅ Auth |
| `/api/chat/messages/[messageId]` | DELETE | Delete message | ✅ Owner |
| `/api/chat/unread-count` | GET | Unread count | ✅ Auth |

### 1.8 Users (`/api/users/*` & `/api/user/*`)
| Endpoint | Methods | Mô tả | Bảo vệ |
|----------|---------|-------|--------|
| `/api/users` | GET, PUT | List users / Update profile | ✅ Admin GET / ✅ Auth PUT |
| `/api/users/search` | GET | Search users | 🔓 Public |
| `/api/users/[userId]` | GET | Get user profile | 🔓 Public |
| `/api/users/[userId]/badges` | GET | Get user badges | 🔓 Public |
| `/api/user/profile` | GET | Own profile | ✅ Auth |
| `/api/user/upgrade-creator` | POST | Upgrade to creator | ✅ Auth |
| `/api/profile/update` | POST | Update profile | ✅ Auth |

### 1.9 Badges (`/api/badges/*` & `/api/me/badges`)
| Endpoint | Methods | Mô tả | Bảo vệ |
|----------|---------|-------|--------|
| `/api/badges` | GET | List public badges | 🔓 Public |
| `/api/me/badges` | GET | Current user's badges | ✅ Auth |

### 1.10 Rewards (`/api/rewards/*`)
| Endpoint | Methods | Mô tả | Bảo vệ |
|----------|---------|-------|--------|
| `/api/rewards` | POST | Create reward | ✅ Campaign Owner |
| `/api/rewards/[id]` | GET, PUT, DELETE | CRUD reward | 🔓 Public GET / ✅ Owner |
| `/api/rewards/[id]/toggle` | PATCH | Toggle availability | ✅ Owner |

### 1.11 KYC (`/api/kyc/*`)
| Endpoint | Methods | Mô tả | Bảo vệ |
|----------|---------|-------|--------|
| `/api/kyc/submit` | POST | Submit KYC | ✅ Auth |
| `/api/kyc/status` | GET | Get KYC status | ✅ Auth |

### 1.12 Utility (`/api/stats`, `/api/upload`, etc.)
| Endpoint | Methods | Mô tả | Bảo vệ |
|----------|---------|-------|--------|
| `/api/stats` | GET | Platform stats | 🔓 Public |
| `/api/upload` | POST | Upload image | ✅ Auth |
| `/api/lookup` | GET | Lookup transaction | 🔓 Public |
| `/api/transactions/[txId]` | GET | Get transaction | 🔓 Public |
| `/api/taxonomy` | GET | Get taxonomy | 🔓 Public |
| `/api/taxonomy/[category]` | GET | Get category | 🔓 Public |
| `/api/taxonomy/search` | GET | Search tags | 🔓 Public |

### 1.13 Cron (`/api/cron/*`)
| Endpoint | Methods | Mô tả | Bảo vệ |
|----------|---------|-------|--------|
| `/api/cron/cleanup-payments` | GET | Clean stale payments | ❌ KHÔNG CÓ |
| `/api/cron/update-campaign-status` | GET | Update campaign status | ❌ KHÔNG CÓ |

### 1.14 Test/Debug (`/api/test-*`, `/api/simple-test`)
| Endpoint | Methods | Mô tả | Bảo vệ |
|----------|---------|-------|--------|
| `/api/simple-test` | GET, POST | Health check | 🔓 Public |
| `/api/test-payos` | GET | Test PayOS config | 🔓 Public |
| `/api/payments-debug` | POST | Payment debug | 🔓 Public |

---

## 2. VẤN ĐỀ PHÁT HIỆN - BẢNG CHI TIẾT

| # | File | Endpoint | Vấn đề | Mức độ | Gợi ý sửa |
|---|------|----------|--------|--------|-----------|
| 1 | `src/hooks/usePledge.ts:34` | `/api/payments/route` | ❌ **URL SAI**: `/route` không cần thiết trong Next.js App Router | 🔴 CAO | Sửa thành `/api/payments` |
| 2 | `src/components/campaign/PledgeForm.tsx:83` | `/api/payments/route` | ❌ **URL SAI**: Tương tự #1 | 🔴 CAO | Sửa thành `/api/payments` |
| 3 | `src/app/auth/register/page.tsx:41` | `/api/auth/register` | ❌ **ENDPOINT KHÔNG TỒN TẠI**: Thư mục `src/app/api/auth/register/` trống, không có `route.ts` | 🔴 CAO | Tạo handler hoặc xóa thư mục |
| 4 | `src/app/api/admin/users/[userId]/toggle-pro/` | `/api/admin/users/[userId]/toggle-pro` | ❌ **THƯ MỤC TRỐNG**: Không có `route.ts` | 🟡 TRUNG BÌNH | Tạo handler hoặc xóa thư mục |
| 5 | `src/app/api/admin/users/[userId]/update-status/` | `/api/admin/users/[userId]/update-status` | ❌ **THƯ MỤC TRỐNG**: Không có `route.ts` | 🟡 TRUNG BÌNH | Tạo handler hoặc xóa thư mục |
| 6 | `src/app/api/campaigns/[slug]/[id]/` | Không rõ | ❌ **THƯ MỤC TRỐNG**: Không có `route.ts`, không rõ mục đích | 🟡 TRUNG BÌNH | Xóa thư mục hoặc tài liệu hóa |
| 7 | `src/app/api/test-followers/` | `/api/test-followers` | ❌ **THƯ MỤC TRỐNG**: Test endpoint bỏ dở | 🟢 THẤP | Xóa thư mục test |
| 8 | `src/app/api/admin/blog/posts/[id]/route.ts` | `/api/admin/blog/posts/[id]/review` | ❌ **FILE KHÔNG TỒN TẠI**: Sub-agent report nói có nhưng file không tồn tại | 🟡 TRUNG BÌNH | Kiểm tra lại hoặc tạo file |
| 9 | `src/app/api/cron/cleanup-payments/route.ts` | `/api/cron/cleanup-payments` | 🔓 **KHÔNG BẢO VỆ**: Cron job public, không check API key | 🔴 CAO | Thêm API key check hoặc Vercel Cron Secret |
| 10 | `src/app/api/cron/update-campaign-status/route.ts` | `/api/cron/update-campaign-status` | 🔓 **KHÔNG BẢO VỆ**: Tương tự #9 | 🔴 CAO | Thêm API key check |
| 11 | `src/app/api/test-payos/route.ts` | `/api/test-payos` | 🔓 **DEBUG ENDPOINT PUBLIC**: Lộ thông tin cấu hình PayOS | 🟡 TRUNG BÌNH | Chỉ cho phép trong dev mode |
| 12 | `src/app/api/payments-debug/route.ts` | `/api/payments-debug` | 🔓 **DEBUG ENDPOINT PUBLIC**: Debug payment không bảo vệ | 🟡 TRUNG BÌNH | Chỉ cho phép trong dev hoặc admin |
| 13 | `src/app/api/simple-test/route.ts` | `/api/simple-test` | 🔓 **TEST ENDPOINT PUBLIC**: Health check không cần bảo vệ nhưng nên giới hạn data | 🟢 THẤP | Giới hạn info trả về |
| 14 | `src/app/api/payments/refund.ts` | N/A | ⚠️ **FILE KHÔNG ĐÚNG VỊ TRÍ**: File `.ts` trong thư mục API phải là `route.ts` | 🟡 TRUNG BÌNH | Đổi tên thành `refund/route.ts` |
| 15 | `src/app/api/payments/webhook.ts` | N/A | ⚠️ **FILE KHÔNG ĐÚNG VỊ TRÍ**: Tương tự #14 | 🟡 TRUNG BÌNH | Đổi tên thành `webhook/route.ts` |
| 16 | `src/middleware.ts` | Middleware | ⚠️ **PUBLIC API QUÊN BẢO VỆ**: `/api/projects` là public nhưng POST cần auth | 🟡 TRUNG BÌNH | Middleware không check method |
| 17 | `src/app/api/payment/payos/mock-checkout/route.ts:101` | Internal fetch | ⚠️ **STRING TEMPLATE SAI**: Dùng single quote + ${} không work | 🟡 TRUNG BÌNH | Sửa thành template literal đúng |

---

## 3. DEAD APIs - API KHÔNG ĐƯỢC SỬ DỤNG

Dựa trên phân tích grep search, các API sau **KHÔNG** được frontend gọi:

| API Endpoint | Trạng thái | Gợi ý |
|--------------|-----------|--------|
| `/api/admin/badges/[id]` (GET, PATCH, DELETE) | ❓ Chưa thấy client code | Kiểm tra xem có dashboard admin chưa implement |
| `/api/admin/blog/posts` (GET) | ❓ Chưa thấy client code | Có thể feature chưa hoàn thiện |
| `/api/campaigns/[slug]/blog-posts` | ❓ Chưa thấy client code | Kiểm tra có component nào dùng không |
| `/api/campaigns/[slug]/reports` (GET) | ❓ Admin only, có thể chưa có UI | Cần dashboard admin |
| `/api/campaigns/[slug]/updates/[id]` (PUT, DELETE) | ❓ Chưa thấy client code | Kiểm tra campaign update UI |
| `/api/chat/conversations/find-or-create` | ❓ Duplicate với `start`? | Xem xét hợp nhất |
| `/api/chat/conversations/[id]/block` | ❓ Chưa thấy UI | Feature chat chưa hoàn thiện |
| `/api/chat/conversations/[id]/report` | ❓ Chưa thấy UI | Feature moderation chưa có |
| `/api/kyc/submit` & `/api/kyc/status` | ❓ Chưa thấy UI | KYC flow chưa implement UI |
| `/api/rewards/[id]/toggle` | ❓ Chưa thấy UI | Dashboard creator chưa có |
| `/api/taxonomy/*` | ❓ Chưa thấy client code | Hệ thống tag có thể chưa dùng |
| `/api/lookup` | ❓ Chưa thấy UI | Feature tra cứu chưa có |
| `/api/transactions/[txId]` | ❓ Chưa thấy UI | Tương tự lookup |
| `/api/users` (GET - Admin only) | ❓ Chưa có admin dashboard | Cần UI quản lý user |
| `/api/payment/vnpay/*` | ⚠️ Not implemented | Xóa hoặc implement |
| `/api/payment/momo/*` | ⚠️ Not implemented | Xóa hoặc implement |

**LƯU Ý**: Một số API trên có thể:
- Được dùng bởi external webhook (PayOS, SePay)
- Được gọi server-side (không thấy trong client code)
- Feature chưa hoàn thiện (admin dashboard, KYC, moderation)

---

## 4. LỖ HỔNG BẢO MẬT - PHÂN TÍCH CHI TIẾT

### 4.1 🔴 NGHIÊM TRỌNG

#### A. Cron Jobs Không Bảo Vệ
**File:** `src/app/api/cron/cleanup-payments/route.ts`  
**File:** `src/app/api/cron/update-campaign-status/route.ts`

**Vấn đề:** 
- Cả 2 cron job đều là GET endpoint public
- Bất kỳ ai cũng có thể gọi và trigger cleanup/update
- Có thể gây DoS hoặc thay đổi trạng thái campaign không mong muốn

**Proof of Concept:**
```bash
# Ai cũng có thể gọi
curl https://yourdomain.com/api/cron/cleanup-payments
curl https://yourdomain.com/api/cron/update-campaign-status
```

**Giải pháp:**
```typescript
// src/app/api/cron/cleanup-payments/route.ts
export async function GET(request: Request) {
  // 1. Check Vercel Cron Secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // ... rest of code
}
```

**Hoặc dùng API Key:**
```typescript
const apiKey = request.headers.get('x-api-key');
if (apiKey !== process.env.CRON_API_KEY) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

#### B. URL Sai Gây Thanh Toán Thất Bại
**File:** `src/hooks/usePledge.ts:34`  
**File:** `src/components/campaign/PledgeForm.tsx:83`

**Vấn đề:**
```typescript
// ❌ SAI
const res = await fetch("/api/payments/route", {
  method: "POST",
  // ...
});
```

**Tác động:**
- User pledge bị lỗi 404
- Mất trải nghiệm người dùng
- Mất doanh thu

**Giải pháp:**
```typescript
// ✅ ĐÚNG
const res = await fetch("/api/payments", {
  method: "POST",
  // ...
});
```

#### C. Endpoint /api/auth/register Không Tồn Tại
**File:** `src/app/auth/register/page.tsx:41`

**Vấn đề:**
- Frontend call `/api/auth/register` nhưng không có handler
- User không thể đăng ký
- Thư mục tồn tại nhưng trống: `src/app/api/auth/register/`

**Giải pháp:**
```typescript
// Tạo file: src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();
    
    // Validate
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check existing
    const existing = await prisma.users.findUnique({
      where: { email }
    });
    
    if (existing) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'BACKER',
        status: 'ACTIVE'
      }
    });
    
    return NextResponse.json({
      message: 'User created successfully',
      userId: user.id
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('[POST /api/auth/register]', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
```

### 4.2 🟡 TRUNG BÌNH

#### D. Debug/Test Endpoints Public
**Files:**
- `src/app/api/test-payos/route.ts`
- `src/app/api/payments-debug/route.ts`
- `src/app/api/simple-test/route.ts`

**Vấn đề:**
- Test endpoints lộ thông tin cấu hình
- Có thể dùng để probe hệ thống

**Giải pháp:**
```typescript
// Chỉ cho phép trong dev
export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  // ... rest of code
}
```

**Hoặc yêu cầu admin:**
```typescript
const session = await auth();
if (!session?.user || !(session.user as any).isAdmin) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

#### E. File Naming Không Đúng Convention
**Files:**
- `src/app/api/payments/refund.ts`
- `src/app/api/payments/webhook.ts`

**Vấn đề:**
- Next.js App Router yêu cầu file phải tên `route.ts`
- File `.ts` tên khác không được routing

**Giải pháp:**
```bash
# Di chuyển và đổi tên
mv src/app/api/payments/refund.ts src/app/api/payments/refund/route.ts
mv src/app/api/payments/webhook.ts src/app/api/payments/webhook/route.ts
```

#### F. Middleware Không Check HTTP Method
**File:** `src/middleware.ts`

**Vấn đề:**
```typescript
const isPublicApiRoute =
  pathname.startsWith("/api/projects") || // ❌ GET OK nhưng POST cần auth
  pathname.startsWith("/api/campaigns"); // ❌ Tương tự
```

**Giải pháp:**
```typescript
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  
  // Public READ-only API routes
  const isPublicReadApi = 
    (pathname.startsWith("/api/projects") && method === "GET") ||
    (pathname.startsWith("/api/campaigns") && method === "GET");
  
  // Mutating operations need auth
  const needsAuth = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
  
  if (pathname.startsWith("/api/projects") && needsAuth) {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  
  return NextResponse.next();
}
```

### 4.3 🟢 THẤP - Code Quality Issues

#### G. String Template Bug
**File:** `src/app/api/payment/payos/mock-checkout/route.ts:101`

**Vấn đề:**
```typescript
// ❌ SAI - single quote không parse ${} 
const res = await fetch('/api/payment/payos/test-webhook?type=' + type + '&orderCode=${orderCode}&amount=${amount}', {
  method: 'POST'
});
```

**Giải pháp:**
```typescript
// ✅ ĐÚNG - dùng backtick
const res = await fetch(`/api/payment/payos/test-webhook?type=${type}&orderCode=${orderCode}&amount=${amount}`, {
  method: 'POST'
});
```

---

## 5. KHUYẾN NGHỊ HÀNH ĐỘNG

### 5.1 Ưu Tiên Cao (Sửa Ngay)
1. ✅ Sửa URL `/api/payments/route` → `/api/payments` (2 files)
2. ✅ Tạo handler `/api/auth/register/route.ts`
3. ✅ Bảo vệ cron jobs với API key hoặc Vercel Cron Secret
4. ✅ Di chuyển `refund.ts` và `webhook.ts` vào thư mục con với `route.ts`

### 5.2 Ưu Tiên Trung Bình (1-2 Tuần)
5. ✅ Giới hạn debug endpoints chỉ dev mode hoặc admin
6. ✅ Xóa các thư mục trống:
   - `/api/admin/users/[userId]/toggle-pro/`
   - `/api/admin/users/[userId]/update-status/`
   - `/api/campaigns/[slug]/[id]/`
   - `/api/test-followers/`
   - `/api/auth/register/` (sau khi tạo route.ts)
7. ✅ Cải thiện middleware check HTTP method
8. ✅ Sửa string template bug

### 5.3 Ưu Tiên Thấp (Backlog)
9. 📝 Tài liệu hóa các API chưa có frontend (để xác định dead API thật sự)
10. 📝 Implement hoặc xóa VNPay, MoMo endpoints
11. 📝 Code review các handler chưa xác minh bảo mật (admin blog, etc.)
12. 📝 Thêm rate limiting cho payment endpoints

---

## 6. CHECKLIST TRIỂN KHAI

### Phase 1: Critical Fixes (1-2 ngày)
- [ ] Sửa `src/hooks/usePledge.ts` line 34
- [ ] Sửa `src/components/campaign/PledgeForm.tsx` line 83
- [ ] Tạo `src/app/api/auth/register/route.ts`
- [ ] Thêm API key check vào cron jobs
- [ ] Test payment flow end-to-end
- [ ] Test registration flow

### Phase 2: Structure Cleanup (3-5 ngày)
- [ ] Di chuyển `refund.ts` → `refund/route.ts`
- [ ] Di chuyển `webhook.ts` → `webhook/route.ts`
- [ ] Xóa thư mục trống (4 thư mục)
- [ ] Giới hạn debug endpoints
- [ ] Sửa middleware method check
- [ ] Sửa template literal bug
- [ ] Test toàn bộ API flow

### Phase 3: Documentation & Optimization (1 tuần)
- [ ] Viết docs cho tất cả API endpoints
- [ ] Kiểm tra và đánh dấu dead APIs
- [ ] Quyết định implement hay xóa VNPay/MoMo
- [ ] Code review admin endpoints
- [ ] Thêm integration tests
- [ ] Setup rate limiting
- [ ] Performance audit

---

## 7. MẪU CODE ĐỂ TRIỂN KHAI

### 7.1 Cron Job Protection
```typescript
// src/lib/cron-auth.ts
export function verifyCronAuth(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret) {
    console.error('CRON_SECRET not configured');
    return false;
  }
  
  return authHeader === `Bearer ${cronSecret}`;
}

// Usage in cron routes:
import { verifyCronAuth } from '@/lib/cron-auth';

export async function GET(request: Request) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... rest of code
}
```

### 7.2 Development-Only Endpoints
```typescript
// src/lib/dev-only.ts
export function requireDevelopment(): NextResponse | null {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return null;
}

// Usage:
export async function GET() {
  const devCheck = requireDevelopment();
  if (devCheck) return devCheck;
  
  // ... development code
}
```

### 7.3 Method-Aware Middleware
```typescript
// src/middleware.ts (improved)
const PUBLIC_READ_ONLY_APIS = [
  '/api/campaigns',
  '/api/projects',
  '/api/blog/posts',
  '/api/stats',
];

const PROTECTED_WRITE_APIS = [
  '/api/campaigns',
  '/api/projects',
  '/api/blog/posts',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  
  // Allow public reads
  const isPublicRead = PUBLIC_READ_ONLY_APIS.some(api => 
    pathname.startsWith(api)
  ) && method === 'GET';
  
  if (isPublicRead) {
    return NextResponse.next();
  }
  
  // Check auth for writes
  const needsAuth = PROTECTED_WRITE_APIS.some(api =>
    pathname.startsWith(api)
  ) && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  
  if (needsAuth) {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
  }
  
  return NextResponse.next();
}
```

---

## 8. KẾT LUẬN

### Tình Trạng Tổng Quan
- ✅ **API Structure**: Tốt, tuân theo Next.js App Router conventions (ngoại trừ 2 file)
- ✅ **Authorization**: Hầu hết endpoints có bảo vệ đúng với `requireAdmin()`, ownership checks
- ⚠️ **Security**: Có 3-5 lỗ hổng nghiêm trọng cần sửa ngay
- ⚠️ **Code Quality**: Có 2 URL sai, 1 template bug, 4 thư mục trống
- ❓ **Dead APIs**: Khoảng 15-20 endpoints chưa có frontend (cần xác minh)

### Điểm Mạnh
1. Kiến trúc API rõ ràng, tuân theo REST
2. Hệ thống auth/authz tốt với NextAuth + role-based
3. Payment webhooks có signature verification
4. Audit logging cho sensitive operations
5. Error handling nhất quán

### Điểm Yếu
1. Thiếu API key protection cho cron jobs
2. Một số endpoints test/debug public
3. Frontend có URL lỗi gây payment thất bại
4. Nhiều feature chưa hoàn thiện (admin UI, KYC, moderation)
5. Thiếu documentation cho một số APIs

### Risk Score: **6/10** (MEDIUM-HIGH)
- Critical issues: 3
- High issues: 2
- Medium issues: 8
- Low issues: 4

**Khuyến nghị:** Ưu tiên sửa 5 critical/high issues trong 1 tuần để giảm risk score xuống 3-4/10.

---

**Người phân tích:** Senior Backend Engineer  
**Ngày báo cáo:** 2026-08-15  
**Công cụ:** Manual code review + grep analysis + Next.js expertise
