"use client";

import { useState, useEffect } from "react";
import { CreditCard, Wallet, QrCode, ShieldCheck, Heart, User, Mail, Info } from "lucide-react";
import { formatVND } from "@/lib/utils";
import { useSession } from "next-auth/react";

interface Reward {
  id: string;
  title: string;
  amount: number;
  description: string;
}

export default function CheckoutButton({ 
  campaignId, 
  rewards 
}: { 
  campaignId: string; 
  rewards: Reward[] 
}) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: Amount, 2: Info (Guest/Anon), 3: Payment
  const [loading, setLoading] = useState(false);
  
  // States cho form
  const [amount, setAmount] = useState<number>(0);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [tipPercentage, setTipPercentage] = useState(10);
  
  // Guest / Anonymous States
  const [displayName, setDisplayName] = useState(session?.user?.name || "");
  const [guestEmail, setGuestEmail] = useState(session?.user?.email || "");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [ipAddress, setIpAddress] = useState("");

  // Fetch IP for metadata
  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then(res => res.json())
      .then(data => setIpAddress(data.ip))
      .catch(() => {});
  }, []);

  const totalTip = Math.round((amount * tipPercentage) / 100);
  const totalAmount = amount + totalTip;

  const handleRewardSelect = (r: Reward) => {
    setSelectedReward(r);
    setAmount(r.amount);
  };

  const handleCreatePayment = async (method: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/payment/${method.toLowerCase()}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalAmount,
          campaignId,
          rewardId: selectedReward?.id,
          tipAmount: totalTip,
          
          // Guest / Anonymous Metadata
          guestEmail: guestEmail || null,
          displayName: isAnonymous ? "Người dùng ẩn danh" : (displayName || "Người ủng hộ"),
          isAnonymous,
          ipAddress,
        }),
      });

      const data = await res.json();
      
      // SePay trả về checkoutFields, cần submit form
      if (data.checkoutFields && data.checkoutUrl) {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = data.checkoutUrl;
        
        Object.entries(data.checkoutFields).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });
        
        document.body.appendChild(form);
        form.submit();
      } else if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl; // Direct redirect
      } else {
        alert("Lỗi: " + (data.error || "Không thể tạo link thanh toán"));
      }
    } catch (err) {
      alert("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full h-16 bg-green-600 text-white font-black text-lg rounded-[2rem] shadow-xl shadow-green-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
      >
        <Heart size={24} fill="currentColor" />
        Ủng hộ dự án ngay
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-[2.5rem] md:rounded-[2.5rem] p-8 shadow-2xl relative animate-in slide-in-from-bottom duration-300">
            <button 
              onClick={() => {setIsOpen(false); setStep(1);}}
              className="absolute top-6 right-8 text-gray-400 hover:text-gray-600 font-bold text-xl"
            >
              ✕
            </button>

            {/* Stepper Indicator */}
            <div className="flex justify-center gap-2 mb-8">
               {[1, 2, 3].map(s => (
                 <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? "w-8 bg-green-600" : "w-4 bg-gray-100"}`} />
               ))}
            </div>

            {/* Step 1: Chọn mức ủng hộ */}
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-black text-gray-900">Chọn mức đồng hành</h3>
                <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto no-scrollbar pr-2">
                  <button 
                    onClick={() => {setSelectedReward(null); setAmount(50000);}}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${!selectedReward && amount === 50000 ? "border-green-600 bg-green-50/50" : "border-gray-100 hover:border-gray-200"}`}
                  >
                    <div className="font-bold text-gray-900">✨ Ủng hộ tùy tâm</div>
                    <div className="text-xs text-gray-400">Từ 50.000 VNĐ</div>
                  </button>
                  {rewards.map(r => (
                    <button 
                      key={r.id}
                      onClick={() => handleRewardSelect(r)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${selectedReward?.id === r.id ? "border-green-600 bg-green-50/50" : "border-gray-100 hover:border-gray-200"}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-bold text-gray-900 line-clamp-1">{r.title}</div>
                        <div className="text-green-600 font-black text-xs">{formatVND(r.amount)}</div>
                      </div>
                      <div className="text-[10px] text-gray-400 line-clamp-2">{r.description}</div>
                    </button>
                  ))}
                </div>

                <div>
                   <div className="flex justify-between items-center mb-3">
                     <span className="text-xs font-bold text-gray-500">Tiền Tip nền tảng (duy trì hệ thống):</span>
                     <span className="text-sm font-black text-green-600">+{formatVND(totalTip)}</span>
                   </div>
                   <input 
                     type="range" min="0" max="30" step="5" value={tipPercentage}
                     onChange={(e) => setTipPercentage(Number(e.target.value))}
                     className="w-full accent-green-600 h-2 bg-gray-100 rounded-full cursor-pointer appearance-none"
                   />
                   <div className="flex justify-between mt-2 px-1">
                      <span className="text-[10px] text-gray-400 font-bold">0%</span>
                      <span className="text-[10px] text-gray-400 font-bold">{tipPercentage}%</span>
                      <span className="text-[10px] text-gray-400 font-bold">30%</span>
                   </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                   <div className="text-xl font-black text-gray-900">{formatVND(totalAmount)}</div>
                   <button 
                     onClick={() => setStep(2)}
                     className="px-8 h-12 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition btn-click-scale text-sm"
                   >
                     Tiếp tục
                   </button>
                </div>
              </div>
            )}

            {/* Step 2: Thông tin Người ủng hộ */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                     <Info size={20} />
                   </div>
                   <h3 className="text-2xl font-black text-gray-900">Thông tin của bạn</h3>
                </div>

                <div className="space-y-4">
                   <div className={`transition-opacity ${isAnonymous ? "opacity-30 pointer-events-none" : "opacity-100"}`}>
                      <label className="block text-xs font-black text-gray-400 uppercase mb-1.5 ml-1">Tên hiển thị</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="text" placeholder="Họ và Tên" value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 h-14 focus:ring-2 focus:ring-green-500 font-bold"
                        />
                      </div>
                   </div>

                   <div>
                      <label className="block text-xs font-black text-gray-400 uppercase mb-1.5 ml-1">Email nhận thông báo (tùy chọn)</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="email" placeholder="example@email.com" value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 h-14 focus:ring-2 focus:ring-green-500 font-bold"
                        />
                      </div>
                   </div>

                   <button 
                     onClick={() => setIsAnonymous(!isAnonymous)}
                     className={`flex items-center justify-between w-full h-14 px-5 rounded-2xl border-2 transition-all ${isAnonymous ? "border-green-600 bg-green-50/50" : "border-gray-100 bg-white"}`}
                   >
                      <div className="flex items-center gap-3">
                         <div className={`w-5 h-5 rounded flex items-center justify-center border-2 ${isAnonymous ? "bg-green-600 border-green-600" : "border-gray-300"}`}>
                            {isAnonymous && <span className="text-white text-xs">✓</span>}
                         </div>
                         <span className="font-bold text-gray-700">Ủng hộ ẩn danh</span>
                      </div>
                      <ShieldCheck size={20} className={isAnonymous ? "text-green-600" : "text-gray-300"} />
                   </button>
                   <p className="text-[10px] text-gray-400 italic px-2">
                     * Bạn vẫn sẽ nhận được mã tra cứu giao dịch sau khi thanh toán thành công.
                   </p>
                </div>

                <div className="flex gap-3 pt-4">
                   <button onClick={() => setStep(1)} className="w-1/3 h-14 bg-gray-100 text-gray-400 font-bold rounded-2xl hover:bg-gray-200 transition">Quay lại</button>
                   <button 
                     onClick={() => setStep(3)}
                     className="w-2/3 h-14 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 transition btn-click-scale shadow-lg shadow-green-500/20"
                   >
                     Tiếp tục thanh toán
                   </button>
                </div>
              </div>
            )}

            {/* Step 3: Chọn phương thức thanh toán */}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-black text-gray-900">Hình thức thanh toán</h3>
                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={() => handleCreatePayment("PayOS")}
                    disabled={loading}
                    className="flex items-center justify-between p-5 rounded-2xl bg-blue-50 border-2 border-blue-100 hover:border-blue-600 transition-all btn-click-scale group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          <QrCode className="text-blue-600" size={24} />
                       </div>
                       <div className="text-left">
                          <div className="font-black text-blue-900">Ví / VietQR (PayOS)</div>
                          <div className="text-[10px] text-blue-400 font-bold uppercase">Xác thực tức thì</div>
                       </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                       <ArrowRight size={18} className="text-blue-600" />
                    </div>
                  </button>

                  <button 
                    onClick={() => handleCreatePayment("MoMo")}
                    disabled={loading}
                    className="flex items-center justify-between p-5 rounded-2xl bg-pink-50 border-2 border-pink-100 hover:border-momo transition-all btn-click-scale group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          <Wallet className="text-pink-600" size={24} />
                       </div>
                       <div className="text-left">
                          <div className="font-black text-pink-900">Ví MoMo</div>
                          <div className="text-[10px] text-pink-400 font-bold uppercase">Tin dùng bởi 30M+</div>
                       </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-pink-600/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                       <ArrowRight size={18} className="text-pink-600" />
                    </div>
                  </button>

                  <button 
                    onClick={() => handleCreatePayment("VNPay")}
                    disabled={loading}
                    className="flex items-center justify-between p-5 rounded-2xl bg-indigo-50 border-2 border-indigo-100 hover:border-indigo-600 transition-all btn-click-scale group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          <CreditCard className="text-indigo-600" size={24} />
                       </div>
                       <div className="text-left">
                          <div className="font-black text-indigo-900">VNPay (ATM / Visa)</div>
                          <div className="text-[10px] text-indigo-400 font-bold uppercase">Ngân hàng nội địa</div>
                       </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-indigo-600/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                       <ArrowRight size={18} className="text-indigo-600" />
                    </div>
                  </button>

                  <button 
                    onClick={() => handleCreatePayment("SePay")}
                    disabled={loading}
                    className="flex items-center justify-between p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-100 hover:border-emerald-600 transition-all btn-click-scale group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          <QrCode className="text-emerald-600" size={24} />
                       </div>
                       <div className="text-left">
                          <div className="font-black text-emerald-900">SePay (QR Banking)</div>
                          <div className="text-[10px] text-emerald-400 font-bold uppercase">Chuyển khoản nhanh</div>
                       </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-emerald-600/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                       <ArrowRight size={18} className="text-emerald-600" />
                    </div>
                  </button>
                </div>

                <button 
                  onClick={() => setStep(2)}
                  className="w-full h-12 text-gray-400 font-bold hover:text-gray-600 transition"
                >
                  Quay lại thông tin
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function ArrowRight({ size, className }: { size: number; className?: string }) {
  return (
    <svg 
      width={size} height={size} viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14m-7-7 7 7-7 7" />
    </svg>
  );
}
