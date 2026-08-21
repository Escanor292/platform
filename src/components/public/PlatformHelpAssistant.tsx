"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Bot, ChevronDown, Leaf, Send, Trash2, X } from "lucide-react";
import { getPlatformHelpAnswer, type PlatformHelpAnswer } from "@/lib/platform-help";
import { appendZeroMemTrace, clearZeroMemTraces, isZeroMemSensitive, loadZeroMemTraces, retrieveZeroMemEvidence, type ZeroMemTrace } from "@/lib/zero-mem";

type HelpMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  action?: { label: string; href: string };
};

const HELP_SESSION_ID = "platform-help";

export default function PlatformHelpAssistant() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<HelpMessage[]>([]);
  const [memoryTraces, setMemoryTraces] = useState<ZeroMemTrace[]>([]);

  useEffect(() => setMemoryTraces(loadZeroMemTraces(HELP_SESSION_ID)), []);

  const greeting = useMemo<HelpMessage>(() => ({
    id: "support-welcome",
    role: "assistant",
    content: memoryTraces.filter(trace => trace.role === "user").length ? "Chào bạn, tôi có thể tiếp tục phần hướng dẫn trong phiên này. Bộ nhớ Zero-Mem chỉ lưu cục bộ theo phiên và có thể xóa bất cứ lúc nào." : "Chào bạn, tôi có thể hướng dẫn cách dùng nền tảng, tìm chức năng, tra cứu thông tin và xem các chính sách công khai.",
  }), [memoryTraces]);

  useEffect(() => {
    if (open && messages.length === 0) setMessages([greeting]);
  }, [greeting, messages.length, open]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const question = draft.trim();
    if (!question) return;
    const isSensitive = isZeroMemSensitive(question);
    const evidence = retrieveZeroMemEvidence(question, memoryTraces);
    const answer: PlatformHelpAnswer = isSensitive ? { content: "Vì an toàn, tôi không lưu hoặc xử lý mật khẩu, mã xác thực, dữ liệu thẻ hay token. Vui lòng không gửi các thông tin này qua chat." } : getPlatformHelpAnswer(question, evidence);
    const now = Date.now();
    setMessages(current => [...current, { id: `support-user-${now}`, role: "user", content: question }, { id: `support-answer-${now}`, role: "assistant", ...answer }]);
    if (!isSensitive) {
      const questionRecord = appendZeroMemTrace(HELP_SESSION_ID, "user", question, now);
      const answerRecord = appendZeroMemTrace(HELP_SESSION_ID, "assistant", answer.content, now + 1);
      setMemoryTraces(answerRecord.accepted ? answerRecord.traces : questionRecord.traces);
    }
    setDraft("");
  }

  function selectPrompt(value: string) {
    setDraft(value);
    requestAnimationFrame(() => document.getElementById("platform-help-input")?.focus());
  }

  function clearMemory() {
    clearZeroMemTraces(HELP_SESSION_ID);
    setMemoryTraces([]);
    setMessages([{ id: `support-memory-cleared-${Date.now()}`, role: "assistant", content: "Đã xóa bộ nhớ Zero-Mem của phiên này trên thiết bị của bạn." }]);
  }

  return <div className="fixed bottom-36 right-4 z-[69] md:bottom-24 md:right-6">
    {open && <section aria-label="Trợ lý hướng dẫn nền tảng" className="mb-3 flex h-[min(550px,calc(100vh-9rem))] w-[min(368px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[22px] border border-emerald-100 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
      <header className="flex items-center justify-between border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-lime-50 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2"><span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-600 to-lime-500 text-white"><Bot size={16} /><Leaf className="absolute -right-1 -bottom-1 h-3.5 w-3.5 rounded-full bg-white p-0.5 text-emerald-600" /></span><div className="min-w-0"><p className="text-sm font-bold text-slate-900">Trợ lý nền tảng</p><p className="truncate text-xs text-slate-500">Hướng dẫn công khai · Zero-Mem cục bộ</p></div></div>
        <div className="flex items-center gap-1"><button type="button" onClick={clearMemory} aria-label="Xóa bộ nhớ Zero-Mem của phiên" className="grid h-8 w-8 place-items-center rounded-full text-slate-500 transition hover:bg-white hover:text-rose-600"><Trash2 size={15} /></button><button type="button" onClick={() => setOpen(false)} aria-label="Đóng trợ lý nền tảng" className="grid h-8 w-8 place-items-center rounded-full text-slate-500 transition hover:bg-white hover:text-slate-900"><X size={18} /></button></div>
      </header>
      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/70 p-3">
        {messages.map(message => <div key={message.id} className={message.role === "user" ? "ml-10 rounded-2xl rounded-br-md bg-slate-800 px-3 py-2 text-sm leading-relaxed text-white" : "mr-5 rounded-2xl rounded-bl-md bg-white px-3 py-2 text-sm leading-relaxed text-slate-700 shadow-sm ring-1 ring-slate-100"}><p>{message.content}</p>{message.action && <a href={message.action.href} className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">{message.action.label} <span aria-hidden>→</span></a>}</div>)}
      </div>
      <div className="border-t border-slate-100 bg-white p-3"><p className="mb-2 text-[11px] text-slate-400">Bộ nhớ Zero-Mem chỉ lưu trên thiết bị trong phiên này, tự hết hạn sau 30 phút. Không gửi mật khẩu, OTP, token hay dữ liệu thẻ.</p><div className="mb-2 flex gap-2 overflow-x-auto pb-1"><button type="button" onClick={() => selectPrompt("Tôi muốn tạo chiến dịch") } className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Tạo chiến dịch</button><button type="button" onClick={() => selectPrompt("Chính sách bảo mật là gì?") } className="shrink-0 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">Chính sách</button><button type="button" onClick={() => selectPrompt("Tôi cần tra cứu thông tin") } className="shrink-0 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">Tra cứu</button></div><form onSubmit={submit} className="flex items-center gap-2"><input id="platform-help-input" value={draft} onChange={event => setDraft(event.target.value)} placeholder="Hỏi cách dùng nền tảng…" className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /><button type="submit" disabled={!draft.trim()} aria-label="Gửi câu hỏi hỗ trợ" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200"><Send size={16} /></button></form></div>
    </section>}
    <button type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-label={open ? "Thu gọn trợ lý nền tảng" : "Mở trợ lý nền tảng"} className="group grid h-14 w-14 place-items-center rounded-2xl border border-emerald-200 bg-white text-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-emerald-200"><span className="absolute -top-8 right-0 hidden whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white group-hover:block">Hướng dẫn sử dụng</span>{open ? <ChevronDown size={23} /> : <span className="relative"><Bot size={24} className="text-emerald-600" /><Leaf className="absolute -right-2 -bottom-1 h-3.5 w-3.5 rounded-full bg-white p-0.5 text-lime-600" /></span>}</button>
  </div>;
}
