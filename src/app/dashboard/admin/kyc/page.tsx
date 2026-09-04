"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

type Item = {
  id: string; fullName: string; idCardType: string; idCardMasked: string; status: string; riskLevel: string;
  rejectedReason?: string | null; idCardFrontImage?: string | null; idCardBackImage?: string | null;
  user: { id: string; email: string; name: string | null; role: string }; updatedAt: string;
};

export default function AdminKycPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/kyc");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Khong tai duoc");
      setItems(data.items || []);
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const review = async (id: string, action: "APPROVE" | "REJECT") => {
    const reason = action === "REJECT" ? window.prompt("Ly do tu choi?") || "" : "";
    if (action === "REJECT" && !reason.trim()) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/kyc/${id}/review`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, reason }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Loi duyet");
      toast.success(action === "APPROVE" ? "Da duyet" : "Da tu choi");
      await load();
    } catch (e: any) { toast.error(e.message); } finally { setBusyId(""); }
  };
  return (
    <div className="min-h-screen bg-slate-50/50 px-6 py-16">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin" className="flex h-11 w-11 items-center justify-center rounded-2xl border bg-white"><ArrowLeft size={18} /></Link>
          <div>
            <h1 className="text-3xl font-black text-gray-900">Hang doi KYC / eKYC</h1>
            <p className="text-sm text-gray-500">Duyet lai ho so PENDING.</p>
          </div>
        </div>
        {loading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-700" /></div> : (
          <div className="space-y-4">
            {items.length === 0 && <div className="rounded-3xl bg-white p-8 text-gray-400">Chua co ho so.</div>}
            {items.map((item) => (
              <div key={item.id} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-black text-gray-900">{item.fullName}</div>
                    <div className="text-sm text-gray-500">{item.user.email} · {item.idCardType} {item.idCardMasked} · {item.riskLevel}</div>
                    <div className="mt-2 text-xs font-bold uppercase tracking-wide text-gray-400">{item.status}</div>
                  </div>
                  {item.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button disabled={busyId === item.id} onClick={() => review(item.id, "APPROVE")} className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Duyet</button>
                      <button disabled={busyId === item.id} onClick={() => review(item.id, "REJECT")} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Tu choi</button>
                    </div>
                  )}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {item.idCardFrontImage && <img src={item.idCardFrontImage} alt="front" className="h-28 w-full rounded-xl object-cover" />}
                  {item.idCardBackImage && <img src={item.idCardBackImage} alt="back" className="h-28 w-full rounded-xl object-cover" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
