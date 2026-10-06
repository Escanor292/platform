"use client";

import { useEffect, useState } from "react";

type Row = {
  id: string;
  subjectType: string;
  kind: string;
  title: string;
  issuer: string;
  fileUrl: string;
  ownerName: string;
  ownerId: string;
  credentialCode: string | null;
};

export default function AdminCredentialsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [reason, setReason] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const response = await fetch("/api/admin/credentials");
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Không tải được hàng chờ");
      return;
    }
    setRows(data.credentials || []);
    setError(null);
  }

  useEffect(() => { load(); }, []);

  async function decide(id: string, status: "VERIFIED" | "REJECTED") {
    setError(null);
    const response = await fetch(`/api/admin/credentials/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reason: reason[id] || "" }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Không cập nhật được");
      return;
    }
    await load();
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-pgreen">Đối chiếu</p>
      <h1 className="font-display text-4xl font-black text-dblue">Bằng cấp chờ duyệt</h1>
      <p className="mt-2 text-sm text-gray-600">Chỉ duyệt khi ảnh khớp tên và đơn vị cấp. Không dùng mục này thay KYC.</p>
      {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
      <div className="mt-6 space-y-4">
        {rows.length === 0 && <p className="rounded-3xl bg-cream p-6 text-sm text-gray-600">Không còn hồ sơ chờ.</p>}
        {rows.map((row) => (
          <article key={row.id} className="rounded-[2rem] border border-pgreen/10 bg-white p-5">
            <p className="text-xs font-bold uppercase text-pgreen">{row.subjectType} · {row.kind}</p>
            <h2 className="font-display text-2xl font-bold text-dblue">{row.title}</h2>
            <p className="text-sm text-gray-600">{row.issuer}{row.credentialCode ? ` · ${row.credentialCode}` : ""}</p>
            <a href={`/profile/${row.ownerId}`} className="mt-1 inline-flex text-sm font-bold text-dblue">{row.ownerName}</a>
            <div className="mt-3">
              <a href={row.fileUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-pgreen">Mở file</a>
            </div>
            <textarea
              value={reason[row.id] || ""}
              onChange={(event) => setReason((current) => ({ ...current, [row.id]: event.target.value }))}
              placeholder="Lý do nếu từ chối"
              className="mt-3 min-h-20 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm"
            />
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => decide(row.id, "VERIFIED")} className="rounded-2xl bg-gradient-to-r from-pgreen to-fgreen px-4 py-2 text-sm font-bold text-white">Đối chiếu đạt</button>
              <button type="button" onClick={() => decide(row.id, "REJECTED")} className="rounded-2xl border border-red-200 px-4 py-2 text-sm font-bold text-red-600">Từ chối</button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
