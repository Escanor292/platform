import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatVND } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Rocket, Users, Target, Activity, Zap } from "lucide-react";
import { CreatorCampaignCard } from "@/components/dashboard/CreatorCampaignCard";

export default async function CreatorDashboard() {
   const session = await auth();
   if (!session?.user) redirect("/auth/login");

   const campaigns = await prisma.campaign.findMany({
      where: { creatorId: (session.user as any).id },
      include: { _count: { select: { pledges: true } } },
      orderBy: { createdAt: "desc" },
   });

   const totalRaised = campaigns.reduce((acc, c) => acc + Number(c.currentAmount), 0);
   const totalBackers = campaigns.reduce((acc, c) => acc + c._count.pledges, 0);

   return (
      <div className="min-h-screen bg-slate-50/50 py-24 px-6 mt-10">
         <div className="max-w-7xl mx-auto space-y-12">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 animate-fade-in-up">
               <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                     <Zap size={12} fill="currentColor" /> Chế độ Creator Pro
                  </div>
                  <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none">Dự án của tôi</h1>
                  <p className="text-lg text-gray-400 font-medium">Theo dõi và quản lý hành trình sáng tạo của bạn.</p>
               </div>

               <Link href="/campaigns/create" className="h-20 px-10 bg-blue-600 text-white font-black rounded-3xl hover:bg-black transition flex items-center gap-3 shadow-xl active:scale-95">
                  <Plus size={24} />
                  Bắt đầu dự án mới
               </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-soft flex items-center gap-6 group hover:translate-y-[-4px] transition-all">
                  <div className="w-16 h-16 bg-blue-50 rounded-[1.8rem] flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                     <Target size={32} />
                  </div>
                  <div>
                     <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tổng huy động</div>
                     <div className="text-2xl font-black text-gray-900">{formatVND(totalRaised)}</div>
                  </div>
               </div>

               <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-soft flex items-center gap-6 group hover:translate-y-[-4px] transition-all">
                  <div className="w-16 h-16 bg-emerald-50 rounded-[1.8rem] flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-500">
                     <Users size={32} />
                  </div>
                  <div>
                     <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Người ủng hộ</div>
                     <div className="text-2xl font-black text-gray-900">{totalBackers} Backers</div>
                  </div>
               </div>

               <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-soft flex items-center gap-6 group hover:translate-y-[-4px] transition-all">
                  <div className="w-16 h-16 bg-orange-50 rounded-[1.8rem] flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-500">
                     <Activity size={32} />
                  </div>
                  <div>
                     <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Dự án đang chạy</div>
                     <div className="text-2xl font-black text-gray-900">{campaigns.filter(c => c.status === "ACTIVE").length} / {campaigns.length}</div>
                  </div>
               </div>
            </div>

            {/* Campaigns Grid */}
            <div className="space-y-10">
               <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b pb-4">Danh sách dự án ({campaigns.length})</h2>

               {campaigns.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                     {campaigns.map((campaign: any) => (
                        <CreatorCampaignCard
                           key={campaign.id}
                           campaign={{
                              id: campaign.id,
                              slug: campaign.slug,
                              title: campaign.title,
                              description: campaign.description,
                              campaignCode: campaign.campaignCode,
                              imageUrl: campaign.imageUrl,
                              status: campaign.status,
                              currentAmount: Number(campaign.currentAmount),
                              goalAmount: Number(campaign.goalAmount),
                              endDate: campaign.endDate,
                              _count: campaign._count,
                           }}
                        />
                     ))}
                  </div>
               ) : (
                  <div className="py-32 text-center glass-morphism rounded-[3rem]">
                     <Rocket className="mx-auto text-gray-200 mb-6" size={64} />
                     <h3 className="text-2xl font-black text-gray-900 mb-2">Thế giới đang chờ đợi ý tưởng của bạn</h3>
                     <p className="text-gray-400 font-medium mb-10 max-w-sm mx-auto">Chưa có dự án nào được khởi tạo. Hãy cùng nhau bắt đầu hành trình thay đổi thế giới ngay!</p>
                     <Link href="/campaigns/create" className="h-16 px-12 bg-blue-600 text-white font-black rounded-2xl hover:bg-black transition inline-flex items-center gap-2 shadow-xl active:scale-95">
                        <Plus size={20} />
                        Bắt đầu ngay
                     </Link>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}
