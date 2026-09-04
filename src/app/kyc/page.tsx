"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { EkycWizard } from "@/components/kyc/EkycWizard";

function KycInner() {
  const params = useSearchParams();
  const nextHref = params.get("next") || "/dashboard";
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <p className="mb-2 text-xs font-black uppercase tracking-widest text-emerald-700">Tu Te Fund</p>
        <h1 className="mb-2 text-4xl font-black text-gray-900">Dinh danh dien tu (eKYC)</h1>
        <p className="mb-8 text-gray-600">Dong y du lieu, CCCD truoc/sau, liveness, doi chieu OCR. Chua co key VNPT thi chay sandbox.</p>
        <EkycWizard nextHref={nextHref} />
      </div>
    </div>
  );
}

export default function KycPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-gray-400">Dang tai...</div>}>
      <KycInner />
    </Suspense>
  );
}
