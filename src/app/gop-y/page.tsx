"use client";

import { useState } from "react";
import Link from "next/link";

export default function FeedbackPage() {
  const [category, setCategory] = useState("IDEA");
  const [message, setMessage] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSending(true);
    setError(null);
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, message, pageUrl }),
    });
    const data = await response.json();
    setSending(false);
    if (!response.ok) {
      setError(data.error || "Không gửi được góp ý");
      return;
    }
    setDone(true);
    setMessage("");
    setPageUrl("");
  }

  return (
    <main className="min-h-screen bg-cream px-6 pb-20 pt-28">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-pgreen">Nền tảng</p>
        <h1 className="mt-2 font-display text-4xl font-black text-dblue md:text-5xl">Góp ý</h1>
        <p className="mt-3 text-gray-600">Gửi lỗi, ý tưởng hoặc điều chưa rõ để nền tảng cải thiện. Đây không phải chỗ tố cáo vi phạm. Vi phạm dùng nút Báo cáo.</p>
        {done ? (
          <div className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm">
            <h2 className="font-display text-2xl font-bold text-dblue">Đã nhận góp ý</h2>
            <p className="mt-2 text-sm text-gray-600">Admin sẽ xem trong trang quản lý. Không có trả lời tự động.</p>
            <button type="button" onClick={() => setDone(false)} className="mt-4 font-bold text-pgreen">Gửi ý khác</button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-4 rounded-[2rem] bg-white p-6 shadow-sm">
            <label className="block text-sm font-bold text-dblue">Loại
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1 h-12 w-full rounded-2xl border border-gray-200 px-4">
                <option value="IDEA">Ý tưởng cải thiện</option>
                <option value="BUG">Lỗi khi dùng</option>
                <option value="OTHER">Việc khác</option>
              </select>
            </label>
            <label className="block text-sm font-bold text-dblue">Nội dung
              <textarea value={message} onChange={(event) => setMessage(event.target.value)} className="mt-1 min-h-36 w-full rounded-2xl border border-gray-200 px-4 py-3" placeholder="Bạn muốn nền tảng sửa hoặc thêm gì?" />
            </label>
            <label className="block text-sm font-bold text-dblue">Trang liên quan, nếu có
              <input value={pageUrl} onChange={(event) => setPageUrl(event.target.value)} className="mt-1 h-12 w-full rounded-2xl border border-gray-200 px-4" placeholder="/campaigns" />
            </label>
            <button disabled={sending} className="h-12 rounded-2xl bg-gradient-to-r from-pgreen to-fgreen px-6 font-bold text-white disabled:opacity-60">
              {sending ? "Đang gửi..." : "Gửi góp ý"}
            </button>
            {error && <p className="text-sm font-medium text-red-600">{error}</p>}
            {error?.includes("đăng nhập") && <Link href="/auth/login?callbackUrl=/gop-y" className="block text-sm font-bold text-pgreen">Đăng nhập</Link>}
          </form>
        )}
      </div>
    </main>
  );
}
