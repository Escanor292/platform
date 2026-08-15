# BÁO CÁO PHÂN TÍCH: PROJECT VS CAMPAIGN - TỬ TẾ FUND

**Ngày phân tích:** June 30, 2026  
**Scope:** Kiểm tra entity Project, đề xuất kiến trúc phù hợp  
**Mục tiêu:** Phân biệt rõ Project (Dự án) và Campaign (Chiến dịch gây quỹ)

---

## 1. HIỆN TRẠNG HỆ THỐNG

### 1.1. ✅ Những Gì ĐÃ CÓ

| Thành phần | Đã có | File/Path | Ghi chú |
|------------|-------|-----------|---------|
| **Entity "Project"** | ❌ KHÔNG | - | Chỉ là naming convention |
| **Table "projects"** | ❌ KHÔNG | `prisma/schema.prisma` | Không tồn tại |
| **Table "campaigns"** | ✅ CÓ | `prisma/schema.prisma` | Entity chính |
| **Type "Project"** | ⚠️ CÓ (alias) | `src/types/project.ts` | Chỉ là wrapper cho Campaign |
| **API /projects** | ✅ CÓ | `src/app/api/projects/route.ts` | Query từ table `campaigns` |
| **Page /projects** | ✅ CÓ | `src/app/projects/page.tsx` | Discovery page |
| **Relation Project->Campaign** | ❌ KHÔNG | - | Không có foreign key |
| **Relation Project->Blog** | ❌ KHÔNG | - | Không có foreign key |

### 1.2. 🔍 Phát Hiện Quan Trọng

**"Project" hiện tại CHỈ LÀ ALIAS của "Campaign":**

```typescript
// src/types/project.ts
export interface ProjectListItem {
  id: string;              // = campaigns.id
  campaignCode: string;    // = campaigns.campaignCode
  slug: string;            // = campaigns.slug
  // ... tất cả fields là của campaigns
}
```

**API `/api/projects` query trực tiếp từ `campaigns` table:**

```typescript
// src/app/api/projects/route.ts
const campaigns = await prisma.campaigns.findMany({
  where, include, orderBy
});

// Transform campaigns -> ProjectListItem
const items: ProjectListItem[] = campaigns.map((campaign) => {
  // Direct mapping
});
```

**Kết luận:** 
- ❌ Không có entity "Project" độc lập
- ❌ Không có database table "projects"
- ✅ "Project" chỉ là tên gọi khác của "Campaign" ở UI layer
- ✅ Tất cả dữ liệu đều từ table `campaigns`

---

## 2. QUAN HỆ HIỆN TẠI

### 2.1. Campaign - Blog Relationship

**Đã có relation:**

```prisma
model campaigns {
  id String @id
  // ...
  blog_posts blog_posts[]  // ✅ One-to-Many
  campaign_blog_links campaign_blog_links[]  // ✅ Many-to-Many
}

model blog_posts {
  id String @id
  campaignId String?  // ✅ Foreign key
  campaigns campaigns? @relation(...)
  campaign_blog_links campaign_blog_links[]  // ✅ Many-to-Many
}
```

**Hiện tại:**
- ✅ Blog có thể belong to một Campaign (campaignId)
- ✅ Campaign có thể có nhiều blog posts
- ✅ Có bảng junction `campaign_blog_links` cho many-to-many

### 2.2. Campaign - Rewards Relationship

```prisma
model campaigns {
  rewards rewards[]  // ✅ One-to-Many
}

model rewards {
  campaignId String
  campaigns campaigns @relation(...)
}
```

**Hiện tại:**
- ✅ Reward thuộc về một Campaign
- ✅ Campaign có thể có nhiều rewards

### 2.3. Sơ Đồ Quan Hệ Hiện Tại

```
users (Creator)
  |
  ├─── campaigns (1:N)
  │      ├─── blog_posts (1:N)
  │      ├─── rewards (1:N)
  │      ├─── pledges (1:N)
  │      ├─── campaign_followers (1:N)
  │      ├─── campaign_updates (1:N)
  │      └─── reviews (1:N)
  │
  └─── blog_posts (1:N) [không thuộc campaign]
```

