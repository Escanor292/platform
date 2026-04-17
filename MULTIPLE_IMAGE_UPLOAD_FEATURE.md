# Multiple Image Upload Feature - Implementation Summary

## ✅ Đã Hoàn Thành

Thêm tính năng upload nhiều ảnh cho campaign, tương tự như phần chỉnh sửa dự án.

---

## 🎯 Features

### 1. Multiple Images Support
- ✅ Upload tối đa 10 ảnh
- ✅ Hiển thị dạng gallery grid (2-4 columns responsive)
- ✅ Ảnh đầu tiên tự động làm ảnh bìa chính
- ✅ Có thể chọn ảnh bất kỳ làm ảnh bìa

### 2. Main Image (Cover Image)
- ✅ Ảnh bìa có badge "Ảnh bìa" với icon ngôi sao
- ✅ Click icon ngôi sao trên ảnh khác để đổi ảnh bìa
- ✅ Khi xóa ảnh bìa, ảnh đầu tiên còn lại tự động thành ảnh bìa

### 3. Image Management
- ✅ Xóa từng ảnh riêng lẻ
- ✅ Hover để hiện actions (set main, delete)
- ✅ Upload thêm ảnh mới (nếu chưa đủ 10)
- ✅ Counter hiển thị số ảnh (e.g., "3/10 ảnh")

### 4. Validation & Error Handling
- ✅ Validate file type (JPG, PNG, WEBP, GIF)
- ✅ Validate file size (max 5MB)
- ✅ Check max images limit (10)
- ✅ Toast notifications cho mọi action
- ✅ Visual error display

---

## 📁 Files Created/Modified

### New File: `src/components/shared/MultipleImageUpload.tsx`

**Component Props**:
```typescript
interface MultipleImageUploadProps {
  images: string[];              // Array of image URLs
  onChange: (images: string[]) => void;
  mainImage?: string;            // Current main/cover image URL
  onMainImageChange?: (url: string) => void;
  maxImages?: number;            // Default: 10
  className?: string;
  label?: string;
}
```

**Key Features**:
- Gallery grid display
- Upload button (when < maxImages)
- Main image indicator with star badge
- Hover overlay with actions
- Error handling & validation
- Toast notifications

### Modified: `src/app/campaigns/create/page.tsx`

**Changes**:
1. Added `images: []` to formData state
2. Imported `MultipleImageUpload` component
3. Replaced single `ImageUpload` with `MultipleImageUpload`
4. Connected `images` and `imageUrl` (main image) state

**State Structure**:
```typescript
const [formData, setFormData] = useState({
  // ... other fields
  imageUrl: "",           // Main/cover image URL
  images: [] as string[], // All images array
});
```

---

## 🎨 UI/UX Design

### Gallery Grid
- **Mobile**: 2 columns
- **Tablet**: 3 columns  
- **Desktop**: 4 columns
- **Aspect ratio**: Square (1:1)
- **Spacing**: 12px gap
- **Border**: 2px gray, hover blue

### Main Image Badge
- **Position**: Top-left corner
- **Style**: Blue background, white text
- **Icon**: Filled star
- **Text**: "Ảnh bìa"

### Hover Actions
- **Overlay**: Black 50% opacity
- **Buttons**: 
  - Star icon (blue) - Set as main
  - X icon (red) - Delete
- **Transition**: Smooth fade in/out

### Upload Button
- **Style**: Dashed border, hover effect
- **Icon**: Upload icon
- **Text**: "Thêm ảnh"
- **Helper**: "PNG, JPG, WEBP (Max 5MB)"

---

## 🔄 User Flow

### Upload First Image
1. Click "Thêm ảnh" button
2. Select image file
3. See loading spinner
4. Image appears in gallery
5. Automatically set as main image (ảnh bìa)
6. Toast: "Tải ảnh lên thành công!"

### Upload More Images
1. Click "Thêm ảnh" button again
2. Select another image
3. Image added to gallery
4. Main image stays the same
5. Counter updates (e.g., "2/10 ảnh")

### Change Main Image
1. Hover over any image (not current main)
2. Click star icon
3. Badge moves to that image
4. Toast: "Đã đặt làm ảnh bìa chính"

### Delete Image
1. Hover over any image
2. Click X icon
3. Image removed from gallery
4. If was main image, first remaining becomes main
5. Toast: "Đã xóa ảnh"

