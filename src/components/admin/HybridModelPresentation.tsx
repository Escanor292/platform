"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronLeft,
  Database,
  FileBadge,
  FolderTree,
  GitBranch,
  Handshake,
  HeartHandshake,
  Lock,
  Package,
  Scale,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Store,
  Target,
  Trash2,
  UserCheck,
  Users,
  Workflow,
  X,
} from "lucide-react";
import type {
  PresentationCard,
  PresentationDeck,
  PresentationFigure,
  PresentationLane,
  PresentationSchemaGroup,
  PresentationSlide,
  PresentationTreeNode,
} from "@/lib/admin-presentation-types";
import { CertificateDocument } from "@/components/tax/CertificateDocument";
import { InvoiceDocument } from "@/components/invoice/InvoiceDocument";
import TransactionStatement from "@/components/campaign/TransactionStatement";
import BackerLink from "@/components/campaign/BackerLink";
import { formatVND, formatDate } from "@/lib/utils";

const KICKER_ICON = {
  "Tầm nhìn": Target,
  "Khoảng trống": Target,
  "Mô hình lai": Handshake,
  "Giữ tiền và hoàn tiền": Package,
  "Luồng hàng Reward": Store,
  "Kiến trúc": GitBranch,
  "Luồng người dùng": Workflow,
  "CSDL": Database,
  "Mã nguồn": FolderTree,
  "Chứng từ & giao dịch": FileBadge,
  "Pháp lý": Scale,
  "An toàn thông tin": Lock,
  "Rủi ro": ShieldAlert,
  "KYC & KYB": UserCheck,
  "Khuyến nghị": CheckCircle2,
  "Thị trường": Building2,
  "Khách hàng nhắm đến": Users,
  Case: Store,
  "Công ty tương lai": Building2,
  "Phụ lục": FolderTree,
} as const;

function mediaUrl(key: string) {
  return `/api/admin/presentation/media/${encodeURIComponent(key)}`;
}