**Vấn đề:**
- ❌ Không có entity "Project" cấp cao hơn
- ❌ Blog posts độc lập (không thuộc campaign) không được group
- ❌ Không thể group nhiều campaigns vào một "dự án lớn"

---

## 3. KHÁI NIỆM MỤC TIÊU

### 3.1. Định Nghĩa Mong Muốn

**Project (Dự án)** = Entity cấp cao, portfolio item
- Một creator có thể có nhiều Projects
- Một Project là một "tập hợp công việc" hoặc "mảng hoạt động"

**Campaign (Chiến dịch gây quỹ)** = Đợt gây quỹ cụ thể trong Project
- Một Project có thể có nhiều Campaigns (đợt 1, đợt 2, ...)
- Campaign có startDate, endDate, goalAmount

**Ví dụ:**

```
Project: "Năng lượng xanh vùng cao"
├── Campaign 1: "Lắp đặt đợt 1 - 10 trường"
├── Campaign 2: "Mở rộng đợt 2 - 15 trường"
├── Blog 1: "Tiến độ tháng 1"
├── Blog 2: "Kết quả sau 6 tháng"
└── Products: Panel năng lượng, Inverter, ...
```

### 3.2. Sơ Đồ Mong Muốn

```
User (Creator)
  |
  ├─── Projects (1:N)  [NEW]
  │      ├─── Campaigns (1:N)
  │      │      ├─── Pledges
  │      │      ├─── Rewards
  │      │      └─── Reviews
  │      │
  │      ├─── Blog Posts (1:N)
  │      │      ├─── Comments
  │      │      └─── Likes
  │      │
  │      └─── Products (1:N)  [if needed]
  │
  └─── Standalone Campaigns (campaigns without project)
```

---

## 4. PHÂN TÍCH KHẢ NĂNG THỰC HIỆN

### 4.1. Option 1: Tạo Entity "Project" Thật (PHỨC TẠP)

#### 4.1.1. Database Changes Cần Thiết

**Tạo table mới:**

```prisma
model projects {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  description String
  imageUrl    String?
  
  creatorId   String
  creator     users    @relation(fields: [creatorId], references: [id])
  
  status      String   @default("ACTIVE")  // ACTIVE, ARCHIVED, COMPLETED
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  campaigns   campaigns[]
  blog_posts  blog_posts[]
  products    products[]  // if needed
  
  @@index([creatorId])
  @@index([status])
}
```

**Sửa table campaigns:**

```prisma
model campaigns {
  // ... existing fields ...
  
  projectId  String?  // ⚠️ BREAKING CHANGE
  project    projects? @relation(fields: [projectId], references: [id])
  
  @@index([projectId])  // New index
}
```

**Sửa table blog_posts:**

```prisma
model blog_posts {
  // ... existing fields ...
  
  projectId  String?  // ⚠️ BREAKING CHANGE
  project    projects? @relation(fields: [projectId], references: [id])
  
  @@index([projectId])  // New index
}
```

#### 4.1.2. Migration Required

**Bước 1: Tạo table projects**

```sql
CREATE TABLE projects (
  id VARCHAR PRIMARY KEY,
  slug VARCHAR UNIQUE NOT NULL,
  title VARCHAR NOT NULL,
  description TEXT,
  imageUrl VARCHAR,
  creatorId VARCHAR NOT NULL REFERENCES users(id),
  status VARCHAR DEFAULT 'ACTIVE',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_projects_creatorId ON projects(creatorId);
```

**Bước 2: Add column projectId**

```sql
ALTER TABLE campaigns ADD COLUMN projectId VARCHAR;
ALTER TABLE blog_posts ADD COLUMN projectId VARCHAR;

CREATE INDEX idx_campaigns_projectId ON campaigns(projectId);
CREATE INDEX idx_blog_posts_projectId ON blog_posts(projectId);
```

**Bước 3: Data migration (QUAN TRỌNG)**

```sql
-- Option A: Tự động tạo project cho mỗi campaign
INSERT INTO projects (id, slug, title, description, creatorId, createdAt)
SELECT 
  'proj_' || c.id,
  c.slug,
  c.title,
  c.description,
  c.creatorId,
  c.createdAt
FROM campaigns c;

UPDATE campaigns c
SET projectId = 'proj_' || c.id;

-- Option B: Group campaigns cùng creator và category
-- (Phức tạp hơn, cần logic business)
```

