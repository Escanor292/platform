"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { LogIn, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-20">
      <div className="max-w-md w-full">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-green-600 font-bold mb-8 transition">
           <ArrowLeft size={20} />
           Quay lại trang chủ
        </Link>
        
        <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-gray-100">
           <div className="text-center mb-10">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-green-200 mx-auto mb-6">
                 C
              </div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Chào mừng trở lại!</h1>
              <p className="text-gray-400 mt-2 font-medium">Đăng nhập để tiếp tục hành trình của bạn.</p>
           </div>

           <button 
             onClick={() => signIn("google", { callbackUrl: "/dashboard/backer" })}
             className="w-full flex items-center justify-center gap-4 py-4 bg-white border-2 border-gray-100 rounded-2xl font-black text-gray-700 hover:bg-gray-50 hover:border-gray-200 transition active:scale-95 shadow-sm"
           >
             <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-6 h-6" alt="Google logo" />
             Đăng nhập với Google
           </button>

           <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                 <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-xs font-black uppercase text-gray-400 tracking-widest bg-white px-4">
                 Hoặc
              </div>
           </div>

           <div className="space-y-4">
              <input 
                type="email" 
                placeholder="Email của bạn" 
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-green-500 outline-none transition"
              />
              <button className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition active:scale-95 shadow-xl">
                 Tiếp tục với Email
              </button>
           </div>
           
           <p className="text-center mt-10 text-sm text-gray-400 font-medium">
              Chưa có tài khoản? {" "}
              <Link href="/auth/register" className="text-green-600 font-bold hover:underline">Đăng ký ngay</Link>
           </p>
        </div>
      </div>
    </div>
  );
}