export default function HybridModelPresentation({ deck }: { deck: PresentationDeck }) {
  const router = useRouter();
  const slides = deck.slides;
  const slideCount = slides.length;
  const [index, setIndex] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const go = useCallback(
    (next: number) => {
      setIndex(Math.max(0, Math.min(slideCount - 1, next)));
    },
    [slideCount],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "PageDown") {
        event.preventDefault();
        go(index + 1);
      }
      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        go(index - 1);
      }
      if (event.key === "Home") go(0);
      if (event.key === "End") go(slideCount - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index, slideCount]);

  useEffect(() => {
    document.getElementById("thuyet-trinh-scroll")?.scrollTo({ top: 0 });
  }, [index]);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, []);

  async function removeDeck() {
    setDeleting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/presentation", { method: "DELETE" });
      if (!res.ok) throw new Error("Không xóa được");
      router.replace("/dashboard/admin");
      router.refresh();
    } catch {
      setError("Xóa thất bại. Thử lại.");
      setDeleting(false);
    }
  }

  const current = slides[index];

  return (
    <div className="fixed inset-0 z-[80] flex flex-col overflow-hidden bg-[#F8F7F2] text-slate-900">
      <header className="flex items-center justify-between gap-4 border-b border-black/5 bg-white/80 px-4 py-3 backdrop-blur md:px-6">
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-50"
        >
          <X size={14} /> Đóng
        </Link>
        <div className="min-w-0 text-center">
          <div className="truncate text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">
            {deck.brand}
          </div>
          <div className="truncate text-sm font-black text-slate-900">{deck.title}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden text-xs font-black tabular-nums text-gray-500 sm:block">
            {index + 1}/{slideCount}
          </div>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-black text-red-700 hover:bg-red-100"
          >
            <Trash2 size={14} /> Xóa
          </button>
        </div>
      </header>

      {confirmDelete ? (
        <div className="border-b border-red-100 bg-red-50 px-4 py-3 md:px-6">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-red-900">
              Xóa hẳn khỏi Postgres: nội dung slide, ảnh minh họa, và nút mở trên admin. Không tự khôi phục.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setConfirmDelete(false)}
                className="rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-black text-red-700"
              >
                Giữ lại
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={removeDeck}
                className="rounded-full bg-red-700 px-4 py-2 text-xs font-black text-white disabled:opacity-50"
              >
                {deleting ? "Đang xóa…" : "Xóa vĩnh viễn"}
              </button>
            </div>
          </div>
          {error ? <p className="mt-2 text-xs font-bold text-red-700">{error}</p> : null}
        </div>
      ) : null}

      <main id="thuyet-trinh-scroll" className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto max-w-6xl px-4 py-8 pb-16 md:px-8">
          {current ? <SlideView slide={current} /> : null}
        </div>
      </main>

      <footer className="flex items-center justify-between gap-3 border-t border-black/5 bg-white/90 px-4 py-3 md:px-6">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => go(index - 1)}
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-bold disabled:opacity-30"
        >
          <ChevronLeft size={16} /> Trước
        </button>
        <div className="flex flex-1 items-center justify-center gap-1.5 overflow-x-auto">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => go(i)}
              className={`h-2.5 rounded-full transition ${
                i === index ? "w-8 bg-emerald-600" : "w-2.5 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          disabled={index === slideCount - 1}
          onClick={() => go(index + 1)}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-30"
        >
          Tiếp <ArrowRight size={16} />
        </button>
      </footer>
    </div>
  );
}

function SlideView({ slide }: { slide: PresentationSlide }) {
  const Icon = (slide.kicker && KICKER_ICON[slide.kicker as keyof typeof KICKER_ICON]) || Sparkles;
  const isHero = slide.variant === "hero";
  const isClose = slide.variant === "close";

  return (
    <section className={`space-y-8 ${isHero || isClose ? "text-center" : ""}`}>
      {isHero ? (
        <div>
          {slide.kicker ? (
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-emerald-700">
              <Sparkles size={14} /> {slide.kicker}
            </div>
          ) : null}
          <h1 className="font-display text-4xl font-black leading-tight text-[#1B365D] md:text-6xl">
            {slide.title}
            {slide.titleAccent ? (
              <span className="mt-2 block bg-gradient-to-r from-emerald-600 via-emerald-500 to-sky-500 bg-clip-text text-transparent">
                {slide.titleAccent}
              </span>
            ) : null}
          </h1>
          {slide.body ? (
            <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-600">{slide.body}</p>
          ) : null}
        </div>
      ) : (
        <div>
          {slide.kicker ? (
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-widest text-emerald-700 shadow-sm">
              <Icon size={14} /> {slide.kicker}
            </div>
          ) : null}
          <h2
            className={`font-display text-3xl font-black text-[#1B365D] md:text-5xl ${isClose ? "" : "mb-4"}`}
          >
            {slide.title}
          </h2>
          {slide.body ? (
            <p className={`max-w-3xl text-gray-600 ${isClose ? "mx-auto mt-4 text-lg" : "mb-2"}`}>
              {slide.body}
            </p>
          ) : null}
        </div>
      )}

      {slide.paragraphs?.length ? (
        <div className="space-y-4 text-left text-gray-700">
          {slide.paragraphs.map((p, i) => (
            <p key={i}>
              {p.lead ? <strong>{p.lead} </strong> : null}
              {p.text}
            </p>
          ))}
        </div>
      ) : null}

      {slide.note ? (
        <p className="rounded-2xl bg-amber-50 p-4 text-left text-sm text-amber-900">{slide.note}</p>
      ) : null}

      {slide.cards?.length ? <CardGrid cards={slide.cards} /> : null}

      {slide.steps?.length ? (
        <ol
          className={`grid gap-4 ${
            slide.steps.length >= 5 ? "sm:grid-cols-2 lg:grid-cols-5" : "md:grid-cols-4"
          }`}
        >
          {slide.steps.map((step) => (
            <li key={step.n} className="rounded-3xl border border-gray-100 bg-white p-6 text-left shadow-sm">
              <div className="text-2xl font-black text-emerald-600">{step.n}</div>
              <div className="mt-2 font-black">{step.t}</div>
              <p className="mt-2 text-sm text-gray-600">{step.d}</p>
            </li>
          ))}
        </ol>
      ) : null}

      {slide.lanes?.length ? <FlowLanes lanes={slide.lanes} /> : null}

      {slide.schema?.length ? <SchemaMap groups={slide.schema} /> : null}

      {slide.tree?.length ? <SourceTree nodes={slide.tree} /> : null}

      {slide.table ? (
        <div className="overflow-x-auto rounded-[1.5rem] border border-gray-200 bg-white text-left">
          <table className={`w-full text-left text-sm ${slide.table.headers.length >= 5 ? "min-w-[920px]" : "min-w-[560px] md:min-w-[720px]"}`}>
            <thead className="bg-slate-900 text-white">
              <tr>
                {slide.table.headers.map((h) => (
                  <th key={h} className="px-4 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slide.table.rows.map((row, ri) => (
                <tr key={ri} className={`border-t ${ri % 2 ? "bg-gray-50" : ""}`}>
                  {row.map((cell, ci) => (
                    <td key={ci} className={`px-4 py-4 ${ci === 0 ? "font-black" : "text-gray-600"}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {slide.bullets?.length ? (
        <ul className="space-y-4 text-left text-lg text-gray-700">
          {slide.bullets.map((item) => (
            <li key={item} className="flex gap-3">
              <CheckCircle2 className="mt-1 shrink-0 text-emerald-600" size={20} />
              {item}
            </li>
          ))}
        </ul>
      ) : null}

      {slide.blocks?.map((block) => (
        <div key={block.heading || block.body} className="space-y-4 text-left">
          {block.heading ? (
            <h3
              className={`text-xl font-black ${
                block.headingTone === "rose"
                  ? "text-rose-700"
                  : block.headingTone === "emerald"
                    ? "text-emerald-800"
                    : "text-[#1B365D]"
              }`}
            >
              {block.heading}
            </h3>
          ) : null}
          {block.figures?.map((fig) => (
            <Figure key={fig.key + fig.caption} fig={fig} />
          ))}
          {block.bullets?.length ? (
            <ul className="space-y-2 text-sm text-gray-600">
              {block.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          ) : null}
          {block.cards?.length ? <CardGrid cards={block.cards} /> : null}
        </div>
      ))}

      {slide.figures?.length ? (
        <div
          className={`grid items-start gap-8 ${
            slide.figures.some((f) => isLiveDocument(f.key))
              ? ""
              : slide.figures.length > 1
                ? "md:grid-cols-2"
                : ""
          }`}
        >
          {slide.figures.map((fig) => (
            <Figure key={fig.key + fig.caption} fig={fig} />
          ))}
        </div>
      ) : null}

      {isClose ? (
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard/admin"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 font-bold"
          >
            <ArrowLeft size={16} /> Về admin
          </Link>
        </div>
      ) : null}
    </section>
  );
}

function FlowLanes({ lanes }: { lanes: PresentationLane[] }) {
  return (
    <div className="space-y-4 text-left">
      {lanes.map((lane) => {
        const tone =
          lane.tone === "rose"
            ? "border-rose-100 bg-rose-50"
            : lane.tone === "emerald"
              ? "border-emerald-100 bg-emerald-50"
              : lane.tone === "navy"
                ? "border-slate-200 bg-slate-50"
                : "border-gray-100 bg-white";
        return (
          <div key={lane.title} className={`rounded-[1.75rem] border p-4 shadow-sm md:p-5 ${tone}`}>
            <div className="mb-3 text-sm font-black text-slate-900">{lane.title}</div>
            <ol className="flex flex-col gap-2">
              {lane.steps.map((step, i) => (
                <li key={step} className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-black text-emerald-700 shadow-sm">
                    {i + 1}
                  </span>
                  <span className="rounded-xl bg-white px-3 py-2 text-sm text-gray-700 shadow-sm">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        );
      })}
    </div>
  );
}

function SchemaMap({ groups }: { groups: PresentationSchemaGroup[] }) {
  return (
    <div className="grid gap-4 text-left md:grid-cols-2">
      {groups.map((group) => (
        <div key={group.title} className="rounded-[1.75rem] border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-sm font-black text-[#1B365D]">
            <Database size={16} className="text-emerald-700" />
            {group.title}
          </div>
          <ul className="space-y-2">
            {group.items.map((item) => (
              <li key={item} className="rounded-xl bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700 md:text-sm">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function SourceTree({ nodes }: { nodes: PresentationTreeNode[] }) {
  return (
    <div className="space-y-2 rounded-[1.75rem] border border-gray-100 bg-[#0f172a] p-5 text-left font-mono text-xs text-emerald-100 shadow-sm md:text-sm">
      {nodes.map((node) => (
        <div key={node.path} className="flex flex-col gap-0.5 border-l border-emerald-700/40 pl-3 md:flex-row md:items-baseline md:gap-3">
          <span className="font-bold text-emerald-300">{node.path}</span>
          <span className="text-slate-300">{node.note}</span>
        </div>
      ))}
    </div>
  );
}

function CardGrid({ cards }: { cards: PresentationCard[] }) {
  const split = cards.some((c) => c.tone === "rose" || c.tone === "emerald");
  return (
    <div className={`grid gap-4 ${cards.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
      {cards.map((card) => {
        const rose = card.tone === "rose";
        const emerald = card.tone === "emerald";
        return (
          <div
            key={card.title}
            className={`rounded-[2rem] border p-6 text-left shadow-sm ${
              rose
                ? "border-rose-100 bg-rose-50"
                : emerald
                  ? "border-emerald-100 bg-emerald-50"
                  : "border-gray-100 bg-white"
            } ${split ? "p-8" : ""}`}
          >
            {rose ? <HeartHandshake className="mb-4 text-rose-600" /> : null}
            {emerald ? <ShoppingBag className="mb-4 text-emerald-700" /> : null}
            <h3 className={`font-black text-slate-900 ${split ? "text-2xl" : ""}`}>{card.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{card.body}</p>
          </div>
        );
      })}
    </div>
  );
}

function isLiveDocument(key: string) {
  return (
    key === "chung-nhan-tt-uh.jpg" ||
    key === "bien-lai-thanh-toan.jpg" ||
    key === "donation-reward.jpg" ||
    key === "sao-ke-he-thong" ||
    key === "nguoi-ung-ho"
  );
}

const DEMO_CERTIFICATE = {
  code: "TT-UH-MAU-0001",
  displayName: "Nguyễn Văn An",
  email: "an.nguyen@email.vn",
  phone: null as string | null,
  campaignTitle: "Gây quỹ tủ sách thôn Tân Lập",
  campaignHref: null as string | null,
  creatorName: "Nguyễn Thị Hoa",
  kycVerified: true,
  kycLabel: "Đã xác minh KYC",
  flowLabel: "Ủng hộ không nhận quà",
  flowCode: "NO_GIFT",
  transactionId: "MAU-UH-0001",
  amount: 200000,
  amountWords: "Hai trăm nghìn đồng",
  tipAmount: 0,
  paymentLabel: "Chuyển khoản tài khoản ngân hàng trung gian",
  paymentCode: "BANK_ESCROW",
  issuedFormatted: "lúc 09:00 15 tháng 9, 2026",
  verifyUrl: "https://2s-projects.vercel.app/chung-tu/TT-UH-MAU-0001",
};

const DEMO_INVOICE = {
  invoiceNumber: "INV-MAU-0001",
  issuedAt: "15/09/2026 09:00",
  transactionId: "TUTE-MAU-0001",
  paymentMethod: "Chuyển khoản (VietQR)",
  backerName: "Trần Minh Đức",
  backerEmail: "duc.tran@email.vn",
  backerPhone: null as string | null,
  campaignTitle: "Combo khai trương quán gà rán",
  amount: 199000,
  tipAmount: 0,
  platformFee: 0,
  vatAmount: 0,
  totalAmount: 199000,
};

function DemoCertificate() {
  const [verifyUrl, setVerifyUrl] = useState(
    "https://2s-projects.vercel.app/chung-tu/TT-UH-MAU-0001",
  );
  useEffect(() => {
    setVerifyUrl(`${window.location.origin}/chung-tu/TT-UH-MAU-0001`);
  }, []);

  return (
    <div className="rounded-[1.75rem] bg-[#f3efe6] p-3 sm:p-6">
      <p className="mb-3 text-center text-[11px] font-black uppercase tracking-widest text-emerald-800">
        Mẫu giao diện hệ thống — không phải chứng từ đã cấp
      </p>
      <CertificateDocument data={{ ...DEMO_CERTIFICATE, verifyUrl }}>
        <span className="rounded-full bg-pgreen px-5 py-2.5 text-sm font-bold text-white">In chứng từ</span>
        <Link
          href="/purchases"
          className="rounded-full border border-pgreen px-5 py-2.5 text-sm font-bold text-pgreen"
        >
          Đã lưu trong Kho đồ
        </Link>
        <Link
          href="/lookup?code=TT-UH-MAU-0001"
          className="rounded-full border px-5 py-2.5 text-sm font-bold text-gray-500"
        >
          Tra cứu giao dịch
        </Link>
      </CertificateDocument>
    </div>
  );
}

function DemoInvoice() {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-gray-100 bg-gray-100 p-3 sm:p-6">
      <p className="mb-3 text-center text-[11px] font-black uppercase tracking-widest text-slate-600">
        Mẫu biên lai hệ thống — không phải hóa đơn GTGT
      </p>
      <InvoiceDocument data={DEMO_INVOICE} />
    </div>
  );
}

const DEMO_BACKERS = [
  {
    id: "p1",
    userId: null as string | null,
    userName: "Nguyễn Văn An",
    displayName: "Nguyễn Văn An",
    isAnonymous: false,
    userAvatar: null as string | null,
    amount: 200000,
    createdAt: new Date("2026-08-20T09:12:00"),
  },
  {
    id: "p2",
    userId: null as string | null,
    userName: "Trần Minh Đức",
    displayName: "Trần Minh Đức",
    isAnonymous: false,
    userAvatar: null as string | null,
    amount: 199000,
    createdAt: new Date("2026-08-21T14:40:00"),
  },
  {
    id: "p3",
    userId: null as string | null,
    userName: null as string | null,
    displayName: null as string | null,
    isAnonymous: true,
    userAvatar: null as string | null,
    amount: 50000,
    createdAt: new Date("2026-08-22T08:05:00"),
  },
  {
    id: "p4",
    userId: null as string | null,
    userName: "Lê Thị Hoa",
    displayName: "Lê Thị Hoa",
    isAnonymous: false,
    userAvatar: null as string | null,
    amount: 199000,
    createdAt: new Date("2026-08-23T18:30:00"),
  },
];

function DemoBackers() {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
      <p className="mb-5 text-center text-[11px] font-black uppercase tracking-widest text-emerald-800">
        Tab Người ủng hộ trên trang chiến dịch — mẫu giao diện hệ thống
      </p>
      <h2 className="text-2xl font-bold text-gray-900">Người ủng hộ ({DEMO_BACKERS.length})</h2>
      <div className="mt-4 space-y-4">
        {DEMO_BACKERS.map((pledge) => (
          <div key={pledge.id} className="rounded-lg border border-gray-200 bg-white p-4">
            <BackerLink
              userId={pledge.userId}
              userName={pledge.userName}
              displayName={pledge.displayName}
              isAnonymous={pledge.isAnonymous}
              userAvatar={pledge.userAvatar}
            />
            <div className="mt-2 text-sm text-gray-500">
              Ủng hộ {formatVND(pledge.amount)} • {formatDate(pledge.createdAt)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const DEMO_STATEMENT_CAMPAIGN = {
  id: "demo-campaign",
  title: "Combo khai trương quán gà rán",
  campaignCode: "CD-MAU-0001",
  currentAmount: 449000,
  goalAmount: 20000000,
  closedAmount: 449000,
  closedAt: new Date("2026-09-15"),
};

const DEMO_STATEMENT_PLEDGES = [
  {
    id: "sp1",
    amount: 200000,
    totalAmount: 200000,
    depositAmount: 0,
    chargeAmount: 200000,
    orderTotalAmount: 200000,
    paidAmount: 200000,
    remainingAmount: 0,
    accountingAmount: 200000,
    refundAmount: 0,
    cancellationFeeAmount: 0,
    isCashOnDelivery: false,
    displayName: "Nguyễn Văn An",
    isAnonymous: false,
    createdAt: new Date("2026-08-20T09:12:00"),
    transactionId: "TUTE-MAU-2001",
    paymentProvider: "VIETQR",
    status: "SUCCESS",
    refundStatus: "NONE",
    fulfillmentStatus: "NOT_APPLICABLE",
    accountingReversedAt: null as Date | null,
    reversalReason: null as string | null,
    rewardTitle: null as string | null,
    user: { name: "Nguyễn Văn An" },
  },
  {
    id: "sp2",
    amount: 199000,
    totalAmount: 199000,
    depositAmount: 0,
    chargeAmount: 199000,
    orderTotalAmount: 199000,
    paidAmount: 199000,
    remainingAmount: 0,
    accountingAmount: 199000,
    refundAmount: 0,
    cancellationFeeAmount: 0,
    isCashOnDelivery: false,
    displayName: "Trần Minh Đức",
    isAnonymous: false,
    createdAt: new Date("2026-08-21T14:40:00"),
    transactionId: "TUTE-MAU-2002",
    paymentProvider: "VIETQR",
    status: "SUCCESS",
    refundStatus: "NONE",
    fulfillmentStatus: "DELIVERED",
    accountingReversedAt: null as Date | null,
    reversalReason: null as string | null,
    rewardTitle: "Vé ưu đãi khai trương — combo gà rán",
    user: { name: "Trần Minh Đức" },
  },
  {
    id: "sp3",
    amount: 50000,
    totalAmount: 50000,
    depositAmount: 0,
    chargeAmount: 50000,
    orderTotalAmount: 50000,
    paidAmount: 50000,
    remainingAmount: 0,
    accountingAmount: 50000,
    refundAmount: 0,
    cancellationFeeAmount: 0,
    isCashOnDelivery: false,
    displayName: null as string | null,
    isAnonymous: true,
    createdAt: new Date("2026-08-22T08:05:00"),
    transactionId: "VIETQR-MAU-2003",
    paymentProvider: "VIETQR",
    status: "SUCCESS",
    refundStatus: "NONE",
    fulfillmentStatus: "NOT_APPLICABLE",
    accountingReversedAt: null as Date | null,
    reversalReason: null as string | null,
    rewardTitle: null as string | null,
    user: { name: null as string | null },
  },
  {
    id: "sp4",
    amount: 199000,
    totalAmount: 199000,
    depositAmount: 0,
    chargeAmount: 199000,
    orderTotalAmount: 199000,
    paidAmount: 199000,
    remainingAmount: 0,
    accountingAmount: 0,
    refundAmount: 199000,
    cancellationFeeAmount: 0,
    isCashOnDelivery: false,
    displayName: "Lê Thị Hoa",
    isAnonymous: false,
    createdAt: new Date("2026-08-23T18:30:00"),
    transactionId: "TUTE-MAU-2004",
    paymentProvider: "VIETQR",
    status: "REFUNDED",
    refundStatus: "REFUNDED",
    fulfillmentStatus: "CANCELED",
    accountingReversedAt: new Date("2026-08-26T10:00:00"),
    reversalReason: "Trễ SLA (cam kết thời hạn gửi hàng)",
    rewardTitle: "Vé ưu đãi khai trương — combo gà rán",
    user: { name: "Lê Thị Hoa" },
  },
];

function DemoStatement() {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-gray-100 bg-gray-50 p-3 shadow-sm sm:p-6">
      <p className="mb-3 text-center text-[11px] font-black uppercase tracking-widest text-emerald-800">
        Báo cáo đối soát chiến dịch — đúng màn hình sao kê của creator
      </p>
      <TransactionStatement campaign={DEMO_STATEMENT_CAMPAIGN} pledges={DEMO_STATEMENT_PLEDGES} />
    </div>
  );
}

function Figure({ fig }: { fig: PresentationFigure }) {
  if (fig.key === "chung-nhan-tt-uh.jpg") {
    return (
      <figure>
        <DemoCertificate />
        <figcaption className="px-1 py-3 text-left text-sm text-gray-500">{fig.caption}</figcaption>
      </figure>
    );
  }
  if (fig.key === "bien-lai-thanh-toan.jpg") {
    return (
      <figure>
        <DemoInvoice />
        <figcaption className="px-1 py-3 text-left text-sm text-gray-500">{fig.caption}</figcaption>
      </figure>
    );
  }
  if (fig.key === "donation-reward.jpg") {
    return (
      <figure className="grid gap-8">
        <DemoCertificate />
        <DemoInvoice />
        <figcaption className="px-1 text-left text-sm text-gray-500">{fig.caption}</figcaption>
      </figure>
    );
  }
  if (fig.key === "nguoi-ung-ho") {
    return (
      <figure>
        <DemoBackers />
        <figcaption className="px-1 py-3 text-left text-sm text-gray-500">{fig.caption}</figcaption>
      </figure>
    );
  }
  if (fig.key === "sao-ke-he-thong") {
    return (
      <figure>
        <DemoStatement />
        <figcaption className="px-1 py-3 text-left text-sm text-gray-500">{fig.caption}</figcaption>
      </figure>
    );
  }

  return (
    <figure className="overflow-hidden rounded-[1.75rem] border border-gray-100 bg-white shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={mediaUrl(fig.key)} alt={fig.alt} className="h-auto w-full object-cover" />
      <figcaption className="px-5 py-3 text-left text-sm text-gray-500">{fig.caption}</figcaption>
    </figure>
  );
}
