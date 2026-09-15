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
  FileBadge,
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
  X,
} from "lucide-react";
import type {
  PresentationCard,
  PresentationDeck,
  PresentationFigure,
  PresentationSlide,
} from "@/lib/admin-presentation-types";
import { CertificateDocument } from "@/components/tax/CertificateDocument";
import { InvoiceDocument } from "@/components/invoice/InvoiceDocument";

const KICKER_ICON = {
  "Tầm nhìn": Target,
  "Khoảng trống": Target,
  "Mô hình lai": Handshake,
  "Giữ tiền và hoàn tiền": Package,
  "Luồng hàng Reward": Store,
  "Kiến trúc": GitBranch,
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
    <div className="fixed inset-0 z-[80] flex flex-col bg-[#F8F7F2] text-slate-900">
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

      <main id="thuyet-trinh-scroll" className="relative flex-1 overflow-y-auto">
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
    key === "donation-reward.jpg"
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
  transactionId: "PAYOS-MAU-0001",
  paymentMethod: "PayOS",
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

  return (
    <figure className="overflow-hidden rounded-[1.75rem] border border-gray-100 bg-white shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={mediaUrl(fig.key)} alt={fig.alt} className="h-auto w-full object-cover" />
      <figcaption className="px-5 py-3 text-left text-sm text-gray-500">{fig.caption}</figcaption>
    </figure>
  );
}
