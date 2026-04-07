"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import PledgeForm from "@/components/campaign/PledgeForm";

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
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          ← Quay lại
        </button>
        <PledgeForm campaignId={campaignId} preselectedRewardId={rewardId} />
      </div>
    </main>
  );
}

export default function PledgePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    }>
      <PledgePageContent />
    </Suspense>
  );
}
