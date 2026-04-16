import prisma from "@/lib/prisma";
import { formatVND } from "@/lib/utils";
import Link from "next/link";
import { Zap, Sparkles, Rocket, ArrowRight } from "lucide-react";
import HeroSection from "@/components/shared/HeroSection";
import StatsSection from "@/components/shared/StatsSection";
import WhyUsSection from "@/components/shared/WhyUsSection";
import ThreeStepsSection from "@/components/shared/ThreeStepsSection";
import TestimonialsSection from "@/components/shared/TestimonialsSection";
import CreatorLink from "@/components/campaign/CreatorLink";

export default async function HomeNew() {
  const campaigns = await prisma.campaign.findMany({
    where: { status: "ACTIVE" },
    include: {
      creator: { select: { id: true, name: true, avatar: true, isPro: true } },
    },
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <StatsSection />

      {/* Why Us Section */}
      <WhyUsSection />

      {/* Featured Campaigns */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-display font-bold text-3xl lg:text-4xl text-dblue mb-2">
                Chiến dịch nổi bật
              </h2>
              <p className="text-gray-500">Những câu chuyện đang chờ sự đồng hành của bạn</p>
            </div>
            <Link 
              href="/campaigns"
              className="hidden md:flex text-pgreen font-bold text-sm hover:underline items-center gap-2 group"
            >
              Xem tất cả
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns.length > 0 ? (
              campaigns.map((campaign: any) => {
                const progress = Math.min(100, Math.round((Number(campaign.currentAmount) / Number(campaign.goalAmount)) * 100));
                const daysLeft = campaign.endDate 
                  ? Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                  : null;

                return (
                  <Link 
                    key={campaign.id}
                    href={`/campaigns/${campaign.slug}`}
                    className="rounded-3xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer bg-white group"
                  >
                    {campaign.imageUrl && (
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={campaign.imageUrl} 
                          alt={campaign.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1.5 bg-white/90 backdrop-blur text-xs font-bold text-gray-900 uppercase tracking-wider rounded-lg border border-white/20">
                            {campaign.category || "Cộng đồng"}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="p-6">
                      <h3 className="font-display font-bold text-dblue text-lg mb-2 line-clamp-2 group-hover:text-pgreen transition">
                        {campaign.title}
                      </h3>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                        {campaign.description}
                      </p>

                      <div className="space-y-3">
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className="progress-bar h-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-bold text-pgreen">
                            {formatVND(Number(campaign.currentAmount))}
                          </span>
                          <span className="text-gray-400">
                            {progress}% đạt được
                          </span>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                          <CreatorLink 
                            creatorId={campaign.creator?.id || ""}
                            creatorName={campaign.creator?.name || "Anonymous"}
                            creatorAvatar={campaign.creator?.avatar}
                          />
                          {daysLeft !== null && (
                            <span className="text-xs text-gray-400">
                              {daysLeft > 0 ? `${daysLeft} ngày` : "Kết thúc"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="col-span-full py-24 text-center glass rounded-3xl">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Rocket className="text-gray-300" size={32} />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Đang chờ dự án mới...</h3>
                <p className="text-gray-400 text-sm font-medium">
                  Hiện tại không có dự án nào đang hoạt động. Hãy là người đầu tiên!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3 Steps Section */}
      <ThreeStepsSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto rounded-3xl gradient-green p-16 text-center text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition duration-500" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 group-hover:scale-125 transition duration-500" />
          
          <h2 className="font-display font-bold text-4xl lg:text-5xl mb-5 relative z-10">
            Sẵn sàng gieo mầm tử tế?
          </h2>
          <p className="text-white/90 mb-10 text-lg relative z-10 max-w-2xl mx-auto">
            Bắt đầu câu chuyện gây quỹ của bạn ngay hôm nay. Cộng đồng đang chờ đợi
          </p>
          <Link 
            href="/campaigns/create"
            className="px-10 py-4 rounded-2xl bg-white text-pgreen font-bold text-base hover:shadow-2xl hover:shadow-white/40 transition-all relative z-10 inline-flex items-center gap-2 group/btn"
          >
            <span>Tạo chiến dịch ngay</span>
            <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition" />
          </Link>
        </div>
      </section>
    </main>
  );
}
