"use client";

import { useEffect, useMemo, useState } from "react";
import { useOwnerView } from "./OwnerViewContext";
import type { DonutSlice, OrderSuccessStats } from "@/lib/owner-revenue";

const SLICE_COLORS: Record<string, string> = {
  noGift: "#1F4E79",
  gift: "#2E8B57",
  product: "#2F80ED",
  success: "#6BCB77",
  other: "#E8E4D8",
};

function formatVnd(amount: number) {
  return amount.toLocaleString("vi-VN") + " đ";
}

function SvgDonut({
  slices,
  centerLabel,
  centerValue,
  size = 144,
}: {
  slices: Array<DonutSlice & { color: string }>;
  centerLabel: string;
  centerValue: string;
  size?: number;
}) {
  const total = slices.reduce((sum, slice) => sum + Math.max(0, slice.amount), 0);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 120 120" className="h-full w-full" role="img" aria-label={centerLabel}>
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#F8F7F2" strokeWidth="16" />
          {total > 0 &&
            slices.map((slice) => {
              const length = (Math.max(0, slice.amount) / total) * circumference;
              const circle = (
                <circle
                  key={slice.key}
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth="16"
                  strokeDasharray={`${length} ${circumference - length}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                  transform="rotate(-90 60 60)"
                />
              );
              offset += length;
              return circle;
            })}
        </svg>
        <div className="pointer-events-none absolute inset-[22%] flex flex-col items-center justify-center rounded-full bg-white text-center shadow-inner">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{centerLabel}</div>
          <div className="mt-0.5 px-1 text-xs font-black leading-tight text-dblue">{centerValue}</div>
        </div>
      </div>
      <ul className="w-full space-y-2">
        {slices.map((slice) => {
          const percent = total > 0 ? Math.round((slice.amount / total) * 100) : 0;
          return (
            <li key={slice.key} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-gray-700">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
                <span className="truncate">{slice.label}</span>
              </span>
              <span className="shrink-0 font-semibold text-dblue">
                {formatVnd(slice.amount)} · {percent}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SuccessRing({ orders }: { orders: OrderSuccessStats }) {
  const percent = Math.round(orders.successRate * 100);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const filled = (percent / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-24 w-24 shrink-0">
        <svg viewBox="0 0 120 120" className="h-full w-full" role="img" aria-label="Tỷ lệ đơn thành công">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#E8E4D8" strokeWidth="14" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#6BCB77"
            strokeWidth="14"
            strokeDasharray={`${filled} ${circumference - filled}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div className="pointer-events-none absolute inset-[22%] flex items-center justify-center rounded-full bg-white text-lg font-black text-pgreen">
          {percent}%
        </div>
      </div>
      <div>
        <div className="text-sm font-bold text-dblue">Đơn hàng thành công</div>
        <div className="text-xs text-gray-500">
          {orders.successCount}/{orders.totalCount} đơn đã thanh toán
        </div>
      </div>
    </div>
  );
}

type PanelKind = "project" | "campaign" | "product";

export function OwnerRevenuePanel({ kind, id }: { kind: PanelKind; id: string }) {
  const { showOwnerUi } = useOwnerView();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<{
    slices: DonutSlice[];
    orders: OrderSuccessStats;
    campaignAmount: number;
    productAmount: number;
  } | null>(null);
  const [campaign, setCampaign] = useState<{ slices: DonutSlice[] } | null>(null);
  const [product, setProduct] = useState<{ revenue: number; orders: OrderSuccessStats } | null>(null);

  useEffect(() => {
    if (!showOwnerUi || !id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    const path =
      kind === "project"
        ? `/api/projects/${id}/owner-stats`
        : kind === "campaign"
          ? `/api/campaigns/${id}/owner-stats`
          : `/api/products/${id}/owner-stats`;
    fetch(path, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Không tải được thống kê");
        return data;
      })
      .then((data) => {
        if (cancelled) return;
        if (kind === "project") setProject(data);
        if (kind === "campaign") setCampaign(data);
        if (kind === "product") setProduct(data);
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
  }, [id, kind, showOwnerUi]);

  const coloredSlices = useMemo(() => {
    const raw = kind === "project" ? project?.slices : campaign?.slices;
    return (raw || []).map((slice) => ({
      ...slice,
      color: SLICE_COLORS[slice.key] || "#1F4E79",
    }));
  }, [campaign?.slices, kind, project?.slices]);

  if (!showOwnerUi) return null;

  return (
    <section className="mb-6 rounded-3xl border border-pgreen/15 bg-white p-5 shadow-soft">
      <div className="mb-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-pgreen">Chỉ chủ thấy</p>
        <h2 className="font-display text-xl font-bold text-dblue">Thống kê doanh thu</h2>
      </div>
      {loading && <p className="text-sm text-gray-500">Đang tải số liệu...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && kind === "project" && project && (
        <div className="grid gap-6 lg:grid-cols-2">
          <SvgDonut
            slices={coloredSlices}
            centerLabel="Tổng"
            centerValue={formatVnd(project.slices.reduce((sum, slice) => sum + slice.amount, 0))}
          />
          <div className="space-y-4">
            <p className="text-xs text-gray-500">
              Ba lát không chồng nhau: ủng hộ không quà, ủng hộ có quà, và sản phẩm shop không gắn chiến dịch.
              Tổng chiến dịch {formatVnd(project.campaignAmount)}.
            </p>
            <SuccessRing orders={project.orders} />
          </div>
        </div>
      )}
      {!loading && !error && kind === "campaign" && campaign && (
        <SvgDonut
          slices={coloredSlices}
          centerLabel="Chiến dịch"
          centerValue={formatVnd(campaign.slices.reduce((sum, slice) => sum + slice.amount, 0))}
        />
      )}
      {!loading && !error && kind === "product" && product && (
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Doanh thu đã ghi nhận: <span className="font-bold text-dblue">{formatVnd(product.revenue)}</span>
          </div>
          <SuccessRing orders={product.orders} />
        </div>
      )}
    </section>
  );
}
