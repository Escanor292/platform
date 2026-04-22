"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Lock, Mail, AlertCircle, Loader2 } from "lucide-react";
import LeafIcon from "@/components/shared/LeafIcon";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email hoặc mật khẩu không chính xác.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Đã xảy ra lỗi hệ thống.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #F8F7F2 0%, #f0f8f4 50%, #F8F7F2 100%)'
      }}
    >
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div 
          className="absolute top-10 left-[5%] w-96 h-96 bg-gradient-to-br from-fgreen/20 via-fgreen/8 to-transparent rounded-full blur-3xl opacity-70"
          style={{ animation: 'pulse 8s ease-in-out infinite' }}
        />
        <div 
          className="absolute top-32 right-[8%] w-80 h-80 bg-gradient-to-tl from-tblue/15 via-transparent to-transparent rounded-full blur-3xl opacity-60"
          style={{ animation: 'pulse 10s ease-in-out 2s infinite' }}
        />
        <div 
          className="absolute bottom-10 left-[20%] w-[30rem] h-[30rem] bg-gradient-to-tr from-pgreen/10 to-transparent rounded-full blur-[100px] opacity-40"
          style={{ animation: 'pulse 12s ease-in-out 1s infinite' }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Title Only */}
        <div className="text-center mb-10">
          <h1 className="font-display font-extrabold text-4xl text-dblue mb-3 tracking-tight">Chào mừng trở lại</h1>
          <p className="text-gray-500 font-medium">Đăng nhập để tiếp tục hành trình tử tế</p>
        </div>

        {/* Form Card */}
        <div className="glass rounded-3xl p-8 shadow-xl">
          <form onSubmit={handleEmailLogin} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-semibold slide-up">
                <AlertCircle size={18} />
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-dblue mb-1.5">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pgreen transition" size={18} />
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="email@example.com"
                    className="pl-12 h-12 glass border border-gray-200 rounded-2xl focus:ring-2 focus:ring-pgreen focus:border-transparent transition-all font-medium"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
               
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-dblue mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pgreen transition" size={18} />
                  <Input 
                    id="password"
                    type="password" 
                    placeholder="••••••••"
                    className="pl-12 h-12 glass border border-gray-200 rounded-2xl focus:ring-2 focus:ring-pgreen focus:border-transparent transition-all font-medium"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 gradient-green text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-green-200 transition-all active:scale-95"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-gray-400 font-semibold tracking-wider">Hoặc</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full h-12 flex items-center justify-center gap-3 glass border border-gray-200 rounded-2xl font-semibold text-gray-700 hover:border-pgreen hover:text-pgreen transition-all"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            <Globe className="h-5 w-5" />
            Tiếp tục với Google
          </Button>
          
          <p className="text-center text-sm text-gray-500 mt-6">
            Bạn chưa có tài khoản?{" "}
            <a href="/auth/register" className="text-pgreen font-semibold hover:underline">
              Đăng ký miễn phí
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
