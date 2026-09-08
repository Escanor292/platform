import Link from "next/link";
import { HeartHandshake, Eye, ShieldCheck, Users, Sparkles, HandHeart, ArrowRight, CheckCircle2 } from "lucide-react";
import { buildSocialMetadata } from "@/lib/seo";

export const metadata = buildSocialMetadata({
  title: "Giới thiệu",
  description: "Tử Tế Fund kết nối người có ý tưởng, dự án hoặc hoàn cảnh cần hỗ trợ với cộng đồng sẵn sàng đồng hành.",
  path: "/gioi-thieu",
});

export default function GioiThieuPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden px-6 py-20 md:py-28"
        style={{
          background: 'linear-gradient(180deg, #F8F7F2 0%, #f0f8f4 50%, #F8F7F2 100%)'
        }}
      >
        {/* Background decorative elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[5%] top-10 h-80 w-80 rounded-full bg-gradient-to-br from-pgreen/20 via-pgreen/8 to-transparent blur-3xl opacity-70" />
          <div className="absolute right-[8%] top-32 h-80 w-80 rounded-full bg-gradient-to-tl from-tblue/15 via-transparent to-transparent blur-3xl opacity-60" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full bg-white/55 px-5 py-2.5 text-xs font-bold text-pgreen shadow-lg backdrop-blur-md border border-white/70">
              Về TửTế Fund
            </div>
            <h1 className="font-display mb-5 font-black text-4xl text-dblue md:text-5xl lg:text-6xl">
              Nơi sự tử tế được <span className="bg-gradient-to-r from-pgreen via-fgreen to-tblue bg-clip-text text-transparent">gieo mầm</span> và lan tỏa
            </h1>
            <p className="mx-auto mb-10 max-w-3xl text-lg text-gray-600 leading-relaxed">
              TửTế Fund kết nối những người có ý tưởng, dự án hoặc hoàn cảnh cần hỗ trợ với cộng đồng sẵn sàng đồng hành bằng niềm tin và sự minh bạch.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/projects"
                className="rounded-3xl bg-gradient-to-r from-pgreen to-fgreen px-8 py-4 font-bold text-white transition-all hover:shadow-lg hover:shadow-green-200"
              >
                Khám phá chiến dịch
              </Link>
              <Link
                href="/campaigns/create"
                className="rounded-3xl border-2 border-pgreen/20 bg-white px-8 py-4 font-bold text-dblue transition-all hover:border-pgreen/40 hover:text-pgreen"
              >
                Bắt đầu gây quỹ
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TửTế Fund là gì? */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="flex flex-col justify-center">
              <h2 className="font-display mb-6 font-bold text-3xl text-dblue md:text-4xl">
                TửTế Fund là gì?
              </h2>
              <p className="mb-6 text-lg text-gray-600 leading-relaxed">
                TửTế Fund là nền tảng gây quỹ cộng đồng giúp các cá nhân, nhóm và tổ chức chia sẻ câu chuyện, tạo chiến dịch, nhận ủng hộ và cập nhật tiến độ minh bạch đến cộng đồng.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Chúng tôi tin rằng mọi câu chuyện tử tế đều xứng đáng được lắng nghe, được tin tưởng và được cộng đồng chung tay biến thành hành động thực tế.
              </p>
            </div>
            <div className="glass rounded-3xl p-8 shadow-soft">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pgreen/10">
                    <Sparkles className="h-6 w-6 text-pgreen" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-dblue">Tạo chiến dịch</h3>
                    <p className="text-sm text-gray-600">Chia sẻ ý tưởng và mục tiêu của bạn với cộng đồng</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pgreen/10">
                    <HeartHandshake className="h-6 w-6 text-pgreen" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-dblue">Nhận ủng hộ</h3>
                    <p className="text-sm text-gray-600">Kết nối với những người sẵn sàng đồng hành cùng bạn</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-tblue/10">
                    <Eye className="h-6 w-6 text-tblue" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-dblue">Cập nhật minh bạch</h3>
                    <p className="text-sm text-gray-600">Theo dõi tiến độ và báo cáo sử dụng quỹ rõ ràng</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sứ mệnh và Tầm nhìn */}
      <section className="px-6 py-20 bg-cream">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="font-display mb-4 font-bold text-3xl text-dblue md:text-4xl">
              Sứ mệnh & Tầm nhìn
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              Chúng tôi hướng tới một cộng đồng nơi niềm tin được xây dựng bằng minh bạch và trách nhiệm
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="glass rounded-3xl p-8 shadow-soft">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-pgreen/10">
                <HandHeart className="h-8 w-8 text-pgreen" />
              </div>
              <h3 className="font-display mb-4 font-bold text-2xl text-dblue">Sứ mệnh</h3>
              <p className="text-gray-600 leading-relaxed">
                Giúp mọi câu chuyện tử tế có cơ hội được lắng nghe, được tin tưởng và được cộng đồng chung tay biến thành hành động thực tế.
              </p>
            </div>
            <div className="glass rounded-3xl p-8 shadow-soft">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-tblue/10">
                <Eye className="h-8 w-8 text-tblue" />
              </div>
              <h3 className="font-display mb-4 font-bold text-2xl text-dblue">Tầm nhìn</h3>
              <p className="text-gray-600 leading-relaxed">
                Trở thành nền tảng gây quỹ cộng đồng minh bạch, an toàn và gần gũi, nơi niềm tin được xây dựng bằng dữ liệu, cập nhật và trách nhiệm.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Giá trị cốt lõi */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="font-display mb-4 font-bold text-3xl text-dblue md:text-4xl">
              Giá trị cốt lõi
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              Những nguyên tắc định hình mọi hành động của chúng tôi
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="glass rounded-3xl p-6 shadow-soft transition-all hover:-translate-y-1">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-tblue/10">
                <Eye className="h-7 w-7 text-tblue" />
              </div>
              <h3 className="mb-2 font-bold text-dblue">Minh bạch</h3>
              <p className="text-sm text-gray-600">Mỗi chiến dịch cần trình bày mục tiêu, tiến độ và cập nhật rõ ràng.</p>
            </div>
            <div className="glass rounded-3xl p-6 shadow-soft transition-all hover:-translate-y-1">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-pgreen/10">
                <ShieldCheck className="h-7 w-7 text-pgreen" />
              </div>
              <h3 className="mb-2 font-bold text-dblue">Tin cậy</h3>
              <p className="text-sm text-gray-600">Hệ thống hướng đến xác minh, kiểm duyệt và bảo vệ người dùng.</p>
            </div>
            <div className="glass rounded-3xl p-6 shadow-soft transition-all hover:-translate-y-1">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-ebrown/10">
                <Users className="h-7 w-7 text-ebrown" />
              </div>
              <h3 className="mb-2 font-bold text-dblue">Kết nối</h3>
              <p className="text-sm text-gray-600">Creator và Backer có thể theo dõi, tương tác và đồng hành.</p>
            </div>
            <div className="glass rounded-3xl p-6 shadow-soft transition-all hover:-translate-y-1">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-pgreen/10">
                <HeartHandshake className="h-7 w-7 text-pgreen" />
              </div>
              <h3 className="mb-2 font-bold text-dblue">Nhân văn</h3>
              <p className="text-sm text-gray-600">Mỗi đóng góp dù nhỏ đều có thể tạo nên thay đổi.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cách nền tảng hoạt động */}
      <section className="px-6 py-20 bg-cream">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="font-display mb-4 font-bold text-3xl text-dblue md:text-4xl">
              Cách nền tảng hoạt động
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              Ba bước đơn giản để bắt đầu hành trình gây quỹ của bạn
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="relative">
              <div className="glass rounded-3xl p-8 shadow-soft">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pgreen to-fgreen text-white font-display font-bold text-2xl">
                  1
                </div>
                <h3 className="font-display mb-3 font-bold text-xl text-dblue">Chia sẻ câu chuyện</h3>
                <p className="text-gray-600">
                  Creator tạo chiến dịch, trình bày mục tiêu, hình ảnh và kế hoạch sử dụng quỹ.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="glass rounded-3xl p-8 shadow-soft">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-fgreen to-tblue text-white font-display font-bold text-2xl">
                  2
                </div>
                <h3 className="font-display mb-3 font-bold text-xl text-dblue">Cộng đồng đồng hành</h3>
                <p className="text-gray-600">
                  Backer tìm kiếm, ủng hộ, theo dõi tiến độ và nhận cập nhật.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="glass rounded-3xl p-8 shadow-soft">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-tblue to-ebrown text-white font-display font-bold text-2xl">
                  3
                </div>
                <h3 className="font-display mb-3 font-bold text-xl text-dblue">Minh bạch kết quả</h3>
                <p className="text-gray-600">
                  Chiến dịch cập nhật tiến độ, báo cáo sử dụng quỹ và duy trì niềm tin với cộng đồng.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cam kết minh bạch và an toàn */}
      <section className="px-6 py-20 bg-cream">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="font-display mb-4 font-bold text-3xl text-dblue md:text-4xl">
              Cam kết minh bạch & an toàn
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              Chúng tôi hướng đến quy trình rõ ràng, dễ theo dõi và có cơ chế hỗ trợ kiểm tra thông tin
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="glass rounded-3xl p-6 shadow-soft transition-all hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pgreen/10">
                  <CheckCircle2 className="h-5 w-5 text-pgreen" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-dblue">Theo dõi tiến độ</h3>
                  <p className="text-sm text-gray-600">Cập nhật thường xuyên về tiến độ chiến dịch</p>
                </div>
              </div>
            </div>
            <div className="glass rounded-3xl p-6 shadow-soft transition-all hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tblue/10">
                  <CheckCircle2 className="h-5 w-5 text-tblue" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-dblue">Cập nhật từ Creator</h3>
                  <p className="text-sm text-gray-600">Nhận thông tin trực tiếp từ người tạo chiến dịch</p>
                </div>
              </div>
            </div>
            <div className="glass rounded-3xl p-6 shadow-soft transition-all hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pgreen/10">
                  <CheckCircle2 className="h-5 w-5 text-pgreen" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-dblue">Kiểm tra giao dịch</h3>
                  <p className="text-sm text-gray-600">Theo dõi thông tin ủng hộ minh bạch</p>
                </div>
              </div>
            </div>
            <div className="glass rounded-3xl p-6 shadow-soft transition-all hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tblue/10">
                  <ShieldCheck className="h-5 w-5 text-tblue" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-dblue">Hỗ trợ KYC</h3>
                  <p className="text-sm text-gray-600">Quy trình xác minh danh tính khi cần thiết</p>
                </div>
              </div>
            </div>
            <div className="glass rounded-3xl p-6 shadow-soft transition-all hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pgreen/10">
                  <CheckCircle2 className="h-5 w-5 text-pgreen" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-dblue">Báo cáo vi phạm</h3>
                  <p className="text-sm text-gray-600">Cơ chế báo cáo và xử lý khi cần thiết</p>
                </div>
              </div>
            </div>
            <div className="glass rounded-3xl p-6 shadow-soft transition-all hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ebrown/10">
                  <ShieldCheck className="h-5 w-5 text-ebrown" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-dblue">Bảo mật thông tin</h3>
                  <p className="text-sm text-gray-600">Dữ liệu được bảo vệ và xử lý an toàn</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="relative overflow-hidden px-6 py-20"
        style={{
          background: 'linear-gradient(135deg, #2E8B57 0%, #6BCB77 50%, #2F80ED 100%)'
        }}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[10%] top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-[10%] bottom-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <h2 className="font-display mb-4 font-black text-3xl text-white md:text-4xl">
            Sẵn sàng lan tỏa một câu chuyện tử tế?
          </h2>
          <p className="mb-8 text-lg text-white/90">
            Khám phá các chiến dịch đang cần sự đồng hành hoặc bắt đầu hành trình gây quỹ của bạn ngay hôm nay.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/projects"
              className="rounded-3xl bg-white px-8 py-4 font-bold text-pgreen transition-all hover:shadow-lg"
            >
              Khám phá chiến dịch
            </Link>
            <Link
              href="/campaigns/create"
              className="rounded-3xl border-2 border-white px-8 py-4 font-bold text-white transition-all hover:bg-white/10"
            >
              Bắt đầu gây quỹ
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
