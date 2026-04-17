# Vietnamese Date Input Component

## ✅ Đã Tạo

Custom date input component với format Việt Nam (dd/mm/yyyy).

---

## 🐛 Vấn Đề

HTML5 `<input type="date">` hiển thị placeholder theo format của browser/OS:
- Trên browser Mỹ: `mm/dd/yyyy` ❌
- Trên browser Việt Nam: Có thể vẫn là `mm/dd/yyyy` ❌

Người dùng Việt Nam quen với format `dd/mm/yyyy` (ngày/tháng/năm).

---

## ✅ Giải Pháp

Tạo custom `DateInput` component:
- Hiển thị format Việt Nam: `dd/mm/yyyy` ✅
- Tự động thêm dấu `/` khi gõ ✅
- Có calendar picker (click icon) ✅
- Validate ngày tháng ✅
- Lưu dữ liệu dạng ISO (yyyy-mm-dd) ✅

---

## 📁 Files

### New: `src/components/shared/DateInput.tsx`

**Component Props**:
```typescript
interface DateInputProps {
  value: string;              // ISO format: yyyy-mm-dd
  onChange: (value: string) => void;
  placeholder?: string;       // Default: "dd/mm/yyyy"
  className?: string;
  required?: boolean;
  min?: string;              // ISO format: yyyy-mm-dd
  max?: string;              // ISO format: yyyy-mm-dd
}
```

### Modified: `src/app/campaigns/create/page.tsx`

Replaced native date input with `DateInput` component.

---

## 🎨 Features

### 1. Vietnamese Format Display
- User sees: `dd/mm/yyyy`
- User types: `25/12/2024`
- Stored as: `2024-12-25` (ISO)

### 2. Auto-formatting
```
User types: "25"     → Display: "25/"
User types: "2512"   → Display: "25/12/"
User types: "251220" → Display: "25/12/20"
User types: "25122024" → Display: "25/12/2024"
```

### 3. Calendar Picker
- Click calendar icon → Opens native date picker
- Select date → Auto-fills in dd/mm/yyyy format
- Works on all devices (desktop, mobile, tablet)

