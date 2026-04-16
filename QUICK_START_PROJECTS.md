# Quick Start - Project Discovery System

## ✅ Đã hoàn thành

Hệ thống khám phá dự án đã được tích hợp hoàn chỉnh vào navigation!

## 🚀 Truy cập ngay

### Desktop Navigation
```
Trang chủ | Giới thiệu | Chiến dịch | Khám phá | Dashboard
                                        ↑
                                    Link mới!
```

### URLs để test

#### 1. Trang chính
```
http://localhost:3000/projects
```

#### 2. Tìm kiếm theo mã dự án
```
http://localhost:3000/projects?q=CF-20260416
```

#### 3. Tìm kiếm theo tên
```
http://localhost:3000/projects?q=robot
http://localhost:3000/projects?q=giáo dục
```

#### 4. Lọc theo danh mục
```
http://localhost:3000/projects?category=Công nghệ
http://localhost:3000/projects?category=Giáo dục
http://localhost:3000/projects?category=Y tế
```

#### 5. Lọc theo loại campaign
```
http://localhost:3000/projects?campaignType=REWARD
http://localhost:3000/projects?campaignType=DONATION
```

#### 6. Lọc theo trạng thái
```
http://localhost:3000/projects?completionState=ONGOING
http://localhost:3000/projects?completionState=GOAL_REACHED
```

#### 7. Sắp xếp
```
http://localhost:3000/projects?sort=most_viewed
http://localhost:3000/projects?sort=top_rated
http://localhost:3000/projects?sort=ending_soon
http://localhost:3000/projects?sort=highest_progress
```

#### 8. Lọc theo đánh giá
```
http://localhost:3000/projects?ratingMin=4
http://localhost:3000/projects?ratingMin=5
```

#### 9. Lọc theo thời gian
```
http://localhost:3000/projects?createdWithin=7d
http://localhost:3000/projects?createdWithin=30d
http://localhost:3000/projects?createdWithin=90d
```

#### 10. Lọc theo tiến độ
```
http://localhost:3000/projects?progressMin=50
http://localhost:3000/projects?progressMin=75&progressMax=100
http://localhost:3000/projects?progressMin=100
```

#### 11. Chỉ dự án nổi bật
```
http://localhost:3000/projects?isFeatured=true
```

#### 12. Kết hợp nhiều filter
```
http://localhost:3000/projects?category=Công nghệ&campaignType=REWARD&completionState=ONGOING&ratingMin=4&sort=most_viewed
```

#### 13. Phân trang
```
http://localhost:3000/projects?page=2
http://localhost:3000/projects?page=3
```

## 🎨 UI Features

### Search Bar
- Placeholder: "Tìm theo mã dự án (CF-...) hoặc tên dự án"
- Clear button (X)
- Auto-detect campaign code

### Sort Dropdown
- Mới nhất
- Nhiều lượt xem
- Đánh giá cao
- Nhiều người ủng hộ
- Tiến độ cao
- Sắp kết thúc
- Mới cập nhật
- Cũ nhất

### Advanced Filters Button
Click để mở drawer với:
- Danh mục (10 categories)
- Loại chiến dịch (5 types)
- Trạng thái (6 states)
- Đánh giá (3+, 4+, 5 sao)
- Thời gian tạo (7d, 30d, 90d, 365d)
- Tiến độ gây quỹ (5 ranges)
- Chỉ dự án nổi bật (checkbox)

### Active Filters Chips
- Hiển thị tất cả filters đang active
- Click X để remove từng filter
- Button "Xóa tất cả"

### Project Cards
Mỗi card hiển thị:
- ✅ Thumbnail
- ✅ Campaign code (CF-YYYYMMDD-XXXXX)
- ✅ Completion state badge
- ✅ Featured badge (nếu có)
- ✅ Category & Campaign type
- ✅ Title
- ✅ Description
- ✅ Progress bar
- ✅ Funding amount
- ✅ Stats: backers, views, rating
- ✅ Days remaining
- ✅ Creator info

### Empty State
- Icon + message
- "Xóa tất cả bộ lọc" button

### Pagination
- Previous/Next buttons
- Page numbers với ellipsis
- Smooth scroll to top

## 📱 Mobile Responsive

Tất cả components đều responsive:
- Search bar: full width
- Sort & Filters: stack vertically
- Grid: 1 column mobile, 2 tablet, 3 desktop
- Advanced filters: full screen drawer
- Touch-friendly buttons

## 🔍 Search Logic

### Campaign Code Detection
Nếu query match pattern: `CF-YYYYMMDD-XXXXX`
→ Ưu tiên search theo campaign code

### Title Search
- Partial match
- Case-insensitive
- Trim whitespace

### Examples
```
"CF-20260416" → Search by code
"robot" → Search by title
"giáo dục" → Search by title
"CF 20260416 ABC12" → Search by code (ignore spaces/dashes)
```

