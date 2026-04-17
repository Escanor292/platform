# Vietnamese Date Formatting Functions

## ✅ Đã Thêm

Các functions để format ngày tháng theo định dạng Việt Nam.

---

## 📋 Functions Available

### 1. `formatDateVN(date)` - Định dạng ngắn
**Format**: `dd/mm/yyyy`

```typescript
import { formatDateVN } from "@/lib/project-helpers";

formatDateVN(new Date("2024-12-25"))
// Output: "25/12/2024"

formatDateVN("2024-01-15")
// Output: "15/01/2024"

formatDateVN(null)
// Output: ""
```

### 2. `formatDateVNLong(date)` - Định dạng dài
**Format**: `Ngày dd tháng mm năm yyyy`

```typescript
import { formatDateVNLong } from "@/lib/project-helpers";

formatDateVNLong(new Date("2024-12-25"))
// Output: "Ngày 25 tháng 12 năm 2024"

formatDateVNLong("2024-01-15")
// Output: "Ngày 15 tháng 1 năm 2024"
```

### 3. `formatDateTimeVN(date)` - Với giờ phút
**Format**: `dd/mm/yyyy HH:mm`

```typescript
import { formatDateTimeVN } from "@/lib/project-helpers";

formatDateTimeVN(new Date("2024-12-25T14:30:00"))
// Output: "25/12/2024 14:30"

formatDateTimeVN("2024-01-15T09:05:00")
// Output: "15/01/2024 09:05"
```

---

## 🎯 Usage Examples

### Campaign Card - Hiển thị ngày kết thúc

```tsx
import { formatDateVN, formatDaysRemaining } from "@/lib/project-helpers";

function CampaignCard({ campaign }) {
  return (
    <div>
      {/* Còn bao nhiêu ngày */}
      <p>{formatDaysRemaining(campaign.endDate)}</p>
      
      {/* Ngày cụ thể */}
      <p>Kết thúc: {formatDateVN(campaign.endDate)}</p>
    </div>
  );
}
```

### Campaign Details - Thông tin chi tiết

```tsx
import { formatDateVNLong } from "@/lib/project-helpers";

function CampaignDetails({ campaign }) {
  return (
    <div>
      <h3>Thời gian</h3>
      <p>Bắt đầu: {formatDateVNLong(campaign.startDate)}</p>
      <p>Kết thúc: {formatDateVNLong(campaign.endDate)}</p>
    </div>
  );
}
```

### Transaction History - Lịch sử giao dịch

```tsx
import { formatDateTimeVN } from "@/lib/project-helpers";

function TransactionItem({ transaction }) {
  return (
    <div>
      <p>{transaction.description}</p>
      <p className="text-sm text-gray-500">
        {formatDateTimeVN(transaction.createdAt)}
      </p>
    </div>
  );
}
```

---

## 🔧 Implementation Details

### File: `src/lib/project-helpers.ts`

```typescript
/**
 * Format date to Vietnamese format (dd/mm/yyyy)
 */
export function formatDateVN(date: Date | string | null): string {
  if (!date) return "";
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if valid date
  if (isNaN(dateObj.getTime())) return "";
  
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  
  return `${day}/${month}/${year}`;
}
```

**Features**:
- ✅ Accepts `Date` object or ISO string
- ✅ Returns empty string for null/invalid dates
- ✅ Zero-pads day and month (01, 02, etc.)
- ✅ Type-safe with TypeScript

---

## 📊 Format Comparison

| Function | Input | Output |
|----------|-------|--------|
| `formatDateVN` | `2024-12-25` | `25/12/2024` |
| `formatDateVNLong` | `2024-12-25` | `Ngày 25 tháng 12 năm 2024` |
| `formatDateTimeVN` | `2024-12-25T14:30` | `25/12/2024 14:30` |
| `formatDaysRemaining` | `2024-12-25` | `Còn X ngày` |

---

## 🌍 Localization