**Bước 4: Add foreign key constraints**

```sql
ALTER TABLE campaigns 
  ADD CONSTRAINT fk_campaigns_projectId 
  FOREIGN KEY (projectId) REFERENCES projects(id);

ALTER TABLE blog_posts 
  ADD CONSTRAINT fk_blog_posts_projectId 
  FOREIGN KEY (projectId) REFERENCES projects(id);
```

#### 4.1.3. API Changes Needed

**Tạo mới:**
- `GET /api/projects` - List projects (KHÁC với current)
- `GET /api/projects/[slug]` - Get project detail
- `POST /api/projects` - Create project
- `PATCH /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project
- `GET /api/projects/[id]/campaigns` - Get campaigns của project
- `GET /api/projects/[id]/blog-posts` - Get blogs của project

**Sửa hiện tại:**
- `GET /api/campaigns` - Thêm filter by projectId
- `POST /api/campaigns` - Require projectId
- `GET /api/blog/posts` - Thêm filter by projectId

#### 4.1.4. Frontend Changes Needed

**Pages mới:**
- `/projects` - Discovery (RENAME from current?)
- `/projects/[slug]` - Project detail page
- `/projects/create` - Create project
- `/projects/[slug]/edit` - Edit project
- `/projects/[slug]/campaigns` - List campaigns
- `/projects/[slug]/blog` - List blog posts

**Components mới:**
- `<ProjectCard />` - Display project
- `<ProjectDetail />` - Project detail view
- `<ProjectForm />` - Create/edit project
- `<ProjectCampaignsList />` - Campaigns trong project
- `<ProjectBlogList />` - Blogs trong project

**Components cần sửa:**
- `<CampaignForm />` - Add project selector
- `<BlogEditor />` - Add project selector
- Profile page - Show projects instead of campaigns

#### 4.1.5. Mức Độ Rủi Ro

🔴 **RỦI RO CỰC KỲ CAO:**

| Rủi ro | Mức độ | Chi tiết |
|---------|--------|----------|
| **Breaking changes** | 🔴 Cao | Thay đổi schema, foreign keys |
| **Data migration** | 🔴 Cao | Phải migrate existing campaigns |
| **API incompatibility** | 🔴 Cao | Current `/api/projects` sẽ bị conflict |
| **Frontend refactor** | 🔴 Cao | Phải refactor nhiều pages, components |
| **Testing effort** | 🔴 Cao | Phải test toàn bộ flows |
| **Production downtime** | ⚠️ Trung bình | Migration có thể gây downtime |
| **User confusion** | ⚠️ Trung bình | UI/UX thay đổi đáng kể |

**Effort ước tính:** 2-3 tuần (full-time)

---

### 4.2. Option 2: Soft Grouping với Metadata (TRUNG BÌNH)

#### 4.2.1. Concept

**KHÔNG tạo table mới, dùng metadata JSON:**

```prisma
model campaigns {
  // ... existing fields ...
  
  projectMetadata Json? // ⚠️ Thêm field mới
  //  {
  //    "projectId": "energy-highland-2024",
  //    "projectTitle": "Năng lượng xanh vùng cao",
  //    "projectPhase": 1,
  //    "isProjectLead": true
  //  }
}

model blog_posts {
  // ... existing fields ...
  
  projectMetadata Json? // ⚠️ Thêm field mới
}
```

#### 4.2.2. Implementation

**Migration (đơn giản):**

```sql
ALTER TABLE campaigns ADD COLUMN projectMetadata JSONB;
ALTER TABLE blog_posts ADD COLUMN projectMetadata JSONB;

