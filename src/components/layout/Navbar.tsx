"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { 
  Rocket, 
  Search, 
  User, 
  LogOut, 
  LayoutDashboard, 
  PlusCircle, 
  Menu, 
  X, 
  Settings
} from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white group-hover:rotate-6 transition-transform">
             <Rocket size={24} />
          </div>
          <span className="text-xl font-black text-gray-900 tracking-tighter uppercase italic">Crowdfund<span className="text-blue-600">VN</span></span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/campaigns" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition">Khám phá</Link>
          <Link href="/lookup" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition">Tra cứu GD</Link>
        </div>

        {/* Auth Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/campaigns/create" className="px-6 py-2 bg-gray-900 text-white text-sm font-black rounded-full hover:bg-blue-600 transition flex items-center gap-2 shadow-sm">
            <PlusCircle size={18} />
            Khởi tạo
          </Link>

          {session ? (
            <div className="flex items-center gap-4 pl-4 border-l">
               <Link href="/dashboard" className="flex items-center gap-2 text-sm font-bold text-gray-900 hover:text-blue-600 transition">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                     <User size={18} className="text-gray-500" />
                  </div>
                  Dashboard
               </Link>
               <button 
                  onClick={() => signOut()}
                  className="p-2 text-gray-400 hover:text-red-500 transition"
                  title="Đăng xuất"
               >
                  <LogOut size={20} />
               </button>
            </div>
          ) : (
            <Link href="/auth/login" className="px-6 py-2 bg-gray-100 text-gray-900 text-sm font-black rounded-full hover:bg-gray-200 transition">
              Đăng nhập
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2 text-gray-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-18 left-0 w-full bg-white border-b border-gray-100 p-6 flex flex-col gap-6 shadow-xl animate-in slide-in-from-top duration-300">
          <Link href="/campaigns" className="text-lg font-black text-gray-900" onClick={() => setIsMenuOpen(false)}>Khám phá</Link>
          <Link href="/lookup" className="text-lg font-black text-gray-900" onClick={() => setIsMenuOpen(false)}>Tra cứu GD</Link>
          <Link href="/campaigns/create" className="w-full py-4 bg-blue-600 text-white rounded-2xl text-center font-black" onClick={() => setIsMenuOpen(false)}>Tạo dự án</Link>
          <div className="h-px bg-gray-100" />
          {session ? (
             <>
                <Link href="/dashboard" className="text-lg font-black text-gray-900" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                <button onClick={() => signOut()} className="text-lg font-black text-red-500 text-left">Đăng xuất</button>
             </>
          ) : (
             <Link href="/auth/login" className="text-lg font-black text-gray-900" onClick={() => setIsMenuOpen(false)}>Đăng nhập</Link>
          )}
        </div>
      )}
    </nav>
  );
}
