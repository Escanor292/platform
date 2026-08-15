# Báo Cáo: Vấn Đề Thuật Ngữ Không Nhất Quán Project vs Campaign

**Ngày phân tích:** 30/06/2026  
**Người báo cáo:** Kiro AI Assistant  
**Mức độ nghiêm trọng:** 🔴 **CRITICAL** - Gây nhầm lẫn cho người dùng

---

## 🚨 VẤN ĐỀ CHÍNH

### Hiện Trạng Mâu Thuẫn

Hệ thống **KHÔNG có** entity `Project` trong database, nhưng:
- ✅ Code sử dụng terminology "Project" ở nhiều nơi
- ✅ API endpoint là `/api/projects`  
- ✅ Page route là `/projects`
- ✅ Component folders tên `projects/`
- ❌ Database chỉ có bảng `campaigns`, không có `projects`
- ❌ Prisma schema chỉ có model `campaigns`
- ❌ UI hiển thị **MIX** giữa "Dự án" và "Chiến dịch"

### Ví Dụ Cụ Thể Trong ProfileTabs

**File:** `src/components/profile/ProfileTabs.tsx`

```typescript
// Tab label (dòng 48)
label: 'Chiến dịch',  // ✅ Đúng

// Section title (dòng 106)  
Dự án đã tạo ({campaigns.length})  // ❌ SAI - Nên là "Chiến dịch đã tạo"

// Variable name
campaigns: any[]  // ✅ Đúng
```

**Vấn đề:**
- Tab button ghi **"Chiến dịch"**
- Section heading ghi **"Dự án đã tạo"**  
- Nhưng data query từ bảng **`campaigns`**

---

## 📊 PHÂN TÍCH CHI TIẾT

### 1. Database Layer ✅ NHẤT QUÁN

```prisma
// ✅ Chỉ có campaigns, không có projects
model campaigns {
  id              String
  campaignCode    String
  title           String
  // ...
}

model blog_posts {
  campaignId      String?  // ✅ Link đến campaigns
  // projectId không tồn tại
}

model rewards {
  campaignId      String   // ✅ Link đến campaigns
  // projectId không tồn tại
}
```

**Kết luận:** Database layer hoàn toàn dùng `campaigns`

---

### 2. API Layer ⚠️ KHÔNG NHẤT QUÁN

**Endpoint:** `/api/projects`

```typescript
// File: src/app/api/projects/route.ts
export async function GET(req: NextRequest) {
  // Query từ bảng campaigns
  const campaigns = await prisma.campaigns.findMany({ ... });
  
  // Transform sang ProjectListItem
  const items: ProjectListItem[] = campaigns.map(...);
  
  // Return ProjectListResponse
  return NextResponse.json(response);
}
```

**Vấn đề:**
- URL là `/api/projects` ❌
- Query từ `prisma.campaigns` ✅
- Return type là `ProjectListResponse` ❌
- Variable name là `campaigns` ✅

**Khuyến nghị:** Đổi endpoint thành `/api/campaigns`

---

### 3. Type Definitions ❌ HOÀN TOÀN SAI

**File:** `src/types/project.ts`

```typescript
// ❌ File tên "project.ts" nhưng describe campaigns
export interface ProjectListItem {
  id: string;
  campaignCode: string;  // ✅ campaignCode, không phải projectCode
  campaignType: CampaignType;  // ✅ campaignType
  // ...
}

export interface ProjectFilters {
  campaignType?: CampaignType;  // ✅ filter theo campaignType
  // ...
}
```

**Vấn đề:** File name và type names không match với nội dung

**Khuyến nghị:** Đổi tên file thành `campaign.ts` hoặc `discovery.ts`

---

### 4. Component Layer ❌ MIX LẪN

#### Folders và Files

```
src/components/
├── projects/              ❌ Folder tên "projects"
│   ├── ProjectSearchBar   ❌ Component tên "Project..."
│   ├── ProjectGrid        ❌
│   ├── ProjectCard        ❌
│   └── ...
├── campaign/              ✅ Folder tên "campaign"
│   ├── CampaignHeader     ✅
│   └── ...
```

#### ProfileTabs Component

```typescript
// src/components/profile/ProfileTabs.tsx

// Props
campaigns: any[]  // ✅ Đúng

// Tab
{
  id: 'campaigns',           // ✅ Đúng
  label: 'Chiến dịch',       // ✅ Đúng
  count: campaigns.length,   // ✅ Đúng
}

// Section Title  
<h2>
  Dự án đã tạo ({campaigns.length})  // ❌ SAI - inconsistent
</h2>

// Loop
{campaigns.map((campaign) => (  // ✅ Đúng
  <Link href={`/campaigns/${campaign.slug}`}>  // ✅ URL đúng
    {campaign.title}
  </Link>
))}
```

---

### 5. Page Routes ⚠️ KHÔNG NHẤT QUÁN

