"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import PledgeForm from "@/components/campaign/PledgeForm";
import { ArrowLeft, ShieldCheck, Heart } from "lucide-react";

function PledgePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const campaignId = searchParams.get("campaignId") ?? "";
  const rewardId = searchParams.get("rewardId") ?? undefined;

  if (!campaignId) {
    router.replace("/campaigns");
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-cream via-white to-fgreen/5 py-24 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-pgreen transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Quay lại dự án
        </button>

        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in-up">
          <div className="w-20 h-20 bg-gradient-to-br from-pgreen to-fgreen rounded-3xl flex items-center justify-center mx-auto shadow-lg">
            <Heart size={40} className="text-white" fill="white" />
          </div>
          <h1 className="font-display text-5xl font-black text-gray-900 tracking-tight leading-[1.2]">
            Ủng hộ dự án
          </h1>
          <p className="text-lg text-gray-600 font-medium max-w-md mx-auto">
            Mỗi đóng góp của bạn đều là một bước tiến quan trọng giúp dự án thành hiện thực.
          </p>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-4 py-6">
          <div className="flex items-center gap-2 px-4 py-2 glass-morphism rounded-full border border-white/20">
            <ShieldCheck size={16} className="text-pgreen" />
            <span className="text-xs font-bold text-gray-700">Bảo mật thanh toán</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 glass-morphism rounded-full border border-white/20">
            <Heart size={16} className="text-fgreen" />
            <span className="text-xs font-bold text-gray-700">Minh bạch 100%</span>
          </div>
        </div>

        {/* Pledge Form */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <PledgeForm campaignId={campaignId} preselectedRewardId={rewardId} />
        </div>

        {/* Footer Note */}
        <div className="text-center pt-8">
          <p className="text-xs text-gray-500 leading-relaxed max-w-lg mx-auto">
            Bằng việc ủng hộ, bạn đồng ý với{" "}
            <a href="#" className="text-pgreen hover:underline font-semibold">
              Điều khoản dịch vụ
            </a>{" "}
            và{" "}
            <a href="#" className="text-pgreen hover:underline font-semibold">
              Chính sách hoàn tiền
            </a>{" "}
            của TửTế Fund.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function PledgePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-cream via-white to-fgreen/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-pgreen/20 border-t-pgreen rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-gray-600">Đang tải...</p>
        </div>
      </div>
    }>
      <PledgePageContent />
    </Suspense>
  );
}
