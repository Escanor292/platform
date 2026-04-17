# Date Input - Strict Validation Rules

## ✅ Đã Thêm Validation Chặt Chẽ

DateInput component giờ có validation logic chặt chẽ cho việc nhập ngày tháng năm.

---

## 🔒 Validation Rules

### 1. Day (Ngày)
- **Range**: 01-31
- **Auto-format**: Gõ `5` → Tự động thành `05/`
- **Limit**: Không cho nhập > 31
- **Smart**: Kiểm tra số ngày hợp lệ theo tháng

**Examples**:
```
Input: 5      → Output: 05/
Input: 32     → Output: 31
Input: 0      → Output: 01
Input: 15     → Output: 15/
```

### 2. Month (Tháng)
- **Range**: 01-12
- **Auto-format**: Gõ `5` → Tự động thành `05/`
- **Limit**: Không cho nhập > 12
- **Smart**: Kiểm tra số ngày trong tháng

**Examples**:
```
Input: 5      → Output: 05/
Input: 13     → Output: 12
Input: 0      → Output: 01
Input: 8      → Output: 08/
```

### 3. Year (Năm)
- **Range**: 1900-2100
- **Limit**: Không cho nhập < 1900 hoặc > 2100
- **Length**: Đúng 4 chữ số

**Examples**:
```
Input: 1899   → Output: 1900
Input: 2101   → Output: 2100
Input: 2024   → Output: 2024 ✅
```

### 4. Days in Month (Số ngày trong tháng)
Tự động kiểm tra số ngày hợp lệ cho từng tháng:

| Tháng | Số ngày | Ví dụ hợp lệ | Ví dụ không hợp lệ |
|-------|---------|--------------|-------------------|
| 1 (Jan) | 31 | 31/01/2024 ✅ | 32/01/2024 ❌ |
| 2 (Feb) | 28/29 | 29/02/2024 ✅ | 30/02/2024 ❌ |
| 3 (Mar) | 31 | 31/03/2024 ✅ | 32/03/2024 ❌ |
| 4 (Apr) | 30 | 30/04/2024 ✅ | 31/04/2024 ❌ |
| 5 (May) | 31 | 31/05/2024 ✅ | 32/05/2024 ❌ |
| 6 (Jun) | 30 | 30/06/2024 ✅ | 31/06/2024 ❌ |
| 7 (Jul) | 31 | 31/07/2024 ✅ | 32/07/2024 ❌ |
| 8 (Aug) | 31 | 31/08/2024 ✅ | 32/08/2024 ❌ |
| 9 (Sep) | 30 | 30/09/2024 ✅ | 31/09/2024 ❌ |
| 10 (Oct) | 31 | 31/10/2024 ✅ | 32/10/2024 ❌ |
| 11 (Nov) | 30 | 30/11/2024 ✅ | 31/11/2024 ❌ |
| 12 (Dec) | 31 | 31/12/2024 ✅ | 32/12/2024 ❌ |

### 5. Leap Year (Năm nhuận)
Tự động kiểm tra năm nhuận cho tháng 2:

**Leap Year Rules**:
- Chia hết cho 4 VÀ không chia hết cho 100
- HOẶC chia hết cho 400

**Examples**:
```
29/02/2024 ✅ (2024 là năm nhuận)
29/02/2023 ❌ (2023 không phải năm nhuận)
29/02/2000 ✅ (2000 là năm nhuận)
29/02/1900 ❌ (1900 không phải năm nhuận)
```

---

## 🎨 Visual Feedback

### Valid Date
- Border: Gray (normal)
- Ring: Blue on focus
- No error message

### Invalid Date
- Border: Red
- Ring: Red on focus
- Error message: "Ngày không hợp lệ. Vui lòng kiểm tra lại."

---

## 🧪 Test Cases