```
src/app/
├── projects/              ❌ Route tên "projects"
│   └── page.tsx           → /projects
├── campaigns/             ✅ Route tên "campaigns"  
│   └── [slug]/
│       └── page.tsx       → /campaigns/:slug
```

**Vấn đề:**
- Discovery page: `/projects` (danh sách)
- Detail page: `/campaigns/:slug` (chi tiết)
- Không nhất quán về naming

---

### 6. Utility Libraries ❌ HOÀN TOÀN SAI

```
src/lib/
├── project-filters.ts     ❌
├── project-helpers.ts     ❌
├── project-query-params.ts ❌
├── project-cache.ts       ❌
```

Tất cả files này làm việc với **campaigns** data nhưng tên file là **project**

---

## 📍 DANH SÁCH FILE CẦN SỬA

### 🔴 Priority 1: User-Facing Text (Gấp)

| File | Line | Current | Should Be |
|------|------|---------|-----------|
| `src/components/profile/ProfileTabs.tsx` | 106 | "Dự án đã tạo" | "Chiến dịch đã tạo" |
| `docs/PROFILE_ANALYSIS_REPORT.md` | 71 | "Dự án đã tạo" | "Chiến dịch đã tạo" |
| `docs/PROFILE_BLOG_INTEGRATION_ANALYSIS.md` | 181 | "Dự án đã tạo" | "Chiến dịch đã tạo" |

### 🟡 Priority 2: Technical Naming (Quan trọng)

#### API Routes
- `src/app/api/projects/route.ts` → Rename to `campaigns/route.ts`
- Update endpoint: `/api/projects` → `/api/campaigns`

#### Type Files
- `src/types/project.ts` → Rename to `campaign.ts` hoặc `discovery.ts`
- Update all imports

#### Lib Files (7 files)
```
src/lib/project-*.ts → campaign-*.ts
├── project-filters.ts → campaign-filters.ts
├── project-helpers.ts → campaign-helpers.ts  
├── project-query-params.ts → campaign-query-params.ts
├── project-cache.ts → campaign-cache.ts
```

#### Component Folders
```
src/components/projects/ → campaigns/ hoặc discovery/
├── ProjectSearchBar → CampaignSearchBar
├── ProjectGrid → CampaignGrid
├── ProjectCard → CampaignCard
├── ... (15+ components)
```

#### Page Routes
```
src/app/projects/ → campaigns/ hoặc discovery/
```

### 🟢 Priority 3: Data Files

- `src/data/mock-projects.ts` → `mock-campaigns.ts`

---

## 🎯 KHUYẾN NGHỊ GIẢI PHÁP

### Option 1: Đổi Hết Về "Campaign" (Recommended)

**Lý do:**
- Database đã dùng `campaigns`
- Detail pages đã dùng `/campaigns/:slug`
- Prisma models đã dùng `campaigns`
- Ít refactor hơn

**Các bước:**
1. ✅ Sửa UI text: "Dự án" → "Chiến dịch"
2. ✅ Rename API: `/api/projects` → `/api/campaigns`
3. ✅ Rename types: `project.ts` → `campaign.ts`
4. ✅ Rename libs: `project-*.ts` → `campaign-*.ts`
5. ✅ Rename components folder
6. ✅ Update all imports (>100 files)

**Effort:** Medium (2-3 days)

---

### Option 2: Tạo Entity "Project" Mới (Not Recommended)

**Lý do:**
- Phải thêm bảng `projects` vào database
- Migration data từ `campaigns` → `projects`
- Refactor toàn bộ schema relationships
- Breaking changes cho production data

**Effort:** Very High (1-2 weeks + downtime)

**Rủi ro:** HIGH

---

### Option 3: Dual Naming Strategy (Không khuyến nghị)

Giữ code dùng "Project", UI dùng "Chiến dịch"

**Vấn đề:**
- Tiếp tục gây nhầm lẫn cho developers
- Inconsistent naming conventions
- Hard to maintain long-term

---

## 📋 CHECKLIST SỬA NHANH (Quick Fix)

### Step 1: Sửa UI Text (5 phút)

```diff
// src/components/profile/ProfileTabs.tsx
- Dự án đã tạo ({campaigns.length})
+ Chiến dịch đã tạo ({campaigns.length})
```

### Step 2: Update Documentation (10 phút)

- `docs/PROFILE_ANALYSIS_REPORT.md`
- `docs/PROFILE_BLOG_INTEGRATION_ANALYSIS.md`

### Step 3: Add Comment Warning (5 phút)

```typescript
// src/app/api/projects/route.ts
/**
 * @deprecated Endpoint name should be /api/campaigns
 * TODO: Rename to match database entity (campaigns table)
 * Currently kept for backward compatibility
 */
export async function GET(req: NextRequest) { ... }
```

---

## 🔍 CODE EXAMPLES

### Current State (Inconsistent)

