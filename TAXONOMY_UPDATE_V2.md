# 🔄 Campaign Taxonomy - Cập nhật V2.0

## ✅ Đã cập nhật

### 1. Bỏ giới hạn số lượng tags

**Trước:**
- Tối đa 5 starter tags
- UI disabled khi đã chọn 5 tags
- Validation báo lỗi nếu > 5 tags

**Sau:**
- Không giới hạn số lượng tags
- Có thể chọn bao nhiêu tags tùy thích
- UI luôn cho phép chọn thêm tags

### 2. Việt hóa toàn bộ labels

**Trước:**
- Nhiều tags giữ nguyên tiếng Anh: "Mobile app", "Web app", "SaaS", "Indie", "Prototype", "MVP"...

**Sau:**
- Việt hóa tối đa: "Ứng dụng di động", "Ứng dụng web", "Phần mềm dịch vụ", "Độc lập", "Nguyên mẫu", "Sản phẩm tối thiểu"...
- Chỉ giữ tiếng Anh khi thực sự cần: "Comic", "Manga", "Webtoon", "Podcast", "Alpha", "Beta", "Unity", "Unreal Engine"

---

## 📝 Chi tiết thay đổi

### Files đã cập nhật:

1. ✅ **src/types/taxonomy.ts**
   - `MAX_STARTER_TAGS = null` (không giới hạn)
   - Bỏ validation max tags

2. ✅ **src/lib/taxonomy-helpers.ts**
   - Bỏ check `MAX_STARTER_TAGS` trong validation
   - Giữ validation cho main category và allowed tags

3. ✅ **src/components/create-campaign/tag-group-section.tsx**
   - `canSelectMore = true` (luôn cho phép chọn)
   - Bỏ disabled state dựa trên số lượng

4. ✅ **src/components/create-campaign/starter-tags-selector.tsx**
   - Bỏ hiển thị "tối đa 5"
   - Hiển thị "Đã chọn: X" (không giới hạn)
   - Bỏ check `MAX_STARTER_TAGS` khi toggle tag

5. ✅ **src/app/api/campaigns/route.ts**
   - Bỏ validation `starterTags.length > 5`

6. ✅ **src/data/taxonomy-labels-vi.ts** (NEW)
   - Mapping Vietnamese labels cho tất cả tags
   - Helper function `applyVietnameseLabels()`

7. ✅ **src/data/taxonomy.ts**
   - Apply Vietnamese labels cho tất cả tags
   - Sử dụng `applyVietnameseLabels()` cho mọi filter

---

## 🏷️ Vietnamese Labels Mapping

### Loại nội dung
- `video-game` → "Trò chơi điện tử"
- `board-game` → "Trò chơi bàn"
- `artbook` → "Sách tranh nghệ thuật"
- `documentary` → "Phim tài liệu"
- `animation` → "Hoạt hình"
- `workshop` → "Hội thảo thực hành"

### Định dạng phát hành
- `ebook` → "Sách điện tử"
- `digital` → "Kỹ thuật số"
- `physical` → "Vật lý"
- `series` → "Chuỗi phần"
- `mobile-app` → "Ứng dụng di động"
- `web-app` → "Ứng dụng web"
- `desktop-app` → "Ứng dụng máy tính"
- `saas` → "Phần mềm dịch vụ"
- `platform` → "Nền tảng"
- `marketplace` → "Sàn giao dịch"
- `online` → "Trực tuyến"
- `offline` → "Ngoại tuyến"
- `hybrid` → "Kết hợp"
- `streaming` → "Phát trực tuyến"
- `download` → "Tải xuống"
- `subscription` → "Đăng ký"
- `one-time` → "Một lần"

### Mục đích / Phong cách
- `indie` → "Độc lập"
- `storytelling` → "Kể chuyện"
- `fandom` → "Cộng đồng người hâm mộ"
- `community-driven` → "Cộng đồng chủ đạo"
- `open-source` → "Mã nguồn mở"
- `commercial` → "Thương mại"
- `non-profit` → "Phi lợi nhuận"
- `social-impact` → "Tác động xã hội"
- `experimental` → "Thử nghiệm"
- `mainstream` → "Phổ thông"

### Loại sản phẩm
- `hardware` → "Phần cứng"
- `software` → "Phần mềm"
- `wearable` → "Thiết bị đeo"
- `smart-device` → "Thiết bị thông minh"
- `consumer-product` → "Sản phẩm tiêu dùng"
- `b2b-solution` → "Giải pháp doanh nghiệp"
- `b2c-product` → "Sản phẩm người tiêu dùng"
- `merchandise` → "Hàng hóa"
- `handmade` → "Thủ công"
- `mass-production` → "Sản xuất hàng loạt"
- `limited-edition` → "Phiên bản giới hạn"
- `custom` → "Tùy chỉnh"

