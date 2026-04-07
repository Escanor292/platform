# CrowdFund VN 🇻🇳

> Nền tảng gây quỹ cộng đồng Việt Nam - Minh bạch, an toàn, hiệu quả

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://prisma.io)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38BDF8?logo=tailwindcss)](https://tailwindcss.com)

---

## ✨ Tính năng chính

- 🎯 **Gây quỹ linh hoạt** — Tạo campaign với phần thưởng nhiều mức
- 💰 **Escrow an toàn** — Tiền chỉ giải ngân khi đạt mục tiêu
- 🔍 **Tra cứu minh bạch** — Kiểm tra giao dịch công khai bằng mã tham chiếu
- 👤 **Ủng hộ ẩn danh** — Hỗ trợ guest và ẩn danh
- 💳 **Đa phương thức thanh toán** — VNPay, MoMo, PayOS (VietQR), chuyển khoản
- 🛡️ **Chính sách hoàn tiền** — Tự động hoàn tiền khi campaign thất bại

---

## 🚀 Bắt đầu nhanh

### Yêu cầu hệ thống
- Node.js >= 18.x
- PostgreSQL >= 14
- npm hoặc pnpm

### Cài đặt

```bash
# 1. Clone project
git clone https://github.com/your-org/crowdfunding-vn.git
cd crowdfunding-vn

# 2. Cài dependencies
npm install

# 3. Tạo file .env
cp .env.example .env
# → Mở .env và điền thông tin database, NextAuth, API keys

# 4. Khởi tạo database
npx prisma migrate dev --name init
npx prisma generate

# 5. (Tùy chọn) Seed dữ liệu mẫu
npx ts-node src/data/seed.ts

# 6. Chạy dev server
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt.

---

## 📁 Cấu trúc dự án

```
src/
├── app/            # Next.js App Router (pages + API routes)
│   ├── api/        # API Route Handlers
│   ├── campaigns/  # Trang campaign
│   ├── dashboard/  # Creator & Backer dashboard
│   └── auth/       # Đăng nhập / Đăng ký
├── components/     # UI Components tái sử dụng
│   ├── campaign/   # CampaignCard, PledgeForm, CampaignForm...
│   ├── layout/     # Header, Footer
│   ├── shared/     # Toast, TransactionLookup
│   └── ui/         # Button, Card, Input, Dialog...
├── lib/            # Logic thuần (không render UI)
│   ├── payment/    # VNPay, MoMo, PayOS, Escrow, Refund
│   ├── actions/    # Server Actions
│   ├── prisma.ts   # Prisma client singleton
│   └── utils.ts    # formatVND, generateTxRef, formatDate...
├── types/          # TypeScript interfaces
├── hooks/          # Custom React hooks
└── data/           # Seed data
```

---

## 🧪 Tài khoản test (Sandbox)

| Cổng thanh toán | Thông tin |
|----------------|-----------|
| VNPay          | [Sandbox VNPay](https://sandbox.vnpayment.vn/apis/vnpay-sandbox.html) |
| MoMo           | [Test MoMo](https://developers.momo.vn/#/docs/en/aiov2/?id=test-information) |
| PayOS          | [Dashboard PayOS](https://my.payos.vn) |

---

## 📜 Scripts

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run lint         # ESLint
npx prisma studio    # Prisma GUI
npx prisma migrate dev  # Tạo migration mới
```

---

## 🤝 Đóng góp

Xem [CONTRIBUTING.md](./CONTRIBUTING.md) để biết hướng dẫn đóng góp.

---

## 📄 License

MIT © 2025 CrowdFund VN Team