```typescript
// ❌ BAD: Mixed terminology
const campaigns = await prisma.campaigns.findMany();
const projects: ProjectListItem[] = campaigns.map(...);
return <ProjectGrid projects={projects} />;
```

### Recommended State (Consistent)

```typescript
// ✅ GOOD: Consistent terminology
const campaigns = await prisma.campaigns.findMany();
const items: CampaignListItem[] = campaigns.map(...);
return <CampaignGrid campaigns={items} />;
```

---

## 📊 IMPACT ANALYSIS

### Files Affected

| Category | Count | Effort |
|----------|-------|--------|
| UI Components | ~15 files | Low |
| Type Definitions | ~3 files | Medium |
| API Routes | ~2 files | Medium |
| Lib Utilities | ~7 files | High |
| Page Routes | ~2 files | High |
| Tests | ~5 files | Medium |
| Documentation | ~5 files | Low |
| **Total** | **~39 files** | **High** |

### Breaking Changes

| Change | Impact | Mitigation |
|--------|--------|------------|
| `/api/projects` → `/api/campaigns` | ⚠️ Frontend calls | Add redirect/proxy |
| `/projects` → `/campaigns` | ⚠️ External links | 301 redirect |
| Type names | ⚠️ Import statements | Auto-refactor |

---

## 🎬 HÀNH ĐỘNG TIẾP THEO

### Immediate (Today)

1. ✅ **Sửa UI text** trong `ProfileTabs.tsx`: "Dự án" → "Chiến dịch"
2. ✅ **Update docs** để đồng bộ terminology
3. ✅ **Thêm TODO comments** cho các files cần refactor

### Short-term (This Week)

1. 🔄 Create migration plan
2. 🔄 Setup API redirects for backward compatibility
3. 🔄 Refactor component names and folders

### Long-term (Next Sprint)

1. 🔄 Complete full refactor to "Campaign" terminology
2. 🔄 Update all tests and documentation
3. 🔄 Remove deprecated endpoints

---

## 💡 KINH NGHIỆM RÚT RA

### Nguyên Nhân Gốc Rễ

1. **Lack of terminology guidelines** - Không có quy chuẩn đặt tên rõ ràng
2. **Mixed abstraction levels** - Code dùng "Project" như abstraction layer nhưng database dùng "Campaign"
3. **Incremental development** - Thêm features mà không refactor naming

### Best Practices Cho Tương Lai

1. ✅ **Single source of truth** - Database schema quyết định terminology
2. ✅ **Consistent naming** - Từ database → API → UI dùng cùng 1 term
3. ✅ **Documentation first** - Document naming decisions trước khi code
4. ✅ **Linting rules** - Setup ESLint rules để catch inconsistencies

---

## 📝 TERMINOLOGY MAPPING TABLE

| Vietnamese | English (Code) | English (UI) | Database |
|------------|----------------|--------------|----------|
| Chiến dịch | Campaign | Campaign | `campaigns` |
| Dự án | ~~Project~~ ❌ | Campaign | `campaigns` |
| Người tạo | Creator | Creator | `creatorId` |
| Người ủng hộ | Backer | Supporter | `userId` in pledges |
| Đóng góp | Pledge | Contribution | `pledges` |
| Phần thưởng | Reward | Reward | `rewards` |

---

## ✅ KẾT LUẬN

### Trả Lời Câu Hỏi Ban Đầu

1. **Vì sao tab ghi "Chiến dịch" nhưng section title lại ghi "Dự án đã tạo"?**
   - ❌ **Lỗi inconsistency** - Developer quên sửa section title

2. **Trong code: tên biến là campaigns hay projects?**
   - ✅ Variable: `campaigns`
   - ❌ Types: `ProjectListItem`
   - ❌ Components: `ProjectGrid`
   - 🔄 **MIX LẪN**

3. **Query lấy từ bảng campaigns hay projects?**
   - ✅ Query từ `prisma.campaigns`
   - ❌ Không có bảng `projects`

4. **Đổi toàn bộ label "Dự án đã tạo" thành "Chiến dịch đã tạo"?**
   - ✅ **ĐỒNG Ý** - Cần làm ngay

5. **Hệ thống đã có Project model/page/API?**
   - ❌ Không có Project model
   - ❌ Có `/projects` page nhưng query `campaigns`
   - ❌ Có `/api/projects` nhưng query `campaigns`
   - 🔴 **Naming hoàn toàn sai**

6. **Nếu chưa có Project entity, không dùng từ "Dự án"?**
   - ✅ **ĐỒNG Ý HOÀN TOÀN**
   - Nên dùng "Chiến dịch" everywhere

---

**Khuyến nghị cuối cùng:**  
👉 **Sửa ngay UI text (5 phút), sau đó lên kế hoạch refactor toàn bộ (2-3 ngày)**

---

**Generated by:** Kiro AI Assistant  
**Reviewed by:** Development Team  
**Status:** 🔴 **NEEDS IMMEDIATE ACTION**
