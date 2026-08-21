"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Bot, ChevronDown, Loader2, Send, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { type PublicAssistantContext, type PublicAssistantSourceType, resolvePublicAssistantContext } from "@/lib/public-page-assistant";

type SourceType = PublicAssistantSourceType;
type PageContext = PublicAssistantContext | null;
type PublicRecord = Record<string, unknown>;
type ChatMessage = { id: string; role: "assistant" | "user"; content: string };

function DropletRobotMark({ compact = false }: { compact?: boolean }) {
  const size = compact ? "h-7 w-7" : "h-10 w-10";
  const iconSize = compact ? 14 : 19;
  return <span aria-hidden className={`relative grid ${size} rotate-45 place-items-center rounded-[50%_50%_50%_14%] border border-cyan-100 bg-gradient-to-br from-sky-400 via-cyan-500 to-blue-600 shadow-[0_5px_12px_rgba(14,116,144,0.32)]`}>
    <span className="absolute inset-[18%] rounded-[42%] border border-white/50 bg-white/20" />
    <Bot size={iconSize} strokeWidth={2.4} className="relative -rotate-45 text-white" />
    <span className="absolute right-[19%] top-[19%] h-1.5 w-1.5 rounded-full bg-white shadow-sm" />
  </span>;
}

const typeLabels: Record<SourceType, string> = {
  campaign: "chiến dịch",
  product: "sản phẩm",
  blog: "bài viết",
  project: "dự án",
  profile: "trang cá nhân",
};

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : null;
}

function getData(payload: unknown): PublicRecord | null {
  if (!payload || typeof payload !== "object") return null;
  const value = (payload as { data?: unknown }).data ?? payload;
  return value && typeof value === "object" && !Array.isArray(value) ? value as PublicRecord : null;
}

function authorName(data: PublicRecord): string | null {
  const user = data.users;
  if (user && typeof user === "object") return text((user as PublicRecord).displayName) ?? text((user as PublicRecord).name);
  return null;
}

function publicProjects(data: PublicRecord) {
  if (!Array.isArray(data.projects)) return [];
  return data.projects.flatMap(project => {
    if (!project || typeof project !== "object") return [];
    const record = project as PublicRecord;
    const title = text(record.title);
    return title ? [{ title }] : [];
  }).slice(0, 6);
}

function publicProjectCount(data: PublicRecord) {
  const count = data._count;
  if (count && typeof count === "object" && typeof (count as PublicRecord).projects === "number") return (count as PublicRecord).projects as number;
  return Array.isArray(data.projects) ? data.projects.length : null;
}

function formatMoney(value: unknown): string | null {
  const number = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(number) ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(number) : null;
}

function buildQuickSummary(context: PageContext, data: PublicRecord): string {
  if (!context) return "Mở một trang chi tiết công khai để tôi có thể đọc thông tin của trang đó.";
  const title = text(data.title) ?? text(data.displayName) ?? text(data.name) ?? "Nội dung đang xem";
  const description = text(data.excerpt) ?? text(data.description) ?? text(data.longDescription) ?? text(data.content) ?? text(data.bio);
  const facts: string[] = [];
  const author = authorName(data);
  const category = text(data.category);
  const goal = formatMoney(data.goalAmount);
  const raised = formatMoney(data.currentAmount);
  const tags = Array.isArray(data.tags) ? data.tags.filter((tag): tag is string => typeof tag === "string").slice(0, 4) : [];
  const projectCount = context?.sourceType === "profile" ? publicProjectCount(data) : null;
  const projects = context?.sourceType === "profile" ? publicProjects(data) : [];
  if (author) facts.push(`Người tạo: ${author}`);
  if (category) facts.push(`Danh mục: ${category}`);
  if (goal) facts.push(`Mục tiêu: ${goal}`);
  if (raised) facts.push(`Đã huy động: ${raised}`);
  if (tags.length) facts.push(`Chủ đề: ${tags.join(", ")}`);
  if (projectCount !== null) facts.push(`Dự án công khai: ${projectCount}`);
  if (projects.length) facts.push(`Dự án gần đây: ${projects.map(project => project.title).join(", ")}`);
  return [`${title}`, description ? description.slice(0, 420) : `Tôi đã nhận diện đây là ${typeLabels[context.sourceType]}.`, facts.length ? facts.join(" · ") : "Bạn có thể hỏi thêm về nội dung, tiến độ hoặc người tạo."].join("\n\n");
}

function answerQuestion(question: string, context: PageContext, data: PublicRecord): string {
  const normalized = question.toLocaleLowerCase("vi-VN");
  const title = text(data.title) ?? text(data.displayName) ?? text(data.name) ?? "nội dung này";
  const author = authorName(data);
  const goal = formatMoney(data.goalAmount);
  const raised = formatMoney(data.currentAmount);
  const description = text(data.excerpt) ?? text(data.description) ?? text(data.longDescription) ?? text(data.content) ?? text(data.bio);
  const projectCount = context?.sourceType === "profile" ? publicProjectCount(data) : null;
  const projects = context?.sourceType === "profile" ? publicProjects(data) : [];
  const asksAboutProjectCount = /(bao nhiêu|mấy|số lượng|có.*dự án|dự án.*có)/.test(normalized) && /(dự án|project)/.test(normalized);
  const asksAboutProjectNames = /(dự án nào|tên dự án|liệt kê.*dự án)/.test(normalized);
  if (asksAboutProjectCount && projectCount !== null) return `${title} có ${projectCount} dự án công khai.${projects.length ? ` Dự án hiển thị: ${projects.map(project => project.title).join(", ")}.` : ""}`;
  if (asksAboutProjectNames && projects.length) return `Các dự án công khai đang hiển thị của ${title}: ${projects.map(project => project.title).join(", ")}.`;
  if (/(ai tạo|tác giả|người tạo|chủ dự án)/.test(normalized) && author) return `${author} là người được hiển thị công khai cho ${typeLabels[context!.sourceType]} “${title}”.`;
  if (/(mục tiêu|gây quỹ|tiến độ|đã huy động|ủng hộ)/.test(normalized) && (goal || raised)) return [`Tiến độ của “${title}”:`, raised ? `Đã huy động: ${raised}.` : null, goal ? `Mục tiêu: ${goal}.` : null].filter(Boolean).join(" ");
  if (/(tóm tắt|nói về|là gì|thông tin|mô tả)/.test(normalized)) return buildQuickSummary(context, data);
  return `Dựa trên dữ liệu công khai của “${title}”, ${description ? description.slice(0, 300) : `đây là ${typeLabels[context!.sourceType]} đang được xem`}. Tôi chỉ có thể trả lời từ thông tin công khai của trang này.`;
}

