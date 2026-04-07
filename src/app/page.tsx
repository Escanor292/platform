import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, TrendingUp, Users, Heart } from "lucide-react";

export default async function Home() {
  const campaigns = await prisma.campaign.findMany({
    where: { status: "ACTIVE" },
    take: 6,
    orderBy: { createdAt: "desc" },
    include: { creator: { select: { name: true } } }
  });

  return (
    <div className="flex flex-col w-full">
      {/* Mobile Hero Section */}
      <section className="relative h-[80vh] md:h-[60vh] flex items-end pb-12 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1559027615-cd4451d131e2?auto=format&fit=crop&q=80" 
            className="w-full h-full object-cover brightness-50"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-green-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-4 animate-pulse">
            Đang diễn ra 🔥
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] mb-6">
            Lan tỏa giá trị, <br/>
            <span className="text-green-400">Kết nối</span> ước mơ.
          </h1>
          <p className="text-gray-300 text-sm md:text-lg mb-8 leading-relaxed max-w-md">
            Nền tảng gọi vốn cộng đồng minh bạch dành riêng cho các dự án sáng tạo tại Việt Nam.
          </p>
          <div className="flex gap-3">
            <Link 
              href="/campaigns" 
              className="px-6 py-4 bg-green-600 text-white font-black rounded-2xl flex items-center gap-2 hover:bg-green-700 transition btn-click-scale text-sm shadow-xl shadow-green-900/20"
            >
              Khám phá ngay
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 bg-white border-y border-gray-100 py-6 px-4 md:px-0 max-w-5xl mx-auto w-full -mt-8 relative z-20 rounded-3xl shadow-xl">
        <div className="flex flex-col items-center border-r border-gray-100 text-center">
          <span className="text-xl font-black text-gray-900">50B+</span>
          <span className="text-[10px] text-gray-400 font-bold uppercase">VNĐ đã huy động</span>
        </div>
        <div className="flex flex-col items-center border-r border-gray-100 text-center">
          <span className="text-xl font-black text-gray-900">1.2K+</span>
          <span className="text-[10px] text-gray-400 font-bold uppercase">Dự án thành công</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <span className="text-xl font-black text-gray-900">100K+</span>
          <span className="text-[10px] text-gray-400 font-bold uppercase">Người ủng hộ</span>
        </div>
      </div>

      {/* Campaign List (Horizontal Scroll on Mobile) */}
      <section className="py-12 pl-6 md:px-6">
        <div className="flex justify-between items-center pr-6 mb-8">
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <TrendingUp className="text-green-600" />
            Nổi bật tuần này
          </h2>
          <Link href="/campaigns" className="text-sm font-bold text-green-600 hover:underline">
            Xem tất cả
          </Link>
        </div>

        <div className="flex md:grid md:grid-cols-3 gap-5 overflow-x-auto no-scrollbar md:overflow-visible pb-6 snap-x">
          {campaigns.map((c) => (
            <Link 
              key={c.id} 
              href={`/campaigns/${c.slug}`}
              className="min-w-[280px] md:min-w-0 bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 snap-center group"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={c.imageUrl || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80"} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt={c.title || ""}
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black text-gray-900 uppercase">
                  {c.category || "Sáng tạo"}
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="font-black text-gray-900 text-lg mb-2 line-clamp-1 group-hover:text-green-600 transition">
                  {c.title}
                </h3>
                <p className="text-xs text-gray-400 font-medium mb-4 line-clamp-2 leading-relaxed">
                  {c.tagline}
                </p>
                
                <div className="space-y-3">
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-green-500 h-full rounded-full" 
                      style={{ width: `${Math.min(100, (c.currentAmount / c.goalAmount) * 100)}%` }} 
                    />
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Đã đạt được</div>
                      <div className="text-sm font-black text-gray-900">
                        {new Intl.NumberFormat("vi-VN").format(c.currentAmount)} đ
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Tiến độ</div>
                      <div className="text-sm font-black text-green-600">
                        {Math.floor((c.currentAmount / c.goalAmount) * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-12 mb-10">
        <div className="bg-gray-900 rounded-[2.5rem] p-10 relative overflow-hidden text-center md:text-left md:flex md:items-center md:justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/20 rounded-full blur-[100px]" />
          <div className="relative z-10 max-w-xl">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
              Sẵn sàng để hiện thực hóa ý tưởng?
            </h2>
            <p className="text-gray-400 text-sm md:text-base mb-8">
              Tham gia cộng đồng sáng tạo và bắt đầu chiến dịch gọi vốn của bạn ngay hôm nay. Miễn phí khởi tạo.
            </p>
            <Link 
              href="/campaigns/create" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-green-500 text-white font-black rounded-2xl hover:bg-green-600 transition btn-click-scale shadow-lg shadow-green-500/20"
            >
              <PlusSquare size={20} />
              Tạo chiến dịch
            </Link>
          </div>
          
          <div className="hidden md:flex gap-4 relative z-10">
             <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-green-500"><Users/></div>
             <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-red-500"><Heart/></div>
          </div>
        </div>
      </section>
    </div>
  );
}

function PlusSquare({ size }: { size: number }) {
  return (
    <svg 
      width={size} height={size} viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}
