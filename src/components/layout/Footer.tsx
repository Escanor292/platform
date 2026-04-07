import Link from "next/link";
import { Mail, Facebook, Github, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 pt-16 pb-32 md:pb-16 px-6 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <div className="text-xl font-black text-gray-900 mb-6 uppercase italic">
            Crowdfund<span className="text-blue-600">VN</span>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
            Nền tảng gọi vốn cộng đồng hàng đầu Việt Nam. Chúng tôi kết nối những ý tưởng táo bạo với sự hỗ trợ từ cộng đồng.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-black text-gray-900 uppercase mb-6 tracking-widest">Nền tảng</h4>
          <ul className="space-y-4 text-sm font-bold text-gray-500">
            <li><Link href="/campaigns" className="hover:text-blue-600 transition">Khám phá</Link></li>
            <li><Link href="/campaigns/create" className="hover:text-blue-600 transition">Tạo dự án</Link></li>
            <li><Link href="/lookup" className="hover:text-blue-600 transition">Tra cứu</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-black text-gray-900 uppercase mb-6 tracking-widest">Pháp lý</h4>
          <ul className="space-y-4 text-sm font-bold text-gray-500">
            <li><Link href="/policy/terms" className="hover:text-blue-600 transition">Điều khoản</Link></li>
            <li><Link href="/policy/privacy" className="hover:text-blue-600 transition">Quyền riêng tư</Link></li>
            <li><Link href="/policy/refund" className="hover:text-blue-600 transition">Hoàn tiền</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-black text-gray-900 uppercase mb-6 tracking-widest">Liên hệ</h4>
          <div className="flex gap-4 mb-6">
            <a href="#" className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-blue-600 transition">
               <Facebook size={20} />
            </a>
            <a href="#" className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition">
               <Twitter size={20} />
            </a>
            <a href="#" className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition">
               <Mail size={20} />
            </a>
          </div>
          <div className="text-sm font-bold text-gray-900">support@cfvn.vn</div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-200 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
        © 2026 Crowdfunding VN. All rights reserved. Made in Vietnam.
      </div>
    </footer>
  );
}
