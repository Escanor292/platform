"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Lock, Mail, Rocket, AlertCircle, Loader2 } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50 px-4 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px]" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px]" />

      <Card className="w-full max-w-md card-premium animate-fade-in-up border-0 shadow-xl">
        <CardHeader className="text-center pb-8 pt-12">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-6 animate-float">
             <Rocket size={24} />
          </div>
          <CardTitle className="text-3xl font-black text-gray-900 tracking-tight">Chào mừng trở lại</CardTitle>
          <CardDescription className="text-gray-400 font-medium">
            Đăng nhập để tiếp tục hành trình sáng tạo của bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="px-10 pb-12 space-y-8">
          
          <form onSubmit={handleEmailLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={18} />
                {error}
              </div>
            )}
            
            <div className="space-y-4">
               <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition" size={18} />
                  <Input 
                    type="email" 
                    placeholder="Email của bạn"
                    className="pl-12 h-14 bg-gray-50 border-gray-100 rounded-2xl focus:bg-white focus:ring-blue-600 focus:border-blue-600 transition-all font-medium"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
               </div>
               
               <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition" size={18} />
                  <Input 
                    type="password" 
                    placeholder="Mật khẩu"
                    className="pl-12 h-14 bg-gray-50 border-gray-100 rounded-2xl focus:bg-white focus:ring-blue-600 focus:border-blue-600 transition-all font-medium"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
               </div>
            </div>

            <Button 
               type="submit" 
               className="w-full h-14 bg-gray-900 text-white font-black rounded-2xl hover:bg-blue-600 hover:shadow-premium transition-all active:scale-95"
               disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : "Đăng nhập ngay"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-gray-400 font-bold tracking-widest leading-none">Hoặc</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full h-14 flex items-center justify-center gap-3 border-gray-100 rounded-2xl font-black text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-all"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            <Globe className="h-5 w-5" />
            Tiếp tục với Google
          </Button>
          
          <p className="text-center text-sm font-bold text-gray-400 pt-4">
            Bạn chưa có tài khoản?{" "}
            <a href="/auth/register" className="text-blue-600 hover:underline">
              Đăng ký miễn phí
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
