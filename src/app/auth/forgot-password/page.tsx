"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, CheckCircle2, KeyRound, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [debugResetUrl, setDebugResetUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setDebugResetUrl("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Vui lòng kiểm tra lại email.");
        return;
      }
      setMessage(data.message);
      if (data.debugResetUrl) setDebugResetUrl(data.debugResetUrl);
    } catch {
      setError("Không thể gửi yêu cầu lúc này. Vui lòng thử lại sau.");
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
          <h1 className="font-display text-3xl font-extrabold text-dblue">Quên mật khẩu?</h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Nhập email tài khoản. Nếu email tồn tại, bạn sẽ nhận được liên kết đặt lại mật khẩu có hiệu lực trong 30 phút.
          </p>

          {message && (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <span>{message}</span>
              </div>
              {debugResetUrl && (
                <Link href={debugResetUrl} className="mt-3 block break-all font-semibold underline">
                  Mở liên kết test development
                </Link>
              )}
            </div>
          )}
          {error && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="forgot-email" className="mb-1.5 block text-sm font-semibold text-dblue">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="email@example.com"
                  required
                  autoComplete="email"
                  className="h-12 rounded-2xl border border-gray-200 pl-12"
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="h-12 w-full rounded-2xl gradient-green font-bold text-white">
              {loading ? <><Loader2 className="mr-2 animate-spin" size={18} /> Đang gửi...</> : "Gửi liên kết đặt lại mật khẩu"}
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
