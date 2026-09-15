# Hướng dẫn cho AI (TuTe Fund / CrowdFund VN)

Đọc file này **trước mọi thao tác**. Đây là hợp đồng làm việc với repo `Escanor292/platform`.

Repo: https://github.com/Escanor292/platform.git  
Clone: `gh repo clone Escanor292/platform`  
Commit author: `Nguyễn Quách Phú Tài` `<nguyenquachphutai@gmail.com>`

Trước khi xây hoặc sửa gì: **đọc mã nguồn liên quan** (`src/`, `prisma/schema.prisma`, API route, component). Không đoán luồng từ docs cũ nếu khác code.

---

## 1. `node_modules` không nằm trên GitHub

Thư mục `node_modules` **không commit**. Đó chỉ là bản cài local của thư viện trong `package.json`.

| Việc | Lệnh |
|---|---|
| Tải lại toàn bộ dependency | `npm ci` (ưu tiên, khớp `package-lock.json`) |
| Máy dev nếu chưa có lock sync | `npm install` |
| Sinh Prisma Client (đã có trong `postinstall`) | `npx prisma generate` |
| Cài Chromium cho E2E | `npx playwright install --with-deps chromium` |

Không `git add node_modules`. `.gitignore` đã có `/node_modules`.

CI dùng **npm** (`npm ci`, Node 22). Có `pnpm-lock.yaml` nhưng **đừng dùng pnpm** trừ khi chủ repo đổi CI.

`.npmrc`: `legacy-peer-deps=true` — giữ nguyên khi install.

---

## 2. Cài máy mới (checklist)

Yêu cầu: Node.js **22**, Git, `gh` (đã login).

```bash
gh repo clone Escanor292/platform
cd platform
cp .env.example .env
# Điền secret local / copy từ Vercel. KHÔNG commit .env.
npm ci
npx prisma generate
npm run dev
```

App Next.js 15, cổng mặc định **3000**.

Không có `node_modules` sau clone là **đúng**. `npm ci` tạo lại.

---

## 3. Phải tải / không phải tải

**Tải (local):**

- Dependency npm theo `package.json` + `package-lock.json` (`next`, `react`, `prisma`, `@prisma/client`, `cloudinary`, `ioredis`, `next-auth`, Tiptap, Radix, Jest, Playwright, …)
- Prisma Client vào `prisma/generated/` (gitignore; `postinstall` / `prisma generate`)

**Không tải, kết nối cloud (env):**

- PostgreSQL / **Neon** — `DATABASE_URL`
- **Cloudinary** — ảnh/video user upload (`CLOUDINARY_*`)
- Redis — `REDIS_URL` (`rediss://`)
- NextAuth — `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- Gemini (trợ lý public, server-only) — `GEMINI_API_KEY` (không `NEXT_PUBLIC_*`)

**Không dùng nữa:** MongoDB. App boot bằng Postgres. Đừng viết feature mới lên Mongo.

Danh sách biến: `.env.example`. Production: Vercel / `docs/VERCEL_ENV_VARIABLES.example.txt`. File `docs/VERCEL_ENV_VARIABLES.txt` có thể chứa secret — **không đưa ra ngoài**.

---

## 4. Lưu trữ đúng chỗ

| Loại | Nơi |
|---|---|
| User, chiến dịch, pledge, chứng từ, blog, JSON slide thuyết trình | Neon / PostgreSQL (`DATABASE_URL`, Prisma) |
| Ảnh/video người dùng upload | Cloudinary folder `crowdfund-vn`; DB chỉ giữ URL |
| Ảnh minh họa thuyết trình admin | Postgres `presentation_media` (BYTEA); chữ slide `presentation_deck` |
| Seed ảnh slide | `public/presentations/*.jpg` (chỉ seed lần đầu nếu deck active) |

Không nhét ảnh chiến dịch vào git hay vào BYTEA. Upload qua `/api/upload`.

---

## 5. Lệnh thường dùng

```bash
npm run dev
npm run build
npm test -- --runInBand
npm run test:db
npx tsc --noEmit
npm run test:e2e          # cần Playwright + DB test
npm run vercel-build      # prisma generate + migrate deploy + next build
```

Sửa schema Prisma: migration trong `prisma/migrations/`. Không “sửa schema cho tiện” nếu task không yêu cầu. Bảng thuyết trình tạo bằng raw SQL (`CREATE TABLE IF NOT EXISTS`) — không nhét vào `schema.prisma` trừ khi chủ repo yêu cầu.

---

## 6. Quy tắc sửa code

1. Đọc file hiện có trước khi thêm file mới.
2. Admin thuyết trình chỉ trong `/dashboard/admin` — không public.
3. Không commit `.env`, secret, `node_modules`, `prisma/generated/`.
4. Không xóa `.env` khỏi git nếu chủ repo đã giữ vì repo private — trừ khi họ bảo gỡ.
5. Push `main` với email `nguyenquachphutai@gmail.com`.
6. Docs đồ án: `docs/SRS-TU-TE-FUND.md`, `docs/system-map/`, `docs/phap-luat/`. `docs/archive/` là lịch sử, không phải nguồn sự thật.
7. Mongo script (`mongo:init`, `scripts/init-mongodb.js`, …) là leftover — đừng phụ thuộc.

---

## 7. Cấu trúc nhanh

```
src/app/          App Router (Next 15)
src/components/   UI
src/lib/          Prisma, auth, upload, presentation, business logic
prisma/           schema + migrations
public/           static + presentations seed images
scripts/          seed / migrate / CI helpers
__tests__/  e2e/  Jest + Playwright
```

Nguồn sự thật runtime: `src/` + `prisma/schema.prisma` + env. Docs chỉ bổ sung.

---

## 8. Khi clone xong mà thiếu module

```bash
rm -rf node_modules
npm ci
npx prisma generate
```

Vẫn lỗi native (`bcrypt`): Node 22 + `npm ci` lại. Không commit `node_modules` để “fix”.
