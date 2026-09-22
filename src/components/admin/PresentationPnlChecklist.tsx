"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Calculator } from "lucide-react";

type Scenario = "early" | "optimistic";
type Infra = "current" | "cheap";
type Ops = "manual" | "hybrid";

type Line = { name: string; note: string; month: number };

const USD = 26200;

function trieu(n: number) {
  const abs = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (abs >= 1000) {
    return `${sign}${(abs / 1000).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} tỷ`;
  }
  return `${sign}${abs.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} triệu`;
}

function dong(n: number) {
  return `${Math.round(n).toLocaleString("vi-VN")} đ`;
}

const SCENARIOS: Record<
  Scenario,
  {
    title: string;
    hint: string;
    gmvRewardQ: number;
    gmvDonationQ: number;
    refund: number;
    tipRate: number;
    vasQ: number;
    feeRate: number;
  }
> = {
  early: {
    title: "Kịch bản sớm — năm 1",
    hint: "GMV Reward 400 triệu/tháng. Donation tip thấp. Đơn vị: triệu đồng.",
    gmvRewardQ: 1_200,
    gmvDonationQ: 300,
    refund: 0.1,
    tipRate: 0.03,
    vasQ: 0,
    feeRate: 0.08,
  },
  optimistic: {
    title: "Kịch bản lạc quan — trần giả định",
    hint: "GMV Reward 8 tỷ/quý, Donation 4 tỷ/quý, hoàn 8%, tip 8%. Không phải số đã đạt.",
    gmvRewardQ: 8_000,
    gmvDonationQ: 4_000,
    refund: 0.08,
    tipRate: 0.08,
    vasQ: 40,
    feeRate: 0.08,
  },
};

function revenueOf(s: Scenario) {
  const r = SCENARIOS[s];
  const rewardFeeGross = r.gmvRewardQ * (1 - r.refund) * r.feeRate;
  const tipGross = r.gmvDonationQ * r.tipRate;
  const grossQ = rewardFeeGross + tipGross + r.vasQ;
  const netQ = grossQ / 1.1;
  const vatQ = grossQ - netQ;
  return {
    rewardFeeGross,
    tipGross,
    vasQ: r.vasQ,
    gmvRewardQ: r.gmvRewardQ,
    gmvDonationQ: r.gmvDonationQ,
    refund: r.refund,
    feeRate: r.feeRate,
    tipRate: r.tipRate,
    grossQ,
    netQ,
    vatQ,
    grossY: grossQ * 4,
    netY: netQ * 4,
    vatY: vatQ * 4,
    gmvY: (r.gmvRewardQ + r.gmvDonationQ) * 4,
  };
}

function infraCurrent(s: Scenario): Line[] {
  const scale = s === "optimistic";
  return [
    {
      name: "Vercel Pro",
      note: `20 USD/ghế + credit 20 USD; usage ${scale ? "40–80" : "0–20"} USD. Bảng giá Pro 9/2026.`,
      month: scale ? (60 * USD) / 1_000_000 : (20 * USD) / 1_000_000,
    },
    {
      name: "Neon Postgres",
      note: "Launch 0,106 USD/CU-giờ, storage 0,35 USD/GB-tháng. Free khi ít tải.",
      month: scale ? (40 * USD) / 1_000_000 : (10 * USD) / 1_000_000,
    },
    {
      name: "Cloudinary",
      note: scale
        ? "Plus 99 USD/tháng (225 credit) — ảnh KYC + media."
        : "Free 25 credit; chưa cần Plus.",
      month: scale ? (99 * USD) / 1_000_000 : 0,
    },
    {
      name: "Redis (Upstash)",
      note: "Free 256MB / Fixed 10 USD gói 250MB.",
      month: scale ? (10 * USD) / 1_000_000 : 0,
    },
    {
      name: "MongoDB Atlas (chat)",
      note: "M0 free 512MB / Flex 8–30 USD.",
      month: scale ? (20 * USD) / 1_000_000 : 0,
    },
    {
      name: "Sentry",
      note: "Developer free / Team 26 USD.",
      month: scale ? (26 * USD) / 1_000_000 : 0,
    },
    {
      name: "Tên miền + email",
      note: ".com/.vn + hộp thư, khấu hao năm.",
      month: 0.15,
    },
  ];
}

