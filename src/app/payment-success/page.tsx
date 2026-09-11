"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Copy, Home, Search, PackageOpen, FileCheck } from "lucide-react";
import Link from "next/link";
import { formatVND } from "@/lib/utils";

type LookupPayload = {
  pledgeId?: string;
  rewardId?: string | null;
  transactionId?: string;
  certificateCode?: string | null;
  documentKind?: string | null;
  amount?: number | string;
  status?: string;
  campaign?: { title?: string } | null;
};

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("ref") || searchParams.get("transactionId") || searchParams.get("orderCode") || searchParams.get("code");
  const isCodOrder = searchParams.get("status") === "cod";
  const [data, setData] = useState<LookupPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (paymentId) {
      fetch(`/api/lookup?transactionId=${encodeURIComponent(paymentId)}`)
        .then((res) => res.json())
        .then((resData) => {
          setData(resData.transaction || resData.payment || resData);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [paymentId]);

  const copyToClipboard = () => {
    if (paymentId) {
      navigator.clipboard.writeText(paymentId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-pgreen" />
        <p className="font-bold text-gray-500">Dang xac thuc giao dich...</p>
      </div>
    );
  }

  const isNoGift = Boolean(data && !data.rewardId);
  const isPending = !data?.status || data.status === "PENDING";
  const certificateHref = data?.certificateCode ? `/chung-tu/${data.certificateCode}` : null;
  const warehouseHref = data?.pledgeId
    ? `/purchases?item=${encodeURIComponent(data.pledgeId)}`
    : paymentId
      ? `/purchases?item=${encodeURIComponent(paymentId)}`
      : "/purchases";

  const title = isCodOrder
    ? "Da ghi nhan don hang!"
    : certificateHref
      ? "Da cap chung nhan ung ho"
      : isNoGift && isPending
        ? "Da ghi nhan ung ho"
        : isPending
          ? "Da ghi nhan lenh chuyen khoan"
          : "Thanh toan thanh cong!";

  const description = isCodOrder
    ? "Don hang tra tien khi nhan hang da duoc ghi nhan. Nha sang tao se lien he va giao san pham theo thong tin ban cung cap."
    : certificateHref
      ? `Giay chung nhan ${data?.certificateCode} da vao Kho do. Ban co the xem, in hoac luu lai.`
      : isNoGift
        ? "Day la khoan ung ho khong nhan qua. Giay chung nhan TT-UH se duoc cap va gui email sau khi san doi soat tien vao tai khoan trung gian."
        : isPending
          ? "Lenh dang cho tien vao tai khoan giu ho. Bien lai hoac tai san so vao Kho do sau khi doi soat."
          : "San pham so da duoc dua vao kho do cua ban.";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream p-6 pt-safe">
      <div className="relative w-full max-w-md overflow-hidden rounded-[3rem] bg-white p-10 text-center shadow-xl">
        <div className="absolute left-0 top-0 h-2 w-full" style={{ background: "linear-gradient(135deg, #2E8B57, #6BCB77)" }} />
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-pgreen">
          {certificateHref || isNoGift ? <FileCheck size={48} strokeWidth={2.5} /> : <CheckCircle2 size={48} strokeWidth={2.5} />}
        </div>
        <h1 className="mb-2 font-display text-3xl font-bold text-dblue">{title}</h1>
        <p className="mb-8 px-4 text-sm leading-relaxed text-gray-500">{description}</p>
        {data?.campaign?.title ? (
          <p className="mb-6 text-sm font-semibold text-dblue">{data.campaign.title}</p>
        ) : null}
        <div className="mb-8 rounded-[2rem] border border-gray-100 bg-cream/60 p-6 text-left">
          <div className="mb-4 flex justify-between border-b border-gray-200 pb-3">
            <span className="text-xs font-bold uppercase text-gray-400">So tien</span>
            <span className="text-lg font-black text-pgreen">{formatVND(Number(data?.amount || 0))}</span>
          </div>
          <div className="space-y-4">
            <div>
              <div className="mb-1 text-[10px] font-bold uppercase text-gray-400">Ma thuc hien</div>
              <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
                <code className="mr-2 truncate font-mono text-xs font-bold text-gray-600">{paymentId}</code>
                <button onClick={copyToClipboard} className="text-pgreen">{copied ? <span className="text-[10px] font-black">COPIED!</span> : <Copy size={16} />}</button>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {certificateHref ? (
            <Link href={certificateHref} className="flex h-14 items-center justify-center gap-2 rounded-2xl text-sm font-black text-white" style={{ background: "linear-gradient(135deg, #2E8B57, #6BCB77)" }}>
              <FileCheck size={16} /> Xem giay chung nhan
            </Link>
          ) : null}
          {!isCodOrder && (
            <Link href={warehouseHref} className={`flex h-14 items-center justify-center gap-2 rounded-2xl text-sm font-black ${
              certificateHref ? "border-2 border-pgreen bg-white text-pgreen" : "text-white"
            }`} style={certificateHref ? undefined : { background: "linear-gradient(135deg, #2E8B57, #6BCB77)" }}>
              <PackageOpen size={16} /> Mo kho do
            </Link>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/" className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-dblue text-xs font-black text-white"><Home size={16} /> Trang chu</Link>
            <Link href={`/lookup?code=${paymentId}`} className="flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-pgreen bg-white text-xs font-black text-pgreen"><Search size={16} /> Tra cuu</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
