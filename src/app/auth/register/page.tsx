"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { UserPlus, Sparkles, Rocket } from "lucide-react";
import { useState } from "react";

export default function RegisterPage() {
  const [role, setRole] = useState<"BACKER" | "CREATOR">("BACKER");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-20">
      <div className="max-w-xl w-full">
        <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-2xl border border-gray-100">
           <div className="text-center mb-12">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">Tham gia cộng đồng 🌟</h1>
              <p className="text-gray-400 font-medium leading-relaxed max-w-sm mx-auto">
                Bắt đầu hành trình sáng tạo hoặc ủng hộ những dự án tuyệt vời tại Việt Nam.
              </p>
           </div>

           <div className="grid grid-cols-2 gap-4 mb-10">
              <button 
                onClick={() => setRole("BACKER")}
                className={`p-6 rounded-[2rem] border-2 transition flex flex-col items-center gap-3 ${role === "BACKER" ? "border-green-600 bg-green-50 shadow-lg" : "border-gray-50 bg-gray-50/50 hover:border-gray-100"}`}
              >
                 <Sparkles className={role === "BACKER" ? "text-green-600" : "text-gray-400"} size={28} />
                 <span className="text-sm font-black uppercase tracking-widest text-gray-900">Backer</span>
              </button>
              <button 
                onClick={() => setRole("CREATOR")}
                className={`p-6 rounded-[2rem] border-2 transition flex flex-col items-center gap-3 ${role === "CREATOR" ? "border-green-600 bg-green-50 shadow-lg" : "border-gray-50 bg-gray-50/50 hover:border-gray-100"}`}
              >
                 <Rocket className={role === "CREATOR" ? "text-green-600" : "text-gray-400"} size={28} />
                 <span className="text-sm font-black uppercase tracking-widest text-gray-900">Creator</span>
              </button>
           </div>

           <button 
             onClick={() => signIn("google", { callbackUrl: role === "CREATOR" ? "/dashboard/creator" : "/dashboard/backer" })}
             className="w-full flex items-center justify-center gap-4 py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition active:scale-95 shadow-xl"
           >
             <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-6 h-6 invert" alt="Google logo" />
             Đăng ký bằng Google
           </button>

           <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                 <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-xs font-black uppercase text-gray-400 tracking-widest bg-white px-4">
                 Hoặc đăng ký bằng Email
              </div>
           </div>

           <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Họ và tên" 
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-green-500 outline-none transition"
              />
              <input 
                type="email" 
                placeholder="Email tham gia" 
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-green-500 outline-none transition"
              />
              <button className="w-full py-4 bg-white border-2 border-gray-900 text-gray-900 font-black rounded-2xl hover:bg-gray-50 transition active:scale-95">
                 Gửi yêu cầu đăng ký
              </button>
           </div>
           
           <p className="text-center mt-12 text-xs text-gray-400 font-medium">
              Bằng việc đăng ký, bạn đồng ý với <Link href="/policy/terms" className="text-green-600 font-bold hover:underline">Điều khoản dịch vụ</Link> và <Link href="/policy/privacy" className="text-green-600 font-bold hover:underline">Chính sách bảo mật</Link> của chúng tôi.
           </p>
        </div>

        <p className="text-center mt-12 text-sm text-gray-400 font-bold">
           Đã có tài khoản? {" "}
           <Link href="/auth/login" className="text-gray-900 hover:text-green-600 transition">Đăng nhập ngay</Link>
        </p>
      </div>
    </div>
  );
}