### Validation Errors
- **Wrong file type**: Toast + error box below
- **File too large**: Toast + error box below
- **Max images reached**: Toast + error box below

---

## 🧪 Testing Checklist

### Upload Flow
- [ ] Upload first image → becomes main image automatically
- [ ] Upload second image → main image stays first
- [ ] Upload up to 10 images → all display correctly
- [ ] Try upload 11th image → error: "Tối đa 10 ảnh"

### Main Image Management
- [ ] First image has "Ảnh bìa" badge
- [ ] Hover other images → star icon appears
- [ ] Click star → badge moves to that image
- [ ] Delete main image → first remaining becomes main

### Delete Flow
- [ ] Delete non-main image → works, main stays same
- [ ] Delete main image → first remaining becomes main
- [ ] Delete all images → upload button reappears
- [ ] Counter updates correctly after delete

### Validation
- [ ] Upload PDF → error: "Chỉ chấp nhận file ảnh"
- [ ] Upload 6MB image → error: "Kích thước file tối đa 5MB"
- [ ] Upload when at max → error: "Tối đa 10 ảnh"

### Responsive
- [ ] Mobile: 2 columns grid
- [ ] Tablet: 3 columns grid
- [ ] Desktop: 4 columns grid
- [ ] All actions work on touch devices

---

## 💾 Data Structure

### Form Data
```typescript
{
  imageUrl: "https://cloudinary.com/image1.jpg",  // Main image
  images: [
    "https://cloudinary.com/image1.jpg",           // Same as imageUrl
    "https://cloudinary.com/image2.jpg",
    "https://cloudinary.com/image3.jpg"
  ]
}
```

### API Payload (when submitting campaign)
```json
{
  "title": "Campaign Title",
  "imageUrl": "https://cloudinary.com/image1.jpg",
  "images": [
    "https://cloudinary.com/image1.jpg",
    "https://cloudinary.com/image2.jpg",
    "https://cloudinary.com/image3.jpg"
  ]
}
```

---

## 🔧 Technical Details

### State Management
- `images`: Array of all image URLs
- `imageUrl`: Current main/cover image URL
- `onChange`: Updates images array
- `onMainImageChange`: Updates main image URL

### Image Upload Process
1. User selects file
2. Client-side validation (type, size, count)
3. Upload to `/api/upload`
4. Receive Cloudinary URL
5. Add to `images` array
6. If first image, set as `imageUrl`

### Main Image Logic
```typescript
// Set first image as main
if (images.length === 0 && onMainImageChange) {
  onMainImageChange(imageUrl);
}

// When deleting main image
if (imageToRemove === mainImage && onMainImageChange) {
  onMainImageChange(newImages[0] || "");
}
```

---

## 🎯 Benefits

### For Users
1. **Better showcase**: Multiple angles/views of project
2. **Professional**: Gallery looks more complete
3. **Flexibility**: Choose best image as cover
4. **Easy management**: Simple drag-free interface

### For Platform
1. **Higher quality**: More visual content
2. **Better engagement**: More images = more interest
3. **Consistent UX**: Same as edit page
4. **Professional appearance**: Matches modern crowdfunding platforms

---

## 📊 Comparison

### Before (Single Image)
- ❌ Only 1 image
- ❌ Can't show multiple views
- ❌ Limited visual appeal
- ❌ Different from edit page

### After (Multiple Images)
- ✅ Up to 10 images
- ✅ Gallery showcase
- ✅ Choose main image
- ✅ Consistent with edit page
- ✅ Professional appearance

---

## 🚀 Future Enhancements (Optional)

1. **Drag & Drop Reordering**: Rearrange images by dragging
2. **Image Cropping**: Built-in crop tool
3. **Bulk Upload**: Select multiple files at once
4. **Image Captions**: Add description to each image
5. **Lazy Loading**: Load images on scroll for performance

---

## 📝 Notes

### Database Schema
Ensure your Campaign model has:
```prisma
model Campaign {
  // ...
  imageUrl  String?   // Main/cover image
  images    String[]  // Array of all images
  // ...
}
```

### Backward Compatibility
- Old campaigns with only `imageUrl` still work
- `images` array defaults to empty `[]`
- If `images` is empty, falls back to `imageUrl`

---

**Status**: ✅ Complete
**Files Changed**: 2 (1 new, 1 modified)
**Lines Added**: ~300
**Feature Parity**: Matches edit page functionality
