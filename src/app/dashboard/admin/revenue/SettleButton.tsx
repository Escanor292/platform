"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SettleButton({ pledgeId }: { pledgeId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const settle = async () => {
    if (!confirm("Xác nhận tiền đã vào tài khoản trung gian và cấp chứng từ?")) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/pledges/${pledgeId}/settle`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không đối soát được");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi đối soát");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={settle}
        disabled={loading}
        className="rounded-full bg-emerald-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-50"
      >
        {loading ? "..." : "Đối soát"}
      </button>
      {error ? <p className="mt-1 text-[10px] text-red-600">{error}</p> : null}
    </div>
  );
}