export default function QuickPageAssistant() {
  const pathname = usePathname();
  const context = useMemo(() => resolvePublicAssistantContext(pathname), [pathname]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PublicRecord | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const hasLoaded = useRef<string | null>(null);

  useEffect(() => {
    hasLoaded.current = null;
    setData(null);
    setLoadError(null);
    setMessages([]);
  }, [context?.sourceId, context?.sourceType]);

  useEffect(() => {
    if (!open || !context) return;
    const key = `${context.sourceType}:${context.sourceId}`;
    if (hasLoaded.current === key) return;
    hasLoaded.current = key;
    const controller = new AbortController();
    setLoading(true);
    fetch(`/api/public/entities/${context.sourceType}/${encodeURIComponent(context.sourceId)}`, { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error("not-found");
        return response.json();
      })
      .then(payload => {
        const record = getData(payload);
        if (!record) throw new Error("invalid-data");
        setData(record);
        setMessages([{ id: "welcome", role: "assistant", content: buildQuickSummary(context, record) }]);
      })
      .catch(error => {
        if (error.name !== "AbortError") setLoadError("Không thể tải thông tin công khai của trang này.");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [context, open]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const question = draft.trim();
    if (!question || !context || !data) return;
    setMessages(current => [...current, { id: `user-${Date.now()}`, role: "user", content: question }, { id: `assistant-${Date.now()}`, role: "assistant", content: answerQuestion(question, context, data) }]);
    setDraft("");
  }

  function selectPrompt(value: string) {
    setDraft(value);
    requestAnimationFrame(() => document.getElementById("quick-page-assistant-input")?.focus());
  }

  if (!context) return null;
  const contextLabel = `Đang xem: ${typeLabels[context.sourceType]}`;

  return <div className="fixed bottom-20 right-4 z-[70] md:bottom-6 md:right-6">
    {open && <section role="region" aria-label="Trợ lý trang" className="mb-3 flex h-[min(560px,calc(100vh-8rem))] w-[min(368px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
      <header className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white px-4 py-3">
        <div className="flex min-w-0 items-center gap-2"><span className="grid h-8 w-8 shrink-0 place-items-center"><DropletRobotMark compact /></span><div className="min-w-0"><p className="text-sm font-bold text-slate-900">Hỏi nhanh</p><p className="truncate text-xs text-slate-500">{contextLabel}</p></div></div>
        <button type="button" onClick={() => setOpen(false)} aria-label="Đóng trợ lý" className="grid h-8 w-8 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"><X size={18} /></button>
      </header>
      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/70 p-3">
        {loading && <div className="flex items-center gap-2 rounded-2xl bg-white p-3 text-sm text-slate-500 shadow-sm"><Loader2 className="h-4 w-4 animate-spin text-emerald-600" />Đang đọc thông tin công khai…</div>}
        {loadError && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{loadError}</div>}
        {messages.map(message => <div key={message.id} className={message.role === "user" ? "ml-10 rounded-2xl rounded-br-md bg-emerald-600 px-3 py-2 text-sm leading-relaxed text-white" : "mr-5 whitespace-pre-line rounded-2xl rounded-bl-md bg-white px-3 py-2 text-sm leading-relaxed text-slate-700 shadow-sm ring-1 ring-slate-100"}>{message.content}</div>)}
      </div>
      {context && data && <div className="border-t border-slate-100 bg-white p-3"><div className="mb-2 flex gap-2 overflow-x-auto pb-1"><button type="button" onClick={() => selectPrompt("Tóm tắt trang này")} className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Tóm tắt</button><button type="button" onClick={() => selectPrompt("Thông tin người tạo")} className="shrink-0 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">Người tạo</button></div><form onSubmit={submit} className="flex items-center gap-2"><input id="quick-page-assistant-input" value={draft} onChange={event => setDraft(event.target.value)} placeholder="Hỏi về trang này…" className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /><button type="submit" disabled={!draft.trim()} aria-label="Gửi câu hỏi" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200"><Send size={16} /></button></form></div>}
    </section>}
    <button type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-label={open ? "Thu gọn trợ lý" : "Mở trợ lý nhanh"} className="group grid h-14 w-14 place-items-center rounded-2xl border border-cyan-100 bg-white text-slate-900 shadow-[0_8px_24px_rgba(14,116,144,0.18)] transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50 focus:outline-none focus:ring-4 focus:ring-cyan-200"><span className="absolute -top-8 right-0 hidden whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white group-hover:block">Hỏi nhanh</span>{open ? <ChevronDown size={23} /> : <DropletRobotMark />}</button>
  </div>;
}
