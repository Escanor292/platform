"use client";

import { useEffect, useState } from "react";
import { Check, Globe, LayoutTemplate, Link2, Loader2, Save, Trash2 } from "lucide-react";
import type { ProfileCustomizationConfig } from "@/lib/profile-customization";
import { toast } from "sonner";

type Template = {
  id: string;
  slug: string;
  title: string;
  description: string;
  visibility: "PRIVATE" | "UNLISTED" | "PUBLIC";
  status: string;
  useCount: number;
  authorName?: string;
  config: ProfileCustomizationConfig;
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Riêng tư",
  PENDING: "Chờ duyệt",
  PUBLISHED: "Đã mở",
  REJECTED: "Từ chối",
};

export function ProfileTemplateLibrary({
  config,
  onApply,
}: {
  config: ProfileCustomizationConfig;
  onApply: (next: ProfileCustomizationConfig) => void;
}) {
  const [tab, setTab] = useState<"community" | "mine">("community");
  const [community, setCommunity] = useState<Template[]>([]);
  const [mine, setMine] = useState<Template[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"PRIVATE" | "UNLISTED" | "PUBLIC">("PRIVATE");
  const [busy, setBusy] = useState(false);

  const load = () => {
    fetch("/api/profile/templates?scope=public")
      .then((res) => res.json())
      .then((body) => setCommunity(body.templates || []))
      .catch(() => setCommunity([]));
    fetch("/api/profile/templates?scope=mine")
      .then((res) => res.json())
      .then((body) => setMine(body.templates || []))
      .catch(() => setMine([]));
  };

  useEffect(() => {
    load();
  }, []);

  const apply = async (id: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/profile/templates/${id}/apply`, { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Không áp dụng được");
      onApply(body.draft);
      toast.success("Đã áp dụng mẫu vào bản nháp");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/profile/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, visibility, config }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Không lưu được mẫu");
      setTitle("");
      setDescription("");
      setTab("mine");
      load();
      toast.success(visibility === "PUBLIC" ? "Đã gửi mẫu chờ duyệt" : "Đã lưu mẫu");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const share = async (slug: string) => {
    const url = `${window.location.origin}/t/${slug}`;
    await navigator.clipboard.writeText(url);
    toast.success("Đã copy link chia sẻ");
  };

  const remove = async (id: string) => {
    if (!confirm("Xóa mẫu này?")) return;
    const res = await fetch(`/api/profile/templates/${id}`, { method: "DELETE" });
    const body = await res.json();
    if (!res.ok) return toast.error(body.error || "Không xóa được");
    load();
  };

  const list = tab === "mine" ? mine : community;

  return (
    <section className="rounded-[2.5rem] border border-pgreen/10 bg-white/90 p-6 shadow-soft backdrop-blur sm:p-8">
      <div className="mb-4 flex items-center gap-2">
        <LayoutTemplate className="text-pgreen" size={20} />
        <h2 className="font-display text-xl font-black text-dblue">Thư viện mẫu cộng đồng</h2>
      </div>
      <p className="mb-4 text-sm text-gray-500">Mẫu chỉ gồm màu và bố cục, không kèm nội dung riêng của người tạo.</p>

      <div className="mb-5 grid gap-3 rounded-2xl border border-gray-200 p-4">
        <div className="text-sm font-black text-dblue">Lưu giao diện hiện tại thành mẫu</div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tên mẫu, ví dụ Mùa hè tím"
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
          maxLength={60}
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả ngắn"
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
          rows={2}
          maxLength={200}
        />
        <div className="flex flex-wrap items-center gap-2">
          {(["PRIVATE", "UNLISTED", "PUBLIC"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setVisibility(item)}
              className={`rounded-full px-3 py-1 text-xs font-bold ${visibility === item ? "bg-pgreen text-white" : "bg-gray-100 text-gray-600"}`}
            >
              {item === "PRIVATE" ? "Riêng tư" : item === "UNLISTED" ? "Link" : "Công khai"}
            </button>
          ))}
          <button
            type="button"
            onClick={save}
            disabled={busy || title.trim().length < 2}
            className="ml-auto inline-flex items-center gap-2 rounded-xl bg-dblue px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Lưu mẫu
          </button>
        </div>
      </div>

      <div className="mb-3 flex gap-2">
        <button type="button" onClick={() => setTab("community")} className={`rounded-full px-3 py-1 text-xs font-bold ${tab === "community" ? "bg-pgreen text-white" : "bg-gray-100 text-gray-600"}`}>
          Cộng đồng
        </button>
        <button type="button" onClick={() => setTab("mine")} className={`rounded-full px-3 py-1 text-xs font-bold ${tab === "mine" ? "bg-pgreen text-white" : "bg-gray-100 text-gray-600"}`}>
          Của tôi ({mine.length})
        </button>
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-gray-400">{tab === "mine" ? "Chưa có mẫu nào." : "Chưa có mẫu công khai."}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-2xl border border-gray-200">
              <div className="h-2" style={{ background: `linear-gradient(90deg, ${item.config.theme.gradientColors.join(", ")})` }} />
              <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-black text-dblue">{item.title}</div>
                  <div className="mt-0.5 text-xs text-gray-400">
                    {item.authorName || "Bạn"} · {item.useCount} lượt dùng · {STATUS_LABEL[item.status] || item.status}
                  </div>
                </div>
                <span className="h-8 w-8 rounded-full" style={{ background: item.config.theme.primary }} />
              </div>
              {item.description && <p className="mt-2 text-xs text-gray-500">{item.description}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" disabled={busy} onClick={() => apply(item.id)} className="inline-flex items-center gap-1 rounded-lg bg-pgreen px-2.5 py-1 text-xs font-bold text-white">
                  <Check size={12} /> Dùng
                </button>
                {item.visibility !== "PRIVATE" && (
                  <button type="button" onClick={() => share(item.slug)} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-bold text-gray-600">
                    {item.visibility === "PUBLIC" ? <Globe size={12} /> : <Link2 size={12} />} Copy link
                  </button>
                )}
                {tab === "mine" && (
                  <button type="button" onClick={() => remove(item.id)} className="inline-flex items-center gap-1 rounded-lg border border-red-100 px-2.5 py-1 text-xs font-bold text-red-600">
                    <Trash2 size={12} /> Xóa
                  </button>
                )}
              </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
