"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { ArrowLeft, CheckCircle2, KeyRound, Lock, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Không thể đặt lại mật khẩu.");
        return;
      }
      setMessage(data.message);
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("Không thể đặt lại mật khẩu lúc này. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16 bg-gradient-to-b from-cream via-[#f0f8f4] to-cream">
      <section className="w-full max-w-md">
        <Link href="/auth/login" className="inline-flex items-center gap-2 mb-8 text-sm font-semibold text-gray-600 hover:text-pgreen transition-colors">
          <ArrowLeft size={17} /> Quay lại đăng nhập
        </Link>
        <div className="glass rounded-3xl p-8 shadow-xl border border-white/60">
          <div className="w-14 h-14 rounded-2xl bg-pgreen/10 text-pgreen flex items-center justify-center mb-6">
            <KeyRound size={28} />
          </div>
          <h1 className="font-display text-3xl font-extrabold text-dblue">Đặt mật khẩu mới</h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">Mật khẩu mới cần có ít nhất 8 ký tự. Liên kết này chỉ có thể sử dụng một lần.</p>

          {message ? (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <span>{message}</span>
              </div>
              <Link href="/auth/login" className="mt-3 inline-block font-bold underline">Đăng nhập ngay</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
              <div>
                <label htmlFor="new-password" className="mb-1.5 block text-sm font-semibold text-dblue">Mật khẩu mới</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input id="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete="new-password" className="h-12 rounded-2xl border border-gray-200 pl-12" />
                </div>
              </div>
              <div>
                <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-semibold text-dblue">Nhập lại mật khẩu mới</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input id="confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={8} autoComplete="new-password" className="h-12 rounded-2xl border border-gray-200 pl-12" />
                </div>
              </div>
              <Button type="submit" disabled={loading || !token} className="h-12 w-full rounded-2xl gradient-green font-bold text-white">
                {loading ? <><Loader2 className="mr-2 animate-spin" size={18} /> Đang cập nhật...</> : "Đặt lại mật khẩu"}
              </Button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<main className="min-h-screen flex items-center justify-center bg-cream"><Loader2 className="animate-spin text-pgreen" /></main>}><ResetPasswordContent /></Suspense>;
}
