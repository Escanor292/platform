# Project Discovery System - Hướng dẫn đầy đủ

## 1. PRODUCT SUMMARY

Hệ thống khám phá dự án (Project Discovery) cho phép người dùng:
- Tìm kiếm dự án theo mã số (campaignCode) hoặc tên dự án
- Lọc theo nhiều tiêu chí: thời gian, lượt xem, đánh giá, trạng thái, loại campaign
- Sắp xếp linh hoạt: mới nhất, phổ biến nhất, đánh giá cao, sắp kết thúc
- URL sync với query params (share-able, bookmark-able)
- UI hiện đại, responsive, mobile-friendly

## 2. SEARCH AND FILTER UX LOGIC

### Search Logic
- Tìm kiếm theo mã dự án (CF-YYYYMMDD-XXXXX)
- Tìm kiếm theo tên dự án (partial match, case-insensitive)
- Auto-detect: nếu query giống mã dự án thì ưu tiên search theo mã
- Trim whitespace, normalize input

### Filter UX
- Search bar lớn ở đầu trang
- Sort dropdown ngay bên cạnh
- Advanced filters button mở drawer
- Active filters hiển thị dưới dạng removable chips
- Clear all filters button
- Results count và pagination

## 3. DATA MODEL

### Campaign Code Format
```
CF-YYYYMMDD-XXXXX
```
- CF: CrowdFunding
- YYYYMMDD: Ngày tạo
- XXXXX: 5 ký tự random (A-Z, 0-9)

### Project Fields
```typescript
{
  id: string;
  campaignCode: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string | null;
  
  creatorId: string;
  creatorName: string;
  creatorAvatar: string | null;
  creatorIsPro: boolean;
  
  category: string;
  tags: string[];
  campaignType: CampaignType;
  
  goalAmount: number;
  currentAmount: number;
  progressPercent: number;
  
  totalBackers: number;
  totalViews: number;
  ratingAverage: number;
  ratingCount: number;
  
  createdAt: Date;
  updatedAt: Date;
  startDate: Date | null;
  endDate: Date | null;
  
  status: CampaignStatus;
  completionState: CompletionState;
  isFeatured: boolean;
}
```

## 4. STATUS AND CAMPAIGN TYPE DESIGN

### Campaign Status
- `DRAFT`: Nháp
- `PENDING_REVIEW`: Chờ duyệt
- `ACTIVE`: Đang hoạt động
- `PAUSED`: Tạm dừng
- `COMPLETED`: Hoàn thành
- `FAILED`: Thất bại
- `CANCELED`: Đã hủy

### Completion State
- `NOT_STARTED`: Chưa bắt đầu
- `ONGOING`: Đang gây quỹ
- `GOAL_REACHED`: Đã đạt mục tiêu
- `COMPLETED`: Đã hoàn thành
- `FAILED`: Đã kết thúc (không đạt mục tiêu)
- `PAUSED`: Tạm dừng

### Campaign Type
- `REWARD`: Reward-based Campaign
- `DONATION`: Donation-based Campaign
- `EQUITY`: Equity-based Campaign
- `SUBSCRIPTION`: Subscription/Membership
- `PREORDER`: Pre-order

### Main Categories
- Giáo dục
- Y tế
- Cộng đồng
- Công nghệ
- Nghệ thuật
- Môi trường
- Nông nghiệp
- Giải trí
- Kinh doanh
- Khẩn cấp & Từ thiện

## 5. QUERY PARAM DESIGN

### URL Format
```
/projects?q=robot&sort=most_viewed&category=Cong-nghe&campaignType=REWARD&completionState=ONGOING&ratingMin=4&createdWithin=30d&progressMin=50&isFeatured=true&page=2
```

### Query Parameters
- `q`: Search query (mã dự án hoặc tên)
- `sort`: Sort option (newest, most_viewed, top_rated, etc.)
- `category`: Main category
- `campaignType`: Campaign type (REWARD, DONATION, etc.)
- `status`: Campaign status
- `completionState`: Completion state
- `ratingMin`: Minimum rating (3, 4, 5)
- `createdWithin`: Time range (7d, 30d, 90d, 365d)
- `progressMin`: Minimum progress percent
- `progressMax`: Maximum progress percent
- `isFeatured`: Featured projects only (true)
- `page`: Page number
- `limit`: Items per page

## 6. FILE STRUCTURE

