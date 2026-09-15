import Link from "next/link";
import prisma from "@/lib/prisma";
import { extractTextFromDescription } from "@/lib/utils";
import { Search, Rocket } from "lucide-react";
import CampaignGrowthProgress from "@/components/campaign/CampaignGrowthProgress";
import CreatorLink from "@/components/campaign/CreatorLink";
import { Tag, Layers } from "lucide-react";
import { buildSocialMetadata } from "@/lib/seo";
import T from "@/i18n/T";
import CatalogLabel from "@/i18n/CatalogLabel";

export const metadata = buildSocialMetadata({
  title: "Khám phá chiến dịch",
  description: "Các chiến dịch gây quỹ đang mở trên Tử Tế Fund. Ủng hộ ý tưởng, hoàn cảnh và sản phẩm tử tế.",
  path: "/campaigns",
});

export default async function CampaignsPage() {
  const campaigns = await prisma.campaigns.findMany({
    where: { status: "ACTIVE" },
    include: {
      users: { select: { name: true, avatar: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-white/90 backdrop-blur text-[9px] font-black uppercase tracking-wider rounded-lg border border-white/20 text-blue-600 flex items-center gap-1">
                          <Tag size={10} />
                          <CatalogLabel kind="category" value={campaign.category} />
                        </span>
                        <span className={`px-2 py-1 bg-white/90 backdrop-blur text-[9px] font-black uppercase tracking-wider rounded-lg border border-white/20 flex items-center gap-1 ${campaign.type === 'REWARD' ? 'text-emerald-600' : 'text-orange-600'}`}>
                          <Layers size={10} />
                          <CatalogLabel kind="type" value={campaign.type} />
                        </span>
                        <span className="px-2 py-1 bg-white/90 backdrop-blur text-[9px] font-black uppercase tracking-wider rounded-lg border border-white/20 text-gray-600">
                          <CatalogLabel kind="funding" value={campaign.fundingModel} />
                        </span>
                        {campaign.isFeatured && (
                          <span className="px-2 py-1 bg-amber-100/95 backdrop-blur text-[9px] font-black uppercase tracking-wider rounded-lg border border-amber-200 text-amber-800">
                            <T k="catalog.featured" />
                          </span>
                        )}
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
    </div>
  );
}
