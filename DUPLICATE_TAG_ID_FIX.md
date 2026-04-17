# Duplicate Tag ID Fix - Summary

## ✅ Đã Sửa Xong

Fixed duplicate tag ID `"one-time"` trong taxonomy data.

---

## 🐛 Vấn Đề

**Error**: React warning về duplicate keys
```
Encountered two children with the same key, `one-time`. 
Keys should be unique so that components maintain their identity across updates.
```

**Root Cause**: Có 2 tags với cùng ID `"one-time"` trong `ALL_STARTER_TAGS_RAW`:

1. **Line 60** - Group "Định dạng phát hành":
   ```typescript
   { id: "one-time", label: "One-time", group: "Định dạng phát hành" }
   ```
   Ý nghĩa: One-time purchase (mua một lần, không subscription)

2. **Line 185** - Group "Thời gian":
   ```typescript
   { id: "one-time", label: "One-time", group: "Thời gian" }
   ```
   Ý nghĩa: One-time event (sự kiện một lần, không lặp lại)

---

## 🔧 Giải Pháp

Đổi ID của tag trong group "Thời gian" từ `"one-time"` thành `"one-time-event"` để phân biệt rõ ràng.

### Changes Made

1. **src/data/taxonomy.ts - Line 185**:
   ```typescript
   // Before
   { id: "one-time", label: "One-time", group: "Thời gian" }
   
   // After
   { id: "one-time-event", label: "One-time", group: "Thời gian" }
   ```

2. **src/data/taxonomy.ts - Line 379** (Giáo dục category):
   ```typescript
   // Before
   ["short-term", "long-term", "ongoing", "seasonal", "one-time"]
   
   // After
   ["short-term", "long-term", "ongoing", "seasonal", "one-time-event"]
   ```

3. **src/data/taxonomy.ts - Line 797** (Xã hội category):
   ```typescript
   // Before
   ["urgent", "short-term", "long-term", "ongoing", "one-time"]
   
   // After
   ["urgent", "short-term", "long-term", "ongoing", "one-time-event"]
   ```

---

## 📋 Tag IDs After Fix

### "Định dạng phát hành" Group
- `"one-time"` - One-time purchase/payment model ✅

### "Thời gian" Group
- `"one-time-event"` - One-time event/occurrence ✅

---

## ✅ Verification

- [ ] No duplicate IDs in `ALL_STARTER_TAGS_RAW`
- [ ] React warning về duplicate keys không còn xuất hiện
- [ ] Tags hiển thị đúng trong UI
- [ ] Không có TypeScript errors

---

## 📝 Notes

**Why "one-time-event" instead of other names?**
- Descriptive: Rõ ràng đây là về timeline/event
- Consistent: Giữ label "One-time" như cũ, chỉ đổi ID
- No breaking changes: Tag trong "Định dạng phát hành" giữ nguyên ID

**Impact**:
- Minimal: Chỉ ảnh hưởng đến campaigns đã chọn tag "one-time" trong group "Thời gian"
- Database: Nếu có data cũ với ID "one-time" trong context thời gian, cần migration

---

## 🚀 Testing

1. Navigate to Create Campaign page
2. Select a main category (e.g., Giáo dục)
3. Open "Thời gian" tag group
4. Verify no duplicate key warnings in console
5. Verify all tags render correctly

---

**Status**: ✅ Fixed
**Files Changed**: `src/data/taxonomy.ts`
**Lines Changed**: 3 locations (tag definition + 2 filter arrays)
