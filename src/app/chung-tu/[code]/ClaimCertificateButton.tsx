"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PrintCertificateButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full bg-pgreen px-5 py-2.5 text-sm font-bold text-white"
    >
      In chứng từ
    </button>
  );
}

export default function ClaimCertificateButton({ code }: { code: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const claim = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/chung-tu/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không nhận được chứng từ");
      router.push(`/purchases?item=${encodeURIComponent(data.pledgeId || code)}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi nhận chứng từ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={claim}
        disabled={loading}
        className="rounded-full border border-pgreen px-5 py-2.5 text-sm font-bold text-pgreen disabled:opacity-50"
      >
        {loading ? "Đang lưu..." : "Lưu vào Kho đồ"}
      </button>
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