function infraCheap(): Line[] {
  return [
    {
      name: "VPS Việt Nam một máy (năm 2–3)",
      note: "GenCloud/AZDIGI/Vinahost khoảng 50.000–150.000 đ: 1–2 vCPU, 1–4GB. App + Postgres + Redis trên một máy. P&L lấy 90.000 đ (giữa khoảng).",
      month: 0.09,
    },
    {
      name: "VPS thứ hai (chỉ khi tách DB)",
      note: "Không mặc định. Thêm ~80.000–150.000 đ nếu năm 3 tách database. Không cộng vào P&L trừ khi tự host cụm.",
      month: 0,
    },
    {
      name: "Backup / snapshot",
      note: "Snapshot tuần. Nhiều nhà gói rẻ đã gồm; để 20.000 đ cho chắc.",
      month: 0.02,
    },
    {
      name: "CDN ảnh tự host",
      note: "Thay Cloudinary: ổ đĩa máy + nginx. Không Plus 99 USD.",
      month: 0,
    },
  ];
}

function opsManual(s: Scenario): Line[] {
  const scale = s === "optimistic";
  const fteCost = 14.6;
  return [
    {
      name: "Người duyệt KYC thủ công",
      note: `Xem CCCD/GPKD tay. ${scale ? "1 FTE" : "0,5 FTE"} × 12 tr + BHXH 21,5%.`,
      month: scale ? fteCost : fteCost * 0.5,
    },
    {
      name: "CSKH / SLA / hoàn thủ công",
      note: `Inbox, Zalo, ticket. ${scale ? "1 FTE" : "0,5 FTE"}.`,
      month: scale ? fteCost : fteCost * 0.5,
    },
    {
      name: "eKYC API",
      note: "Không dùng — tiết kiệm API, tốn giờ người.",
      month: 0,
    },
  ];
}

function opsHybrid(s: Scenario): Line[] {
  const scale = s === "optimistic";
  return [
    {
      name: "VNPT eKYC",
      note: scale
        ? "Gói 4: 8 triệu + VAT 10% = 8,8 triệu (10.000 request). 1 hồ sơ ≈ 3–8 request."
        : "Gói 1: 800.000 + VAT 10% = 880.000 (1.000 request). Bảng vnptai.io/ekyc, chưa cộng dồn tháng sau.",
      month: scale ? 8.8 : 0.88,
    },
    {
      name: "Người duyệt case lệch",
      note: scale ? "0,4 FTE khi máy fail / KYB." : "0,2 FTE.",
      month: scale ? 14.6 * 0.4 : 14.6 * 0.2,
    },
    {
      name: "CSKH lai — bot + người",
      note: "FAQ/trạng thái đơn tự động. Người chỉ xử lý hoàn, SLA, tranh chấp.",
      month: scale ? 14.6 * 0.5 : 14.6 * 0.3,
    },
    {
      name: "Tool chatbot / helpdesk",
      note: "Widget FAQ hoặc ticket nhẹ.",
      month: scale ? 0.5 : 0.2,
    },
  ];
}

const LEGAL_LINES: Line[] = [
  {
    name: "Kế toán thuế trọn gói",
    note: "Gói startup 1,5–2,5 triệu/tháng (ít hóa đơn). Tham chiếu MAN / dịch vụ SME 2026.",
    month: 1.5,
  },
  {
    name: "Chữ ký số + hóa đơn điện tử",
    note: "Gói 1 năm ~1,1–1,3 triệu → ~0,1 triệu/tháng.",
    month: 0.1,
  },
  {
    name: "Luật sư Q&A định kỳ",
    note: "StartupLAW option hỏi ~1 triệu/tháng. Soạn ToS một lần 8–20 triệu không trải vào P&L tháng.",
    month: 1.0,
  },
];

const VAS_LINES: Line[] = [
  {
    name: "Retainer đối tác hồ sơ Creator",
    note: "White-label kế toán/luật cho người gọi vốn. Năm 1 có thể = 0 nếu chỉ referral.",
    month: 4,
  },
  {
    name: "Hoa hồng giới thiệu (đối)",
    note: "Referral 10–20% gói Creator trả — không phải chi sàn nếu chỉ nối.",
    month: 0,
  },
];

const FOUNDER_LINES: Line[] = [
  {
    name: "Lương founder tối thiểu",
    note: "15 triệu/tháng để sống. Đồ án có thể 0 — P&L thật nên tính.",
    month: 15,
  },
];

