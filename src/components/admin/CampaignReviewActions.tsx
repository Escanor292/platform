"use client";

import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CampaignReviewActionsProps {
  campaignId: string;
}

export default function CampaignReviewActions({ campaignId }: CampaignReviewActionsProps) {
  const router = useRouter();
  const [loadingStatus, setLoadingStatus] = useState<"ACTIVE" | "CANCELED" | null>(null);

  const review = async (status: "ACTIVE" | "CANCELED") => {
    setLoadingStatus(status);
    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Không thể cập nhật trạng thái");
      toast.success(status === "ACTIVE" ? "Đã duyệt chiến dịch" : "Đã từ chối chiến dịch");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật trạng thái");
    } finally {
      setLoadingStatus(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => review("ACTIVE")}
        disabled={loadingStatus !== null}
        className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loadingStatus === "ACTIVE" ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
        Duyệt
      </button>
      <button
        type="button"
        onClick={() => review("CANCELED")}
        disabled={loadingStatus !== null}
        className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loadingStatus === "CANCELED" ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
        Từ chối
      </button>
    </div>
  );
}
