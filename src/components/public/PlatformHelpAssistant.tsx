"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Bot, ChevronDown, Leaf, Send, Trash2, X } from "lucide-react";
import { isCommandLikeRequest } from "@/lib/assistant-safety";
import { getAssistantTelemetryConsent, recordAssistantTelemetry, setAssistantTelemetryConsent } from "@/lib/assistant-telemetry";
import { getPlatformHelpAnswer, isGreeting, type PlatformHelpAnswer } from "@/lib/platform-help";
import { isProductReviewQuestion, rewardIdFromProductPath, summarizePublicProductReviews, type PublicProductReview } from "@/lib/public-product-review-summary";
import { publicPageContextFromPath, publicSummaryEndpoint, summarizePublicPage, supplementalSummaryEndpoints, type SupplementalPublicData } from "@/lib/public-page-summary";
import { formatCatalogAnswer, type CatalogHit } from "@/lib/public-catalog-search";
import { catalogQueryFromQuestion } from "@/lib/public-catalog-search";
import { appendZeroMemTrace, clearZeroMemTraces, isZeroMemSensitive, loadZeroMemTraces, retrieveZeroMemEvidence, type ZeroMemTrace } from "@/lib/zero-mem";

type HelpMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  action?: { label: string; href: string };
  sources?: { label: string; href: string }[];
};

const HELP_SESSION_ID = "platform-help";

async function askGroundedAI(question: string, page: ReturnType<typeof publicPageContextFromPath> | { type: string; id: string }, publicData: unknown, sources: { label: string; href: string }[]) {
  const response = await fetch("/api/public/assistant", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ question, page, publicData, sources }),
    cache: "no-store",
  });
  const payload = await response.json();
  if (!response.ok || typeof payload?.answer !== "string") throw new Error(payload?.error || "AI không phản hồi");
  return { answer: payload.answer, sources: Array.isArray(payload.sources) ? payload.sources : sources };
}

async function searchCatalog(question: string) {
  const query = catalogQueryFromQuestion(question) || question.trim();
  if (query.length < 2) return { query, hits: [] as CatalogHit[] };
  const response = await fetch(`/api/public/catalog-search?q=${encodeURIComponent(query)}`, { cache: "no-store" });
  const payload = await response.json().catch(() => ({ hits: [] }));
  return { query, hits: Array.isArray(payload?.hits) ? payload.hits as CatalogHit[] : [] };
}

