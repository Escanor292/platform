"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Calculator } from "lucide-react";
import type { LivePeriod, PresentationLiveStats } from "@/lib/admin-presentation-types";

type Scenario = "early" | "optimistic";
type Infra = "current" | "cheap";
type Ops = "manual" | "hybrid";
type Unit = "dong" | "trieu" | "usd" | "pct" | "pct_gmv";

type LineDef = {
  id: string;
  name: string;
  note: string;
  unit: Unit;
  defaultOn: boolean;
  value: (s: Scenario) => number;
  side?: "opex" | "revenue";
};

type LineLive = { on: boolean; value: number };

const STORAGE_KEY = "ttf-pnl-checklist-v32";
const USD_DEFAULT = 26200;

function vnd(n: number) {
  return `${Math.round(n).toLocaleString("vi-VN")} đ`;
}

function trieu(n: number) {
  const abs = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (abs >= 1000) {
    return `${sign}${(abs / 1000).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} tỷ`;
  }
  return `${sign}${abs.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} triệu`;
}

function LiveTable({ stats }: { stats: PresentationLiveStats }) {
  const cols: LivePeriod[] = [stats.quarter, stats.year, stats.all];
  const rows: Array<[string, (p: LivePeriod) => string]> = [
    ["Dự án tạo mới", (p) => String(p.projects)],
    ["Chiến dịch tạo mới", (p) => String(p.campaigns)],
    ["  · Reward", (p) => String(p.campaignsReward)],
    ["  · Donation", (p) => String(p.campaignsDonation)],
    ["Chiến dịch có giao dịch", (p) => String(p.campaignsWithTx)],
    ["Người ủng hộ Donation", (p) => String(p.donationBackers)],
    ["Lượt ủng hộ Donation", (p) => String(p.donationPledges)],
    ["Tiền ủng hộ Donation", (p) => vnd(p.donationAmount)],
    ["Tip tự nguyện Donation", (p) => vnd(p.donationTip)],
    ["Người đặt Reward", (p) => String(p.rewardBackers)],
    ["Đơn Reward thành công", (p) => String(p.rewardPledges)],
    ["Tiền Reward (GMV)", (p) => vnd(p.rewardAmount)],
    ["Phí sàn đã thu (gồm VAT)", (p) => vnd(p.platformFee)],
    ["Giấy chứng nhận đã cấp", (p) => String(p.certificates)],
    ["Người dùng mới", (p) => String(p.usersNew)],
  ];
  return (
    <div className="overflow-x-auto rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-slate-100 bg-slate-900 px-4 py-3 text-white">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wide text-slate-300">Số liệu thật trên Neon</div>
          <div className="text-sm font-black">{stats.quarterLabel} · cập nhật lúc thuyết trình</div>
        </div>
        <div className="text-[11px] text-slate-300">
          Đang chạy: {stats.snapshot.campaignsActive} chiến dịch ({stats.snapshot.campaignsRewardActive} Reward ·{" "}
          {stats.snapshot.campaignsDonationActive} Donation) · {stats.snapshot.projects} dự án · {stats.snapshot.users}{" "}
          người dùng
        </div>
      </div>
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-black uppercase tracking-wide text-slate-500">
            <th className="px-4 py-2">Chỉ số</th>
            {cols.map((c) => (
              <th key={c.label} className="px-4 py-2">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, pick]) => (
            <tr key={name} className="border-b border-slate-50">
              <td className="px-4 py-2 font-semibold text-slate-700">{name}</td>
              {cols.map((c) => (
                <td key={c.label} className="px-4 py-2 font-black text-slate-900">
                  {pick(c)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-4 py-2 text-[11px] text-slate-500">
        Donation = chiến dịch type DONATION, Pledge SUCCESS. Reward = type REWARD. Người ủng hộ đếm unique theo tài
        khoản / email. GMV không phải doanh thu sàn — phí sàn mới là doanh thu.
      </p>
    </div>
  );
}

function lineUnitLabel(def: LineDef) {
  if (def.unit === "pct") return "%";
  if (def.unit === "pct_gmv") return "% GMV Reward thành công";
  if (def.unit === "usd") return "USD/tháng";
  if (def.unit === "dong") return "đ/tháng";
  if (def.side === "revenue") return "triệu/tháng";
  if (def.id.startsWith("rev.")) return "triệu/quý";
  return "triệu/tháng";
}

function toTrieu(value: number, unit: Unit, usdRate: number) {
  if (unit === "dong") return value / 1_000_000;
  if (unit === "usd") return (value * usdRate) / 1_000_000;
  if (unit === "pct") return 0;
  return value;
}

function taxKind(def: LineDef): "labor" | "none" | "vn_gross10" | "vn_net10" | "fct5_5" | "fct_cloud" {
  if (
    def.id === "current.vercel" ||
    def.id === "current.neon" ||
    def.id === "current.cloudinary" ||
    def.id === "current.redis" ||
    def.id === "current.mongo" ||
    def.id === "current.sentry" ||
    def.id === "tools.cf"
  ) {
    return "fct_cloud";
  }
  if (def.unit === "usd") return "fct5_5";
  if (
    def.id === "manual.kyc" ||
    def.id === "manual.cs" ||
    def.id === "hybrid.reviewer" ||
    def.id === "hybrid.cs" ||
    def.id.startsWith("founder")
  ) {
    return "labor";
  }
  if (
    def.id.startsWith("cheap.") ||
    def.id === "hybrid.ekyc" ||
    def.id === "manual.ekyc" ||
    def.id === "current.domain" ||
    def.id === "tools.sms" ||
    def.id === "tools.zalo"
  ) {
    return "vn_gross10";
  }
  if (def.unit === "pct" || def.unit === "pct_gmv" || def.side === "revenue" || def.id.startsWith("rev.")) {
    return "none";
  }
  return "vn_net10";
}

function isHostLine(def: LineDef) {
  return (
    def.id.startsWith("cheap.") ||
    def.id.startsWith("current.") ||
    def.id === "tools.cf"
  );
}

type TaxBucket = {
  net: number;
  inputVat: number;
  fctCit: number;
  vatHost: number;
  vatOther: number;
};

function applyTax(bucket: TaxBucket, def: LineDef, amountQ: number, creditVat: boolean, applyFct: boolean) {
  const kind = taxKind(def);
  const host = isHostLine(def);

  function addInput(vat: number) {
    bucket.inputVat += vat;
    if (host) bucket.vatHost += vat;
    else bucket.vatOther += vat;
  }

  if (!creditVat && !(applyFct && (kind === "fct5_5" || kind === "fct_cloud"))) {
    bucket.net += amountQ;
    return;
  }
  if (kind === "labor" || kind === "none") {
    bucket.net += amountQ;
    return;
  }
  if (kind === "vn_gross10") {
    if (creditVat) {
      bucket.net += amountQ / 1.1;
      addInput(amountQ - amountQ / 1.1);
    } else {
      bucket.net += amountQ;
    }
    return;
  }
  if (kind === "vn_net10") {
    bucket.net += amountQ;
    if (creditVat) addInput(amountQ * 0.1);
    return;
  }
  bucket.net += amountQ;
  if (!applyFct) return;
  if (kind === "fct_cloud") {
    bucket.fctCit += amountQ * 0.05;
    if (creditVat) addInput(amountQ * 0.1);
    return;
  }
  bucket.fctCit += amountQ * 0.05;
  if (creditVat) addInput(amountQ * 0.05);
}

function taxRate(netYear: number) {
  if (netYear <= 3_000) return 0.15;
  if (netYear <= 50_000) return 0.17;
  return 0.2;
}

const REVENUE_LINES: LineDef[] = [
  {
    id: "rev.gmvRewardQ",
    name: "GMV Reward / quý",
    note: "Tiền pre-order chảy qua giữ hộ. Không phải doanh thu sàn.",
    unit: "trieu",
    defaultOn: true,
    value: (s) => (s === "optimistic" ? 8_000 : 1_200),
  },
  {
    id: "rev.gmvDonationQ",
    name: "GMV Donation / quý",
    note: "Khoản ủng hộ. Sàn 0% bắt buộc.",
    unit: "trieu",
    defaultOn: true,
    value: (s) => (s === "optimistic" ? 4_000 : 300),
  },
  {
    id: "rev.refund",
    name: "Tỷ lệ hoàn Reward",
    note: "Hoàn đơn / trễ SLA.",
    unit: "pct",
    defaultOn: true,
    value: (s) => (s === "optimistic" ? 8 : 10),
  },
  {
    id: "rev.fee",
    name: "Phí sàn Reward",
    note: "Trừ payout, không cộng giá backer.",
    unit: "pct",
    defaultOn: true,
    value: () => 8,
  },
  {
    id: "rev.tip",
    name: "Tip Donation",
    note: "Tỷ lệ boa tự chọn trên GMV ủng hộ.",
    unit: "pct",
    defaultOn: true,
    value: (s) => (s === "optimistic" ? 8 : 3),
  },
];

const CURRENT_LINES: LineDef[] = [
  {
    id: "current.vercel",
    name: "Vercel Pro",
    note: "20 USD/ghế + credit 20 USD. Usage thêm khi tải lớn. Bảng Pro 9/2026.",
    unit: "usd",
    defaultOn: true,
    value: (s) => (s === "optimistic" ? 60 : 20),
  },
  {
    id: "current.neon",
    name: "Neon Postgres",
    note: "Launch 0,106 USD/CU-giờ, storage 0,35 USD/GB-tháng. Free khi ít tải.",
    unit: "usd",
    defaultOn: true,
    value: (s) => (s === "optimistic" ? 40 : 10),
  },
  {
    id: "current.cloudinary",
    name: "Cloudinary",
    note: "Free 25 credit. Plus 99 USD / 225 credit khi ảnh KYC + media tăng.",
    unit: "usd",
    defaultOn: true,
    value: (s) => (s === "optimistic" ? 99 : 0),
  },
  {
    id: "current.redis",
    name: "Redis (Upstash)",
    note: "Free 256MB. Fixed 10 USD gói 250MB.",
    unit: "usd",
    defaultOn: true,
    value: (s) => (s === "optimistic" ? 10 : 0),
  },
  {
    id: "current.mongo",
    name: "MongoDB Atlas (chat)",
    note: "M0 free 512MB. Flex 8–30 USD.",
    unit: "usd",
    defaultOn: true,
    value: (s) => (s === "optimistic" ? 20 : 0),
  },
  {
    id: "current.sentry",
    name: "Sentry",
    note: "Developer free. Team 26 USD.",
    unit: "usd",
    defaultOn: true,
    value: (s) => (s === "optimistic" ? 26 : 0),
  },
  {
    id: "current.domain",
    name: "Tên miền + email",
    note: ".com/.vn + hộp thư, trải theo tháng.",
    unit: "dong",
    defaultOn: true,
    value: () => 150_000,
  },
];

const CHEAP_LINES: LineDef[] = [
  {
    id: "cheap.vps1",
    name: "VPS Việt Nam một máy (năm 2–3)",
    note: "GenCloud / AZDIGI / Vinahost khoảng 50.000–150.000 đ: 1–2 vCPU, 1–4GB. App + Postgres + Redis một máy.",
    unit: "dong",
    defaultOn: true,
    value: () => 90_000,
  },
  {
    id: "cheap.vps2",
    name: "VPS thứ hai (tách DB)",
    note: "Chỉ khi năm 3 tách database. Mặc định tắt.",
    unit: "dong",
    defaultOn: false,
    value: () => 80_000,
  },
  {
    id: "cheap.backup",
    name: "Backup / snapshot",
    note: "Snapshot tuần. Nhiều gói rẻ đã gồm.",
    unit: "dong",
    defaultOn: true,
    value: () => 20_000,
  },
  {
    id: "cheap.cdn",
    name: "CDN ảnh tự host",
    note: "Thay Cloudinary. Ổ đĩa máy + nginx.",
    unit: "dong",
    defaultOn: false,
    value: () => 0,
  },
];

const MANUAL_LINES: LineDef[] = [
  {
    id: "manual.kyc",
    name: "Người duyệt KYC thủ công",
    note: "Xem CCCD/GPKD tay. 0,5–1 FTE × ~12 tr + BHXH 21,5% ≈ 14,6 tr/FTE.",
    unit: "trieu",
    defaultOn: true,
    value: (s) => (s === "optimistic" ? 14.6 : 7.3),
  },
  {
    id: "manual.cs",
    name: "CSKH / SLA / hoàn thủ công",
    note: "Inbox, Zalo, ticket. 0,5–1 FTE.",
    unit: "trieu",
    defaultOn: true,
    value: (s) => (s === "optimistic" ? 14.6 : 7.3),
  },
  {
    id: "manual.ekyc",
    name: "eKYC API",
    note: "Không dùng ở bản A. Bật nếu bạn vẫn mua gói máy.",
    unit: "trieu",
    defaultOn: false,
    value: () => 0,
  },
];

const HYBRID_LINES: LineDef[] = [
  {
    id: "hybrid.ekyc",
    name: "VNPT eKYC",
    note: "Gói 1: 800.000 + VAT = 880.000 (1.000 request). Gói 4: 8,8 triệu (10.000 request). vnptai.io/ekyc.",
    unit: "trieu",
    defaultOn: true,
    value: (s) => (s === "optimistic" ? 8.8 : 0.88),
  },
  {
    id: "hybrid.reviewer",
    name: "Người duyệt case lệch",
    note: "Máy fail / KYB. 0,2–0,4 FTE.",
    unit: "trieu",
    defaultOn: true,
    value: (s) => (s === "optimistic" ? 5.84 : 2.92),
  },
  {
    id: "hybrid.cs",
    name: "CSKH lai — bot + người",
    note: "FAQ/trạng thái tự động. Người xử lý hoàn, SLA, tranh chấp.",
    unit: "trieu",
    defaultOn: true,
    value: (s) => (s === "optimistic" ? 7.3 : 4.38),
  },
  {
    id: "hybrid.bot",
    name: "Tool chatbot / helpdesk",
    note: "Widget FAQ hoặc ticket nhẹ.",
    unit: "trieu",
    defaultOn: true,
    value: (s) => (s === "optimistic" ? 0.5 : 0.2),
  },
];

const LEGAL_LINES: LineDef[] = [
  {
    id: "legal.ketoan",
    name: "Kế toán thuế trọn gói",
    note: "Gói startup 1,5–2,5 triệu/tháng (ít hóa đơn).",
    unit: "trieu",
    defaultOn: true,
    value: () => 1.5,
  },
  {
    id: "legal.cks",
    name: "Chữ ký số + hóa đơn điện tử",
    note: "Gói 1 năm ~1,1–1,3 triệu → trải tháng.",
    unit: "dong",
    defaultOn: true,
    value: () => 100_000,
  },
  {
    id: "legal.luat",
    name: "Luật sư hỏi đáp định kỳ",
    note: "Option hỏi ~1 triệu/tháng. Soạn ToS 8–20 triệu một lần, không trải.",
    unit: "trieu",
    defaultOn: true,
    value: () => 1,
  },
];

const PARTNER_LINES: LineDef[] = [
  {
    id: "partner.rev.tnhh",
    name: "Thu — gói thành lập TNHH / hộ KD + MST",
    note: "Creator trả sàn. Sàn làm với luật/kế toán đối tác. Năm 1 có thể 0 gói.",
    unit: "trieu",
    defaultOn: true,
    side: "revenue",
    value: (s) => (s === "optimistic" ? 4 : 0),
  },
  {
    id: "partner.rev.ketoan",
    name: "Thu — gói kế toán thuế năm đầu",
    note: "Khai thuế, hóa đơn, BHXH. Thu của Creator, chia đối tác.",
    unit: "trieu",
    defaultOn: true,
    side: "revenue",
    value: (s) => (s === "optimistic" ? 3 : 0),
  },
  {
    id: "partner.rev.tos",
    name: "Thu — gói ToS / HĐ chiến dịch / chính sách hoàn",
    note: "Soạn điều khoản gây quỹ, SLA giao hàng, hoàn tiền.",
    unit: "trieu",
    defaultOn: true,
    side: "revenue",
    value: (s) => (s === "optimistic" ? 2 : 0),
  },
  {
    id: "partner.rev.kyb",
    name: "Thu — gói KYB / đăng ký TMĐT cho Creator",
    note: "Giấy phép KD, hồ sơ sàn TMĐT Bộ Công Thương phía người bán.",
    unit: "trieu",
    defaultOn: true,
    side: "revenue",
    value: (s) => (s === "optimistic" ? 2 : 0),
  },
  {
    id: "partner.rev.workshop",
    name: "Thu — workshop pháp lý / tài chính founder",
    note: "Lớp chung với đối tác. Sàn lấy vé hoặc tài trợ.",
    unit: "trieu",
    defaultOn: false,
    side: "revenue",
    value: (s) => (s === "optimistic" ? 1.5 : 0),
  },
  {
    id: "partner.cost.chuyen",
    name: "Chi — trả luật sư / kế toán đối tác",
    note: "Thường 60–70% giá gói. Sửa cho khớp hợp đồng chia.",
    unit: "trieu",
    defaultOn: true,
    value: (s) => (s === "optimistic" ? 7.5 : 0),
  },
  {
    id: "partner.cost.retainer",
    name: "Chi — retainer giữ chỗ chuyên gia",
    note: "Phí cố định tháng, kể cả khi chưa có gói. Năm 1 nên tắt.",
    unit: "trieu",
    defaultOn: false,
    value: () => 2,
  },
  {
    id: "partner.cost.hoahong",
    name: "Chi — hoa hồng vườn ươm / CLB / hiệp hội",
    note: "Trường, incubator, hiệp hội startup giới thiệu founder.",
    unit: "trieu",
    defaultOn: false,
    value: (s) => (s === "optimistic" ? 0.8 : 0.3),
  },
];

const PAY_LINES: LineDef[] = [
  {
    id: "pay.bank",
    name: "Phí tài khoản trung gian / duy trì STK",
    note: "Phí quản lý TK doanh nghiệp, SMS ngân hàng. VietQR IBFT P2P thường 0%.",
    unit: "trieu",
    defaultOn: true,
    value: () => 0.2,
  },
  {
    id: "pay.gateway",
    name: "Phí cổng thẻ / ví (nếu bật)",
    note: "Mặc định tắt — chuyển khoản VietQR. Bật khi nhận thẻ/Visa/MoMo. 1,5–3% GMV thành công.",
    unit: "pct_gmv",
    defaultOn: false,
    value: () => 1.5,
  },
  {
    id: "pay.payout",
    name: "Phí chi hộ Creator (lô giải ngân)",
    note: "Chuyển khoản hàng loạt khi chốt chiến dịch. Nhiều NH miễn trong NH.",
    unit: "trieu",
    defaultOn: false,
    value: () => 0.15,
  },
];

const OFFICE_LINES: LineDef[] = [
  {
    id: "office.rent",
    name: "Coworking / nhà / văn phòng",
    note: "Năm 1 làm remote = 0. Coworking Biên Hòa / HCM khoảng 1,5–4 triệu/chỗ.",
    unit: "trieu",
    defaultOn: false,
    value: () => 2.5,
  },
  {
    id: "office.net",
    name: "Internet + điện tại chỗ làm việc",
    note: "Chỉ cộng nếu tách khỏi chi phí nhà riêng.",
    unit: "trieu",
    defaultOn: false,
    value: () => 0.4,
  },
  {
    id: "office.scan",
    name: "Máy scan CCCD / in ấn hồ sơ",
    note: "Khấu hao thiết bị + giấy mực.",
    unit: "trieu",
    defaultOn: false,
    value: () => 0.2,
  },
];

const INSURE_LINES: LineDef[] = [
  {
    id: "insure.cyber",
    name: "Bảo hiểm rò rỉ dữ liệu / cyber",
    note: "KYC/KYB chứa CCCD. Gói SME ước 0,5–2 triệu/tháng khi trải năm.",
    unit: "trieu",
    defaultOn: true,
    value: (s) => (s === "optimistic" ? 1.5 : 0.5),
  },
  {
    id: "insure.pi",
    name: "Bảo hiểm trách nhiệm nghề nghiệp",
    note: "Tranh chấp giao hàng / giữ hộ. Không bắt buộc năm 1.",
    unit: "trieu",
    defaultOn: false,
    value: () => 0.8,
  },
];

const TOOLS_LINES: LineDef[] = [
  {
    id: "tools.workspace",
    name: "Google Workspace / Microsoft 365",
    note: "Business Starter khoảng 7 USD/user. 1–2 user năm 1.",
    unit: "usd",
    defaultOn: true,
    value: () => 7,
  },
  {
    id: "tools.zalo",
    name: "Zalo OA / fanpage",
    note: "OA miễn phí; gói trả phí khi gửi ZNS hàng loạt.",
    unit: "trieu",
    defaultOn: false,
    value: () => 0.5,
  },
  {
    id: "tools.sms",
    name: "SMS OTP / email transactional",
    note: "OTP đăng nhập, thông báo đơn. Nhà VN khoảng 200–400 đ/SMS.",
    unit: "trieu",
    defaultOn: true,
    value: (s) => (s === "optimistic" ? 1.2 : 0.2),
  },
  {
    id: "tools.cf",
    name: "Cloudflare (nếu tách khỏi Vercel)",
    note: "Free đủ năm 1. Pro 20 USD khi cần WAF/bot.",
    unit: "usd",
    defaultOn: false,
    value: () => 20,
  },
];

const GROW_LINES: LineDef[] = [
  {
    id: "grow.school",
    name: "Hợp tác trường / cuộc thi / vườn ươm",
    note: "Tài trợ giải, booth, mentor. Đổi deal-flow founder.",
    unit: "trieu",
    defaultOn: false,
    value: (s) => (s === "optimistic" ? 3 : 1),
  },
  {
    id: "grow.event",
    name: "Sự kiện cộng đồng Creator",
    note: "Meetup, livestream khai trương.",
    unit: "trieu",
    defaultOn: false,
    value: (s) => (s === "optimistic" ? 2 : 0.5),
  },
  {
    id: "grow.pr",
    name: "PR / báo chí / KOL nhỏ",
    note: "Bài báo, review. Tách khỏi ads performance.",
    unit: "trieu",
    defaultOn: false,
    value: (s) => (s === "optimistic" ? 3 : 0),
  },
];

const FOUNDER_LINES: LineDef[] = [
  {
    id: "founder.salary",
    name: "Lương founder tối thiểu",
    note: "Đồ án có thể 0. P&L vận hành nên tính.",
    unit: "trieu",
    defaultOn: true,
    value: () => 15,
  },
];

const MARKETING_LINES: LineDef[] = [
  {
    id: "mkt.ads",
    name: "Content + ads",
    note: "Năm 1 organic + ads nhỏ. Trần lạc quan không thể 0 đồng.",
    unit: "trieu",
    defaultOn: true,
    value: (s) => (s === "optimistic" ? 20 : 8),
  },
];

const ALL_DEFS = [
  ...REVENUE_LINES,
  ...CURRENT_LINES,
  ...CHEAP_LINES,
  ...MANUAL_LINES,
  ...HYBRID_LINES,
  ...LEGAL_LINES,
  ...PARTNER_LINES,
  ...PAY_LINES,
  ...OFFICE_LINES,
  ...INSURE_LINES,
  ...TOOLS_LINES,
  ...GROW_LINES,
  ...FOUNDER_LINES,
  ...MARKETING_LINES,
];

function defaultsFor(s: Scenario): Record<string, LineLive> {
  const out: Record<string, LineLive> = {};
  for (const line of ALL_DEFS) {
    out[line.id] = { on: line.defaultOn, value: line.value(s) };
  }
  return out;
}

type OptKey =
  | "legal"
  | "partner"
  | "pay"
  | "office"
  | "insure"
  | "tools"
  | "grow"
  | "founder"
  | "marketing";

const OPT_OFF: Record<OptKey, boolean> = {
  legal: false,
  partner: false,
  pay: false,
  office: false,
  insure: false,
  tools: false,
  grow: false,
  founder: false,
  marketing: false,
};

type Persist = {
  scenario: Scenario;
  revenueOn: boolean;
  infra: Infra | null;
  ops: Ops | null;
  opt: Record<OptKey, boolean>;
  usdRate: number;
  lines: Record<string, LineLive>;
};

function loadPersist(): Persist | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Persist;
    return parsed;
  } catch {
    return null;
  }
}

export default function PresentationPnlChecklist({ stats }: { stats?: PresentationLiveStats | null }) {
  const [scenario, setScenario] = useState<Scenario>("early");
  const [revenueOn, setRevenueOn] = useState(false);
  const [infra, setInfra] = useState<Infra | null>(null);
  const [ops, setOps] = useState<Ops | null>(null);
  const [opt, setOpt] = useState<Record<OptKey, boolean>>(OPT_OFF);
  const [usdRate, setUsdRate] = useState(USD_DEFAULT);
  const [creditVat, setCreditVat] = useState(true);
  const [applyFct, setApplyFct] = useState(true);
  const [lines, setLines] = useState<Record<string, LineLive>>(() => defaultsFor("early"));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = loadPersist();
    if (saved) {
      setScenario(saved.scenario);
      setRevenueOn(saved.revenueOn);
      setInfra(saved.infra);
      setOps(saved.ops);
      setOpt({ ...OPT_OFF, ...saved.opt });
      setUsdRate(saved.usdRate || USD_DEFAULT);
      setLines({ ...defaultsFor(saved.scenario), ...saved.lines });
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const payload: Persist = {
      scenario,
      revenueOn,
      infra,
      ops,
      opt,
      usdRate,
      lines,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [hydrated, scenario, revenueOn, infra, ops, opt, usdRate, lines]);

  const changeScenario = useCallback((next: Scenario) => {
    setScenario(next);
    setLines((prev) => {
      const fresh = defaultsFor(next);
      const merged: Record<string, LineLive> = {};
      for (const def of ALL_DEFS) {
        merged[def.id] = {
          on: prev[def.id]?.on ?? fresh[def.id].on,
          value: fresh[def.id].value,
        };
      }
      return merged;
    });
  }, []);

  function live(id: string, def: LineDef): LineLive {
    return lines[id] ?? { on: def.defaultOn, value: def.value(scenario) };
  }

  function patchLine(id: string, patch: Partial<LineLive>) {
    setLines((prev) => {
      const def = ALL_DEFS.find((d) => d.id === id);
      const cur = prev[id] ?? (def ? { on: def.defaultOn, value: def.value(scenario) } : { on: true, value: 0 });
      return { ...prev, [id]: { ...cur, ...patch } };
    });
  }

  function toggleOpt(key: OptKey) {
    setOpt((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const gmvRewardQ = live("rev.gmvRewardQ", REVENUE_LINES[0]).on
    ? live("rev.gmvRewardQ", REVENUE_LINES[0]).value
    : 0;
  const gmvDonationQ = live("rev.gmvDonationQ", REVENUE_LINES[1]).on
    ? live("rev.gmvDonationQ", REVENUE_LINES[1]).value
    : 0;
  const refundPct = live("rev.refund", REVENUE_LINES[2]).on
    ? live("rev.refund", REVENUE_LINES[2]).value
    : 0;
  const feePct = live("rev.fee", REVENUE_LINES[3]).on ? live("rev.fee", REVENUE_LINES[3]).value : 0;
  const tipPct = live("rev.tip", REVENUE_LINES[4]).on ? live("rev.tip", REVENUE_LINES[4]).value : 0;
  const gmvSuccessQ = gmvRewardQ * (1 - refundPct / 100);

  const rewardFeeGross = revenueOn ? gmvSuccessQ * (feePct / 100) : 0;
  const tipGross = revenueOn ? gmvDonationQ * (tipPct / 100) : 0;

  function groupRevQ(defs: LineDef[], parentOn: boolean) {
    if (!parentOn) return 0;
    return defs.reduce((acc, def) => {
      if (def.side !== "revenue") return acc;
      const row = live(def.id, def);
      if (!row.on) return acc;
      return acc + toTrieu(row.value, def.unit, usdRate) * 3;
    }, 0);
  }

  function addOpex(bucket: TaxBucket, defs: LineDef[], parentOn: boolean) {
    if (!parentOn) return;
    for (const def of defs) {
      if (def.side === "revenue") continue;
      const row = live(def.id, def);
      if (!row.on) continue;
      const amountQ =
        def.unit === "pct_gmv"
          ? gmvSuccessQ * (row.value / 100)
          : toTrieu(row.value, def.unit, usdRate) * 3;
      applyTax(bucket, def, amountQ, creditVat, applyFct);
    }
  }

  const partnerRevQ = groupRevQ(PARTNER_LINES, opt.partner);
  const coreGrossQ = rewardFeeGross + tipGross;
  const grossQ = coreGrossQ + partnerRevQ;
  const netQ = grossQ / 1.1;
  const outputVatQ = grossQ - netQ;

  const bucket: TaxBucket = { net: 0, inputVat: 0, fctCit: 0, vatHost: 0, vatOther: 0 };
  addOpex(bucket, CURRENT_LINES, infra === "current");
  addOpex(bucket, CHEAP_LINES, infra === "cheap");
  addOpex(bucket, MANUAL_LINES, ops === "manual");
  addOpex(bucket, HYBRID_LINES, ops === "hybrid");
  addOpex(bucket, LEGAL_LINES, opt.legal);
  addOpex(bucket, PARTNER_LINES, opt.partner);
  addOpex(bucket, PAY_LINES, opt.pay);
  addOpex(bucket, OFFICE_LINES, opt.office);
  addOpex(bucket, INSURE_LINES, opt.insure);
  addOpex(bucket, TOOLS_LINES, opt.tools);
  addOpex(bucket, GROW_LINES, opt.grow);
  addOpex(bucket, FOUNDER_LINES, opt.founder);
  addOpex(bucket, MARKETING_LINES, opt.marketing);

  const opexQ = bucket.net + bucket.fctCit;
  const opexY = opexQ * 4;
  const ebtQ = netQ - opexQ;
  const ebtY = netQ * 4 - opexY;
  const cit = taxRate(netQ * 4);
  const taxQ = ebtQ > 0 ? ebtQ * cit : 0;
  const taxY = ebtY > 0 ? ebtY * cit : 0;
  const patQ = ebtQ - taxQ;
  const patY = ebtY - taxY;
  const vatPayableQ = Math.max(0, outputVatQ - bucket.inputVat);
  const vatCarryQ = Math.max(0, bucket.inputVat - outputVatQ);
  const nsnnQ = taxQ + vatPayableQ;
  const cashAfterQ = patQ - vatPayableQ;

  const ready = revenueOn && infra !== null && ops !== null;

  const missing = [
    !revenueOn ? "Kịch bản doanh thu" : null,
    infra === null ? "Một phương án hạ tầng (đang xài hoặc VPS rẻ)" : null,
    ops === null ? "Một bản vận hành (A thủ công hoặc B eKYC)" : null,
  ].filter(Boolean) as string[];

  function resetDefaults() {
    setLines(defaultsFor(scenario));
    setUsdRate(USD_DEFAULT);
  }

  function applyLiveQuarter() {
    if (!stats) return;
    const rewardTrieu = stats.quarter.rewardAmount / 1_000_000;
    const donationTrieu = stats.quarter.donationAmount / 1_000_000;
    const tipPctLive =
      stats.quarter.donationAmount > 0
        ? Math.round((stats.quarter.donationTip / stats.quarter.donationAmount) * 10000) / 100
        : 0;
    setRevenueOn(true);
    setLines((prev) => ({
      ...prev,
      "rev.gmvRewardQ": { on: true, value: Number(rewardTrieu.toFixed(2)) },
      "rev.gmvDonationQ": { on: true, value: Number(donationTrieu.toFixed(2)) },
      "rev.tip": { on: true, value: tipPctLive },
    }));
  }

  const optHint = [
    opt.legal && "pháp lý công ty",
    opt.partner && "hồ sơ startup",
    opt.pay && "thanh toán",
    opt.office && "văn phòng",
    opt.insure && "bảo hiểm",
    opt.tools && "công cụ",
    opt.grow && "hệ sinh thái",
    opt.founder && "lương founder",
    opt.marketing && "marketing",
  ]
    .filter(Boolean)
    .join(" · ");

  const missingBox = (
    <div className="rounded-[1.5rem] border border-dashed border-amber-300 bg-amber-50 px-4 py-4">
      <div className="text-sm font-black text-amber-950">Bảng doanh thu chưa hiện</div>
      <p className="mt-1 text-sm text-amber-900">
        Tích đủ ba mục bắt buộc. Mọi mục dưới là tuỳ chọn — không tích thì không cộng.
      </p>
      <ul className="mt-3 space-y-1 text-sm text-amber-950">
        {missing.map((item) => (
          <li key={item}>○ {item}</li>
        ))}
      </ul>
    </div>
  );

  const pnlBox = (
    <div className="overflow-hidden rounded-[1.5rem] border border-emerald-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 bg-emerald-800 px-4 py-3 text-white">
        <Calculator size={16} />
        <span className="text-sm font-black">Bảng doanh thu — quý và năm</span>
      </div>
      <div className="flex flex-wrap gap-3 border-b border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-950">
        <label className="inline-flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            className="accent-emerald-700"
            checked={creditVat}
            onChange={() => setCreditVat((v) => !v)}
          />
          Khấu trừ VAT đầu vào (NĐ 181/2025)
        </label>
        <label className="inline-flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            className="accent-emerald-700"
            checked={applyFct}
            onChange={() => setApplyFct((v) => !v)}
          />
          FCT cloud/hosting ngoại 10% VAT + 5% TNDN
        </label>
      </div>
      <div className="grid gap-px bg-gray-100 sm:grid-cols-2">
        <PnlCol
          label="Một quý"
          rows={[
            ["GMV chảy qua sàn (không phải DT sàn)", trieu(gmvRewardQ + gmvDonationQ)],
            ["Doanh thu gồm VAT", trieu(grossQ)],
            ["Doanh thu thuần (đã tách VAT đầu ra)", trieu(netQ)],
            ["VAT đầu ra 10% trên phí sàn", trieu(outputVatQ)],
            ["VAT đầu vào VPS / hosting / cloud", trieu(bucket.vatHost)],
            ["VAT đầu vào dịch vụ VN khác (eKYC, luật, VP…)", trieu(bucket.vatOther)],
            ["VAT đầu vào tổng — khấu trừ kỳ này", trieu(bucket.inputVat)],
            ["VAT phải nộp = đầu ra − đầu vào", trieu(vatPayableQ)],
            ["VAT còn chuyển kỳ sau (nếu đầu vào lớn hơn)", trieu(vatCarryQ)],
            ["Cục Thuế hoàn tiền mặt", "0 — đã trừ vào VAT phải nộp"],
            ["Chi phí thuần + FCT TNDN", trieu(opexQ)],
            ["Trong đó FCT TNDN cloud ngoại", trieu(bucket.fctCit)],
            ["Lãi trước thuế TNDN", trieu(ebtQ)],
            [`Thuế TNDN ${(cit * 100).toFixed(0)}%`, trieu(taxQ)],
            ["Lãi sau thuế TNDN", trieu(patQ)],
            ["Nộp NSNN (TNDN + VAT phải nộp)", trieu(nsnnQ)],
            ["Lãi sau thuế − VAT phải nộp", trieu(cashAfterQ)],
          ]}
          highlight={patQ}
        />
        <PnlCol
          label="Một năm (×4 quý cùng số)"
          rows={[
            ["Doanh thu gồm VAT", trieu(grossQ * 4)],
            ["Doanh thu thuần", trieu(netQ * 4)],
            ["VAT đầu ra", trieu(outputVatQ * 4)],
            ["VAT đầu vào VPS / hosting / cloud", trieu(bucket.vatHost * 4)],
            ["VAT đầu vào khác", trieu(bucket.vatOther * 4)],
            ["VAT đầu vào tổng", trieu(bucket.inputVat * 4)],
            ["VAT phải nộp", trieu(vatPayableQ * 4)],
            ["Cục Thuế hoàn tiền mặt", "0 — đã trừ vào VAT phải nộp"],
            ["Chi phí thuần + FCT TNDN", trieu(opexY)],
            ["Lãi trước thuế TNDN", trieu(ebtY)],
            [`Thuế TNDN ${(cit * 100).toFixed(0)}%`, trieu(taxY)],
            ["Lãi sau thuế TNDN", trieu(patY)],
            ["Nộp NSNN (TNDN + VAT)", trieu(nsnnQ * 4)],
            ["Lãi sau thuế − VAT phải nộp", trieu(cashAfterQ * 4)],
          ]}
          highlight={patY}
        />
      </div>
      <p className="px-4 py-3 text-[11px] leading-relaxed text-gray-500">
        Mua VPS GenCloud/AZDIGI, domain, eKYC VNPT: giá thường đã gồm GTGT 10% — phần 10/110 được khấu trừ, giảm
        VAT phải nộp, không chờ Cục Thuế chuyển tiền. Cloud ngoại (Vercel, Neon, Cloudinary): Công văn 296/CT-CS
        (19/01/2026) và AWS từ 01/7/2025 thu GTGT 10% trên dịch vụ đám mây; mô hình cộng 10% VAT (khấu trừ) + 5%
        TNDN nhà thầu (chi phí). “Hoàn” ở đây = trừ vào VAT đầu ra cùng kỳ. Hoàn tiền mặt chỉ khi dư đầu vào từ
        300 triệu và thuộc XK / dự án đầu tư — sàn đang bán dịch vụ 10% thì gần như không xảy ra. Hóa đơn dưới 5
        triệu vẫn khấu trừ dù trả tiền mặt (NĐ 181/2025). Tắt ô khấu trừ nếu muốn xem bản chưa trừ VAT mua host.
        {optHint ? ` Đang cộng: ${optHint}.` : ""} Tỷ giá {usdRate.toLocaleString("vi-VN")} đ/USD.
      </p>
    </div>
  );

  return (
    <div className="space-y-4 text-left">
      {stats ? <LiveTable stats={stats} /> : (
        <div className="rounded-[1.5rem] border border-dashed border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          Không lấy được số liệu từ Neon.
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-gray-500">
          Bảng trên là số đang chạy trên Neon. Bên dưới là kịch bản P&L giả lập — có thể đổ GMV quý này vào.
        </p>
        <div className="flex flex-wrap gap-2">
          {stats ? (
            <button
              type="button"
              onClick={applyLiveQuarter}
              className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-800"
            >
              Đổ GMV quý này vào P&L
            </button>
          ) : null}
          <button
            type="button"
            onClick={resetDefaults}
            className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-black text-gray-600"
          >
            Khôi phục số mặc định
          </button>
        </div>
      </div>

      {ready ? pnlBox : missingBox}

      <Group
        checked={revenueOn}
        onToggle={() => setRevenueOn((v) => !v)}
        title="Doanh thu theo quý / năm"
        required
        hint={revenueOn ? undefined : "Bắt buộc"}
      >
        <div className="mb-3 flex flex-wrap gap-2">
          <Choice active={scenario === "early"} onClick={() => changeScenario("early")} label="Sớm — năm 1" />
          <Choice
            active={scenario === "optimistic"}
            onClick={() => changeScenario("optimistic")}
            label="Lạc quan — trần giả định"
          />
        </div>
        <p className="mb-3 text-sm text-gray-600">
          {scenario === "optimistic"
            ? "Trần giả định, không phải số đã đạt. Sửa GMV / % cho sát số bạn tính."
            : "Năm 1: GMV Reward khoảng 400 triệu/tháng. Sửa từng ô nếu bạn có số khác."}
        </p>
        <LineList defs={REVENUE_LINES} lines={lines} scenario={scenario} onPatch={patchLine} usdRate={usdRate} gmvSuccessQ={gmvSuccessQ} />
      </Group>

      <Group
        checked={infra === "current"}
        onToggle={() => setInfra((v) => (v === "current" ? null : "current"))}
        title="Hạ tầng đang xài — Vercel, Neon, Cloudinary, Redis, Mongo"
        required
        hint={infra === "current" ? "Đang dùng cho bảng" : "Chọn một trong hai hạ tầng"}
      >
        <label className="mb-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="font-bold text-slate-800">Tỷ giá USD</span>
          <NumInput value={usdRate} onChange={setUsdRate} />
          <span className="text-xs text-gray-500">đ / USD — sửa khi tỷ giá đổi</span>
        </label>
        <LineList defs={CURRENT_LINES} lines={lines} scenario={scenario} onPatch={patchLine} usdRate={usdRate} gmvSuccessQ={gmvSuccessQ} />
      </Group>

      <Group
        checked={infra === "cheap"}
        onToggle={() => setInfra((v) => (v === "cheap" ? null : "cheap"))}
        title="Hạ tầng rẻ nhất — VPS 30.000–150.000 đ (năm 2–3)"
        required
        hint={infra === "cheap" ? "Đang dùng cho bảng" : "Chọn một trong hai hạ tầng"}
      >
        <p className="mb-3 text-sm text-gray-600">
          Tự host máy trong nước. Sửa đúng giá gói bạn xem trên GenCloud / AZDIGI / Vinahost. Không cộng cùng
          stack đang xài.
        </p>
        <LineList defs={CHEAP_LINES} lines={lines} scenario={scenario} onPatch={patchLine} usdRate={usdRate} gmvSuccessQ={gmvSuccessQ} />
      </Group>

      <Group
        checked={ops === "manual"}
        onToggle={() => setOps((v) => (v === "manual" ? null : "manual"))}
        title="Bản A — KYC thủ công + CSKH thủ công"
        required
        hint={ops === "manual" ? "Đang dùng cho bảng" : "Chọn một trong hai bản vận hành"}
      >
        <p className="mb-3 text-sm text-gray-600">
          Phù hợp đồ án và dưới 50 hồ sơ/tháng. Sửa lương FTE nếu mức địa phương khác.
        </p>
        <LineList defs={MANUAL_LINES} lines={lines} scenario={scenario} onPatch={patchLine} usdRate={usdRate} gmvSuccessQ={gmvSuccessQ} />
      </Group>

      <Group
        checked={ops === "hybrid"}
        onToggle={() => setOps((v) => (v === "hybrid" ? null : "hybrid"))}
        title="Bản B — eKYC + CSKH tự động kết hợp thủ công"
        required
        hint={ops === "hybrid" ? "Đang dùng cho bảng" : "Chọn một trong hai bản vận hành"}
      >
        <p className="mb-3 text-sm text-gray-600">
          Sửa giá gói VNPT / FPT khi nhà cung cấp đổi bảng. Bot không xóa hết người.
        </p>
        <LineList defs={HYBRID_LINES} lines={lines} scenario={scenario} onPatch={patchLine} usdRate={usdRate} gmvSuccessQ={gmvSuccessQ} />
      </Group>

      <Group
        checked={opt.legal}
        onToggle={() => toggleOpt("legal")}
        title="Pháp lý · thuế · chữ ký số của công ty sàn"
        hint="Tuỳ chọn"
      >
        <LineList defs={LEGAL_LINES} lines={lines} scenario={scenario} onPatch={patchLine} usdRate={usdRate} gmvSuccessQ={gmvSuccessQ} />
      </Group>

      <Group
        checked={opt.partner}
        onToggle={() => toggleOpt("partner")}
        title="Hợp tác tổ chức / DN ngoài — tư vấn hồ sơ startup"
        hint="Tuỳ chọn — thu gói hồ sơ và chi trả đối tác"
      >
        <p className="mb-3 text-sm text-gray-600">
          Sàn không tự làm luật/kế toán. Nối Creator với công ty luật, dịch vụ kế toán, vườn ươm. Có dòng thu
          (Creator trả gói) và dòng chi (trả đối tác, hoa hồng). Tích dòng con để cộng đúng bên.
        </p>
        <LineList defs={PARTNER_LINES} lines={lines} scenario={scenario} onPatch={patchLine} usdRate={usdRate} gmvSuccessQ={gmvSuccessQ} />
      </Group>

      <Group
        checked={opt.pay}
        onToggle={() => toggleOpt("pay")}
        title="Ngân hàng / cổng thanh toán"
        hint="Tuỳ chọn — VietQR mặc định 0% GMV"
      >
        <LineList defs={PAY_LINES} lines={lines} scenario={scenario} onPatch={patchLine} usdRate={usdRate} gmvSuccessQ={gmvSuccessQ} />
      </Group>

      <Group
        checked={opt.office}
        onToggle={() => toggleOpt("office")}
        title="Văn phòng / coworking / thiết bị"
        hint="Tuỳ chọn — remote thì để tắt"
      >
        <LineList defs={OFFICE_LINES} lines={lines} scenario={scenario} onPatch={patchLine} usdRate={usdRate} gmvSuccessQ={gmvSuccessQ} />
      </Group>

      <Group
        checked={opt.insure}
        onToggle={() => toggleOpt("insure")}
        title="Bảo hiểm dữ liệu và trách nhiệm"
        hint="Tuỳ chọn"
      >
        <LineList defs={INSURE_LINES} lines={lines} scenario={scenario} onPatch={patchLine} usdRate={usdRate} gmvSuccessQ={gmvSuccessQ} />
      </Group>

      <Group
        checked={opt.tools}
        onToggle={() => toggleOpt("tools")}
        title="Công cụ vận hành — Workspace, OTP, Zalo OA"
        hint="Tuỳ chọn"
      >
        <LineList defs={TOOLS_LINES} lines={lines} scenario={scenario} onPatch={patchLine} usdRate={usdRate} gmvSuccessQ={gmvSuccessQ} />
      </Group>

      <Group
        checked={opt.grow}
        onToggle={() => toggleOpt("grow")}
        title="Hệ sinh thái — trường, vườn ươm, sự kiện, PR"
        hint="Tuỳ chọn"
      >
        <LineList defs={GROW_LINES} lines={lines} scenario={scenario} onPatch={patchLine} usdRate={usdRate} gmvSuccessQ={gmvSuccessQ} />
      </Group>

      <Group
        checked={opt.founder}
        onToggle={() => toggleOpt("founder")}
        title="Lương founder tối thiểu"
        hint="Tuỳ chọn"
      >
        <LineList defs={FOUNDER_LINES} lines={lines} scenario={scenario} onPatch={patchLine} usdRate={usdRate} gmvSuccessQ={gmvSuccessQ} />
      </Group>

      <Group
        checked={opt.marketing}
        onToggle={() => toggleOpt("marketing")}
        title="Marketing / content / ads"
        hint="Tuỳ chọn"
      >
        <LineList defs={MARKETING_LINES} lines={lines} scenario={scenario} onPatch={patchLine} usdRate={usdRate} gmvSuccessQ={gmvSuccessQ} />
      </Group>
    </div>
  );
}

function Group({
  checked,
  onToggle,
  title,
  required,
  hint,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  title: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[1.25rem] border bg-white shadow-sm ${
        checked ? "border-emerald-200" : "border-gray-200"
      }`}
    >
      <label className="flex cursor-pointer items-start gap-3 px-4 py-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="mt-1 h-4 w-4 shrink-0 accent-emerald-700"
        />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-black text-slate-900">{title}</span>
          {!checked && hint ? (
            <span className={`text-[11px] ${required ? "text-amber-700" : "text-gray-400"}`}>{hint}</span>
          ) : null}
        </span>
        {required ? (
          <span className="mt-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-800">
            Bắt buộc
          </span>
        ) : (
          <span className="mt-0.5 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-black text-gray-500">
            Tuỳ chọn
          </span>
        )}
      </label>
      {checked ? <div className="border-t border-gray-100 px-4 py-4">{children}</div> : null}
    </div>
  );
}

function LineList({
  defs,
  lines,
  scenario,
  onPatch,
  usdRate,
  gmvSuccessQ,
}: {
  defs: LineDef[];
  lines: Record<string, LineLive>;
  scenario: Scenario;
  onPatch: (id: string, patch: Partial<LineLive>) => void;
  usdRate: number;
  gmvSuccessQ: number;
}) {
  return (
    <ul className="space-y-2">
      {defs.map((def) => {
        const row = lines[def.id] ?? { on: def.defaultOn, value: def.value(scenario) };
        const isRev = def.side === "revenue" || def.id.startsWith("rev.");
        let shown = "";
        if (row.on && def.unit === "pct_gmv") {
          shown = `${trieu(gmvSuccessQ * (row.value / 100))}/quý`;
        } else if (row.on && def.unit !== "pct") {
          const month = toTrieu(row.value, def.unit, usdRate);
          shown = isRev && !def.id.startsWith("rev.")
            ? `${trieu(month)}/tháng · ${trieu(month * 3)}/quý`
            : def.id.startsWith("rev.")
              ? `${trieu(month)}/quý`
              : `${trieu(month)}/tháng`;
        }
        return (
          <li
            key={def.id}
            className={`rounded-xl px-3 py-2 ${row.on ? "bg-slate-50" : "bg-white opacity-60"}`}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  checked={row.on}
                  onChange={() => onPatch(def.id, { on: !row.on })}
                  className="mt-1 h-3.5 w-3.5 shrink-0 accent-emerald-700"
                />
                <span>
                  <span className="flex flex-wrap items-center gap-2">
                    {def.side === "revenue" ? (
                      <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-black text-emerald-800">
                        THU
                      </span>
                    ) : def.id.startsWith("rev.") ? null : (
                      <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-black text-slate-700">
                        CHI
                      </span>
                    )}
                    <span className="text-sm font-bold text-slate-900">{def.name}</span>
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-gray-500">{def.note}</span>
                </span>
              </label>
              <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
                <div className="flex items-center gap-1.5">
                  <NumInput
                    value={row.value}
                    onChange={(n) => onPatch(def.id, { value: n })}
                    disabled={!row.on}
                  />
                  <span className="whitespace-nowrap text-[11px] font-bold text-gray-500">
                    {lineUnitLabel(def)}
                  </span>
                </div>
                {shown ? (
                  <span className="text-[11px] font-black tabular-nums text-emerald-800">{shown}</span>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function NumInput({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
}) {
  const [text, setText] = useState(() => formatInput(value));
  useEffect(() => {
    setText(formatInput(value));
  }, [value]);

  return (
    <input
      type="text"
      inputMode="decimal"
      disabled={disabled}
      value={text}
      onChange={(e) => {
        const raw = e.target.value.replace(/\s/g, "");
        setText(raw);
        const parsed = parseInput(raw);
        if (parsed !== null) onChange(parsed);
      }}
      onBlur={() => setText(formatInput(value))}
      className="w-28 rounded-lg border border-gray-200 bg-white px-2 py-1 text-right text-sm font-black tabular-nums text-slate-900 disabled:bg-gray-100"
    />
  );
}

function formatInput(n: number) {
  if (Number.isInteger(n)) return String(n);
  return String(n).replace(".", ",");
}

function parseInput(raw: string): number | null {
  const s = raw.trim().replace(/\s/g, "");
  if (!s || s === "-" || s === "," || s === ".") return null;
  if (s.includes(",")) {
    const n = Number(s.replace(/\./g, "").replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
    const n = Number(s.replace(/\./g, ""));
    return Number.isFinite(n) ? n : null;
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function Choice({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-black ${
        active ? "bg-emerald-700 text-white" : "border border-gray-200 bg-white text-gray-600"
      }`}
    >
      {label}
    </button>
  );
}

function PnlCol({
  label,
  rows,
  highlight,
}: {
  label: string;
  rows: [string, string][];
  highlight: number;
}) {
  return (
    <div className="bg-white p-4">
      <div className="mb-2 text-[11px] font-black uppercase tracking-widest text-emerald-800">{label}</div>
      <dl className="space-y-1.5 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3">
            <dt className="text-gray-500">{k}</dt>
            <dd className="font-bold tabular-nums text-slate-900">{v}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-3 border-t pt-2">
          <dt className="font-black">Kết quả</dt>
          <dd className={`font-black tabular-nums ${highlight >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
            {trieu(highlight)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
