"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock3, Download, Eye, MousePointerClick, Printer, Trash2 } from "lucide-react";

type DailyPoint = { date: string; pageViews: number; pageLeaves: number; ctaClicks: number };
type BehaviorResponse = {
  days: number;
  enabled: boolean;
  ttlDays?: number;
  ttlOptions?: number[];
  topPages: Array<{ path: string; views: number }>;
  longestDwell: Array<{ path: string; visits: number; totalMs: number; avgMs: number }>;
  topCtas: Array<{ ctaId?: string; label?: string; path?: string; clicks: number }>;
  daily?: DailyPoint[];
  totals: { pageViews: number; pageLeaves: number; ctaClicks: number };
};

function formatDuration(ms: number) {
  if (!Number.isFinite(ms) || ms <= 0) return "0s";
  const totalSeconds = Math.round(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes < 60) return seconds ? `${minutes}m ${seconds}s` : `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainMinutes = minutes % 60;
  return remainMinutes ? `${hours}h ${remainMinutes}m` : `${hours}h`;
}

function TrendChart({ series }: { series: DailyPoint[] }) {
  const width = 720;
  const height = 220;
  const pad = { l: 36, r: 12, t: 16, b: 28 };
  const max = Math.max(1, ...series.flatMap((row) => [row.pageViews, row.pageLeaves, row.ctaClicks]));
  const x = (index: number) => pad.l + (index / Math.max(1, series.length - 1)) * (width - pad.l - pad.r);
  const y = (value: number) => height - pad.b - (value / max) * (height - pad.t - pad.b);
  const line = (key: keyof Omit<DailyPoint, "date">) =>
    series.map((row, index) => `${index === 0 ? "M" : "L"}${x(index).toFixed(1)},${y(row[key]).toFixed(1)}`).join(" ");
  if (!series.length) return <p className="text-sm text-gray-400">Chua co du lieu bieu do.</p>;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full" role="img" aria-label="Bieu do hanh vi theo ngay">
      <line x1={pad.l} y1={height - pad.b} x2={width - pad.r} y2={height - pad.b} stroke="#e5e7eb" />
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={height - pad.b} stroke="#e5e7eb" />
      <path d={line("pageViews")} fill="none" stroke="#2563eb" strokeWidth="2.5" />
      <path d={line("pageLeaves")} fill="none" stroke="#7c3aed" strokeWidth="2.5" />
      <path d={line("ctaClicks")} fill="none" stroke="#059669" strokeWidth="2.5" />
      <text x={pad.l} y={14} className="fill-gray-400" fontSize="11">{max}</text>
      <text x={pad.l} y={height - 8} className="fill-gray-400" fontSize="11">{series[0]?.date}</text>
      <text x={width - 92} y={height - 8} className="fill-gray-400" fontSize="11">{series[series.length - 1]?.date}</text>
    </svg>
  );
}

function BarChart({ items }: { items: Array<{ label: string; value: number }> }) {
  const max = Math.max(1, ...items.map((item) => item.value));
  if (!items.length) return <p className="text-sm text-gray-400">Chua co du lieu.</p>;
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.label} className="grid grid-cols-[1fr_auto] items-center gap-3">
          <div>
            <div className="mb-1 truncate text-xs font-bold text-gray-600">{item.label}</div>
            <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.max(6, (item.value / max) * 100)}%` }} />
            </div>
          </div>
          <div className="text-sm font-black text-emerald-700">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

function toCsv(rows: Array<Record<string, string | number>>) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
  return [headers.join(","), ...rows.map((row) => headers.map((key) => escape(row[key] ?? "")).join(","))].join("\n");
}

