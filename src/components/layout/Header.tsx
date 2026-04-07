"use client";

import Link from "next/link";
import { User, LogIn, Search } from "lucide-react";
import { useSession } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 hidden md:block">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg shadow-green-200">
              C
            </div>
            <span className="text-xl font-black tracking-tighter text-gray-900 uppercase">
              CF VN
            </span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="/campaigns" className="text-gray-500 hover:text-green-600 font-bold transition-colors text-sm">
              Khám phá
            </Link>
            <Link href="/lookup" className="text-gray-500 hover:text-green-600 font-bold transition-colors text-sm">
              Tra cứu GD
            </Link>
             <Link href="/policy/refund" className="text-gray-500 hover:text-green-600 font-bold transition-colors text-sm">
              Chính sách
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Tìm dự án..." 
              className="bg-gray-100 border-none rounded-full px-4 py-2 text-sm w-48 focus:w-64 transition-all focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          {!session ? (
            <Link 
              href="/auth/login" 
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full font-bold hover:bg-green-700 transition shadow-sm"
            >
              <LogIn size={18} />
              <span className="text-sm">Đăng nhập</span>
            </Link>
          ) : (
             <Link 
              href="/dashboard/backer" 
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-900 rounded-full font-bold hover:bg-gray-200 transition"
            >
              <User size={18} />
              <span className="text-sm">Hi, {session.user?.name?.split(' ')[0]}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