export default function PlatformHelpAssistant() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<HelpMessage[]>([]);
  const [memoryTraces, setMemoryTraces] = useState<ZeroMemTrace[]>([]);
  const [telemetryEnabled, setTelemetryEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMemoryTraces(loadZeroMemTraces(HELP_SESSION_ID));
    setTelemetryEnabled(getAssistantTelemetryConsent());
  }, []);

  const greeting = useMemo<HelpMessage>(() => ({
    id: "support-welcome",
    role: "assistant",
    content: memoryTraces.filter(trace => trace.role === "user").length ? "Chào bạn! Mình vẫn nhớ mạch trao đổi trong phiên này. Bạn muốn tiếp tục từ câu hỏi trước hay tìm một nội dung khác?" : "Chào bạn! Bạn đang muốn tìm hiểu điều gì trên nền tảng?",
  }), [memoryTraces]);

  useEffect(() => {
    if (open && messages.length === 0) setMessages([greeting]);
  }, [greeting, messages.length, open]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const question = draft.trim();
    if (!question) return;
    const isSensitive = isZeroMemSensitive(question);
    const isCommand = isCommandLikeRequest(question);
    const evidence = retrieveZeroMemEvidence(question, memoryTraces);
    let answer: PlatformHelpAnswer & Pick<HelpMessage, "sources">;
    let answerFailed = false;
    let dataRequestContext = "dữ liệu công khai của trang này";
    setIsLoading(true);
    try {
      if (isSensitive) {
        answer = { content: "Vì an toàn, tôi không lưu hoặc xử lý mật khẩu, mã xác thực, dữ liệu thẻ hay token. Vui lòng không gửi các thông tin này qua chat." };
      } else if (isCommand) {
        answer = getPlatformHelpAnswer(question, evidence);
      } else if (isGreeting(question) || /^(?:cảm ơn|cam on|thanks|thank you|xin lỗi|xin loi|sorry|tạm biệt|tam biet|bye|goodbye)[!.,?\s]*$/iu.test(question)) {
        answer = getPlatformHelpAnswer(question, evidence);
      } else {
        const pageContext = publicPageContextFromPath(window.location.pathname);
        if (!pageContext) {
          dataRequestContext = "danh mục công khai trên nền tảng";
          const catalog = await searchCatalog(question);
          const catalogSources = catalog.hits.map(hit => ({ label: hit.title, href: hit.href }));
          try {
            const grounded = await askGroundedAI(question, { type: "catalog", id: catalog.query || "search" }, { catalog: catalog.hits }, catalogSources);
            answer = { content: grounded.answer, sources: grounded.sources.length ? grounded.sources : catalogSources };
          } catch {
            answer = { content: formatCatalogAnswer(catalog.query || question, catalog.hits), sources: catalogSources };
          }
        } else {
          dataRequestContext = `thông tin công khai của ${pageContext.type}`;
          const response = await fetch(publicSummaryEndpoint(pageContext), { cache: "no-store" });
          const payload = await response.json();
          if (!response.ok || !payload?.data) throw new Error(payload?.error || "Không thể tải dữ liệu công khai");
          const endpoints = supplementalSummaryEndpoints(pageContext);
          const extra: SupplementalPublicData = {};
          const entries = await Promise.all(Object.entries(endpoints).map(async ([key, endpoint]) => {
            try {
              const supplementalResponse = await fetch(endpoint, { cache: "no-store" });
              if (!supplementalResponse.ok) return [key, []] as const;
              const supplementalPayload = await supplementalResponse.json();
              const list = Array.isArray(supplementalPayload) ? supplementalPayload : Array.isArray(supplementalPayload?.data) ? supplementalPayload.data : [];
              return [key, list] as const;
            } catch {
              return [key, []] as const;
            }
          }));
          for (const [key, value] of entries) (extra as Record<string, unknown>)[key] = value;
          let reviewData: PublicProductReview[] | undefined;
          const rewardId = rewardIdFromProductPath(window.location.pathname);
          if (rewardId && isProductReviewQuestion(question)) {
            const reviewResponse = await fetch(`/api/products/${encodeURIComponent(rewardId)}/reviews`, { cache: "no-store" });
            const reviewPayload = await reviewResponse.json();
            if (reviewResponse.ok && Array.isArray(reviewPayload.reviews)) {
              reviewData = reviewPayload.reviews.map((review: unknown) => {
                const item = review as { id?: unknown; rating?: unknown; comment?: unknown };
                return { id: typeof item.id === "string" ? item.id : "", rating: typeof item.rating === "number" ? item.rating : Number.NaN, comment: typeof item.comment === "string" ? item.comment : null };
              });
              (extra as Record<string, unknown>).reviews = reviewData;
            }
          }
          const sources = [{ label: `Trang ${pageContext.type} công khai`, href: window.location.pathname }];
          for (const endpoint of Object.values(endpoints)) sources.push({ label: "Dữ liệu công khai bổ sung", href: endpoint });
          if (rewardId && isProductReviewQuestion(question)) sources.push({ label: "Đánh giá công khai", href: `/api/products/${encodeURIComponent(rewardId)}/reviews` });
          try {
            const grounded = await askGroundedAI(question, pageContext, { primary: payload.data, supplemental: extra }, sources);
            answer = { content: grounded.answer, sources: grounded.sources };
          } catch {
            answer = { content: reviewData ? summarizePublicProductReviews(reviewData) : summarizePublicPage(pageContext.type, payload.data, extra), sources };
          }
        }
      }
    } catch {
      answerFailed = true;
      answer = { content: `Mình chưa tải được ${dataRequestContext} lúc này. Bạn thử lại sau một chút nhé.` };
    } finally {
      setIsLoading(false);
    }
    const now = Date.now();
    setMessages(current => [...current, { id: `support-user-${now}`, role: "user", content: question }, { id: `support-answer-${now}`, role: "assistant", ...answer }]);
    if (!isSensitive && !isCommand) {
      const questionRecord = appendZeroMemTrace(HELP_SESSION_ID, "user", question, now);
      const answerRecord = appendZeroMemTrace(HELP_SESSION_ID, "assistant", answer.content, now + 1);
      setMemoryTraces(answerRecord.accepted ? answerRecord.traces : questionRecord.traces);
    }
    if (answerFailed) recordAssistantTelemetry({ event: "answer_failed", contextTraceCount: memoryTraces.length });
    else if (isSensitive) recordAssistantTelemetry({ event: "sensitive_rejected", contextTraceCount: memoryTraces.length });
    else if (isCommand) recordAssistantTelemetry({ event: "command_rejected", contextTraceCount: memoryTraces.length });
    else recordAssistantTelemetry({ event: "answer_rendered", contextTraceCount: memoryTraces.length, hasAction: Boolean(answer.action) });
    setDraft("");
  }

  function selectPrompt(value: string) {
    setDraft(value);
    requestAnimationFrame(() => document.getElementById("platform-help-input")?.focus());
  }

  function clearMemory() {
    recordAssistantTelemetry({ event: "memory_cleared", contextTraceCount: memoryTraces.length });
    clearZeroMemTraces(HELP_SESSION_ID);
    setMemoryTraces([]);
    setMessages([{ id: `support-memory-cleared-${Date.now()}`, role: "assistant", content: "Đã xóa bộ nhớ Zero-Mem của phiên này trên thiết bị của bạn." }]);
  }

  function updateTelemetryConsent(enabled: boolean) {
    setTelemetryEnabled(enabled);
    setAssistantTelemetryConsent(enabled);
  }

  function togglePanel() {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) recordAssistantTelemetry({ event: "opened", contextTraceCount: memoryTraces.length });
  }

  return <div className="fixed bottom-[8.25rem] right-3 z-[69] md:bottom-24 md:right-6">
    {open && <section aria-label="Trợ lý hướng dẫn nền tảng" className="mb-3 flex h-[min(540px,calc(100vh-10rem))] w-[min(368px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[22px] border border-emerald-100 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
      <header className="flex items-center justify-between border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-lime-50 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2"><span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-600 to-lime-500 text-white"><Bot size={16} /><Leaf className="absolute -right-1 -bottom-1 h-3.5 w-3.5 rounded-full bg-white p-0.5 text-emerald-600" /></span><div className="min-w-0"><p className="text-sm font-bold text-slate-900">Hỗ trợ</p><p className="truncate text-xs text-slate-500">Tìm dự án, blog, chiến dịch</p></div></div>
        <div className="flex items-center gap-1"><button type="button" onClick={clearMemory} aria-label="Xóa bộ nhớ Zero-Mem của phiên" className="grid h-8 w-8 place-items-center rounded-full text-slate-500 transition hover:bg-white hover:text-rose-600"><Trash2 size={15} /></button><button type="button" onClick={() => setOpen(false)} aria-label="Đóng trợ lý nền tảng" className="grid h-8 w-8 place-items-center rounded-full text-slate-500 transition hover:bg-white hover:text-slate-900"><X size={18} /></button></div>
      </header>
      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/70 p-3" aria-busy={isLoading}>
        {isLoading && <div role="status" className="mr-5 rounded-2xl rounded-bl-md bg-white px-3 py-2 text-sm text-slate-500 shadow-sm ring-1 ring-slate-100">Mình đang đọc thông tin công khai trên trang này…</div>}
        {messages.map(message => <div key={message.id} className={message.role === "user" ? "ml-10 rounded-2xl rounded-br-md bg-slate-800 px-3 py-2 text-sm leading-relaxed text-white" : "mr-5 whitespace-pre-line rounded-2xl rounded-bl-md bg-white px-3 py-2 text-sm leading-relaxed text-slate-700 shadow-sm ring-1 ring-slate-100"}><p className="whitespace-pre-line">{message.content}</p>{message.sources?.length ? <div className="mt-2 border-t border-slate-100 pt-2 text-[11px] text-slate-500"><span className="font-semibold">Nguồn công khai:</span> {message.sources.map((source, index) => <a key={`${source.href}-${index}`} href={source.href} className="ml-1 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-700">{source.label}</a>)}</div> : null}{message.action && <a href={message.action.href} className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">{message.action.label} <span aria-hidden>→</span></a>}</div>)}
      </div>
      <div className="border-t border-slate-100 bg-white p-3"><label className="mb-2 flex cursor-pointer items-start gap-2 rounded-lg bg-slate-50 px-2 py-1.5 text-[11px] leading-relaxed text-slate-500"><input type="checkbox" checked={telemetryEnabled} onChange={event => updateTelemetryConsent(event.target.checked)} className="mt-0.5 accent-emerald-600" /><span>Đồng ý chia sẻ số liệu lỗi ẩn danh để cải thiện trợ lý. Không gửi nội dung chat, dữ liệu nhận diện hoặc bộ nhớ Zero-Mem.</span></label><div className="mb-2 flex gap-2 overflow-x-auto pb-1"><button type="button" onClick={() => selectPrompt("Tìm dự án") } className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Tìm dự án</button><button type="button" onClick={() => selectPrompt("Tìm bài viết blog") } className="shrink-0 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">Tìm blog</button><button type="button" onClick={() => selectPrompt("Tìm chiến dịch") } className="shrink-0 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">Tìm chiến dịch</button></div><form onSubmit={submit} className="flex items-center gap-2"><input id="platform-help-input" value={draft} onChange={event => setDraft(event.target.value)} disabled={isLoading} placeholder="Hỏi cách dùng nền tảng…" className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /><button type="submit" disabled={!draft.trim() || isLoading} aria-label="Gửi câu hỏi hỗ trợ" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200"><Send size={16} /></button></form></div>
    </section>}
    <button type="button" onClick={togglePanel} aria-expanded={open} aria-label={open ? "Thu gọn trợ lý nền tảng" : "Mở trợ lý nền tảng"} className="group relative grid h-12 w-12 place-items-center rounded-2xl border border-emerald-200 bg-white text-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-emerald-200 md:h-14 md:w-14"><span className="absolute -top-8 right-0 hidden whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white group-hover:block">Hỗ trợ</span>{open ? <ChevronDown size={23} /> : <span className="relative"><Bot size={24} className="text-emerald-600" /><Leaf className="absolute -right-2 -bottom-1 h-3.5 w-3.5 rounded-full bg-white p-0.5 text-lime-600" /></span>}</button>
  </div>;
}