## 🎯 Filter Logic

### AND Logic
Tất cả filters được kết hợp bằng AND:
```
category=Công nghệ AND campaignType=REWARD AND ratingMin=4
```

### Sort Priority
Sort được áp dụng sau khi filter:
```
Filter → Sort → Paginate
```

### Page Reset
Khi thay đổi filter → Reset về page 1

## 📊 Mock Data

35 dự án mock với:
- ✅ Đa dạng categories
- ✅ Đa dạng campaign types
- ✅ Đa dạng completion states
- ✅ Lượt xem: 100 - 5000
- ✅ Rating: 3.0 - 5.0
- ✅ Progress: 0% - 150%
- ✅ Ngày tạo: 0-365 ngày trước
- ✅ Featured: ~20% projects

## 🧪 Testing Checklist

### Basic Features
- [ ] Click "Khám phá" trong navigation
- [ ] Trang load với 12 projects
- [ ] Search by campaign code
- [ ] Search by title
- [ ] Change sort option
- [ ] Click "Bộ lọc" button
- [ ] Apply filters
- [ ] Remove individual filter chip
- [ ] Clear all filters
- [ ] Navigate to page 2
- [ ] Click on project card → Go to detail page

### URL Sync
- [ ] Reload page → Filters persist
- [ ] Copy URL → Share → Filters work
- [ ] Browser back → Previous filters
- [ ] Browser forward → Next filters

### Mobile
- [ ] Open on mobile
- [ ] Search works
- [ ] Sort dropdown works
- [ ] Advanced filters drawer opens
- [ ] Cards display correctly
- [ ] Pagination works

### Edge Cases
- [ ] Empty search → Show all
- [ ] No results → Empty state
- [ ] Invalid page number → Show page 1
- [ ] Multiple filters → AND logic
- [ ] Featured only → Show featured projects

## 🎨 Design Tokens

### Colors
- Primary: Blue (#2563eb)
- Success: Green (#10b981)
- Warning: Yellow (#f59e0b)
- Danger: Red (#ef4444)
- Gray scale: 50-900

### Typography
- Heading: font-black, tracking-tight
- Body: font-medium
- Small: text-xs, text-sm
- Code: font-mono

### Spacing
- Card gap: 6 (1.5rem)
- Section gap: 8-12 (2-3rem)
- Padding: 5-6 (1.25-1.5rem)

### Border Radius
- Small: rounded-lg (0.5rem)
- Medium: rounded-xl (0.75rem)
- Large: rounded-2xl (1rem)
- Extra: rounded-3xl (1.5rem)

## 🚀 Next Steps

### Phase 1 (Current) ✅
- [x] Search & Filter
- [x] Sort options
- [x] URL sync
- [x] Pagination
- [x] Responsive UI
- [x] Mock data

### Phase 2 (Future)
- [ ] Connect to real database
- [ ] Infinite scroll option
- [ ] Save filters
- [ ] Recent searches
- [ ] Trending tags
- [ ] Map view
- [ ] Compare projects
- [ ] Export results

### Phase 3 (Advanced)
- [ ] AI-powered recommendations
- [ ] Personalized feed
- [ ] Follow projects
- [ ] Email alerts
- [ ] Advanced analytics

## 📝 Notes

### Mock Data Location
```
src/data/mock-projects.ts
```

### API Endpoint
```
GET /api/projects
```

### Main Page
```
src/app/projects/page.tsx
```

### Components
```
src/components/projects/
├── ProjectSearchBar.tsx
├── ProjectSortSelect.tsx
├── ProjectFilterChips.tsx
├── ProjectAdvancedFilters.tsx
├── ProjectCard.tsx
├── ProjectGrid.tsx
├── ProjectResultsHeader.tsx
├── ProjectEmptyState.tsx
└── ProjectPagination.tsx
```

## 🐛 Troubleshooting

### Issue: Page not found
**Solution**: Make sure you're running the dev server
```bash
npm run dev
```

### Issue: No projects showing
**Solution**: Check browser console for errors

### Issue: Filters not working
**Solution**: Check URL query params in browser address bar

### Issue: Styles not loading
**Solution**: Make sure Tailwind is configured correctly

### Issue: TypeScript errors
**Solution**: Run type check
```bash
npm run type-check
```

## 📚 Documentation

Xem thêm:
- `PROJECT_DISCOVERY_GUIDE.md` - Hướng dẫn chi tiết
- `CAMPAIGN_ID_GUIDE.md` - Hướng dẫn Campaign ID
- `README.md` - Project overview

## 🎉 Ready to Use!

Hệ thống đã sẵn sàng! Truy cập:
```
http://localhost:3000/projects
```

Hoặc click "Khám phá" trong navigation header.

Happy coding! 🚀
