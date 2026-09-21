import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import OwnerEditPanel from "@/components/OwnerEditPanel";
import Link from "next/link";
import { Rocket, ArrowRight } from "lucide-react";
import HeroSection from "@/components/shared/HeroSection";
import StatsSection from "@/components/shared/StatsSection";
import WhyUsSection from "@/components/shared/WhyUsSection";
import ThreeStepsSection from "@/components/shared/ThreeStepsSection";
import TestimonialsSection from "@/components/shared/TestimonialsSection";
import CTASection from "@/components/shared/CTASection";
import { CampaignGrid } from "@/components/campaigns/CampaignGrid";
import { toCampaignListItem } from "@/lib/campaign-helpers";
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
      users: { select: { id: true, name: true, displayName: true, avatar: true, status: true } },
      _count: {
        select: {
          pledges: { where: { status: "SUCCESS" } },
          campaign_followers: true,
        },
      },
    },
    take: 6,
    orderBy: { createdAt: "desc" },
  });
  const featured = campaigns.map(toCampaignListItem);

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

          {featured.length > 0 ? (
            <CampaignGrid projects={featured} />
          ) : (
            <div className="py-24 text-center glass rounded-3xl">
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
