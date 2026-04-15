"use client";

import { signIn } from "next-auth/react";
import { Globe, Sparkles, Heart, Users } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-fgreen/5 flex items-center justify-center px-4 py-24">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Side - Branding */}
        <div className="hidden lg:block space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-fgreen/10 text-pgreen rounded-full text-xs font-black uppercase tracking-widest border border-fgreen/20">
            <Sparkles size={14} className="text-fgreen" />
            Tham gia cộng đồng
          </div>
          
          <h1 className="font-display text-6xl font-black text-gray-900 tracking-tight leading-[1.1]">
            Khởi đầu hành trình
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pgreen via-fgreen to-tblue mt-2">
              Thay đổi thế giới
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 font-medium leading-relaxed max-w-lg">
            Tham gia cộng đồng TửTế Fund - nơi những ý tưởng tuyệt vời được hiện thực hóa cùng sự ủng hộ của hàng ngàn trái tim.
          </p>

          <div className="grid grid-cols-2 gap-6 pt-8">
            <div className="glass-morphism p-6 rounded-3xl border border-white/20">
              <div className="w-12 h-12 bg-pgreen/10 rounded-2xl flex items-center justify-center text-pgreen mb-4">
                <Users size={24} />
              </div>
              <div className="text-2xl font-black text-gray-900 mb-1">10,000+</div>
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Thành viên</div>
            </div>
            
            <div className="glass-morphism p-6 rounded-3xl border border-white/20">
              <div className="w-12 h-12 bg-fgreen/10 rounded-2xl flex items-center justify-center text-fgreen mb-4">
                <Heart size={24} />
              </div>
              <div className="text-2xl font-black text-gray-900 mb-1">5,000+</div>
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Dự án</div>
            </div>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="glass-morphism p-10 rounded-[3rem] border border-white/20 shadow-premium">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-br from-pgreen to-fgreen rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Sparkles size={32} className="text-white" />
              </div>
              <h2 className="font-display text-4xl font-black text-gray-900 mb-3 tracking-tight leading-[1.3]">
                Tạo tài khoản
              </h2>
              <p className="text-gray-600 font-medium">
                Bắt đầu hành trình sáng tạo của bạn ngay hôm nay
              </p>
            </div>

            <div className="space-y-6">
              <button
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="w-full h-16 bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-2xl font-bold text-gray-900 flex items-center justify-center gap-3 transition-all hover:shadow-lg hover:scale-[1.02] active:scale-95"
              >
                <Globe size={24} className="text-blue-600" />
                Đăng ký với Google
              </button>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                    Hoặc
                  </span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 font-medium">
                  Bạn đã có tài khoản?{" "}
                  <Link 
                    href="/auth/login" 
                    className="text-pgreen font-black hover:text-fgreen transition-colors underline decoration-2 underline-offset-4"
                  >
                    Đăng nhập ngay
                  </Link>
                </p>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  Bằng việc đăng ký, bạn đồng ý với{" "}
                  <a href="#" className="text-pgreen hover:underline font-semibold">
                    Điều khoản dịch vụ
                  </a>{" "}
                  và{" "}
                  <a href="#" className="text-pgreen hover:underline font-semibold">
                    Chính sách bảo mật
                  </a>{" "}
                  của chúng tôi.
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Stats */}
          <div className="lg:hidden grid grid-cols-2 gap-4 mt-8">
            <div className="glass-morphism p-6 rounded-2xl border border-white/20 text-center">
              <div className="text-2xl font-black text-gray-900 mb-1">10,000+</div>
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Thành viên</div>
            </div>
            <div className="glass-morphism p-6 rounded-2xl border border-white/20 text-center">
              <div className="text-2xl font-black text-gray-900 mb-1">5,000+</div>
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Dự án</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
