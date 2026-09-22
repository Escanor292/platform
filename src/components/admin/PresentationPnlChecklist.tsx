"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Calculator } from "lucide-react";

type Scenario = "early" | "optimistic";
type Infra = "current" | "cheap";
type Ops = "manual" | "hybrid";
type Unit = "dong" | "trieu" | "usd" | "pct";

type LineDef = {
  id: string;
  name: string;
  note: string;
  unit: Unit;
  defaultOn: boolean;
  value: (s: Scenario) => number;
};

type LineLive = { on: boolean; value: number };

const STORAGE_KEY = "ttf-pnl-checklist-v31";
const USD_DEFAULT = 26200;

function trieu(n: number) {
  const abs = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (abs >= 1000) {
    return `${sign}${(abs / 1000).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} tỷ`;
  }
  return `${sign}${abs.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} triệu`;
}

function lineUnitLabel(def: LineDef) {
  if (def.unit === "pct") return "%";
  if (def.unit === "usd") return "USD/tháng";
  if (def.unit === "dong") return "đ/tháng";
  if (def.id.startsWith("rev.")) return "triệu/quý";
  return "triệu/tháng";
}

function toTrieu(value: number, unit: Unit, usdRate: number) {
  if (unit === "dong") return value / 1_000_000;
  if (unit === "usd") return (value * usdRate) / 1_000_000;
  if (unit === "pct") return 0;
  return value;
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
  {
    id: "rev.vasQ",
    name: "VAS đóng gói hồ sơ / quý",
    note: "Lộ trình. Năm 1 có thể 0.",
    unit: "trieu",
    defaultOn: true,
    value: (s) => (s === "optimistic" ? 40 : 0),
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

const VAS_LINES: LineDef[] = [
  {
    id: "vas.retainer",
    name: "Retainer đối tác hồ sơ Creator",
    note: "White-label kế toán/luật. Năm 1 có thể tắt nếu chỉ giới thiệu.",
    unit: "trieu",
    defaultOn: true,
    value: () => 4,
  },
  {
    id: "vas.referral",
    name: "Hoa hồng giới thiệu (sàn trả)",
    note: "Thường Creator trả. Để 0 nếu chỉ nối.",
    unit: "trieu",
    defaultOn: false,
    value: () => 0,
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
  ...VAS_LINES,
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

type Persist = {
  scenario: Scenario;
  revenueOn: boolean;
  infra: Infra | null;
  ops: Ops | null;
  legalOn: boolean;
  vasOn: boolean;
  founderOn: boolean;
  marketingOn: boolean;
  usdRate: number;
  lines: Record<string, LineLive>;
};

function loadPersist(): Persist | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Persist;
  } catch {
    return null;
  }
}

export default function PresentationPnlChecklist() {
  const [scenario, setScenario] = useState<Scenario>("early");
  const [revenueOn, setRevenueOn] = useState(false);
  const [infra, setInfra] = useState<Infra | null>(null);
  const [ops, setOps] = useState<Ops | null>(null);
  const [legalOn, setLegalOn] = useState(false);
  const [vasOn, setVasOn] = useState(false);
  const [founderOn, setFounderOn] = useState(false);
  const [marketingOn, setMarketingOn] = useState(false);
  const [usdRate, setUsdRate] = useState(USD_DEFAULT);
  const [lines, setLines] = useState<Record<string, LineLive>>(() => defaultsFor("early"));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = loadPersist();
    if (saved) {
      setScenario(saved.scenario);
      setRevenueOn(saved.revenueOn);
      setInfra(saved.infra);
      setOps(saved.ops);
      setLegalOn(saved.legalOn);
      setVasOn(saved.vasOn);
      setFounderOn(saved.founderOn);
      setMarketingOn(saved.marketingOn);
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
      legalOn,
      vasOn,
      founderOn,
      marketingOn,
      usdRate,
      lines,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [
    hydrated,
    scenario,
    revenueOn,
    infra,
    ops,
    legalOn,
    vasOn,
    founderOn,
    marketingOn,
    usdRate,
    lines,
  ]);

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

  function sumGroup(defs: LineDef[], parentOn: boolean) {
    if (!parentOn) return 0;
    return defs.reduce((acc, def) => {
      const row = live(def.id, def);
      if (!row.on) return acc;
      return acc + toTrieu(row.value, def.unit, usdRate);
    }, 0);
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
  const vasQ = live("rev.vasQ", REVENUE_LINES[5]).on ? live("rev.vasQ", REVENUE_LINES[5]).value : 0;

  const rewardFeeGross = gmvRewardQ * (1 - refundPct / 100) * (feePct / 100);
  const tipGross = gmvDonationQ * (tipPct / 100);
  const grossQ = revenueOn ? rewardFeeGross + tipGross + vasQ : 0;
  const netQ = grossQ / 1.1;
  const vatQ = grossQ - netQ;

  const opexM =
    sumGroup(CURRENT_LINES, infra === "current") +
    sumGroup(CHEAP_LINES, infra === "cheap") +
    sumGroup(MANUAL_LINES, ops === "manual") +
    sumGroup(HYBRID_LINES, ops === "hybrid") +
    sumGroup(LEGAL_LINES, legalOn) +
    sumGroup(VAS_LINES, vasOn) +
    sumGroup(FOUNDER_LINES, founderOn) +
    sumGroup(MARKETING_LINES, marketingOn);

  const opexQ = opexM * 3;
  const opexY = opexM * 12;
  const ebtQ = netQ - opexQ;
  const ebtY = netQ * 4 - opexY;
  const cit = taxRate(netQ * 4);
  const taxQ = ebtQ > 0 ? ebtQ * cit : 0;
  const taxY = ebtY > 0 ? ebtY * cit : 0;
  const patQ = ebtQ - taxQ;
  const patY = ebtY - taxY;

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

  const missingBox = (
    <div className="rounded-[1.5rem] border border-dashed border-amber-300 bg-amber-50 px-4 py-4">
      <div className="text-sm font-black text-amber-950">Bảng doanh thu chưa hiện</div>
      <p className="mt-1 text-sm text-amber-900">
        Tích đủ ba mục bắt buộc. Pháp lý, đối tác, lương, marketing là tuỳ chọn.
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
      <div className="grid gap-px bg-gray-100 sm:grid-cols-2">
        <PnlCol
          label="Một quý"
          rows={[
            ["GMV chảy qua sàn", trieu(gmvRewardQ + gmvDonationQ)],
            ["Phí Reward (gồm VAT)", trieu(rewardFeeGross)],
            ["Tip Donation (gồm VAT)", trieu(tipGross)],
            ["VAS", trieu(vasQ)],
            ["Doanh thu gồm VAT", trieu(grossQ)],
            ["Doanh thu thuần", trieu(netQ)],
            ["VAT đầu ra ~10%", trieu(vatQ)],
            ["Chi phí (mục đã tích)", trieu(opexQ)],
            ["Lãi trước thuế", trieu(ebtQ)],
            [`Thuế TNDN ${(cit * 100).toFixed(0)}%`, trieu(taxQ)],
            ["Lãi sau thuế", trieu(patQ)],
          ]}
          highlight={patQ}
        />
        <PnlCol
          label="Một năm (×4 quý cùng số)"
          rows={[
            ["GMV chảy qua sàn", trieu((gmvRewardQ + gmvDonationQ) * 4)],
            ["Doanh thu gồm VAT", trieu(grossQ * 4)],
            ["Doanh thu thuần", trieu(netQ * 4)],
            ["VAT đầu ra", trieu(vatQ * 4)],
            ["Chi phí", trieu(opexY)],
            ["Lãi trước thuế", trieu(ebtY)],
            [`Thuế TNDN ${(cit * 100).toFixed(0)}%`, trieu(taxY)],
            ["Lãi sau thuế", trieu(patY)],
          ]}
          highlight={patY}
        />
      </div>
      <p className="px-4 py-3 text-[11px] leading-relaxed text-gray-500">
        Hạ tầng: {infra === "cheap" ? "VPS rẻ năm 2–3" : "đang xài"} · Vận hành:{" "}
        {ops === "hybrid" ? "Bản B eKYC + bot" : "Bản A thủ công"}
        {legalOn ? " · pháp lý" : ""}
        {vasOn ? " · VAS" : ""}
        {founderOn ? " · lương founder" : ""}
        {marketingOn ? " · marketing" : ""}. Tỷ giá {usdRate.toLocaleString("vi-VN")} đ/USD. GMV không phải
        doanh thu sàn. Số đã sửa được giữ trên máy này.
      </p>
    </div>
  );

  return (
    <div className="space-y-4 text-left">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-gray-500">
          Chưa tích: chỉ tiêu đề. Đã tích: dòng con + ô số. Sửa số theo giá bạn tra được. Bảng doanh thu chỉ
          hiện khi đã chọn doanh thu, một hạ tầng, một bản vận hành.
        </p>
        <button
          type="button"
          onClick={resetDefaults}
          className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-black text-gray-600"
        >
          Khôi phục số mặc định
        </button>
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
        <LineList defs={REVENUE_LINES} lines={lines} scenario={scenario} onPatch={patchLine} usdRate={usdRate} />
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
        <LineList defs={CURRENT_LINES} lines={lines} scenario={scenario} onPatch={patchLine} usdRate={usdRate} />
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
        <LineList defs={CHEAP_LINES} lines={lines} scenario={scenario} onPatch={patchLine} usdRate={usdRate} />
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
        <LineList defs={MANUAL_LINES} lines={lines} scenario={scenario} onPatch={patchLine} usdRate={usdRate} />
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
        <LineList defs={HYBRID_LINES} lines={lines} scenario={scenario} onPatch={patchLine} usdRate={usdRate} />
      </Group>

      <Group
        checked={legalOn}
        onToggle={() => setLegalOn((v) => !v)}
        title="Pháp lý · thuế · chữ ký số của công ty sàn"
        hint="Tuỳ chọn"
      >
        <LineList defs={LEGAL_LINES} lines={lines} scenario={scenario} onPatch={patchLine} usdRate={usdRate} />
      </Group>

      <Group
        checked={vasOn}
        onToggle={() => setVasOn((v) => !v)}
        title="Đối tác hỗ trợ giấy tờ pháp lý / thuế cho Creator"
        hint="Tuỳ chọn — mặc định không cộng"
      >
        <LineList defs={VAS_LINES} lines={lines} scenario={scenario} onPatch={patchLine} usdRate={usdRate} />
      </Group>

      <Group
        checked={founderOn}
        onToggle={() => setFounderOn((v) => !v)}
        title="Lương founder tối thiểu"
        hint="Tuỳ chọn"
      >
        <LineList defs={FOUNDER_LINES} lines={lines} scenario={scenario} onPatch={patchLine} usdRate={usdRate} />
      </Group>

      <Group
        checked={marketingOn}
        onToggle={() => setMarketingOn((v) => !v)}
        title="Marketing / content"
        hint="Tuỳ chọn"
      >
        <LineList defs={MARKETING_LINES} lines={lines} scenario={scenario} onPatch={patchLine} usdRate={usdRate} />
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
}: {
  defs: LineDef[];
  lines: Record<string, LineLive>;
  scenario: Scenario;
  onPatch: (id: string, patch: Partial<LineLive>) => void;
  usdRate: number;
}) {
  return (
    <ul className="space-y-2">
      {defs.map((def) => {
        const row = lines[def.id] ?? { on: def.defaultOn, value: def.value(scenario) };
        const asTrieu = toTrieu(row.value, def.unit, usdRate);
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
                  <span className="block text-sm font-bold text-slate-900">{def.name}</span>
                  <span className="block text-xs leading-relaxed text-gray-500">{def.note}</span>
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
                {row.on && def.unit !== "pct" ? (
                  <span className="text-[11px] font-black tabular-nums text-emerald-800">
                    {trieu(asTrieu)}
                    {def.id.startsWith("rev.") ? "" : "/tháng"}
                  </span>
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