CREATE INDEX idx_campaigns_projectMetadata ON campaigns USING GIN (projectMetadata);
CREATE INDEX idx_blog_posts_projectMetadata ON blog_posts USING GIN (projectMetadata);
```

**Query campaigns theo project:**

```typescript
const campaigns = await prisma.campaigns.findMany({
  where: {
    projectMetadata: {
      path: ['projectId'],
      equals: 'energy-highland-2024'
    }
  }
});
```

**API changes (nhỏ):**

```typescript
// GET /api/campaigns?projectId=energy-highland-2024
// GET /api/blog/posts?projectId=energy-highland-2024
```

#### 4.2.3. Ưu Điểm

- ✅ Không cần table mới
- ✅ Không breaking changes (chỉ thêm field nullable)
- ✅ Flexible - có thể thêm metadata khác
- ✅ Migration đơn giản
- ✅ Backward compatible

#### 4.2.4. Nhược Điểm

- ❌ Không có referential integrity (không có foreign key)
- ❌ Project không phải entity độc lập
- ❌ Khó enforce rules (VD: projectId format)
- ❌ Performance có thể chậm hơn với JSONB queries
- ❌ Không có project detail page thật sự

#### 4.2.5. Mức Độ Rủi Ro

🟡 **RỦI RO TRUNG BÌNH:**

| Rủi ro | Mức độ | Chi tiết |
|---------|--------|----------|
| **Breaking changes** | ✅ Thấp | Chỉ thêm field nullable |
| **Data migration** | ✅ Thấp | Không cần migrate data cũ |
| **API changes** | 🟡 Trung bình | Thêm filter, không break existing |
| **Frontend changes** | 🟡 Trung bình | Thêm grouping logic |
| **Data integrity** | 🟡 Trung bình | Không có foreign key constraint |
| **Performance** | 🟡 Trung bình | JSONB query có thể chậm |

**Effort ước tính:** 3-5 ngày

---

### 4.3. Option 3: Virtual Grouping (UI Only) - THẤP

#### 4.3.1. Concept

**KHÔNG sửa database, chỉ group ở frontend:**

```typescript
// Frontend logic
interface VirtualProject {
  id: string;  // Generated from campaigns
  title: string;  // Từ campaign đầu tiên
  campaigns: Campaign[];  // Group by creator + category
  blogPosts: BlogPost[];  // Filter by campaignIds
}

function groupCampaignsIntoProjects(campaigns: Campaign[]): VirtualProject[] {
  // Group logic:
  // - Cùng creator
  // - Cùng category
  // - Similar title (fuzzy match)
  // - Gần nhau về thời gian
}
```

#### 4.3.2. Implementation

**Không cần migration**

**API changes:**

```typescript
// GET /api/users/[userId]/virtual-projects
// -> Query campaigns, group ở server, return grouped data
```

**Frontend:**

```typescript
// Profile page
const virtualProjects = groupCampaignsIntoProjects(user.campaigns);

