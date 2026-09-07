"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { EkycWizard } from "@/components/kyc/EkycWizard";
import { ManualKycForm } from "@/components/kyc/ManualKycForm";

function KycInner() {
  const params = useSearchParams();
  const nextHref = params.get("next") || "/dashboard";
  const [ekycEnabled, setEkycEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/kyc/mode")
      .then((r) => r.json())
      .then((data) => setEkycEnabled(data.ekycEnabled !== false))
      .catch(() => setEkycEnabled(true));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <p className="mb-2 text-xs font-black uppercase tracking-widest text-emerald-700">Tử Tế Fund</p>
        <h1 className="mb-2 text-4xl font-black text-gray-900">
          {ekycEnabled === false ? "Xác minh danh tính" : "Định danh điện tử"}
        </h1>
        <p className="mb-4 text-gray-600">
          {ekycEnabled === false
            ? "Hệ thống đang dùng KYC thủ công. Tải ảnh CCCD và chờ admin duyệt."
            : "P0 nộp tay ảnh CCCD. P1 OCR + liveness + khớp khuôn mặt. P2 NFC/VNeID tùy chọn."}
        </p>
        <div className="mb-8 flex flex-wrap gap-3 text-sm">
          <Link className="font-bold text-emerald-700 underline" href="/upgrade/individual">Nâng cấp Creator cá nhân</Link>
          {ekycEnabled !== false && (
            <Link className="font-bold text-emerald-700 underline" href="/kyc/to-chuc">eKYB doanh nghiệp</Link>
          )}
        </div>
        {ekycEnabled === null ? (
          <div className="rounded-3xl border bg-white p-8 text-gray-400">Đang tải chế độ định danh...</div>
        ) : ekycEnabled ? (
          <EkycWizard nextHref={nextHref} />
        ) : (
          <ManualKycForm nextHref={nextHref} />
        )}
      </div>
    </div>
  );
}

export default function KycPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-gray-400">Đang tải...</div>}>
      <KycInner />
    </Suspense>
  );
}
