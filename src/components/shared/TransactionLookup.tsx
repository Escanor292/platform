"use client";

import { useState } from "react";
import Link from "next/link";
import { formatVND } from "@/lib/utils";

interface TransactionResult {
  id: string;
  referenceCode: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
  campaign?: {
    id: string;
    title: string;
    slug: string;
    imageUrl?: string | null;
  };
  pledge?: {
    displayName?: string | null;
    isAnonymous: boolean;
    amount: number;
  };
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  SUCCESS: { label: "Thành công", color: "text-green-600 bg-green-50 border-green-200" },
  PENDING: { label: "Đang xử lý", color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
  FAILED: { label: "Thất bại", color: "text-red-600 bg-red-50 border-red-200" },
  CANCELLED: { label: "Đã hủy", color: "text-gray-600 bg-gray-50 border-gray-200" },
};

const TYPE_LABELS: Record<string, string> = {
  PLEDGE: "Ủng hộ dự án",
  REFUND: "Hoàn tiền",
  WITHDRAWAL: "Giải ngân",
  TIP: "Tip nền tảng",
};

export default function TransactionLookup() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<TransactionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`/api/transactions/${encodeURIComponent(query.trim())}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Không tìm thấy giao dịch");
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const status = result ? STATUS_LABELS[result.status] : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nhập mã giao dịch (VD: TX-1234567890-ABCDE)"
          className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium px-6 py-3 rounded-xl transition flex items-center gap-2"
        >
          {loading ? (
            <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block" />
          ) : (
            "🔍"
          )}
          Tra cứu
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Mã giao dịch</p>
                <p className="font-mono font-semibold text-gray-800 text-sm">
                  {result.referenceCode}
                </p>
              </div>
              {status && (
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full border ${status.color}`}
                >
                  {status.label}
                </span>
              )}
            </div>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Loại giao dịch</p>
                <p className="font-medium text-gray-800">
                  {TYPE_LABELS[result.type] ?? result.type}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Số tiền</p>
                <p className="font-bold text-indigo-700">{formatVND(result.amount)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Ngày tạo</p>
                <p className="font-medium text-gray-800">
                  {new Date(result.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
              {result.pledge && (
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">Người ủng hộ</p>
                  <p className="font-medium text-gray-800">
                    {result.pledge.isAnonymous ? "🎭 Ẩn danh" : (result.pledge.displayName || "—")}
                  </p>
                </div>
              )}
            </div>

            {result.campaign && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-gray-400 text-xs mb-2">Dự án liên quan</p>
                <Link
                  href={`/campaigns/${result.campaign.slug}`}
                  className="flex items-center gap-3 group"
                >
                  {result.campaign.imageUrl && (
                    <img
                      src={result.campaign.imageUrl}
                      alt={result.campaign.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <p className="font-medium text-indigo-700 group-hover:underline text-sm">
                    {result.campaign.title} →
                  </p>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