```
src/
├── types/
│   └── project.ts                          # TypeScript types
├── lib/
│   ├── project-helpers.ts                  # Helper functions
│   ├── project-query-params.ts             # Query param parsing
│   └── project-filters.ts                  # Filter logic
├── data/
│   └── mock-projects.ts                    # Mock data (35 projects)
├── components/projects/
│   ├── ProjectSearchBar.tsx                # Search input
│   ├── ProjectSortSelect.tsx               # Sort dropdown
│   ├── ProjectFilterChips.tsx              # Active filters chips
│   ├── ProjectAdvancedFilters.tsx          # Advanced filters drawer
│   ├── ProjectCard.tsx                     # Project card
│   ├── ProjectGrid.tsx                     # Grid layout
│   ├── ProjectResultsHeader.tsx            # Results count
│   ├── ProjectEmptyState.tsx               # Empty state
│   └── ProjectPagination.tsx               # Pagination
├── app/
│   ├── api/projects/route.ts               # API endpoint
│   └── projects/page.tsx                   # Main page
└── CAMPAIGN_ID_GUIDE.md                    # Campaign ID guide
```

## 7. TYPESCRIPT TYPES

Xem file: `src/types/project.ts`

Key types:
- `ProjectListItem`: Project data structure
- `ProjectFilters`: Filter parameters
- `ProjectListResponse`: API response
- `SortOption`: Sort options
- `CampaignType`, `CampaignStatus`, `CompletionState`: Enums

## 8. SEED DATA

Mock data: 35 dự án đa dạng
- Nhiều categories khác nhau
- Nhiều campaign types
- Trạng thái khác nhau
- Lượt xem, rating, progress khác nhau
- Ngày tạo từ 0-365 ngày trước

Xem file: `src/data/mock-projects.ts`

## 9. FILTER HELPERS

### Key Functions

#### `applyProjectFilters(projects, filters)`
Áp dụng tất cả filters lên danh sách dự án

#### `sortProjects(projects, sort)`
Sắp xếp dự án theo sort option

#### `paginateProjects(projects, page, limit)`
Phân trang kết quả

#### `getActiveFilters(filters)`
Lấy danh sách active filters để hiển thị chips

Xem file: `src/lib/project-filters.ts`

## 10. UI COMPONENTS

### ProjectSearchBar
- Large search input
- Clear button
- Placeholder: "Tìm theo mã dự án (CF-...) hoặc tên dự án"

### ProjectSortSelect
- Dropdown với 8 sort options
- Icon: ArrowUpDown

### ProjectFilterChips
- Hiển thị active filters dưới dạng chips
- Remove individual filter
- Clear all button

### ProjectAdvancedFilters
- Drawer từ bên phải
- Filters: category, campaign type, completion state, rating, time range, progress, featured
- Apply và Reset buttons

### ProjectCard
- Thumbnail với badges
- Campaign code
- Category & type
- Title & description
- Progress bar
- Stats: backers, views, rating
- Days remaining
- Creator info

### ProjectGrid
- Responsive grid: 1 col mobile, 2 cols tablet, 3 cols desktop

### ProjectEmptyState
- Icon + message
- Clear filters button nếu có filters

### ProjectPagination
- Previous/Next buttons
- Page numbers với ellipsis
- Disabled states

## 11. PAGE INTEGRATION

### Main Page: `/projects`

Flow:
1. Parse query params từ URL
2. Fetch data từ API
3. Display results
4. User interaction → Update filters → Update URL → Re-fetch

Features:
- URL sync (reload không mất filter)
- Loading states
- Empty states
- Responsive layout

Xem file: `src/app/projects/page.tsx`

## 12. EDGE CASES HANDLED

### Search
- Empty query → Show all
- Trim whitespace
- Case-insensitive
- Campaign code detection
- Partial match for title

### Filters
- Invalid values → Ignored
- Multiple filters → AND logic
- Filter change → Reset to page 1
- No results → Empty state

### Pagination
- Page out of range → Show page 1
- Total pages calculation
- Smooth scroll to top on page change

### URL
- Invalid query params → Ignored
- Missing params → Use defaults
- Share URL → Works correctly
- Browser back/forward → Works correctly

### API
- Error handling
- Loading states
- Response validation

### UI
- Mobile responsive
- Touch-friendly
- Keyboard accessible
- Loading skeletons
- Empty states

## 13. SUGGESTED IMPROVEMENTS

### Phase 2 Features
1. **Infinite Scroll**: Alternative to pagination
2. **Save Filters**: Save favorite filter combinations
3. **Recent Searches**: Show recent search history
4. **Trending Tags**: Show popular tags
5. **Map View**: Show projects on map (if location available)
6. **Compare Projects**: Compare multiple projects side-by-side
7. **Follow Projects**: Follow projects for updates
8. **Share Filters**: Share filter combinations via URL
9. **Export Results**: Export filtered results to CSV
10. **Advanced Search**: Boolean operators, exact match, exclude terms

