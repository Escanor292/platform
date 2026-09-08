"use client";

import { useState } from "react";
import { Loader2, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CampaignFeatureToggle({
  campaignId,
  featured,
}: {
  campaignId: string;
  featured: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isFeatured, setIsFeatured] = useState(featured);

  const toggle = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}/feature`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !isFeatured }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Không thể cập nhật nổi bật");
      setIsFeatured(!isFeatured);
      toast.success(!isFeatured ? "Đã gắn nổi bật trên hệ thống" : "Đã bỏ nổi bật");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật nổi bật");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition disabled:opacity-50 ${
        isFeatured ? "bg-amber-100 text-amber-800" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
      }`}
      title="Nổi bật trên toàn hệ thống — chỉ admin"
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : <Star size={12} className={isFeatured ? "fill-current" : ""} />}
      {isFeatured ? "Đang nổi bật" : "Gắn nổi bật"}
    </button>
  );
}
