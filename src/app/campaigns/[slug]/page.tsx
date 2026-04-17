import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatVND, formatDate } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PledgeForm from "@/components/campaign/PledgeForm";
import { auth } from "@/lib/auth";
import { 
  Rocket, 
  Users, 
  Calendar, 
  ShieldCheck, 
  MessageSquare, 
  Zap, 
  Info,
  Clock
} from "lucide-react";
import CommentSection from "@/components/campaign/CommentSection";
import UpdateSection from "@/components/campaign/UpdateSection";
import RichTextRenderer from "@/components/shared/RichTextRenderer";
import ImageCarousel from "@/components/campaign/ImageCarousel";

type Params = { params: Promise<{ slug: string }> };

export default async function CampaignDetailPage({ params }: Params) {
  const { slug } = await params;
  const session = await auth();

  const campaign = await prisma.campaign.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
    include: {
      creator: { select: { id: true, name: true, avatar: true, isPro: true } },
      rewards: { orderBy: { amount: "asc" } },
      pledges: {
        where: { status: "SUCCESS" },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { user: { select: { name: true, avatar: true } } }
      },
      _count: {
        select: { pledges: { where: { status: "SUCCESS" } } },
      },
    },
  });

  if (!campaign) {
    return notFound();
  }

  const isCreator = session?.user && (session.user as any).id === campaign.creatorId;
  const percentRaised = Math.round((Number(campaign.currentAmount) / Number(campaign.goalAmount)) * 100);
  const daysLeft = campaign.endDate ? Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : "Vô thời hạn";

  // Prepare images array: use images field if available, fallback to imageUrl
  const campaignImages = campaign.images && campaign.images.length > 0 
    ? campaign.images 
    : campaign.imageUrl 
      ? [campaign.imageUrl] 
      : [];

  return (
    <div className="min-h-screen bg-slate-50/30 pb-24">
      {/* Header Banner - Premium Looking */}
      <div className="bg-white border-b border-gray-100 pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-8 animate-fade-in-up">
           <div className="inline-flex items-center gap-2 px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
              Dự án nổi bật • {campaign.category}
           </div>
           <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-none max-w-4xl">
              {campaign.title}
           </h1>
           <p className="text-xl text-gray-500 font-medium max-w-2xl leading-relaxed">
              {campaign.description}
           </p>
           
           {/* Campaign Code */}
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-mono border border-gray-200">
              <span className="font-black text-gray-400">ID:</span>
              <span className="font-bold">{campaign.campaignCode}</span>
           </div>
           
           <div className="flex items-center gap-4 pt-4">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 font-black text-lg border border-gray-200 shadow-sm">
                 {campaign.creator?.name?.slice(0,1) || "C"}
              </div>
              <div className="text-left">
                 <div className="text-sm font-black text-gray-900 uppercase tracking-tight">
                    {campaign.creator?.name} {campaign.creator?.isPro && <Zap size={10} className="inline text-emerald-500 fill-emerald-500" />}
                 </div>
                 <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chiến dịch chính chủ</div>
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-16 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-16">
            <ImageCarousel images={campaignImages} alt={campaign.title} />

            {/* Content Sections with Modern Styling */}
            <div className="space-y-24">
               {/* 1. Project Description */}
               <section id="about" className="space-y-8">
                  <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                     <Info className="text-blue-600" size={32} />
                     <h2 className="text-3xl font-black text-gray-900 tracking-tight">Chi tiết dự án</h2>
                  </div>
                  <RichTextRenderer content={campaign.longDescription || campaign.description} />
               </section>

               {/* 2. Updates Section */}
               <section id="updates" className="space-y-8">
                  <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                     <Zap className="text-emerald-500" size={32} />
                     <h2 className="text-3xl font-black text-gray-900 tracking-tight">Cập nhật tin tức</h2>
                  </div>
                  <UpdateSection campaignId={campaign.id} slug={slug} isCreator={!!isCreator} />
               </section>

               {/* 3. Comment Section */}
               <section id="comments" className="space-y-8">
                  <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                     <MessageSquare className="text-blue-600" size={32} />
                     <h2 className="text-3xl font-black text-gray-900 tracking-tight">Thảo luận cộng đồng</h2>
                  </div>
                  <CommentSection campaignId={campaign.id} slug={slug} />
               </section>
            </div>
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:sticky lg:top-32 h-fit space-y-8">
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-premium space-y-8">
                <div className="space-y-2">
                  <div className="text-4xl font-black text-gray-900 tracking-tighter">{formatVND(campaign.currentAmount)}</div>
                  <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] ml-1">đã đạt được mục tiêu {formatVND(campaign.goalAmount)}</div>
                </div>

                <div className="space-y-4">
                   <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden shadow-inner">
                      <div 
                        className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(37,99,235,0.4)]" 
                        style={{ width: `${percentRaised}%` }}
                      />
                   </div>
                   <div className="flex justify-between text-xs font-black text-gray-900 uppercase tracking-widest">
                      <span>{percentRaised}% hoàn thành</span>
                      <span>{(campaign as any)._count?.pledges || 0} Backers</span>
                   </div>
                </div>
                
                <div className="flex items-center gap-2 p-6 bg-slate-50 rounded-[1.8rem] border border-slate-100 group">
                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-soft group-hover:rotate-12 transition-transform">
                      <Clock size={24} />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-lg font-black text-gray-900 leading-none">{daysLeft}</span>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Ngày còn lại</span>
                   </div>
                </div>

                <div className="pt-2">
                   <PledgeForm campaignId={campaign.id} />
                </div>

                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                   <ShieldCheck className="text-emerald-500" size={20} />
                   <span className="text-[10px] font-black text-emerald-800 uppercase tracking-tighter">Cam kết minh bạch và an toàn giao dịch</span>
                </div>
            </div>

            {/* Rewards Section */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-4">
                 <Rocket size={14} className="text-blue-600" /> Cột mốc phần thưởng
              </h3>
              <div className="space-y-6">
                {(campaign as any).rewards?.map((reward: any) => (
                  <div key={reward.id} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-soft hover:shadow-premium hover:-translate-y-1 transition-all group">
                    <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Hỗ trợ từ {formatVND(reward.amount)}</div>
                    <div className="text-lg font-black text-gray-900 mb-2 truncate group-hover:text-blue-600 transition">{reward.title}</div>
                    <p className="text-gray-400 text-[11px] font-medium leading-relaxed line-clamp-2">{reward.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
