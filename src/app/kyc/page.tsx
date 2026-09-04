"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { EkycWizard } from "@/components/kyc/EkycWizard";

function KycInner() {
  const params = useSearchParams();
  const nextHref = params.get("next") || "/dashboard";
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <p className="mb-2 text-xs font-black uppercase tracking-widest text-emerald-700">Tu Te Fund</p>
        <h1 className="mb-2 text-4xl font-black text-gray-900">Dinh danh dien tu</h1>
        <p className="mb-4 text-gray-600">P0 nop tay · P1 OCR/liveness/face · P2 NFC/VNeID. Doanh nghiep dung eKYB.</p>
        <div className="mb-8 flex flex-wrap gap-3 text-sm">
          <Link className="font-bold text-emerald-700 underline" href="/upgrade/individual">Nang cap Creator ca nhan</Link>
          <Link className="font-bold text-emerald-700 underline" href="/kyc/to-chuc">eKYB doanh nghiep</Link>
        </div>
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
