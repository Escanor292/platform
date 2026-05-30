# Hướng dẫn triển khai hệ thống nâng cấp Creator

## ✅ Đã hoàn thành

### 1. Thêm nút "Nâng cấp Creator" vào menu
- ✅ Hiển thị cho tài khoản BACKER
- ✅ Tự động phân luồng: cá nhân → `/upgrade/individual`, doanh nghiệp → `/upgrade/organization`
- ✅ Vị trí: Dropdown menu trong NavbarNew.tsx

### 2. Trang nâng cấp cá nhân (`/upgrade/individual`)
- ✅ Tạo file: `src/app/upgrade/individual/page.tsx`
- ✅ Kiểm tra quyền: chỉ BACKER mới truy cập được
- ✅ Pre-fill dữ liệu đã có từ profile
- ✅ Form bao gồm:
  - Thông tin cá nhân (họ tên, ngày sinh, CCCD, ảnh CCCD)
  - Địa chỉ (thường trú, hiện tại)
  - Liên hệ (phone, email)
  - Thông tin Creator công khai (tên hiển thị, bio, website)
  - Thông tin thanh toán (tài khoản ngân hàng, mã số thuế)

## 🔨 Cần hoàn thành

### 3. Trang nâng cấp doanh nghiệp (`/upgrade/organization`)

Tạo file: `src/app/upgrade/organization/page.tsx` với các phần:

#### A. Thông tin pháp lý doanh nghiệp
- Tên pháp lý doanh nghiệp *
- Tên thương mại / tên hiển thị
- Loại hình doanh nghiệp * (dropdown: Công ty TNHH, Công ty cổ phần, Hộ kinh doanh, Tổ chức phi lợi nhuận)
- Mã số doanh nghiệp / mã số thuế *
- Ngày đăng ký kinh doanh *
- Quốc gia/khu vực đăng ký *
- Ngành nghề kinh doanh *
- Website doanh nghiệp

#### B. Giấy tờ doanh nghiệp
- Upload Giấy chứng nhận đăng ký doanh nghiệp *
- Upload Giấy phép kinh doanh (nếu có)
- Upload Giấy chứng nhận mã số thuế
- Upload Tài liệu chứng minh địa chỉ doanh nghiệp
- Upload Tài liệu chứng minh tài khoản ngân hàng doanh nghiệp

#### C. Địa chỉ doanh nghiệp
- Địa chỉ đăng ký kinh doanh *
- Địa chỉ hoạt động hiện tại (nếu khác)
- Quốc gia/tỉnh/thành phố *
- Email doanh nghiệp *
- Số điện thoại doanh nghiệp *

#### D. Người đại diện pháp luật
- Họ tên người đại diện *
- Chức vụ *
- Email *
- Số điện thoại *
- Upload Giấy tờ định danh của người đại diện *
- Quyền đại diện doanh nghiệp

#### E. Chủ sở hữu hưởng lợi / người kiểm soát
- Danh sách chủ sở hữu hưởng lợi (có thể thêm nhiều người)
  - Họ tên
  - Tỷ lệ sở hữu (%)
  - Giấy tờ định danh
- Người có quyền kiểm soát doanh nghiệp

#### F. Thông tin thanh toán / nhận tiền
- Tài khoản ngân hàng doanh nghiệp *
- Tên chủ tài khoản *
- Số tài khoản *
- Đơn vị tiền tệ *
- Quốc gia nhận thanh toán *

#### G. Thông tin Creator công khai
- Tên Creator công khai *
- Logo hoặc avatar thương hiệu
- Ảnh bìa
- Bio Creator *
- Danh mục nội dung
- Mô tả nội dung doanh nghiệp sẽ tạo
- Đối tượng người xem
- Link website / mạng xã hội

### 4. API Endpoint

Tạo file: `src/app/api/user/upgrade-creator/route.ts`

```typescript
POST /api/user/upgrade-creator
Body: {
  type: "individual" | "organization",
  // ... form data
}

Logic:
1. Kiểm tra user phải là BACKER
2. Validate dữ liệu
3. Lưu thông tin vào database:
   - Update User table
   - Create/Update KYCInfo
   - Thay đổi role từ BACKER → CREATOR_PENDING
4. Gửi email thông báo cho admin
5. Return success
```

### 5. API lấy thông tin profile

Tạo file: `src/app/api/user/profile/route.ts`

```typescript
GET /api/user/profile

Logic:
1. Lấy session
2. Query user data từ Prisma
3. Include KYCInfo nếu có
4. Return user data
```

### 6. Cập nhật Prisma Schema (nếu cần)

Kiểm tra xem các trường sau đã có trong schema chưa:
- User.displayName
- User.bio
- User.website
- User.bankAccount
- User.bankName
- KYCInfo (đã có đầy đủ)

### 7. Admin Dashboard - Duyệt Creator

Tạo trang: `src/app/dashboard/admin/creator-requests/page.tsx`

Chức năng:
- Hiển thị danh sách user có role = CREATOR_PENDING
- Xem chi tiết thông tin KYC
- Nút "Duyệt" → chuyển role thành CREATOR
- Nút "Từ chối" → giữ nguyên BACKER, gửi email lý do

### 8. Email Templates

Tạo các email template:
- Email xác nhận đã nhận yêu cầu nâng cấp
- Email thông báo được duyệt
- Email thông báo bị từ chối (kèm lý do)

### 9. Upload ảnh/file

Tích hợp Cloudinary để upload:
- Ảnh CCCD mặt trước/sau
- Giấy tờ doanh nghiệp
- Logo/Avatar
- Ảnh bìa

## 📝 Notes

- Tất cả trường có dấu `*` là bắt buộc
- Nếu user đã có thông tin (từ profile Backer), tự động pre-fill
- Validation phải chặt chẽ trước khi submit
- Lưu trữ file upload an toàn (Cloudinary)
- Log tất cả thay đổi vào AuditLog

## 🔐 Security

- Chỉ BACKER mới được nâng cấp
- CREATOR và ADMIN không thể truy cập trang upgrade
- Validate file upload (size, type)
- Sanitize input data
- Rate limiting cho API endpoint

## 🎨 UI/UX

- Progress indicator cho multi-step form
- Tooltip giải thích các trường
- Preview ảnh sau khi upload
- Confirmation modal trước khi submit
- Loading state rõ ràng
- Error handling tốt
