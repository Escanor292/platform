import Link from "next/link";
import prisma from "@/lib/prisma";
import { Search, Rocket } from "lucide-react";
import { buildSocialMetadata } from "@/lib/seo";
import T from "@/i18n/T";
import { CampaignGrid } from "@/components/campaigns/CampaignGrid";
import { toCampaignListItem } from "@/lib/campaign-helpers";
import { NOT_TEST_FIXTURE } from "@/lib/moderation/policy";

export const metadata = buildSocialMetadata({
  title: "Khám phá chiến dịch",
  description: "Các chiến dịch gây quỹ đang mở trên Tử Tế Fund. Ủng hộ ý tưởng, hoàn cảnh và sản phẩm tử tế.",
  path: "/campaigns",
});

export default async function CampaignsPage() {
  const campaigns = await prisma.campaigns.findMany({
    where: { status: "ACTIVE", ...NOT_TEST_FIXTURE },
    include: {
      users: { select: { name: true, displayName: true, avatar: true, status: true } },
      _count: {
        select: {
          pledges: { where: { status: "SUCCESS" } },
          campaign_followers: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  const items = campaigns.map(toCampaignListItem);

  return (
    <div className="min-h-screen bg-white">
      <section className="page-canvas pt-32 pb-16 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div
            className="absolute top-10 left-[5%] w-96 h-96 bg-gradient-to-br from-fgreen/20 via-fgreen/8 to-transparent rounded-full blur-3xl opacity-70"
            style={{ animation: 'pulse 8s ease-in-out infinite' }}
          />
          <div
            className="absolute top-32 right-[8%] w-80 h-80 bg-gradient-to-tl from-tblue/15 via-transparent to-transparent rounded-full blur-3xl opacity-60"
            style={{ animation: 'pulse 10s ease-in-out 2s infinite' }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h1 className="font-display font-black text-5xl lg:text-6xl text-dblue mb-4" style={{ lineHeight: '1.3' }}>
              <T k="catalog.exploreTitle1" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-pgreen via-fgreen to-tblue"><T k="catalog.ideasTitle2" /></span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              <T k="catalog.ideasSub" />
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-4">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pgreen transition" size={24} />
              <input
                type="text"
                placeholder=""
                className="w-full h-16 pl-16 pr-8 glass border border-white/70 rounded-2xl focus:ring-2 focus:ring-pgreen focus:border-transparent font-medium text-gray-900 placeholder:text-gray-400 transition-all shadow-soft"
                aria-label="search"
              />
            </div>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/campaigns" className="px-5 py-2 gradient-green text-white text-xs font-bold uppercase tracking-wider rounded-full whitespace-nowrap shadow-md hover:shadow-lg transition"><T k="catalog.all" /></Link>
              <Link href="/campaigns?category=Công nghệ" className="px-5 py-2 glass border border-white/70 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-full hover:border-pgreen hover:text-pgreen transition whitespace-nowrap"><T k="cat.tech" /></Link>
              <Link href="/campaigns?category=Môi trường" className="px-5 py-2 glass border border-white/70 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-full hover:border-pgreen hover:text-pgreen transition whitespace-nowrap"><T k="cat.env" /></Link>
              <Link href="/campaigns?category=Giáo dục" className="px-5 py-2 glass border border-white/70 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-full hover:border-pgreen hover:text-pgreen transition whitespace-nowrap"><T k="cat.edu" /></Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto py-16 px-6">
          {items.length > 0 ? (
            <CampaignGrid projects={items} />
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
    </div>
  );
}
