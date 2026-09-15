import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import OwnerEditPanel from "@/components/OwnerEditPanel";
import { extractTextFromDescription } from "@/lib/utils";
import Link from "next/link";
import { Rocket, ArrowRight } from "lucide-react";
import HeroSection from "@/components/shared/HeroSection";
import StatsSection from "@/components/shared/StatsSection";
import WhyUsSection from "@/components/shared/WhyUsSection";
import ThreeStepsSection from "@/components/shared/ThreeStepsSection";
import TestimonialsSection from "@/components/shared/TestimonialsSection";
import CTASection from "@/components/shared/CTASection";
import CreatorLink from "@/components/campaign/CreatorLink";
import CampaignGrowthProgress from "@/components/campaign/CampaignGrowthProgress";
import T from "@/i18n/T";

import { buildSocialMetadata } from "@/lib/seo";

export const metadata = buildSocialMetadata({
  title: "Tử Tế Fund - Lấy sự tử tế trồng tương lai",
  description:
    "Lấy sự tử tế trồng tương lai. Nền tảng gây quỹ cộng đồng minh bạch tại Việt Nam. Kết nối yêu thương, gieo mầm hy vọng.",
  path: "/",
});

export default async function Home() {
  const session = await auth();
  const currentUser = session?.user?.email
    ? await prisma.users.findUnique({ where: { email: session.user.email }, select: { id: true } })
    : null;

  const campaigns = await prisma.campaigns.findMany({
    where: { status: "ACTIVE" },
    include: {
      users: { select: { id: true, name: true, avatar: true, status: true } },
    },
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <StatsSection />
      <WhyUsSection />

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-12">
            <div>
              <h2 className="font-display font-bold text-3xl lg:text-4xl text-dblue mb-2">
                <T k="home.featured" />
              </h2>
              <p className="text-gray-500"><T k="home.featuredSub" /></p>
            </div>
            <Link
              href="/campaigns"
              className="flex shrink-0 items-center gap-2 text-sm font-bold text-pgreen hover:underline group"
            >
              <T k="home.seeAll" />
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns.length > 0 ? (
              campaigns.map((campaign: any) => {
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
                            {campaign.category || <T k="home.community" />}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="p-6">
                      <h3 className="font-display font-bold text-dblue text-lg mb-2 line-clamp-2 group-hover:text-pgreen transition">
                        {campaign.title}
                      </h3>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                        {extractTextFromDescription(campaign.description)}
                      </p>

                      <div className="space-y-3">
                        <CampaignGrowthProgress
                          currentAmount={Number(campaign.currentAmount)}
                          goalAmount={Number(campaign.goalAmount)}
                          variant="compact"
                          size="sm"
                          showTree={false}
                        />

                        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                          <CreatorLink
                            creatorId={campaign.creator?.id || ""}
                            creatorName={campaign.creator?.name || "Anonymous"}
                            creatorAvatar={campaign.creator?.avatar}
                          />
                          {daysLeft !== null && (
                            <span className="text-xs text-gray-400">
                              {daysLeft > 0 ? <T k="home.daysLeft" vars={{ n: daysLeft }} /> : <T k="home.ended" />}
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
                <h3 className="text-xl font-black text-gray-900 mb-2"><T k="home.emptyTitle" /></h3>
                <p className="text-gray-400 text-sm font-medium">
                  <T k="home.emptySub" />
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <ThreeStepsSection />
      <TestimonialsSection />
      <CTASection />

      {currentUser && (
        <OwnerEditPanel
          isOwner={true}
          blocks={[
            {
              label: "Tùy chỉnh trang cá nhân",
              editUrl: `/profile/${currentUser.id}/customize`,
              description: "Preset, màu sắc, section, kéo-thả và preview",
            },
            {
              label: "Chỉnh sửa thông tin hồ sơ",
              editUrl: `/profile/${currentUser.id}/edit`,
              description: "Ảnh đại diện, giới thiệu, liên kết và privacy",
            },
          ]}
        />
      )}
    </main>
  );
}
