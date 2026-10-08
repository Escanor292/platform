"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Row = {
  id: string;
  category: string;
  message: string;
  pageUrl: string | null;
  status: string;
  createdAt: string;
  userId: string;
  userName: string;
  email: string;
};

const CATEGORY_LABEL: Record<string, string> = {
  IDEA: "Ý tưởng",
  BUG: "Lỗi",
  OTHER: "Khác",
};

export default function AdminFeedbackPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const response = await fetch("/api/admin/feedback");
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Không tải được góp ý");
      return;
    }
    setRows(data.feedback || []);
    setError(null);
  }

  useEffect(() => { load(); }, []);

  async function mark(id: string, status: "READ" | "NEW") {
    await fetch(`/api/admin/feedback/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-pgreen">Cải thiện</p>
      <h1 className="font-display text-4xl font-black text-dblue">Góp ý</h1>
      <p className="mt-2 text-sm text-gray-600">Ý kiến người dùng gửi để cải thiện nền tảng. Không thay cho báo cáo vi phạm.</p>
      {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
      <div className="mt-6 space-y-4">
        {rows.length === 0 && <p className="rounded-3xl bg-cream p-6 text-sm text-gray-600">Chưa có góp ý.</p>}
        {rows.map((row) => (
          <article key={row.id} className="rounded-[2rem] border border-pgreen/10 bg-white p-5">
            <p className="text-xs font-black uppercase tracking-wider text-pgreen">{CATEGORY_LABEL[row.category] || row.category} · {row.status === "NEW" ? "Mới" : "Đã xem"}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{row.message}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <Link href={`/profile/${row.userId}`} className="font-bold text-dblue">{row.userName}</Link>
              <span className="text-gray-500">{row.email}</span>
              <span className="text-gray-400">{new Date(row.createdAt).toLocaleString("vi-VN")}</span>
              {row.pageUrl && <span className="text-pgreen">{row.pageUrl}</span>}
            </div>
            <button type="button" onClick={() => mark(row.id, row.status === "NEW" ? "READ" : "NEW")} className="mt-3 rounded-2xl border border-dblue/20 px-4 py-2 text-sm font-bold text-dblue">
              {row.status === "NEW" ? "Đánh dấu đã xem" : "Đánh dấu mới"}
            </button>
          </article>
        ))}
      </div>
    </main>
  );
}
