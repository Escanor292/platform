import Link from "next/link";
import { Facebook, Instagram, Mail } from "lucide-react";
import LeafIcon from "./LeafIcon";

export default function FooterNew() {
  return (
    <footer id="ho-tro" className="bg-dblue px-6 py-12 text-white transition-colors duration-300" style={{ backgroundColor: "var(--profile-shell-primary, #1F4E79)", color: "var(--profile-contrast, #ffffff)" }}>
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg gradient-green flex items-center justify-center ring-1 ring-white/20">
              <LeafIcon className="w-5 h-5" />
            </div>
            <span className="font-display text-lg font-bold">TửTế Fund</span>
          </div>
          <p className="text-sm leading-relaxed opacity-60" style={{ color: "var(--profile-contrast, #ffffff)" }}>
            Lấy sự tử tế trồng tương lai. Nền tảng gây quỹ cộng đồng minh bạch #2 Việt Nam.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-sm">Khám phá</h4>
          <div className="space-y-2 text-sm opacity-60" style={{ color: "var(--profile-contrast, #ffffff)" }}>
            <Link href="/campaigns" className="block cursor-pointer transition hover:opacity-100">
              Chiến dịch
            </Link>
            <Link href="/gioi-thieu" className="block cursor-pointer transition hover:opacity-100">
              Giới thiệu
            </Link>
            <Link href="/lookup" className="block cursor-pointer transition hover:opacity-100">
              Tra cứu
            </Link>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-sm">Hỗ trợ</h4>
          <div className="space-y-2 text-sm opacity-60" style={{ color: "var(--profile-contrast, #ffffff)" }}>
            <Link href="/huong-dan/creator" className="block cursor-pointer transition hover:opacity-100">
              Hướng dẫn Creator
            </Link>
            <Link href="/policy/terms" className="block cursor-pointer transition hover:opacity-100">
              Điều khoản sử dụng
            </Link>
            <Link href="/policy/privacy" className="block cursor-pointer transition hover:opacity-100">
              Chính sách bảo mật
            </Link>
            <Link href="/policy/refund" className="block cursor-pointer transition hover:opacity-100">
              Hoàn tiền
            </Link>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-sm">Liên hệ</h4>
          <div className="space-y-2 text-sm opacity-60" style={{ color: "var(--profile-contrast, #ffffff)" }}>
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

      <div className="mx-auto mt-8 max-w-7xl border-t border-white/10 pt-6 text-center text-xs opacity-40" style={{ color: "var(--profile-contrast, #ffffff)" }}>
        © 2024 TửTế Fund. Mọi quyền được bảo lưu.
      </div>
    </footer>
  );
}