### Valid Dates ✅
```
25/12/2024  ✅ Christmas
01/01/2024  ✅ New Year
29/02/2024  ✅ Leap year
31/01/2024  ✅ End of January
30/04/2024  ✅ End of April
```

### Invalid Dates ❌
```
32/01/2024  ❌ Day > 31
00/01/2024  ❌ Day = 0
15/13/2024  ❌ Month > 12
15/00/2024  ❌ Month = 0
31/04/2024  ❌ April only has 30 days
30/02/2024  ❌ February doesn't have 30 days
29/02/2023  ❌ Not a leap year
15/06/1899  ❌ Year < 1900
15/06/2101  ❌ Year > 2100
```

### Auto-correction Examples
```
Input: 5      → 05/     (Auto-add leading zero)
Input: 32     → 31      (Limit to max day)
Input: 13     → 12      (Limit to max month)
Input: 1899   → 1900    (Limit to min year)
Input: 2101   → 2100    (Limit to max year)
```

---

## 🔧 Implementation Details

### Smart Day Validation
```typescript
// Auto-add leading zero for single digit > 3
if (day.length === 1 && parseInt(day) > 3) {
  day = "0" + day;
}

// Limit to 31
if (dayNum > 31) {
  day = "31";
}
```

### Smart Month Validation
```typescript
// Auto-add leading zero for single digit > 1
if (month.length === 1 && parseInt(month) > 1) {
  month = "0" + month;
}

// Limit to 12
if (monthNum > 12) {
  month = "12";
}
```

### Days in Month Check
```typescript
const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// Leap year adjustment
const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
if (isLeapYear) {
  daysInMonth[1] = 29;
}

// Validate day against month
if (day > daysInMonth[month - 1]) {
  return false;
}
```

---

## 💡 User Experience

### Typing Flow
1. **Type day**: `25` → Auto-adds `/` → `25/`
2. **Type month**: `12` → Auto-adds `/` → `25/12/`
3. **Type year**: `2024` → Validates → `25/12/2024` ✅

### Error Flow
1. **Type invalid**: `31/04/2024`
2. **See red border** + error message
3. **Fix**: Change to `30/04/2024`
4. **Border turns gray** + error disappears ✅

### Smart Corrections
- Type `5` → Becomes `05/` (auto-format)
- Type `32` → Becomes `31` (auto-limit)
- Type `13` → Becomes `12` (auto-limit)
- Type `1899` → Becomes `1900` (auto-limit)

---

## 🎯 Benefits

### For Users
1. **Clear feedback**: Red border when invalid
2. **Auto-correction**: Smart limits prevent errors
3. **Auto-formatting**: Leading zeros added automatically
4. **Helpful errors**: Clear message what's wrong

### For Developers
1. **Guaranteed valid dates**: Only valid dates reach onChange
2. **No manual validation**: Component handles everything
3. **Type-safe**: ISO format (yyyy-mm-dd) for storage
4. **Consistent**: Same validation everywhere

---

## 📊 Validation Summary

| Rule | Check | Auto-fix | Error |
|------|-------|----------|-------|
| Day 01-31 | ✅ | ✅ | ✅ |
| Month 01-12 | ✅ | ✅ | ✅ |
| Year 1900-2100 | ✅ | ✅ | ✅ |
| Days in month | ✅ | ❌ | ✅ |
| Leap year | ✅ | ❌ | ✅ |
| Leading zeros | ✅ | ✅ | ❌ |
| Auto-slash | ✅ | ✅ | ❌ |

---

## 🚀 Usage

No changes needed! Just use DateInput as before:

```tsx
<DateInput
  value={formData.endDate}
  onChange={(value) => setFormData({ ...formData, endDate: value })}
  placeholder="dd/mm/yyyy"
  required
/>
```

All validation happens automatically! 🎉

---

**Status**: ✅ Complete
**Validation**: Strict & comprehensive
**UX**: Clear feedback & auto-correction
**Ready**: Production-ready
