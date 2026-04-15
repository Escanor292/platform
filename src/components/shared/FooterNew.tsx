import Link from "next/link";
import { Facebook, Instagram, Mail } from "lucide-react";
import LeafIcon from "./LeafIcon";

export default function FooterNew() {
  return (
    <footer className="bg-dblue text-white py-12 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg gradient-green flex items-center justify-center">
              <LeafIcon className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-lg">TửTế Fund</span>
          </div>
          <p className="text-white/50 text-sm leading-relaxed">
            Lấy sự tử tế trồng tương lai. Nền tảng gây quỹ cộng đồng minh bạch #1 Việt Nam.
          </p>
        </div>

        {/* Khám phá */}
        <div>
          <h4 className="font-semibold mb-4 text-sm">Khám phá</h4>
          <div className="space-y-2 text-sm text-white/50">
            <Link href="/campaigns" className="block cursor-pointer hover:text-white transition">
              Chiến dịch
            </Link>
            <Link href="/about" className="block cursor-pointer hover:text-white transition">
              Giới thiệu
            </Link>
            <Link href="/lookup" className="block cursor-pointer hover:text-white transition">
              Tra cứu
            </Link>
          </div>
        </div>

        {/* Hỗ trợ */}
        <div>
          <h4 className="font-semibold mb-4 text-sm">Hỗ trợ</h4>
          <div className="space-y-2 text-sm text-white/50">
            <p className="cursor-pointer hover:text-white transition">Trung tâm trợ giúp</p>
            <p className="cursor-pointer hover:text-white transition">Điều khoản sử dụng</p>
            <p className="cursor-pointer hover:text-white transition">Chính sách bảo mật</p>
          </div>
        </div>

        {/* Liên hệ */}
        <div>
          <h4 className="font-semibold mb-4 text-sm">Liên hệ</h4>
          <div className="space-y-2 text-sm text-white/50">
            <p>hello@tutefund.vn</p>
            <p>1900 xxxx</p>
            <div className="flex gap-3 mt-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition">
                <Facebook className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition">
                <Instagram className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition">
                <Mail className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/10 text-center text-xs text-white/30">
        © 2024 TửTế Fund. Mọi quyền được bảo lưu.
      </div>
    </footer>
  );
}
