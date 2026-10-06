"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatVND } from "@/lib/utils";

type Tier = { id: string; title: string; description: string | null; amount: number; isActive: boolean };

export default function CreatorMembershipPage() {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("50000");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const response = await fetch("/api/creator/tiers");
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Không tải được mức ủng hộ");
      setLoading(false);
      return;
    }
    setTiers(data.tiers || []);
    setError(null);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function createTier(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const response = await fetch("/api/creator/tiers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, amount: Number(amount) }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Không tạo được");
      return;
    }
    setTitle("");
    setDescription("");
    await load();
  }

  async function toggle(tier: Tier) {
    await fetch(`/api/creator/tiers/${tier.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !tier.isActive }),
    });
    await load();
  }

  return (
    <main className="min-h-screen bg-cream px-6 pb-20 pt-28">
      <div className="mx-auto max-w-3xl">
        <Link href="/dashboard/creator" className="text-sm font-bold text-pgreen">Về chiến dịch</Link>
        <h1 className="mt-3 font-display text-4xl font-black text-dblue md:text-5xl">Ủng hộ dài lâu</h1>
        <p className="mt-3 text-gray-600">Tối đa 4 mức đang mở. Người ủng hộ chuyển khoản từng tháng. Bạn không nhận tiền tự động, admin đối soát như đơn thường.</p>

        <form onSubmit={createTier} className="mt-8 space-y-4 rounded-[2rem] bg-white p-6 shadow-sm">
          <label className="block text-sm font-bold text-dblue">Tên mức
            <input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1 h-12 w-full rounded-2xl border border-gray-200 px-4 font-medium" placeholder="Đồng hành" />
          </label>
          <label className="block text-sm font-bold text-dblue">Quyền lợi
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="mt-1 min-h-24 w-full rounded-2xl border border-gray-200 px-4 py-3 font-medium" placeholder="Tên trong danh sách hội viên" />
          </label>
          <label className="block text-sm font-bold text-dblue">Số tiền mỗi tháng (đồng)
            <input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="numeric" className="mt-1 h-12 w-full rounded-2xl border border-gray-200 px-4 font-medium" />
          </label>
          <button className="h-12 rounded-2xl bg-gradient-to-r from-pgreen to-fgreen px-6 font-bold text-white">Thêm mức</button>
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
        </form>

        <div className="mt-6 space-y-3">
          {loading && <p className="text-sm text-gray-500">Đang tải...</p>}
          {tiers.map((tier) => (
            <article key={tier.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white p-5">
              <div>
                <h2 className="font-display text-2xl font-bold text-dblue">{tier.title}</h2>
                <p className="text-sm text-gray-600">{tier.description}</p>
                <p className="mt-1 font-bold text-pgreen">{formatVND(tier.amount)} / tháng · {tier.isActive ? "Đang mở" : "Đã tắt"}</p>
              </div>
              <button type="button" onClick={() => toggle(tier)} className="rounded-2xl border border-dblue/20 px-4 py-2 text-sm font-bold text-dblue">
                {tier.isActive ? "Tắt mức" : "Mở lại"}
              </button>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