### Current: Vietnamese (vi-VN)
- Date separator: `/`
- Order: Day / Month / Year
- Long format: "Ngày X tháng Y năm Z"

### If need other locales:
```typescript
// English (en-US)
export function formatDateEN(date: Date | string | null): string {
  // mm/dd/yyyy
  return `${month}/${day}/${year}`;
}

// ISO format
export function formatDateISO(date: Date | string | null): string {
  // yyyy-mm-dd
  return `${year}-${month}-${day}`;
}
```

---

## 🧪 Testing

### Test Cases

```typescript
// Valid dates
formatDateVN("2024-12-25") // "25/12/2024" ✅
formatDateVN(new Date(2024, 11, 25)) // "25/12/2024" ✅

// Edge cases
formatDateVN(null) // "" ✅
formatDateVN("") // "" ✅
formatDateVN("invalid") // "" ✅

// Zero padding
formatDateVN("2024-01-05") // "05/01/2024" ✅
formatDateVN("2024-12-09") // "09/12/2024" ✅

// Leap year
formatDateVN("2024-02-29") // "29/02/2024" ✅
```

---

## 💡 Best Practices

### 1. Choose Right Format
- **Short dates** (cards, lists): Use `formatDateVN`
- **Long dates** (details, headers): Use `formatDateVNLong`
- **Timestamps** (logs, history): Use `formatDateTimeVN`
- **Relative time** (countdown): Use `formatDaysRemaining`

### 2. Handle Null/Invalid
All functions return empty string for null/invalid dates:
```tsx
// Safe to use without checking
<p>Ngày: {formatDateVN(campaign.endDate)}</p>

// Or with fallback
<p>Ngày: {formatDateVN(campaign.endDate) || "Chưa xác định"}</p>
```

### 3. Consistent Usage
Use same format throughout the app for consistency:
```tsx
// ✅ GOOD - Consistent
<p>Bắt đầu: {formatDateVN(startDate)}</p>
<p>Kết thúc: {formatDateVN(endDate)}</p>

// ❌ BAD - Inconsistent
<p>Bắt đầu: {formatDateVN(startDate)}</p>
<p>Kết thúc: {formatDateVNLong(endDate)}</p>
```

---

## 🔄 Migration Guide

### Before (No formatting)
```tsx
<p>{campaign.endDate}</p>
// Output: "2024-12-25T00:00:00.000Z" ❌
```

### After (With formatting)
```tsx
<p>{formatDateVN(campaign.endDate)}</p>
// Output: "25/12/2024" ✅
```

### Find & Replace
Search for date displays and replace with formatted versions:
```tsx
// Find
{campaign.endDate}
{project.startDate}
{transaction.createdAt}

// Replace with
{formatDateVN(campaign.endDate)}
{formatDateVN(project.startDate)}
{formatDateTimeVN(transaction.createdAt)}
```

---

## 📝 Common Use Cases

### 1. Campaign End Date
```tsx
<div className="flex items-center gap-2">
  <Calendar size={16} />
  <span>Kết thúc: {formatDateVN(campaign.endDate)}</span>
</div>
```

### 2. Campaign Timeline
```tsx
<div>
  <p>Thời gian gây quỹ</p>
  <p>{formatDateVN(campaign.startDate)} - {formatDateVN(campaign.endDate)}</p>
</div>
```

### 3. Transaction Date
```tsx
<div className="text-sm text-gray-500">
  {formatDateTimeVN(transaction.createdAt)}
</div>
```

### 4. User Profile
```tsx
<p>Tham gia: {formatDateVNLong(user.createdAt)}</p>
```

---

## ✅ Summary

**Added**: 3 new date formatting functions
**File**: `src/lib/project-helpers.ts`
**Format**: Vietnamese (dd/mm/yyyy)
**Type-safe**: Full TypeScript support
**Null-safe**: Returns empty string for invalid dates

Use these functions anywhere you need to display dates in Vietnamese format!

---

**Status**: ✅ Complete
**Ready to use**: Import and use immediately