// Display:
// - Project title (từ campaign đầu tiên)
// - Số campaigns con
// - Tổng tiền huy động
// - Click vào -> expand list campaigns
```

#### 4.3.3. Ưu Điểm

- ✅ KHÔNG CẦN sửa database
- ✅ KHÔNG CẦN migration
- ✅ KHÔNG CẦN API mới
- ✅ Zero risk cho production
- ✅ Có thể implement nhanh (1-2 ngày)
- ✅ Có thể test trước khi commit schema

#### 4.3.4. Nhược Điểm

- ❌ Không có project entity thật
- ❌ Grouping logic có thể không chính xác
- ❌ Không có project slug/URL
- ❌ Không thể create project độc lập
- ❌ Phức tạp khi maintain grouping logic

#### 4.3.5. Mức Độ Rủi Ro

✅ **RỦI RO THẤP:**

| Rủi ro | Mức độ | Chi tiết |
|---------|--------|----------|
| **Breaking changes** | ✅ Không có | Zero database changes |
| **Data migration** | ✅ Không có | Không cần |
| **API changes** | ✅ Thấp | Chỉ thêm endpoint mới |
| **Frontend changes** | 🟡 Trung bình | Thêm grouping UI |
| **Data integrity** | ✅ Không ảnh hưởng | Không sửa data |
| **Performance** | ✅ Thấp | Grouping ở memory |

**Effort ước tính:** 1-2 ngày

---

## 5. PHÂN TÍCH USE CASES

### 5.1. Use Case: Creator Tạo Campaign Mới

**Hiện tại:**
```
1. Creator click "Tạo chiến dịch"
2. Điền form campaign
3. Submit -> tạo campaign
```

**Nếu có Project entity (Option 1):**
```
1. Creator click "Tạo dự án"
2. Điền form project (title, description)
3. Submit -> tạo project
4. Trong project, click "Tạo chiến dịch"
5. Điền form campaign
6. Submit -> tạo campaign thuộc project
```

⚠️ **Phức tạp hơn, nhiều bước hơn**

**Nếu có Soft Grouping (Option 2):**
```
1. Creator click "Tạo chiến dịch"
2. Điền form campaign
3. Optional: Chọn "Thuộc dự án" -> nhập projectId
4. Submit -> tạo campaign (có projectMetadata)
```

✅ **Tương tự hiện tại, thêm option**

**Nếu Virtual Grouping (Option 3):**
```
1. Creator click "Tạo chiến dịch"
2. Điền form campaign
3. Submit -> tạo campaign
4. System tự động group sau (hoặc creator group manual)
```

✅ **Giống hiện tại hoàn toàn**

### 5.2. Use Case: Hiển thị Profile

**Hiện tại:**
```
Profile
├── Chiến dịch đã tạo (danh sách campaigns)
└── Blog posts (nếu thêm)
```

**Option 1 - Project Entity:**
```
Profile
├── Dự án (danh sách projects)
│   └── Click -> Project detail
│       ├── Campaigns của project
│       ├── Blog posts của project
│       └── Stats tổng hợp
└── Chiến dịch độc lập (campaigns không thuộc project)
```

**Option 2 - Soft Grouping:**
```
Profile
├── Dự án (group campaigns có cùng projectId)
│   └── Click -> Filtered campaign list
└── Chiến dịch khác
```

**Option 3 - Virtual Grouping:**
```
Profile
├── Dự án (auto-grouped campaigns)
│   └── Click -> Expand campaigns list
└── Các chiến dịch khác
```

### 5.3. Use Case: Discovery/Browse

**Hiện tại:**
```
/projects page
- List tất cả campaigns
- Filter by category, status, etc.
```

**Nếu có Project:**
```
Conflict URL: /projects vs /campaigns?

Option A:
- /projects -> List projects
- /campaigns -> List campaigns
- /projects/[slug] -> Project detail
- /campaigns/[slug] -> Campaign detail

Option B:
- /discover -> List projects
- /campaigns -> List campaigns  
```

⚠️ **Cần refactor routes**

---

## 6. ĐỀ XUẤT KIẾN TRÚC TỐI ƯU

### 6.1. 🎯 Recommendation: Option 3 (Virtual Grouping) + Option 2 (Soft Grouping) - HYBRID

**Phase 1: Implement Option 3 (1-2 ngày)**

✅ **Lợi ích:**
- Không risk
- Test được concept
- User feedback sớm
- Có thể rollback dễ dàng

**Implementation:**
1. Tạo util `groupCampaignsIntoVirtualProjects()`
2. Thêm section "Dự án" trên Profile (UI only)
3. Auto-group campaigns theo:
   - Creator
   - Category
   - Time proximity
   - Title similarity
4. Display với expand/collapse UI

**Phase 2: Nếu concept tốt, migrate sang Option 2 (3-5 ngày)**

**Implementation:**
1. Add `projectMetadata` JSONB column
2. Migration script: Populate projectMetadata từ grouping logic
3. Update API: Filter by projectId từ metadata
4. Update UI: Use real projectId thay vì virtual grouping
5. Add admin UI: Manage project grouping

**Phase 3: Nếu cần full Project entity, consider Option 1 (2-3 tuần)**

Chỉ khi:
- Có nhiều use cases cần project entity độc lập
- Cần project-level permissions
- Cần project-level analytics
- Có resources để migrate toàn bộ

### 6.2. Lý Do Đề Xuất Hybrid Approach

| Tiêu chí | Virtual (Phase 1) | Soft (Phase 2) | Full Entity (Phase 3) |
|----------|-------------------|----------------|------------------------|
| **Time to market** | ✅ 1-2 ngày | 🟡 3-5 ngày | 🔴 2-3 tuần |
| **Risk** | ✅ Rất thấp | 🟡 Trung bình | 🔴 Cao |
| **Flexibility** | ✅ Cao | ✅ Cao | 🟡 Trung bình |
| **Scalability** | 🟡 Trung bình | ✅ Tốt | ✅ Rất tốt |
| **Data integrity** | ✅ Không ảnh hưởng | 🟡 No FK | ✅ Full FK |
| **Rollback ease** | ✅ Dễ | 🟡 Khó hơn | 🔴 Rất khó |

**Progressive Enhancement Strategy:**
- Start small, validate concept
- Gather user feedback
- Iterate based on real needs
- Scale up when proven valuable

---

## 7. IMPLEMENTATION PLAN - PHASE 1 (Virtual Grouping)

### 7.1. Step-by-Step

**Step 1: Create Grouping Utility (1 giờ)**

```typescript
// src/lib/virtual-project-grouping.ts

