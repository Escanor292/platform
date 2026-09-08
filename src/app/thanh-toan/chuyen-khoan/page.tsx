"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Copy, Landmark } from "lucide-react";

type TransferInfo = {
  amount: number;
  status: string;
  campaignTitle: string | null;
  campaignSlug: string | null;
  transfer: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    content: string;
    qrUrl: string;
    branch?: string;
  };
  note: string;
};

function TransferInner() {
  const params = useSearchParams();
  const pledgeId = params.get("pledge") || "";
  const [data, setData] = useState<TransferInfo | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    if (!pledgeId) {
      setError("Thiếu mã ủng hộ");
      return;
    }
    fetch(`/api/thanh-toan/chuyen-khoan/${encodeURIComponent(pledgeId)}`)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || "Không tải được thông tin chuyển khoản");
        setData(body);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Lỗi tải"));
  }, [pledgeId]);

  const copy = async (value: string, key: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(""), 1600);
  };

  if (error) {
    return <p className="text-center text-red-600 py-16">{error}</p>;
  }
  if (!data) {
    return <p className="text-center text-gray-500 py-16">Đang tải thông tin chuyển khoản…</p>;
  }

  const rows = [
    ["Ngân hàng", data.transfer.bankName, "bank"],
    ["Số tài khoản", data.transfer.accountNumber, "stk"],
    ["Chủ tài khoản", data.transfer.accountHolder, "name"],
    ["Số tiền", `${data.amount.toLocaleString("vi-VN")}đ`, "amount"],
    ["Nội dung", data.transfer.content, "content"],
  ] as const;

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-10">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <Landmark />
        </div>
        <div>
          <h1 className="text-2xl font-black">Chuyển khoản ngân hàng trung gian</h1>
          <p className="text-sm text-gray-500">Không chuyển thẳng cho người sáng tạo</p>
        </div>
      </div>

      {data.campaignTitle && (
        <p className="text-sm text-gray-600">
          Chiến dịch:{" "}
          {data.campaignSlug ? (
            <Link href={`/campaigns/${data.campaignSlug}`} className="font-semibold text-emerald-700 hover:underline">
              {data.campaignTitle}
            </Link>
          ) : (
            data.campaignTitle
          )}
        </p>
      )}

      <img
        src={data.transfer.qrUrl}
        alt="VietQR tài khoản giữ hộ"
        className="mx-auto w-64 rounded-2xl border bg-white p-2"
      />

      <div className="space-y-2 rounded-3xl border bg-white p-5">
        {rows.map(([label, value, key]) => (
          <div key={key} className="flex items-center justify-between gap-3 border-b border-gray-50 py-2 last:border-0">
            <div>
              <div className="text-[11px] font-bold uppercase text-gray-400">{label}</div>
              <div className="font-semibold text-gray-900">{value}</div>
            </div>
            <button
              type="button"
              onClick={() => copy(key === "amount" ? String(data.amount) : String(value), key)}
              className="inline-flex items-center gap-1 rounded-xl bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-600"
            >
              <Copy size={14} />
              {copied === key ? "Đã chép" : "Chép"}
            </button>
          </div>
        ))}
      </div>

      <p className="text-sm leading-relaxed text-gray-600">{data.note}</p>
      <p className="text-xs text-gray-400">
        Trạng thái hiện tại: {data.status === "PENDING" ? "Chờ tiền vào tài khoản giữ hộ" : data.status}.
        Ghi đúng nội dung chuyển khoản để đối soát.
      </p>
    </div>
  );
}

export default function BankTransferPage() {
  return (
    <Suspense fallback={<p className="py-16 text-center text-gray-500">Đang tải…</p>}>
      <TransferInner />
    </Suspense>
  );
}
