"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Link2Off, Loader2, RefreshCw, Zap } from "lucide-react";
import { toast } from "sonner";

type BrokenLink = {
  id: string;
  type: string;
  title: string;
  path: string;
  url: string;
  httpStatus: number | null;
  checkedAt: string | null;
};

const TYPE_LABEL: Record<string, string> = {
  blog: "Blog",
  campaign: "Chiến dịch",
  project: "Dự án",
  product: "Sản phẩm",
};

export function BrokenLinksPanel({ isPro }: { isPro: boolean }) {
  const [loading, setLoading] = useState(isPro);
  const [scanning, setScanning] = useState(false);
  const [links, setLinks] = useState<BrokenLink[]>([]);

  const load = async () => {
    if (!isPro) return;
    try {
      const res = await fetch("/api/creator/broken-links");
      const data = await res.json();
      if (res.ok) setLinks(data.links || []);
    } catch {
      toast.error("Không tải được danh sách link hỏng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [isPro]);

  const scan = async () => {
    setScanning(true);
    try {
      const res = await fetch("/api/creator/broken-links", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không quét được");
      setLinks(data.links || []);
      toast.success(data.broken ? `Có ${data.broken} link hỏng` : "Không phát hiện link hỏng trong lượt quét này");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setScanning(false);
    }
  };

  if (!isPro) {
    return (
      <div className="rounded-[2rem] border border-dashed border-emerald-200 bg-emerald-50/40 p-6">
        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-emerald-700">
          <Zap size={14} /> Creator Pro
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Cảnh báo link hỏng trên blog, chiến dịch, dự án và sản phẩm — hệ thống báo về khi nguồn bị 404 hoặc vô hiệu.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-gray-900">
            <Link2Off size={16} className="text-amber-600" /> Link hỏng
          </div>
          <p className="mt-1 text-xs text-gray-500">Creator Pro quét link trong nội dung đang public và báo về khi nguồn chết.</p>
        </div>
        <button
          type="button"
          onClick={scan}
          disabled={scanning}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          {scanning ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Quét ngay
        </button>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-400"><Loader2 size={16} className="animate-spin" /> Đang tải...</div>
      ) : links.length === 0 ? (
        <p className="text-sm text-gray-500">Chưa thấy link hỏng.</p>
      ) : (
        <div className="space-y-3">
          {links.map((link) => (
            <div key={link.id} className="rounded-2xl border border-amber-100 bg-amber-50/50 px-4 py-3">
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-700">
                {TYPE_LABEL[link.type] || link.type}
                {link.httpStatus ? ` · ${link.httpStatus}` : ""}
              </div>
              <Link href={link.path} className="mt-1 block text-sm font-bold text-gray-900 hover:text-emerald-700">
                {link.title}
              </Link>
              <a href={link.url} target="_blank" rel="noreferrer" className="mt-1 block truncate text-xs text-gray-500 hover:underline">
                {link.url}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
