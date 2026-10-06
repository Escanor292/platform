"use client";

import { useEffect, useState } from "react";
import { BarChart3, Database, Loader2, Search, Settings, Shield } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type DatabaseReadiness = {
  stored: string;
  effective: string;
  mssqlConfigured: boolean;
  mssqlClientReady: boolean;
  canSwitch: boolean;
  reasons: string[];
};

type SettingsPayload = {
  ekycEnabled: boolean;
  kycMode: string;
  ga4MeasurementId: string;
  ga4Configured: boolean;
  sitemapPath: string;
  robotsPath: string;
};

function StatusPill({ ok, okLabel, offLabel }: { ok: boolean; okLabel: string; offLabel: string }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
      ok ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-500"
    }`}>
      {ok ? okLabel : offLabel}
    </span>
  );
}

export default function AdminSystemPage() {
  const [loading, setLoading] = useState(true);
  const [savingEkyc, setSavingEkyc] = useState(false);
  const [savingGa4, setSavingGa4] = useState(false);
  const [ekycEnabled, setEkycEnabled] = useState(true);
  const [ga4MeasurementId, setGa4MeasurementId] = useState("");
  const [ga4Configured, setGa4Configured] = useState(false);
  const [sitemapPath, setSitemapPath] = useState("/sitemap.xml");
  const [robotsPath, setRobotsPath] = useState("/robots.txt");
  const [database, setDatabase] = useState<DatabaseReadiness | null>(null);
  const [savingDatabase, setSavingDatabase] = useState(false);

  const apply = (data: SettingsPayload) => {
    if (typeof data.ekycEnabled === "boolean") setEkycEnabled(data.ekycEnabled);
    setGa4MeasurementId(data.ga4MeasurementId || "");
    setGa4Configured(Boolean(data.ga4Configured));
    if (data.sitemapPath) setSitemapPath(data.sitemapPath);
    if (data.robotsPath) setRobotsPath(data.robotsPath);
  };

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then(apply)
      .catch(() => toast.error("Không tải được cài đặt hệ thống"))
      .finally(() => setLoading(false));
    fetch("/api/admin/database-target")
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.reasons)) setDatabase(data);
      })
      .catch(() => undefined);
  }, []);

  const toggleEkyc = async () => {
    const next = !ekycEnabled;
    setSavingEkyc(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ekycEnabled: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không lưu được");
      apply(data);
      toast.success(data.ekycEnabled ? "Đã bật eKYC" : "Đã tắt eKYC — user nộp KYC thủ công");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSavingEkyc(false);
    }
  };

  const saveGa4 = async () => {
    setSavingGa4(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ga4MeasurementId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không lưu được");
      apply(data);
      toast.success(data.ga4Configured ? "Đã bật Google Analytics 4" : "Đã tắt GA4");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSavingGa4(false);
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
          <p className="mt-2 text-gray-500">eKYC, đo lường GA4, sitemap và database.</p>
        </div>

        <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
          <div className="mb-5 text-lg font-black text-gray-900">Trạng thái SEO & Analytics</div>
          {loading ? (
            <div className="flex items-center gap-2 text-gray-400"><Loader2 className="h-5 w-5 animate-spin" /> Đang tải...</div>
          ) : (
            <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100">
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <BarChart3 size={16} className="text-amber-500" /> Google Analytics 4 (GA4)
                </div>
                <StatusPill ok={ga4Configured} okLabel="Đang hoạt động" offLabel="Chưa cấu hình" />
              </div>
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <Search size={16} className="text-emerald-600" /> Sitemap.xml
                </div>
                <a href={sitemapPath} target="_blank" rel="noreferrer" className="text-xs font-bold text-emerald-700 underline">
                  Đang hoạt động
                </a>
              </div>
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <Shield size={16} className="text-sky-600" /> robots.txt
                </div>
                <a href={robotsPath} target="_blank" rel="noreferrer" className="text-xs font-bold text-emerald-700 underline">
                  Đang hoạt động
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
          <div className="text-lg font-black text-gray-900">Google Analytics 4</div>
          <p className="mt-1 text-sm text-gray-500">
            Dán Measurement ID từ Google Analytics. Để trống rồi lưu nếu muốn tắt. Sitemap và Open Graph chạy độc lập, không cần GA4.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="G-XXXXXXXX"
              value={ga4MeasurementId}
              onChange={(e) => setGa4MeasurementId(e.target.value)}
              className="h-11"
            />
            <Button onClick={saveGa4} disabled={savingGa4 || loading} className="h-11 bg-emerald-700 hover:bg-emerald-800">
              {savingGa4 ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Lưu Analytics
            </Button>
          </div>
        </div>

        <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-lg font-black text-gray-900">
                <Database size={18} className="text-sky-700" /> Database
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Đang dùng: {database?.effective === "sqlserver" ? "MS SQL cho SQL thô" : "PostgreSQL (Neon)"}.
                Tắt nút thì code không đổi. Bật chỉ khi đã gắn SQL Server.
              </p>
            </div>
            <button
              type="button"
              disabled={!database?.canSwitch || savingDatabase}
              onClick={async () => {
                if (!database?.canSwitch) return;
                const next = database.effective === "sqlserver" ? "postgresql" : "sqlserver";
                setSavingDatabase(true);
                try {
                  const res = await fetch("/api/admin/database-target", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ target: next }),
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || "Không chuyển được");
                  setDatabase(data);
                  toast.success(data.effective === "sqlserver" ? "SQL thô đang sang MS SQL" : "Đã về Postgres");
                } catch (error: any) {
                  toast.error(error.message);
                } finally {
                  setSavingDatabase(false);
                }
              }}
              className={`relative h-8 w-14 shrink-0 rounded-full transition ${
                database?.effective === "sqlserver" ? "bg-sky-700" : "bg-gray-300"
              } ${!database?.canSwitch || savingDatabase ? "cursor-not-allowed opacity-60" : ""}`}
              aria-pressed={database?.effective === "sqlserver"}
              title={database?.canSwitch ? "Chuyển SQL thô" : "Chưa gắn SQL Server"}
            >
              <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${
                database?.effective === "sqlserver" ? "left-7" : "left-1"
              }`} />
            </button>
          </div>
          <ul className="mt-4 space-y-1 text-sm text-gray-500">
            {(database?.reasons?.length ? database.reasons : ["Đang kiểm tra điều kiện chuyển database."]).map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
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
                    ? "Đang bật: wizard OCR / liveness / NFC và eKYB."
                    : "Đang tắt: form ảnh CCCD + chờ admin duyệt. API eKYC bị chặn."}
                </p>
                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                  Chế độ: {ekycEnabled ? "EKYC" : "MANUAL"}
                </p>
              </div>
              <button
                type="button"
                disabled={savingEkyc}
                onClick={toggleEkyc}
                className={`relative h-8 w-14 shrink-0 rounded-full transition ${
                  ekycEnabled ? "bg-emerald-600" : "bg-gray-300"
                } ${savingEkyc ? "opacity-60" : ""}`}
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
