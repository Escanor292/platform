"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Check, LayoutTemplate, X } from "lucide-react";
import { toast } from "sonner";

type Template = {
  id: string;
  title: string;
  description: string;
  status: string;
  visibility: string;
  authorName?: string;
  useCount: number;
  slug: string;
};

export default function AdminTemplatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [filter, setFilter] = useState("PENDING");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch(`/api/admin/templates?status=${filter}`)
      .then((res) => res.json())
      .then((body) => setTemplates(body.templates || []))
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    else if (status === "authenticated") {
      if ((session?.user as any)?.role !== "ADMIN" && !(session?.user as any)?.isAdmin) {
        router.push("/");
        return;
      }
      load();
    }
  }, [status, filter, session]);

  const review = async (id: string, action: "APPROVE" | "REJECT") => {
    const res = await fetch("/api/admin/templates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    const body = await res.json();
    if (!res.ok) return toast.error(body.error);
    toast.success(action === "APPROVE" ? "Đã duyệt mẫu" : "Đã từ chối");
    load();
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6 flex items-center gap-2">
        <LayoutTemplate className="text-gray-900" size={22} />
        <h1 className="text-3xl font-black text-gray-900">Mẫu giao diện</h1>
      </div>
      <div className="mb-6 flex gap-2">
        <button type="button" onClick={() => setFilter("PENDING")} className={`rounded-full px-4 py-2 text-sm font-bold ${filter === "PENDING" ? "bg-gray-900 text-white" : "bg-white text-gray-600"}`}>
          Chờ duyệt
        </button>
        <button type="button" onClick={() => setFilter("PUBLISHED")} className={`rounded-full px-4 py-2 text-sm font-bold ${filter === "PUBLISHED" ? "bg-gray-900 text-white" : "bg-white text-gray-600"}`}>
          Đã public
        </button>
      </div>
      {loading ? (
        <p className="text-sm text-gray-500">Đang tải...</p>
      ) : templates.length === 0 ? (
        <p className="text-sm text-gray-500">Không có mẫu.</p>
      ) : (
        <div className="space-y-3">
          {templates.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4">
              <div>
                <div className="font-black text-gray-900">{item.title}</div>
                <div className="text-xs text-gray-400">
                  {item.authorName} · <a href={`/t/${item.slug}`} className="underline" target="_blank" rel="noreferrer">/t/{item.slug}</a> · {item.useCount} lượt
                </div>
                {item.description && <p className="mt-1 text-sm text-gray-500">{item.description}</p>}
              </div>
              {filter === "PENDING" && (
                <div className="flex gap-2">
                  <button type="button" onClick={() => review(item.id, "REJECT")} className="inline-flex h-10 items-center gap-1 rounded-xl border px-3 text-sm font-bold text-red-600">
                    <X size={14} /> Từ chối
                  </button>
                  <button type="button" onClick={() => review(item.id, "APPROVE")} className="inline-flex h-10 items-center gap-1 rounded-xl bg-gray-900 px-3 text-sm font-bold text-white">
                    <Check size={14} /> Duyệt
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
