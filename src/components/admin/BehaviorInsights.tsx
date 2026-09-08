"use client";

import { useEffect, useState } from "react";
import { Clock3, MousePointerClick, Eye } from "lucide-react";

type BehaviorResponse = {
  days: number;
  enabled: boolean;
  topPages: Array<{ path: string; views: number }>;
  longestDwell: Array<{ path: string; visits: number; totalMs: number; avgMs: number }>;
  topCtas: Array<{ ctaId?: string; label?: string; path?: string; clicks: number }>;
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

export default function BehaviorInsights() {
  const [days, setDays] = useState(7);
  const [data, setData] = useState<BehaviorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/admin/analytics/behavior?days=${days}`)
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error || "Khong tai duoc thong ke hanh vi.");
        if (!cancelled) {
          setData(body as BehaviorResponse);
          setError(null);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Hanh vi nguoi dung</h2>
          <p className="text-sm text-gray-400 font-medium">
            Trang o lau nhat va nut/CTA duoc bam nhieu nhat (luu Mongo, khong gom admin/KYC)
          </p>
        </div>
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
      </div>

      {data && !data.enabled && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Mongo analytics dang tat (ENABLE_MONGO_ANALYTICS). Bat flag hien co thi su kien moi duoc luu.
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-gray-100 bg-white p-6">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-400">
            <Eye size={16} /> Luot xem trang
          </div>
          <div className="text-3xl font-black text-gray-900">{loading ? "..." : data?.totals.pageViews ?? 0}</div>
        </div>
        <div className="rounded-3xl border border-gray-100 bg-white p-6">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-400">
            <Clock3 size={16} /> Phien do thoi gian
          </div>
          <div className="text-3xl font-black text-gray-900">{loading ? "..." : data?.totals.pageLeaves ?? 0}</div>
        </div>
        <div className="rounded-3xl border border-gray-100 bg-white p-6">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-400">
            <MousePointerClick size={16} /> Luot bam CTA
          </div>
          <div className="text-3xl font-black text-gray-900">{loading ? "..." : data?.totals.ctaClicks ?? 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <h3 className="mb-6 text-xl font-black text-gray-900">Trang o lau nhat</h3>
          <div className="space-y-3">
            {(data?.longestDwell || []).length === 0 && !loading && (
              <p className="text-sm text-gray-400">Chua co du lieu dwell time.</p>
            )}
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
          <div className="space-y-3">
            {(data?.topCtas || []).length === 0 && !loading && (
              <p className="text-sm text-gray-400">Chua co du lieu CTA.</p>
            )}
            {(data?.topCtas || []).map((row, index) => (
              <div key={`${row.ctaId}-${row.path}-${index}`} className="flex items-center justify-between gap-4 rounded-2xl bg-gray-50 p-4">
                <div className="min-w-0">
                  <div className="truncate font-bold text-gray-900">{row.label || row.ctaId || "CTA"}</div>
                  <div className="truncate text-xs text-gray-400">{row.ctaId} · {row.path}</div>
                </div>
                <div className="text-right text-sm font-black text-emerald-600">{row.clicks}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
        <h3 className="mb-6 text-xl font-black text-gray-900">Trang xem nhieu nhat</h3>
        <div className="space-y-3">
          {(data?.topPages || []).length === 0 && !loading && (
            <p className="text-sm text-gray-400">Chua co page view.</p>
          )}
          {(data?.topPages || []).map((row) => (
            <div key={row.path} className="flex items-center justify-between gap-4 rounded-2xl bg-gray-50 p-4">
              <div className="truncate font-bold text-gray-900">{row.path}</div>
              <div className="text-sm font-black text-blue-600">{row.views}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