### Performance Optimizations
1. **Debounce Search**: Debounce search input
2. **Cache Results**: Cache API responses
3. **Virtual Scrolling**: For large lists
4. **Image Lazy Loading**: Lazy load project images
5. **Prefetch**: Prefetch next page

### UX Improvements
1. **Filter Presets**: Quick filter presets (e.g., "Trending", "Ending Soon")
2. **Smart Suggestions**: Suggest filters based on search query
3. **Filter Count**: Show count for each filter option
4. **Keyboard Shortcuts**: Keyboard navigation
5. **Dark Mode**: Dark mode support

### Analytics
1. **Track Searches**: Track popular searches
2. **Track Filters**: Track popular filter combinations
3. **Track Clicks**: Track which projects get clicked
4. **A/B Testing**: Test different layouts

## USAGE EXAMPLES

### Basic Search
```
/projects?q=robot
```

### Filter by Category
```
/projects?category=Công nghệ
```

### Multiple Filters
```
/projects?category=Công nghệ&campaignType=REWARD&completionState=ONGOING&ratingMin=4
```

### Sort + Filter
```
/projects?sort=most_viewed&category=Nghệ thuật&progressMin=50
```

### Pagination
```
/projects?page=2&limit=12
```

## API USAGE

### Request
```
GET /api/projects?q=robot&sort=most_viewed&category=Công nghệ&page=1&limit=12
```

### Response
```json
{
  "items": [...],
  "total": 35,
  "page": 1,
  "limit": 12,
  "totalPages": 3,
  "appliedFilters": {
    "q": "robot",
    "sort": "most_viewed",
    "category": "Công nghệ",
    "page": 1,
    "limit": 12
  }
}
```

## TESTING

### Manual Testing Checklist
- [ ] Search by campaign code
- [ ] Search by project title
- [ ] Apply single filter
- [ ] Apply multiple filters
- [ ] Change sort option
- [ ] Remove individual filter
- [ ] Clear all filters
- [ ] Navigate pages
- [ ] Reload page (filters persist)
- [ ] Share URL (filters work)
- [ ] Browser back/forward
- [ ] Mobile responsive
- [ ] Empty state
- [ ] Loading state

### Test URLs
```
# All projects
/projects

# Search
/projects?q=CF-20260416-ABC12
/projects?q=robot

# Filters
/projects?category=Công nghệ
/projects?campaignType=REWARD
/projects?completionState=ONGOING
/projects?ratingMin=4
/projects?createdWithin=30d
/projects?progressMin=50&progressMax=100
/projects?isFeatured=true

# Sort
/projects?sort=most_viewed
/projects?sort=top_rated
/projects?sort=ending_soon

# Pagination
/projects?page=2
/projects?page=3&limit=24

# Combined
/projects?q=robot&sort=most_viewed&category=Công nghệ&completionState=ONGOING&page=1
```

## DEPLOYMENT NOTES

1. Mock data hiện tại dùng cho development
2. Production: thay thế mock data bằng database queries
3. API endpoint `/api/projects` cần connect với Prisma
4. Cân nhắc caching cho performance
5. Monitor API response time
6. Set up error tracking (Sentry)
7. Add analytics tracking

## MAINTENANCE

### Adding New Filter
1. Add to `ProjectFilters` type
2. Add parsing logic in `project-query-params.ts`
3. Add filter logic in `project-filters.ts`
4. Add UI in `ProjectAdvancedFilters.tsx`
5. Update documentation

### Adding New Sort Option
1. Add to `SortOption` type
2. Add sort logic in `project-filters.ts`
3. Add to `ProjectSortSelect.tsx`
4. Update documentation

### Updating Mock Data
Edit `src/data/mock-projects.ts`

## SUPPORT

Nếu có vấn đề:
1. Check browser console for errors
2. Check network tab for API calls
3. Verify query params in URL
4. Check TypeScript types
5. Review filter logic

## CONCLUSION

Hệ thống Project Discovery đã hoàn chỉnh với:
✅ Search theo mã số và tên
✅ Filter đa chiều
✅ Sort linh hoạt
✅ URL sync
✅ UI hiện đại
✅ Mobile-friendly
✅ TypeScript types đầy đủ
✅ Mock data để test
✅ Empty states và loading states
✅ Pagination
✅ Responsive design

Ready to use! 🚀
