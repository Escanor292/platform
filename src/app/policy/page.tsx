import Link from "next/link";
import { ArrowLeft, BookOpen, FileText, Shield, Users } from "lucide-react";

const ITEMS = [
  {
    href: "/policy/terms",
    title: "Điều khoản sử dụng",
    desc: "Quy tắc dùng sàn, vai trò Tử Tế Fund và cấm gây quỹ giả.",
    icon: FileText,
  },
  {
    href: "/policy/privacy",
    title: "Chính sách bảo mật",
    desc: "Dữ liệu tài khoản, KYC/eKYC, thanh toán và quyền của bạn.",
    icon: Shield,
  },
  {
    href: "/policy/creator",
    title: "Điều khoản Creator",
    desc: "KYC trước khi public, nhóm chiến dịch A/B, hoàn tiền và thuế.",
    icon: Users,
  },
  {
    href: "/policy/refund",
    title: "Chính sách hoàn tiền",
    desc: "Khi nào hoàn, khi nào không, và quy trình đối soát cổng thanh toán.",
    icon: FileText,
  },
  {
    href: "/huong-dan/creator",
    title: "Hướng dẫn phân loại chiến dịch",
    desc: "Nhóm A (không quà) và nhóm B (pre-order / có quà). Không phải tư vấn pháp lý.",
    icon: BookOpen,
  },
];

export default function PolicyIndexPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 pb-32 md:pb-16 min-h-screen">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-pgreen mb-8 transition"
      >
        <ArrowLeft size={16} />
        Quay lại trang chủ
      </Link>

      <h1 className="font-display text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
        Trung tâm chính sách
      </h1>
      <p className="text-gray-500 text-lg leading-relaxed mb-10">
        Tử Tế Fund là nền tảng trung gian thanh toán VND và quản lý chiến dịch.
        Không phải quỹ từ thiện theo NĐ 93.
      </p>

      <div className="grid gap-4">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex gap-4 bg-white rounded-[1.75rem] border border-gray-100 p-6 hover:border-pgreen/40 hover:shadow-sm transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-pgreen/10 text-pgreen flex items-center justify-center shrink-0">
                <Icon size={22} />
              </div>
              <div>
                <h2 className="font-black text-gray-900 mb-1">{item.title}</h2>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
