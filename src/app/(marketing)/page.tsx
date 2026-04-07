import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CrowdFund VN - Nền tảng gây quỹ cộng đồng Việt Nam",
  description:
    "Biến ý tưởng của bạn thành hiện thực với sự hỗ trợ từ cộng đồng. Khởi chạy dự án sáng tạo, kết nối backer và nhận tài trợ minh bạch.",
};

export default function MarketingHomePage() {
  const stats = [
    { label: "Dự án thành công", value: "1,200+" },
    { label: "Tổng số người ủng hộ", value: "85,000+" },
    { label: "Tổng số tiền huy động", value: "₫48 tỷ+" },
  ];

  const features = [
    {
      icon: "🛡️",
      title: "Thanh toán an toàn",
      desc: "Tiền được giữ escrow, chỉ giải ngân khi đạt mục tiêu.",
    },
    {
      icon: "👥",
      title: "Cộng đồng mạnh mẽ",
      desc: "Hàng chục nghìn backer sẵn sàng ủng hộ ý tưởng của bạn.",
    },
    {
      icon: "📊",
      title: "Minh bạch 100%",
      desc: "Tra cứu giao dịch công khai theo mã tham chiếu bất kỳ lúc nào.",
    },
    {
      icon: "⚡",
      title: "Dễ dàng khởi đầu",
      desc: "Tạo campaign trong vài phút, nhận tiền trong vài ngày.",
    },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white py-32 px-6 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
        <div className="relative max-w-4xl mx-auto">
          <span className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            🇻🇳 Nền tảng gây quỹ #1 Việt Nam
          </span>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Biến ý tưởng thành{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
              hiện thực
            </span>
          </h1>
          <p className="text-xl text-indigo-200 mb-10 max-w-2xl mx-auto">
            Kết nối sáng tạo với cộng đồng. Gây quỹ minh bạch, an toàn và hiệu quả.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/campaigns/create"
              className="bg-white text-indigo-900 font-semibold px-8 py-4 rounded-xl hover:bg-indigo-50 transition-all duration-200"
            >
              Bắt đầu gây quỹ →
            </Link>
            <Link
              href="/campaigns"
              className="border border-white/40 text-white px-8 py-4 rounded-xl hover:bg-white/10 transition-all duration-200"
            >
              Khám phá dự án
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-14 border-b">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-bold text-indigo-700">{s.value}</p>
              <p className="text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gray-50 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Tại sao chọn CrowdFund VN?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex gap-4"
              >
                <div className="text-4xl">{f.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-gray-500 text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-indigo-700 text-white text-center px-6">
        <h2 className="text-3xl font-bold mb-4">Sẵn sàng bắt đầu?</h2>
        <p className="text-indigo-200 mb-8">
          Hàng nghìn creator đã tin tưởng CrowdFund VN. Đến lượt bạn!
        </p>
        <Link
          href="/auth/register"
          className="bg-white text-indigo-700 font-semibold px-10 py-4 rounded-xl hover:bg-indigo-50 transition"
        >
          Tạo tài khoản miễn phí
        </Link>
      </section>
    </main>
  );
}