export interface VirtualProject {
  id: string;  // Generated: `vp_${creatorId}_${category}_${index}`
  title: string;
  description: string;
  category: string;
  campaigns: Campaign[];
  totalRaised: number;
  totalBackers: number;
  createdAt: Date;
  updatedAt: Date;
}

export function groupCampaignsIntoProjects(
  campaigns: Campaign[]
): VirtualProject[] {
  // 1. Group by creator + category
  // 2. Further group by title similarity
  // 3. Generate project metadata
  // 4. Return virtual projects
}
```

**Step 2: Add UI Component (2 giờ)**

```typescript
// src/components/profile/VirtualProjectsSection.tsx

export function VirtualProjectsSection({ campaigns }) {
  const projects = groupCampaignsIntoProjects(campaigns);
  
  return (
    <div>
      {projects.map(project => (
        <VirtualProjectCard 
          key={project.id}
          project={project}
        />
      ))}
    </div>
  );
}
```

**Step 3: Update Profile Page (1 giờ)**

```typescript
// src/app/profile/[userId]/page.tsx

// Add section
<VirtualProjectsSection campaigns={user.campaigns} />
```

**Step 4: Test & Polish (2 giờ)**

- Test grouping logic
- UI/UX polish
- Edge cases

**Total:** 6 giờ = 1 ngày công

### 7.2. No Breaking Changes

- ✅ Database: Không đổi
- ✅ API: Không đổi
- ✅ Existing features: Không ảnh hưởng
- ✅ Rollback: Xóa component là xong

---

## 8. KẾT LUẬN

### 8.1. Tóm Tắt Hiện Trạng

**"Project" hiện tại:**
- ❌ Không phải entity thật
- ❌ Chỉ là naming convention
- ❌ Alias của "Campaign" ở UI layer
- ✅ API `/api/projects` query từ `campaigns` table

**Campaign - Blog - Reward:**
- ✅ Có relations trong database
- ✅ Blog có thể belong to Campaign
- ✅ Reward belong to Campaign
- ❌ Nhưng không có "Project" cấp cao hơn để group

### 8.2. Đề Xuất Cuối Cùng

**🎯 KHUYẾN NGHỊ: Hybrid Approach (Phase-by-Phase)**

**Phase 1: Virtual Grouping (START HERE)**
- Time: 1-2 ngày
- Risk: Rất thấp
- Value: Test concept, user feedback

**Phase 2: Soft Grouping (IF VALIDATED)**
- Time: 3-5 ngày
- Risk: Trung bình
- Value: Persistent grouping, better scalability

**Phase 3: Full Project Entity (ONLY IF NECESSARY)**
- Time: 2-3 tuần
- Risk: Cao
- Value: Complete project management

**LÝ DO:**
- ✅ Minimize risk
- ✅ Fast time to market
- ✅ Validate before big investment
- ✅ Can rollback easily
- ✅ Progressive enhancement

### 8.3. KHÔNG Làm Ngay

❌ **KHÔNG tạo table `projects` ngay**
❌ **KHÔNG migration schema ngay**
❌ **KHÔNG refactor toàn bộ API ngay**

✅ **START với Virtual Grouping UI-only**
✅ **Gather feedback**
✅ **Iterate based on real needs**

---

**Người phân tích:** Kiro AI  
**Kết luận:** Bắt đầu với Virtual Grouping (low-risk, fast), sau đó scale up dần nếu cần.  
**Next action:** Implement Phase 1 Virtual Grouping trên Profile page để test concept.
