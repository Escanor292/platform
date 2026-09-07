"use client";

import { useEffect, useState } from "react";
import { Settings, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminSystemPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ekycEnabled, setEkycEnabled] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.ekycEnabled === "boolean") setEkycEnabled(data.ekycEnabled);
      })
      .catch(() => toast.error("Không tải được cài đặt hệ thống"))
      .finally(() => setLoading(false));
  }, []);

  const toggle = async () => {
    const next = !ekycEnabled;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ekycEnabled: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không lưu được");
      setEkycEnabled(data.ekycEnabled);
      toast.success(data.ekycEnabled ? "Đã bật eKYC" : "Đã tắt eKYC — user nộp KYC thủ công");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 px-6 py-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-gray-500">
            <Settings size={12} /> Quản lý hệ thống
          </div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900">Cài đặt nền tảng</h1>
          <p className="mt-2 text-gray-500">Bật eKYC cho toàn sàn. Tắt thì mọi user chỉ nộp KYC thủ công, admin duyệt.</p>
        </div>

        <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-400"><Loader2 className="h-5 w-5 animate-spin" /> Đang tải...</div>
          ) : (
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="text-lg font-black text-gray-900">eKYC</div>
                <p className="mt-1 text-sm text-gray-500">
                  {ekycEnabled
                    ? "Đang bật: wizard OCR / liveness / NFC và eKYB. "
                    : "Đang tắt: form ảnh CCCD + chờ admin duyệt. API eKYC bị chặn."}
                </p>
                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                  Chế độ: {ekycEnabled ? "EKYC" : "MANUAL"}
                </p>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={toggle}
                className={`relative h-8 w-14 shrink-0 rounded-full transition ${
                  ekycEnabled ? "bg-emerald-600" : "bg-gray-300"
                } ${saving ? "opacity-60" : ""}`}
                aria-pressed={ekycEnabled}
              >
                <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${
                  ekycEnabled ? "left-7" : "left-1"
                }`} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
