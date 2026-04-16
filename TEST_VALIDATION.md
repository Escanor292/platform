# Test URL Validation

## Để Test Validation:

1. **Bôi đen text** trong editor
2. **Click nút Link** (icon 🔗)
3. **Nhập URL không hợp lệ:** `abc`
4. **Click OK**
5. **Kết quả mong đợi:** 
   - Alert box hiện: "URL không hợp lệ. Ví dụ: example.com hoặc https://example.com"
   - Link KHÔNG được apply

## Test URL Hợp Lệ:

1. **Bôi đen text**
2. **Click nút Link**
3. **Nhập:** `example.com`
4. **Click OK**
5. **Kết quả:**
   - Link được apply
   - URL tự động thành `https://example.com`

## So Sánh:

### Editor CŨ (`src/components/shared/RichTextEditor.tsx`):
```tsx
const url = window.prompt("Nhập URL:", prev);
if (url === null) return;
if (url === "") { 
  editor.chain().focus().extendMarkRange("link").unsetLink().run(); 
  return; 
}
// KHÔNG CÓ VALIDATION - apply trực tiếp
editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
```

### Editor MỚI (`SimplifiedEnhancedEditor.tsx`):
```tsx
const url = window.prompt('Nhập URL:', previousUrl || '');
if (url === null) return;
if (url === '') {
  removeLink(editor);
  return;
}

// CÓ VALIDATION
const error = getUrlError(url);
if (error) {
  alert(error); // ← Báo lỗi
  return;
}

// CÓ NORMALIZATION
const normalizedUrl = normalizeUrl(url);
applyLinkToSelection(editor, normalizedUrl);
```

## Sự Khác Biệt:

✅ **Editor MỚI có:**
- URL validation
- Error alert
- Auto-normalize (`example.com` → `https://example.com`)
- Không apply nếu invalid

❌ **Editor CŨ:**
- Không có validation
- Apply bất kỳ text nào
- Không normalize
