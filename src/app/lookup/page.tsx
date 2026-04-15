"use client";

import { useState } from "react";
import { Search, Loader2, CheckCircle2, XCircle, FileSearch, ShieldCheck, Clock } from "lucide-react";

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
        return <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100"><CheckCircle2 size={16} /> Thành công</span>;
      case "PENDING":
        return <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest bg-orange-50 text-orange-600 border border-orange-100"><Clock size={16} /> Đang xử lý</span>;
      case "FAILED":
        return <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest bg-red-50 text-red-600 border border-red-100"><XCircle size={16} /> Thất bại</span>;
      case "REFUNDED":
        return <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest bg-gray-100 text-gray-600 border border-gray-200">Đã hoàn tiền</span>;
      default:
        return <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest bg-gray-100 text-gray-600 border border-gray-200">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-fgreen/5 py-24 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-6 animate-fade-in-up">
          <div className="w-20 h-20 bg-gradient-to-br from-tblue to-pgreen rounded-3xl flex items-center justify-center mx-auto shadow-lg">
            <FileSearch size={40} className="text-white" />
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-black text-gray-900 tracking-tight leading-[1.2]">
            Tra cứu giao dịch
          </h1>
          <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto leading-relaxed">
            Nhập mã giao dịch của bạn để kiểm tra trạng thái và thông tin chi tiết một cách minh bạch.
          </p>
        </div>

        {/* Search Form */}
        <div className="glass-morphism p-8 md:p-10 rounded-[3rem] border border-white/20 shadow-premium animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                name="transactionId"
                id="transactionId"
                className="block w-full h-16 rounded-2xl border-2 border-gray-200 pl-14 pr-4 focus:border-pgreen focus:ring-4 focus:ring-pgreen/10 text-base font-bold text-gray-900 placeholder:text-gray-400 transition-all"
                placeholder="Ví dụ: CF2026-ABC123XYZ"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !transactionId}
              className="h-16 px-10 bg-gradient-to-r from-pgreen to-fgreen text-white font-black rounded-2xl hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 uppercase tracking-tight"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Đang tìm...
                </>
              ) : (
                <>
                  <Search size={20} />
                  Tra cứu
                </>
              )}
            </button>
          </form>

          {/* Trust Badge */}
          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-gray-500 font-bold">
            <ShieldCheck size={16} className="text-pgreen" />
            Thông tin được mã hóa và bảo mật tuyệt đối
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="glass-morphism p-8 rounded-[2.5rem] border-2 border-red-200 bg-red-50/50 animate-fade-in-up">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <XCircle size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-red-900 mb-1">Không tìm thấy giao dịch</h3>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Result Card */}
        {result && (
          <div className="glass-morphism p-10 rounded-[3rem] border border-white/20 shadow-premium animate-fade-in-up">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
              <div className="w-12 h-12 bg-pgreen/10 rounded-2xl flex items-center justify-center">
                <CheckCircle2 size={24} className="text-pgreen" />
              </div>
              <h2 className="text-2xl font-black text-gray-900">Thông tin giao dịch</h2>
            </div>

            <div className="space-y-6">
              {/* Transaction ID */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gray-50 rounded-2xl">
                <div>
                  <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Mã giao dịch</div>
                  <div className="font-mono text-lg font-bold text-gray-900">{result.transactionId}</div>
                </div>
              </div>

              {/* Supporter Name */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-gray-100">
                <div className="flex-grow">
                  <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Người ủng hộ</div>
                  <div className="text-base font-bold text-gray-900">{result.displayName}</div>
                </div>
              </div>

              {/* Campaign */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-gray-100">
                <div className="flex-grow">
                  <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Dự án</div>
                  <a 
                    href={`/campaigns/${result.campaign.slug}`}
                    className="text-base font-bold text-pgreen hover:text-fgreen hover:underline transition"
                  >
                    {result.campaign.title}
                  </a>
                </div>
              </div>

              {/* Amount Details */}
              <div className="space-y-4 p-6 bg-gradient-to-br from-pgreen/5 to-fgreen/5 rounded-2xl border border-pgreen/10">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-600">Số tiền ủng hộ</span>
                  <span className="text-lg font-black text-gray-900">{Number(result.amount).toLocaleString('vi-VN')} ₫</span>
                </div>
                
                {Number(result.tipAmount) > 0 && (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-gray-600">Tip cho nền tảng</span>
                      <span className="font-bold text-gray-700">{Number(result.tipAmount).toLocaleString('vi-VN')} ₫</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-gray-500">Trong đó VAT (10%)</span>
                      <span className="font-medium text-gray-500">{Number(result.vatAmount).toLocaleString('vi-VN')} ₫</span>
                    </div>
                  </>
                )}
                
                <div className="pt-4 border-t-2 border-pgreen/20 flex justify-between items-center">
                  <span className="text-base font-black text-gray-900 uppercase tracking-tight">Tổng thanh toán</span>
                  <span className="text-2xl font-black text-pgreen">{Number(result.totalAmount).toLocaleString('vi-VN')} ₫</span>
                </div>
                
                <div className="text-xs text-gray-500 font-medium text-center pt-2">
                  Thanh toán qua {result.paymentProvider}
                </div>
              </div>

              {/* Status */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-white rounded-2xl border border-gray-100">
                  <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Trạng thái giao dịch</div>
                  {getStatusBadge(result.status)}
                </div>
                
                <div className="p-6 bg-white rounded-2xl border border-gray-100">
                  <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Trạng thái hoàn tiền</div>
                  {getStatusBadge(result.refundStatus)}
                </div>
              </div>

              {/* Timestamp */}
              <div className="p-6 bg-white rounded-2xl border border-gray-100">
                <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Thời gian tạo</div>
                <div className="text-base font-bold text-gray-900">
                  {new Date(result.createdAt).toLocaleString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
