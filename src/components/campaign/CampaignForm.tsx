"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RewardDraft {
  title: string;
  description: string;
  amount: number;
  stock: number | null;
  isUnlimited: boolean;
  estimatedDelivery: string;
}

interface CampaignFormProps {
  mode?: "create" | "edit";
  initialData?: Partial<{
    id: string;
    title: string;
    tagline: string;
    description: string;
    goalAmount: number;
    category: string;
    imageUrl: string;
    endDate: string;
    rewards: RewardDraft[];
  }>;
  creatorId: string;
}

const CATEGORIES = [
  "Công nghệ", "Nghệ thuật", "Âm nhạc", "Phim ảnh",
  "Game", "Thực phẩm", "Thời trang", "Giáo dục", "Khác",
];

export default function CampaignForm({ mode = "create", initialData, creatorId }: CampaignFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    tagline: initialData?.tagline ?? "",
    description: initialData?.description ?? "",
    goalAmount: initialData?.goalAmount ?? 1000000,
    category: initialData?.category ?? "",
    imageUrl: initialData?.imageUrl ?? "",
    endDate: initialData?.endDate ?? "",
  });

  const [rewards, setRewards] = useState<RewardDraft[]>(
    initialData?.rewards ?? []
  );

  const updateForm = (key: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const addReward = () =>
    setRewards((prev) => [
      ...prev,
      { title: "", description: "", amount: 50000, stock: null, isUnlimited: true, estimatedDelivery: "" },
    ]);

  const updateReward = (i: number, key: keyof RewardDraft, value: string | number | boolean | null) =>
    setRewards((prev) => prev.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)));

  const removeReward = (i: number) =>
    setRewards((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = mode === "edit" && initialData?.id
        ? `/api/campaigns/${initialData.id}`
        : "/api/campaigns";

      const res = await fetch(url, {
        method: mode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, creatorId, rewards }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra");

      router.push(`/campaigns/${data.slug ?? data.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Thông tin cơ bản */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">📋 Thông tin cơ bản</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Tên dự án <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateForm("title", e.target.value)}
            required
            maxLength={100}
            placeholder="Ví dụ: Ứng dụng học tiếng Anh qua truyện tranh"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tagline</label>
          <input
            type="text"
            value={form.tagline}
            onChange={(e) => updateForm("tagline", e.target.value)}
            maxLength={150}
            placeholder="Mô tả ngắn gọn, hấp dẫn trong 1 câu"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Mô tả chi tiết <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.description}
            onChange={(e) => updateForm("description", e.target.value)}
            required
            rows={6}
            placeholder="Mô tả chi tiết về dự án, mục tiêu, kế hoạch sử dụng vốn..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Danh mục
            </label>
            <select
              value={form.category}
              onChange={(e) => updateForm("category", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              <option value="">-- Chọn danh mục --</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              URL ảnh bìa
            </label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => updateForm("imageUrl", e.target.value)}
              placeholder="https://..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
      </section>

      {/* Mục tiêu & Thời hạn */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">🎯 Mục tiêu & Thời hạn</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Mục tiêu (VNĐ) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.goalAmount}
              onChange={(e) => updateForm("goalAmount", Number(e.target.value))}
              required
              min={1000000}
              step={500000}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Ngày kết thúc
            </label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => updateForm("endDate", e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
      </section>

      {/* Phần thưởng */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">🎁 Phần thưởng</h2>
          <button
            type="button"
            onClick={addReward}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition"
          >
            + Thêm phần thưởng
          </button>
        </div>

        {rewards.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">
            Chưa có phần thưởng. Thêm để thu hút backer hơn!
          </p>
        )}

        {rewards.map((reward, i) => (
          <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Phần thưởng #{i + 1}</span>
              <button
                type="button"
                onClick={() => removeReward(i)}
                className="text-red-400 hover:text-red-600 text-sm"
              >
                Xóa
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={reward.title}
                onChange={(e) => updateReward(i, "title", e.target.value)}
                placeholder="Tên phần thưởng"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              />
              <input
                type="number"
                value={reward.amount}
                onChange={(e) => updateReward(i, "amount", Number(e.target.value))}
                placeholder="Số tiền ủng hộ tối thiểu"
                min={0}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              />
            </div>
            <textarea
              value={reward.description}
              onChange={(e) => updateReward(i, "description", e.target.value)}
              placeholder="Mô tả phần thưởng..."
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white resize-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={reward.estimatedDelivery}
                onChange={(e) => updateReward(i, "estimatedDelivery", e.target.value)}
                placeholder="Dự kiến giao: Tháng 6/2025"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              />
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reward.isUnlimited}
                  onChange={(e) => updateReward(i, "isUnlimited", e.target.checked)}
                  className="rounded"
                />
                Không giới hạn số lượng
              </label>
            </div>
          </div>
        ))}
      </section>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            Đang xử lý...
          </>
        ) : mode === "edit" ? (
          "Cập nhật campaign"
        ) : (
          "Tạo campaign →"
        )}
      </button>
    </form>
  );
}
