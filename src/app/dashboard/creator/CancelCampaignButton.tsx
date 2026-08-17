"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CancelCampaignButton({ 
  campaignId, 
  campaignTitle,
  status 
}: { 
  campaignId: string; 
  campaignTitle: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (status === "FAILED") return null;

  const handleCancel = async () => {
    const isConfirmed = confirm(
      `⚠️ CẢNH BÁO QUAN TRỌNG:\n\n` +
      `Bạn đang yêu cầu HỦY chiến dịch "${campaignTitle}".\n` +
      `Hệ thống sẽ TỰ ĐỘNG thực hiện lệnh HOÀN TIỀN cho toàn bộ người ủng hộ.\n\n` +
      `Hành động này KHÔNG THỂ HOÀN TÁC. Bạn chắc chắn muốn tiếp tục?`
    );

    if (!isConfirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Creator chủ động hủy chiến dịch" }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Lỗi: " + (data.error || "Không thể hủy chiến dịch"));
        return;
      }

      alert(`✅ Đã hủy chiến dịch thành công.\n${data.message}`);
      router.refresh();
    } catch {
      alert("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      title="Hủy chiến dịch & Hoàn tiền cho người ủng hộ"
      className="text-xs font-bold text-amber-600 hover:text-white hover:bg-amber-600 px-3 py-2 rounded-lg transition border border-amber-100 disabled:opacity-50 flex items-center gap-1"
    >
      {loading ? (
        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : "🚫"}
      {loading ? "Đang xử lý..." : "Hủy & Hoàn tiền"}
    </button>
  );
}