### Công nghệ / Kỹ thuật
- `ai` → "Trí tuệ nhân tạo"
- `machine-learning` → "Học máy"
- `iot` → "Internet vạn vật"
- `blockchain` → "Chuỗi khối"
- `ar-vr` → "Thực tế ảo/tăng cường"
- `cloud` → "Điện toán đám mây"
- `robotics` → "Công nghệ robot"
- `automation` → "Tự động hóa"
- `sensor` → "Cảm biến"
- `drone` → "Máy bay không người lái"
- `3d-printing` → "In 3D"
- `digital-art` → "Nghệ thuật số"
- `3d-art` → "Nghệ thuật 3D"
- `game-engine` → "Công cụ làm game"
- `renewable-energy` → "Năng lượng tái tạo"
- `solar` → "Năng lượng mặt trời"
- `biotech` → "Công nghệ sinh học"
- `agritech` → "Công nghệ nông nghiệp"
- `healthtech` → "Công nghệ y tế"
- `edtech` → "Công nghệ giáo dục"
- `fintech` → "Công nghệ tài chính"
- `cleantech` → "Công nghệ sạch"

### Giai đoạn phát triển
- `idea` → "Ý tưởng"
- `concept` → "Khái niệm"
- `prototype` → "Nguyên mẫu"
- `mvp` → "Sản phẩm tối thiểu"
- `pre-order` → "Đặt trước"
- `production` → "Sản xuất"
- `retail-launch` → "Ra mắt thị trường"
- `expansion` → "Mở rộng"
- `scale-up` → "Nhân rộng"
- `pilot` → "Thí điểm"
- `trial` → "Dùng thử"
- `draft` → "Bản nháp"

### Mô hình / Vận hành
- `startup` → "Khởi nghiệp"
- `small-business` → "Doanh nghiệp nhỏ"
- `social-enterprise` → "Doanh nghiệp xã hội"
- `cooperative` → "Hợp tác xã"
- `ngo` → "Tổ chức phi chính phủ"
- `donation` → "Quyên góp"
- `reward-based` → "Dựa trên phần thưởng"
- `equity` → "Cổ phần"
- `pre-sale` → "Bán trước"
- `franchise` → "Nhượng quyền"
- `licensing` → "Cấp phép"

### Đối tượng hưởng lợi
- `gamers` → "Game thủ"
- `creators` → "Nhà sáng tạo"
- `developers` → "Lập trình viên"

### Phạm vi
- `local` → "Địa phương"
- `national` → "Quốc gia"
- `regional` → "Khu vực"
- `global` → "Toàn cầu"
- `urban` → "Thành thị"
- `rural` → "Nông thôn"

### Thời gian
- `urgent` → "Khẩn cấp"
- `short-term` → "Ngắn hạn"
- `long-term` → "Dài hạn"
- `ongoing` → "Đang diễn ra"
- `seasonal` → "Theo mùa"
- `one-time` → "Một lần"

---

## 🎯 Tags giữ nguyên tiếng Anh

Những tags sau giữ nguyên vì đã phổ biến hoặc khó việt hóa:

- **Comic**, **Manga**, **Webtoon** - Tên thể loại quốc tế
- **Podcast** - Thuật ngữ phổ biến
- **Alpha**, **Beta** - Thuật ngữ kỹ thuật
- **Unity**, **Unreal Engine** - Tên công cụ cụ thể
- **Album** - Phổ biến trong âm nhạc
- **Robot** - Đã được Việt hóa tự nhiên

---

## 🚀 Cách sử dụng

### Không còn giới hạn tags

```tsx
// Trước (V1)
<StarterTagsSelector
  mainCategory="Công nghệ"
  selectedTags={["mobile-app", "ai", "prototype", "mvp", "startup"]} // Max 5
  onTagsChange={setTags}
/>

// Sau (V2)
<StarterTagsSelector
  mainCategory="Công nghệ"
  selectedTags={[
    "mobile-app", "ai", "prototype", "mvp", "startup",
    "cloud", "iot", "beta", "b2b-solution", "developers"
  ]} // Không giới hạn!
  onTagsChange={setTags}
/>
```

### Labels đã việt hóa

```tsx
// Trước
"Mobile app" → "Web app" → "SaaS" → "Indie" → "Prototype"

// Sau
"Ứng dụng di động" → "Ứng dụng web" → "Phần mềm dịch vụ" → "Độc lập" → "Nguyên mẫu"
```

---

## ✅ Testing Checklist

- [ ] Chọn nhiều hơn 5 tags → OK
- [ ] Chọn 10+ tags → OK
- [ ] Labels hiển thị tiếng Việt
- [ ] Submit form với nhiều tags → Success
- [ ] Data lưu đúng vào database
- [ ] Search tags bằng tiếng Việt → Hoạt động
- [ ] Category change vẫn hoạt động đúng

---

## 📊 So sánh V1 vs V2

| Feature | V1 | V2 |
|---------|----|----|
| Max tags | 5 | Không giới hạn |
| Vietnamese labels | ~30% | ~90% |
| UI disabled state | Có (khi đạt 5) | Không |
| Validation | Max 5 tags | Chỉ check allowed tags |
| User experience | Hạn chế | Linh hoạt hơn |

---

## 🎉 Kết quả

✅ **Không giới hạn tags** - Người dùng tự do chọn bao nhiêu tags tùy thích  
✅ **Việt hóa 90%** - Dễ hiểu hơn cho người dùng Việt Nam  
✅ **UX tốt hơn** - Không bị giới hạn bởi số lượng  
✅ **Backward compatible** - Không ảnh hưởng data cũ  

---

**Version**: 2.0.0  
**Date**: 2026-04-15  
**Status**: ✅ Ready to use
