"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Copy, Home, Search, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { formatVND } from "@/lib/utils";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams.get("code");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (paymentId) {
      // Gọi API tra cứu để lấy thông tin vừa thanh toán
      fetch(`/api/lookup?code=${paymentId}`)
        .then(res => res.json())
        .then(resData => {
          setData(resData.transaction || resData.payment);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [paymentId]);

  const copyToClipboard = () => {
    if (paymentId) {
      navigator.clipboard.writeText(paymentId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4" />
      <p className="text-gray-500 font-bold">Đang xác thực giao dịch...</p>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 pt-safe">
      <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-xl text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-green-500" />
        
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
          <CheckCircle2 size={48} strokeWidth={2.5} />
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-2">Thanh toán thành công!</h1>
        <p className="text-gray-500 text-sm mb-10 leading-relaxed px-4">
          Cảm ơn bạn đã đồng hành cùng dự án. Sự đóng góp của bạn là nguồn động lực to lớn cho nhà sáng tạo.
        </p>

        {/* Transaction Card */}
        <div className="bg-gray-50 rounded-[2rem] p-6 mb-10 text-left border border-gray-100">
           <div className="flex justify-between mb-4 border-b border-gray-200 pb-3">
              <span className="text-xs font-bold text-gray-400 uppercase">Số tiền</span>
              <span className="text-lg font-black text-green-600">{formatVND(data?.amount || 0)}</span>
           </div>
           
           <div className="space-y-4">
              <div>
                 <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Mã thực hiện (Lưu lại để tra cứu)</div>
                 <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-200 group">
                    <code className="text-xs font-mono font-bold text-gray-600 truncate mr-2">{paymentId}</code>
                    <button 
                      onClick={copyToClipboard}
                      className="text-green-600 active:scale-90 transition"
                    >
                      {copied ? <span className="text-[10px] font-black">COPIED!</span> : <Copy size={16} />}
                    </button>
                 </div>
              </div>
              
              <div className="flex justify-between">
                 <span className="text-[10px] text-gray-400 font-bold uppercase">Phương thức</span>
                 <span className="text-[10px] font-black text-gray-900 uppercase">{data?.paymentMethod || data?.method || "GATEWAY"}</span>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <Link 
             href="/" 
             className="flex items-center justify-center gap-2 h-14 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition btn-click-scale text-xs"
           >
             <Home size={16} />
             Trang chủ
           </Link>
           <Link 
             href={`/lookup?code=${paymentId}`} 
             className="flex items-center justify-center gap-2 h-14 bg-white text-green-600 border-2 border-green-600 font-black rounded-2xl hover:bg-green-50 transition btn-click-scale text-xs"
           >
             <Search size={16} />
             Tra cứu
           </Link>
        </div>
      </div>
      
      <p className="mt-8 text-center text-xs text-gray-400 max-w-xs leading-relaxed">
        Hóa đơn điện tử và xác nhận đã được gửi tới email của bạn (nếu có cung cấp).
      </p>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
