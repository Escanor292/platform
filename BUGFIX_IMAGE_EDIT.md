# Fix: Ảnh không hiển thị khi chỉnh sửa dự án

## Vấn đề
Khi vào trang chỉnh sửa dự án, các ảnh đã upload trước đó không hiển thị trong form.

## Nguyên nhân
1. Field `images` từ database có thể là `null` hoặc `undefined` thay vì array rỗng
2. State initialization không xử lý đúng trường hợp này
3. Không có logging để debug

## Giải pháp đã áp dụng

### 1. Sửa CampaignEditForm.tsx
```typescript
// Trước:
images: campaign.images || [],
starterTags: [] as string[], // TODO: Load from campaign if stored

// Sau:
images: Array.isArray(campaign.images) ? campaign.images : [],
starterTags: (campaign.tags || []) as string[], // Load tags from campaign

// Thêm logging:
console.log("[CampaignEditForm] Initial data:", {
  imageUrl: campaign.imageUrl,
  images: campaign.images,
  formDataImages: Array.isArray(campaign.images) ? campaign.images : []
});
```

### 2. Sửa edit/[slug]/page.tsx
```typescript
// Thêm vào campaignData:
images: campaign.images || [], // Ensure images is always an array
tags: campaign.tags || [], // Ensure tags is always an array

// Thêm logging:
console.log("[EditCampaignPage] Campaign data:", {
  imageUrl: campaignData.imageUrl,
  images: campaignData.images,
  tags: campaignData.tags
});
```

## Cách test

### 1. Kiểm tra trong browser console
```bash
# Mở trang edit campaign
# Mở DevTools Console
# Tìm logs:
[EditCampaignPage] Campaign data: { imageUrl: "...", images: [...], tags: [...] }
[CampaignEditForm] Initial data: { imageUrl: "...", images: [...], formDataImages: [...] }
[MultipleImageUpload] Render - images: [...], mainImage: "..."
```

### 2. Kiểm tra database
```sql
-- Kiểm tra campaign có images không
SELECT id, slug, "imageUrl", images, tags 
FROM campaigns 
WHERE slug = 'your-campaign-slug';
```

### 3. Test flow hoàn chỉnh
1. Tạo campaign mới với ảnh
2. Vào trang edit
3. Kiểm tra ảnh có hiển thị không
4. Thêm ảnh mới
5. Lưu
6. Vào lại trang edit
7. Kiểm tra tất cả ảnh có hiển thị không

## Các trường hợp cần xử lý

### Case 1: Campaign mới (chưa có ảnh)
- `images` = `[]`
- `imageUrl` = `null` hoặc `""`
- ✅ Hiển thị upload button

### Case 2: Campaign có 1 ảnh
- `images` = `["url1"]`
- `imageUrl` = `"url1"`
- ✅ Hiển thị 1 ảnh với badge "Ảnh bìa"

### Case 3: Campaign có nhiều ảnh
- `images` = `["url1", "url2", "url3"]`
- `imageUrl` = `"url1"`
- ✅ Hiển thị tất cả ảnh
- ✅ Ảnh đầu tiên có badge "Ảnh bìa"

### Case 4: Database trả về null
- `images` = `null`
- ✅ Convert thành `[]`
- ✅ Không crash

## Debug tips

### Nếu vẫn không hiển thị ảnh:

1. **Check console logs**
   ```
   [EditCampaignPage] Campaign data: ...
   [CampaignEditForm] Initial data: ...
   [MultipleImageUpload] Render - images: ...
   ```

2. **Check Network tab**
   - Có request nào fail không?
   - Images URLs có đúng không?

3. **Check React DevTools**
   - Component `MultipleImageUpload` nhận props gì?
   - State `formData.images` có giá trị gì?

4. **Check database**
   ```sql
   SELECT images FROM campaigns WHERE slug = 'your-slug';
   ```

5. **Check Cloudinary URLs**
   - URLs có còn valid không?
   - Có bị expired không?

## Bonus: Load tags từ campaign

Trước đây tags không được load, giờ đã fix:
```typescript
starterTags: (campaign.tags || []) as string[]
```

Điều này giúp:
- Hiển thị đúng tags đã chọn khi edit
- Không mất tags khi save
- Validation taxonomy đúng

## Kết luận

Sau khi fix:
- ✅ Ảnh hiển thị đúng khi edit
- ✅ Tags hiển thị đúng khi edit
- ✅ Có logging để debug
- ✅ Xử lý edge cases (null, undefined)
- ✅ Không crash khi data không đúng format
