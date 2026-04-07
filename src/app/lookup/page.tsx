"use client";

import { useState } from "react";
import { Search, Loader2, CheckCircle2, XCircle } from "lucide-react";

type LookupResult = {
  transactionId: string;
  displayName: string;
  amount: string;
  tipAmount: string;
  vatAmount: string;
  totalAmount: string;
  paymentProvider: string;
  status: string;
  refundStatus: string;
  createdAt: string;
  campaign: {
    title: string;
    slug: string;
  };
};

export default function LookupPage() {
  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`/api/lookup?transactionId=${transactionId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Có lỗi xảy ra khi tra cứu");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle2 className="w-4 h-4" /> Thành công</span>;
      case "PENDING":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý</span>;
      case "FAILED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-4 h-4" /> Thất bại</span>;
      case "REFUNDED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Đã hoàn tiền</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="container max-w-3xl py-12 mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Tra cứu giao dịch</h1>
        <p className="mt-4 text-lg leading-6 text-gray-500">
          Nhập mã giao dịch của bạn để kiểm tra trạng thái và thông tin chi tiết.
        </p>
      </div>

      <div className="bg-white p-6 shadow sm:rounded-lg">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-grow">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              name="transactionId"
              id="transactionId"
              className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 border"
              placeholder="Ví dụ: CF2026-ABC123XYZ"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !transactionId}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Tra cứu'}
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Lỗi tra cứu</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-8 border-t border-gray-200 pt-8">
            <dl className="divide-y divide-gray-200">
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 flex items-center">
                <dt className="text-sm font-medium text-gray-500">Mã giao dịch</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 font-mono font-medium">{result.transactionId}</dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 flex items-center">
                <dt className="text-sm font-medium text-gray-500">Người ủng hộ</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{result.displayName}</dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 flex items-center">
                <dt className="text-sm font-medium text-gray-500">Dự án</dt>
                <dd className="mt-1 text-sm text-indigo-600 sm:col-span-2 sm:mt-0 hover:underline cursor-pointer">
                  <a href={`/campaigns/${result.campaign.slug}`}>{result.campaign.title}</a>
                </dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 flex items-center">
                <dt className="text-sm font-medium text-gray-500">Số tiền ủng hộ</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 font-semibold">{Number(result.amount).toLocaleString('vi-VN')} ₫</dd>
              </div>
              {Number(result.tipAmount) > 0 && (
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 flex items-center">
                  <dt className="text-sm font-medium text-gray-500">Tip cho nền tảng (Bao gồm VAT)</dt>
                  <dd className="mt-1 text-sm text-gray-600 sm:col-span-2 sm:mt-0">
                    {Number(result.tipAmount).toLocaleString('vi-VN')} ₫ 
                    <span className="text-xs text-gray-400 ml-1">(VAT: {Number(result.vatAmount).toLocaleString('vi-VN')} ₫)</span>
                  </dd>
                </div>
              )}
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 flex items-center bg-gray-50 -mx-6 px-6">
                <dt className="text-sm font-medium text-gray-900">Tổng thanh toán</dt>
                <dd className="mt-1 text-base font-bold text-indigo-600 sm:col-span-2 sm:mt-0">
                  {Number(result.totalAmount).toLocaleString('vi-VN')} ₫
                  <span className="text-xs font-normal text-gray-500 ml-2">qua {result.paymentProvider}</span>
                </dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 flex items-center">
                <dt className="text-sm font-medium text-gray-500">Trạng thái Giao dịch</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{getStatusBadge(result.status)}</dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 flex items-center">
                <dt className="text-sm font-medium text-gray-500">Trạng thái Hoàn tiền</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{getStatusBadge(result.refundStatus)}</dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 flex items-center">
                <dt className="text-sm font-medium text-gray-500">Thời gian tạo</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {new Date(result.createdAt).toLocaleString('vi-VN')}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
