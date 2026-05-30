import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GioiThieuPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pgreen-600 to-pgreen-500 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Về TừTế Fund
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            Nền tảng gây quỹ cộng đồng đáng tin cậy, kết nối những ý tưởng đột phá với những người ủng hộ nhiệt huyết
          </p>
        </div>
      </section>

      {/* Sứ mệnh */}
      <section className="py-16 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Sứ mệnh của chúng tôi</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            TừTế Fund được thành lập với sứ mệnh đơn giản nhưng mạnh mẽ: <strong>Kết nối</strong> những người có ý tưởng đột phá với những người muốn góp phần tạo ra thay đổi tích cực. Chúng tôi tin rằng mọi dự án xứng đáng đều nên có cơ hội hiện thực hóa, và mọi người ủng hộ đều xứng đáng nhận được sự minh bạch và tin cậy.
          </p>
        </div>
      </section>

      {/* Lợi ích cho Creator */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Lợi ích cho Creator
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-pgreen-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-pgreen-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Gây quỹ dễ dàng</h3>
              <p className="text-gray-600">Tạo chiến dịch trong vài phút với công cụ thân thiện, không cần kỹ thuật chuyên sâu</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-pgreen-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-pgreen-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Tiếp cận cộng đồng</h3>
              <p className="text-gray-600">Kết nối với hàng ngàn người ủng hộ tiềm năng sẵn sàng hỗ trợ dự án của bạn</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-pgreen-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-pgreen-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Bảo vệ uy tín</h3>
              <p className="text-gray-600">Hệ thống đánh giá và xác minh giúp xây dựng niềm tin với cộng đồng</p>
            </div>
          </div>
        </div>
      </section>

      {/* Lợi ích cho Backer */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Lợi ích cho Backer
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-pgreen-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-pgreen-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Minh bạch thông tin</h3>
              <p className="text-gray-600">Theo dõi tiến độ và cập nhật từ creator một cách rõ ràng, chi tiết</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-pgreen-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-pgreen-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Phần thưởng hấp dẫn</h3>
              <p className="text-gray-600">Nhận những phần thưởng độc đáo từ creator như lời cảm ơn cho sự ủng hộ</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-pgreen-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-pgreen-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">An toàn & Bảo mật</h3>
              <p className="text-gray-600">Hệ thống thanh toán bảo mật, tiền được giữ trong escrow cho đến khi đạt mục tiêu</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cam kết */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Cam kết của chúng tôi
          </h2>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-pgreen-600 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Minh bạch tuyệt đối</h3>
                <p className="text-gray-600">Mọi giao dịch và tiến độ đều được công khai, bạn luôn biết tiền của mình đang được sử dụng như thế nào</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-pgreen-600 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Bảo vệ người dùng</h3>
                <p className="text-gray-600">Chính sách hoàn tiền và quy trình giải quyết tranh chấp công bằng, bảo vệ quyền lợi của cả creator và backer</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-pgreen-600 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Hỗ trợ 24/7</h3>
                <p className="text-gray-600">Đội ngũ hỗ trợ luôn sẵn sàng giải đáp mọi thắc mắc và hỗ trợ bạn trong suốt quá trình</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pgreen-600 to-pgreen-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Sẵn sàng bắt đầu?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Khám phá các chiến dịch thú vị hoặc bắt đầu gây quỹ cho dự án của bạn ngay hôm nay
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/projects">
              <Button size="lg" className="bg-white text-pgreen-600 hover:bg-gray-100">
                Khám phá chiến dịch
              </Button>
            </Link>
            <Link href="/campaigns/create">
              <Button size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-pgreen-600">
                Gây quỹ ngay
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