### 4. Validation
- Only allows numbers and `/`
- Max length: 10 characters
- Validates date is real (e.g., 31/02/2024 won't work)
- Min/max date constraints

---

## 🎯 Usage

### Basic Usage
```tsx
import { DateInput } from "@/components/shared/DateInput";

function MyForm() {
  const [date, setDate] = useState("");
  
  return (
    <DateInput
      value={date}
      onChange={setDate}
      placeholder="dd/mm/yyyy"
      required
    />
  );
}
```

### With Min Date (No past dates)
```tsx
<DateInput
  value={formData.endDate}
  onChange={(value) => setFormData({ ...formData, endDate: value })}
  min={new Date().toISOString().split('T')[0]}
  placeholder="dd/mm/yyyy"
  required
/>
```

### With Date Range
```tsx
<DateInput
  value={formData.startDate}
  onChange={(value) => setFormData({ ...formData, startDate: value })}
  min="2024-01-01"
  max="2024-12-31"
  placeholder="dd/mm/yyyy"
/>
```

---

## 🔧 How It Works

### 1. Display Layer (Vietnamese)
```typescript
// User sees and types in Vietnamese format
<input 
  type="text"
  value="25/12/2024"  // dd/mm/yyyy
  placeholder="dd/mm/yyyy"
/>
```

### 2. Storage Layer (ISO)
```typescript
// Stored in ISO format for database
value="2024-12-25"  // yyyy-mm-dd
```

### 3. Conversion Functions
```typescript
// ISO → Display
formatDisplay("2024-12-25") // "25/12/2024"

// Display → ISO
formatISO("25/12/2024") // "2024-12-25"
```

### 4. Native Picker Integration
```typescript
// Hidden native input for picker
<input 
  type="date"
  value="2024-12-25"  // ISO format
  className="hidden"
/>
```

---

## 🎨 UI/UX

### Visual Design
- **Icon**: Calendar icon on left
- **Input**: Large, bold text
- **Button**: Calendar icon on right (opens picker)
- **Style**: Matches existing form inputs
- **Focus**: Blue ring on focus

### User Experience
1. **Type manually**: `25/12/2024`
   - Auto-adds slashes
   - Validates as you type
   
2. **Use picker**: Click calendar icon
   - Opens native date picker
   - Select date
   - Auto-fills in dd/mm/yyyy format

3. **Keyboard**: Tab, Enter work normally

---

## 🧪 Testing

### Manual Input
- [ ] Type `25122024` → Shows `25/12/2024`
- [ ] Type `1` → Shows `1`
- [ ] Type `12` → Shows `12/`
- [ ] Type `1212` → Shows `12/12/`
- [ ] Type `12122024` → Shows `12/12/2024`

### Calendar Picker
- [ ] Click calendar icon → Picker opens
- [ ] Select date → Input fills with dd/mm/yyyy
- [ ] Selected date is correct

### Validation
- [ ] Type `32/12/2024` → Invalid (day > 31)
- [ ] Type `31/02/2024` → Invalid (Feb doesn't have 31 days)
- [ ] Type `29/02/2024` → Valid (leap year)
- [ ] Type `29/02/2023` → Invalid (not leap year)

### Min/Max
- [ ] With `min={today}` → Can't select past dates
- [ ] With `max={future}` → Can't select dates beyond max

---

## 📊 Comparison

### Before (Native Input)
```tsx
<input type="date" />
```
- ❌ Shows `mm/dd/yyyy` placeholder
- ❌ Confusing for Vietnamese users
- ❌ No control over format display
- ✅ Native picker works

### After (Custom DateInput)
```tsx
<DateInput placeholder="dd/mm/yyyy" />
```
- ✅ Shows `dd/mm/yyyy` placeholder
- ✅ Clear for Vietnamese users
- ✅ Full control over format
- ✅ Native picker still works
- ✅ Auto-formatting
- ✅ Better UX

---

## 🌍 Localization

### Current: Vietnamese (vi-VN)
```
Format: dd/mm/yyyy
Example: 25/12/2024
```

### Easy to adapt for other locales:
```typescript
// US format
placeholder="mm/dd/yyyy"
formatDisplay = (iso) => `${month}/${day}/${year}`

// ISO format
placeholder="yyyy-mm-dd"
formatDisplay = (iso) => iso
```

---

## 💡 Best Practices

### 1. Always Use ISO for Storage
```typescript
// ✅ GOOD - Store ISO
const [date, setDate] = useState("2024-12-25");

// ❌ BAD - Store display format
const [date, setDate] = useState("25/12/2024");
```

### 2. Display Format for Users
```typescript
// ✅ GOOD - Show Vietnamese format
<DateInput placeholder="dd/mm/yyyy" />

// ❌ BAD - Show ISO format
<input type="date" />
```

### 3. Set Min Date for Future Dates
```typescript
// ✅ GOOD - Prevent past dates
<DateInput min={new Date().toISOString().split('T')[0]} />

// ❌ BAD - Allow any date
<DateInput />
```

---

## 🔄 Migration Guide

### Find & Replace

**Before**:
```tsx
<Input 
  type="date"
  value={formData.endDate}
  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
/>
```

**After**:
```tsx
<DateInput
  value={formData.endDate}
  onChange={(value) => setFormData({ ...formData, endDate: value })}
  placeholder="dd/mm/yyyy"
/>
```

### Steps
1. Import `DateInput` component
2. Replace `<Input type="date">` with `<DateInput>`
3. Update `onChange` handler (no `e.target.value`)
4. Add `placeholder="dd/mm/yyyy"`
5. Test manually and with picker

---

## 🎯 Use Cases

### Campaign End Date
```tsx
<DateInput
  value={campaign.endDate}
  onChange={(value) => setCampaign({ ...campaign, endDate: value })}
  min={new Date().toISOString().split('T')[0]}
  placeholder="dd/mm/yyyy"
  required
/>
```

### Date Range (Start & End)
```tsx
<DateInput
  value={formData.startDate}
  onChange={(value) => setFormData({ ...formData, startDate: value })}
  placeholder="dd/mm/yyyy"
/>

<DateInput
  value={formData.endDate}
  onChange={(value) => setFormData({ ...formData, endDate: value })}
  min={formData.startDate} // End must be after start
  placeholder="dd/mm/yyyy"
/>
```

### Birthday Input
```tsx
<DateInput
  value={user.birthday}
  onChange={(value) => setUser({ ...user, birthday: value })}
  max={new Date().toISOString().split('T')[0]} // No future dates
  placeholder="dd/mm/yyyy"
/>
```

---

## ✅ Summary

**Created**: Custom DateInput component
**Format**: Vietnamese (dd/mm/yyyy)
**Features**: Auto-formatting, calendar picker, validation
**Storage**: ISO format (yyyy-mm-dd)
**UX**: Clear and intuitive for Vietnamese users

No more confusion with mm/dd/yyyy! 🎉

---

**Status**: ✅ Complete
**File**: `src/components/shared/DateInput.tsx`
**Applied**: Create campaign page
**Ready**: Use in other forms