function marketingLines(s: Scenario): Line[] {
  return [
    {
      name: "Content + ads",
      note:
        s === "optimistic"
          ? "Để kéo GMV 12 tỷ/quý không thể 0 đồng ads. Ước 20 triệu/tháng — vẫn lạc quan."
          : "Năm 1: organic + ads nhỏ ~8 triệu/tháng.",
      month: s === "optimistic" ? 20 : 8,
    },
  ];
}

function sumMonth(lines: Line[]) {
  return lines.reduce((a, b) => a + b.month, 0);
}

function taxRate(netYear: number) {
  if (netYear <= 3_000) return 0.15;
  if (netYear <= 50_000) return 0.17;
  return 0.2;
}

export default function PresentationPnlChecklist() {
  const [scenario, setScenario] = useState<Scenario>("early");
  const [open, setOpen] = useState<Record<string, boolean>>({
    revenue: true,
    current: false,
    cheap: false,
    manual: false,
    hybrid: false,
    legal: false,
    vas: false,
    founder: false,
    marketing: false,
  });
  const [useInfra, setUseInfra] = useState<Infra>("current");
  const [useOps, setUseOps] = useState<Ops>("manual");
  const [incLegal, setIncLegal] = useState(true);
  const [incVas, setIncVas] = useState(false);
  const [incFounder, setIncFounder] = useState(false);
  const [incMarketing, setIncMarketing] = useState(false);

  const rev = revenueOf(scenario);
  const currentLines = infraCurrent(scenario);
  const cheapLines = infraCheap();
  const manualLines = opsManual(scenario);
  const hybridLines = opsHybrid(scenario);
  const mktLines = marketingLines(scenario);

  const opexM = useMemo(() => {
    let n = 0;
    n += sumMonth(useInfra === "cheap" ? cheapLines : currentLines);
    n += sumMonth(useOps === "hybrid" ? hybridLines : manualLines);
    if (incLegal) n += sumMonth(LEGAL_LINES);
    if (incVas) n += sumMonth(VAS_LINES);
    if (incFounder) n += sumMonth(FOUNDER_LINES);
    if (incMarketing) n += sumMonth(mktLines);
    return n;
  }, [
    useInfra,
    useOps,
    incLegal,
    incVas,
    incFounder,
    incMarketing,
    currentLines,
    cheapLines,
    manualLines,
    hybridLines,
    mktLines,
  ]);

  const opexQ = opexM * 3;
  const opexY = opexM * 12;
  const ebtQ = rev.netQ - opexQ;
  const ebtY = rev.netY - opexY;
  const cit = taxRate(rev.netY);
  const taxQ = ebtQ > 0 ? ebtQ * cit : 0;
  const taxY = ebtY > 0 ? ebtY * cit : 0;
  const patQ = ebtQ - taxQ;
  const patY = ebtY - taxY;

  function toggle(id: string) {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="space-y-4 text-left">
      <p className="text-xs font-medium text-gray-500">
        Tích từng mục để xem dòng phí. P&L quý/năm phía trên đổi theo kịch bản doanh thu, hạ tầng, bản vận hành và các mục đã chọn đưa vào tính.
        Tiền giữ hộ không tính doanh thu. Tỷ giá 26.200 đ/USD. Thuế TNDN 15/17/20% theo Luật 67/2025.
      </p>

      <div className="overflow-hidden rounded-[1.5rem] border border-emerald-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 bg-emerald-800 px-4 py-3 text-white">
          <Calculator size={16} />
          <span className="text-sm font-black">P&L nền tảng — quý và năm</span>
        </div>
        <div className="grid gap-px bg-gray-100 sm:grid-cols-2">
          <PnlCol
            label="Một quý"
            rows={[
              ["GMV chảy qua sàn", trieu(rev.gmvRewardQ + rev.gmvDonationQ)],
              ["Phí Reward 8% (gồm VAT)", trieu(rev.rewardFeeGross)],
              ["Tip Donation (gồm VAT)", trieu(rev.tipGross)],
              ["VAS", trieu(rev.vasQ)],
              ["Doanh thu gồm VAT", trieu(rev.grossQ)],
              ["Doanh thu thuần", trieu(rev.netQ)],
              ["VAT đầu ra ~10%", trieu(rev.vatQ)],
              ["Chi phí (mục đã chọn)", trieu(opexQ)],
              ["Lãi trước thuế", trieu(ebtQ)],
              [`Thuế TNDN ${(cit * 100).toFixed(0)}%`, trieu(taxQ)],
              ["Lãi sau thuế", trieu(patQ)],
            ]}
            highlight={patQ}
          />
          <PnlCol
            label="Một năm (×4 quý cùng kịch bản)"
            rows={[
              ["GMV chảy qua sàn", trieu(rev.gmvY)],
              ["Doanh thu gồm VAT", trieu(rev.grossY)],
              ["Doanh thu thuần", trieu(rev.netY)],
              ["VAT đầu ra", trieu(rev.vatY)],
              ["Chi phí", trieu(opexY)],
              ["Lãi trước thuế", trieu(ebtY)],
              [`Thuế TNDN ${(cit * 100).toFixed(0)}%`, trieu(taxY)],
              ["Lãi sau thuế", trieu(patY)],
            ]}
            highlight={patY}
          />
        </div>
        <p className="px-4 py-3 text-[11px] leading-relaxed text-gray-500">
          Đang tính: {SCENARIOS[scenario].title.toLowerCase()} · hạ tầng{" "}
          {useInfra === "cheap" ? "VPS 30–150k (năm 2–3)" : "đang xài"} · vận hành{" "}
          {useOps === "hybrid" ? "Bản B eKYC + bot" : "Bản A thủ công"}
          {incLegal ? " · pháp lý công ty" : ""}
          {incVas ? " · VAS Creator" : ""}
          {incFounder ? " · lương founder" : ""}
          {incMarketing ? " · marketing" : ""}. GMV ≠ doanh thu sàn.
        </p>
      </div>

      <CheckBlock
        id="revenue"
        open={open.revenue}
        onToggle={() => toggle("revenue")}
        title="Doanh thu theo quý / năm"
        badge={trieu(rev.netQ) + "/quý thuần"}
        included
      >
        <div className="mb-3 flex flex-wrap gap-2">
          <Choice
            active={scenario === "early"}
            onClick={() => setScenario("early")}
            label="Sớm — năm 1"
          />
          <Choice
            active={scenario === "optimistic"}
            onClick={() => setScenario("optimistic")}
            label="Lạc quan — trần giả định"
          />
        </div>
        <p className="mb-3 text-sm text-gray-600">{SCENARIOS[scenario].hint}</p>
        <LineTable
          rows={[
            ["GMV Reward / quý", trieu(rev.gmvRewardQ), "Tiền pre-order chảy qua escrow, chưa phải của sàn"],
            ["GMV Donation / quý", trieu(rev.gmvDonationQ), "Khoản ủng hộ — sàn 0% bắt buộc"],
            ["Tỷ lệ hoàn Reward", `${(rev.refund * 100).toFixed(0)}%`, "Hoàn đơn / trễ SLA"],
            ["Phí sàn Reward", `${(rev.feeRate * 100).toFixed(0)}% trừ payout`, "Không cộng vào giá backer"],
            ["Phí Reward sau hoàn, gồm VAT", trieu(rev.rewardFeeGross), `GMV × (1 − hoàn) × 8%`],
            ["Tip Donation gồm VAT", trieu(rev.tipGross), `GMV ủng hộ × ${(rev.tipRate * 100).toFixed(0)}%`],
            ["VAS đóng gói hồ sơ", trieu(rev.vasQ), "Lộ trình, không bắt buộc năm 1"],
            ["Doanh thu quý gồm VAT", trieu(rev.grossQ), ""],
            ["Doanh thu quý thuần / 1,1", trieu(rev.netQ), "Giả định 8% đã gồm GTGT 10%"],
            ["Doanh thu năm thuần", trieu(rev.netY), "Bốn quý cùng giả định"],
          ]}
        />
      </CheckBlock>

      <CheckBlock
        id="current"
        open={open.current}
        onToggle={() => toggle("current")}
        title="Hạ tầng đang xài — Vercel, Neon, Cloudinary, Redis, Mongo"
        badge={dong(sumMonth(currentLines) * 1_000_000) + "/tháng"}
        included={useInfra === "current"}
        onInclude={() => setUseInfra("current")}
        includeLabel="Dùng cho P&L"
      >
        <p className="mb-3 text-sm text-gray-600">
          Đúng stack đang deploy. Giá bảng 9/2026. Kịch bản sớm nghiêng Free; lạc quan bật Plus/Pro.
        </p>
        <CostLines lines={currentLines} />
        <p className="mt-2 text-xs font-bold text-slate-700">
          Cộng: {dong(sumMonth(currentLines) * 1_000_000)}/tháng · {trieu(sumMonth(currentLines) * 3)}/quý ·{" "}
          {trieu(sumMonth(currentLines) * 12)}/năm
        </p>
      </CheckBlock>

      <CheckBlock
        id="cheap"
        open={open.cheap}
        onToggle={() => toggle("cheap")}
        title="Hạ tầng rẻ nhất — VPS 30.000–150.000 đ (năm 2–3)"
        badge="30–150k/tháng"
        included={useInfra === "cheap"}
        onInclude={() => setUseInfra("cheap")}
        includeLabel="Dùng cho P&L"
      >
        <p className="mb-3 text-sm text-gray-600">
          Sau 2–3 năm, nếu tự vận hành máy: gói VPS trong nước từ ~50k (1GB) đến ~150k (2–4GB). P&L lấy ~90–150k
          cả cụm. Đổi: tự vá OS, SSL, backup; ảnh CCCD không nên để máy nước ngoài giá rẻ (Hetzner ~4 USD) nếu chưa có DPA.
        </p>
        <CostLines lines={cheapLines} />
        <LineTable
          rows={[
            ["GenCloud / Cloud Việt entry", "50–90k", "1 vCPU, 1–2GB, DC VN"],
            ["AZDIGI Tăng Tốc 2–3", "139–249k", "1–2 vCPU, trên trần 150k nếu cần mạnh hơn"],
            ["Cụm P&L năm 2–3", "30–150k", "Một máy gộp app+Postgres+Redis"],
            ["So với stack đang xài", "rẻ hơn ~10–50 lần", "Mất preview Vercel, autoscaling, Cloudinary"],
          ]}
        />
        <p className="mt-2 text-xs font-bold text-slate-700">
          Cộng P&L: {dong(sumMonth(cheapLines) * 1_000_000)}/tháng · {trieu(sumMonth(cheapLines) * 3)}/quý ·{" "}
          {trieu(sumMonth(cheapLines) * 12)}/năm
        </p>
      </CheckBlock>

      <CheckBlock
        id="manual"
        open={open.manual}
        onToggle={() => toggle("manual")}
        title="Bản A — KYC thủ công + CSKH thủ công"
        badge={trieu(sumMonth(manualLines)) + "/tháng"}
        included={useOps === "manual"}
        onInclude={() => setUseOps("manual")}
        includeLabel="Dùng cho P&L"
      >
        <p className="mb-3 text-sm text-gray-600">
          Admin xem giấy tờ tay. Inbox hết. Phù hợp đồ án và dưới 50 hồ sơ/tháng. Chi phí = giờ người, không phải API.
        </p>
        <CostLines lines={manualLines} />
        <p className="mt-2 text-xs font-bold text-slate-700">
          Cộng: {trieu(sumMonth(manualLines))}/tháng · {trieu(sumMonth(manualLines) * 3)}/quý ·{" "}
          {trieu(sumMonth(manualLines) * 12)}/năm
        </p>
      </CheckBlock>

      <CheckBlock
        id="hybrid"
        open={open.hybrid}
        onToggle={() => toggle("hybrid")}
        title="Bản B — eKYC + CSKH tự động kết hợp thủ công"
        badge={trieu(sumMonth(hybridLines)) + "/tháng"}
        included={useOps === "hybrid"}
        onInclude={() => setUseOps("hybrid")}
        includeLabel="Dùng cho P&L"
      >
        <p className="mb-3 text-sm text-gray-600">
          Máy OCR + face + liveness. Bot trả trạng thái đơn. Người chỉ xử lý fail, hoàn, tranh chấp. Rẻ hơn Bản A khi
          hồ sơ tăng — không xóa hết người.
        </p>
        <CostLines lines={hybridLines} />
        <p className="mt-2 text-xs font-bold text-slate-700">
          Cộng: {trieu(sumMonth(hybridLines))}/tháng · {trieu(sumMonth(hybridLines) * 3)}/quý ·{" "}
          {trieu(sumMonth(hybridLines) * 12)}/năm
        </p>
      </CheckBlock>

      <CheckBlock
        id="legal"
        open={open.legal}
        onToggle={() => toggle("legal")}
        title="Pháp lý · thuế · chữ ký số của công ty sàn"
        badge={trieu(sumMonth(LEGAL_LINES)) + "/tháng"}
        included={incLegal}
        onInclude={() => setIncLegal((v) => !v)}
        includeLabel="Đưa vào P&L"
      >
        <CostLines lines={LEGAL_LINES} />
        <p className="mt-2 text-xs text-gray-500">
          Thành lập TNHH 1–8 triệu một lần, ToS 8–20 triệu một lần — không trải đều nếu chưa chốt.
        </p>
      </CheckBlock>

      <CheckBlock
        id="vas"
        open={open.vas}
        onToggle={() => toggle("vas")}
        title="Đối tác hỗ trợ giấy tờ pháp lý / thuế cho Creator"
        badge={incVas ? trieu(sumMonth(VAS_LINES)) + "/tháng" : "mặc định 0 — referral"}
        included={incVas}
        onInclude={() => setIncVas((v) => !v)}
        includeLabel="Đưa vào P&L"
      >
        <p className="mb-3 text-sm text-gray-600">
          Năm 1: giới thiệu phòng kế toán / luật startup, sàn không trả retainer. Khi bán gói hồ sơ: retainer 3–8
          triệu/tháng rồi thu lại từ Creator.
        </p>
        <CostLines lines={VAS_LINES} />
      </CheckBlock>

      <CheckBlock
        id="founder"
        open={open.founder}
        onToggle={() => toggle("founder")}
        title="Lương founder tối thiểu"
        badge="15 triệu/tháng"
        included={incFounder}
        onInclude={() => setIncFounder((v) => !v)}
        includeLabel="Đưa vào P&L"
      >
        <CostLines lines={FOUNDER_LINES} />
      </CheckBlock>

      <CheckBlock
        id="marketing"
        open={open.marketing}
        onToggle={() => toggle("marketing")}
        title="Marketing / content"
        badge={trieu(sumMonth(mktLines)) + "/tháng"}
        included={incMarketing}
        onInclude={() => setIncMarketing((v) => !v)}
        includeLabel="Đưa vào P&L"
      >
        <CostLines lines={mktLines} />
      </CheckBlock>
    </div>
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

function CheckBlock({
  id,
  open,
  onToggle,
  title,
  badge,
  included,
  onInclude,
  includeLabel,
  children,
}: {
  id: string;
  open: boolean;
  onToggle: () => void;
  title: string;
  badge?: string;
  included?: boolean;
  onInclude?: () => void;
  includeLabel?: string;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[1.25rem] border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3">
        <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={open}
            onChange={onToggle}
            className="h-4 w-4 shrink-0 accent-emerald-700"
            aria-controls={id}
          />
          <span className="min-w-0">
            <span className="block text-sm font-black text-slate-900">{title}</span>
            {!open && badge ? <span className="text-[11px] text-gray-400">{badge}</span> : null}
          </span>
        </label>
        {onInclude ? (
          <button
            type="button"
            onClick={onInclude}
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ${
              included ? "bg-emerald-50 text-emerald-800" : "bg-gray-100 text-gray-500"
            }`}
          >
            {included ? "● " : "○ "}
            {includeLabel}
          </button>
        ) : null}
      </div>
      {open ? (
        <div id={id} className="border-t border-gray-100 px-4 py-4">
          {children}
        </div>
      ) : null}
    </div>
  );
}

function CostLines({ lines }: { lines: Line[] }) {
  return (
    <ul className="space-y-2">
      {lines.map((line) => (
        <li key={line.name} className="rounded-xl bg-slate-50 px-3 py-2">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-bold text-slate-900">{line.name}</span>
            <span className="shrink-0 text-sm font-black tabular-nums text-emerald-800">
              {line.month === 0 ? "0" : line.month < 1 ? dong(line.month * 1_000_000) : trieu(line.month)}
              {line.month > 0 ? "/tháng" : ""}
            </span>
          </div>
          <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{line.note}</p>
        </li>
      ))}
    </ul>
  );
}

function LineTable({ rows }: { rows: [string, string, string][] | [string, string][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="w-full min-w-[480px] text-left text-sm">
        <tbody>
          {rows.map((row, i) => (
            <tr key={row[0]} className={i % 2 ? "bg-gray-50" : "bg-white"}>
              <td className="px-3 py-2 font-bold text-slate-800">{row[0]}</td>
              <td className="px-3 py-2 font-black tabular-nums text-emerald-800">{row[1]}</td>
              {row[2] ? <td className="px-3 py-2 text-xs text-gray-500">{row[2]}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
