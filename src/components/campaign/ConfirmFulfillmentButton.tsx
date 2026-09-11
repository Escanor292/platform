"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Truck } from "lucide-react";

export function ConfirmFulfillmentButton({
  slug,
  status,
  hasProducts,
  confirmedAt,
}: {
  slug: string;
  status: string;
  hasProducts: boolean;
  confirmedAt?: string | Date | null;
}) {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(Boolean(confirmedAt));
  if (!hasProducts) return null;
  if (!["SUCCESS", "FAILED", "ACTIVE"].includes(status)) return null;

  const closed = status === "SUCCESS" || status === "FAILED";

  async function confirm() {
    setLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${slug}/confirm-fulfillment`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Không xác nhận được");
      setConfirmed(true);
      toast.success(data.message || "Đã xác nhận sẽ giao hàng");
    } catch (error: any) {
      toast.error(error.message || "Không xác nhận được");
    } finally {
      setLoading(false);
    }
  }

  if (confirmed) {
    return (
      <p className="text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2">
        Đã xác nhận giao hàng. Đưa vận chuyển đúng hạn gửi + tối đa 2 ngày, nếu không hệ thống hủy và hoàn.
      </p>
    );
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void confirm();
      }}
      className="w-full h-14 bg-sky-50 text-sky-700 rounded-2xl flex items-center justify-center hover:bg-sky-600 hover:text-white transition gap-2 font-black text-sm disabled:opacity-60"
    >
      <Truck size={18} />
      {closed
        ? "Xác nhận giao (kể cả khi chưa đủ goal)"
        : "Xác nhận sẽ giao hàng"}
    </button>
  );
}
