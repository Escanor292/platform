"use client";

import { useState } from "react";
import { AlertCircle, ChevronDown, Loader2, RefreshCw, Sparkles } from "lucide-react";
import type { SummaryResult, SummarySourceType } from "@/lib/ai-summary/types";

const TYPE_LABELS: Record<SummarySourceType, string> = {
  profile: "trang cá nhân",
  product: "sản phẩm",
  blog: "bài blog",
  project: "dự án",
  campaign: "chiến dịch",
};

function Section({ title, items, tone = "default" }: { title: string; items: string[]; tone?: "default" | "warning" | "success" }) {
  if (!items.length) return null;
  const toneClass = tone === "warning" ? "bg-amber-50 border-amber-100" : tone === "success" ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-100";
  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <h4 className="mb-2 text-sm font-bold text-slate-900">{title}</h4>
      <ul className="space-y-2 text-sm leading-relaxed text-slate-700">
        {items.map((item, index) => <li key={`${title}-${index}`} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" />{item}</li>)}
      </ul>
    </div>
  );
}

export default function EntitySummaryCard({ sourceType, sourceId }: { sourceType: SummarySourceType; sourceId: string }) {
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function generateSummary() {
    setLoading(true);
    setError(null);
    setOpen(true);
    try {
      const response = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceType, sourceId }),
      });
      const payload = await response.json() as { result?: SummaryResult; error?: string };
      if (!response.ok || !payload.result) throw new Error(payload.error || "Không thể tạo bản tóm tắt.");
      setResult(payload.result);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Không thể tạo bản tóm tắt.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="my-6 overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-emerald-50 shadow-sm">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-sm"><Sparkles size={18} /></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-700">AI Insight</p>
            <h3 className="mt-1 text-lg font-black text-slate-900">Tóm tắt nhanh {TYPE_LABELS[sourceType]}</h3>
            <p className="mt-1 text-sm text-slate-600">Tổng hợp điểm chính, tín hiệu nổi bật, rủi ro và khuyến nghị từ dữ liệu công khai.</p>
          </div>
        </div>
        <button type="button" onClick={result ? () => setOpen(value => !value) : generateSummary} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70">
          {loading ? <Loader2 size={16} className="animate-spin" /> : result ? <ChevronDown size={16} className={open ? "rotate-180 transition-transform" : "transition-transform"} /> : <Sparkles size={16} />}
          {loading ? "Đang tổng hợp..." : result ? (open ? "Thu gọn" : "Xem tóm tắt") : "Tóm tắt bằng AI"}
        </button>
      </div>

      {open && (
        <div className="border-t border-violet-100 bg-white/70 p-5 sm:p-6">
          {loading && <div className="flex items-center gap-2 text-sm text-slate-600"><Loader2 size={16} className="animate-spin" /> Đang đọc dữ liệu và xây dựng bản tổng hợp...</div>}
          {error && <div className="flex items-start gap-2 rounded-2xl bg-red-50 p-4 text-sm text-red-700"><AlertCircle size={17} className="mt-0.5 shrink-0" /><div><p>{error}</p><button type="button" onClick={generateSummary} className="mt-2 inline-flex items-center gap-1 font-bold underline"><RefreshCw size={13} /> Thử lại</button></div></div>}
          {result && !loading && (
            <div className="space-y-5">
              <div>
                <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-700">{result.provider === "llm" ? `LLM · ${result.model}` : "Chế độ miễn phí không cần API key"}</span><span className="text-xs text-slate-500">Cập nhật {new Date(result.generatedAt).toLocaleString("vi-VN")}</span></div>
                <h4 className="mt-3 text-xl font-black leading-tight text-slate-900">{result.headline}</h4>
                <p className="mt-2 leading-relaxed text-slate-700">{result.overview}</p>
              </div>
              {result.metrics.length > 0 && <div className="grid grid-cols-2 gap-3 md:grid-cols-5">{result.metrics.map(metric => <div key={metric.label} className="rounded-2xl border border-slate-100 bg-white p-3"><div className="text-xs text-slate-500">{metric.label}</div><div className="mt-1 text-base font-black text-slate-900">{metric.value}</div></div>)}</div>}
              <div className="grid gap-4 md:grid-cols-2"><Section title="Điểm chính" items={result.keyPoints} /><Section title="Điểm mạnh" items={result.strengths} tone="success" /><Section title="Rủi ro và khoảng trống" items={result.risks} tone="warning" /><Section title="Khuyến nghị" items={result.recommendations} /></div>
              {result.keywords.length > 0 && <div className="flex flex-wrap gap-2">{result.keywords.map(keyword => <span key={keyword} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">#{keyword}</span>)}</div>}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
