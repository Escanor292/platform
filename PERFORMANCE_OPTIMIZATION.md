# Tối ưu Performance - Crowdfunding VN

## Các vấn đề đã được khắc phục

### 1. Bundle Size Optimization
- ✅ Thêm `optimizePackageImports` cho các thư viện lớn (lucide-react, @tiptap, framer-motion)
- ✅ Cấu hình code splitting tốt hơn trong webpack
- ✅ Loại bỏ console.log trong production

### 2. Component Optimization
- ✅ Thêm `React.memo` cho PledgeForm để tránh re-render không cần thiết
- ✅ Sử dụng `useMemo` và `useCallback` cho các tính toán phức tạp
- ✅ Tối ưu polling trong SePayQRModal (interval tăng dần: 3s -> 5s -> 10s)

### 3. Performance Utilities
- ✅ Tạo file `src/lib/performance.ts` với debounce và throttle helpers

## Các bước tiếp theo để cải thiện thêm

### 1. Lazy Loading Components
Thêm lazy loading cho các components nặng:

```typescript
// Ví dụ trong page.tsx
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/editor/RichTextEditor'), {
  loading: () => <div>Đang tải editor...</div>,
  ssr: false
});

const SePayQRModal = dynamic(() => import('@/components/payment/SePayQRModal'), {
  ssr: false
});
```

### 2. Image Optimization
- Sử dụng Next.js Image component thay vì <img>
- Thêm blur placeholder cho images
- Lazy load images ngoài viewport

```typescript
import Image from 'next/image';

<Image
  src={campaign.image}
  alt={campaign.title}
  width={400}
  height={300}
  placeholder="blur"
  blurDataURL="data:image/..."
  loading="lazy"
/>
```

### 3. API Route Caching
Thêm caching cho API routes:

```typescript
// app/api/campaigns/route.ts
export const revalidate = 60; // Cache 60 giây

// Hoặc dùng Next.js cache
import { unstable_cache } from 'next/cache';

const getCampaigns = unstable_cache(
  async () => {
    return await prisma.campaign.findMany();
  },
  ['campaigns'],
  { revalidate: 60 }
);
```

### 4. Database Query Optimization
- Thêm indexes cho các trường thường query
- Sử dụng `select` để chỉ lấy fields cần thiết
- Implement pagination đúng cách

```prisma
// schema.prisma
model Campaign {
  id String @id @default(cuid())
  slug String @unique
  title String
  
  @@index([status, endDate])
  @@index([createdAt])
}
```

### 5. Debounce Search Input
Áp dụng debounce cho search:

```typescript
import { debounce } from '@/lib/performance';

const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    updateFilters({ q: query });
  }, 500),
  [updateFilters]
);
```

### 6. Reduce Client Components
Chuyển các components không cần interactivity về Server Components:

- StatsSection -> không cần "use client"
- ProjectCard -> có thể tách phần static ra server component
- CampaignGrowthProgress -> nếu chỉ hiển thị có thể dùng server component

### 7. Prefetch Links
Sử dụng prefetch cho navigation:

```typescript
<Link href="/campaigns/[slug]" prefetch={true}>
  {campaign.title}
</Link>
```

### 8. Web Vitals Monitoring
Thêm monitoring để track performance:

```typescript
// app/layout.tsx
export function reportWebVitals(metric: any) {
  console.log(metric);
  // Gửi lên analytics service
}
```

## Checklist Tối Ưu

- [x] Optimize bundle size
- [x] Add React.memo to heavy components
- [x] Optimize polling intervals
- [x] Add performance utilities
- [ ] Implement lazy loading
- [ ] Optimize images
- [ ] Add API caching
- [ ] Add database indexes
- [ ] Debounce search inputs
- [ ] Convert to server components where possible
- [ ] Add prefetch to links
- [ ] Setup web vitals monitoring

## Đo lường Performance

Chạy các lệnh sau để kiểm tra:

```bash
# Build và analyze bundle
npm run build

# Lighthouse audit
npx lighthouse http://localhost:3000 --view

# Bundle analyzer
npm install -D @next/bundle-analyzer
```

## Kết quả mong đợi

Sau khi áp dụng các tối ưu:
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- Total Blocking Time (TBT): < 200ms
- Cumulative Layout Shift (CLS): < 0.1
