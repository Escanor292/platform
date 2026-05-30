# Hướng dẫn đóng góp 🤝

Cảm ơn bạn đã quan tâm đến CrowdFund VN! Tài liệu này hướng dẫn cách làm việc hiệu quả trong team.

---

## 🌿 Git Workflow

### Quy tắc nhánh

| Nhánh | Mục đích |
|-------|----------|
| `main` | Production — chỉ merge qua PR được review |
| `develop` | Integration — merge feature branches vào đây |
| `feature/ten-tinh-nang` | Tính năng mới |
| `fix/ten-loi` | Sửa bug |
| `hotfix/ten-loi` | Sửa khẩn cấp trên production |

```bash
# Tạo nhánh mới từ develop
git checkout develop
git pull origin develop
git checkout -b feature/ten-tinh-nang
```

### Commit Message Convention

Theo chuẩn [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <mô tả ngắn gọn>

[body tùy chọn]
```

**Các type hợp lệ:**

| Type | Ý nghĩa |
|------|---------|
| `feat` | Thêm tính năng mới |
| `fix` | Sửa bug |
| `refactor` | Refactor code (không thêm tính năng, không sửa bug) |
| `style` | Sửa CSS/UI (không thay đổi logic) |
| `docs` | Cập nhật tài liệu |
| `test` | Thêm/sửa test |
| `chore` | Cập nhật config, dependencies |
| `perf` | Cải thiện hiệu năng |

**Ví dụ:**
```bash
git commit -m "feat(campaign): thêm form tạo campaign với reward tiers"
git commit -m "fix(payment): sửa lỗi VNPay không verify được chữ ký"
git commit -m "docs(readme): cập nhật hướng dẫn cài đặt PayOS"
```

---

## 🔀 Pull Request

1. **Tạo PR vào `develop`** (không phải `main`)
2. **Mô tả PR** phải có:
   - Tóm tắt thay đổi
   - Screenshots nếu có thay đổi UI
   - Cách test
3. **Ít nhất 1 reviewer** phải approve trước khi merge
4. **Không self-merge** trừ hotfix khẩn cấp

### Template PR
```markdown
## 📝 Thay đổi
- Thêm ...
- Sửa ...

## 🧪 Cách test
1. Chạy `npm run dev`
2. Truy cập /campaigns/create
3. ...

## 📸 Screenshots
[Đính kèm ảnh nếu thay đổi UI]
```

---

## 📐 Code Style

### TypeScript
- **Luôn dùng TypeScript**, không dùng `any` nếu có thể thay thế
- Đặt types trong `src/types/`, tái sử dụng giữa các file
- Dùng `interface` cho objects, `type` cho unions/primitives

### Next.js / React
- **Server Components mặc định** — chỉ thêm `"use client"` khi cần hooks/events
- **API Routes** đặt trong `src/app/api/`
- **Server Actions** đặt trong `src/lib/actions/`
- Components tái sử dụng → `src/components/`
- Logic thuần (không render) → `src/lib/`

### Naming
```
PascalCase   → Components (CampaignCard.tsx)
camelCase    → Functions, variables, hooks (useCampaign.ts)
kebab-case   → URL slugs, file names không phải component
UPPER_SNAKE  → Constants, env variables
```

---

## 🗄️ Database (Prisma)

```bash
# Sau khi sửa schema.prisma
npx prisma migrate dev --name <ten-migration>
npx prisma generate

# Xem dữ liệu
npx prisma studio
```

> **Lưu ý:** Không xóa hoặc đổi tên columns trực tiếp. Dùng migration để đảm bảo an toàn dữ liệu.

---

## 🔐 Quy tắc bảo mật

- **Không commit** file `.env` hoặc bất kỳ secret nào
- **Không hardcode** API keys trong source code
- Dùng `process.env.TEN_BIEN` và khai báo trong `.env.example`
- Payment logic phải luôn **verify signature** từ gateway

---

## 📞 Liên hệ

- Slack: `#crowdfunding-vn-dev`
- Email: `dev@crowdfund.vn`
- Issues: Tạo GitHub Issue với label phù hợp
