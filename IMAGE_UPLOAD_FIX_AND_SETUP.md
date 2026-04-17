# Image Upload Fix & Cloudinary Setup Guide

## ✅ Đã Sửa Xong

Fixed image upload functionality và cải thiện error handling.

---

## 🐛 Vấn Đề Đã Fix

1. **API response field mismatch**: API trả về `url` nhưng component expect `secure_url`
2. **Thiếu validation**: Không validate file type và size
3. **Error handling kém**: Chỉ có alert() đơn giản
4. **Thiếu config check**: Không kiểm tra Cloudinary credentials
5. **Không có visual feedback**: Không hiển thị error trong UI

---

## 🔧 Các Thay Đổi

### 1. API Route (`src/app/api/upload/route.ts`)

**Added**:
- ✅ File type validation (JPEG, PNG, WEBP, GIF only)
- ✅ File size validation (5MB max)
- ✅ Cloudinary config check
- ✅ Image optimization (auto quality, format, size limit)
- ✅ Return both `secure_url` and `url` for compatibility
- ✅ Better error messages

**Image Optimization**:
```typescript
transformation: [
  { width: 1920, height: 1080, crop: "limit" },
  { quality: "auto:good" },
  { fetch_format: "auto" } // WebP when supported
]
```

### 2. ImageUpload Component (`src/components/shared/ImageUpload.tsx`)

**Added**:
- ✅ Client-side validation (file type & size)
- ✅ Error state management
- ✅ Toast notifications (success/error)
- ✅ Visual error display with AlertCircle icon
- ✅ Handle both `secure_url` and `url` response formats
- ✅ Disable upload during processing
- ✅ Reset input after upload
- ✅ Clear error when removing image

**UI Improvements**:
- Red border when error
- Error message box below upload area
- Better loading state
- Success toast notification

---

## 🚀 Cloudinary Setup Guide

### Bước 1: Tạo Tài Khoản Cloudinary

1. Truy cập: https://cloudinary.com/users/register_free
2. Đăng ký tài khoản miễn phí
3. Verify email

### Bước 2: Lấy Credentials

1. Đăng nhập vào Cloudinary Dashboard
2. Vào **Dashboard** → **Account Details**
3. Copy 3 thông tin:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### Bước 3: Cấu Hình .env

Mở file `.env` (hoặc tạo mới từ `.env.example`) và điền:

```env
# --- Cloudinary (upload ảnh) ---
CLOUDINARY_CLOUD_NAME="your_cloud_name_here"
CLOUDINARY_API_KEY="your_api_key_here"
CLOUDINARY_API_SECRET="your_api_secret_here"
```

**Ví dụ**:
```env
CLOUDINARY_CLOUD_NAME="crowdfund-vn"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="abcdefghijklmnopqrstuvwxyz123456"
```

### Bước 4: Restart Server

```bash
# Stop server (Ctrl+C)
# Start lại
npm run dev
```

---

## 🧪 Testing Checklist

### Test Upload Success
- [ ] Click vào upload area
- [ ] Chọn file ảnh hợp lệ (JPG, PNG, WEBP < 5MB)
- [ ] Thấy "Đang tải lên..." spinner
- [ ] Thấy toast "Tải ảnh lên thành công!"
- [ ] Ảnh hiển thị preview
- [ ] Click X để xóa ảnh

### Test Validation
- [ ] Upload file không phải ảnh (PDF, DOCX) → Error: "Chỉ chấp nhận file ảnh"
- [ ] Upload ảnh > 5MB → Error: "Kích thước file tối đa 5MB"
- [ ] Error message hiển thị dưới upload area với icon đỏ

### Test Error Cases
- [ ] Không config Cloudinary → Error: "Upload service not configured"
- [ ] Network error → Error: "Tải ảnh lên thất bại"
- [ ] Unauthorized (not logged in) → Error: "Unauthorized"

---

## 📋 Validation Rules

### File Type
- ✅ Allowed: JPEG, JPG, PNG, WEBP, GIF
- ❌ Not allowed: PDF, DOCX, SVG, etc.

### File Size
- ✅ Max: 5MB (5,242,880 bytes)
- ❌ Larger files rejected

### Image Optimization
- Max dimensions: 1920x1080 (auto-scaled if larger)
- Quality: Auto-optimized by Cloudinary
- Format: Auto-converted to WebP when supported

---

## 🎯 API Response Format

### Success Response
```json
{
  "secure_url": "https://res.cloudinary.com/...",
  "url": "https://res.cloudinary.com/...",
  "publicId": "crowdfund-vn/abc123",
  "width": 1920,
  "height": 1080,
  "format": "jpg"
}
```

### Error Response
```json
{
  "error": "File too large. Maximum size is 5MB."
}
```

---

## 🔍 Troubleshooting

### Lỗi: "Upload service not configured"
**Nguyên nhân**: Thiếu Cloudinary credentials trong .env
**Giải pháp**: 
1. Check file `.env` có tồn tại không
2. Check 3 biến CLOUDINARY_* đã điền chưa
3. Restart server

### Lỗi: "Unauthorized"
**Nguyên nhân**: User chưa đăng nhập
**Giải pháp**: Đăng nhập trước khi upload

### Lỗi: "Invalid file type"
**Nguyên nhân**: File không phải ảnh
**Giải pháp**: Chỉ upload JPG, PNG, WEBP, GIF

### Lỗi: "File too large"
**Nguyên nhân**: File > 5MB
**Giải pháp**: 
1. Resize ảnh trước khi upload
2. Compress ảnh bằng tool online (TinyPNG, Squoosh)

### Upload chậm
**Nguyên nhân**: File size lớn hoặc mạng chậm
**Giải pháp**: 
1. Compress ảnh trước
2. Check internet connection
3. Cloudinary free tier có limit bandwidth

---

## 💡 Best Practices

### For Users
1. Resize ảnh về kích thước hợp lý trước khi upload (1920x1080 max)
2. Compress ảnh để giảm file size
3. Dùng format WebP hoặc JPG (tránh PNG cho ảnh lớn)

### For Developers
1. Always validate on both client and server
2. Show clear error messages
3. Provide visual feedback during upload
4. Handle all error cases gracefully
5. Log errors for debugging

---

## 📊 Cloudinary Free Tier Limits

- Storage: 25GB
- Bandwidth: 25GB/month
- Transformations: 25,000/month
- Images: Unlimited

**Đủ cho development và small-scale production!**

---

## 🎉 Summary

**Fixed**:
- ✅ API response field mismatch
- ✅ Missing validation
- ✅ Poor error handling
- ✅ No config check
- ✅ No visual feedback

**Added**:
- ✅ File type & size validation
- ✅ Image optimization
- ✅ Toast notifications
- ✅ Error display in UI
- ✅ Better error messages
- ✅ Cloudinary config check

**Files Changed**:
- `src/app/api/upload/route.ts`
- `src/components/shared/ImageUpload.tsx`

---

**Status**: ✅ Complete - Ready to use after Cloudinary setup
**Next Step**: Configure Cloudinary credentials in `.env`
