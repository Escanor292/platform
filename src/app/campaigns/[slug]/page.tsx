import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatVND, formatDate } from "@/lib/utils";
import CampaignGrowthProgress from "@/components/campaign/CampaignGrowthProgress";
import { auth } from "@/lib/auth";
import { Zap, Clock, ShieldCheck, Tag, Layers } from "lucide-react";
import ImageCarousel from "@/components/campaign/ImageCarousel";
import CreatorLink from "@/components/campaign/CreatorLink";
import CampaignTabsWrapper from "@/components/campaign/CampaignTabsWrapper";
import CampaignHeader from "@/components/campaign/CampaignHeader";
import CampaignActions from "@/components/campaign/CampaignActions";
import FavoriteCount from "@/components/campaign/FavoriteCount";
import CampaignPageClient from "./CampaignPageClient";
import { CampaignProvider } from "@/contexts/CampaignContext";
import { getCampaignTypeLabel } from "@/lib/project-helpers";

type Params = { params: Promise<{ slug: string }> };

export default async function CampaignDetailPage({ params }: Params) {
   const { slug } = await params;
   const session = await auth();

   const campaign = await prisma.campaign.findFirst({
      where: { OR: [{ slug }, { id: slug }] },
      include: {
         creator: { select: { id: true, name: true, avatar: true, status: true } },
         rewards: { orderBy: { minAmount: "asc" } },
         pledges: {
            where: { status: "SUCCESS" },
            orderBy: { createdAt: "desc" },
            take: 5,
            include: { user: { select: { id: true, name: true, avatar: true } } }
         },
         _count: {
            select: {
               pledges: { where: { status: "SUCCESS" } },
               followers: true
            },
         },
      },
   });

   if (!campaign) {
      return notFound();
   }

   const isCreator = session?.user && (session.user as any).id === campaign.creatorId;
   const percentRaised = Math.round((Number(campaign.currentAmount) / Number(campaign.goalAmount)) * 100);
   const daysLeft = campaign.endDate ? Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : "Vô thời hạn";

   const campaignImages = campaign.images && campaign.images.length > 0
      ? campaign.images
      : campaign.imageUrl
         ? [campaign.imageUrl]
         : [];

   // Serialize campaign data for client component
   const serializedCampaign = {
      ...campaign,
      goalAmount: Number(campaign.goalAmount),
      currentAmount: Number(campaign.currentAmount),
      feeRate: Number(campaign.feeRate),
      createdAt: campaign.createdAt.toISOString(),
      updatedAt: campaign.updatedAt.toISOString(),
      startDate: campaign.startDate?.toISOString() || null,
      endDate: campaign.endDate?.toISOString() || null,
      rewards: campaign.rewards?.map(reward => ({
         ...reward,
         minAmount: Number(reward.minAmount),
         createdAt: reward.createdAt.toISOString(),
         updatedAt: reward.updatedAt.toISOString(),
      })),
      pledges: campaign.pledges?.map(pledge => ({
         ...pledge,
         amount: Number(pledge.amount),
         tipAmount: Number(pledge.tipAmount),
         platformFee: Number(pledge.platformFee),
         vatAmount: Number(pledge.vatAmount),
         totalAmount: Number(pledge.totalAmount),
         createdAt: pledge.createdAt.toISOString(),
         updatedAt: pledge.updatedAt.toISOString(),
         refundedAt: pledge.refundedAt?.toISOString() || null,
      })),
   };

   return (
      <CampaignProvider>
         <div className="min-h-screen bg-gray-50">
            {/* Header with breadcrumb */}
            <div className="border-b border-gray-200 bg-white pt-20">
               <div className="max-w-7xl mx-auto px-6 py-4">
                  <div className="flex items-center gap-2 text-sm">
                     <span className="text-gray-500">Chiến dịch</span>
                     <span className="text-gray-300">•</span>
                     <span className="text-gray-900 font-semibold">{campaign.category}</span>
                  </div>
               </div>
            </div>

             {/* Main Content - Single Card */}
             <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm p-8">
                   {/* Title & Campaign Code - Now Full Width */}
                   <CampaignHeader
                      title={campaign.title}
                      description={campaign.description}
                      campaignCode={campaign.campaignCode}
                   />

                   <div className="mt-8">
                      {/* Top Section - 2 Columns (Media & Progress) */}
                      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">

                         {/* Main Content - Media & Tags */}
                         <div>
                            {/* Media */}
                        <div className="mb-6">
                           <div className="aspect-video w-full overflow-hidden rounded-lg border border-gray-200">
                              <ImageCarousel images={campaignImages} alt={campaign.title} />
                           </div>
                        </div>

                        {/* Creator Info & Tags Block */}
                        <div className="py-6 border-t border-gray-100 space-y-5">
                           <div className="space-y-3">
                              {/* Main Classification Badges */}
                              <div className="flex flex-wrap gap-2">
                                 <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 shadow-sm">
                                    <Tag size={12} />
                                    {campaign.category}
                                 </span>
                                 <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${campaign.type === 'REWARD'
                                       ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                       : 'bg-orange-50 text-orange-600 border-orange-100'
                                    }`}>
                                    <Layers size={12} />
                                    {getCampaignTypeLabel(campaign.type as any)}
                                 </span>
                              </div>

                              {/* Secondary Tags */}
                              {campaign.tags && campaign.tags.length > 0 && (
                                 <div className="flex flex-wrap gap-2">
                                    {campaign.tags.map((tag: string, index: number) => (
                                       <span key={index} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-500 rounded-md border border-gray-100 text-[11px] font-semibold hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer">
                                          <span className="text-gray-400 font-bold">#</span>
                                          {tag}
                                       </span>
                                    ))}
                                 </div>
                              )}
                           </div>

                           <div className="flex items-center gap-4 pt-1">
                              <div className="flex items-center gap-2">
                                 <span className="text-xs text-gray-500 font-semibold">By</span>
                                 <CreatorLink
                                    creatorId={campaign.creator?.id || ""}
                                    creatorName={campaign.creator?.name || "Anonymous"}
                                    creatorAvatar={campaign.creator?.avatar}
                                 />
                              </div>

                              {campaign.creator?.status === "PRO" && (
                                 <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
                                    <Zap size={12} className="fill-emerald-500 text-emerald-500" />
                                    <span className="text-[10px] font-black uppercase tracking-wider">Pro Creator</span>
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>

                     {/* Sidebar - Funding Info (Sticky) */}
                     <div>
                        <div className="lg:sticky lg:top-24 space-y-6">
                           {/* Funding Stats */}
                           <CampaignGrowthProgress
                              currentAmount={Number(campaign.currentAmount)}
                              goalAmount={Number(campaign.goalAmount)}
                              showTree={true}
                              showAnimatedHead={true}
                              size="lg"
                              variant="default"
                           />

                           {/* Backers & Days */}
                           <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center gap-3 text-gray-600">
                                 <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                 </svg>
                                 <div>
                                    <div className="text-2xl font-bold text-gray-900">{campaign._count.pledges.toLocaleString()}</div>
                                    <div className="text-sm text-gray-500">người ủng hộ</div>
                                 </div>
                              </div>

                              <FavoriteCount
                                 campaignId={campaign.id}
                                 campaignSlug={campaign.slug}
                              />

                              <div className="flex items-center gap-3 text-gray-600 col-span-2">
                                 <Clock className="w-5 h-5 text-gray-400" />
                                 <div>
                                    <div className="text-2xl font-bold text-gray-900">
                                       {typeof daysLeft === "number" ? daysLeft : daysLeft}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                       {typeof daysLeft === "number" ? "ngày còn lại" : ""}
                                    </div>
                                 </div>
                              </div>
                           </div>



                           {/* Support Button & Payment Section */}
                           <CampaignPageClient
                              campaignId={campaign.id}
                              campaignSlug={slug}
                              campaignTitle={campaign.title}
                              rewards={serializedCampaign.rewards || []}
                              creatorId={campaign.creatorId}
                              creatorName={campaign.creator.name}
                              campaignStatus={campaign.status}
                           />

                           {/* All or Nothing Notice */}
                           {campaign.endDate && (
                              <div className="text-xs text-gray-500 pt-4 border-t border-gray-200 leading-relaxed">
                                 <span className="font-semibold">All or nothing.</span> This project will only be funded if it reaches its goal by {formatDate(campaign.endDate)}.
                              </div>
                           )}

                           {/* Social Share */}
                           <CampaignActions
                              campaignTitle={campaign.title}
                              campaignSlug={slug}
                              campaignId={campaign.id}
                           />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Campaign Stats Summary - REMOVED */}

                  {/* Tabs Content - Full Width */}
                  <div className="border-t border-gray-100 pt-6">
                     <CampaignTabsWrapper
                        campaign={serializedCampaign}
                        isCreator={!!isCreator}
                        slug={slug}
                        daysLeft={daysLeft}
                        percentRaised={percentRaised}
                     />
                  </div>
               </div>
            </div>
         </div>
      </CampaignProvider>
   );
}
