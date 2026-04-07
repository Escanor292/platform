"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Loader2, CreditCard, ShieldCheck, Calendar, ArrowRight, ExternalLink } from "lucide-react";
import { formatVND } from "@/lib/utils";
import Link from "next/link";

function LookupContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || "";
  const [code, setCode] = useState(initialCode);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code) return;

    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch(`/api/lookup?code=${code}`);
      const resData = await res.json();
      if (!res.ok) {
        setError(resData.error || "Không tìm thấy giao dịch nào.");
      } else {
        setData(resData.transaction || resData.payment);
      }
    } catch {
      setError("Lỗi kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      handleLookup();
    }
  }, [initialCode]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 pb-24 md:pb-12 min-h-screen">
      <div className="text-center mb-12">
         <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Tra cứu Giao dịch</h1>
         <p className="text-gray-500 max-w-md mx-auto">Nhập mã giao dịch để kiểm tra thông tin thanh toán, tiến độ dự án và lịch sử đóng góp của bạn.</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleLookup} className="relative max-w-xl mx-auto mb-16 group">
         <input 
           type="text" value={code}
           onChange={(e) => setCode(e.target.value)}
           placeholder="Ví dụ: CFVN-20260407-A1B2C3D4"
           className="w-full h-16 bg-white border-2 border-gray-100 rounded-[2rem] pl-14 pr-32 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none font-bold shadow-lg transition-all"
         />
         <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition" size={24} />
         <button 
           type="submit" 
           disabled={loading}
           className="absolute right-3 top-1/2 -translate-y-1/2 h-10 px-6 bg-gray-900 text-white font-black rounded-full hover:bg-black transition flex items-center gap-2 group-active:scale-95 disabled:opacity-50"
         >
           {loading ? <Loader2 className="animate-spin" size={18} /> : "Tra cứu"}
         </button>
      </form>

      {/* Results Section */}
      {error && (
        <div className="bg-red-50 border-2 border-red-100 text-red-600 p-6 rounded-[2rem] text-center font-bold">
           ⚠️ {error}
        </div>
      )}

      {data && (
        <div className="animate-in fade-in slide-in-from-bottom duration-500 space-y-6">
           <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6">
                 <span className={`inline-flex px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${
                   data.status === 'SUCCESS' || data.status === 'SUCCESSFUL' ? 'bg-green-100 text-green-600' :
                   data.status === 'PENDING' ? 'bg-amber-100 text-amber-600' :
                   'bg-gray-100 text-gray-500'
                 }`}>
                   {data.status}
                 </span>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10">
                 <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
                    <CreditCard size={32} />
                 </div>
                 <div>
                    <h3 className="text-sm font-black text-gray-400 uppercase mb-1">Mã tham chiếu</h3>
                    <code className="text-xl font-mono font-black text-gray-900 break-all">{code}</code>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-y border-gray-100">
                 <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase mb-2">Số tiền đóng góp</div>
                    <div className="text-2xl font-black text-green-600">{formatVND(data.amount)}</div>
                    <div className="text-[10px] text-gray-400 font-medium">({formatVND(data.projectAmount || 0)} Dự án + {formatVND(data.platformTipAmount || 0)} Tip)</div>
                 </div>
                 <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase mb-2">Người ủng hộ</div>
                    <div className="flex items-center gap-2">
                       <span className="font-extrabold text-gray-900">{data.displayName || "Cổ động viên"}</span>
                       {data.isAnonymous && <ShieldCheck size={14} className="text-blue-500" />}
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium">{data.guestEmail || "Tài khoản mã hóa"}</div>
                 </div>
                 <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase mb-2">Thời gian</div>
                    <div className="flex items-center gap-2 font-bold text-gray-900">
                       <Calendar size={14} />
                       {new Date(data.createdAt).toLocaleString("vi-VN")}
                    </div>
                 </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden">
                       <img 
                        src={data.campaign?.imageUrl || data.pledge?.campaign?.imageUrl || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80"}
                        className="w-full h-full object-cover"
                       />
                    </div>
                    <div>
                       <div className="text-[10px] text-gray-400 font-black uppercase">Dự án đồng hành</div>
                       <div className="font-bold text-gray-900 line-clamp-1">{data.campaign?.title || data.pledge?.campaign?.title}</div>
                    </div>
                 </div>
                 <Link 
                   href={`/campaigns/${data.campaign?.slug || data.pledge?.campaign?.slug}`}
                   className="flex items-center gap-2 text-xs font-black text-green-600 hover:underline"
                 >
                    Xem dự án <ArrowRight size={14} />
                 </Link>
              </div>
           </div>

           <div className="bg-amber-50 border-2 border-amber-100 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                 <ShieldCheck size={24} />
              </div>
              <div className="flex-1">
                 <h4 className="font-black text-amber-900 mb-1">Xác thực bởi VN Certified Crowdfunding</h4>
                 <p className="text-xs text-amber-700 leading-relaxed">
                   Giao dịch này đã được hệ thống ghi nhận trên sổ cái điện tử. Nếu bạn cần hỗ trợ hoặc yêu cầu hoàn tiền cho dự án này, vui lòng sử dụng mã tra cứu trên khi liên hệ.
                 </p>
              </div>
              <Link href="/policy/refund" className="px-6 py-3 bg-amber-200 text-amber-900 font-bold rounded-xl text-xs whitespace-nowrap hover:bg-amber-300 transition flex items-center gap-2">
                 Chính sách hoàn tiền <ExternalLink size={14} />
              </Link>
           </div>
        </div>
      )}

      {!data && !loading && !error && (
        <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
           <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-gray-200">
              <Search size={40} />
           </div>
           <p className="text-gray-400 font-bold">Vui lòng nhập mã để tra cứu thông tin</p>
        </div>
      )}
    </div>
  );
}

export default function LookupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LookupContent />
    </Suspense>
  );
}
