"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Download, Gamepad2, Image as ImageIcon, KeyRound, Mail, PackageOpen, Video } from "lucide-react";
import { formatVND } from "@/lib/utils";
import { warehouseCategory, warehouseCategoryLabel, type WarehouseCategory } from "@/lib/warehouse-ui";

export type WarehouseItem = {
  pledgeId: string;
  purchasedAt: string;
  quantity: number;
  amount: number;
  title: string;
  rewardId?: string | null;
  fulfillmentType?: string | null;
  cover?: string | null;
  assetUrl?: string | null;
  licenseKey?: string | null;
  status?: string | null;
};

const FILTERS: WarehouseCategory[] = ["all", "game", "comic", "image", "video", "ebook", "key"];

function TypeIcon({ category }: { category: Exclude<WarehouseCategory, "all"> }) {
  const common = { size: 16 };
  if (category === "game") return <Gamepad2 {...common} />;
  if (category === "comic") return <BookOpen {...common} />;
  if (category === "image") return <ImageIcon {...common} />;
  if (category === "video") return <Video {...common} />;
  if (category === "ebook") return <BookOpen {...common} />;
  if (category === "key") return <KeyRound {...common} />;
  return <Download {...common} />;
}

export default function WarehouseClient({ items, highlightId }: { items: WarehouseItem[]; highlightId?: string }) {
  const [filter, setFilter] = useState<WarehouseCategory>("all");

  useEffect(() => {
    if (!highlightId) return;
    const node = document.getElementById(`item-${highlightId}`);
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightId]);

  const visible = useMemo(() => {
    return items.filter((item) => {
      const category = warehouseCategory(item.fulfillmentType, item.title);
      return filter === "all" || category === filter || (filter === "key" && item.fulfillmentType === "LICENSE_KEY");
    });
  }, [filter, items]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        {FILTERS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              filter === key ? "text-white shadow-lg shadow-green-200" : "border border-gray-200 bg-white text-gray-600 hover:border-pgreen hover:text-pgreen"
            }`}
            style={filter === key ? { background: "linear-gradient(135deg, #2E8B57, #6BCB77)" } : undefined}
          >
            {warehouseCategoryLabel(key)}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-3xl border border-white/60 bg-white/80 p-12 text-center shadow-soft">
          <PackageOpen className="mx-auto mb-4 text-fgreen" size={48} />
          <p className="font-display text-xl font-bold text-dblue">Kho đồ đang trống</p>
          <p className="mt-2 text-sm text-gray-500">Sản phẩm số sau khi thanh toán sẽ xuất hiện ngay tại đây.</p>
          <Link href="/projects" className="mt-6 inline-flex rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg, #2E8B57, #6BCB77)" }}>
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {visible.map((item) => {
            const category = warehouseCategory(item.fulfillmentType, item.title);
            const highlighted = highlightId === item.pledgeId;
            return (
              <article id={`item-${item.pledgeId}`} key={item.pledgeId} className={`overflow-hidden rounded-3xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl ${highlighted ? "ring-2 ring-pgreen ring-offset-2" : ""}`}>
                <div className="flex gap-4 p-5">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-cream">
                    {item.cover ? <img src={item.cover} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-pgreen"><TypeIcon category={category} /></div>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-pgreen">
                      <TypeIcon category={category} /> {warehouseCategoryLabel(category)}
                    </span>
                    {item.rewardId ? (
                      <Link href={`/products/${item.rewardId}`} className="mt-2 block font-display text-lg font-bold text-dblue hover:text-pgreen">{item.title}</Link>
                    ) : (
                      <h2 className="mt-2 font-display text-lg font-bold text-dblue">{item.title}</h2>
                    )}
                    <p className="mt-1 text-xs text-gray-500">Vào kho {new Date(item.purchasedAt).toLocaleDateString("vi-VN")} · {item.quantity} sản phẩm</p>
                  </div>
                </div>
                <div className="border-t border-gray-50 bg-cream/40 px-5 py-4">
                  {item.licenseKey ? (
                    <p className="rounded-xl bg-white px-3 py-2 font-mono text-sm text-dblue">{item.licenseKey}</p>
                  ) : item.assetUrl ? (
                    <a href={item.assetUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-semibold text-pgreen hover:underline">
                      {item.fulfillmentType === "EMAIL" ? <Mail size={16} /> : <Download size={16} />} Mở trong kho đồ
                    </a>
                  ) : (
                    <p className="text-sm text-amber-700">Đã vào kho đồ. Nhà sáng tạo đang bổ sung file tải.</p>
                  )}
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span>{item.status === "DELIVERED" ? "Đã nhận" : "Trong kho"}</span>
                    <span className="font-semibold text-dblue">{formatVND(item.amount)}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
