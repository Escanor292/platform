"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { hoursWaiting, isSlaOverdue } from "@/lib/moderation/policy";

type Item = {
  id: string;
  fullName: string;
  idCardType: string;
  idCardMasked: string;
  status: string;
  riskLevel: string;
  rejectedReason?: string | null;
  idCardFrontImage?: string | null;
  idCardBackImage?: string | null;
  createdAt?: string;
  user: { id: string; email: string; name: string | null; role: string };
  updatedAt: string;
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ duyệt",
  VERIFIED: "Đã xác minh",
  REJECTED: "Từ chối",
};

export default function AdminKycPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [filter, setFilter] = useState("PENDING");
  const [rejecting, setRejecting] = useState<Item | null>(null);
  const [reason, setReason] = useState("");
  const now = new Date();

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/kyc");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không tải được hồ sơ KYC");
      setItems(data.items || []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => ({
    PENDING: items.filter((item) => item.status === "PENDING").length,
    SLA: items.filter((item) => item.status === "PENDING" && item.createdAt && isSlaOverdue(item.createdAt, 24, now)).length,
    VERIFIED: items.filter((item) => item.status === "VERIFIED").length,
    REJECTED: items.filter((item) => item.status === "REJECTED").length,
  }), [items, now]);

  const visible = items.filter((item) => (filter === "all" ? true : item.status === filter));

  const review = async (id: string, action: "APPROVE" | "REJECT", rejectReason = "") => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/kyc/${id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: rejectReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không duyệt được");
      toast.success(action === "APPROVE" ? "Đã duyệt hồ sơ" : "Đã từ chối hồ sơ");
      setRejecting(null);
      setReason("");
      await load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 px-6 py-16">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin" className="flex h-11 w-11 items-center justify-center rounded-2xl border bg-white">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-gray-900">Hàng đợi KYC / eKYC</h1>
            <p className="text-sm text-gray-500">Duyệt hồ sơ xác minh danh tính. SLA 24 giờ. Từ chối bắt buộc có lý do.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-2xl bg-amber-50 px-4 py-3 text-amber-800">
            <div className="text-xs font-medium uppercase">Chờ duyệt</div>
            <div className="text-2xl font-black">{counts.PENDING}</div>
          </div>
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-red-800">
            <div className="text-xs font-medium uppercase">Quá 24 giờ</div>
            <div className="text-2xl font-black">{counts.SLA}</div>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-800">
            <div className="text-xs font-medium uppercase">Đã xác minh</div>
            <div className="text-2xl font-black">{counts.VERIFIED}</div>
          </div>
          <div className="rounded-2xl bg-rose-50 px-4 py-3 text-rose-800">
            <div className="text-xs font-medium uppercase">Từ chối</div>
            <div className="text-2xl font-black">{counts.REJECTED}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            ["PENDING", `Chờ duyệt (${counts.PENDING})`],
            ["VERIFIED", "Đã xác minh"],
            ["REJECTED", "Từ chối"],
            ["all", "Tất cả"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${filter === key ? "bg-gray-900 text-white" : "border bg-white"}`}
            >
              {label}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
          </div>
        ) : (
          <div className="space-y-4">
            {visible.length === 0 && <div className="rounded-3xl bg-white p-8 text-gray-400">Chưa có hồ sơ.</div>}
            {visible.map((item) => {
              const overdue = item.status === "PENDING" && item.createdAt && isSlaOverdue(item.createdAt, 24, now);
              return (
                <div key={item.id} className={`rounded-3xl border bg-white p-6 shadow-sm ${overdue ? "border-red-200" : "border-gray-100"}`}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-black text-gray-900">{item.fullName}</div>
                      <div className="text-sm text-gray-500">
                        {item.user.email} · {item.idCardType} {item.idCardMasked} · Rủi ro {item.riskLevel}
                      </div>
                      <div className="mt-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                        {STATUS_LABEL[item.status] || item.status}
                        {overdue && item.createdAt ? ` · quá hạn ${Math.round(hoursWaiting(item.createdAt, now))} giờ` : ""}
                      </div>
                      {item.rejectedReason && <div className="mt-2 text-xs text-red-600">Lý do: {item.rejectedReason}</div>}
                    </div>
                    {item.status === "PENDING" && (
                      <div className="flex gap-2">
                        <button
                          disabled={busyId === item.id}
                          onClick={() => review(item.id, "APPROVE")}
                          className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                        >
                          Duyệt
                        </button>
                        <button
                          disabled={busyId === item.id}
                          onClick={() => setRejecting(item)}
                          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                        >
                          Từ chối
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {item.idCardFrontImage && <img src={item.idCardFrontImage} alt="Mặt trước" className="h-28 w-full rounded-xl object-cover" />}
                    {item.idCardBackImage && <img src={item.idCardBackImage} alt="Mặt sau" className="h-28 w-full rounded-xl object-cover" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {rejecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">Từ chối hồ sơ KYC</h2>
            <p className="mt-1 text-sm text-gray-500">{rejecting.fullName} · {rejecting.user.email}</p>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={4}
              className="mt-4 w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="Nhập lý do để người dùng bổ sung và gửi lại"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button className="rounded-full border px-4 py-2 text-sm" onClick={() => setRejecting(null)} disabled={!!busyId}>
                Hủy
              </button>
              <button
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                disabled={!!busyId || !reason.trim()}
                onClick={() => review(rejecting.id, "REJECT", reason.trim())}
              >
                Từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