export default function BehaviorInsights() {
  const [days, setDays] = useState(7);
  const [data, setData] = useState<BehaviorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [ttlDays, setTtlDays] = useState(180);
  const [savingTtl, setSavingTtl] = useState(false);
  const [purgeBeforeDays, setPurgeBeforeDays] = useState(30);
  const [purgeEvent, setPurgeEvent] = useState("ALL");
  const [purgeAll, setPurgeAll] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [purging, setPurging] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch(`/api/admin/analytics/behavior?days=${days}`)
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error || "Khong tai duoc thong ke hanh vi.");
        setData(body as BehaviorResponse);
        if (typeof body.ttlDays === "number") setTtlDays(body.ttlDays);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [days]);

  const daily = data?.daily || [];
  const ctaBars = useMemo(
    () => (data?.topCtas || []).slice(0, 8).map((row) => ({
      label: row.label || row.ctaId || "CTA",
      value: row.clicks,
    })),
    [data],
  );

  const exportCsv = () => {
    const dailyCsv = toCsv((daily || []).map((row) => ({
      date: row.date,
      pageViews: row.pageViews,
      pageLeaves: row.pageLeaves,
      ctaClicks: row.ctaClicks,
    })));
    const pagesCsv = toCsv((data?.topPages || []).map((row) => ({ path: row.path, views: row.views })));
    const dwellCsv = toCsv((data?.longestDwell || []).map((row) => ({
      path: row.path,
      visits: row.visits,
      avgMs: row.avgMs,
    })));
    const ctaCsv = toCsv((data?.topCtas || []).map((row) => ({
      ctaId: row.ctaId || "",
      label: row.label || "",
      path: row.path || "",
      clicks: row.clicks,
    })));
    const blob = new Blob(
      [`# daily\n${dailyCsv}\n\n# pages\n${pagesCsv}\n\n# dwell\n${dwellCsv}\n\n# cta\n${ctaCsv}\n`],
      { type: "text/csv;charset=utf-8" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `behavior-analytics-${days}d.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const saveTtl = async () => {
    setSavingTtl(true);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/analytics/behavior", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ttlDays }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "Khong luu duoc TTL.");
      setNotice(`Da dat tu xoa sau ${ttlDays} ngay.`);
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingTtl(false);
    }
  };

  const purge = async () => {
    const expected = purgeAll ? "DELETE_ALL" : "DELETE";
    if (confirmText !== expected) {
      setError(`Go ${expected} de xac nhan.`);
      return;
    }
    setPurging(true);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/analytics/behavior", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirm: expected,
          all: purgeAll,
          beforeDays: purgeBeforeDays,
          eventNames: purgeEvent === "ALL" ? undefined : [purgeEvent],
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "Khong xoa duoc du lieu.");
      setNotice(`Da xoa ${body.deletedCount || 0} event.`);
      setConfirmText("");
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPurging(false);
    }
  };

  return (
    <section className="behavior-report space-y-6">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .behavior-report, .behavior-report * { visibility: visible; }
          .behavior-report { position: absolute; inset: 0; background: white; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Hanh vi nguoi dung</h2>
          <p className="text-sm font-medium text-gray-400">
            Trang o lau nhat, nut bam nhieu nhat, bieu do theo ngay (Mongo, khong gom admin/KYC)
          </p>
        </div>
        <div className="no-print flex flex-wrap items-center gap-2">
          <label className="text-sm font-semibold text-gray-500">
            Khoang thoi gian
            <select
              value={days}
              onChange={(event) => setDays(Number(event.target.value))}
              className="ml-3 rounded-xl border border-gray-200 bg-white px-3 py-2 font-bold text-gray-800"
            >
              <option value={7}>7 ngay</option>
              <option value={30}>30 ngay</option>
              <option value={90}>90 ngay</option>
            </select>
          </label>
          <button type="button" onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-700">
            <Download size={16} /> CSV
          </button>
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-700">
            <Printer size={16} /> In bao cao
          </button>
        </div>
      </div>

      {data && !data.enabled && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Mongo analytics dang tat (ENABLE_MONGO_ANALYTICS). Bat flag hien co thi su kien moi duoc luu.
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
      )}
      {notice && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{notice}</div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-gray-100 bg-white p-6">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-400"><Eye size={16} /> Luot xem trang</div>
          <div className="text-3xl font-black text-gray-900">{loading ? "..." : data?.totals.pageViews ?? 0}</div>
        </div>
        <div className="rounded-3xl border border-gray-100 bg-white p-6">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-400"><Clock3 size={16} /> Phien do thoi gian</div>
          <div className="text-3xl font-black text-gray-900">{loading ? "..." : data?.totals.pageLeaves ?? 0}</div>
        </div>
        <div className="rounded-3xl border border-gray-100 bg-white p-6">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-400"><MousePointerClick size={16} /> Luot bam CTA</div>
          <div className="text-3xl font-black text-gray-900">{loading ? "..." : data?.totals.ctaClicks ?? 0}</div>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-black text-gray-900">Bieu do theo ngay</h3>
          <div className="flex flex-wrap gap-3 text-xs font-bold">
            <span className="text-blue-600">Xem trang</span>
            <span className="text-violet-600">Dwell</span>
            <span className="text-emerald-600">CTA</span>
          </div>
        </div>
        <TrendChart series={daily} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <h3 className="mb-6 text-xl font-black text-gray-900">Trang o lau nhat</h3>
          <div className="space-y-3">
            {(data?.longestDwell || []).length === 0 && !loading && <p className="text-sm text-gray-400">Chua co du lieu dwell time.</p>}
            {(data?.longestDwell || []).map((row) => (
              <div key={row.path} className="flex items-center justify-between gap-4 rounded-2xl bg-gray-50 p-4">
                <div className="min-w-0">
                  <div className="truncate font-bold text-gray-900">{row.path}</div>
                  <div className="text-xs text-gray-400">{row.visits} phien</div>
                </div>
                <div className="text-right text-sm font-black text-indigo-600">{formatDuration(row.avgMs)}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <h3 className="mb-6 text-xl font-black text-gray-900">Nut bam nhieu nhat</h3>
          <BarChart items={ctaBars} />
        </div>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
        <h3 className="mb-6 text-xl font-black text-gray-900">Trang xem nhieu nhat</h3>
        <div className="space-y-3">
          {(data?.topPages || []).length === 0 && !loading && <p className="text-sm text-gray-400">Chua co page view.</p>}
          {(data?.topPages || []).map((row) => (
            <div key={row.path} className="flex items-center justify-between gap-4 rounded-2xl bg-gray-50 p-4">
              <div className="truncate font-bold text-gray-900">{row.path}</div>
              <div className="text-sm font-black text-blue-600">{row.views}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="no-print grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <h3 className="mb-2 text-xl font-black text-gray-900">Tu xoa du lieu</h3>
          <p className="mb-4 text-sm text-gray-400">Mongo TTL: event cu hon so ngay nay se bi xoa tu dong.</p>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={ttlDays}
              onChange={(event) => setTtlDays(Number(event.target.value))}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 font-bold text-gray-800"
            >
              {(data?.ttlOptions || [30, 90, 180, 365]).map((option) => (
                <option key={option} value={option}>{option} ngay</option>
              ))}
            </select>
            <button
              type="button"
              onClick={saveTtl}
              disabled={savingTtl || !data?.enabled}
              className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              {savingTtl ? "Dang luu..." : "Luu TTL"}
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-red-100 bg-white p-8 shadow-sm">
          <h3 className="mb-2 flex items-center gap-2 text-xl font-black text-gray-900"><Trash2 size={18} /> Xoa thu cong</h3>
          <p className="mb-4 text-sm text-gray-400">Chi xoa event hanh vi (PAGE_VIEW / PAGE_LEAVE / CTA_CLICK).</p>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-600">
              <input type="checkbox" checked={purgeAll} onChange={(event) => setPurgeAll(event.target.checked)} />
              Xoa toan bo (khong theo ngay)
            </label>
            {!purgeAll && (
              <select
                value={purgeBeforeDays}
                onChange={(event) => setPurgeBeforeDays(Number(event.target.value))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 font-bold text-gray-800"
              >
                <option value={7}>Event cu hon 7 ngay</option>
                <option value={30}>Event cu hon 30 ngay</option>
                <option value={90}>Event cu hon 90 ngay</option>
              </select>
            )}
            <select
              value={purgeEvent}
              onChange={(event) => setPurgeEvent(event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 font-bold text-gray-800"
            >
              <option value="ALL">Tat ca loai event hanh vi</option>
              <option value="PAGE_VIEW">PAGE_VIEW</option>
              <option value="PAGE_LEAVE">PAGE_LEAVE</option>
              <option value="CTA_CLICK">CTA_CLICK</option>
            </select>
            <input
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              placeholder={purgeAll ? "Go DELETE_ALL" : "Go DELETE"}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 font-mono text-sm"
            />
            <button
              type="button"
              onClick={purge}
              disabled={purging || !data?.enabled}
              className="w-full rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              {purging ? "Dang xoa..." : "Xoa du lieu"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
