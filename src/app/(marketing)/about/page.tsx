import Link from "next/link";
import { Target, Heart, Users, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section 
        className="pt-32 pb-20 px-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #F8F7F2 0%, #f0f8f4 50%, #F8F7F2 100%)'
        }}
      >
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div 
            className="absolute top-10 left-[5%] w-96 h-96 bg-gradient-to-br from-fgreen/20 via-fgreen/8 to-transparent rounded-full blur-3xl opacity-70"
            style={{ animation: 'pulse 8s ease-in-out infinite' }}
          />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pgreen/10 text-pgreen text-xs font-semibold mb-6">
            Về chúng tôi
          </div>
          <h1 className="font-display font-extrabold text-5xl lg:text-6xl text-dblue mb-6" style={{ lineHeight: '1.3' }}>
            Gieo mầm tử tế, nuôi dưỡng tương lai
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            TửTế Fund ra đời với sứ mệnh kết nối những trái tim tử tế với những câu chuyện cần được lắng nghe. 
            Chúng tôi tin rằng mỗi đóng góp nhỏ đều có thể tạo nên thay đổi lớn.
          </p>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="glass rounded-3xl p-8 card-hover">
              <div className="w-14 h-14 rounded-2xl gradient-green flex items-center justify-center mb-4">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-display font-bold text-xl text-dblue mb-3">Sứ mệnh</h3>
              <p className="text-gray-500 leading-relaxed">
                Xây dựng nền tảng gây quỹ cộng đồng minh bạch, an toàn, nơi mọi người có thể biến ý tưởng thành hiện thực thông qua sức mạnh tập thể.
              </p>
            </div>

            <div className="glass rounded-3xl p-8 card-hover">
              <div className="w-14 h-14 rounded-2xl gradient-blue flex items-center justify-center mb-4">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-display font-bold text-xl text-dblue mb-3">Giá trị cốt lõi</h3>
              <p className="text-gray-500 leading-relaxed">
                Tử tế – Minh bạch – Kết nối – Bền vững. Chúng tôi đặt niềm tin của cộng đồng lên trên tất cả.
              </p>
            </div>
          </div>

          {/* Team */}
          <div className="glass rounded-3xl p-8">
            <h3 className="font-display font-bold text-xl text-dblue mb-6 text-center">Đội ngũ sáng lập</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full gradient-green flex items-center justify-center text-white font-bold text-xl mb-3">
                  LT
                </div>
                <div className="font-bold text-dblue text-sm">Lê Thanh</div>
                <div className="text-xs text-gray-400">CEO & Co-founder</div>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full gradient-blue flex items-center justify-center text-white font-bold text-xl mb-3">
                  PH
                </div>
                <div className="font-bold text-dblue text-sm">Phạm Hà</div>
                <div className="text-xs text-gray-400">CTO</div>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-ebrown to-amber-500 flex items-center justify-center text-white font-bold text-xl mb-3">
                  NA
                </div>
                <div className="font-bold text-dblue text-sm">Ngọc Anh</div>
                <div className="text-xs text-gray-400">Head of Community</div>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-dblue to-tblue flex items-center justify-center text-white font-bold text-xl mb-3">
                  VD
                </div>
                <div className="font-bold text-dblue text-sm">Văn Đức</div>
                <div className="text-xs text-gray-400">Head of Trust & Safety</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto rounded-3xl gradient-green p-16 text-center text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition duration-500" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 group-hover:scale-125 transition duration-500" />
          
          <h2 className="font-display font-bold text-4xl lg:text-5xl mb-5 relative z-10">
            Sẵn sàng bắt đầu?
          </h2>
          <p className="text-white/90 mb-10 text-lg relative z-10 max-w-2xl mx-auto">
            Tham gia cộng đồng TửTế Fund ngay hôm nay
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Link 
              href="/campaigns"
              className="px-8 py-4 rounded-2xl bg-white text-pgreen font-bold text-base hover:shadow-2xl hover:shadow-white/40 transition-all inline-flex items-center justify-center gap-2"
            >
              Khám phá chiến dịch
            </Link>
            <Link 
              href="/auth/register"
              className="px-8 py-4 rounded-2xl bg-white/20 backdrop-blur text-white font-bold text-base hover:bg-white/30 transition-all inline-flex items-center justify-center gap-2"
            >
              Trở thành Creator
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
